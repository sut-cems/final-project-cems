import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  User,
  Menu,
  X,
  Settings,
  LogOut,
  ChevronDown,
  Activity,
  UserCheck,
  University,
  Crown,
  Star,
  FolderKanban,
} from 'lucide-react';
import { API_BASE_URL, fetchUserById } from '../../services/http';
import type { Users } from '../../interfaces/IUsers';
import { CEMSLogoNoText } from '../../components/Logo/CEMSLogo';
import LogoutConfirmationModal from '../../components/Modal/Logout';
import { TooltipCustom } from '../../components/Home/ProfileDropdown';
import { ToastNotification } from '../../components/Modal/DeleteButtonModal';
import NotificationModal from '../../components/Modal/NotificationModal';
import { useNotifications } from '../../components/Home/UseNotifications';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  isActive?: boolean;
}

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
      <TooltipCustom text={text} position={tooltipPosition}>
        <span className={`cursor-default ${className}`}>
          {displayText}
        </span>
      </TooltipCustom>
    );
  }

  return <span className={className}>{displayText}</span>;
};

const AdminLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    title?: string;
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false
  });
  
  const [user, setUser] = useState<Users | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(true);
  const userId = localStorage.getItem('userId');
  const { notifications, loading: notificationsLoading, markAsRead, markAllAsRead } = useNotifications(Number(userId));

  // Load user data
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

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'แดชบอร์ด',
      icon: <BarChart3 className="w-5 h-5" />,
      path: '/'
    },
    {
      id: 'clubs',
      label: 'ชมรม',
      icon: <University className="w-5 h-5" />,
      path: '/manage/clubs'
    },
    {
      id: 'activities',
      label: 'กิจกรรม',
      icon: <Activity className="w-5 h-5" />,
      path: '/manage/activities'
    },
    {
      id: 'users',
      label: 'ผู้ใช้',
      icon: <UserCheck className="w-5 h-5" />,
      path: '/manage/users'
    },
    {
      id: 'reports',
      label: 'รายงาน',
      icon: <FolderKanban className="w-5 h-5" />,
      path: '/manage-reports'
    }
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
    setIsMobileSidebarOpen(false);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const getCurrentPageTitle = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem?.label || 'Dashboard';
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info', title?: string) => {
    setToast({
      message,
      type,
      title,
      isVisible: true
    });
  };

  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowLogoutModal(false);
      setIsLoggingOut(false);

      showToast('กำลังออกจากระบบ...', 'info', 'ออกจากระบบ');

      setTimeout(() => {
        showToast('ออกจากระบบสำเร็จ!', 'success', 'สำเร็จ');
      }, 1000);

      setTimeout(() => {
        showToast('กำลังเคลียร์ข้อมูล...', 'info', 'ดำเนินการ');
      }, 2500);

      setTimeout(() => {
        showToast('เสร็จสิ้น! ขอบคุณที่ใช้บริการ', 'success', 'เสร็จสิ้น');
      }, 4000);

      setTimeout(() => {
        localStorage.clear();
        navigate('/login');
      }, 5500);

    } catch (error) {
      setIsLoggingOut(false);
      showToast('เกิดข้อผิดพลาดในการออกจากระบบ', 'error', 'ข้อผิดพลาด');
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [screenSize, setScreenSize] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenSize(window.innerWidth);
      if (window.innerWidth < 1024) {
        setIsCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (screenSize >= 1024) {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Helper functions for user display
  const getDisplayName = () => {
    if (loading) return "กำลังโหลด...";
    if (error || !user) return "Admin User";
    return `${user.FirstName} ${user.LastName}`;
  };

  const getInitials = () => {
    if (loading || error || !user) return "A";
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

  const renderProfileAvatar = (size: string = "w-8 h-8", showBorder: boolean = false) => {
    const borderClass = showBorder ? "ring-2 ring-[#640D5F] ring-offset-2" : "";

    if (hasValidProfileImage()) {
      return (
        <div className={`relative ${size} ${borderClass} rounded-full`}>
          <img
            src={getImageUrl(user!.ProfileImage!)}
            alt={`${getDisplayName()} profile`}
            className={`${size} rounded-full object-cover shadow-sm`}
            onError={handleImageError}
          />
          {user?.IsActive && (
            <div className="absolute -bottom-0 -right-0 w-2.5 h-2.5 bg-[#27AE60] rounded-full border-2 border-white"></div>
          )}
        </div>
      );
    }

    return (
      <div className={`relative ${size} ${borderClass} rounded-full`}>
        <div className={`${size} rounded-full bg-[#640D5F] flex items-center justify-center text-white font-medium shadow-sm`}>
          <span className="text-xs">{getInitials()}</span>
        </div>
        {user?.IsActive && (
          <div className="absolute -bottom-0 -right-0 w-2.5 h-2.5 bg-[#27AE60] rounded-full border-2 border-white"></div>
        )}
        <div className="absolute -top-0 -right-0 w-3 h-3 bg-[#FFB200] rounded-full border-2 border-white flex items-center justify-center">
          <Crown className="w-2 h-2 text-white" />
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Floating Sidebar */}
        <div
          className={`fixed lg:absolute inset-y-0 left-0 z-50 mb-6 transition-all duration-300 ease-in-out
    ${screenSize >= 1024 && isCollapsed ? 'w-24' : 'w-64'} 
    ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
  `}
        >
          {/* Floating Container */}
          <div className={`h-full m-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 transition-all duration-300 flex flex-col
            ${screenSize >= 1024 && isCollapsed ? 'mx-2' : 'mr-2'}
          `}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100/50">
              {screenSize >= 1024 && isCollapsed ? (
                <div className="flex items-center justify-center w-full">
                  <button
                    onClick={toggleSidebar}
                    className="p-2 text-gray-400 hover:text-[#640D5F] hover:bg-gray-100/50 rounded-lg transition-all duration-150 group"
                  >
                    <div className="w-8 h-8 flex items-center justify-center">
                      <CEMSLogoNoText className="w-10 h-10" />
                    </div>
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <CEMSLogoNoText className="w-10 h-10" />
                    </div>
                    <div className="ml-3">
                      <div className="text-2xl font-bold text-[#640D5F] select-none tracking-tight">
                        CEMS
                      </div>
                      <div className="text-xs text-gray-500 leading-tight -mt-0.5">
                        จัดการชมรมและกิจกรรมภายในมหาวิทยาลัย
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={toggleSidebar}
                    className="hidden lg:flex p-1.5 text-gray-400 hover:text-[#640D5F] hover:bg-gray-100/50 rounded-lg transition-all duration-150"
                  >
                    <ChevronDown className="w-4 h-4 rotate-90" />
                  </button>
                </>
              )}
              {screenSize < 1024 && (
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Navigation Menu */}
            <nav className="px-3 py-4 flex-1">
              <ul className="space-y-2">
                {menuItems.map((item, index) => {
                  const isActive = isActiveRoute(item.path);
                  const shouldShowTooltip = screenSize >= 1024 && isCollapsed;

                  const buttonContent = (
                    <button
                      onClick={() => handleMenuClick(item.path)}
                      className={`
                w-full flex items-center text-sm font-medium rounded-xl
                transition-all duration-200 group relative overflow-hidden
                ${isActive
                          ? 'bg-[#640D5F] text-white shadow-lg shadow-[#640D5F]/20'
                          : 'text-gray-700 hover:bg-gray-100/70 hover:text-[#640D5F] hover:shadow-md'
                        }
                ${shouldShowTooltip ? 'justify-center p-3' : 'px-3 py-3'}
              `}
                      style={{
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[#640D5F] to-[#D91656] rounded-xl opacity-10 animate-pulse"></div>
                      )}

                      <div className={`
                relative z-10 flex items-center justify-center w-6 h-6
                ${!shouldShowTooltip ? 'mr-3' : ''}
              `}>
                        {item.icon}
                      </div>

                      {!shouldShowTooltip && (
                        <span className="relative z-10 truncate font-medium">
                          {item.label}
                        </span>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </button>
                  );

                  return (
                    <li key={item.id}>
                      {shouldShowTooltip ? (
                        <TooltipCustom text={item.label} position="right">
                          {buttonContent}
                        </TooltipCustom>
                      ) : (
                        buttonContent
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Bottom Section - Profile & Actions */}
            <div className="p-3 border-t border-gray-100/50 space-y-3">
              {/* User Profile Display */}
              {!(screenSize >= 1024 && isCollapsed) && (
                <div className="flex items-center px-3 py-2 bg-gray-50/50 rounded-xl">
                  {renderProfileAvatar("w-8 h-8")}
                  <div className="ml-3 flex-1 min-w-0">
                    <TruncatedText
                      text={getDisplayName()}
                      maxLength={15}
                      className="text-sm font-medium text-gray-900 block"
                    />
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span className="truncate">{user?.Email}</span>
                      <div className="flex items-center bg-[#FFB200]/20 px-2 py-0.5 rounded">
                        <Star className="w-3 h-3 text-[#FFB200] mr-1" />
                        <span>{user?.Role?.RoleName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Menu Items */}
              <div className="space-y-2">
             {/* Profile Menu Item */}
                {screenSize >= 1024 && isCollapsed ? (
                  <TooltipCustom text="โปรไฟล์ของฉัน" position="right">
                    <button 
                      onClick={() => handleMenuClick('/profile')}
                      className={`w-full flex items-center justify-center p-3 text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-md group relative overflow-hidden ${
                        isActiveRoute('/profile') 
                          ? 'bg-[#640D5F] text-white shadow-lg shadow-[#640D5F]/20' 
                          : 'text-gray-700 hover:bg-gray-100/70 hover:text-[#640D5F]'
                      }`}
                    >
                      <div className="relative z-10">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </button>
                  </TooltipCustom>
                ) : (
                  <button 
                    onClick={() => handleMenuClick('/profile')}
                    className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-md group relative overflow-hidden ${
                      isActiveRoute('/profile') 
                        ? 'bg-[#640D5F] text-white shadow-lg shadow-[#640D5F]/20' 
                        : 'text-gray-700 hover:bg-gray-100/70 hover:text-[#640D5F]'
                    }`}
                  >
                    <div className="relative z-10 flex items-center justify-center w-6 h-6 mr-3">
                      <User className="w-5 h-5" />
                    </div>
                    <span className="relative z-10 font-medium">โปรไฟล์ของฉัน</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </button>
                )}

                {/* Settings Menu Item */}
                {screenSize >= 1024 && isCollapsed ? (
                  <TooltipCustom text="ตั้งค่า" position="right">
                    <button className="w-full flex items-center justify-center p-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-100/70 hover:text-[#640D5F] transition-all duration-200 hover:shadow-md group relative overflow-hidden">
                      <div className="relative z-10">
                        <Settings className="w-5 h-5" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </button>
                  </TooltipCustom>
                ) : (
                  <button className="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-100/70 hover:text-[#640D5F] transition-all duration-200 hover:shadow-md group relative overflow-hidden">
                    <div className="relative z-10 flex items-center justify-center w-6 h-6 mr-3">
                      <Settings className="w-5 h-5" />
                    </div>
                    <span className="relative z-10 font-medium">ตั้งค่า</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </button>
                )}
              </div>

              {/* Separator */}
              <div className="border-t border-gray-100/50 pt-2">
                {/* Logout Button - Separate from menu items */}
                {screenSize >= 1024 && isCollapsed ? (
                  <TooltipCustom text="ออกจากระบบ" position="right">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center p-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200 hover:shadow-md group relative overflow-hidden"
                    >
                      <div className="relative z-10">
                        <LogOut className="w-5 h-5" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-50/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </button>
                  </TooltipCustom>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200 hover:shadow-md group relative overflow-hidden"
                  >
                    <div className="relative z-10 flex items-center justify-center w-6 h-6 mr-3">
                      <LogOut className="w-5 h-5" />
                    </div>
                    <span className="relative z-10 font-medium">ออกจากระบบ</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-50/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </button>
                )}
              </div>
            </div>

            {/* Floating Dots Indicator */}
            {!(screenSize >= 1024 && isCollapsed) && (
              <div className="absolute top-4 right-4 flex space-x-1">
                <div className="w-2 h-2 bg-[#27AE60] rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-[#FFB200] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-2 h-2 bg-[#D91656] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className={`
  flex-1 flex flex-col transition-all duration-300
  ${isCollapsed ? 'lg:ml-24' : 'lg:ml-72'}
`}>
          {/* Floating Top Bar */}
          <header className="bg-transparent p-4 z-60">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setIsMobileSidebarOpen(true)}
                    className="lg:hidden p-2 text-gray-500 hover:text-[#640D5F] hover:bg-gray-100/50 rounded-xl transition-all duration-150"
                  >
                    <Menu className="w-5 h-5" />
                  </button>

                  {/* Floating Breadcrumb */}
                  <div className="flex items-center space-x-2 text-sm bg-gray-100/50 px-3 py-1.5 rounded-lg">
                    <span className="text-gray-500">การจัดการ</span>
                    <ChevronDown className="w-3 h-3 text-gray-400 rotate-[-90deg]" />
                    <span className="text-gray-900 font-medium">
                      {getCurrentPageTitle()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Floating Notifications */}
                  <NotificationModal
                    notifications={notifications}
                    loading={notificationsLoading}
                    onMarkAsRead={markAsRead}
                    onMarkAllAsRead={markAllAsRead}
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Floating Content Area */}
          <main className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 min-h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Existing Modals */}
      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={cancelLogout}
        onConfirm={confirmLogout}
        userName={user ? `${user.FirstName} ${user.LastName}` : 'Admin User'}
        user={user}
        isLoggingOut={isLoggingOut}
      />

      <ToastNotification
        message={toast.message}
        type={toast.type}
        title={toast.title}
        isVisible={toast.isVisible}
        onClose={hideToast}
        duration={3000}
        position="top-right"
      />
    </>
  );
};

export default AdminLayout;