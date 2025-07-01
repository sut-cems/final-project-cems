import { useState, useRef } from "react";
import { Edit, Camera, Upload, X } from "lucide-react";
import Footer from "../../components/Home/Footer";
import Navbar from "../../components/Home/Navbar";

export default function Profile() {
  const [profileData, setProfileData] = useState({
    firstName: "Peerawich",
    lastName: "Punyano",
    faculty: "Institute of Engineering",
    program: "Computer Engineering",
    club: "Computer Club",
    activityHours: "24 hours",
    phoneNumber: "0987654321",
    email: "computerlwnza@gmail.com",
  });

  // Store original data for cancel functionality
  const [originalData, setOriginalData] = useState(profileData);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState<string | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);

  const handleEditToggle = () => {
    if (!isEditing) {
      // Starting edit mode - save current state
      setOriginalData(profileData);
      setOriginalAvatarUrl(avatarUrl);
    }
    setIsEditing(!isEditing);
    setShowAvatarOptions(false);
  };

  const handleCancel = () => {
    // Revert to original data
    setProfileData(originalData);
    setAvatarUrl(originalAvatarUrl);
    setIsEditing(false);
    setShowAvatarOptions(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    // Save changes and exit edit mode
    setOriginalData(profileData);
    setOriginalAvatarUrl(avatarUrl);
    setIsEditing(false);
    setShowAvatarOptions(false);
  };

  const handleInputChange = (field: any, value: any) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      setShowAvatarOptions(!showAvatarOptions);
    }
  };

  const handleFileSelect = (event: any) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (result && typeof result === "string") {
          setAvatarUrl(result);
        }
        setShowAvatarOptions(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
    setShowAvatarOptions(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      {/* Header/Navbar placeholder */}
      <Navbar />

      {/* Main content */}
      <div
        className="flex flex-col w-full h-auto justify-center items-center py-8"
        onClick={(e) => {
          // Close avatar options when clicking outside
          const target = e.target as HTMLElement;
          if (showAvatarOptions && !target.closest(".relative")) {
            setShowAvatarOptions(false);
          }
        }}
      >
        {/* Avatar with Edit Functionality */}
        <div className="relative mb-[4vh]">
          <div
            className={`flex h-24 w-24 bg-gray-300 rounded-full ring-2 ring-[#640D5F] items-center justify-center overflow-hidden ${
              isEditing ? "cursor-pointer hover:opacity-80" : ""
            } transition-opacity duration-200`}
            onClick={handleAvatarClick}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-gray-600">
                {profileData.firstName.charAt(0)}
                {profileData.lastName.charAt(0)}
              </span>
            )}
            {isEditing && (
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200">
                <Camera className="text-white" size={24} />
              </div>
            )}
          </div>

          {/* Avatar Options Dropdown */}
          {showAvatarOptions && isEditing && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 z-10 w-48">
              <div className="py-2">
                <button
                  onClick={triggerFileInput}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-150"
                >
                  <Upload size={16} className="text-[#640D5F]" />
                  <span className="text-gray-700 text-sm">
                    Upload new photo
                  </span>
                </button>
                {avatarUrl && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-150 text-red-600"
                  >
                    <span className="w-4 h-4 flex items-center justify-center">
                      ×
                    </span>
                    <span>Remove photo</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Edit Profile Buttons */}
        <div className="flex gap-3 mb-[2vh]">
          {!isEditing ? (
            <button
              onClick={handleEditToggle}
              className="flex items-center gap-1 px-2 py-1 text-center text-[#640D5F] border-2 border-[#640D5F] rounded-lg font-medium hover:bg-[#640D5F] hover:text-white transition-all duration-300 hover:scale-110"
            >
              <Edit size={16} />
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-2 py-1 text-center text-white bg-[#640D5F] border-2 border-[#640D5F] rounded-lg font-medium hover:bg-[#7d1470] transition-all duration-300 hover:scale-110"
              >
                <Edit size={16} />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 px-2 py-1 text-center text-gray-600 border-2 border-gray-400 rounded-lg font-medium hover:bg-gray-400 hover:text-white transition-all duration-300 hover:scale-110"
              >
                <X size={16} />
                Cancel
              </button>
            </>
          )}
        </div>

        {/* Profile Information Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 w-full max-w-2xl mx-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                First name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-800 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">
                  {profileData.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Last name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-800 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">
                  {profileData.lastName}
                </p>
              )}
            </div>

            {/* Faculty */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Faculty
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.faculty}
                  onChange={(e) => handleInputChange("faculty", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-800 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">
                  {profileData.faculty}
                </p>
              )}
            </div>

            {/* Program */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Program
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.program}
                  onChange={(e) => handleInputChange("program", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-800 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">
                  {profileData.program}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={profileData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-800 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">
                  {profileData.phoneNumber}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-800 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">{profileData.email}</p>
              )}
            </div>
            {/* Club */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Club
              </label>

              <p className="text-gray-900 font-medium">{profileData.club}</p>
            </div>

            {/* Activity Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Activity Hour
              </label>

              <p className="text-gray-900 font-medium">
                {profileData.activityHours}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer placeholder */}
      <Footer />
    </div>
  );
}
