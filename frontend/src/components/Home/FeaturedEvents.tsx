import React, { useEffect, useState } from 'react';
import { Clock, MapPin, ArrowRight, User, AlertCircle, ImageOff, Calendar, Users } from 'lucide-react';
import { API_BASE_URL, fetchActivityStatistics, fetchFeaturedActivities } from '../../services/http';
import type { Activity } from '../../interfaces/IActivitys';
import { useNavigate } from 'react-router-dom';

interface ActivityStatistics {
  total_activities: number;
  active_activities: number;
  total_registrations: number;
  average_rating: number;
  upcoming_activities: number;
  activities_this_month: number;
}

const FeaturedEvents: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [statistics, setStatistics] = useState<ActivityStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

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

  function handleClickToActivities() {
    navigate('/activities');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }

  const handleToActivityPage = (activityId: number) => {
    navigate(`/activities/${activityId}`);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  // Color palette from ColorHunt
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

  const getCategoryBg = (categoryName: string) => {
    const bgMap: { [key: string]: string } = {
      'วิชาการ': 'bg-[#640D5F]',
      'บำเพ็ญประโยชน์': 'bg-[#D91656]',
      'กีฬา': 'bg-[#EB5B00]',
      'วัฒนธรรม': 'bg-[#640D5F]',
      'ทักษะชีวิต': 'bg-[#FFB200]',
      'สังสรรค์': 'bg-[#EB5B00]',
    };
    return bgMap[categoryName] || 'bg-gray-600';
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

  const getAvailableSeats = (capacity: number, registrations: { StatusID: number }[] = []) => {
    const approvedCount = registrations.filter(r => r.StatusID === 1).length;
    return capacity - approvedCount;
  };

  const getRegistrationPercentage = (capacity: number, registrations: { StatusID: number }[] = []) => {
    const approvedCount = registrations.filter(r => r.StatusID === 1).length;
    return (approvedCount / capacity) * 100;
  };

  if (loading) {
    return (
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#640D5F] border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลดกิจกรรม...</p>
          </div>
        </div>
      </section>
    );
  }

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

  if (activities.length === 0) {
    return (
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีกิจกรรมแนะนำในขณะนี้</h3>
            <p className="text-gray-600">กรุณาติดตามกิจกรรมใหม่ๆ ในเร็วๆ นี้</p>
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
            กิจกรรม
            <span className="text-[#640D5F]">แนะนำ</span>
          </h2>
          <div className="w-24 h-1 bg-[#640D5F] mx-auto rounded-full mb-6"></div>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            กิจกรรมน่าสนใจที่กำลังจะมาถึงเร็วๆ นี้
          </p>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          {activities.map((activity) => (
            <div
              key={activity.ID}
              className={`group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer flex flex-col h-full ${
                hoveredCard === activity.ID ? 'ring-2 ring-[#FFB200] ring-opacity-50' : ''
              }`}
              onMouseEnter={() => setHoveredCard(activity.ID)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleToActivityPage(activity.ID)}
            >
              {/* Image Section */}
              <div className="h-48 md:h-56 relative overflow-hidden">
                {activity.PosterImage && !imageErrors.has(activity.ID) ? (
                  <img
                    src={getImageUrl(activity.PosterImage)}
                    alt={activity.Title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={() => handleImageError(activity.ID)}
                    loading="lazy"
                  />
                ) : (
                  <div className={`w-full h-full ${getCategoryBg(activity.Category?.Name || '')} flex items-center justify-center relative overflow-hidden`}>
                    {/* Simple pattern overlay */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-4 right-4 w-20 h-20 bg-white rounded-full"></div>
                      <div className="absolute bottom-4 left-4 w-12 h-12 bg-white rounded-full"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full"></div>
                    </div>
                    
                    <div className="text-center text-white z-10">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 mx-auto backdrop-blur-sm">
                        <ImageOff className="w-8 h-8" />
                      </div>
                      <span className="text-sm font-medium">ไม่มีภาพกิจกรรม</span>
                    </div>
                  </div>
                )}
                
                {/* Status Badge */}
                {activity.Status?.IsActive && (
                  <div className="absolute top-3 left-3 flex items-center space-x-2 bg-green-500 px-3 py-1 rounded-full text-white text-xs font-medium">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>เปิดรับสมัคร</span>
                  </div>
                )}
                
                {/* Date Badge */}
                <div className="absolute top-3 right-3 bg-[#FFB200] text-white px-3 py-1 rounded-full text-sm font-medium">
                  {formatDate(activity.DateStart)}
                </div>
              </div>

              {/* Content Section */}
              <div className="p-5 flex flex-col flex-grow">
                {/* Category */}
                <div className="flex items-center justify-between mb-2">
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: getCategoryColor(activity.Category?.Name || '') }}
                  >
                    {activity.Category?.Name}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#640D5F] transition-colors min-h-[3rem] flex items-start">
                  {activity.Title}
                </h3>

                {/* Description - Optimized height */}
                <p className="text-gray-600 text-sm mb-3 leading-relaxed line-clamp-2 h-[2.5rem] overflow-hidden">
                  {activity.Description}
                </p>

                {/* Time & Location */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{formatTime(activity.DateStart, activity.DateEnd)}</span>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="line-clamp-1">{activity.Location}</span>
                  </div>
                </div>

                {/* Spacer to push bottom content down */}
                <div className="flex-grow"></div>

                {/* Capacity - Always at bottom */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-gray-700 font-medium">
                      เหลือที่นั่ง: {getAvailableSeats(activity.Capacity, activity.ActivityRegistrations)}/{activity.Capacity}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {Math.round(getRegistrationPercentage(activity.Capacity, activity.ActivityRegistrations))}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${getRegistrationPercentage(activity.Capacity, activity.ActivityRegistrations)}%`,
                        backgroundColor: getCategoryColor(activity.Category?.Name || '')
                      }}
                    />
                  </div>
                </div>

                {/* Footer - Always at bottom */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center text-gray-400 text-xs">
                    <User className="w-3.5 h-3.5 mr-1.5" />
                    <span className="truncate">{activity.Club?.Name}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-[#640D5F] group-hover:text-[#D91656] transition-colors flex-shrink-0">
                    <span className="text-xs font-medium">ดูรายละเอียด</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mb-12 md:mb-16">
          <button 
            className="inline-flex items-center space-x-2 bg-[#640D5F] hover:bg-[#640D5F]/90 text-white px-8 py-4 rounded-full font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
            onClick={handleClickToActivities}
          >
            <span>ดูกิจกรรมทั้งหมด</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {[
            { value: statistics?.total_registrations || 0, label: 'ผู้สมัครทั้งหมด', color: 'text-[#640D5F]', icon: Users },
            { value: statistics?.activities_this_month || 0, label: 'กิจกรรมในเดือนนี้', color: 'text-[#D91656]', icon: Calendar },
            { value: statistics?.upcoming_activities || 0, label: 'กิจกรรมที่กำลังมา', color: 'text-[#EB5B00]', icon: Clock },
            { value: statistics?.average_rating ? statistics.average_rating.toFixed(1) : '0.0', label: 'คะแนนความพึงพอใจ', color: 'text-[#FFB200]', icon: ArrowRight }
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

export default FeaturedEvents;