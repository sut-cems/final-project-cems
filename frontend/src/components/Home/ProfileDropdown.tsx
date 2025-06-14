import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Users } from '../../interfaces/IUsers';
import { API_BASE_URL, fetchUserById } from '../../services/http';

// Custom Tooltip Component
const Tooltip: React.FC<{ text: string; children: React.ReactNode; position?: 'top' | 'bottom' | 'left' | 'right' }> = ({ 
  text, 
  children, 
  position = 'top' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDelay, setShowDelay] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    const delay = setTimeout(() => setIsVisible(true), 500); 
    setShowDelay(delay);
  };

  const handleMouseLeave = () => {
    if (showDelay) {
      clearTimeout(showDelay);
      setShowDelay(null);
    }
    setIsVisible(false);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default: // top
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800';
      default: // top
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800';
    }
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && text && (
        <div className={`absolute z-[60] ${getPositionClasses()}`}>
          <div className="bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-2xl border border-gray-700 backdrop-blur-sm bg-opacity-95 whitespace-nowrap animate-in fade-in-0 zoom-in-95 duration-200">
            {text}
          </div>
          <div className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`}></div>
        </div>
      )}
    </div>
  );
};

// Custom Text Truncate Component
const TruncatedText: React.FC<{ 
  text: string; 
  maxLength: number; 
  className?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  showTooltip?: boolean;
}> = ({ text, maxLength, className = "", tooltipPosition = 'top', showTooltip = true }) => {
  const shouldTruncate = text.length > maxLength;
  const displayText = shouldTruncate ? `${text.slice(0, maxLength)}...` : text;

  if (shouldTruncate && showTooltip) {
    return (
      <Tooltip text={text} position={tooltipPosition}>
        <span className={`cursor-default ${className}`}>
          {displayText}
        </span>
      </Tooltip>
    );
  }

  return <span className={className}>{displayText}</span>;
};

const ProfileDropdown: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<Users | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setError('ไม่พบ User ID');
          setLoading(false);
          return;
        }

        const userData = await fetchUserById(parseInt(userId));
        setUser(userData);
        setError(null);
        setImageError(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDisplayName = () => {
    if (loading) return "กำลังโหลด...";
    if (error || !user) return "User";
    return `${user.FirstName} ${user.LastName}`;
  };

  const getInitials = () => {
    if (loading || error || !user) return "U";
    return `${user.FirstName?.charAt(0) || ''}${user.LastName?.charAt(0) || ''}`.toUpperCase();
  };

  const hasValidProfileImage = () => {
    return user?.ProfileImage && user.ProfileImage.trim() !== '' && !imageError;
  };

  // Function to get the correct image URL
  const getImageUrl = (profileImage: string) => {
    if (profileImage.startsWith('http://') || profileImage.startsWith('https://')) {
      return profileImage;
    }
    return `${API_BASE_URL}${profileImage}`;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Render profile avatar (image or initials)
  const renderProfileAvatar = (size: string = "w-9 h-9") => {
    if (hasValidProfileImage()) {
      return (
        <img
          src={getImageUrl(user!.ProfileImage)}
          alt={`${getDisplayName()} profile`}
          className={`${size} rounded-full object-cover shadow-md group-hover:shadow-lg transition-shadow duration-300`}
          onError={handleImageError}
        />
      );
    }

    return (
      <div className={`${size} rounded-full bg-gradient-to-br from-[#D91656] to-[#EB5B00] flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg transition-shadow duration-300`}>
        {getInitials()}
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-full border-2 border-[#640D5F] text-[#640D5F] hover:bg-[#640D5F] hover:text-white hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out group"
        disabled={loading}
      >
        <div className="relative">
          {renderProfileAvatar()}
          {!loading && !error && user?.IsActive && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
          )}
        </div>
        <div className="font-medium hidden sm:block max-w-40">
          <TruncatedText 
            text={getDisplayName()} 
            maxLength={25} 
            tooltipPosition="bottom"
          />
        </div>
        <ChevronDown className={`w-4 h-4 transform transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 transform animate-fadeIn">
          <div className="p-2">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="text-sm font-medium text-gray-900 mb-1">
                <TruncatedText 
                  text={getDisplayName()} 
                  maxLength={22} 
                  tooltipPosition="right"
                />
              </div>
              {user && (
                <>
                  <div className="text-xs text-gray-500 mb-1 break-all">
                    <Tooltip text={user.Email} position="right">
                      <span className="cursor-default">
                        {user.Email.length > 28 ? `${user.Email.slice(0, 28)}...` : user.Email}
                      </span>
                    </Tooltip>
                  </div>
                  <div className="text-xs text-gray-400">
                    <Tooltip text={`${user.StudentID}`} position="right">
                      <span className="cursor-default">
                        รหัสนักศึกษา: {user.StudentID}
                      </span>
                    </Tooltip>
                  </div>
                </>
              )}
            </div>
            
            <div className="py-2">
              <a 
                href="/profile" 
                className="flex items-center px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-[#640D5F]/10 hover:to-[#D91656]/10 text-gray-700 hover:text-[#640D5F] rounded-lg transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#640D5F] to-[#D91656] flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                  <User className="w-4 h-4 text-white" />
                </div>
                โปรไฟล์ของฉัน
              </a>
              
              <a 
                href="/settings" 
                className="flex items-center px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-[#EB5B00]/10 hover:to-[#FFB200]/10 text-gray-700 hover:text-[#EB5B00] rounded-lg transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#EB5B00] to-[#FFB200] flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                ตั้งค่า
              </a>
            </div>
            
            <div className="border-t border-gray-100 pt-2">
              <button
                onClick={onLogout}
                className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-full bg-red-100 group-hover:bg-red-200 flex items-center justify-center mr-3 group-hover:scale-110 transition-all duration-200">
                  <LogOut className="w-4 h-4 text-red-600" />
                </div>
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileDropdownMobile: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<Users | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setError('ไม่พบ User ID');
          setLoading(false);
          return;
        }

        const userData = await fetchUserById(parseInt(userId));
        setUser(userData);
        setError(null);
        setImageError(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const getDisplayName = () => {
    if (loading) return "กำลังโหลด...";
    if (error || !user) return "User";
    return `${user.FirstName} ${user.LastName}`;
  };

  const getInitials = () => {
    if (loading || error || !user) return "U";
    return `${user.FirstName?.charAt(0) || ''}${user.LastName?.charAt(0) || ''}`.toUpperCase();
  };

  const hasValidProfileImage = () => {
    return user?.ProfileImage && user.ProfileImage.trim() !== '' && !imageError;
  };

  const getImageUrl = (profileImage: string) => {
    if (profileImage.startsWith('http://') || profileImage.startsWith('https://')) {
      return profileImage;
    }
    return `${API_BASE_URL}${profileImage}`;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const renderProfileAvatar = (size: string = "w-12 h-12") => {
    if (hasValidProfileImage()) {
      return (
        <img
          src={getImageUrl(user!.ProfileImage)}
          alt={`${getDisplayName()} profile`}
          className={`${size} rounded-full object-cover shadow-lg`}
          onError={handleImageError}
        />
      );
    }

    return (
      <div className={`${size} rounded-full bg-gradient-to-br from-[#D91656] to-[#EB5B00] flex items-center justify-center text-white font-bold shadow-lg`}>
        {getInitials()}
      </div>
    );
  };

  return (
    <div className="border-t border-gray-200 pt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-full text-left px-5 py-4 text-[#640D5F] border-2 border-[#640D5F]/20 rounded-xl font-medium hover:bg-gradient-to-r hover:from-[#640D5F]/5 hover:to-[#D91656]/5 hover:border-[#640D5F]/40 hover:shadow-md transition-all duration-300"
        disabled={loading}
      >
        <div className="relative mr-4">
          {renderProfileAvatar()}
          {!loading && !error && user?.IsActive && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-[#640D5F] truncate">
            สวัสดี, {getDisplayName()}
          </p>
          {user && !loading && (
            <Tooltip text={`รหัสนักศึกษา: ${user.StudentID}`}>
              <p className="text-xs text-gray-400 truncate cursor-default">
                รหัสนักศึกษา: {user.StudentID}
              </p>
            </Tooltip>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="mt-4 space-y-2 px-2 animate-fadeIn">
          <a
            href="/profile"
            className="flex items-center w-full p-4 text-gray-700 hover:text-[#640D5F] hover:bg-gradient-to-r hover:from-[#640D5F]/10 hover:to-[#D91656]/10 rounded-xl transition-all duration-200 group"
            onClick={() => setIsOpen(false)}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#640D5F] to-[#D91656] flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
              <User className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium">โปรไฟล์ของฉัน</span>
          </a>
          
          <a
            href="/settings"
            className="flex items-center w-full p-4 text-gray-700 hover:text-[#EB5B00] hover:bg-gradient-to-r hover:from-[#EB5B00]/10 hover:to-[#FFB200]/10 rounded-xl transition-all duration-200 group"
            onClick={() => setIsOpen(false)}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#EB5B00] to-[#FFB200] flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium">ตั้งค่า</span>
          </a>
          
          <button
            onClick={onLogout}
            className="flex items-center w-full p-4 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-full bg-red-100 group-hover:bg-red-200 flex items-center justify-center mr-3 group-hover:scale-110 transition-all duration-200">
              <LogOut className="w-5 h-5 text-red-600" />
            </div>
            <span className="font-medium">ออกจากระบบ</span>
          </button>
        </div>
      )}
    </div>
  );
};

export { ProfileDropdown, ProfileDropdownMobile };