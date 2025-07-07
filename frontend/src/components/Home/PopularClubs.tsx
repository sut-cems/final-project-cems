import React, { useState, useEffect } from 'react';
import { Users, ArrowRight, AlertCircle, ImageOff } from 'lucide-react';
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

interface ClubDisplay {
  club: ClubResponse;
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

  const clubDisplayConfig: ClubDisplay[] = clubs.map(club => ({
    club
  }));
  function handleToClubs() {
    navigate('/clubs');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }

  // Loading state
  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-900 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">กำลังโหลดชมรม...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">เกิดข้อผิดพลาด</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-purple-900 text-white rounded-lg hover:bg-purple-800 transition-colors"
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
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">ไม่มีชมรมแนะนำในขณะนี้</h3>
            <p className="text-gray-600">กรุณาติดตามชมรมใหม่ๆ ในเร็วๆ นี้</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-900 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-900 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-4">
              ชมรมยอดนิยม
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-purple-900 to-orange-500 mx-auto rounded-full"></div>
          </div>
          <p className="text-gray-600 mt-6 text-lg max-w-2xl mx-auto">
            ชมรมที่มีกิจกรรมน่าสนใจและมีสมาชิกเข้าร่วมมากที่สุด
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {clubDisplayConfig.map((clubDisplay) => (
            <div
              key={clubDisplay.club.id}
              className={`group relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-500 transform hover:scale-105 hover:shadow-2xl cursor-pointer ${hoveredCard === clubDisplay.club.id ? 'ring-4 ring-orange-300' : ''
                }`}
              onMouseEnter={() => setHoveredCard(clubDisplay.club.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Card Header with Dynamic Background */}
              <div className="h-48 relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                {/* Logo Image or Fallback */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {clubDisplay.club.logo_image && !imageErrors.has(clubDisplay.club.id) ? (
                    <>
                      <img
                        src={getImageUrl(clubDisplay.club.logo_image)}
                        alt={`${clubDisplay.club.name} logo`}
                        className="w-40 h-40 object-contain transform group-hover:scale-110 transition-transform duration-500 shadow-2xl rounded-xl border-2 border-white/50 bg-white/10 backdrop-blur-sm p-2"
                        onError={() => handleImageError(clubDisplay.club.id)}
                        loading="lazy"
                      />
                      {/* Hidden image for error detection */}
                      <img
                        src={getImageUrl(clubDisplay.club.logo_image)}
                        alt={`${clubDisplay.club.name} logo`}
                        className="hidden"
                        onError={() => handleImageError(clubDisplay.club.id)}
                        loading="lazy"
                      />
                    </>
                  ) : (
                    <div className="transform group-hover:scale-110 transition-transform duration-500 flex flex-col items-center space-y-3">
                      <div className="w-40 h-40 bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400 rounded-xl flex items-center justify-center shadow-xl border-2 border-white relative overflow-hidden">
                        {/* Animated background pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                        <div className="absolute top-2 right-2 w-4 h-4 bg-white/30 rounded-full animate-ping"></div>
                        <div className="absolute bottom-3 left-3 w-6 h-6 bg-white/20 rounded-full animate-pulse"></div>

                        {/* Content */}
                        <div className="text-center text-white relative z-10">
                          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto backdrop-blur-sm">
                            <ImageOff className="w-8 h-8" />
                          </div>
                          <span className="text-xs font-medium drop-shadow-sm">ไม่มีโลโก้</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Club Category Badge */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white text-xs font-medium backdrop-blur-sm shadow-lg border border-white/20">
                  {clubDisplay.club.category.Name}
                </div>

                {/* Status Indicator */}
                {clubDisplay.club.status.IsActive && (
                  <div className="absolute top-4 right-4 flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                    <div className="w-2 h-2 bg-green-300 rounded-full animate-ping"></div>
                  </div>
                )}

                {/* Decorative elements */}
                <div className="absolute bottom-6 left-6 w-3 h-3 bg-white/40 rounded-full animate-bounce"></div>
                <div className="absolute top-1/2 right-8 w-2 h-2 bg-orange-300/60 rounded-full animate-pulse"></div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-purple-900 transition-colors duration-300">
                  {clubDisplay.club.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
                  {clubDisplay.club.description}
                </p>

                {/* Members count and status */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">สมาชิก: {clubDisplay.club.member_count} คน</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    {clubDisplay.club.activity_count
                      ? `จำนวนกิจกรรม: ${clubDisplay.club.activity_count} กิจกรรม`
                      : 'ขณะนี้ยังไม่มีกิจกรรมที่จัดขึ้น'}
                  </div>
                  <div className="flex items-center space-x-1 text-orange-500 group-hover:text-purple-900 transition-colors duration-300">
                    <span className="text-sm font-medium">ดูรายละเอียด</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-orange-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none"></div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <button className="group relative px-8 py-4 bg-gradient-to-r from-purple-900 via-pink-600 to-orange-500 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105  transition-all duration-300 overflow-hidden"
            onClick={handleToClubs}>
            <span className="relative z-10 flex items-center space-x-2">
              <span>ดูชมรมทั้งหมด</span>
              <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Statistics */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-900 mb-2">
              {statistics?.total_members || clubDisplayConfig.reduce((total, club) => total + club.club.member_count, 0)}
            </div>
            <p className="text-gray-600">สมาชิกทั้งหมด</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-600 mb-2">
              {statistics?.total_activities || clubDisplayConfig.reduce((total, club) => total + (club.club.activities?.length || 0), 0) || 0}
            </div>
            <p className="text-gray-600">กิจกรรมทั้งหมด</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500 mb-2">
              {statistics?.active_clubs || clubDisplayConfig.filter(club => club.club.status.IsActive).length}
            </div>
            <p className="text-gray-600">ชมรมที่อนุมัติแล้ว</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-500 mb-2">
              {statistics?.total_clubs || clubDisplayConfig.length}
            </div>
            <p className="text-gray-600">ชมรมทั้งหมด</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularClubs;