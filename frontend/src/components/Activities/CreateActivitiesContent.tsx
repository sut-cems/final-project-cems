import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import type { EventCategory } from "../../interfaces/IEventCategories";
import type { Activity } from "../../interfaces/IActivitys";
import {
  fetchActivityCategory,
  fetchActivityStatus,
  createActivity
} from "../../services/http/activities";
import type { ActivityStatus } from "../../interfaces/IActivityStatuses";
import {
  ConfirmModal,
  StatusModal,
} from "../../components/Activities/ConfirmModal";
import { message } from "antd";

interface BodyProps {
  clubId: number | null;

}

const CreateActivitiesContent: React.FC <BodyProps> = (clubId) => {
  const [categoryList, setCategoryList] = useState<EventCategory[]>([]);
  const [statusList, setStatusList] = useState<ActivityStatus[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusType, setStatusType] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [statusMessage, setStatusMessage] = useState<string | undefined>(
    undefined
  );

  const allowedStatusIDs = [1, 2];
  const filteredStatusList = statusList.filter((status) =>
    allowedStatusIDs.includes(status.ID)
  );

  const [activity, setActivity] = useState<Partial<Activity>>({
    Title: "",
    Description: "",
    Location: "",
    DateStart: "",
    DateEnd: "",
    Capacity: 1,
    CategoryID: 0,
    StatusID: 0,
    PosterImage: "",
  });

  const handleInputChange = (field: keyof Activity, value: string | number) => {
    setActivity((prev) => ({
      ...prev,
      [field]: value,
    }));

    // ล้าง error เมื่อผู้ใช้เริ่มพิมพ์
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!activity.Title?.trim()) {
      newErrors.Title = "กรุณากรอกชื่อกิจกรรม";
    } else if (activity.Title.length < 3) {
      newErrors.Title = "ชื่อกิจกรรมต้องมีอย่างน้อย 3 ตัวอักษร";
    }

    if (!activity.Description?.trim()) {
      newErrors.Description = "กรุณากรอกรายละเอียดกิจกรรม";
    } else if (activity.Description.length < 10) {
      newErrors.Description = "รายละเอียดต้องมีอย่างน้อย 10 ตัวอักษร";
    }

    if (!activity.Location?.trim()) {
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

    if (!activity.Capacity || activity.Capacity < 1) {
      newErrors.Capacity = "จำนวนผู้เข้าร่วมต้องมากกว่า 0 คน";
    } else if (activity.Capacity > 10000) {
      newErrors.Capacity = "จำนวนผู้เข้าร่วมต้องไม่เกิน 10,000 คน";
    }

    if (!activity.CategoryID) {
      newErrors.CategoryID = "กรุณาเลือกประเภทกิจกรรม";
    }

    // ตรวจสอบรูปภาพ (บังคับสำหรับการสร้างใหม่)
    if (!uploadedFile) {
      newErrors.PosterImage = "กรุณาอัปโหลดโปสเตอร์กิจกรรม";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setUploadedFile(file);

      // ล้าง error ของรูปภาพ
      if (errors.PosterImage) {
        setErrors((prev) => ({
          ...prev,
          PosterImage: "",
        }));
      }
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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // ตรวจสอบวันที่ให้แน่ใจว่าไม่เป็น null/undefined
    if (!activity.DateStart || !activity.DateEnd) {
      message.error("กรุณาระบุวันที่เริ่มและสิ้นสุดกิจกรรม");
      return;
    }

    // ตรวจสอบว่ามี uploadedFile
    if (!uploadedFile) {
      message.error("กรุณาอัปโหลดโปสเตอร์กิจกรรม");
      return;
    }

    setIsLoading(true);
    setConfirmOpen(false); // ปิด confirm modal
    setStatusType("loading");
    setStatusMessage("กำลังสร้างกิจกรรม...");
    setStatusOpen(true);

    try {
      const formData = new FormData();
      formData.append("title", activity.Title!);
      formData.append("description", activity.Description!);
      formData.append("location", activity.Location!);
      formData.append("date_start", new Date(activity.DateStart).toISOString());
      formData.append("date_end", new Date(activity.DateEnd).toISOString());
      formData.append("capacity", activity.Capacity!.toString());
      formData.append("category_id", activity.CategoryID!.toString());
      formData.append("status_id", activity.StatusID!.toString());
      formData.append("poster_image", uploadedFile);
      formData.append("club_id", clubId.clubId!.toString());

      console.log("clubId: ",clubId)

      await createActivity(formData);

      setStatusType("success");
      setStatusMessage("สร้างกิจกรรมสำเร็จแล้ว!");

      // เปลี่ยนไปหน้ารายละเอียดของกิจกรรมที่สร้างใหม่
      setTimeout(() => {
        setStatusOpen(false);
        navigate(`/activities/management`);
      }, 2000);
    } catch (error: any) {
      console.error("❌ สร้างกิจกรรมล้มเหลว:", error);

      setStatusType("error");
      if (error.response) {
        console.error("🔴 Response:", error.response.data);
        setStatusMessage(
          `เกิดข้อผิดพลาด: ${error.response.data.message || "ไม่ทราบสาเหตุ"}`
        );
      } else {
        setStatusMessage("❌ เกิดข้อผิดพลาดในการสร้างกิจกรรม");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // รีเซ็ตฟอร์ม
  const handleReset = () => {
    setActivity({
      Title: "",
      Description: "",
      Location: "",
      DateStart: "",
      DateEnd: "",
      Capacity: 1,
      CategoryID: 0,
      StatusID: 0,
      PosterImage: "",
    });
    setPreviewImage(null);
    setUploadedFile(null);
    setErrors({});
    setResetConfirmOpen(false);
    message.success("รีเซ็ตฟอร์มสำเร็จ");
  };

  // ตรวจสอบว่ามีข้อมูลในฟอร์มหรือไม่
  const hasFormData = () => {
    return (
      activity.Title ||
      activity.Description ||
      activity.Location ||
      activity.DateStart ||
      activity.DateEnd ||
      (activity.Capacity && activity.Capacity > 1) ||
      activity.CategoryID ||
      activity.StatusID ||
      uploadedFile
    );
  };

  const handleResetClick = () => {
    if (hasFormData()) {
      setResetConfirmOpen(true);
    } else {
      message.info("ไม่มีข้อมูลในฟอร์มที่ต้องรีเซ็ต");
    }
  };

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const res = await fetchActivityCategory();
        setCategoryList(res);
      } catch (err) {
        message.error("ไม่สามารถโหลดประเภทกิจกรรมได้");
      }
    };
    const loadStatus = async () => {
      try {
        const res = await fetchActivityStatus();
        setStatusList(res);
      } catch (err) {
        message.error("ไม่สามารถโหลดสถานะกิจกรรมได้");
      }
    };
    loadStatus();
    loadCategory();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/activities/management")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">กลับ</span>
              </button>
              <div className="h-6 border-l border-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  สร้างกิจกรรมใหม่
                </h1>
                <p className="text-sm text-gray-600">
                  กรอกข้อมูลเพื่อสร้างกิจกรรมใหม่
                </p>
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
                    value={activity.Title || ""}
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
                    value={activity.Description || ""}
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
                        จำนวนตัวอักษร: {activity.Description?.length || 0}
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
                    value={activity.Location || ""}
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
                      value={toDateTimeLocal(activity.DateStart)}
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
                    {activity.DateStart && (
                      <p className="text-gray-600 text-xs mt-1">
                        📅 {formatDateTime(activity.DateStart)}
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
                      value={toDateTimeLocal(activity.DateEnd)}
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
                    {activity.DateEnd && (
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
                      value={activity.Capacity || ""}
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
                      value={activity.CategoryID || ""}
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white">
                <div className="flex items-center gap-3">
                  <Image size={24} />
                  <h2 className="text-lg font-semibold">โปสเตอร์กิจกรรม *</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {previewImage ? (
                  <div className="relative group">
                    <img
                      src={previewImage}
                      alt="Poster Preview"
                      className="w-full aspect-[3/3] object-cover rounded-lg border border-gray-200 group-hover:shadow-lg transition-shadow"
                    />
                    <div className="absolute inset-0 group-hover:bg-black group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setPreviewImage(null);
                            setUploadedFile(null);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
                        >
                          ลบรูป
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-[3/4] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <Image size={48} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500 text-sm">ยังไม่มีโปสเตอร์</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div
                      className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                        errors.PosterImage
                          ? "border-red-300 bg-red-50 text-red-600"
                          : "border-blue-300 bg-blue-50 text-blue-700 hover:border-blue-400 hover:bg-blue-100"
                      }`}
                    >
                      <Upload size={18} />
                      <span className="font-medium">
                        {previewImage ? "เปลี่ยนโปสเตอร์" : "อัปโหลดโปสเตอร์"}
                      </span>
                    </div>
                  </label>
                  {errors.PosterImage && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span>⚠️</span> {errors.PosterImage}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    รองรับไฟล์ JPG, PNG (ขนาดไม่เกิน 5MB)
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white">
                <div className="flex items-center gap-3">
                  <Users size={24} />
                  <h2 className="text-lg font-semibold">สถานะกิจกรรม</h2>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="p-0 space-y-0">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                      <Tag size={16} />
                      สถานะกิจกรรม *
                    </label>
                    <select
                      value={activity?.StatusID}
                      onChange={(e) =>
                        handleInputChange("StatusID", parseInt(e.target.value))
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        errors.StatusID
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <option value="">เลือกสถานะกิจกรรม</option>
                      {filteredStatusList.map((status) => (
                        <option key={status.ID} value={status.ID}>
                          {status.Name}
                        </option>
                      ))}
                    </select>
                    {errors.StatusID && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <span>⚠️</span> {errors.StatusID}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-3">
                <button
                  onClick={() => setConfirmOpen(true)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg hover:shadow-xl cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      <span>กำลังสร้าง...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>สร้างกิจกรรม</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResetClick}
                  disabled={isLoading}
                  className="w-full px-6 py-3 text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors font-medium cursor-pointer disabled:opacity-50"
                >
                  รีเซ็ตฟอร์ม
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/activities")}
                  className="w-full px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSubmit}
        title="ยืนยันการสร้างกิจกรรม"
        message="คุณต้องการสร้างกิจกรรมนี้ใช่หรือไม่?"
        type="info"
        confirmText="สร้าง"
        cancelText="ยกเลิก"
        isLoading={isLoading}
      />

      {/* Reset Confirm Modal */}
      <ConfirmModal
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={handleReset}
        title="ยืนยันการรีเซ็ตฟอร์ม"
        message="คุณต้องการล้างข้อมูลทั้งหมดในฟอร์มใช่หรือไม่? ข้อมูลที่กรอกไว้จะหายไปทั้งหมด"
        type="warning"
        confirmText="รีเซ็ต"
        cancelText="ยกเลิก"
        isLoading={false}
      />

      {/* Status Modal */}
      <StatusModal
        isOpen={statusOpen}
        onClose={() => {
          setStatusOpen(false);
          if (statusType === "success") {
            navigate("/activities");
          }
        }}
        status={statusType}
        message={statusMessage}
        autoClose={statusType === "success"}
        autoCloseDelay={3000}
      />
    </div>
  );
};

export default CreateActivitiesContent;
