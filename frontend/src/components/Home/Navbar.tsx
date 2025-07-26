import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ProfileDropdown, ProfileDropdownMobile } from './ProfileDropdown';
import CEMSLogo from '../Logo/CEMSLogo';

interface NavItem {
  label: string;
  href: string;
  isActive?: boolean;
  isScrollTarget?: boolean;
  requireAdmin?: boolean; 
}

interface CEMSNavbarProps {
  className?: string;
}

const Navbar: React.FC<CEMSNavbarProps> = ({ className = '' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(false);
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("isLogin") === "true";
  const roleAdmin = localStorage.getItem("role") === 'admin'; 
  const [logoutMessage] = useState('');
  const [logoutStep] = useState(0);
  const location = useLocation();
  
  // สร้างรายการเมนูพื้นฐาน
  const allNavItems: NavItem[] = [
    { label: 'หน้าหลัก', href: '/' },
    { label: 'ชมรม', href: '/clubs' },
    { label: 'กิจกรรม', href: '/activities' },
    { label: 'รูปภาพกิจกรรม', href: '/activities/photo' },
    { label: 'รายงาน', href: '/dashboard', requireAdmin: true }, 
    { label: 'เกี่ยวกับเรา', href: '/about', isScrollTarget: true },
  ];

  // กรองเมนูตาม role
  const navItems: NavItem[] = allNavItems
    .filter(item => {
      return !item.requireAdmin || roleAdmin;
    })
    .map(item => ({
      ...item,
      isActive: item.isScrollTarget 
        ? (location.pathname === '/' && isAtBottom) 
        : (location.pathname === item.href && !(location.pathname === '/' && isAtBottom))
    }));

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // ฟังก์ชันตรวจสอบว่าอยู่ด้านล่างสุดหรือไม่
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      
      // ตรวจสอบว่าเลื่อนมาใกล้ด้านล่างสุดหรือไม่ (ใน 100px)
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      const isOnHomePage = location.pathname === '/';
      
      setIsAtBottom(isNearBottom && isOnHomePage);
    };

    window.addEventListener('scroll', handleScroll);
    
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

  const handleNavClick = (item: NavItem, event: React.MouseEvent) => {
    if (item.isScrollTarget && location.pathname === '/') {
      // ถ้าอยู่หน้าหลักแล้วและคลิก "เกี่ยวกับเรา" ให้เลื่อนลงไปด้านล่าง
      event.preventDefault();
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
    } else if (item.isScrollTarget) {
      // ถ้าไม่ได้อยู่หน้าหลัก ให้ไปหน้าหลักก่อนแล้วค่อยเลื่อน
      event.preventDefault();
      navigate('/');
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  };

  const HamburgerIcon: React.FC = () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );

  const CloseIcon: React.FC = () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  const LogoutIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );

  const CheckIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  const LoadingSpinner: React.FC = () => (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );


  const getLogoutMessageStyles = () => {
    switch (logoutStep) {
      case 1:
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          border: 'border-l-4 border-blue-500',
          icon: <LoadingSpinner />,
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600'
        };
      case 2:
        return {
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
          border: 'border-l-4 border-green-500',
          icon: <CheckIcon />,
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600'
        };
      case 3:
        return {
          bg: 'bg-gradient-to-r from-yellow-50 to-amber-50',
          border: 'border-l-4 border-yellow-500',
          icon: <LoadingSpinner />,
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600'
        };
      case 4:
        return {
          bg: 'bg-gradient-to-r from-purple-50 to-pink-50',
          border: 'border-l-4 border-purple-500',
          icon: <CheckIcon />,
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600'
        };
      default:
        return {
          bg: 'bg-white',
          border: 'border-l-4 border-gray-500',
          icon: <LogoutIcon />,
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600'
        };
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
        body {
          font-family: 'Prompt', sans-serif;
        }
      `}</style>

      <nav className={`bg-white shadow-lg sticky top-0 z-50 ${className}`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo Section */}
            <CEMSLogo className="cursor-pointer hover:opacity-80 transition-opacity" />

            {/* Desktop Navigation */}
            <div className="hidden lg:flex space-x-8">
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  onClick={(e) => handleNavClick(item, e)}
                  className={`font-medium transition-colors duration-200 hover:text-[#D91656] cursor-pointer ${item.isActive
                    ? 'text-[#640D5F] border-b-2 border-[#640D5F] pb-1'
                    : 'text-gray-600'
                    }`}
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Enhanced Logout Success Message */}
            {logoutMessage && (
              <div className="fixed top-4 left-4 z-50 animate-slideInRight">
                <div className={`${getLogoutMessageStyles().bg} ${getLogoutMessageStyles().border} rounded-xl shadow-2xl p-4 max-w-sm backdrop-blur-sm border border-white/20`}>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full ${getLogoutMessageStyles().iconBg} flex items-center justify-center ${logoutStep === 1 || logoutStep === 3 ? 'animate-pulse-gentle' : ''}`}>
                        <div className={getLogoutMessageStyles().iconColor}>
                          {getLogoutMessageStyles().icon}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                        {logoutMessage}
                      </p>
                      {logoutStep === 4 && (
                        <p className="text-xs text-gray-500 mt-1">
                          กำลังนำคุณกลับสู่หน้าหลัก...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress bar for visual feedback */}
                  {logoutStep > 0 && (
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${logoutStep === 1 ? 'bg-blue-500 w-1/4' :
                          logoutStep === 2 ? 'bg-green-500 w-2/4' :
                            logoutStep === 3 ? 'bg-yellow-500 w-3/4' :
                              'bg-purple-500 w-full'
                          }`}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              {isLoggedIn ? (
                <ProfileDropdown />
              ) : (
                <>
                  <a
                    href="/login"
                    className="px-6 py-2 text-[#640D5F] border-2 border-[#640D5F] rounded-lg font-medium hover:bg-[#640D5F] hover:text-white transition-all duration-300 transform hover:scale-105"
                  >
                    เข้าสู่ระบบ
                  </a>
                  <a
                    href="/signup"
                    className="px-6 py-2 bg-gradient-to-r from-[#640D5F] to-[#D91656] text-white rounded-lg font-medium hover:from-[#D91656] hover:to-[#EB5B00] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    ลงทะเบียน
                  </a>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-[#640D5F] hover:text-[#D91656] transition-colors duration-200 p-2"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={toggleMobileMenu}
          />
        )}

        {/* Mobile Menu */}
        <div className={`
          lg:hidden fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="p-6">
            {/* Mobile Menu Header */}
            <div className="flex justify-between items-center mb-8">
              <CEMSLogo />
              <button
                onClick={toggleMobileMenu}
                className="text-[#640D5F] hover:text-[#D91656] transition-colors duration-200 p-2"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-6 mb-8">
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  onClick={(e) => {
                    handleNavClick(item, e);
                    toggleMobileMenu();
                  }}
                  className={`block text-lg font-medium transition-colors duration-200 hover:text-[#D91656] cursor-pointer ${item.isActive ? 'text-[#640D5F]' : 'text-gray-600'
                    }`}
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Mobile Auth Buttons */}
            <div className="space-y-4">
              {isLoggedIn ? (
                <ProfileDropdownMobile />
              ) : (
                <>
                  <a
                    href="/login"
                    onClick={toggleMobileMenu}
                    className="block w-full px-6 py-3 text-center text-[#640D5F] border-2 border-[#640D5F] rounded-lg font-medium hover:bg-[#640D5F] hover:text-white transition-all duration-300"
                  >
                    เข้าสู่ระบบ
                  </a>
                  <a
                    href="/signup"
                    onClick={toggleMobileMenu}
                    className="block w-full px-6 py-3 text-center bg-gradient-to-r from-[#640D5F] to-[#D91656] text-white rounded-lg font-medium hover:from-[#D91656] hover:to-[#EB5B00] transition-all duration-300 shadow-lg"
                  >
                    ลงทะเบียน
                  </a>
                </>
              )}
            </div>

            {/* Mobile Menu Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                ระบบจัดการชมรมและกิจกรรม<br />
                ภายในมหาวิทยาลัย
              </p>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;