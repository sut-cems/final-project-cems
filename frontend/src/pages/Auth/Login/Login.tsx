import React, { useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { API_BASE_URL, login } from '../../../services/http';
import { CEMSLogoNoText } from '../../../components/Logo/CEMSLogo';

// Loading Components
const MinimalLoadingSpinner = () => {
    return (
        <div className="relative flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 w-6 h-6 border-2 border-transparent border-t-[#640D5F] rounded-full animate-spin"></div>
        </div>
    );
};

const MinimalProgressBar = ({ progress }: { progress: number }) => {
    return (
        <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
            <div
                className="h-full bg-[#640D5F] transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}

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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 max-w-xs w-full mx-4">
                <div className="space-y-4 text-center">
                    {/* Loading Animation or Status Icon */}
                    <div className="flex justify-center">
                        {isComplete ? (
                            (status.type === 'success' || status.type === 'error') ? (
                                <StatusIcon type={status.type} />
                            ) : null
                        ) : (
                            <MinimalLoadingSpinner />
                        )}
                    </div>

                    {/* Progress Bar */}
                    {!isComplete && (
                        <div className="space-y-2">
                            <MinimalProgressBar progress={progress} />
                            <div className="text-xs text-gray-500 font-medium">
                                {Math.round(progress)}%
                            </div>
                        </div>
                    )}

                    {/* Status Message */}
                    <div className="space-y-1">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                            {status.message}
                        </h3>
                        {status.submessage && (
                            <p className="text-xs sm:text-sm text-gray-500">
                                {status.submessage}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Login Modal Component
const LoginModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [formData, setFormData] = useState({
        identifier: "",
        password: "",
        rememberMe: false,
    });

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});

    // Loading system states
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
            onClose();
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
    
    const clearSessionData = () => {
        try {
            sessionStorage.removeItem('cems_login_prefill');
            console.log('Manually cleared login session data');
        } catch (error) {
            console.error('Error clearing session data:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const newErrors: { identifier?: string; password?: string } = {};

        if (!formData.identifier) {
            newErrors.identifier = "กรุณากรอกรหัสนักศึกษาหรืออีเมล";
        }

        if (!formData.password) {
            newErrors.password = "กรุณากรอกรหัสผ่าน";
        } else if (formData.password.length < 6) {
            newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
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
                setTimeout(() => {
                    window.location.reload();
                }, 4500);
            }
        } catch (error: any) {
            const errorMessage = error?.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
            setErrors({ password: errorMessage });
            showLoginError(errorMessage);
        }
    };
    
    if (!isOpen) return null;

    return (
        <>
            <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .floating-card {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05);
        }

        .input-focus:focus {
          outline: none;
          border-color: #640D5F;
          box-shadow: 0 0 0 3px rgba(100, 13, 95, 0.1);
        }

        .button-primary {
          background: #640D5F;
          transition: all 0.2s ease;
        }

        .button-primary:hover:not(:disabled) {
          background: #D91656;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(100, 13, 95, 0.2);
        }

        .button-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .button-secondary {
          background: white;
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
        }

        .button-secondary:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .checkbox-custom:checked {
          background-color: #640D5F;
          border-color: #640D5F;
        }
        
        /* Mobile specific improvements */
        @media (max-width: 640px) {
          .floating-card {
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05);
          }
        }
      `}</style>

            {/* Loading Modal */}
            <LoadingModal
                isOpen={showLoadingModal}
                status={status}
                progress={progress}
                isComplete={isComplete}
            />

            {/* Modal Backdrop */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/20 backdrop-blur-sm animate-fadeIn overflow-y-auto"
                onClick={onClose}
            >
                {/* Main Modal */}
                <div
                    className="relative w-full max-w-sm sm:max-w-md animate-slideUp my-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl floating-card overflow-hidden border border-white/20">

                        {/* Header */}
                        <div className="relative px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6 text-center border-b border-gray-50">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all duration-200 touch-manipulation"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Logo/Icon */}
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                <CEMSLogoNoText className="w-20 h-20 sm:w-25 sm:h-25" />
                            </div>

                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">ยินดีต้อนรับกลับ</h2>
                            <p className="text-gray-500 text-xs sm:text-sm">ลงชื่อเข้าใช้บัญชี CEMS ของคุณ</p>
                        </div>

                        {/* Form Content */}
                        <div className="p-4 sm:p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Email/Student ID Input */}
                                <div className="space-y-1">
                                    <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                                        อีเมลหรือรหัสนักศึกษา
                                    </label>
                                    <input
                                        type="text"
                                        name="identifier"
                                        id="identifier"
                                        value={formData.identifier}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl input-focus transition-all duration-200 placeholder-gray-400 text-gray-900 text-sm sm:text-base ${errors.identifier ? 'border-red-300 bg-red-50' : ''
                                            }`}
                                        placeholder="กรุณากรอกอีเมลหรือรหัสนักศึกษา"
                                    />
                                    {errors.identifier && (
                                        <p className="text-red-500 text-xs mt-1">{errors.identifier}</p>
                                    )}
                                </div>

                                {/* Password Input */}
                                <div className="space-y-1">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        รหัสผ่าน
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl input-focus transition-all duration-200 placeholder-gray-400 text-gray-900 text-sm sm:text-base ${errors.password ? 'border-red-300 bg-red-50' : ''
                                                }`}
                                            placeholder="กรุณากรอกรหัสผ่าน"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 p-1 sm:p-1.5 text-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                                    )}
                                </div>

                                {/* Remember Me & Forgot Password */}
                                <div className="flex items-center justify-between text-sm pt-2">
                                    <label className="flex items-center space-x-2 cursor-pointer touch-manipulation">
                                        <input
                                            type="checkbox"
                                            name="rememberMe"
                                            checked={formData.rememberMe}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 checkbox-custom border-gray-300 rounded focus:ring-2 focus:ring-[#640D5F]/20"
                                        />
                                        <span className="text-gray-600 text-xs sm:text-sm">จดจำการเข้าสู่ระบบ</span>
                                    </label>
                                    <a href="/forgot-password" className="text-[#640D5F] hover:text-[#D91656] font-medium transition-colors text-xs sm:text-sm touch-manipulation">
                                        ลืมรหัสผ่าน?
                                    </a>
                                </div>

                                {/* Login Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full button-primary text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center mt-6 text-sm sm:text-base touch-manipulation cursor-pointer"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center">
                                            <MinimalLoadingSpinner />
                                            <span className="ml-2">กำลังเข้าสู่ระบบ...</span>
                                        </div>
                                    ) : (
                                        'เข้าสู่ระบบ'
                                    )}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-4 sm:my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-3 bg-white text-gray-500 text-xs sm:text-sm">หรือ</span>
                                </div>
                            </div>

                            {/* Google Sign In */}
                            <button
                                type="button"
                                className="w-full button-secondary text-gray-700 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-medium flex items-center justify-center text-sm sm:text-base touch-manipulation cursor-pointer"
                                onClick={handleLoginGoogle}
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="truncate">เข้าสู่ระบบด้วย Google</span>
                            </button>

                            {/* Sign Up Link */}
                            <div className="text-center mt-4 sm:mt-6">
                                <p className="text-gray-500 text-xs sm:text-sm">
                                    ยังไม่มีบัญชี?{' '}
                                    <a href="/signup" className="text-[#640D5F] hover:text-[#D91656] font-semibold transition-colors touch-manipulation">
                                        สมัครสมาชิก
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}; 

export default LoginModal;