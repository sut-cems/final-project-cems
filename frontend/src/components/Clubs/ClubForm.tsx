import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building, Users, Calendar, MapPin, Phone, Send, Upload, Image, X } from 'lucide-react';
import { createClub, GetCategoriesWithClubs } from '../../services/http/clubs';
import SuccessNotification from "./SuccessNotification";

interface ClubCategory {
  id: number;
  name: string;
}

interface ClubFormProps {
  onBack?: () => void;
}

const ClubForm: React.FC<ClubFormProps> = ({ onBack }) => {
  const [clubCategories, setClubCategories] = useState<ClubCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

  const [formData, setFormData] = useState({
    clubName: '',
    category: '',
    targetMembers: '',
    description: '',
    meetingDate: '',
    meetingLocation: '',
    contact: '',
    imageFile: null as File | null,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await GetCategoriesWithClubs();
        if (res?.data && Array.isArray(res.data)) {
          const categories = res.data.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
          }));
          setClubCategories(categories);
        }
      } catch (err) {
        console.error('โหลดหมวดหมู่ไม่สำเร็จ', err);
        alert('โหลดหมวดหมู่ไม่สำเร็จ');
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, imageFile: null }));
    setPreviewUrl(null);
  };

  const handleSubmit = async () => {
    if (
      !formData.clubName || !formData.category || !formData.targetMembers ||
      !formData.description || !formData.meetingDate || !formData.meetingLocation ||
      !formData.contact || !formData.imageFile
    ) {
      setSuccessMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
      setNotificationType("error");
      setIsSuccessOpen(true);
      return;
    }

    const categoryID = parseInt(formData.category);
    const createdBy =
      Number(localStorage.getItem("userId")) ||
      Number(localStorage.getItem("id")) ||
      0;

    if (isNaN(categoryID) || createdBy === 0) {
      setSuccessMessage("Category ID หรือ CreatedBy ไม่ถูกต้อง");
      setNotificationType("error");
      setIsSuccessOpen(true);
      return;
    }


    setIsSubmitting(true);

    try {
      await createClub({
        Name: formData.clubName,
        Description: formData.description,
        CategoryID: categoryID,
        CreatedBy: createdBy,
        imageFile: formData.imageFile,
      });

      setSuccessMessage("สร้างชมรมสำเร็จแล้ว!");
      setNotificationType("success");
      setIsSuccessOpen(true);

      setTimeout(() => {
        if (onBack) onBack();
      }, 2000);

    } catch (error: any) {
      console.error(error);
      setSuccessMessage("เกิดข้อผิดพลาด: " + error.message);
      setNotificationType("error");
      setIsSuccessOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleClearForm = () => {
    setFormData({
      clubName: '',
      category: '',
      targetMembers: '',
      description: '',
      meetingDate: '',
      meetingLocation: '',
      contact: '',
      imageFile: null,
    });
    setPreviewUrl(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              สร้างชมรมใหม่
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            กรอกข้อมูลเพื่อสร้างชมรมของคุณ
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/50 p-8 md:p-12">
          <div className="space-y-8">
            
            {/* Back Button */}
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 text-slate-600 hover:text-violet-600 transition-colors mb-6"
              >
                <ArrowLeft className="w-5 h-5" />
                กลับไปหน้าหลัก
              </button>
            )}

            {/* Beautiful Upload Section */}
            <div>
              <label className="block text-lg font-semibold text-slate-700 mb-3">
                อัปโหลดโลโก้ชมรม *
              </label>
              
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="file-upload"
                />
                
                <div
                  className={`
                    relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ease-in-out
                    ${isDragging 
                      ? 'border-violet-400 bg-violet-50 scale-105' 
                      : 'border-slate-300 hover:border-violet-400 hover:bg-slate-50'
                    }
                    ${formData.imageFile ? 'border-green-400 bg-green-50' : ''}
                    cursor-pointer group
                  `}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {previewUrl ? (
                    <div className="relative flex flex-col items-center">
                      <div className="w-32 h-32 bg-slate-100 rounded-lg overflow-hidden shadow-md">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={removeFile}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                        type="button"
                      >
                        <X size={16} />
                      </button>
                      <div className="mt-4 text-center">
                        <p className="text-sm text-green-600 font-medium">
                          ✓ อัปโหลดสำเร็จ: {formData.imageFile?.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          คลิกเพื่อเปลี่ยนไฟล์
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">
                        อัปโหลดโลโก้ชมรม
                      </h3>
                      <p className="text-slate-500 mb-4">
                        ลากและวางไฟล์ที่นี่ หรือคลิกเพื่อเลือกไฟล์
                      </p>
                      <div className="flex items-center justify-center space-x-2 text-sm text-slate-400">
                        <Image size={16} />
                        <span>รองรับไฟล์: PNG, JPG, GIF</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-2 text-xs text-slate-500 text-center">
                ขนาดไฟล์สูงสุด: 5MB
              </div>
            </div>

            {/* Club Name */}
            <div>
              <label className="block text-lg font-semibold text-slate-700 mb-3">
                ชื่อชมรม *
              </label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-violet-500 w-5 h-5" />
                <input
                  type="text"
                  value={formData.clubName}
                  onChange={(e) => handleInputChange('clubName', e.target.value)}
                  placeholder="กรอกชื่อชมรมของคุณ เช่น คอมพิวเตอร์"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all text-lg bg-white/70"
                />
              </div>
            </div>

            {/* Category and Target Members */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-semibold text-slate-700 mb-3">
                  ประเภทชมรม *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-4 rounded-xl border border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all text-lg bg-white/70"
                >
                  <option value="">เลือกประเภทชมรม</option>
                  {clubCategories.map(category => (
                    <option key={category.id} value={category.id.toString()}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-lg font-semibold text-slate-700 mb-3">
                  จำนวนสมาชิกเป้าหมาย *
                </label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-violet-500 w-5 h-5" />
                  <input
                    type="number"
                    min="1"
                    value={formData.targetMembers}
                    onChange={(e) => handleInputChange('targetMembers', e.target.value)}
                    placeholder="เช่น 20"
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all text-lg bg-white/70"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-lg font-semibold text-slate-700 mb-3">
                คำอธิบายชมรม *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="อธิบายเกี่ยวกับชมรม กิจกรรม และสิ่งที่สมาชิกจะได้รับ..."
                rows={4}
                className="w-full px-4 py-4 rounded-xl border border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all text-lg bg-white/70 resize-none"
              />
            </div>

            {/* Meeting Date and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-semibold text-slate-700 mb-3">
                  วันเวลาการประชุม *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-violet-500 w-5 h-5" />
                  <input
                    type="date"
                    value={formData.meetingDate}
                    onChange={(e) => handleInputChange('meetingDate', e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all text-lg bg-white/70"
                  />
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold text-slate-700 mb-3">
                  สถานที่ประชุม *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-violet-500 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.meetingLocation}
                    onChange={(e) => handleInputChange('meetingLocation', e.target.value)}
                    placeholder="ห้องประชุม อาคาร..."
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all text-lg bg-white/70"
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <label className="block text-lg font-semibold text-slate-700 mb-3">
                ข้อมูลติดต่อ *
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-violet-500 w-5 h-5" />
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => handleInputChange('contact', e.target.value)}
                  placeholder="เบอร์โทรหรืออีเมล"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all text-lg bg-white/70"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <button
                type="button"
                onClick={handleClearForm}
                className="px-8 py-4 rounded-xl border-2 border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-all text-lg font-semibold"
              >
                ล้างข้อมูล
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="group relative bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:from-violet-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="flex items-center gap-3">
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      กำลังสร้างชมรม...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                      สร้างชมรม
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
        <SuccessNotification
          isOpen={isSuccessOpen}
          message={successMessage}
          onClose={() => setIsSuccessOpen(false)}
          type={notificationType}
        />

    </div>
  );
};

export default ClubForm;