import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../services/http";

const ResetPassword = () => {
  const token = new URLSearchParams(location.search).get("token")
  const navigate = useNavigate();

  const [_email, setEmail] = useState("");
  const [status, setStatus] = useState<"verifying" | "valid" | "invalid">("verifying");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ตรวจสอบ token เมื่อ component โหลด
  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    fetch(`${API_BASE_URL}/verify-password?token=${token}`)
      .then((res) => {
        if (!res.ok) throw new Error("Token ไม่ถูกต้อง");
        return res.json();
      })
      .then((data) => {
        setEmail(data.email);
        setStatus("valid");
      })
      .catch(() => {
        setStatus("invalid");
      });
  }, [token]);

  // ฟังก์ชันตรวจสอบความแข็งแกร่งของรหัสผ่าน
  const getPasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    Object.values(checks).forEach(check => check && score++);
    
    if (score <= 2) return { strength: 'weak', color: 'red', text: 'อ่อนแอ' };
    if (score <= 3) return { strength: 'medium', color: 'yellow', text: 'ปานกลาง' };
    if (score <= 4) return { strength: 'good', color: 'blue', text: 'ดี' };
    return { strength: 'strong', color: 'green', text: 'แข็งแกร่ง' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ตรวจสอบรหัสผ่านตรงกันหรือไม่
    if (newPassword !== confirmPassword) {
      setMessage("รหัสผ่านไม่ตรงกัน กรุณาลองใหม่");
      return;
    }

    if (newPassword.length < 8) {
      setMessage("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    // ตรวจสอบความแข็งแกร่งขั้นต่ำ
    const strength = getPasswordStrength(newPassword);
    if (strength.strength === 'weak') {
      setMessage("รหัสผ่านยังไม่ปลอดภัยพอ กรุณาเลือกรหัสผ่านที่แข็งแกร่งกว่านี้");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "เกิดข้อผิดพลาด");
      } else {
        setMessage("เปลี่ยนรหัสผ่านสำเร็จแล้ว");
        // รอ 2 วินาทีให้ผู้ใช้เห็นข้อความ แล้วกลับหน้าหลัก
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      setMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-[#640D5F] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 text-sm">กำลังตรวจสอบลิงก์...</p>
        </div>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <div className="w-16 h-16 bg-[#EB5B00] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">ลิงก์ไม่ถูกต้อง</h3>
            <p className="text-slate-600 text-sm">ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#640D5F] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">เปลี่ยนรหัสผ่าน</h1>
            <p className="text-slate-600 text-sm">กรุณาใส่รหัสผ่านใหม่ของคุณ</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                รหัสผ่านใหม่
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="กรอกรหัสผ่านใหม่"
                  className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#640D5F] focus:border-transparent transition-all duration-200"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                ยืนยันรหัสผ่านใหม่
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#640D5F] focus:border-transparent transition-all duration-200"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            {newPassword && (
              <div className="space-y-3">
                {/* Password Strength Indicator */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">ความแข็งแกร่งของรหัสผ่าน</span>
                    <span className={`text-xs font-medium ${
                      getPasswordStrength(newPassword).color === 'green' ? 'text-green-600' :
                      getPasswordStrength(newPassword).color === 'blue' ? 'text-blue-600' :
                      getPasswordStrength(newPassword).color === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {getPasswordStrength(newPassword).text}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        getPasswordStrength(newPassword).color === 'green' ? 'bg-green-500 w-full' :
                        getPasswordStrength(newPassword).color === 'blue' ? 'bg-blue-500 w-4/5' :
                        getPasswordStrength(newPassword).color === 'yellow' ? 'bg-yellow-500 w-3/5' : 'bg-red-500 w-2/5'
                      }`}
                    />
                  </div>
                </div>

                {/* Requirements Checklist */}
                <div className="text-xs space-y-1">
                  <p className={`flex items-center ${newPassword.length >= 8 ? 'text-green-600' : 'text-slate-500'}`}>
                    <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${newPassword.length >= 8 ? 'bg-green-600' : 'bg-slate-300'}`}>
                      {newPassword.length >= 8 && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                    อย่างน้อย 6 ตัวอักษร
                  </p>
                  
                  <p className={`flex items-center ${/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-slate-500'}`}>
                    <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${/[A-Z]/.test(newPassword) ? 'bg-green-600' : 'bg-slate-300'}`}>
                      {/[A-Z]/.test(newPassword) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                    ตัวอักษรพิมพ์ใหญ่ (A-Z)
                  </p>

                  <p className={`flex items-center ${/[a-z]/.test(newPassword) ? 'text-green-600' : 'text-slate-500'}`}>
                    <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${/[a-z]/.test(newPassword) ? 'bg-green-600' : 'bg-slate-300'}`}>
                      {/[a-z]/.test(newPassword) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                    ตัวอักษรพิมพ์เล็ก (a-z)
                  </p>

                  <p className={`flex items-center ${/\d/.test(newPassword) ? 'text-green-600' : 'text-slate-500'}`}>
                    <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${/\d/.test(newPassword) ? 'bg-green-600' : 'bg-slate-300'}`}>
                      {/\d/.test(newPassword) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                    ตัวเลข (0-9)
                  </p>

                  <p className={`flex items-center ${/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'text-green-600' : 'text-slate-500'}`}>
                    <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'bg-green-600' : 'bg-slate-300'}`}>
                      {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                    อักขระพิเศษ (!@#$%^&*)
                  </p>

                  {confirmPassword && (
                    <p className={`flex items-center ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                      <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${newPassword === confirmPassword ? 'bg-green-600' : 'bg-red-600'}`}>
                        {newPassword === confirmPassword ? (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                      รหัสผ่านตรงกัน
                    </p>
                  )}
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 8 || getPasswordStrength(newPassword).strength === 'weak' || isSubmitting}
              className="w-full bg-[#640D5F] text-white py-3 px-4 rounded-xl font-medium hover:bg-[#D91656] focus:outline-none focus:ring-2 focus:ring-[#640D5F] focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังบันทึก...
                </span>
              ) : (
                "บันทึกรหัสผ่านใหม่"
              )}
            </button>
          </form>

          {message && (
            <div className={`mt-6 p-4 rounded-xl text-sm text-center ${
              message.includes('สำเร็จ') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <div className="flex items-center justify-center">
                {message.includes('สำเร็จ') ? (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <div>
                  {message}
                  {message.includes('สำเร็จ') && (
                    <div className="text-xs mt-1 text-green-600">กำลังนำคุณกลับไปหน้าหลัก...</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;