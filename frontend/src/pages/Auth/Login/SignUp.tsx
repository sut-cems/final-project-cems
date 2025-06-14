import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { API_BASE_URL, signup } from '../../../services/http';
import { useNavigate } from 'react-router-dom';
import CEMSLogo from '../../../components/Logo/CEMSLogo';

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        studentId: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<SignUpErrors>({});

    // Message system states
    const [signupMessage, setSignupMessage] = useState('');
    const [signupStep, setSignupStep] = useState(0);

    interface SignUpFormData {
        firstName: string;
        lastName: string;
        studentId: string;
        email: string;
        password: string;
        confirmPassword: string;
        agreeToTerms: boolean;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev: SignUpFormData) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    interface SignUpErrors {
        firstName?: string;
        lastName?: string;
        studentId?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
        agreeToTerms?: string;
        general?: string;
    }

    const handleSignInGoogle = () => {
        window.location.href = `${API_BASE_URL}/auth/google`;
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

    const getSignupMessageStyles = () => {
        switch (signupStep) {
            case 1: // Creating account
                return {
                    bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
                    border: 'border-l-4 border-blue-500',
                    icon: <LoadingSpinner />,
                    iconBg: 'bg-blue-100',
                    iconColor: 'text-blue-600'
                };
            case 2: // Account created successfully
                return {
                    bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
                    border: 'border-l-4 border-green-500',
                    icon: <CheckIcon />,
                    iconBg: 'bg-green-100',
                    iconColor: 'text-green-600'
                };
            case 3: // Preparing to redirect
                return {
                    bg: 'bg-gradient-to-r from-purple-50 to-pink-50',
                    border: 'border-l-4 border-purple-500',
                    icon: <LoadingSpinner />,
                    iconBg: 'bg-purple-100',
                    iconColor: 'text-purple-600'
                };
            case -1: // Error
                return {
                    bg: 'bg-gradient-to-r from-red-50 to-pink-50',
                    border: 'border-l-4 border-red-500',
                    icon: <ErrorIcon />,
                    iconBg: 'bg-red-100',
                    iconColor: 'text-red-600'
                };
            default:
                return {
                    bg: 'bg-white',
                    border: 'border-l-4 border-gray-500',
                    icon: <LoadingSpinner />,
                    iconBg: 'bg-gray-100',
                    iconColor: 'text-gray-600'
                };
        }
    };

    const saveLoginDataToSession = () => {
        try {
            const loginData = {
                identifier: formData.email || formData.studentId,
                password: formData.password,
                timestamp: Date.now(),
                fromSignup: true
            };
            
            sessionStorage.setItem('cems_login_prefill', JSON.stringify(loginData));
            
            console.log('Login data saved to session storage');
        } catch (error) {
            console.error('Error saving login data to session:', error);
        }
    };

    const handleSignupSuccess = () => {
        setSignupStep(1);
        setSignupMessage('กำลังสร้างบัญชีผู้ใช้...');

        setTimeout(() => {
            setSignupStep(2);
            setSignupMessage('สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี');
        }, 1500);

        setTimeout(() => {
            setSignupStep(3);
            setSignupMessage('กำลังเตรียมข้อมูลเข้าสู่ระบบ...');
            
            //เก็บข้อมูลใน SessionStorage
            saveLoginDataToSession();
        }, 3000);

        setTimeout(() => {
            setSignupMessage('กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...');
        }, 3500);

        setTimeout(() => {
            setSignupMessage('');
            setSignupStep(0);
            navigate('/login');
        }, 5000);
    };

    const handleSignupError = (errorMessage: string) => {
        setSignupStep(-1);
        setSignupMessage(errorMessage || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');

        setTimeout(() => {
            setSignupMessage('');
            setSignupStep(0);
        }, 4000);
    };

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        setErrors({});

        const newErrors: SignUpErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = "First name is required";
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = "Last name is required";
        }

        if (!formData.studentId.trim()) {
            newErrors.studentId = "Student ID is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = "Please agree to the terms and conditions";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        try {
            await signup({
                FirstName: formData.firstName,
                LastName: formData.lastName,
                StudentID: formData.studentId,
                Email: formData.email,
                Password: formData.password,
            });

            handleSignupSuccess();

        } catch (error: any) {
            handleSignupError(error?.message || "Registration failed");
            setErrors({ general: error?.message || "Registration failed" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <style>{`             
                .animate-slideInRight {
                    animation: slideInRight 0.5s ease-out;
                }
                
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
                
                .animate-pulse-gentle {
                    animation: pulse-gentle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                
                @keyframes pulse-gentle {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }
            `}</style>
            <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
                {/* Animated Background */}
                <div className="absolute inset-0">
                    {/* Main flowing waves */}
                    <div className="absolute inset-0 opacity-80">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#640D5F] via-[#D91656] to-[#EB5B00] transform skew-y-12 scale-150"></div>
                    </div>

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
                                    <stop offset="0%" stopColor="#D91656" stopOpacity="0.6" />
                                    <stop offset="50%" stopColor="#EB5B00" stopOpacity="0.5" />
                                    <stop offset="100%" stopColor="#FFB200" stopOpacity="0.3" />
                                </linearGradient>
                            </defs>

                            <path d="M0,400 C300,200 600,600 1200,300 L1200,800 L0,800 Z" fill="url(#wave1)">
                                <animate attributeName="d"
                                    values="M0,400 C300,200 600,600 1200,300 L1200,800 L0,800 Z;
                        M0,300 C300,500 600,100 1200,400 L1200,800 L0,800 Z;
                        M0,400 C300,200 600,600 1200,300 L1200,800 L0,800 Z"
                                    dur="12s" repeatCount="indefinite" />
                            </path>

                            <path d="M0,500 C400,300 800,700 1200,400 L1200,800 L0,800 Z" fill="url(#wave2)">
                                <animate attributeName="d"
                                    values="M0,500 C400,300 800,700 1200,400 L1200,800 L0,800 Z;
                        M0,400 C400,600 800,200 1200,500 L1200,800 L0,800 Z;
                        M0,500 C400,300 800,700 1200,400 L1200,800 L0,800 Z"
                                    dur="9s" repeatCount="indefinite" />
                            </path>
                        </svg>
                    </div>

                    {/* Additional gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#640D5F]/30 via-transparent to-[#FFB200]/30"></div>
                </div>

                {/* Enhanced Signup Message */}
                {signupMessage && (
                    <div className="fixed top-4 left-4 z-50 animate-slideInRight">
                        <div className={`${getSignupMessageStyles().bg} ${getSignupMessageStyles().border} rounded-xl shadow-2xl p-4 max-w-sm backdrop-blur-sm border border-white/20`}>
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className={`w-10 h-10 rounded-full ${getSignupMessageStyles().iconBg} flex items-center justify-center ${signupStep === 1 || signupStep === 3 ? 'animate-pulse-gentle' : ''}`}>
                                        <div className={getSignupMessageStyles().iconColor}>
                                            {getSignupMessageStyles().icon}
                                        </div>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                                        {signupMessage}
                                    </p>
                                    {signupStep === 3 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            กำลังเปลี่ยนเส้นทาง...
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Progress bar for visual feedback */}
                            {signupStep > 0 && signupStep !== -1 && (
                                <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${signupStep === 1 ? 'bg-blue-500 w-1/3' :
                                            signupStep === 2 ? 'bg-green-500 w-2/3' :
                                                signupStep === 3 ? 'bg-purple-500 w-full' :
                                                    'bg-gray-500 w-0'
                                            }`}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Main Container */}
                <div className="relative z-10 w-full max-w-7xl">
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                        <div className="flex min-h-[700px]">

                            {/* Left Side - Quote Section */}
                            <div className="flex-1 p-12 flex flex-col justify-center relative">
                                {/* Brand */}
                                <div className="absolute top-8 left-8">
                                    <h2 className="text-2xl font-bold text-white">CEMS.</h2>
                                </div>

                                <div className="max-w-md">
                                    <div className="mb-8">
                                        <p className="text-sm text-white/70 uppercase tracking-widest mb-6">UNLOCK YOUR CAMPUS LIFE</p>
                                    </div>

                                    <h1 className="text-5xl font-bold text-white leading-tight mb-8">
                                        Join<br />
                                        Grow<br />
                                        Shine
                                    </h1>

                                    <p className="text-white/80 text-lg leading-relaxed">
                                        Find your club. Join an event.<br />
                                        Earn your Activity Hours. Build your legacy.<br />
                                        All with CEMS.
                                    </p>
                                </div>

                            </div>

                            {/* Right Side - Sign Up Form */}
                            <div className="flex-1 bg-white rounded-r-3xl p-12 flex flex-col justify-center">
                                {/* Brand Logo */}
                                <CEMSLogo className="cursor-pointer hover:opacity-80 transition-opacity" />


                                <div className="max-w-sm mx-auto w-full">
                                    {/* Header */}
                                    <div className="mb-8 mt-4">
                                        <h2 className="text-4xl font-bold text-gray-900 mb-2">Create Account</h2>
                                        <p className="text-gray-600">กรอกรายละเอียดของคุณ</p>
                                    </div>

                                    <div className="space-y-5">
                                        {/* Name Fields */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                                                    First Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    id="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D91656] focus:border-transparent transition-all duration-200 ${errors.firstName ? 'border-red-300 bg-red-50' : 'bg-gray-50 hover:bg-white focus:bg-white'
                                                        }`}
                                                    placeholder="CEMS"
                                                />
                                                {errors.firstName && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Last Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    id="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D91656] focus:border-transparent transition-all duration-200 ${errors.lastName ? 'border-red-300 bg-red-50' : 'bg-gray-50 hover:bg-white focus:bg-white'
                                                        }`}
                                                    placeholder="SUT"
                                                />
                                                {errors.lastName && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Student ID Field */}
                                        <div>
                                            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
                                                Student ID
                                            </label>
                                            <input
                                                type="text"
                                                name="studentId"
                                                id="studentId"
                                                value={formData.studentId}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D91656] focus:border-transparent transition-all duration-200 ${errors.studentId ? 'border-red-300 bg-red-50' : 'bg-gray-50 hover:bg-white focus:bg-white'
                                                    }`}
                                                placeholder="Enter your Student ID"
                                            />
                                            {errors.studentId && (
                                                <p className="text-red-500 text-sm mt-1">{errors.studentId}</p>
                                            )}
                                        </div>

                                        {/* Email Field */}
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D91656] focus:border-transparent transition-all duration-200 ${errors.email ? 'border-red-300 bg-red-50' : 'bg-gray-50 hover:bg-white focus:bg-white'
                                                    }`}
                                                placeholder="cems@g.sut.ac.th"
                                            />
                                            {errors.email && (
                                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
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
                                                    className={`w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D91656] focus:border-transparent transition-all duration-200 ${errors.password ? 'border-red-300 bg-red-50' : 'bg-gray-50 hover:bg-white focus:bg-white'
                                                        }`}
                                                    placeholder="Create a strong password"
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
                                                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                                            )}
                                        </div>

                                        {/* Confirm Password Field */}
                                        <div>
                                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                                Confirm Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D91656] focus:border-transparent transition-all duration-200 ${errors.confirmPassword ? 'border-red-300 bg-red-50' : 'bg-gray-50 hover:bg-white focus:bg-white'
                                                        }`}
                                                    placeholder="Confirm your password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                            {errors.confirmPassword && (
                                                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                                            )}
                                        </div>

                                        {/* Terms and Conditions */}
                                        <div>
                                            <label className="flex items-start">
                                                <input
                                                    type="checkbox"
                                                    name="agreeToTerms"
                                                    checked={formData.agreeToTerms}
                                                    onChange={handleInputChange}
                                                    className="w-4 h-4 text-[#D91656] border-gray-300 rounded focus:ring-[#D91656] mt-1"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">
                                                    I agree to the{' '}
                                                    <a href="#" className="text-[#D91656] hover:text-[#640D5F] font-medium">
                                                        Terms and Conditions
                                                    </a>{' '}
                                                    and{' '}
                                                    <a href="#" className="text-[#D91656] hover:text-[#640D5F] font-medium">
                                                        Privacy Policy
                                                    </a>
                                                </span>
                                            </label>
                                            {errors.agreeToTerms && (
                                                <p className="text-red-500 text-sm mt-1">{errors.agreeToTerms}</p>
                                            )}
                                        </div>

                                        {/* General Error */}
                                        {errors.general && (
                                            <div className="text-red-500 text-sm text-center">{errors.general}</div>
                                        )}

                                        {/* Sign Up Button */}
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isLoading}
                                            className="w-full bg-gradient-to-r from-[#640D5F] to-[#D91656] text-white py-3 px-4 rounded-xl font-medium hover:from-[#D91656] hover:to-[#EB5B00] focus:outline-none focus:ring-2 focus:ring-[#D91656] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-2"></div>
                                                    Creating Account...
                                                </div>
                                            ) : (
                                                'Create Account'
                                            )}
                                        </button>

                                        {/* Google Sign Up */}
                                        <button
                                            type="button"
                                            className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center"
                                            onClick={handleSignInGoogle}
                                        >
                                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            Sign Up with Google
                                        </button>

                                        {/* Sign In Link */}
                                        <div className="text-center">
                                            <p className="text-gray-600 text-sm">
                                                Already have an account?{' '}
                                                <a href="/login" className="text-[#D91656] hover:text-[#640D5F] font-medium">
                                                    Sign In
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
        </>

    );
};

export default SignUp;