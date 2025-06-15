import { useEffect, useState } from 'react';

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
        <div className={`flex items-center justify-center group cursor-pointer ${className}`} onClick={handleClick}>
            <div className="relative">
                <svg className="h-14 w-14 transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12" viewBox="0 0 80 80" fill="none">
                    <defs>
                        <linearGradient id="logoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#640D5F" />
                            <stop offset="50%" stopColor="#D91656" />
                            <stop offset="100%" stopColor="#EB5B00" />
                        </linearGradient>
                        
                        <linearGradient id="logoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#D91656" />
                            <stop offset="100%" stopColor="#FFB200" />
                        </linearGradient>
                        
                        <filter id="logoShadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#640D5F" floodOpacity="0.3" />
                        </filter>
                    </defs>
                    
                    <g transform="translate(10, 10)" filter="url(#logoShadow)">
                        <polygon points="30,8 52,28 30,72 8,28" fill="url(#logoGrad1)" className="transition-all duration-500" />
                        <polygon points="30,8 72,28 52,28" fill="url(#logoGrad2)" className="transition-all duration-500" />
                        <polygon points="52,28 72,28 30,72" fill="url(#logoGrad1)" className="transition-all duration-500 opacity-80" />
                    </g>
                </svg>
                
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#640D5F] via-[#D91656] to-[#FFB200] opacity-0 group-hover:opacity-30 transition-all duration-500 blur-2xl animate-pulse"></div>
            </div>
            
            <div className="ml-4">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#640D5F] via-[#D91656] to-[#EB5B00] select-none tracking-tight">
                    CEMS
                </span>
            </div>
        </div>
    )
}

// Skeleton Loading Components
const SkeletonBar = ({ width = '100%', height = '16px', delay = 0 }) => (
    <div 
        className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse"
        style={{ 
            width, 
            height, 
            animationDelay: `${delay}ms`,
            animationDuration: '1.8s'
        }}
    >
        <div className="h-full bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-lg animate-shimmer"></div>
    </div>
);

const SkeletonCircle = ({ size = '48px', delay = 0 }) => (
    <div 
        className="bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 rounded-full animate-pulse flex-shrink-0"
        style={{ 
            width: size, 
            height: size, 
            animationDelay: `${delay}ms`,
            animationDuration: '2s'
        }}
    >
        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full animate-shimmer"></div>
    </div>
);

const LoadingDots = () => {
    return (
        <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className="w-3 h-3 bg-gradient-to-r from-[#640D5F] to-[#D91656] rounded-full animate-bounce shadow-lg"
                    style={{ 
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: '1s'
                    }}
                />
            ))}
        </div>
    );
};

