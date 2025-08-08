import { useState, useRef, useEffect } from "react";
import {
    Edit,
    Camera,
    Upload,
    X,
    CheckCircle,
    Mail,
    User,
    Shield,
    CreditCard,
    Crop,
    RotateCw,
    Square,
    Circle
} from "lucide-react";
import { API_BASE_URL, fetchUserById, updateUserProfile } from "../../services/http";

interface ImageCropperProps {
    imageSrc: string;
    onCrop: (croppedImageBlob: Blob, croppedImageUrl: string) => void;
    onCancel: () => void;
}

const ImageCropper = ({ imageSrc, onCrop, onCancel }: ImageCropperProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imageLoaded, setImageLoaded] = useState(false);
    const [cropMode, setCropMode] = useState<'circle' | 'square'>('circle');

    const cropSize = 300;

    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            if (imageRef.current) {
                imageRef.current.src = img.src;
                setImageLoaded(true);
                const canvas = canvasRef.current;
                if (canvas) {
                    const centerX = (canvas.width - img.width * scale) / 2;
                    const centerY = (canvas.height - img.height * scale) / 2;
                    setPosition({ x: centerX, y: centerY });
                }
            }
        };
        img.src = imageSrc;
    }, [imageSrc, scale]);

    useEffect(() => {
        if (imageLoaded) {
            drawCanvas();
        }
    }, [position, scale, rotation, imageLoaded, cropMode]);

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        const img = imageRef.current;
        if (!canvas || !img) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        ctx.translate(centerX, centerY);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-centerX, -centerY);

        ctx.drawImage(
            img,
            position.x,
            position.y,
            img.width * scale,
            img.height * scale
        );

        ctx.restore();

        const cropRadius = cropSize / 2;

        // Clean dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Clear crop area
        ctx.globalCompositeOperation = 'destination-out';
        
        if (cropMode === 'circle') {
            ctx.beginPath();
            ctx.arc(centerX, centerY, cropRadius, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            const cropX = centerX - cropRadius;
            const cropY = centerY - cropRadius;
            ctx.fillRect(cropX, cropY, cropSize, cropSize);
        }

        ctx.globalCompositeOperation = 'source-over';

        // Clean purple border
        ctx.strokeStyle = '#640D5F';
        ctx.lineWidth = 2;

        if (cropMode === 'circle') {
            ctx.beginPath();
            ctx.arc(centerX, centerY, cropRadius, 0, 2 * Math.PI);
            ctx.stroke();
        } else {
            const cropX = centerX - cropRadius;
            const cropY = centerY - cropRadius;
            ctx.strokeRect(cropX, cropY, cropSize, cropSize);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            setDragStart({
                x: e.clientX - rect.left - position.x,
                y: e.clientY - rect.top - position.y
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            setPosition({
                x: e.clientX - rect.left - dragStart.x,
                y: e.clientY - rect.top - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleRotate = () => {
        setRotation(prev => (prev + 90) % 360);
    };

    const handleCrop = () => {
        const canvas = canvasRef.current;
        const img = imageRef.current;
        if (!canvas || !img) return;

        const cropCanvas = document.createElement('canvas');
        const cropCtx = cropCanvas.getContext('2d');
        if (!cropCtx) return;

        cropCanvas.width = cropSize;
        cropCanvas.height = cropSize;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const cropRadius = cropSize / 2;

        if (cropMode === 'circle') {
            cropCtx.beginPath();
            cropCtx.arc(cropRadius, cropRadius, cropRadius, 0, 2 * Math.PI);
            cropCtx.clip();
        }

        cropCtx.save();
        cropCtx.translate(cropRadius, cropRadius);
        cropCtx.rotate((rotation * Math.PI) / 180);
        cropCtx.translate(-cropRadius, -cropRadius);

        const sourceX = centerX - cropRadius - position.x;
        const sourceY = centerY - cropRadius - position.y;

        cropCtx.drawImage(
            img,
            sourceX / scale,
            sourceY / scale,
            cropSize / scale,
            cropSize / scale,
            0,
            0,
            cropSize,
            cropSize
        );

        cropCtx.restore();

        cropCanvas.toBlob((blob) => {
            if (blob) {
                const croppedUrl = URL.createObjectURL(blob);
                onCrop(blob, croppedUrl);
            }
        }, 'image/jpeg', 0.95);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden">
                {/* Clean Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-2xl font-bold text-gray-900">แก้ไขรูปโปรไฟล์</h3>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Main Canvas Area */}
                    <div className="flex flex-col items-center space-y-6">
                        <div className="relative">
                            <canvas
                                ref={canvasRef}
                                width={450}
                                height={450}
                                className={`block rounded-2xl bg-gray-50 shadow-inner border border-gray-200 ${
                                    isDragging ? 'cursor-grabbing' : 'cursor-grab'
                                } transition-all duration-200`}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                            />
                            <img ref={imageRef} className="hidden" alt="Crop source" />
                            
                            {!imageLoaded && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-200">
                                    <div className="w-8 h-8 border-3 border-[#640D5F] border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>

                        {/* Clean Controls */}
                        <div className="flex items-center justify-center space-x-4">
                            {/* Crop Mode Toggle */}
                            <div className="flex items-center bg-gray-100 rounded-2xl p-1">
                                <button
                                    onClick={() => setCropMode('circle')}
                                    className={`p-3 rounded-xl transition-all duration-200 ${
                                        cropMode === 'circle'
                                            ? 'bg-[#640D5F] text-white shadow-lg'
                                            : 'text-gray-600 hover:bg-white hover:shadow-sm'
                                    }`}
                                >
                                    <Circle size={20} />
                                </button>
                                <button
                                    onClick={() => setCropMode('square')}
                                    className={`p-3 rounded-xl transition-all duration-200 ${
                                        cropMode === 'square'
                                            ? 'bg-[#640D5F] text-white shadow-lg'
                                            : 'text-gray-600 hover:bg-white hover:shadow-sm'
                                    }`}
                                >
                                    <Square size={20} />
                                </button>
                            </div>

                            {/* Clean Zoom Slider */}
                            <div className="flex items-center bg-gray-100 rounded-2xl px-4 py-2 space-x-3">
                                <span className="text-sm font-semibold text-gray-700 min-w-[3rem]">
                                    {Math.round(scale * 100)}%
                                </span>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="3"
                                    step="0.1"
                                    value={scale}
                                    onChange={(e) => setScale(parseFloat(e.target.value))}
                                    className="w-32 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                                />
                            </div>

                            {/* Rotate Button */}
                            <button
                                onClick={handleRotate}
                                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors duration-200"
                                title="หมุน 90°"
                            >
                                <RotateCw size={20} className="text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Clean Action Buttons */}
                    <div className="flex items-center justify-center space-x-4 mt-8 pt-6 border-t border-gray-100">
                        <button
                            onClick={onCancel}
                            className="px-8 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors duration-200 font-medium"
                        >
                            ยกเลิก
                        </button>
                        <button
                            onClick={handleCrop}
                            className="px-8 py-3 bg-[#640D5F] hover:bg-[#640D5F]/90 text-white rounded-2xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-2"
                        >
                            <Crop size={18} />
                            <span>บันทึก</span>
                        </button>
                    </div>

                    {/* Simple Instruction */}
                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-500">
                            ลากเพื่อเลื่อนตำแหน่ง • ปรับขนาดด้วยแถบเลื่อน • หมุนภาพด้วยปุ่มหมุน
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #640D5F;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(100, 13, 95, 0.3);
                    transition: all 0.2s ease;
                    border: 2px solid white;
                }
                
                .slider::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(100, 13, 95, 0.4);
                }
                
                .slider::-webkit-slider-track {
                    background: linear-gradient(to right, #640D5F 0%, #640D5F ${((scale - 0.5) / (3 - 0.5)) * 100}%, #e5e7eb ${((scale - 0.5) / (3 - 0.5)) * 100}%, #e5e7eb 100%);
                    height: 8px;
                    border-radius: 4px;
                }
                
                .slider::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #640D5F;
                    cursor: pointer;
                    border: 2px solid white;
                    box-shadow: 0 2px 6px rgba(100, 13, 95, 0.3);
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
};

// Success Notification Component (same as before but improved)
type NotificationProps = {
    isOpen: boolean;
    onClose: () => void;
    message?: string;
    autoClose?: boolean;
    autoCloseDelay?: number;
};

const ProfileUpdateNotification = ({
    isOpen,
    onClose,
    message = "โปรไฟล์ของคุณได้รับการอัพเดตเรียบร้อยแล้ว",
    autoClose = true,
    autoCloseDelay = 3000,
}: NotificationProps) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (isOpen && autoClose) {
            const progressInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(progressInterval);
                        setTimeout(onClose, 100);
                        return 100;
                    }
                    return prev + 100 / (autoCloseDelay / 100);
                });
            }, 100);

            return () => {
                clearInterval(progressInterval);
                setProgress(0);
            };
        }
    }, [isOpen, autoClose, autoCloseDelay, onClose]);

    useEffect(() => {
        if (isOpen) {
            setProgress(0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full transform transition-all duration-300 animate-slideUp border border-gray-100/80">
                <div className="absolute top-4 right-4">
                    <button
                        onClick={onClose}
                        className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                <div className="p-8 pb-4">
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                    </div>

                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            อัปเดตสำเร็จ!
                        </h2>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            {message}
                        </p>
                    </div>
                </div>

                {autoClose && (
                    <div className="px-8 pb-6">
                        <div className="text-center space-y-3">
                            <p className="text-xs text-gray-500">หน้าต่างจะปิดโดยอัตโนมัติ</p>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div
                                    className="h-full bg-green-500 rounded-full transition-all duration-100 ease-out"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(16px) scale(0.98);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.15s ease-out;
                }
                .animate-slideUp {
                    animation: slideUp 0.2s ease-out;
                }
            `}</style>
        </div>
    );
};

// Main Admin Profile Component (Fixed)
export default function AdminProfile() {

    const [profileData, setProfileData] = useState<{
        firstName: string;
        lastName: string;
        studentID: string;
        email: string;
        role: string;
        ProfileImage: string | File;
    }>({
        firstName: "",
        lastName: "",
        studentID: "",
        email: "",
        role: "",
        ProfileImage: "",
    });

    const [originalData, setOriginalData] = useState(profileData);
    const [isEditing, setIsEditing] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [originalAvatarUrl, setOriginalAvatarUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [showAvatarOptions, setShowAvatarOptions] = useState(false);
    const avatarRef = useRef<HTMLDivElement | null>(null);

    const [showCropper, setShowCropper] = useState(false);
    const [selectedImageForCrop, setSelectedImageForCrop] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showNotification, setShowNotification] = useState(false);

    // Fixed: Proper avatar URL handling
    const getDisplayAvatarUrl = () => {
        if (avatarUrl) {
            if (avatarUrl.startsWith('blob:') || avatarUrl.startsWith('data:')) {
                return avatarUrl;
            }
            if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
                return avatarUrl;
            }
            return `${API_BASE_URL}${avatarUrl}`;
        }
        return null;
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = localStorage.getItem("userId");
                const userData = await fetchUserById(parseInt(userId || ""));

                setProfileData({
                    firstName: userData.FirstName || "",
                    lastName: userData.LastName || "",
                    studentID: userData.StudentID || "",
                    email: userData.Email || "",
                    role: userData.Role?.RoleName || "",
                    ProfileImage: userData.ProfileImage || "",
                });

                // Set original data for cancel functionality
                setOriginalData({
                    firstName: userData.FirstName || "",
                    lastName: userData.LastName || "",
                    studentID: userData.StudentID || "",
                    email: userData.Email || "",
                    role: userData.Role?.RoleName || "",
                    ProfileImage: userData.ProfileImage || "",
                });

                if (userData.ProfileImage) {
                    setAvatarUrl(userData.ProfileImage);
                    setOriginalAvatarUrl(userData.ProfileImage);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, []);


    const hasChanges = () => {
        return (
            profileData.firstName !== originalData.firstName ||
            profileData.lastName !== originalData.lastName ||
            profileData.studentID !== originalData.studentID ||
            profileData.email !== originalData.email ||
            avatarUrl !== originalAvatarUrl
        );
    };

    const handleEditToggle = () => {
        if (!isEditing) {
            setOriginalData(profileData);
            setOriginalAvatarUrl(avatarUrl);
        }
        setIsEditing(!isEditing);
        setShowAvatarOptions(false);
    };

    const handleCancel = () => {
        setProfileData(originalData);
        setAvatarUrl(originalAvatarUrl);
        setIsEditing(false);
        setShowAvatarOptions(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);

            const userId = localStorage.getItem("userId");
            if (!userId) throw new Error("User ID not found");

            const formData = new FormData();
            formData.append("FirstName", profileData.firstName);
            formData.append("LastName", profileData.lastName);
            formData.append("StudentID", profileData.studentID);
            formData.append("Email", profileData.email);

            // Make sure profileData.ProfileImage is a File/Blob, not a URL string
            const isFile = (value: unknown): value is File => {
                return (
                    typeof value === "object" &&
                    value !== null &&
                    value instanceof File
                );
            };

            if (isFile(profileData.ProfileImage)) {
                formData.append("profile_picture", profileData.ProfileImage);
            }

            await updateUserProfile(userId, formData);

            setShowNotification(true);
            setTimeout(() => window.location.reload(), 3100);
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (field: keyof typeof profileData, value: string) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleAvatarClick = () => {
        if (isEditing) {
            setShowAvatarOptions(!showAvatarOptions);
        }
    };

    // Fixed: Better file handling for cropping
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            const url = URL.createObjectURL(file);
            setSelectedImageForCrop(url);
            setShowCropper(true);
            setShowAvatarOptions(false);
        }
    };

    // Fixed: Handle cropped image properly
    const handleCropComplete = (croppedImageBlob: Blob, croppedImageUrl: string) => {
        const file = new File([croppedImageBlob], "avatar.png", { type: croppedImageBlob.type });
        setAvatarUrl(croppedImageUrl);
        setProfileData(prev => ({
            ...prev,
            ProfileImage: file,
        }));
        setShowCropper(false);
        setSelectedImageForCrop(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleCropCancel = () => {
        setShowCropper(false);
        if (selectedImageForCrop) {
            URL.revokeObjectURL(selectedImageForCrop);
        }
        setSelectedImageForCrop(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemoveAvatar = () => {
        if (avatarUrl && avatarUrl.startsWith('blob:')) {
            URL.revokeObjectURL(avatarUrl);
        }
        setAvatarUrl(null);
        setProfileData(prev => ({
            ...prev,
            ProfileImage: "",
        }));
        setShowAvatarOptions(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
                setShowAvatarOptions(false);
            }
        };

        if (showAvatarOptions) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [showAvatarOptions]);

    // Cleanup blob URLs on unmount
    useEffect(() => {
        return () => {
            if (avatarUrl && avatarUrl.startsWith('blob:')) {
                URL.revokeObjectURL(avatarUrl);
            }
            if (selectedImageForCrop && selectedImageForCrop.startsWith('blob:')) {
                URL.revokeObjectURL(selectedImageForCrop);
            }
        };
    }, []);

    const displayAvatarUrl = getDisplayAvatarUrl();

    return (
        <div className="min-h-screen bg-gray-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
                {/* Header Section */}
                <div className="mb-8 lg:mb-12">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                        โปรไฟล์ผู้ดูแลระบบ
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base">
                        จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชี
                    </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
                    {/* Profile Card */}
                    <div className="xl:col-span-4">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                            {/* Avatar Section */}
                            <div className="relative mb-8" ref={avatarRef}>
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`relative flex h-28 w-28 sm:h-32 sm:w-32 lg:h-36 lg:w-36 bg-[#640D5F] rounded-full ring-4 ring-[#640D5F]/10 items-center justify-center overflow-hidden ${isEditing ? "cursor-pointer hover:ring-[#640D5F]/20" : ""
                                            } transition-all duration-300 group`}
                                        onClick={handleAvatarClick}
                                    >
                                        {displayAvatarUrl ? (
                                            <img
                                                src={displayAvatarUrl}
                                                alt="Profile Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                                                {profileData.firstName?.charAt(0)}
                                                {profileData.lastName?.charAt(0)}
                                            </span>
                                        )}
                                        {isEditing && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <Camera className="text-white" size={24} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Admin Badge */}
                                    <div className="mt-4">
                                        <div className="bg-[#640D5F] text-white px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md">
                                            <Shield size={14} />
                                            {profileData.role}
                                        </div>
                                    </div>
                                </div>

                                {/* Avatar Options Dropdown */}
                                {showAvatarOptions && isEditing && (
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 w-48 overflow-hidden">
                                        <button
                                            onClick={triggerFileInput}
                                            className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 text-gray-700"
                                        >
                                            <Upload size={16} className="text-[#640D5F]" />
                                            อัปโหลดรูปใหม่
                                        </button>
                                        {displayAvatarUrl && (
                                            <button
                                                onClick={handleRemoveAvatar}
                                                className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 text-[#D91656]"
                                            >
                                                <X size={16} />
                                                ลบรูปภาพ
                                            </button>
                                        )}
                                    </div>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>

                            {/* Name Display */}
                            <div className="text-center mb-8">
                                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                                    {profileData.firstName} {profileData.lastName}
                                </h2>
                                <p className="text-[#640D5F] font-semibold text-sm sm:text-base">
                                    {profileData.studentID}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                {!isEditing ? (
                                    <button
                                        onClick={handleEditToggle}
                                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#640D5F] text-white rounded-2xl font-semibold hover:bg-[#640D5F]/90 transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        <Edit size={20} />
                                        แก้ไขข้อมูล
                                    </button>
                                ) : (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving || !hasChanges()}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-[#640D5F] text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg ${isSaving || !hasChanges()
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : "hover:bg-[#640D5F]/90 hover:shadow-xl"
                                                }`}
                                        >
                                            <CheckCircle size={18} />
                                            {isSaving ? "กำลังบันทึก..." : "บันทึก"}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="px-4 py-4 text-gray-600 border border-gray-200 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-200"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Profile Information */}
                    <div className="xl:col-span-8">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="mb-8">
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                                    ข้อมูลส่วนตัว
                                </h3>
                                <p className="text-gray-600 text-sm sm:text-base">
                                    จัดการข้อมูลส่วนตัวและข้อมูลการติดต่อ
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                                {/* First Name */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        ชื่อจริง
                                    </label>
                                    {isEditing ? (
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="text"
                                                value={profileData.firstName}
                                                onChange={(e) => handleInputChange("firstName", e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#640D5F]/20 focus:border-[#640D5F] transition-all duration-200 bg-white"
                                                placeholder="กรอกชื่อจริง"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                            <User className="text-[#640D5F]" size={20} />
                                            <span className="text-gray-900 font-semibold text-base">
                                                {profileData.firstName || "ไม่ระบุ"}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Last Name */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        นามสกุล
                                    </label>
                                    {isEditing ? (
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="text"
                                                value={profileData.lastName}
                                                onChange={(e) => handleInputChange("lastName", e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#640D5F]/20 focus:border-[#640D5F] transition-all duration-200 bg-white"
                                                placeholder="กรอกนามสกุล"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                            <User className="text-[#640D5F]" size={20} />
                                            <span className="text-gray-900 font-semibold text-base">
                                                {profileData.lastName || "ไม่ระบุ"}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        อีเมล
                                    </label>
                                    {isEditing ? (
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="email"
                                                value={profileData.email}
                                                onChange={(e) => handleInputChange("email", e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#640D5F]/20 focus:border-[#640D5F] transition-all duration-200 bg-white"
                                                placeholder="กรอกอีเมล"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                            <Mail className="text-[#640D5F]" size={20} />
                                            <span className="text-gray-900 font-semibold text-base">
                                                {profileData.email || "ไม่ระบุ"}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Student ID */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        รหัสประจำตัว
                                    </label>
                                    {isEditing ? (
                                        <div className="relative">
                                            <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="text"
                                                value={profileData.studentID}
                                                onChange={(e) => handleInputChange("studentID", e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#640D5F]/20 focus:border-[#640D5F] transition-all duration-200 bg-white"
                                                placeholder="กรอกรหัสประจำตัว"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                            <CreditCard className="text-[#640D5F]" size={20} />
                                            <span className="text-gray-900 font-semibold text-base">
                                                {profileData.studentID || "ไม่ระบุ"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showCropper && selectedImageForCrop && (
                <ImageCropper
                    imageSrc={selectedImageForCrop}
                    onCrop={handleCropComplete}
                    onCancel={handleCropCancel}
                />
            )}

            <ProfileUpdateNotification
                isOpen={showNotification}
                onClose={() => setShowNotification(false)}
                message="โปรไฟล์ของคุณได้รับการอัปเดตเรียบร้อยแล้ว"
                autoClose={true}
                autoCloseDelay={2000}
            />
        </div>
    );
}