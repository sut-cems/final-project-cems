import React, { useEffect, useState } from 'react';
import { Clock, MapPin, ArrowRight, User, AlertCircle, ImageOff } from 'lucide-react';
import { API_BASE_URL, fetchActivityStatistics, fetchFeaturedActivities } from '../../services/http';
import type { Activity } from '../../interfaces/IActivitys';
import type { ActivityRegistration } from '../../interfaces/IActivityRegistrations';

interface ActivityStatistics {
  total_activities: number;
  active_activities: number;
  total_registrations: number;
  average_rating: number;
  upcoming_activities: number;
  activities_this_month: number;
}

interface ActivityDisplay {
  activity: Activity;
  color: string;
}

const FeaturedEvents: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [statistics, setStatistics] = useState<ActivityStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Function to get full image URL 
  const getImageUrl = (posterImage: string): string => {
    if (!posterImage) return '';

    if (posterImage.startsWith('http://') || posterImage.startsWith('https://')) {
      return posterImage;
    }

    const cleanPath = posterImage.startsWith('/') ? posterImage : `/${posterImage}`;
    return `${API_BASE_URL}${cleanPath}`;
  };

  // Function to handle image load errors 
  const handleImageError = (activityId: number) => {
    setImageErrors(prev => new Set(prev).add(activityId));
  };

  const getGradientForCategory = (categoryName: string): string => {
    const gradientMap: { [key: string]: string } = {
      'วิชาการ': 'from-blue-600 to-indigo-700',
      'บำเพ็ญประโยชน์': 'from-red-500 to-pink-600',
      'กีฬา': 'from-orange-500 to-red-600',
      'วัฒนธรรม': 'from-purple-600 to-indigo-600',
      'ทักษะชีวิต': 'from-green-500 to-teal-600',
      'สังสรรค์': 'from-yellow-500 to-orange-500',
    };
    return gradientMap[categoryName] || 'from-gray-600 to-gray-800';
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [activitiesData, statisticsData] = await Promise.all([
          fetchFeaturedActivities(),
          fetchActivityStatistics(),
        ]);

        const safeActivities = Array.isArray(activitiesData.activities)
          ? activitiesData.activities
          : [];

        setActivities(safeActivities);
        setStatistics(statisticsData.statistics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const activityDisplayConfig: ActivityDisplay[] = activities.map(activity => ({
    activity,
    color: getGradientForCategory(activity.Category?.Name || '')
  }));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short'
    });
  };

  const formatTime = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.`;
  };

  const getAvailableSeats = (capacity: number, registrations: ActivityRegistration[] = []) => {
    const approvedCount = registrations.filter(r => r.StatusID === 1).length;
    return capacity - approvedCount;
  };

  const getCategoryColor = (categoryName: string) => {
    const colorMap: { [key: string]: string } = {
      'วิชาการ': '#2563eb',
      'บำเพ็ญประโยชน์': '#dc2626',
      'กีฬา': '#ea580c',
      'วัฒนธรรม': '#7c3aed',
      'ทักษะชีวิต': '#059669',
      'สังสรรค์': '#d97706',
    };
    return colorMap[categoryName] || '#6b7280';
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-900 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">กำลังโหลดกิจกรรม...</p>
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

  // No activities state
  if (activities.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">ไม่มีกิจกรรมแนะนำในขณะนี้</h3>
            <p className="text-gray-600">กรุณาติดตามกิจกรรมใหม่ๆ ในเร็วๆ นี้</p>
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
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-600 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-900 via-pink-700 to-orange-600 bg-clip-text text-transparent mb-4">
              กิจกรรมแนะนำ
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-purple-900 to-orange-600 mx-auto rounded-full"></div>
          </div>
          <p className="text-gray-600 mt-6 text-lg max-w-2xl mx-auto">
            กิจกรรมน่าสนใจที่กำลังจะมาถึงเร็วๆ นี้
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activityDisplayConfig.map((activityDisplay) => (
            <div
              key={activityDisplay.activity.ID}
              className={`group relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-500 transform hover:scale-105 hover:shadow-2xl cursor-pointer ${hoveredCard === activityDisplay.activity.ID ? 'ring-4 ring-yellow-400' : ''
                }`}
              onMouseEnter={() => setHoveredCard(activityDisplay.activity.ID)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Event Image with Background */}
              <div className="h-64 relative overflow-hidden">
                {/* Background Image */}
                {activityDisplay.activity.PosterImage && !imageErrors.has(activityDisplay.activity.ID) ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transform group-hover:scale-110 transition-transform duration-700"
                    style={{
                      backgroundImage: `url(${getImageUrl(activityDisplay.activity.PosterImage)})`,
                    }}
                  >
                    {/* Dark overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/50"></div>
                  </div>
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${activityDisplay.color} transform group-hover:scale-110 transition-transform duration-700`}>
                    {/* Pattern overlay for fallback */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                      <div className="absolute top-4 right-4 w-8 h-8 bg-white/30 rounded-full animate-ping"></div>
                      <div className="absolute bottom-6 left-6 w-6 h-6 bg-white/20 rounded-full animate-pulse"></div>
                      <div className="absolute top-1/2 right-8 w-4 h-4 bg-white/25 rounded-full animate-bounce"></div>
                    </div>

                    {/* No image indicator */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-3 mx-auto backdrop-blur-sm">
                          <ImageOff className="w-10 h-10" />
                        </div>
                        <span className="text-sm font-medium drop-shadow-md">ไม่มีภาพกิจกรรม</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hidden image for error detection */}
                {activityDisplay.activity.PosterImage && (
                  <img
                    src={getImageUrl(activityDisplay.activity.PosterImage)}
                    alt={activityDisplay.activity.Title}
                    className="hidden"
                    onError={() => handleImageError(activityDisplay.activity.ID)}
                    loading="lazy"
                  />
                )}

                {/* Date Badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-xl z-20 backdrop-blur-sm border border-white/20">
                  {formatDate(activityDisplay.activity.DateStart)}
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4 px-4 py-2 bg-gradient-to-r from-purple-600/90 to-pink-600/90 rounded-full text-white text-sm font-medium backdrop-blur-sm shadow-xl border border-white/20 z-20">
                  {activityDisplay.activity.Category?.Name}
                </div>

                {/* Status Indicator */}
                {activityDisplay.activity.Status?.IsActive && (
                  <div className="absolute top-16 left-4 flex items-center space-x-2 z-20">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                    <div className="w-2 h-2 bg-green-300 rounded-full animate-ping"></div>
                    <span className="text-white text-xs font-medium drop-shadow-md">กำลังรับสมัคร</span>
                  </div>
                )}

                {/* Event Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 z-20">
                  <div className="bg-gradient-to-t from-black/80 via-gray-900/50 to-transparent p-6 pt-20">
                    <h3 className="text-2xl font-extrabold text-white mb-2 line-clamp-2 drop-shadow-xl">
                      {activityDisplay.activity.Title}
                    </h3>
                    <div className="flex items-center text-white/90 text-sm">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="drop-shadow-md">{formatTime(activityDisplay.activity.DateStart, activityDisplay.activity.DateEnd)}</span>
                    </div>
                  </div>
                </div>

                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/20 z-10"></div>
              </div>

              {/* Card Content */}
              <div className="p-6 bg-white">
                {/* Event Description */}
                <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
                  {activityDisplay.activity.Description}
                </p>

                {/* Location */}
                <div className="flex items-center text-gray-500 text-sm mb-4">
                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="line-clamp-1">{activityDisplay.activity.Location}</span>
                </div>

                {/* Capacity Info with Progress Bar */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium" style={{ color: getCategoryColor(activityDisplay.activity.Category?.Name ?? '') }}>
                    เหลือที่นั่ง: {
                      getAvailableSeats(
                        activityDisplay.activity.Capacity,
                        activityDisplay.activity.ActivityRegistrations || []
                      )
                    }/{activityDisplay.activity.Capacity}
                  </div>
                  <div className="w-full max-w-24 bg-gray-200 rounded-full h-2 ml-3">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${((activityDisplay.activity.ActivityRegistrations?.length || 0) / activityDisplay.activity.Capacity) * 100}%`,
                        backgroundColor: getCategoryColor(activityDisplay.activity.Category?.Name ?? '')
                      }}
                    ></div>
                  </div>
                </div>

                {/* Bottom Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-400 text-xs">
                    <User className="w-3 h-3 mr-1" />
                    <span>{activityDisplay.activity.Club?.Name}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-orange-600 group-hover:text-purple-900 transition-colors duration-300">
                    <span className="text-sm font-medium">ดูรายละเอียด</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-orange-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <button className="group relative px-8 py-4 bg-gradient-to-r from-purple-900 via-pink-700 to-orange-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
            <span className="relative z-10 flex items-center space-x-2">
              <span>ดูกิจกรรมทั้งหมด</span>
              <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Statistics */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-900 mb-2">
              {statistics?.total_registrations || '0'}
            </div>
            <p className="text-gray-600">ผู้สมัครทั้งหมด</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-700 mb-2">
              {statistics?.activities_this_month || '0'}
            </div>
            <p className="text-gray-600">กิจกรรมในเดือนนี้</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {statistics?.upcoming_activities || '0'}
            </div>
            <p className="text-gray-600">กิจกรรมที่กำลังมา</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-500 mb-2">
              {statistics?.average_rating ? statistics.average_rating.toFixed(1) : '0.0'}
            </div>
            <p className="text-gray-600">คะแนนความพึงพอใจ</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedEvents;