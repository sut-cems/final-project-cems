import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { API_BASE_URL, login } from '../../../services/http';
import { useNavigate } from 'react-router-dom';
import CEMSLogo from '../../../components/Logo/CEMSLogo';

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

    // สถานะสำหรับแสดง message
    const [loginMessage, setLoginMessage] = useState('');
    const [loginStep, setLoginStep] = useState(0);

    // ฟังก์ชันสำหรับอ่านข้อมูลจาก SessionStorage
    const loadLoginDataFromSession = () => {
        try {
            const savedData = sessionStorage.getItem('cems_login_prefill');

            if (savedData) {
                const parsedData = JSON.parse(savedData);
                const currentTime = Date.now();
                const fiveMinutesInMs = 5 * 60 * 1000; // 5 นาที

                // ตรวจสอบว่าข้อมูลไม่เก่าเกิน 5 นาที
                if (parsedData.timestamp && (currentTime - parsedData.timestamp) <= fiveMinutesInMs) {
                    console.log('Loading saved login data from session');

                    // กรอกข้อมูลลงในฟอร์ม
                    setFormData(prev => ({
                        ...prev,
                        identifier: parsedData.identifier || "",
                        password: parsedData.password || ""
                    }));

                    // แสดงข้อความแจ้งให้ผู้ใช้ทราบ
                    if (parsedData.fromSignup) {
                        setLoginMessage('ข้อมูลการเข้าสู่ระบบได้ถูกกรอกให้แล้วจากการสมัครสมาชิก!');

                        // ซ่อนข้อความหลัง 4 วินาที
                        setTimeout(() => {
                            setLoginMessage('');
                        }, 4000);
                    }

                    // ล้างข้อมูลทันทีหลังจากใช้แล้ว
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
            // ล้างข้อมูลที่เสียหายออก
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

    // ฟังก์ชันล้างข้อมูล SessionStorage ในกรณีฉุกเฉิน
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

    const ErrorIcon: React.FC = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );

    const getLoginMessageStyles = () => {
        switch (loginStep) {
            case 1: // กำลังเข้าสู่ระบบ
                return {
                    bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
                    border: 'border-l-4 border-blue-500',
                    icon: <LoadingSpinner />,
                    iconBg: 'bg-blue-100',
                    iconColor: 'text-blue-600'
                };
            case 2: // เข้าสู่ระบบสำเร็จ
                return {
                    bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
                    border: 'border-l-4 border-green-500',
                    icon: <CheckIcon />,
                    iconBg: 'bg-green-100',
                    iconColor: 'text-green-600'
                };
            case 3: // กำลังนำทางไปหน้าหลัก
                return {
                    bg: 'bg-gradient-to-r from-purple-50 to-pink-50',
                    border: 'border-l-4 border-purple-500',
                    icon: <CheckIcon />,
                    iconBg: 'bg-purple-100',
                    iconColor: 'text-purple-600'
                };
            case -1: // เข้าสู่ระบบไม่สำเร็จ
                return {
                    bg: 'bg-gradient-to-r from-red-50 to-pink-50',
                    border: 'border-l-4 border-red-500',
                    icon: <ErrorIcon />,
                    iconBg: 'bg-red-100',
                    iconColor: 'text-red-600'
                };
            default:
                return {
                    bg: 'bg-gradient-to-r from-green-50 to-blue-50',
                    border: 'border-l-4 border-green-500',
                    icon: <CheckIcon />,
                    iconBg: 'bg-green-100',
                    iconColor: 'text-green-600'
                };
        }
    };

    const showLoginSuccess = () => {
        setLoginStep(1);
        setLoginMessage('กำลังเข้าสู่ระบบ...');

        setTimeout(() => {
            setLoginStep(2);
            setLoginMessage('เข้าสู่ระบบสำเร็จ!');
        }, 1000);

        setTimeout(() => {
            setLoginStep(3);
            setLoginMessage('ยินดีต้อนรับ! กำลังนำคุณไปยังหน้าหลัก...');
        }, 2500);

        setTimeout(() => {
            setLoginMessage('');
            setLoginStep(0);
            navigate('/');
        }, 4000);
    };

    const showLoginError = (errorMessage: string) => {
        setLoginStep(-1);
        setLoginMessage(`เข้าสู่ระบบไม่สำเร็จ: ${errorMessage}`);

        setTimeout(() => {
            setLoginMessage('');
            setLoginStep(0);
        }, 4000);
    };

    const handleLoginGoogle = () => {
        window.location.href = `${API_BASE_URL}/auth/google`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({}); // Reset errors

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

        setIsLoading(true);

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
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
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
                
                .animate-slideInRight {
                    animation: slideInRight 0.5s ease-out;
                }
                
                .animate-pulse-gentle {
                    animation: pulse-gentle 2s ease-in-out infinite;
                }
            `}</style>

            {/* Login Status Message */}
            {loginMessage && (
                <div className="fixed top-4 right-4 z-50 animate-slideInRight">
                    <div className={`${getLoginMessageStyles().bg} ${getLoginMessageStyles().border} rounded-xl shadow-2xl p-4 max-w-sm backdrop-blur-sm border border-white/20`}>
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className={`w-10 h-10 rounded-full ${getLoginMessageStyles().iconBg} flex items-center justify-center ${loginStep === 1 ? 'animate-pulse-gentle' : ''}`}>
                                    <div className={getLoginMessageStyles().iconColor}>
                                        {getLoginMessageStyles().icon}
                                    </div>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                                    {loginMessage}
                                </p>
                                {loginStep === 3 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        โปรดรอสักครู่...
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Progress bar สำหรับ visual feedback */}
                        {loginStep > 0 && (
                            <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${loginStep === 1 ? 'bg-blue-500 w-1/3' :
                                            loginStep === 2 ? 'bg-green-500 w-2/3' :
                                                loginStep === 3 ? 'bg-purple-500 w-full' :
                                                    'bg-red-500 w-full'
                                        }`}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Animated Background */}
            <div className="absolute inset-0">
                {/* Main flowing waves */}
                <div className="absolute inset-0 opacity-80">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 transform skew-y-12 scale-150"></div>
                </div>

                {/* Flowing wave layers */}
                <div className="absolute inset-0">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
                                <stop offset="50%" stopColor="#EC4899" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#F97316" stopOpacity="0.4" />
                            </linearGradient>
                            <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
                                <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#EC4899" stopOpacity="0.3" />
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
                    </svg>
                </div>

                {/* Additional gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-orange-900/30"></div>
            </div>

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-6xl">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                    <div className="flex min-h-[600px]">

                        {/* Left Side - Quote Section */}
                        <div className="flex-1 p-12 flex flex-col justify-center relative">
                            {/* Brand */}
                            <div className="absolute top-8 left-8">
                                <h2 className="text-2xl font-bold text-white">CEMS.</h2>
                            </div>

                            <div className="max-w-md">
                                <div className="mb-8">
                                    <p className="text-sm text-white/70 uppercase tracking-widest mb-6">STUDENT LIFE STARTS HERE</p>
                                </div>

                                <h1 className="text-5xl font-bold text-white leading-tight mb-8">
                                    Join<br />
                                    Discover<br />
                                    Belong
                                </h1>

                                <p className="text-white/80 text-lg leading-relaxed">
                                    One place for all your passions — explore clubs, join activities,<br />
                                    and feel connected to your campus like never before.
                                </p>
                            </div>
                        </div>

                        {/* Right Side - Login Form */}
                        <div className="flex-1 bg-white rounded-r-3xl p-12 flex flex-col justify-center">
                            {/* Brand Logo */}
                            <CEMSLogo className="cursor-pointer hover:opacity-80 transition-opacity" />


                            <div className="max-w-sm mx-auto w-full">
                                {/* Header */}
                                <div className="mb-8 mt-4">
                                    <h2 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                                    <p className="text-gray-600">กรอกอีเมลและรหัสผ่านเพื่อเข้าถึงบัญชีของคุณ</p>
                                </div>

                                    <div className="space-y-6">
                                        {/* Email Field */}
                                        <div className="mb-4">
                                            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                                                Student ID or Email
                                            </label>
                                            <input
                                                type="text"
                                                name="identifier"
                                                id="identifier"
                                                value={formData.identifier}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.identifier ? 'border-red-300 bg-red-50' : 'bg-gray-50 hover:bg-white focus:bg-white'
                                                    }`}
                                                placeholder="Enter your Student ID or Email"
                                            />
                                            {errors.identifier && (
                                                <p className="text-red-500 text-sm mt-1">{errors.identifier}</p>
                                            )}
                                        </div>

                                        {/* Password Field */}
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
                                                    className={`w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.password ? 'border-red-300 bg-red-50' : 'bg-gray-50 hover:bg-white focus:bg-white'
                                                        }`}
                                                    placeholder="Enter your password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                            {errors.password && (
                                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                            )}
                                        </div>

                                        {/* Remember Me & Forgot Password */}
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="rememberMe"
                                                    checked={formData.rememberMe}
                                                    onChange={handleInputChange}
                                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">Remember me</span>
                                            </label>
                                            <a href="#" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                                                Forgot Password
                                            </a>
                                        </div>

                                        {/* Sign In Button */}
                                        <button
                                            disabled={isLoading}
                                            className="w-full bg-black text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                                            onClick={handleSubmit}
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-2"></div>
                                                    Sign In
                                                </div>
                                            ) : (
                                                'Sign In'
                                            )}
                                        </button>

                                        {/* Google Sign In */}
                                        <button className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center"
                                            onClick={handleLoginGoogle}>
                                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            Sign In with Google
                                        </button>

                                        {/* Sign Up Link */}
                                        <div className="text-center">
                                            <p className="text-gray-600 text-sm">
                                                Don't have an account?{' '}
                                                <a href="/signup" className="text-purple-600 hover:text-purple-700 font-medium">
                                                    Sign Up
                                                </a>
                                            </p>
                                        </div>
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