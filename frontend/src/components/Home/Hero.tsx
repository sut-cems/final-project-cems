import { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  Bell,
  Clock,
  ArrowRight,
  Star,
  PlusCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { HomePageStats, ReviewStats } from '../../interfaces/HomeStats';
import { getHomePageStats, getReviewStats } from '../../services/http/dashboard';
import LoginModal from '../../pages/Auth/Login/Login';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoggedIn] = useState(localStorage.getItem('isLogin') === 'true');
  const navigate = useNavigate();
  const [stats, setStats] = useState<HomePageStats | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);

  const slides = [
    {
      id: 1,
      title: "ค้นพบกิจกรรมและชมรม",
      subtitle: "ในมหาวิทยาลัยของคุณ",
      description: "ระบบจัดการชมรมและกิจกรรมที่ทันสมัย ช่วยให้คุณค้นหา เข้าร่วม และบริหารจัดการได้อย่างมีประสิทธิภาพ",
      icon: Calendar,
      gradient: "from-purple-500 to-pink-500",
      iconTitle: "ค้นหากิจกรรม",
      features: ["ลงทะเบียนออนไลน์", "เช็กชื่ออัตโนมัติ", "จัดการสถานที่"],
      stats: { clubs: "", events: "", students: "" },
      image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1280&fit=crop"
    },
    {
      id: 2,
      title: "เข้าร่วมชุมชน",
      subtitle: "และสร้างเครือข่าย",
      description: "พบกับเพื่อนใหม่ในชมรมที่คุณสนใจ พร้อมระบบแจ้งเตือนข่าวสารชมรมแบบเรียลไทม์",
      icon: Users,
      gradient: "from-orange-500 to-red-500",
      iconTitle: "เข้าร่วมชุมชน",
      features: ["หมวดหมู่ชมรมหลากหลาย", "ระบบสมาชิกชมรม", "ข่าวสารชมรม"],
      stats: { clubs: "", events: "", students: "" },
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop&crop=center"
    },
    {
      id: 3,
      title: "บันทึกชั่วโมงกิจกรรม",
      subtitle: "และสร้างผลงาน",
      description: "ระบบบันทึกชั่วโมงกิจกรรมอัตโนมัติ พร้อมการตรวจสอบและสร้างรายงานสำหรับทุนการศึกษา",
      icon: Clock,
      gradient: "from-yellow-500 to-orange-500",
      iconTitle: "บันทึกชั่วโมง",
      features: ["บันทึกชั่วโมงอัตโนมัติ", "การตรวจสอบ", "สร้างรายงาน"],
      stats: { clubs: "", events: "", students: "" },
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop&crop=center"
    },
    {
      id: 4,
      title: "ระบบแจ้งเตือน",
      subtitle: "ไม่พลาดทุกกิจกรรม",
      description: "รับแจ้งเตือนกิจกรรมใหม่ ข่าวสารชมรม และการอัปเดตสถานะการลงทะเบียนแบบทันที",
      icon: Bell,
      gradient: "from-purple-500 to-indigo-500",
      iconTitle: "ระบบแจ้งเตือน",
      features: ["แจ้งเตือนกิจกรรม", "ข่าวสารชมรม", "อัปโหลดสื่อ"],
      stats: { clubs: "", events: "", students: "" },
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop&crop=center"
    },
  ];

  // Auto slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    getHomePageStats()
      .then(setStats)
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    getReviewStats()
      .then(setReviewStats)
      .catch((err) => console.error("Review Stats Error:", err));
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // ฟังก์ชันสำหรับจัดการการคลิกปุ่มค้นหากิจกรรม
  const handleActivity = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (navigate && typeof navigate === 'function') {
        navigate('/activities');
      } else {
        window.location.href = '/activities';
      }

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);

    } catch (error) {
      window.location.href = '/activities';
    }
  };
  // ฟังก์ชันสำหรับจัดการการคลิกปุ่มสร้างชมรม
  const handleCreateClub = () => {
    console.log('สร้างชมรมใหม่ clicked, isLoggedIn:', isLoggedIn);
    if (isLoggedIn) {
      navigate('/create-club');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      setShowLoginModal(true);
    }
  };

  const currentSlideData = slides[currentSlide];
  const IconComponent = currentSlideData.icon;

  return (
    <section className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-20 sm:w-32 h-20 sm:h-32 bg-[#640D5F] rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-24 sm:w-40 h-24 sm:h-40 bg-[#D91656] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-16 sm:w-24 h-16 sm:h-24 bg-[#EB5B00] rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-6rem)] lg:min-h-[calc(100vh-8rem)]">

          {/* Left Column - Content */}
          <div className="lg:col-span-7 xl:col-span-6 space-y-6 sm:space-y-8">
            <div className="space-y-4 sm:space-y-6">
              {/* Feature Badge */}
              <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-[#FFB200]/10 rounded-full backdrop-blur-sm border border-[#FFB200]/20">
                <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 text-[#EB5B00] mr-2 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-[#EB5B00] whitespace-nowrap">
                  {currentSlideData.features[0]}
                </span>
              </div>

              {/* Main Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                {currentSlideData.title}
                <br />
                <span className="bg-gradient-to-r from-[#D91656] to-[#EB5B00] bg-clip-text text-transparent">
                  {currentSlideData.subtitle}
                </span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-2xl">
                {currentSlideData.description}
              </p>
            </div>

            {/* Stats Grid - Responsive */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 py-4">
              <div className="text-center p-3 sm:p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#640D5F] mb-1">
                  {stats?.total_clubs ?? currentSlideData.stats.clubs}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 font-medium">ชมรม</div>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#D91656] mb-1">
                  {stats?.total_events ?? currentSlideData.stats.events}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 font-medium">กิจกรรม</div>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#EB5B00] mb-1">
                  {stats?.total_students ?? currentSlideData.stats.students}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 font-medium">นักศึกษา</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-2 sm:pt-4">
              <button
                onClick={(e) => {
                  handleActivity(e);
                }}
                className="w-full sm:w-auto bg-[#640D5F] hover:bg-[#640D5F]/90 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 font-medium"
                style={{
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 40,
                  backgroundColor: '#640D5F' // บังคับสี
                }}
                type="button"
              >
                <span className="whitespace-nowrap">ค้นหากิจกรรม</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              </button>

              <div className="relative group">
                <button
                  onClick={handleCreateClub}
                  className="w-full sm:w-auto border-2 border-[#640D5F] text-[#640D5F] px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-full hover:bg-[#640D5F] hover:text-white transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 font-medium text-sm sm:text-base cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis">สร้างชมรมใหม่</span>
                </button>

                {/* Tooltip */}
                {!isLoggedIn && (
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                    กรุณาเข้าสู่ระบบก่อน
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Rating */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 pt-2 sm:pt-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${reviewStats && i < Math.round(reviewStats.average_rating)
                      ? "text-[#FFB200] fill-current"
                      : "text-gray-300"
                      }`}
                  />
                ))}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                <span className="font-semibold">
                  {reviewStats ? reviewStats.average_rating.toFixed(1) : "0.0"}
                </span>{" "}
                จาก{" "}
                <span className="font-semibold">
                  {reviewStats ? `${reviewStats.total_reviews.toLocaleString()}` : "0"}
                </span>{" "}
                รีวิว
              </div>
            </div>

            {/* Login Status Indicator */}
            <div className="text-sm text-gray-500">
              {isLoggedIn ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">พร้อมใช้งาน</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#FFB200] rounded-full animate-pulse"></div>
                  <span className="text-[#EB5B00]">ยังไม่ได้เข้าสู่ระบบ</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="lg:col-span-5 xl:col-span-6 relative order-first lg:order-last">
            <div className="relative z-10">
              {/* Main Image */}
              <div className="relative overflow-hidden rounded-3xl shadow-2xl group">
                <img
                  src={currentSlideData.image}
                  alt={currentSlideData.title}
                  className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              </div>

              {/* Floating Card - Responsive positioning */}
              <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-xl border border-white/20 max-w-xs">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#640D5F] to-[#D91656] rounded-full flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                      {currentSlideData.iconTitle}
                    </div>
                    <div className="text-xs text-gray-500">
                      เปิดให้บริการ 24/7
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Decorations - Responsive */}
            <div className="absolute top-4 sm:top-8 right-4 sm:right-8 w-20 sm:w-32 h-20 sm:h-32 bg-[#FFB200]/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 w-16 sm:w-24 h-16 sm:h-24 bg-[#D91656]/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          </div>
        </div>
      </div>

      {/* Enhanced Slide Controls - Responsive */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-3 sm:space-x-4 z-10">
        <button
          onClick={prevSlide}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center border border-white/20"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </button>

        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${index === currentSlide
                ? 'bg-[#640D5F] scale-125 shadow-lg'
                : 'bg-gray-300 hover:bg-gray-400'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center border border-white/20"
          aria-label="Next slide"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </button>
      </div>

      {/* Enhanced Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200">
        <div
          className="h-full bg-gradient-to-r from-[#640D5F] via-[#D91656] to-[#EB5B00] transition-all duration-500 ease-out shadow-sm"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </section>
  );
};

export default HeroSection;