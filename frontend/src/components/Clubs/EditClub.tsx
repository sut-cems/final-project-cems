import { API_BASE_URL } from "../../services/http";
import { useEffect, useRef, useState } from "react";
import {
  GetCategoriesWithClubs,
  GetClubByID,
  UpdateClub,
} from "../../services/http/clubs";
import { useNavigate, useParams } from "react-router-dom";

export default function EditClubForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ------- States -------
  const [clubData, setClubData] = useState<any>(null);
  const [categories, setCategories] = useState<{ label: string; value: number }[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [showUnsavedChanges, setShowUnsavedChanges] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ------- Keep initial snapshot for revert on cancel -------
  const initialDataRef = useRef<any>(null);

  // ------- Logo upload + preview -------
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const showMessage = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    window.setTimeout(() => setToast(null), 3500);
  };

  // ------- Utils -------
  const getImageUrl = (path: string): string => {
    if (!path) return "";
    return path.startsWith("http")
      ? path
      : `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
  };

  // ------- Warn on unload if there are unsaved changes -------
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (showUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [showUnsavedChanges]);

  // ------- Fetch club -------
  useEffect(() => {
    const fetchClub = async () => {
      if (!id) return;
      try {
        const res = await GetClubByID(id);

        const statusId =
          res.status_id ?? res.StatusID ?? res.status?.id ?? res.status?.ID ?? null;
        const isOpen = statusId === 2;

        const categoryId =
          res.category?.ID ?? res.category?.id ?? res.category_id ?? res.CategoryID ?? null;
        const categoryName = res.category?.Name ?? res.category?.name ?? "";

        const prepared = {
          ...res,
          status: { ...(res.status ?? res.Status ?? {}), IsActive: isOpen },
          category: { ID: categoryId, Name: categoryName },
        };

        setClubData(prepared);
        initialDataRef.current = prepared; // snapshot for revert
        setShowUnsavedChanges(false);
      } catch {
        showMessage("error", "โหลดข้อมูลชมรมล้มเหลว");
      } finally {
        setLoading(false);
      }
    };
    fetchClub();
  }, [id]);

  // ------- Fetch categories -------
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await GetCategoriesWithClubs();
        if (res?.data && Array.isArray(res.data)) {
          setCategories(res.data.map((c: any) => ({ label: c.name, value: c.id })));
        }
      } catch {
        showMessage("error", "โหลดหมวดหมู่ไม่สำเร็จ");
      }
    };
    fetchCategories();
  }, []);

  // ------- Logo handlers -------
  const validateFile = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      showMessage("error", "กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      showMessage("error", "ขนาดไฟล์ต้องไม่เกิน 5MB");
      return false;
    }
    return true;
  };

  const setPreviewFromFile = (file: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateFile(file)) return;
    setLogoFile(file);
    setPreviewFromFile(file);
    setShowUnsavedChanges(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!validateFile(file)) return;
    setLogoFile(file);
    setPreviewFromFile(file);
    setShowUnsavedChanges(true);
  };

  const handleRemoveLogo = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setLogoFile(null);
    setShowUnsavedChanges(true);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // ------- Save (บันทึกจริง + เด้งไปหน้าชมรม) -------
  const handleSave = async () => {
    if (!clubData?.name?.trim()) {
      showMessage("error", "กรุณากรอกชื่อชมรม");
      return;
    }

    const catId = Number(clubData?.category?.ID);
    if (!Number.isFinite(catId) || catId <= 0) {
      showMessage("error", "กรุณาเลือกหมวดหมู่ชมรม");
      return;
    }

    setSaving(true);
    setConfirmOpen(false);

    try {
      const isActive = clubData?.status?.IsActive === true;
      const formData = new FormData();
      formData.append(
        "json_data",
        JSON.stringify({
          name: clubData.name ?? "",
          description: clubData.description ?? "",
          category_id: catId,
          status_id: isActive ? 2 : 1,
        })
      );
      if (logoFile) formData.append("logo", logoFile);

      await UpdateClub(id!, formData);

      // sync snapshot ใหม่ให้ตรงกับของที่เพิ่งบันทึก
      const snapshot = {
        ...clubData,
        status: { ...(clubData.status ?? {}), IsActive: isActive },
        category: { ID: catId, Name: clubData?.category?.Name ?? "" },
      };
      initialDataRef.current = snapshot;

      showMessage("success", "อัปเดตข้อมูลชมรมสำเร็จแล้ว! 🎉");
      setShowUnsavedChanges(false);
      setLogoFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      navigate(`/clubs/${id}`);
    } catch {
      showMessage("error", "ไม่สามารถอัปเดตข้อมูลได้");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setClubData((prev: any) => ({ ...(prev ?? {}), [field]: value }));
    setShowUnsavedChanges(true);
  };

  // ------- UI -------
  if (loading || !clubData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-700 mt-6 text-center font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => {
                  if (showUnsavedChanges) setCancelConfirmOpen(true);
                  else navigate(-1);
                }}
                className="group p-3 hover:bg-gray-100/80 rounded-2xl transition-all duration-200"
              >
                <svg className="w-6 h-6 text-gray-600 group-hover:text-gray-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">แก้ไขข้อมูลชมรม</h1>
                <p className="text-gray-500 mt-1">จัดการและอัปเดตข้อมูลของชมรมคุณ</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {showUnsavedChanges && (
                <div className="flex items-center text-amber-600 bg-amber-50 px-4 py-2 rounded-full text-sm">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></div>
                  มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left: Logo & quick info */}
          <div className="xl:col-span-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 sticky top-32">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full mr-3"></div>
                  โลโก้ชมรม
                </h3>

                <div
                  className={`relative group rounded-3xl border-2 transition-all duration-300 overflow-hidden ${
                    dragOver ? "border-indigo-400 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg scale-105" : "border-dashed border-gray-200 hover:border-indigo-300"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  <input
                    id="logo-input"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {(previewUrl || clubData.logo_image) ? (
                    <div className="relative p-4">
                      <div className="relative group/image">
                        <label htmlFor="logo-input" className="relative block cursor-pointer group">
                          <img
                            src={previewUrl ?? getImageUrl(clubData.logo_image)}
                            alt="โลโก้ชมรม"
                            className="w-full aspect-square rounded-2xl object-cover shadow-lg border-4 border-white group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://via.placeholder.com/300/E5E7EB/4B5563?text=No+Image";
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-white font-medium text-sm">กดเพื่อเปลี่ยนรูป</span>
                          </div>
                        </label>

                        {previewUrl && (
                          <div className="absolute top-6 right-6">
                            <button
                              type="button"
                              onClick={handleRemoveLogo}
                              className="w-12 h-12 bg-red-500/90 rounded-2xl shadow-lg hover:bg-red-600 transition text-white"
                              title="ลบรูปที่เลือก"
                            >
                              <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <label
                        htmlFor="logo-input"
                        className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        เลือกรูปภาพ
                      </label>
                      <p className="text-xs text-gray-400 mt-4">รองรับ JPG, PNG • แนะนำสัดส่วน 1:1 • ไม่เกิน 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick info */}
              <div className="bg-gradient-to-br from-gray-50/50 to-white/50 rounded-2xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center">
                  <div className="w-2 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full mr-3"></div>
                  ข้อมูลที่แสดง
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-gray-100">
                    <span className="text-sm font-medium text-gray-600">หมวดหมู่</span>
                    <span className="text-sm font-semibold text-gray-800 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
                      {clubData?.category?.Name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-gray-100">
                    <span className="text-sm font-medium text-gray-600">สถานะ</span>
                    <span
                      className={`text-xs px-3 py-1.5 rounded-full font-semibold flex items-center ${
                        clubData?.status?.IsActive
                          ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200"
                          : "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mr-2 ${clubData?.status?.IsActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                      {clubData?.status?.IsActive ? "เปิดรับสมาชิก" : "ปิดรับสมาชิก"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="xl:col-span-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-purple-600/90"></div>
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full"></div>
                <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-white/5 rounded-full"></div>
                <div className="relative">
                  <h2 className="text-2xl font-bold text-white mb-2">รายละเอียดชมรม</h2>
                  <p className="text-indigo-100">กรอกข้อมูลและจัดการการตั้งค่าชมรมของคุณ</p>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Name */}
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    ชื่อชมรม <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={clubData.name || ""}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all duration-300 bg-gray-50/50 hover:bg-white text-gray-800 font-medium placeholder-gray-400"
                      placeholder="กรอกชื่อชมรม..."
                      maxLength={100}
                    />
                    <div className="absolute right-4 top-4 text-xs text-gray-400">
                      {(clubData.name || "").length}/100
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-3">คำอธิบายชมรม</label>
                  <div className="relative">
                    <textarea
                      rows={5}
                      value={clubData.description || ""}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all duration-300 bg-gray-50/50 hover:bg-white text-gray-700 placeholder-gray-400 resize-none"
                      placeholder="บอกเล่าเกี่ยวกับชมรมของคุณ..."
                      maxLength={500}
                    />
                    <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded-lg backdrop-blur-sm">
                      {(clubData.description || "").length}/500
                    </div>
                  </div>
                </div>

                {/* Category + Status */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-bold text-gray-700 mb-3">หมวดหมู่ชมรม</label>
                    <select
                      value={clubData.category?.ID != null ? String(clubData.category.ID) : ""}
                      onChange={(e) => {
                        const selectedCategoryId = Number(e.target.value);
                        const selectedCategory = categories.find((c) => c.value === selectedCategoryId);
                        const value = { ID: selectedCategoryId, Name: selectedCategory?.label || "" };
                        setClubData((prev: any) => ({ ...(prev ?? {}), category: value }));
                        setShowUnsavedChanges(true);
                      }}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-all duration-300 bg-gray-50/50 hover:bg-white text-gray-700 font-medium"
                    >
                      <option value="">เลือกหมวดหมู่...</option>
                      {categories.map((c) => (
                        <option key={c.value} value={String(c.value)}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-bold text-gray-700 mb-3">สถานะการรับสมาชิก</label>
                    <div className="bg-gradient-to-br from-gray-50/70 to-white/50 p-6 rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={clubData?.status?.IsActive ?? false}
                          onChange={(e) => {
                            const status = { ...(clubData.status ?? {}), IsActive: e.target.checked };
                            setClubData((prev: any) => ({ ...(prev ?? {}), status }));
                            setShowUnsavedChanges(true);
                          }}
                          className="sr-only"
                        />
                        <div
                          className={`relative inline-flex items-center h-8 rounded-full w-14 transition-all duration-300 shadow-inner ${
                            clubData?.status?.IsActive
                              ? "bg-gradient-to-r from-emerald-500 to-green-500 shadow-emerald-200"
                              : "bg-gradient-to-r from-gray-300 to-gray-400 shadow-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block w-6 h-6 transform bg-white rounded-full transition-all duration-300 shadow-lg ${
                              clubData?.status?.IsActive ? "translate-x-7 shadow-emerald-300" : "translate-x-1 shadow-gray-300"
                            }`}
                          />
                        </div>
                        <div className="ml-4">
                          <span className={`text-base font-semibold ${clubData?.status?.IsActive ? "text-emerald-700" : "text-gray-700"}`}>
                            {clubData?.status?.IsActive ? "เปิดรับสมาชิก" : "ปิดรับสมาชิก"}
                          </span>
                          <span className="block text-sm text-gray-500">
                            {clubData?.status?.IsActive ? "สมาชิกใหม่สามารถสมัครเข้าร่วมได้" : "ไม่เปิดรับสมาชิกใหม่ในขณะนี้"}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4 pt-8 border-top border-gray-200">
                  <button
                    onClick={() => {
                      if (showUnsavedChanges) setCancelConfirmOpen(true);
                      else navigate(-1);
                    }}
                    className="px-8 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl font-semibold transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    ยกเลิก
                  </button>

                  <button
                    onClick={() => setConfirmOpen(true)}
                    disabled={saving}
                    className="group relative px-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-semibold rounded-2xl 
                               hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800 transition-all duration-300 
                               shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed
                               disabled:hover:transform-none overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="flex items-center relative z-10">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save confirm modal */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl max-w-md w-full shadow-2xl border border-white/20">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">ยืนยันการบันทึกข้อมูล</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                คุณต้องการบันทึกการแก้ไขข้อมูลชมรมหรือไม่?
                <br />
                <span className="text-sm text-gray-500">การดำเนินการนี้จะอัปเดตข้อมูลทั้งหมด</span>
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl font-semibold transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel confirm modal */}
      {cancelConfirmOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setCancelConfirmOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">ยกเลิกการแก้ไข?</h3>
              <p className="text-gray-600 mb-6">
                คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการแก้ไข?
                <br />
                การเปลี่ยนแปลงทั้งหมดจะไม่ถูกบันทึก
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setCancelConfirmOpen(false)}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  กลับไปแก้ไขต่อ
                </button>
                <button
                  onClick={() => {
                    // Revert to initial snapshot and leave without saving
                    if (initialDataRef.current) {
                      setClubData(initialDataRef.current);
                    }
                    setLogoFile(null);
                    if (previewUrl) {
                      URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                    }
                    setShowUnsavedChanges(false);
                    setCancelConfirmOpen(false);
                    navigate(-1);
                  }}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  ยืนยันยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 max-w-sm">
          <div
            className={`rounded-2xl shadow-2xl border backdrop-blur-sm p-4 ${
              toast.type === "success"
                ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white border-emerald-300"
                : "bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-300"
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mr-3 bg-white/20">
                {toast.type === "success" ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm leading-relaxed">{toast.text}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
