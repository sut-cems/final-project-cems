import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CEMSLogoProps {
    className?: string;
    onClick?: () => void;
}

const CEMSLogo: React.FC<CEMSLogoProps> = ({ className = '', onClick }) => {
    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            window.location.href = '/';
        }
    };

    return (
        <div className={`flex items-center justify-center group ${className}`} onClick={handleClick}>
            {/* Geometric Crystal Logo */}
            <div className="relative">
                <svg className="h-12 w-12 transform transition-transform duration-300 group-hover:scale-110" viewBox="0 0 80 80" fill="none">
                    <defs>
                        <linearGradient id="modernGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#640D5F" />
                            <stop offset="100%" stopColor="#D91656" />
                        </linearGradient>
                        
                        <linearGradient id="modernGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#D91656" />
                            <stop offset="100%" stopColor="#EB5B00" />
                        </linearGradient>
                        
                        <linearGradient id="modernGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#EB5B00" />
                            <stop offset="100%" stopColor="#FFB200" />
                        </linearGradient>
                        
                        <filter id="modernShadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#640D5F" floodOpacity="0.25" />
                        </filter>
                    </defs>
                    
                    {/* Geometric Crystal */}
                    <g transform="translate(10, 10)" filter="url(#modernShadow)">
                        {/* Main crystal body - diamond shape */}
                        <polygon points="30,10 50,30 30,70 10,30" fill="url(#modernGrad1)" className="transition-all duration-300 group-hover:opacity-90" />
                        {/* Right facet - top triangle */}
                        <polygon points="30,10 70,30 50,30" fill="url(#modernGrad2)" className="transition-all duration-300 group-hover:opacity-90" />
                        {/* Bottom facet - bottom triangle */}
                        <polygon points="50,30 70,30 30,70" fill="url(#modernGrad3)" className="transition-all duration-300 group-hover:opacity-90" />
                    </g>
                </svg>
                
                {/* Subtle glow effect on hover */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#640D5F] to-[#D91656] opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
            </div>
            
            {/* Logo Text */}
            <div className="ml-3">
                <span className="text-2xl font-bold text-[#640D5F] select-none tracking-tight mt-6">
                    CEMS
                </span>
            </div>
        </div>
    )
}
const LoadingDots = () => {
  return (
    <div className="flex space-x-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 bg-gradient-to-r from-[#640D5F] to-[#D91656] rounded-full animate-bounce shadow-sm"
          style={{ 
            animationDelay: `${i * 0.15}s`,
            animationDuration: '0.8s'
          }}
        />
      ))}
    </div>
  );
};

const ProgressBar = ({ progress }: { progress: number }) => {
  return (
    <div className="w-80 bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
      <div
        className="h-full bg-gradient-to-r from-[#640D5F] via-[#D91656] to-[#EB5B00] transition-all duration-500 ease-out rounded-full relative"
        style={{ width: `${progress}%` }}
      >
        {/* Subtle shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full"></div>
      </div>
    </div>
  );
};

type StatusMessageProps = {
  message: string;
  submessage?: string;
};

const StatusMessage = ({ message, submessage }: StatusMessageProps) => {
  return (
    <div className="text-center space-y-3">
      <h2 className="text-xl font-semibold text-gray-800 leading-tight">
        {message}
      </h2>
      {submessage && (
        <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
          {submessage}
        </p>
      )}
    </div>
  );
};

// Enhanced Loading Spinner
const LoadingSpinner = () => {
  return (
    <div className="relative">
      {/* Outer Ring */}
      <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
      {/* Animated Ring */}
      <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[#640D5F] border-r-[#640D5F]/50 rounded-full animate-spin"></div>
      {/* Center Element */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-4 h-4 bg-gradient-to-br from-[#D91656] to-[#EB5B00] rounded-full animate-pulse shadow-sm"></div>
      </div>
      {/* Subtle outer glow */}
      <div className="absolute inset-0 w-16 h-16 rounded-full bg-[#640D5F]/5 animate-ping"></div>
    </div>
  );
};

// Success/Error Icon Component
const StatusIcon = ({ type }: { type: 'success' | 'error' | 'loading' }) => {
  if (type === 'success') {
    return (
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  
  if (type === 'error') {
    return (
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    );
  }
  
  return null;
};

function GoogleCallbackPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<{
    message: string;
    submessage?: string;
    type: 'success' | 'error' | 'loading';
  }>({
    message: 'กำลังเชื่อมต่อ',
    submessage: 'โปรดรอสักครู่...',
    type: 'loading'
  });
  const [isComplete, _setIsComplete] = useState(false);

  useEffect(() => {
    console.log("GoogleCallbackPage mounted");

    // Smooth progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 8 + 4;
      });
    }, 180);

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const id = params.get("id");
    const role = params.get("role");

    setTimeout(() => {
      setStatus({
        message: 'กำลังยืนยันตัวตน',
        submessage: 'ตรวจสอบข้อมูลการเข้าสู่ระบบของคุณ',
        type: 'loading'
      });
    }, 800);

    setTimeout(() => {
      setStatus({
        message: 'กำลังโหลดข้อมูล',
        submessage: 'เตรียมข้อมูลผู้ใช้งานและสิทธิ์การเข้าถึง',
        type: 'loading'
      });
    }, 1800);

    if (token) {
      localStorage.setItem("authToken", token);
      localStorage.setItem("userId", id ?? "");
      localStorage.setItem("role", role ?? "");
      localStorage.setItem("isLogin", "true");

      setTimeout(() => {
        setStatus({
          message: 'เข้าสู่ระบบสำเร็จ!',
          submessage: '',
          type: 'success'
        });
        setTimeout(() => navigate("/"), 500);
      }, 2000);
    } else {
      setTimeout(() => {
        setStatus({
          message: 'เกิดข้อผิดพลาด',
          submessage: 'กำลังเปลี่ยนเส้นทาง...',
          type: 'error'
        });
        setTimeout(() => navigate("/login"), 1000);
      }, 2000);
    }

    return () => clearInterval(progressInterval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-6">
      {/* Main Container */}
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-12">
          <CEMSLogo className="justify-center" />
        </div>

        {/* Loading Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 transition-all duration-300">
          {/* Progress Section */}
          <div className="space-y-6">
            {/* Loading Animation or Status Icon */}
            <div className="flex justify-center">
              {isComplete ? (
                <StatusIcon type={status.type} />
              ) : (
                <LoadingSpinner />
              )}
            </div>

            {/* Progress Bar */}
            {!isComplete && (
              <div className="space-y-3">
                <ProgressBar progress={progress} />
                <div className="text-center">
                  <span className="text-sm text-gray-400 font-medium">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
            )}

            {/* Status Message */}
            <StatusMessage 
              message={status.message}
              submessage={status.submessage}
            />

            {/* Loading Dots */}
            {!isComplete && (
              <div className="flex justify-center pt-2">
                <LoadingDots />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm font-medium">
            ระบบจัดการชมรมและกิจกรรมภายในมหาวิทยาลัย
          </p>
          <p className="text-gray-300 text-xs mt-1">
            Club & Event Management System in University
          </p>
        </div>
      </div>

      {/* Subtle Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Background Circles */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#FFB200]/8 to-[#EB5B00]/6 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[#640D5F]/8 to-[#D91656]/6 rounded-full blur-3xl"></div>
        
        {/* Additional subtle elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#640D5F]/3 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-[#D91656]/3 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
}

export default GoogleCallbackPage;