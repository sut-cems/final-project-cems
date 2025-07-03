import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserMinus, AlertTriangle, ShieldCheck, CheckCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'join' | 'leave' | 'remove' | 'change-president' | 'approve';
  isPresident?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}


const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  type,
  isPresident,
  onConfirm,
  onCancel,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleCancel = () => {
    setIsVisible(false);
    setTimeout(onCancel, 200);
  };

  const handleConfirm = () => {
    setIsVisible(false);
    setTimeout(onConfirm, 200);
  };

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'join':
        return <UserPlus className="w-12 h-12 text-green-500" />;
      case 'leave':
      case 'remove':
        return <UserMinus className="w-12 h-12 text-red-500" />;
      case 'change-president':
        return <ShieldCheck className="w-12 h-12 text-yellow-500" />;
      case 'approve':
        return <CheckCircle className="w-12 h-12 text-green-500" />; // ✅ เพิ่มอันนี้
      default:
        return null;
    }
  };


  const getButtonColors = () => {
    switch (type) {
      case 'join':
        return {
          confirm: 'bg-green-500 hover:bg-green-600 text-white',
          cancel: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
        };
      case 'change-president':
        return {
          confirm: 'bg-yellow-500 hover:bg-yellow-600 text-white',
          cancel: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
        };
      case 'approve':
        return {
          confirm: 'bg-green-500 hover:bg-green-600 text-white',
          cancel: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
        };
      default:
        return {
          confirm: 'bg-red-500 hover:bg-red-600 text-white',
          cancel: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
        };
    }
  };

  const colors = getButtonColors();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-md transition-all duration-300 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Close Button */}
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 z-10"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-full bg-gray-50">
              {getIcon()}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {title}
          </h3>

          {/* Message */}
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            {message}
          </p>

           {type === 'remove' && (
            <div className="text-sm text-red-600 mb-6">
              การลบสมาชิกจะไม่สามารถย้อนกลับได้
            </div>
          )}

          
          {/* คำเตือนสำหรับหัวหน้าชมรมเท่านั้น */}
          {type === 'leave' && isPresident && (
            <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-700 font-medium">
                กรุณาเปลี่ยนหัวหน้าชมรมก่อนออกจากชมรม
              </span>
            </div>
          )}

          {/* คำเตือนสำหรับสมาชิกทั่วไปเท่านั้น */}
          {type === 'leave' && !isPresident && (
            <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-yellow-700">
                คุณจะต้องสมัครใหม่หากต้องการเข้าร่วมอีกครั้ง
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {/* แสดงปุ่มยกเลิกเฉพาะกรณีที่ไม่ใช่หัวหน้าชมรม */}
            {!isPresident && (
              <button
                onClick={handleCancel}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${colors.cancel}`}
              >
                ยกเลิก
              </button>
            )}

            <button
              onClick={handleConfirm}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${colors.confirm}`}
            >
              {type === 'join' ? 'สมัครเข้าร่วม' : 'ยืนยัน'}
            </button>
            
          </div>

        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;