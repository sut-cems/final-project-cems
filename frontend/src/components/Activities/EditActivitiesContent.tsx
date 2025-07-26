import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../../services/http";
import {
  Save,
  ArrowLeft,
  Upload,
  Calendar,
  MapPin,
  Users,
  FileText,
  Tag,
  Image,
  Clock,
  ImageOff,
} from "lucide-react";
import type { EventCategory } from "../../interfaces/IEventCategories";
import type { Activity } from "../../interfaces/IActivitys";
import { fetchActivityCategory } from "../../services/http/activities";
import { fetchActivityById } from "../../services/http/activities";
import { message } from "antd";

const EditActivityPage = () => {
  const [categoryList, setCategoryList] = useState<EventCategory[]>([]);
  const [activity, setActivity] = useState<Activity | null>(null);
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(false);

  console.log("activity:", activity);

  const getImageUrl = (path: string): string => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
  };
  console.log("final URL:", getImageUrl(activity?.PosterImage || ""));
  console.log("PosterImage path:", activity?.PosterImage);

  useEffect(() => {
    const loadCategory = async () => {
      setLoading(true);
      try {
        const res = await fetchActivityCategory();
        setCategoryList(res);
      } catch (err) {
        message.error("ไม่สามารถโหลดสถานะกิจกรรมได้");
      } finally {
        setLoading(false);
      }
    };

    const loadActivity = async () => {
      if (!id) return;
      try {
        const res = await fetchActivityById(id);
        setActivity(res);
      } catch (err) {
        message.error("ไม่สามารถโหลดข้อมูลกิจกรรมได้");
      }
    };

    loadActivity();
    loadCategory();
  }, [id]);

  const handleInputChange = (field: keyof Activity, value: string | number) => {
    if (!activity) return;

    setActivity((prev) => ({
      ...prev!,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    if (!activity) return false;
    const newErrors: { [key: string]: string } = {};

    if (!activity.Title.trim()) {
      newErrors.Title = "กรุณากรอกชื่อกิจกรรม";
    } else if (activity.Title.length < 3) {
      newErrors.Title = "ชื่อกิจกรรมต้องมีอย่างน้อย 3 ตัวอักษร";
    }

    if (!activity.Description.trim()) {
      newErrors.Description = "กรุณากรอกรายละเอียดกิจกรรม";
    } else if (activity.Description.length < 10) {
      newErrors.Description = "รายละเอียดต้องมีอย่างน้อย 10 ตัวอักษร";
    }

    if (!activity.Location.trim()) {
      newErrors.Location = "กรุณากรอกสถานที่จัดกิจกรรม";
    }

    if (!activity.DateStart) {
      newErrors.DateStart = "กรุณาเลือกวันเวลาเริ่มกิจกรรม";
    }

    if (!activity.DateEnd) {
      newErrors.DateEnd = "กรุณาเลือกวันเวลาสิ้นสุดกิจกรรม";
    }

    if (
      activity.DateStart &&
      activity.DateEnd &&
      new Date(activity.DateStart) >= new Date(activity.DateEnd)
    ) {
      newErrors.DateEnd = "วันเวลาสิ้นสุดต้องมาหลังวันเวลาเริ่มกิจกรรม";
    }

    if (activity.Capacity < 1) {
      newErrors.Capacity = "จำนวนผู้เข้าร่วมต้องมากกว่า 0 คน";
    } else if (activity.Capacity > 10000) {
      newErrors.Capacity = "จำนวนผู้เข้าร่วมต้องไม่เกิน 10,000 คน";
    }

    if (!activity.CategoryID) {
      newErrors.CategoryID = "กรุณาเลือกประเภทกิจกรรม";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert("✅ บันทึกข้อมูลกิจกรรมเรียบร้อยแล้ว!");
    } catch (error) {
      alert("❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toDateTimeLocal = (dateString?: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);

    const pad = (num: number) => num.toString().padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100">
                <ArrowLeft size={20} />
                <span className="font-medium">กลับ</span>
              </button>
              <div className="h-6 border-l border-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  แก้ไขกิจกรรม
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="flex items-center gap-3">
                  <FileText size={24} />
                  <h2 className="text-lg font-semibold">ข้อมูลพื้นฐาน</h2>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <Tag size={16} />
                    ชื่อกิจกรรม *
                  </label>
                  <input
                    type="text"
                    value={activity?.Title}
                    onChange={(e) => handleInputChange("Title", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      errors.Title
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="ใส่ชื่อกิจกรรมที่น่าสนใจ..."
                  />
                  {errors.Title && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span>⚠️</span> {errors.Title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <FileText size={16} />
                    รายละเอียดกิจกรรม *
                  </label>
                  <textarea
                    value={activity?.Description}
                    onChange={(e) =>
                      handleInputChange("Description", e.target.value)
                    }
                    rows={5}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${
                      errors.Description
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="อธิบายรายละเอียดกิจกรรม วัตถุประสงค์ และสิ่งที่น่าสนใจ..."
                  />
                  <div className="flex justify-between items-center mt-2">
                    {errors.Description ? (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <span>⚠️</span> {errors.Description}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-xs">
                        จำนวนตัวอักษร: {activity?.Description.length}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <MapPin size={16} />
                    สถานที่จัดกิจกรรม *
                  </label>
                  <input
                    type="text"
                    value={activity?.Location}
                    onChange={(e) =>
                      handleInputChange("Location", e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      errors.Location
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="สถานที่จัดกิจกรรม (เช่น ห้องประชุม, สนามกีฬา)"
                  />
                  {errors.Location && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span>⚠️</span> {errors.Location}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white">
                <div className="flex items-center gap-3">
                  <Calendar size={24} />
                  <h2 className="text-lg font-semibold">วันเวลา</h2>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                      <Clock size={16} />
                      วันเวลาเริ่มกิจกรรม *
                    </label>
                    <input
                      type="datetime-local"
                      value={toDateTimeLocal(activity?.DateStart)}
                      onChange={(e) =>
                        handleInputChange("DateStart", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        errors.DateStart
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    />
                    {errors.DateStart && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <span>⚠️</span> {errors.DateStart}
                      </p>
                    )}
                    {activity?.DateStart && (
                      <p className="text-gray-600 text-xs mt-1">
                        📅 {formatDateTime(activity?.DateStart)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                      <Clock size={16} />
                      วันเวลาสิ้นสุดกิจกรรม *
                    </label>
                    <input
                      type="datetime-local"
                      value={toDateTimeLocal(activity?.DateEnd)}
                      onChange={(e) =>
                        handleInputChange("DateEnd", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        errors.DateEnd
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    />
                    {errors.DateEnd && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <span>⚠️</span> {errors.DateEnd}
                      </p>
                    )}
                    {activity?.DateEnd && (
                      <p className="text-gray-600 text-xs mt-1">
                        📅 {formatDateTime(activity.DateEnd)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Capacity and Category */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <div className="flex items-center gap-3">
                  <Users size={24} />
                  <h2 className="text-lg font-semibold">
                    จำนวนผู้เข้าร่วมและหมวดหมู่
                  </h2>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                      <Users size={16} />
                      จำนวนผู้เข้าร่วมสูงสุด *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      value={activity?.Capacity}
                      onChange={(e) =>
                        handleInputChange(
                          "Capacity",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        errors.Capacity
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      placeholder="เช่น 100"
                    />
                    {errors.Capacity && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <span>⚠️</span> {errors.Capacity}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">
                      💡 กำหนดจำนวนผู้เข้าร่วมที่เหมาะสมกับสถานที่และงบประมาณ
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                      <Tag size={16} />
                      ประเภทกิจกรรม *
                    </label>
                    <select
                      value={activity?.CategoryID}
                      onChange={(e) =>
                        handleInputChange(
                          "CategoryID",
                          parseInt(e.target.value)
                        )
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        errors.CategoryID
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <option value="">เลือกประเภทกิจกรรม</option>
                      {categoryList.map((category) => (
                        <option key={category.ID} value={category.ID}>
                          {category.Name}
                        </option>
                      ))}
                    </select>
                    {errors.CategoryID && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <span>⚠️</span> {errors.CategoryID}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Sidebar */}
          <div className="space-y-6">
            {/* Poster Image */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
              <div className="px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white">
                <div className="flex items-center gap-3">
                  <Image size={24} />
                  <h2 className="text-lg font-semibold">โปสเตอร์กิจกรรม</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="relative group">
                  <img
                    src={getImageUrl(activity?.PosterImage || "")}
                    alt="Poster"
                    className="w-full aspect-[3/4] object-cover rounded-lg border border-gray-200 group-hover:shadow-lg transition-shadow"
                  />
                  <div className="absolute inset-0  group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm font-medium">
                        คลิกเพื่อเปลี่ยนรูป
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      //onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-indigo-100 cursor-pointer transition-all">
                      <Upload size={18} className="text-blue-600" />
                      <span className="text-blue-700 font-medium">
                        เปลี่ยนโปสเตอร์
                      </span>
                    </div>
                  </label>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    รองรับไฟล์ JPG, PNG (ขนาดไม่เกิน 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-3">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>บันทึกการแก้ไข</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="w-full px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditActivityPage;