const ModernProgressBar = ({ progress }: { progress: number }) => {
    return (
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner relative">
            <div
                className="h-full bg-gradient-to-r from-[#640D5F] via-[#D91656] to-[#FFB200] transition-all duration-700 ease-out rounded-full relative overflow-hidden"
                style={{ width: `${progress}%` }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white/30 to-transparent"></div>
            </div>
        </div>
    );
};

const StatusMessage = ({ message, submessage }: { message: string; submessage?: string }) => {
    return (
        <div className="text-center space-y-3 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                {message}
            </h2>
            {submessage && (
                <p className="text-gray-500 text-base leading-relaxed max-w-sm mx-auto">
                    {submessage}
                </p>
            )}
        </div>
    );
};

const ModernLoadingSpinner = () => {
    return (
        <div className="relative flex items-center justify-center">
            {/* Outer rotating ring */}
            <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
            
            {/* Main spinning ring */}
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-[#640D5F] border-r-[#D91656] rounded-full animate-spin"></div>
            
            {/* Inner pulse ring */}
            <div className="absolute inset-2 w-16 h-16 border-2 border-transparent border-b-[#EB5B00] border-l-[#FFB200] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            
            {/* Center gradient dot */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-gradient-to-br from-[#D91656] via-[#EB5B00] to-[#FFB200] rounded-full animate-pulse shadow-lg"></div>
            </div>
            
            {/* Outer glow effect */}
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-r from-[#640D5F]/20 to-[#D91656]/20 animate-ping"></div>
        </div>
    );
};

const StatusIcon = ({ type }: { type: 'success' | 'error' | 'loading' }) => {
    if (type === 'success') {
        return (
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-6 animate-bounceIn shadow-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            </div>
        );
    }
    
    if (type === 'error') {
        return (
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-6 animate-bounceIn shadow-lg">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>
        );
    }
    
    return null;
};

// Skeleton Content Component
const SkeletonContent = () => (
    <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center space-x-4">
            <SkeletonCircle size="64px" />
            <div className="flex-1 space-y-3">
                <SkeletonBar width="75%" height="20px" />
                <SkeletonBar width="50%" height="16px" delay={100} />
            </div>
        </div>
        
        <div className="space-y-3">
            <SkeletonBar width="100%" height="12px" delay={200} />
            <SkeletonBar width="80%" height="12px" delay={300} />
            <SkeletonBar width="60%" height="12px" delay={400} />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
            <SkeletonBar width="100%" height="40px" delay={500} />
            <SkeletonBar width="100%" height="40px" delay={600} />
            <SkeletonBar width="100%" height="40px" delay={700} />
        </div>
    </div>
);

function GoogleCallbackPage() {
    // Simulate navigation function
    const navigate = (path: string) => {
        console.log(`Navigating to: ${path}`);
        // In a real app, this would use react-router-dom
        window.location.href = path;
    };
    const [progress, setProgress] = useState(0);
    const [showSkeleton, setShowSkeleton] = useState(true);
    const [status, setStatus] = useState<{
        message: string;
        submessage?: string;
        type: 'success' | 'error' | 'loading';
    }>({
        message: 'กำลังเชื่อมต่อ',
        submessage: 'โปรดรอสักครู่...',
        type: 'loading'
    });
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        console.log("GoogleCallbackPage mounted");

        // Hide skeleton after initial loading
        setTimeout(() => setShowSkeleton(false), 1200);

        // Smooth progress animation
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + Math.random() * 6 + 3;
            });
        }, 150);

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
        }, 1000);

        setTimeout(() => {
            setStatus({
                message: 'กำลังโหลดข้อมูล',
                submessage: 'เตรียมข้อมูลผู้ใช้งานและสิทธิ์การเข้าถึง',
                type: 'loading'
            });
        }, 2200);

        if (token) {
            localStorage.setItem("authToken", token);
            localStorage.setItem("userId", id ?? "");
            localStorage.setItem("role", role ?? "");
            localStorage.setItem("isLogin", "true");

            setTimeout(() => {
                setIsComplete(true);
                setStatus({
                    message: 'เข้าสู่ระบบสำเร็จ!',
                    submessage: 'กำลังเปลี่ยนเส้นทางไปยังหน้าหลัก',
                    type: 'success'
                });
                setTimeout(() => navigate("/"), 800);
            }, 3000);
        } else {
            setTimeout(() => {
                setIsComplete(true);
                setStatus({
                    message: 'เกิดข้อผิดพลาด',
                    submessage: 'กำลังเปลี่ยนเส้นทางไปยังหน้าเข้าสู่ระบบ',
                    type: 'error'
                });
                setTimeout(() => navigate("/login"), 1200);
            }, 3000);
        }

        return () => clearInterval(progressInterval);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#FFB200]/10 via-[#EB5B00]/8 to-transparent rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-[#640D5F]/10 via-[#D91656]/8 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/3 left-1/3 w-40 h-40 bg-[#640D5F]/5 rounded-full blur-2xl animate-ping" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-1/3 right-1/3 w-32 h-32 bg-[#D91656]/5 rounded-full blur-2xl animate-ping" style={{ animationDelay: '3s' }}></div>
            </div>

            {/* Main Container */}
            <div className="w-full max-w-lg relative z-10">
                {/* Logo Section */}
                <div className="text-center mb-16 animate-fadeIn">
                    <CEMSLogo className="justify-center" />
                </div>

                {/* Loading Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-white/20 transition-all duration-500 hover:shadow-3xl">
                    {showSkeleton ? (
                        <SkeletonContent />
                    ) : (
                        <div className="space-y-8">
                            {/* Loading Animation or Status Icon */}
                            <div className="flex justify-center">
                                {isComplete ? (
                                    <StatusIcon type={status.type} />
                                ) : (
                                    <ModernLoadingSpinner />
                                )}
                            </div>

                            {/* Progress Bar */}
                            {!isComplete && (
                                <div className="space-y-4">
                                    <ModernProgressBar progress={progress} />
                                    <div className="text-center">
                                        <span className="text-sm text-gray-500 font-semibold bg-gray-100 px-3 py-1 rounded-full">
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
                                <div className="flex justify-center pt-4">
                                    <LoadingDots />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-12 space-y-2 animate-fadeIn">
                    <p className="text-gray-500 text-sm font-semibold">
                        ระบบจัดการชมรมและกิจกรรมภายในมหาวิทยาลัย
                    </p>
                    <p className="text-gray-400 text-xs">
                        Club & Event Management System in University
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes bounceIn {
                    0% { opacity: 0; transform: scale(0.3); }
                    50% { opacity: 1; transform: scale(1.05); }
                    70% { transform: scale(0.9); }
                    100% { opacity: 1; transform: scale(1); }
                }
                
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                
                .animate-bounceIn {
                    animation: bounceIn 0.6s ease-out forwards;
                }
                
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
                
                .shadow-3xl {
                    box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
                }
            `}</style>
        </div>
    );
}

export default GoogleCallbackPage;