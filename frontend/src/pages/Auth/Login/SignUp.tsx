import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { API_BASE_URL, signup } from '../../../services/http';
import { useNavigate } from 'react-router-dom';

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
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[#640D5F] border-r-[#D91656] rounded-full animate-spin"></div>
            
            <div className="absolute inset-2 w-12 h-12 border-2 border-transparent border-b-[#EB5B00] border-l-[#FFB200] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-gradient-to-br from-[#D91656] via-[#EB5B00] to-[#FFB200] rounded-full animate-pulse shadow-lg"></div>
            </div>
            
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
                    <div className="flex justify-center">
                        {isComplete ? (
                            (status.type === 'success' || status.type === 'error') ? (
                                <StatusIcon type={status.type} />
                            ) : null
                        ) : (
                            <ModernLoadingSpinner />
                        )}
                    </div>

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

                    <StatusMessage 
                        message={status.message}
                        submessage={status.submessage}
                    />

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
    const [showLoadingModal, setShowLoadingModal] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<{
        message: string;
        submessage?: string;
        type: 'success' | 'error' | 'loading';
    }>({
        message: 'กำลังสร้างบัญชีผู้ใช้',
        submessage: 'โปรดรอสักครู่...',
        type: 'loading'
    });
    const [isComplete, setIsComplete] = useState(false);

    interface SignUpFormData {
        firstName: string;
        lastName: string;
        studentId: string;
        email: string;
        password: string;
        confirmPassword: string;
        agreeToTerms: boolean;
    }

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev: SignUpFormData) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSignInGoogle = () => {
        window.location.href = `${API_BASE_URL}/auth/google`;
    };

    const ErrorIcon: React.FC = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );

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

    const showSignupSuccess = () => {
        setShowLoadingModal(true);
        setIsLoading(true);
        setIsComplete(false);
        setProgress(0);
        
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
            message: 'กำลังสร้างบัญชีผู้ใช้',
            submessage: 'กำลังประมวลผลข้อมูล',
            type: 'loading'
        });

        setTimeout(() => {
            setStatus({
                message: 'กำลังตรวจสอบข้อมูล',
                submessage: 'ยืนยันข้อมูลผู้ใช้',
                type: 'loading'
            });
        }, 1000);

        setTimeout(() => {
            setStatus({
                message: 'กำลังเตรียมข้อมูล',
                submessage: 'เตรียมข้อมูลสำหรับเข้าสู่ระบบ',
                type: 'loading'
            });
            
            saveLoginDataToSession();
        }, 2000);

        setTimeout(() => {
            clearInterval(progressInterval);
            setIsComplete(true);
            setStatus({
                message: 'สมัครสมาชิกสำเร็จ!',
                submessage: 'กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี',
                type: 'success'
            });
        }, 3000);

        setTimeout(() => {
            setShowLoadingModal(false);
            setIsLoading(false);
            navigate('/login');
        }, 5000);
    };

    const showSignupError = (errorMessage: string) => {
        setShowLoadingModal(true);
        setIsComplete(true);
        setStatus({
            message: 'สมัครสมาชิกไม่สำเร็จ',
            submessage: errorMessage,
            type: 'error'
        });

        setTimeout(() => {
            setShowLoadingModal(false);
        }, 4000);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

        try {
            await signup({
                FirstName: formData.firstName,
                LastName: formData.lastName,
                StudentID: formData.studentId,
                Email: formData.email,
                Password: formData.password,
            });

            showSignupSuccess();

        } catch (error: any) {
            const errorMessage = error?.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก";
            setErrors({ general: errorMessage });
            showSignupError(errorMessage);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#640D5F] via-[#D91656] to-[#EB5B00] relative overflow-hidden">
            <LoadingModal 
                isOpen={showLoadingModal}
                status={status}
                progress={progress}
                isComplete={isComplete}
            />

            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-20 w-32 h-32 bg-[#FFB200] opacity-20 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute top-40 right-32 w-24 h-24 bg-white opacity-15 rounded-full blur-lg animate-bounce"></div>
                <div className="absolute bottom-32 left-40 w-40 h-40 bg-[#EB5B00] opacity-15 rounded-full blur-2xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-20 right-20 w-28 h-28 bg-[#FFB200] opacity-25 rounded-full blur-xl animate-bounce delay-500"></div>
            </div>

            <div className="relative z-10 min-h-screen flex">
                <div className="hidden lg:flex lg:flex-1 flex-col justify-center items-start p-16 text-white">
                    <div className="max-w-lg">
                        <div className="mb-4">
                            <div className="text-sm font-medium text-white/80 tracking-wider uppercase mb-4">
                                CLUB & EVENT MANAGEMENT SYSTEM IN UNIVERSITY
                            </div>
                            <div className="w-16 h-1 bg-[#FFB200] rounded-full mb-8"></div>
                        </div>
                        
                        <h1 className="text-6xl font-bold mb-4">
                            Welcome to
                        </h1>
                        <h2 className="text-7xl font-bold mb-8 bg-gradient-to-r from-[#FFB200] to-white bg-clip-text text-transparent">
                            CEMS
                        </h2>
                        
                        <p className="text-xl text-white/90 leading-relaxed mb-12 max-w-md">
                            Level up your campus life — create your account.
                        </p>
                    </div>
                </div>

                {/* Right Side - Signup Form */}
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="w-full max-w-lg">
                        <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
                            {/* Form Header */}
                            <div className="px-8 pt-8 pb-6">
                                {/* Mobile Logo */}
                                <div className="lg:hidden text-center mb-6">
                                    <h1 className="text-3xl font-bold text-[#640D5F] mb-1">CEMS</h1>
                                    <p className="text-gray-500 text-sm">Club & Event Management System</p>
                                </div>

                                <div className="text-center lg:text-left">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign Up</h2>
                                    <p className="text-gray-600">Enter your account details</p>
                                </div>
                            </div>

                            <form className="px-8 pb-8 space-y-6" onSubmit={handleSubmit}>
                                {/* Name Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            First Name
                                        </label>
                                        <div className="relative">
                                        <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-4 border-0 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-[#D91656] focus:bg-white transition-all duration-200 placeholder-gray-400 ${
                                                    errors.firstName ? 'ring-2 ring-red-300 bg-red-50' : ''
                                                }`}
                                                placeholder="Enter first name"
                                            />
                                        </div>
                                        {errors.firstName && (
                                            <p className="text-red-500 text-xs mt-2 ml-1">{errors.firstName}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Last Name
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-4 border-0 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-[#D91656] focus:bg-white transition-all duration-200 placeholder-gray-400 ${
                                                    errors.lastName ? 'ring-2 ring-red-300 bg-red-50' : ''
                                                }`}
                                                placeholder="Enter last name"
                                            />
                                        </div>
                                        {errors.lastName && (
                                            <p className="text-red-500 text-xs mt-2 ml-1">{errors.lastName}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Student ID */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Student ID
                                    </label>
                                    <input
                                        type="text"
                                        name="studentId"
                                        value={formData.studentId}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-4 border-0 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-[#D91656] focus:bg-white transition-all duration-200 placeholder-gray-400 ${
                                            errors.studentId ? 'ring-2 ring-red-300 bg-red-50' : ''
                                        }`}
                                        placeholder="Enter your student ID"
                                    />
                                    {errors.studentId && (
                                        <p className="text-red-500 text-xs mt-2 ml-1">{errors.studentId}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email or Student ID
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-4 border-0 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-[#D91656] focus:bg-white transition-all duration-200 placeholder-gray-400 ${
                                            errors.email ? 'ring-2 ring-red-300 bg-red-50' : ''
                                        }`}
                                        placeholder="Enter your email or student ID"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-xs mt-2 ml-1">{errors.email}</p>
                                    )}
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-4 pr-12 border-0 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-[#D91656] focus:bg-white transition-all duration-200 placeholder-gray-400 ${
                                                errors.password ? 'ring-2 ring-red-300 bg-red-50' : ''
                                            }`}
                                            placeholder="Enter your password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-red-500 text-xs mt-2 ml-1">{errors.password}</p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-4 pr-12 border-0 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-[#D91656] focus:bg-white transition-all duration-200 placeholder-gray-400 ${
                                                errors.confirmPassword ? 'ring-2 ring-red-300 bg-red-50' : ''
                                            }`}
                                            placeholder="Confirm your password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-red-500 text-xs mt-2 ml-1">{errors.confirmPassword}</p>
                                    )}
                                </div>

                                {/* Terms */}
                                <div>
                                    <label className="flex items-start space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="agreeToTerms"
                                            checked={formData.agreeToTerms}
                                            onChange={handleInputChange}
                                            className="w-5 h-5 text-[#D91656] border-2 border-gray-300 rounded-lg focus:ring-[#D91656] focus:ring-2 mt-0.5"
                                        />
                                        <span className="text-sm text-gray-600 leading-relaxed">
                                            I agree to the{' '}
                                            <a href="/signup" className="text-[#D91656] hover:text-[#640D5F] font-semibold underline decoration-2">
                                                Terms and Conditions
                                            </a>{' '}
                                            and{' '}
                                            <a href="/signup" className="text-[#D91656] hover:text-[#640D5F] font-semibold underline decoration-2">
                                                Privacy Policy
                                            </a>
                                        </span>
                                    </label>
                                    {errors.agreeToTerms && (
                                        <p className="text-red-500 text-xs mt-2 ml-1">{errors.agreeToTerms}</p>
                                    )}
                                </div>

                                {/* Error Message */}
                                {errors.general && (
                                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-2xl text-sm">
                                        <div className="flex items-center">
                                            <ErrorIcon />
                                            <span className="ml-2">{errors.general}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-[#640D5F] to-[#D91656] text-white py-4 px-6 rounded-2xl font-semibold hover:from-[#D91656] hover:to-[#EB5B00] focus:outline-none focus:ring-4 focus:ring-[#D91656]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center space-x-3">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Sign Up</span>
                                        </div>
                                    ) : (
                                        'Sign Up'
                                    )}
                                </button>

                                {/* Divider */}
                                <div className="mt-8 mb-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200"></div>
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-4 bg-[red-300] text-gray-500">or</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Google Button */}
                                <button
                                    type="button"
                                    onClick={handleSignInGoogle}
                                    className="w-full bg-white border-2 border-gray-200 text-gray-700 py-4 px-6 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Continue with Google
                                </button>


                                <div className="text-center pt-6 border-t border-gray-100">
                                    <p className="text-gray-600">
                                        Don't have an account?{' '}
                                        <a href="/login" className="text-[#D91656] hover:text-[#640D5F] font-semibold underline decoration-2">
                                            Sign in
                                        </a>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default SignUp;