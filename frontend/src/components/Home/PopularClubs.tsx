import React, { useState, useEffect } from 'react';
import { Users, ArrowRight, AlertCircle } from 'lucide-react';
import { API_BASE_URL, fetchPopularClubs, fetchClubStatistics } from '../../services/http';
import type { ClubStatus } from '../../interfaces/IClubStatuses';
import type { ClubCategory } from '../../interfaces/IClubCategories';
import type { Activity } from '../../interfaces/IActivitys';
import { useNavigate } from 'react-router-dom';

interface ClubResponse {
  id: number;
  name: string;
  description: string;
  logo_image: string;
  member_count: number;
  activity_count: number;
  status: ClubStatus;
  category: ClubCategory;
  activities?: Activity[];
  members?: any[];
}
interface Statistics {
  total_clubs: number;
  total_members: number;
  total_activities: number;
  active_clubs: number;
}

const PopularClubs: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [clubs, setClubs] = useState<ClubResponse[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  const customStyles = `
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-10px) rotate(5deg); }
    }
    @keyframes float-delayed {
      0%, 100% { transform: translateY(0px) scale(1); }
      50% { transform: translateY(-8px) scale(1.1); }
    }
    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
    .animate-float-delayed {
      animation: float-delayed 4s ease-in-out infinite;
      animation-delay: 1s;
    }
  `;

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = customStyles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [clubsResult, statsResult] = await Promise.all([
          fetchPopularClubs(),
          fetchClubStatistics()
        ]);

        let safeClubs: ClubResponse[] = [];
        if (clubsResult?.success && Array.isArray(clubsResult.data)) {
          safeClubs = clubsResult.data;
        } else if (Array.isArray(clubsResult)) {
          safeClubs = clubsResult;
        } else if (clubsResult?.clubs && Array.isArray(clubsResult.clubs)) {
          safeClubs = clubsResult.clubs;
        }

        setClubs(safeClubs);

        if (statsResult?.success && statsResult.data) {
          setStatistics(statsResult.data);
        } else if (statsResult && typeof statsResult === 'object' && !statsResult.success) {
          console.warn('Failed to fetch statistics:', statsResult.error);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Function to get full image URL
  const getImageUrl = (logoImage: string): string => {
    if (!logoImage) return '';

    if (logoImage.startsWith('http://') || logoImage.startsWith('https://')) {
      return logoImage;
    }

    const cleanPath = logoImage.startsWith('/') ? logoImage : `/${logoImage}`;
    return `${API_BASE_URL}${cleanPath}`;
  };

  // Function to handle image load errors
  const handleImageError = (clubId: number) => {
    setImageErrors(prev => new Set(prev).add(clubId));
  };

  function handleToClubs() {
    navigate('/clubs');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }

  const handleToClubPage = (clubId: number) => {
    navigate(`/clubs/${clubId}`);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  // Color palette matching FeaturedEvents
  const colors = {
    primary: '#640D5F',    // Deep purple
    secondary: '#D91656',  // Pink/Red
    accent1: '#EB5B00',    // Orange
    accent2: '#FFB200'     // Yellow
  };

  const getCategoryColor = (categoryName: string) => {
    const colorMap: { [key: string]: string } = {
      'วิชาการ': colors.primary,
      'บำเพ็ญประโยชน์': colors.secondary,
      'กีฬา': colors.accent1,
      'วัฒนธรรม': colors.primary,
      'ทักษะชีวิต': colors.accent2,
      'สังสรรค์': colors.accent1,
    };
    return colorMap[categoryName] || '#6B7280';
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#640D5F] border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลดชมรม...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-[#D91656] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">เกิดข้อผิดพลาด</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-[#640D5F] text-white rounded-lg hover:bg-[#640D5F]/90 transition-colors"
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        </div>
      </section>
    );
  }

  // No clubs state
  if (clubs.length === 0) {
    return (
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีชมรมแนะนำในขณะนี้</h3>
            <p className="text-gray-600">กรุณาติดตามชมรมใหม่ๆ ในเร็วๆ นี้</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            ชมรม
            <span className="text-[#640D5F]">ยอดนิยม</span>
          </h2>
          <div className="w-24 h-1 bg-[#640D5F] mx-auto rounded-full mb-6"></div>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            ชมรมที่มีกิจกรรมน่าสนใจและมีสมาชิกเข้าร่วมมากที่สุด
          </p>
        </div>

        {/* Clubs Grid with staggered animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12 md:mb-16">
          {clubs.map((club, index) => (
            <div
              key={club.id}
              className={`group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer flex flex-col h-full ${hoveredCard === club.id ? 'ring-2 ring-[#FFB200] ring-opacity-50 shadow-xl' : ''
                }`}
              style={{
                animationDelay: `${index * 0.1}s`,
                opacity: loading ? 0 : 1,
                transform: loading ? 'translateY(20px)' : 'translateY(0)'
              }}
              onMouseEnter={() => setHoveredCard(club.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleToClubPage(club.id)}
            >
              {/* Logo Section - Modern Design */}
              <div className="h-48 md:h-56 relative overflow-hidden">
                {club.logo_image && !imageErrors.has(club.id) ? (
                  <div className="w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center relative">
                    {/* Floating geometric shapes */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div
                        className="absolute top-4 right-8 w-12 h-12 rounded-lg opacity-10 rotate-12 animate-float"
                        style={{ backgroundColor: getCategoryColor(club.category?.Name || '') }}
                      ></div>
                      <div
                        className="absolute bottom-6 left-6 w-8 h-8 rounded-full opacity-15 animate-float-delayed"
                        style={{ backgroundColor: getCategoryColor(club.category?.Name || '') }}
                      ></div>
                      <div
                        className="absolute top-1/2 left-4 w-4 h-16 opacity-8 rotate-45 animate-pulse"
                        style={{ backgroundColor: getCategoryColor(club.category?.Name || '') }}
                      ></div>
                    </div>

                    {/* Main logo container */}
                    <div className="relative z-10 group-hover:scale-105 transition-transform duration-500">
                      {/* Glassmorphism container */}
                      <div className="relative p-6">
                        {/* Outer glow */}
                        <div
                          className="absolute inset-0 rounded-2xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-500"
                          style={{ backgroundColor: getCategoryColor(club.category?.Name || '') }}
                        ></div>

                        {/* Glass card */}
                        <div className="relative bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/50 group-hover:bg-white/90 transition-all duration-500">
                          <img
                            src={getImageUrl(club.logo_image)}
                            alt={`${club.name} logo`}
                            className="w-20 h-20 md:w-24 md:h-24 object-contain mx-auto filter drop-shadow-sm group-hover:drop-shadow-md transition-all duration-500"
                            onError={() => handleImageError(club.id)}
                            loading="lazy"
                          />

                          {/* Subtle reflection effect */}
                          <div className="absolute inset-x-6 bottom-6 h-1 bg-gradient-to-r from-transparent via-black/5 to-transparent"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 via-white to-gray-50 flex items-center justify-center relative overflow-hidden">
                    {/* Modern geometric background */}
                    <div className="absolute inset-0">
                      {/* Grid pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
                          {[...Array(48)].map((_, i) => (
                            <div
                              key={i}
                              className="border-r border-b border-gray-300"
                              style={{ animationDelay: `${i * 0.05}s` }}
                            ></div>
                          ))}
                        </div>
                      </div>

                      {/* Floating elements */}
                      <div
                        className="absolute top-6 right-6 w-16 h-16 rounded-2xl rotate-12 opacity-10 animate-float"
                        style={{ backgroundColor: getCategoryColor(club.category?.Name || '') }}
                      ></div>
                      <div
                        className="absolute bottom-8 left-8 w-10 h-10 rounded-full opacity-15 animate-bounce"
                        style={{ backgroundColor: getCategoryColor(club.category?.Name || '') }}
                      ></div>
                      <div
                        className="absolute top-1/3 left-1/4 w-6 h-6 rounded rotate-45 opacity-10 animate-pulse"
                        style={{ backgroundColor: getCategoryColor(club.category?.Name || '') }}
                      ></div>
                    </div>

                    {/* Modern club placeholder */}
                    <div className="relative z-10 group-hover:scale-105 transition-transform duration-500">
                      <div className="relative">
                        {/* Glassmorphism container */}
                        <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/30 group-hover:bg-white/80 group-hover:shadow-2xl transition-all duration-500">
                          {/* Modern icon with category color */}
                          <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:shadow-xl transition-shadow duration-500"
                            style={{ backgroundColor: getCategoryColor(club.category?.Name || '') }}
                          >
                            <Users className="w-8 h-8 text-white" />
                          </div>

                          {/* Club info */}
                          <div className="text-center space-y-1">
                            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              {club.category?.Name}
                            </div>
                            <div className="text-sm font-bold text-gray-900 leading-tight">
                              {club.name.length > 15 ? `${club.name.slice(0, 15)}...` : club.name}
                            </div>
                          </div>

                          {/* Bottom accent */}
                          <div
                            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-t-full opacity-50"
                            style={{ backgroundColor: getCategoryColor(club.category?.Name || '') }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Badge - Only show if active */}
                {club.status?.IsActive && (
                  <div className="absolute top-3 left-3 bg-green-500/90 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs font-medium shadow-lg">
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                      <span>เปิดรับสมาชิก</span>
                    </div>
                  </div>
                )}

                {/* Category Badge */}
                <div
                  className="absolute top-3 right-3 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg"
                  style={{ backgroundColor: getCategoryColor(club.category?.Name || '') }}
                >
                  {club.category?.Name}
                </div>
              </div>

              {/* Content Section */}
              <div className="p-4 flex flex-col flex-grow">
                {/* Club Name */}
                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#640D5F] transition-colors min-h-[2.5rem] flex items-start leading-tight">
                  {club.name}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-xs md:text-sm mb-3 leading-relaxed line-clamp-2 h-[2rem] md:h-[2.5rem] overflow-hidden">
                  {club.description}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between mb-3 text-xs md:text-sm">
                  <div className="flex items-center text-gray-600">
                    <Users className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    <span className="font-medium">{club.member_count}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <div
                      className="w-2 h-2 rounded-full mr-1"
                      style={{ backgroundColor: getCategoryColor(club.category?.Name || '') }}
                    ></div>
                    <span>{club.activity_count || 0} กิจกรรม</span>
                  </div>
                </div>

                {/* Spacer */}
                <div className="flex-grow"></div>

                {/* Footer - Simple CTA */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-center space-x-1 text-[#640D5F] group-hover:text-[#D91656] transition-colors">
                    <span className="text-xs font-medium">ดูชมรม</span>
                    <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced CTA with gradient */}
        <div className="text-center mb-12 md:mb-16">
          <button
            className="inline-flex items-center space-x-2 bg-[#640D5F] hover:bg-[#640D5F]/90 text-white px-8 py-4 rounded-full font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
            onClick={handleToClubs}
          >
            <span>สำรวจชมรมทั้งหมด</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {[
            {
              value: statistics?.total_members || clubs.reduce((total, club) => total + club.member_count, 0),
              label: 'สมาชิกทั้งหมด',
              color: 'text-[#640D5F]',
              icon: Users
            },
            {
              value: statistics?.total_activities || clubs.reduce((total, club) => total + (club.activity_count || 0), 0),
              label: 'กิจกรรมทั้งหมด',
              color: 'text-[#D91656]',
              icon: ArrowRight
            },
            {
              value: statistics?.active_clubs || clubs.filter(club => club.status?.IsActive).length,
              label: 'ชมรมที่อนุมัติแล้ว',
              color: 'text-[#EB5B00]',
              icon: AlertCircle
            },
            {
              value: statistics?.total_clubs || clubs.length,
              label: 'ชมรมทั้งหมด',
              color: 'text-[#FFB200]',
              icon: Users
            }
          ].map((stat, index) => (
            <div key={index} className="text-center p-4 rounded-xl">
              <div className={`text-3xl md:text-4xl font-bold mb-2 ${stat.color}`}>
                {stat.value}
              </div>
              <p className="text-gray-600 text-sm md:text-base">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularClubs;