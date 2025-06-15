import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { API_BASE_URL, login } from '../../../services/http';
import { useNavigate } from 'react-router-dom';

// Loading Components from GoogleCallbackPage
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
            <h2 className="text-xl font-bold text-gray-800 leading-tight">
                {message}
            </h2>
            {submessage && (
                <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
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
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            
            {/* Main spinning ring */}
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[#640D5F] border-r-[#D91656] rounded-full animate-spin"></div>
            
            {/* Inner pulse ring */}
            <div className="absolute inset-2 w-12 h-12 border-2 border-transparent border-b-[#EB5B00] border-l-[#FFB200] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            
            {/* Center gradient dot */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-gradient-to-br from-[#D91656] via-[#EB5B00] to-[#FFB200] rounded-full animate-pulse shadow-lg"></div>
            </div>
            
            {/* Outer glow effect */}
            <div className="absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-r from-[#640D5F]/20 to-[#D91656]/20 animate-ping"></div>
        </div>
    );
};

const StatusIcon = ({ type }: { type: 'success' | 'error' }) => {
    if (type === 'success') {
        return (
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center animate-bounceIn shadow-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            </div>
        );
    }
    
    if (type === 'error') {
        return (
            <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center animate-bounceIn shadow-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>
        );
    }
    
    return null;
};

// Loading Modal Component
const LoadingModal = ({ 
    isOpen, 
    status, 
    progress, 
    isComplete 
}: { 
    isOpen: boolean;
    status: { message: string; submessage?: string; type: 'success' | 'error' | 'loading' };
    progress: number;
    isComplete: boolean;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-sm w-full border border-white/30">
                <div className="space-y-6">
                    {/* Loading Animation or Status Icon */}
                    <div className="flex justify-center">
                        {isComplete ? (
                            (status.type === 'success' || status.type === 'error') ? (
                                <StatusIcon type={status.type} />
                            ) : null
                        ) : (
                            <ModernLoadingSpinner />
                        )}
                    </div>

                    {/* Progress Bar */}
                    {!isComplete && (
                        <div className="space-y-3">
                            <ModernProgressBar progress={progress} />
                            <div className="text-center">
                                <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-1 rounded-full">
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
                        <div className="flex justify-center">
                            <LoadingDots />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        identifier: "",
        password: "",
        rememberMe: false,
    });

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
    
    // New loading system states
    const [showLoadingModal, setShowLoadingModal] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<{
        message: string;
        submessage?: string;
        type: 'success' | 'error' | 'loading';
    }>({
        message: 'กำลังเข้าสู่ระบบ',
        submessage: 'โปรดรอสักครู่...',
        type: 'loading'
    });
    const [isComplete, setIsComplete] = useState(false);

    const loadLoginDataFromSession = () => {
        try {
            const savedData = sessionStorage.getItem('cems_login_prefill');

            if (savedData) {
                const parsedData = JSON.parse(savedData);
                const currentTime = Date.now();
                const fiveMinutesInMs = 5 * 60 * 1000; 

                if (parsedData.timestamp && (currentTime - parsedData.timestamp) <= fiveMinutesInMs) {
                    console.log('Loading saved login data from session');

                    setFormData(prev => ({
                        ...prev,
                        identifier: parsedData.identifier || "",
                        password: parsedData.password || ""
                    }));

                    sessionStorage.removeItem('cems_login_prefill');
                    console.log('Cleared login data from session storage');

                    return true;
                } else {
                    console.log('Saved login data has expired, removing...');
                    sessionStorage.removeItem('cems_login_prefill');
                }
            }

            return false;
        } catch (error) {
            console.error('Error loading login data from session:', error);
            sessionStorage.removeItem('cems_login_prefill');
            return false;
        }
    };

    useEffect(() => {
        const hasLoadedData = loadLoginDataFromSession();

        if (hasLoadedData) {
            console.log('Auto-filled login form with signup data');
        }
    }, []);

    const clearSessionData = () => {
        try {
            sessionStorage.removeItem('cems_login_prefill');
            console.log('Manually cleared login session data');
        } catch (error) {
            console.error('Error clearing session data:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const showLoginSuccess = () => {
        setShowLoadingModal(true);
        setIsLoading(true);
        setIsComplete(false);
        setProgress(0);
        
        // Progress animation
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + Math.random() * 8 + 5;
            });
        }, 150);

        setStatus({
            message: 'กำลังเข้าสู่ระบบ',
            submessage: 'กำลังตรวจสอบข้อมูลการเข้าสู่ระบบ',
            type: 'loading'
        });

        setTimeout(() => {
            setStatus({
                message: 'กำลังยืนยันตัวตน',
                submessage: 'ตรวจสอบสิทธิ์การเข้าถึง',
                type: 'loading'
            });
        }, 1000);

        setTimeout(() => {
            setStatus({
                message: 'กำลังโหลดข้อมูล',
                submessage: 'เตรียมข้อมูลผู้ใช้งาน',
                type: 'loading'
            });
        }, 2000);

        setTimeout(() => {
            clearInterval(progressInterval);
            setIsComplete(true);
            setStatus({
                message: 'เข้าสู่ระบบสำเร็จ!',
                submessage: 'กำลังนำคุณไปยังหน้าหลัก',
                type: 'success'
            });
        }, 3000);

        setTimeout(() => {
            setShowLoadingModal(false);
            setIsLoading(false);
            navigate('/');
        }, 4500);
    };

    const showLoginError = (errorMessage: string) => {
        setShowLoadingModal(true);
        setIsComplete(true);
        setStatus({
            message: 'เข้าสู่ระบบไม่สำเร็จ',
            submessage: errorMessage,
            type: 'error'
        });

        setTimeout(() => {
            setShowLoadingModal(false);
        }, 3000);
    };

    const handleLoginGoogle = () => {
        window.location.href = `${API_BASE_URL}/auth/google`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({}); 

        const newErrors: { identifier?: string; password?: string } = {};

        if (!formData.identifier) {
            newErrors.identifier = "Please enter Student ID or Email";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const response = await login({
                identifier: formData.identifier,
                password: formData.password,
            });

            if (response?.token) {
                localStorage.setItem("token", response.token);
                localStorage.setItem("userId", response.user?.id !== undefined && response.user?.id !== null ? String(response.user.id) : "");
                localStorage.setItem("role", response.user?.role || "user");
                localStorage.setItem("isLogin", "true");

                clearSessionData();
                showLoginSuccess();
            }
        } catch (error: any) {
            const errorMessage = error?.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
            setErrors({ password: errorMessage });
            showLoginError(errorMessage);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 relative overflow-hidden flex items-center justify-center p-4">
            <style>{`
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes pulse-gentle {
                    0%, 100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.8;
                        transform: scale(1.05);
                    }
                }
                
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }

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
                
                .animate-slideInRight {
                    animation: slideInRight 0.5s ease-out;
                }
                
                .animate-pulse-gentle {
                    animation: pulse-gentle 2s ease-in-out infinite;
                }
                
                .animate-float {
                    animation: float 6s ease-in-out infinite;
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
            `}</style>

            {/* Loading Modal */}
            <LoadingModal 
                isOpen={showLoadingModal}
                status={status}
                progress={progress}
                isComplete={isComplete}
            />

            {/* Animated Wave Background */}
            <div className="absolute inset-0">
                {/* Base gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-[#640D5F] to-[#D91656]"></div>
                
                {/* Flowing wave layers */}
                <div className="absolute inset-0">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#640D5F" stopOpacity="0.8" />
                                <stop offset="50%" stopColor="#D91656" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#EB5B00" stopOpacity="0.4" />
                            </linearGradient>
                            <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FFB200" stopOpacity="0.6" />
                                <stop offset="50%" stopColor="#640D5F" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#D91656" stopOpacity="0.3" />
                            </linearGradient>
                            <linearGradient id="wave3" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#EB5B00" stopOpacity="0.4" />
                                <stop offset="50%" stopColor="#FFB200" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#640D5F" stopOpacity="0.2" />
                            </linearGradient>
                        </defs>

                        <path d="M0,400 C300,200 600,600 1200,300 L1200,800 L0,800 Z" fill="url(#wave1)">
                            <animate attributeName="d"
                                values="M0,400 C300,200 600,600 1200,300 L1200,800 L0,800 Z;
                        M0,300 C300,500 600,100 1200,400 L1200,800 L0,800 Z;
                        M0,400 C300,200 600,600 1200,300 L1200,800 L0,800 Z"
                                dur="10s" repeatCount="indefinite" />
                        </path>

                        <path d="M0,500 C400,300 800,700 1200,400 L1200,800 L0,800 Z" fill="url(#wave2)">
                            <animate attributeName="d"
                                values="M0,500 C400,300 800,700 1200,400 L1200,800 L0,800 Z;
                        M0,400 C400,600 800,200 1200,500 L1200,800 L0,800 Z;
                        M0,500 C400,300 800,700 1200,400 L1200,800 L0,800 Z"
                                dur="8s" repeatCount="indefinite" />
                        </path>

                        <path d="M0,600 C350,400 750,800 1200,500 L1200,800 L0,800 Z" fill="url(#wave3)">
                            <animate attributeName="d"
                                values="M0,600 C350,400 750,800 1200,500 L1200,800 L0,800 Z;
                        M0,500 C350,700 750,300 1200,600 L1200,800 L0,800 Z;
                        M0,600 C350,400 750,800 1200,500 L1200,800 L0,800 Z"
                                dur="12s" repeatCount="indefinite" />
                        </path>
                    </svg>
                </div>

                {/* Additional gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#640D5F]/20 via-transparent to-[#D91656]/20"></div>
            </div>

            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Floating shapes */}
                <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-[#FFB200]/10 animate-float"></div>
                <div className="absolute top-40 right-32 w-24 h-24 rounded-full bg-[#EB5B00]/10 animate-float" style={{animationDelay: '2s'}}></div>
                <div className="absolute bottom-32 left-32 w-40 h-40 rounded-full bg-[#D91656]/10 animate-float" style={{animationDelay: '4s'}}></div>
                <div className="absolute bottom-20 right-20 w-28 h-28 rounded-full bg-[#640D5F]/10 animate-float" style={{animationDelay: '6s'}}></div>
            </div>

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-6xl">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl overflow-hidden">
                    <div className="flex min-h-[600px]">

                        {/* Left Side - Welcome Section */}
                        <div className="flex-1 bg-gradient-to-br from-[#640D5F] to-[#D91656] p-12 flex flex-col justify-center relative">
                            {/* Decorative elements */}
                            <div className="absolute top-8 left-8 w-16 h-16 rounded-full bg-white/10 animate-pulse"></div>
                            <div className="absolute bottom-8 right-8 w-12 h-12 rounded-full bg-[#FFB200]/20"></div>
                            
                            <div className="max-w-md relative z-10">
                                <div className="mb-8">
                                    <p className="text-sm text-white/80 uppercase tracking-widest mb-4 font-medium">Club & Event Management System in University</p>
                                    <div className="w-16 h-1 bg-[#FFB200] rounded-full"></div>
                                </div>

                                <h1 className="text-5xl font-bold text-white leading-tight mb-8">
                                    Welcome to<br />
                                    <span className="text-7xl font-bold mb-8 bg-gradient-to-r from-[#FFB200] to-white bg-clip-text text-transparent">CEMS</span>
                                </h1>

                                <p className="text-white/90 text-lg leading-relaxed mb-8">
                                    Login to access your account
                                </p>
                            </div>
                        </div>

                        {/* Right Side - Login Form */}
                        <div className="flex-1 bg-white p-12 flex flex-col justify-center">
                            <div className="max-w-sm mx-auto w-full">
                                {/* Header */}
                                <div className="mb-8">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Login</h2>
                                    <p className="text-gray-600">Enter your account details</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email or Student ID
                                        </label>
                                        <input
                                            type="text"
                                            name="identifier"
                                            id="identifier"
                                            value={formData.identifier}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border-0 border-b-2 bg-transparent focus:outline-none focus:border-[#640D5F] transition-all duration-200 ${errors.identifier ? 'border-red-400' : 'border-gray-200 focus:border-[#640D5F]'
                                                }`}
                                            placeholder="Enter your email or student ID"
                                        />
                                        {errors.identifier && (
                                            <p className="text-red-500 text-sm mt-1">{errors.identifier}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                id="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 pr-12 border-0 border-b-2 bg-transparent focus:outline-none transition-all duration-200 ${errors.password ? 'border-red-400' : 'border-gray-200 focus:border-[#640D5F]'
                                                    }`}
                                                placeholder="Enter your password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#640D5F] transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <a href="#" className="text-gray-500 hover:text-[#640D5F] transition-colors">
                                            Forgot Password?
                                        </a>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-[#640D5F] text-white py-3 px-6 rounded-full font-medium hover:bg-[#D91656] focus:outline-none focus:ring-2 focus:ring-[#640D5F]/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-2"></div>
                                                Login
                                            </div>
                                        ) : (
                                            'Login'
                                        )}
                                    </button>
                                </form>

                                {/* Divider */}
                                <div className="mt-8 mb-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200"></div>
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-4 bg-white text-gray-500">or</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Google Sign In */}
                                <button 
                                    type="button"
                                    className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 py-3 px-6 rounded-full font-medium transition-all duration-200 flex items-center justify-center mb-6"
                                    onClick={handleLoginGoogle}
                                >
                                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Continue with Google
                                </button>

                                {/* Sign Up Link */}
                                <div className="text-center">
                                    <p className="text-gray-600 text-sm">
                                        Don't have an account?{' '}
                                        <a href="/signup" className="text-[#640D5F] hover:text-[#D91656] font-medium transition-colors">
                                            Sign up
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;