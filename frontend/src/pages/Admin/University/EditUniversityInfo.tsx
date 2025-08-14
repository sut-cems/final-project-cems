import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getUniversityByID,
  updateUniversity,
} from "../../../services/http/university";
import type {
  University,
  UniversityRequest,
} from "../../../interfaces/IUniversity";
import {
  Upload,
  type GetProp,
  type UploadFile,
  type UploadProps,
  message,
} from "antd";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

export default function EditUniversityPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<University | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<UniversityRequest>({
    name: "",
    address: "",
    phone: "",
    logo: "",
  });

  useEffect(() => {
    if (id) {
      fetchUniversityData();
    } else {
      setError("ไม่พบรหัสมหาวิทยาลัย");
      setFetchLoading(false);
    }
  }, [id]);

  const fetchUniversityData = async () => {
    try {
      setFetchLoading(true);
      const result = await getUniversityByID(id);
      if (result.success && result.data) {
        const university = result.data;
        setOriginalData(university);
        setFormData({
          name: university.Name,
          address: university.Address,
          phone: university.Phone,
          logo: university.Logo || "",
        });

        // Set initial file list if logo exists
        if (university.Logo) {
          setFileList([
            {
              uid: "-1",
              name: "current-logo",
              status: "done",
              url: university.Logo,
            },
          ]);
        }
      } else {
        setError("ไม่พบข้อมูลมหาวิทยาลัย");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      console.error("Error fetching university:", err);
    } finally {
      setFetchLoading(false);
    }
  };

  const beforeUpload = (file: FileType) => {
    const isImage = file.type?.startsWith("image/");
    if (!isImage) {
      message.error("คุณสามารถอัพโหลดได้เฉพาะไฟล์รูปภาพเท่านั้น!");
      return Upload.LIST_IGNORE;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("รูปภาพต้องมีขนาดไม่เกิน 5MB!");
      return Upload.LIST_IGNORE;
    }

    return false; // Prevent automatic upload
  };

  const handleChange: UploadProps["onChange"] = (info) => {
    setFileList(info.fileList);

    // Handle file processing
    if (info.fileList.length > 0) {
      const file = info.fileList[info.fileList.length - 1];
      if (file.originFileObj) {
        // Convert to base64 for preview and storage
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          setFormData((prev) => ({
            ...prev,
            logo: base64String,
          }));
        };
        reader.readAsDataURL(file.originFileObj);
      }
    } else {
      // No files selected, clear logo
      setFormData((prev) => ({
        ...prev,
        logo: "",
      }));
    }
  };

  const onPreview = async (file: UploadFile) => {
    let src = file.url as string;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj as FileType);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  const onRemove = () => {
    setFormData((prev) => ({
      ...prev,
      logo: "",
    }));
    return true;
  };

  const uploadProps: UploadProps = {
    listType: "picture-card",
    fileList,
    onChange: handleChange,
    onPreview,
    onRemove,
    beforeUpload,
    maxCount: 1,
    accept: "image/*",
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("กรุณากรอกชื่อมหาวิทยาลัย");
      return false;
    }
    if (!formData.address.trim()) {
      setError("กรุณากรอกที่อยู่");
      return false;
    }
    if (!formData.phone.trim()) {
      setError("กรุณากรอกเบอร์โทรศัพท์");
      return false;
    }
    return true;
  };

  const hasChanges = (): boolean => {
    if (!originalData) return false;

    return (
      formData.name !== originalData.Name ||
      formData.address !== originalData.Address ||
      formData.phone !== originalData.Phone ||
      formData.logo !== (originalData.Logo || "")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!hasChanges()) {
      setError("ไม่มีการเปลี่ยนแปลงข้อมูล");
      return;
    }

    if (!id || !originalData) {
      setError("ไม่พบข้อมูลมหาวิทยาลัยที่ต้องการแก้ไข");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Start with the current formData logo (which could be empty string if removed)
      let logoData = formData.logo;

      // Only process new file upload if there's actually a new file
      const newFile = fileList.find((file) => file.originFileObj);
      if (newFile && newFile.originFileObj) {
        setUploading(true);
        try {
          // Convert new file to base64
          logoData = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(newFile.originFileObj as File);
          });
        } catch (uploadError) {
          console.error("Error processing image:", uploadError);
          setError("เกิดข้อผิดพลาดในการประมวลผลรูปภาพ");
          return;
        } finally {
          setUploading(false);
        }
      }
      // If no new file and formData.logo is empty string, it means logo was removed
      // logoData will remain as empty string from formData.logo

      const updateData = {
        ...formData,
        logo: logoData, // This will be empty string if logo was removed
      };

      const result = await updateUniversity(updateData, originalData.ID);

      if (result.success) {
        message.success("อัพเดทข้อมูลมหาวิทยาลัยสำเร็จ");
        navigate("/university-info");
      } else {
        setError(result.error || "เกิดข้อผิดพลาดในการอัพเดทข้อมูล");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      console.error("Error updating university:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/university-info");
  };

  const handleReset = () => {
    if (originalData) {
      setFormData({
        name: originalData.Name,
        address: originalData.Address,
        phone: originalData.Phone,
        logo: originalData.Logo || "",
      });

      // Reset file list
      if (originalData.Logo) {
        setFileList([
          {
            uid: "-1",
            name: "current-logo",
            status: "done",
            url: originalData.Logo,
          },
        ]);
      } else {
        setFileList([]);
      }

      setError(null);
    }
  };

  if (fetchLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              แก้ไขข้อมูลมหาวิทยาลัย
            </h1>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!originalData) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              แก้ไขข้อมูลมหาวิทยาลัย
            </h1>
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">
                {error || "ไม่พบข้อมูลมหาวิทยาลัย"}
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-800"
            >
              ← กลับไปหน้าข้อมูลมหาวิทยาลัย
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            แก้ไขข้อมูลมหาวิทยาลัย
          </h1>
          <p className="mt-2 text-gray-600">แก้ไขข้อมูลมหาวิทยาลัยของคุณ</p>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow-sm rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <svg
                    className="w-5 h-5 text-red-400 mr-2 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Changes Indicator */}
            {hasChanges() && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex">
                  <svg
                    className="w-5 h-5 text-yellow-400 mr-2 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <p className="text-yellow-700 text-sm">
                    มีการเปลี่ยนแปลงข้อมูลที่ยังไม่ได้บันทึก
                  </p>
                </div>
              </div>
            )}

            {/* University Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ชื่อมหาวิทยาลัย <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="กรอกชื่อมหาวิทยาลัย"
                required
              />
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ที่อยู่ <span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="กรอกที่อยู่มหาวิทยาลัย"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                เบอร์โทรศัพท์ <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                onKeyPress={(e) => {
                  // Allow only numbers and control keys
                  if (
                    !/[0-9]/.test(e.key) &&
                    ![
                      "Backspace",
                      "Delete",
                      "Tab",
                      "Enter",
                      "ArrowLeft",
                      "ArrowRight",
                    ].includes(e.key)
                  ) {
                    e.preventDefault();
                  }
                }}
                onInput={(e) => {
                  // Ensure phone number starts with 0 and has max 10 digits
                  const target = e.target as HTMLInputElement;
                  let value = target.value.replace(/\D/g, ""); // Remove non-digits

                  if (value.length > 0 && !value.startsWith("0")) {
                    value = "0" + value;
                  }

                  if (value.length > 10) {
                    value = value.slice(0, 10);
                  }

                  target.value = value;
                  setFormData((prev) => ({ ...prev, phone: value }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0xxxxxxxxx"
                minLength={10}
                maxLength={10}
                required
              />
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                โลโก้มหาวิทยาลัย
              </label>
              <Upload {...uploadProps}>
                {fileList.length >= 1 ? null : (
                  <div>
                    <svg
                      className="w-8 h-8 mx-auto mb-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <div className="text-sm text-gray-600">อัพโหลดโลโก้</div>
                  </div>
                )}
              </Upload>
              <p className="mt-1 text-sm text-gray-500">
                อัพโหลดโลโก้มหาวิทยาลัย (ไม่จำเป็น) - รองรับไฟล์ภาพขนาดไม่เกิน
                5MB
              </p>
              {uploading && (
                <p className="mt-1 text-sm text-blue-600">
                  กำลังประมวลผลรูปภาพ...
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleReset}
                disabled={loading || !hasChanges()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                รีเซ็ต
              </button>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading || !hasChanges() || uploading}
                  className="px-6 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-[#640D5F] border-2 border-[#640D5F] hover:bg-[#7d1470] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {(loading || uploading) && (
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  {loading
                    ? "กำลังบันทึก..."
                    : uploading
                    ? "กำลังประมวลผล..."
                    : "บันทึกการเปลี่ยนแปลง"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Last Updated Info */}
        {originalData && (
          <div className="mt-4 text-center text-sm text-gray-500">
            แก้ไขล่าสุด:{" "}
            {new Date(originalData.UpdatedAt).toLocaleString("th-TH")}
          </div>
        )}
      </div>
    </div>
  );
}
