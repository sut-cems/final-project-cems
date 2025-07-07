import { useEffect, useState } from "react";
import type { Users } from "../../interfaces/IUsers";
import { API_BASE_URL, fetchUserById } from "../../services/http";
import { LogOut } from "lucide-react";

const LogoutConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
  isLoggingOut?: boolean;
  user?: Users | null;
}> = ({ isOpen, onClose, onConfirm, userName, isLoggingOut = false, user }) => {
  const [imageError, setImageError] = useState(false);
  const [currentUser, setCurrentUser] = useState<Users | null>(user || null);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        setCurrentUser(user);
        setImageError(false);
        return;
      }

      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          console.warn('No userId found in localStorage');
          return;
        }

        const userData = await fetchUserById(parseInt(userId));
        setCurrentUser(userData);
        setImageError(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setCurrentUser(null);
      }
    };

    if (isOpen) {
      loadUserData();
    }
  }, [isOpen, user]);

  // Reset imageError เมื่อ user เปลี่ยน
  useEffect(() => {
    if (currentUser?.ProfileImage) {
      setImageError(false);
    }
  }, [currentUser?.ProfileImage]);

  if (!isOpen) return null;

  const handleImageError = (error: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Profile image failed to load in modal:', error);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    console.log('Profile image loaded successfully in modal');
    setImageLoading(false);
  };

  const getInitials = () => {
    if (!currentUser?.FirstName || !currentUser?.LastName) {
      // Fallback ถ้าไม่มีข้อมูล user
      const nameParts = userName.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
      }
      return userName.charAt(0).toUpperCase() || "A";
    }
    return `${currentUser.FirstName.charAt(0)}${currentUser.LastName.charAt(0)}`.toUpperCase();
  };

  const hasValidProfileImage = () => {
    return currentUser?.ProfileImage && 
           currentUser.ProfileImage.trim() !== '' && 
           currentUser.ProfileImage !== 'null' && 
           currentUser.ProfileImage !== 'undefined' && 
           !imageError;
  };

  const getImageUrl = (profileImage: string) => {
    if (profileImage.startsWith('http://') || profileImage.startsWith('https://')) {
      return profileImage;
    }
    
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
    const imagePath = profileImage.startsWith('/') ? profileImage.substring(1) : profileImage;
    
    return `${baseUrl}${imagePath}`;
  };

  const renderProfileAvatar = () => {
    if (hasValidProfileImage()) {
      const imageUrl = getImageUrl(currentUser!.ProfileImage!);
      console.log('Modal - Rendering image with URL:', imageUrl);
      
      return (
        <div className="w-16 h-16 rounded-full ring-4 ring-red-100 mx-auto mb-2 relative">
          <img
            src={imageUrl}
            alt={`รูปโปรไฟล์ของ ${userName}`}
            className={`w-16 h-16 rounded-full object-cover shadow-lg transition-opacity duration-200 ${
              imageLoading ? 'opacity-50' : 'opacity-100'
            }`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            onLoadStart={() => setImageLoading(true)}
          />
          {imageLoading && (
            <div className="absolute inset-0 w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      );
    }

    console.log('Modal - Showing initials instead of image');
    return (
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#640D5F] via-[#D91656] to-[#EB5B00] flex items-center justify-center mx-auto mb-2 shadow-lg ring-4 ring-red-100">
        <span className="text-2xl font-bold text-white">{getInitials()}</span>
      </div>
    );
  };

  const getUserDisplayInfo = () => {
    if (currentUser) {
      return {
        displayName: `${currentUser.FirstName} ${currentUser.LastName}`,
        email: currentUser.Email || '',
        studentId: currentUser.StudentID || ''
      };
    }
    
    return {
      displayName: userName,
      email: '',
      studentId: ''
    };
  };

  const userInfo = getUserDisplayInfo();

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-60 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full transform transition-all duration-300 animate-slideUp border border-gray-100/80">
        
        {/* Clean Header */}
        <div className="p-8 pb-4">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <LogOut className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {isLoggingOut ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              {isLoggingOut 
                ? 'กรุณารอสักครู่ กำลังออกจากระบบอย่างปลอดภัย'
                : 'คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบบัญชีของคุณ?'
              }
            </p>
          </div>
        </div>

        {/* User Info with Profile Picture */}
        <div className="px-8 pb-6">
          <div className="bg-gray-50 rounded-2xl p-4 text-center">
            {renderProfileAvatar()}
            <p className="font-medium text-gray-900 text-sm">{userInfo.displayName}</p>
            {userInfo.email && (
              <p className="text-xs text-gray-400 mt-1 truncate" title={userInfo.email}>
                {userInfo.email}
              </p>
            )}
            {userInfo.studentId && (
              <p className="text-xs text-gray-500 mt-1">
                รหัสนักศึกษา: {userInfo.studentId}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {isLoggingOut ? 'กำลังออกจากระบบ...' : 'เซสชันปัจจุบัน'}
            </p>
          </div>
        </div>

        {/* Logging out progress */}
        {isLoggingOut && (
          <div className="px-8 pb-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                <span className="text-sm font-medium">กำลังประมวลผล...</span>
              </div>
              
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="h-full bg-red-500 rounded-full transition-all duration-1000 ease-out" 
                     style={{ width: '70%' }}></div>
              </div>
              
              <p className="text-xs text-gray-500">
                กำลังเคลียร์ข้อมูลเซสชันและออกจากระบบอย่างปลอดภัย
              </p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {!isLoggingOut && (
          <div className="p-8 pt-0 flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-150 rounded-2xl transition-colors duration-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              ยกเลิก
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl transition-colors duration-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              ออกจากระบบ
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(16px) scale(0.98);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LogoutConfirmationModal;