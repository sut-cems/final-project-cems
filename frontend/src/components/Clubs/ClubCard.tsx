import React, { useState } from 'react';
import { ArrowRight, Calendar, ImageOff, Users } from 'lucide-react';
import { API_BASE_URL } from '../../services/http';

interface ClubCardProps {
  club: {
    id: string;
    name: string;
    LogoImage: string;
    description: string;
    member_count?: number;
    activity_count?: number;
    category?: string;
    isActive?: boolean;
  };
  color: string;
  onClick?: () => void;
}

const ClubCard: React.FC<ClubCardProps> = ({ club, color, onClick }) => {
  const safeColor = color && color.startsWith('#') ? color : '#D91656';
  const logoImage = club.LogoImage;
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const getImageUrl = (logoImage: string): string => {
    if (!logoImage) return '';

    if (logoImage.startsWith('http://') || logoImage.startsWith('https://')) {
      return logoImage;
    }

    const cleanPath = logoImage.startsWith('/') ? logoImage : `/${logoImage}`;
    return `${API_BASE_URL}${cleanPath}`;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  // Status
  const StatusIndicator = () => {
    if (club.isActive !== false) {
      return (
        <div className="absolute top-2 right-2 z-20">
          <div className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-2 py-1 rounded-full shadow-md flex items-center gap-1 hover:scale-105 transition-transform duration-300">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            <span className="text-xs font-medium">เปิดรับสมาชิก</span>
          </div>
        </div>
      );
    }
    else {
      return (
        <div className="absolute top-2 right-2 z-20">
          <div className="bg-gradient-to-r from-red-400 to-red-500 text-white px-2 py-1 rounded-full shadow-md flex items-center gap-1 hover:scale-105 transition-transform duration-300">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            <span className="text-xs font-medium">ปิดรับสมาชิก</span>
          </div>
        </div>
      );
    }
  };

    
  return (
    <div 
      className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-xl cursor-pointer h-full flex flex-col border border-white/50 ${
        isHovered ? 'ring-2 ring-purple-300/50 shadow-purple-500/20' : ''
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Compact Card Header */}
      <div className="h-32 relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 via-transparent to-rose-50/50"></div>
        
        {/* Small animated elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-3 left-3 w-2 h-2 bg-gradient-to-r from-purple-300/40 to-pink-300/40 rounded-full animate-pulse"></div>
          <div className="absolute top-6 right-4 w-3 h-3 bg-gradient-to-r from-blue-300/30 to-indigo-300/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-gradient-to-r from-rose-300/50 to-orange-300/50 rounded-full animate-ping"></div>
          <div className="absolute bottom-3 right-3 w-2.5 h-2.5 bg-gradient-to-r from-emerald-300/40 to-teal-300/40 rounded-full animate-pulse"></div>
        </div>

        {/* Compact Logo */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          {logoImage && !imageError ? (
            <div className="relative">
              <img
                src={getImageUrl(logoImage)}
                alt={`${club.name} logo`}
                className="w-30 h-25 object-contain hover:scale-150 transition-transform duration-500 "
                onError={handleImageError}
                onLoad={handleImageLoad}
                loading="lazy"
              />
            </div>
          ) : (
            <div className="object-contain hover:scale-150 transition-transform duration-500 ">
              <div 
                className="w-20 h-20 rounded-xl flex items-center justify-center shadow-lg border-2 border-white/70 relative overflow-hidden backdrop-blur-md"
                style={{ 
                  background: `linear-gradient(135deg, ${safeColor}60, ${safeColor}30, #8b5cf640, #06b6d440)` 
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent"></div>
                
                {/* Small floating particles */}
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse"></div>
                <div className="absolute top-3 left-2 w-1 h-1 bg-yellow-300/60 rounded-full animate-bounce"></div>
                <div className="absolute bottom-2 right-3 w-2 h-2 bg-pink-300/50 rounded-full animate-ping"></div>
                <div className="absolute bottom-2 left-2 w-1 h-1 bg-blue-300/60 rounded-full animate-pulse"></div>

                <div className="text-center text-white relative z-10">
                  <div className="w-20 h-20 flex items-center  ">
                    <ImageOff className="w-30 h-25" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Indicators */}
        <StatusIndicator />

        {/* Corner decorations */}
        <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-white/20 to-transparent rounded-tl-2xl"></div>
        <div className="absolute top-0 left-0 w-6 h-6 bg-gradient-to-br from-white/20 to-transparent rounded-br-2xl"></div>
      </div>

      {/* Compact Card Content */}
      <div className="p-4 flex-grow flex flex-col bg-gradient-to-br from-white/95 to-gray-50/90 backdrop-blur-sm">
        <h3 className="text-lg font-bold mb-2 text-gray-800 group-hover:text-purple-900 transition-colors duration-300 line-clamp-2 leading-tight">
          {club.name}
        </h3>
        
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 flex-grow mb-3">
          {club.description}
        </p>

        {/* Compact Bottom section */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Users className="w-3.5 h-3.5" />
              <span className="font-medium">{club.member_count || 0} สมาชิก</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-2">
              <Calendar className="w-3.5 h-3.5 text-gray-600" />
              <span className="font-medium">{club.activity_count || 0} กิจกรรม</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full shadow-md group-hover:scale-105 transition-transform duration-300 hover:shadow-lg">
            <span className="text-xs font-semibold">ดูรายละเอียด</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-300" />
          </div>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ 
          background: `linear-gradient(135deg, ${safeColor}40, #8b5cf640, #06b6d430)` 
        }}
      ></div>

      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-700"></div>
      </div>
    </div>
  );
};

export default ClubCard;