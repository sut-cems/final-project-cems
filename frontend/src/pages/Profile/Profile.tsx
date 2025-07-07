import { useState, useRef, useEffect, useCallback } from "react";
import {
  Edit,
  Camera,
  Upload,
  X,
  ArrowBigLeft,
  ChevronDown,
  Check,
} from "lucide-react";
import Footer from "../../components/Home/Footer";
import Navbar from "../../components/Home/Navbar";
import {
  fetchUserById,
  getFacultiesWithPrograms,
  updateUser,
} from "../../services/http";
import type { Faculty } from "../../interfaces/IFaculty";

// Combobox Component
const Combobox = ({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const comboboxRef = useRef<HTMLDivElement | null>(null);

  const filteredOptions = options.filter((option: string) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm("");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        comboboxRef.current &&
        !comboboxRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={comboboxRef}>
      <div
        className={`w-full p-2 border border-gray-300 rounded-md bg-white cursor-pointer flex justify-between items-center ${
          disabled
            ? "bg-gray-100 cursor-not-allowed"
            : "focus-within:ring-2 focus-within:ring-purple-800 focus-within:border-transparent"
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {value || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60">
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-800"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-48 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-2 text-gray-500 text-sm">No options found</div>
            ) : (
              filteredOptions.map((option: string, index: number) => (
                <div
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center text-sm"
                  onClick={() => handleSelect(option)}
                >
                  <span>{option}</span>
                  {value === option && (
                    <Check size={16} className="text-purple-800" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Image Cropper Component
const ImageCropper = ({
  imageSrc,
  onCrop,
  onCancel,
}: {
  imageSrc: string | null;
  onCrop: (croppedImage: string | ArrayBuffer | null) => void;
  onCancel: () => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  const handleImageLoad = useCallback(() => {
    const img = imageRef.current;
    if (img) {
      const containerWidth = 400;
      const containerHeight = 300;
      const aspectRatio = img.naturalWidth / img.naturalHeight;

      let displayWidth, displayHeight;
      if (aspectRatio > containerWidth / containerHeight) {
        displayWidth = containerWidth;
        displayHeight = containerWidth / aspectRatio;
      } else {
        displayHeight = containerHeight;
        displayWidth = containerHeight * aspectRatio;
      }

      setImageDimensions({ width: displayWidth, height: displayHeight });

      // Center the crop area
      const cropSize = Math.min(displayWidth, displayHeight) * 0.6;
      setCrop({
        x: (displayWidth - cropSize) / 2,
        y: (displayHeight - cropSize) / 2,
        width: cropSize,
        height: cropSize,
      });
      setImageLoaded(true);
    }
  }, []); // Add empty dependency array

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - crop.x, y: e.clientY - crop.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newX = Math.max(
      0,
      Math.min(e.clientX - dragStart.x, imageDimensions.width - crop.width)
    );
    const newY = Math.max(
      0,
      Math.min(e.clientY - dragStart.y, imageDimensions.height - crop.height)
    );

    setCrop((prev) => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    canvas.width = 200;
    canvas.height = 200;

    // Calculate scale factors
    const scaleX = img.naturalWidth / imageDimensions.width;
    const scaleY = img.naturalHeight / imageDimensions.height;
    if (!ctx) return;

    ctx.drawImage(
      img,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      200,
      200
    );

    canvas.toBlob(
      (blob: Blob | null) => {
        if (blob) {
          const reader = new FileReader();
          reader.onload = () => onCrop(reader.result);
          reader.readAsDataURL(blob);
        }
      },
      "image/jpeg",
      0.9
    );
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [
    isDragging,
    dragStart,
    crop.width,
    crop.height,
    imageDimensions,
    handleMouseMove,
    handleMouseUp,
  ]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Crop Image</h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative mb-4 flex justify-center">
          <div
            className="relative border border-gray-300 overflow-hidden"
            style={{
              width: imageDimensions.width,
              height: imageDimensions.height,
            }}
          >
            <img
              ref={imageRef}
              src={imageSrc || undefined}
              alt="Crop preview"
              className="block"
              style={{
                width: imageDimensions.width,
                height: imageDimensions.height,
              }}
              onLoad={handleImageLoad}
              draggable={false}
            />

            {imageLoaded && (
              <>
                {/* Overlay */}
                <div
                  className="absolute inset-0 bg-black bg-opacity-50"
                  style={{
                    clipPath: `polygon(0% 0%, 0% 100%, ${crop.x}px 100%, ${
                      crop.x
                    }px ${crop.y}px, ${crop.x + crop.width}px ${crop.y}px, ${
                      crop.x + crop.width
                    }px ${crop.y + crop.height}px, ${crop.x}px ${
                      crop.y + crop.height
                    }px, ${crop.x}px 100%, 100% 100%, 100% 0%)`,
                  }}
                />

                {/* Crop area */}
                <div
                  className="absolute border-2 border-white cursor-move"
                  style={{
                    left: crop.x,
                    top: crop.y,
                    width: crop.width,
                    height: crop.height,
                  }}
                  onMouseDown={handleMouseDown}
                >
                  {/* Corner handles */}
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-white border border-gray-400"></div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white border border-gray-400"></div>
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border border-gray-400"></div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border border-gray-400"></div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCrop}
            className="px-4 py-2 bg-[#640D5F] text-white rounded hover:bg-[#7d1470]"
            disabled={!imageLoaded}
          >
            Crop & Upload
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default function Profile() {
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    faculty: "",
    program: "",
    studentID: "",
    club: "",
    activityHours: 0,
    email: "",
  });

  // Store original data for cancel functionality
  const [originalData, setOriginalData] = useState(profileData);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | ArrayBuffer | null>(null);
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState<
    string | ArrayBuffer | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const avatarRef = useRef<HTMLDivElement | null>(null);

  const [showCropper, setShowCropper] = useState(false);
  const [selectedImageForCrop, setSelectedImageForCrop] = useState<
    string | null
  >(null);

  const [isSaving, setIsSaving] = useState(false);

  const [facultiesData, setFacultiesData] = useState<Faculty[]>([]);
  const [facultyOptions, setFacultyOptions] = useState<string[]>([]);
  const [programOptions, setProgramOptions] = useState<
    Record<string, string[]>
  >({});

  // Add this useEffect to fetch user data (add this after your existing useEffect)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const userData = await fetchUserById(parseInt(userId || ""));

        setProfileData({
          firstName: userData.FirstName || "",
          lastName: userData.LastName || "",
          faculty: userData.Faculty?.Name || "",
          program: userData.Program?.Name || "",
          studentID: userData.StudentID || "",
          club: userData.ClubID ? `${userData.ClubID}` : "-",
          activityHours: userData.ActivityHour || 0,
          email: userData.Email || "",
        });

        // Set original data for cancel functionality
        setOriginalData({
          firstName: userData.FirstName || "",
          lastName: userData.LastName || "",
          faculty: userData.Faculty?.Name || "",
          program: userData.Program?.Name || "",
          studentID: userData.StudentID || "",
          club: userData.ClubID ? `${userData.ClubID}` : "",
          activityHours: userData.VerifiedHours?.length || 0,
          email: userData.Email || "",
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

  useEffect(() => {
    const fetchFacultiesData = async () => {
      try {
        const res = await getFacultiesWithPrograms();
        const data = res.faculties;
        setFacultiesData(data);
        // Extract faculty names
        const faculties = data.map((item: any) => item.Name);
        setFacultyOptions(faculties);
        // Create program options mapping
        const programMap: Record<string, string[]> = {};
        data.forEach((item: any) => {
          programMap[item.Name] = item.Program.map(
            (program: any) => program.Name
          );
        });
        setProgramOptions(programMap);
      } catch (error) {
        console.error("Error fetching faculties:", error);
      }
    };

    fetchFacultiesData();
  }, []);

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

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("User ID not found");
      }

      // Find the selected faculty and program IDs
      const selectedFaculty = facultiesData.find(
        (f) => f.Name === profileData.faculty
      );
      const selectedProgram = selectedFaculty?.Program.find(
        (p) => p.Name === profileData.program
      );

      // Prepare data for API call
      const updateData = {
        FirstName: profileData.firstName,
        LastName: profileData.lastName,
        StudentID: profileData.studentID,
        Email: profileData.email,
        FacultyID: selectedFaculty?.ID || undefined, // Assuming faculty has ID field
        ProgramID: selectedProgram?.ID || undefined, // Assuming program has ID field
        ProfileImage: typeof avatarUrl === "string" ? avatarUrl : undefined,
      };

      console.log(updateData);

      // Call the update API
      await updateUser(userId, updateData);

      // Save changes and exit edit mode
      setOriginalData(profileData);
      setOriginalAvatarUrl(avatarUrl);
      setIsEditing(false);
      setShowAvatarOptions(false);

      // Optional: Show success message
      // You can add a toast notification here
      console.log("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      // Optional: Show error message to user
      // You can add error handling/toast here
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (
    field: keyof typeof profileData,
    value: string
  ) => {
    setProfileData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // If faculty changes, reset program to empty if current program is not available for new faculty
      if (field === "faculty") {
        const availablePrograms =
          programOptions[value as keyof typeof programOptions] || [];
        if (!availablePrograms.includes(prev.program)) {
          newData.program = "";
        }
      }

      return newData;
    });
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      setShowAvatarOptions(!showAvatarOptions);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (result && typeof result === "string") {
          setSelectedImageForCrop(result);
          setShowCropper(true);
        }
        setShowAvatarOptions(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImageUrl: string | ArrayBuffer | null) => {
    setAvatarUrl(croppedImageUrl);
    setShowCropper(false);
    setSelectedImageForCrop(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setSelectedImageForCrop(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        avatarRef.current &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setShowAvatarOptions(false);
      }
    };

    if (showAvatarOptions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showAvatarOptions]);

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      {/* Header/Navbar placeholder */}
      <Navbar />

      {/* Image Cropper Modal */}
      {showCropper && (
        <ImageCropper
          imageSrc={selectedImageForCrop}
          onCrop={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      {/* Main content */}
      <div className="flex flex-col container mx-auto h-auto justify-center items-center py-8">
        <div className="relative w-full mb-[4vh]" ref={avatarRef}>
          {/* Back button */}
          <button
            className="absolute z-auto top-0 left-4 flex items-center gap-1 px-2 py-1 text-center text-[#640D5F] border-2 border-[#640D5F] rounded-lg font-medium hover:bg-[#640D5F] hover:text-white transition-all duration-300 hover:scale-110"
            onClick={() => {
              // optional: go back to previous page
              window.history.back();
            }}
          >
            <ArrowBigLeft size={16} />
            Back
          </button>
          {/* Avatar */}
          <div
            className={`mx-auto flex h-24 w-24 bg-gray-300 rounded-full ring-2 ring-[#640D5F] items-center justify-center overflow-hidden ${
              isEditing ? "cursor-pointer hover:opacity-80" : ""
            } transition-opacity duration-200`}
            onClick={handleAvatarClick}
          >
            {avatarUrl ? (
              <img
                src={typeof avatarUrl === "string" ? avatarUrl : undefined}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-gray-600">
                {profileData.firstName?.charAt(0) || ""}
                {profileData.lastName?.charAt(0) || ""}
              </span>
            )}
            {isEditing && (
              <div className="absolute inset-0 w-24 mx-auto bg-black bg-opacity-40 flex items-center justify-center rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200">
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
                disabled={isSaving}
                className={`flex items-center gap-1 px-2 py-1 text-center text-white bg-[#640D5F] border-2 border-[#640D5F] rounded-lg font-medium hover:bg-[#7d1470] transition-all duration-300 hover:scale-110 ${
                  isSaving ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Edit size={16} />
                {isSaving ? "Saving..." : "Save"}
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
        <div className="bg-white rounded-lg shadow-md border border-gray-200 w-full max-w-2xl max-sm:w-md max-md:w-xl mx-4">
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

            {/* Student ID */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Student ID
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.studentID}
                  onChange={(e) =>
                    handleInputChange("studentID", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-800 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">
                  {profileData.studentID}
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

            {/* Faculty - Now with Combobox */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Faculty
              </label>
              {isEditing ? (
                <Combobox
                  value={profileData.faculty}
                  onChange={(value: any) => handleInputChange("faculty", value)}
                  options={facultyOptions}
                  placeholder="Select faculty..."
                />
              ) : (
                <p className="text-gray-900 font-medium">
                  {profileData.faculty}
                </p>
              )}
            </div>

            {/* Program - Now with Combobox */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Program
              </label>
              {isEditing ? (
                <Combobox
                  value={profileData.program}
                  onChange={(value: any) => handleInputChange("program", value)}
                  options={programOptions[profileData.faculty] || []}
                  placeholder="Select program..."
                  disabled={!profileData.faculty}
                />
              ) : (
                <p className="text-gray-900 font-medium">
                  {profileData.program}
                </p>
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
