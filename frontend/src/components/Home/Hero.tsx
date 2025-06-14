import { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  Bell,
  Clock,
} from 'lucide-react';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoggedIn] = useState(localStorage.getItem('isLogin') === 'true');

  const slides = [
    {
      id: 1,
      title: "ค้นพบกิจกรรมและชมรม",
      subtitle: "ในมหาวิทยาลัยของคุณ",
      description: "ระบบจัดการชมรมและกิจกรรมภายในมหาวิทยาลัย ที่ช่วยให้คุณค้นหา เข้าร่วม และบริหารจัดการกิจกรรมได้ง่ายขึ้น พร้อมระบบลงทะเบียนและเช็กชื่ออัตโนมัติ",
      icon: Calendar,
      iconTitle: "จัดการกิจกรรมได้ง่าย",
      iconDesc: "ระบบครบครันสำหรับการจัดการกิจกรรมและชมรม",
      gradient: "from-blue-600 via-purple-600 to-pink-500",
      features: ["ลงทะเบียนออนไลน์", "เช็กชื่ออัตโนมัติ", "จัดการสถานที่"],
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop&crop=center"
    },
    {
      id: 2,
      title: "เข้าร่วมชุมชน",
      subtitle: "และสร้างเครือข่าย",
      description: "พบกับเพื่อนใหม่ในชมรมที่คุณสนใจ จากชมรมกีฬา วิชาการ ศิลปะ ไปจนถึงชมรมอาสาสมัคร พร้อมระบบแจ้งเตือนข่าวสารชมรม",
      icon: Users,
      iconTitle: "สมาชิกชมรมทั้งหมด",
      iconDesc: "เชื่อมต่อกับคนที่มีความสนใจเหมือนกัน",
      gradient: "from-green-500 via-teal-500 to-blue-500",
      features: ["หมวดหมู่ชมรมหลากหลาย", "ระบบสมาชิกชมรม", "ข่าวสารชมรม"],
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop&crop=center"
    },
    {
      id: 3,
      title: "บันทึกชั่วโมงกิจกรรม",
      subtitle: "และสร้างผลงาน",
      description: "ระบบบันทึกชั่วโมงกิจกรรมอัตโนมัติ พร้อมการตรวจสอบจากเจ้าหน้าที่ สร้างรายงานสำหรับใช้ในการสมัครทุนการศึกษาหรือใบประกาศนียบัตร",
      icon: Clock,
      iconTitle: "บันทึกชั่วโมงกิจกรรม",
      iconDesc: "ระบบตรวจสอบและรายงานชั่วโมงกิจกรรม",
      gradient: "from-orange-500 via-red-500 to-pink-500",
      features: ["บันทึกชั่วโมงอัตโนมัติ", "การตรวจสอบ", "สร้างรายงาน"],
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop&crop=center"
    },
    {
      id: 4,
      title: "ระบบแจ้งเตือน",
      subtitle: "ไม่พลาดทุกกิจกรรม",
      description: "รับแจ้งเตือนกิจกรรมใหม่ ข่าวสารชมรม และการอัปเดตสถานะการลงทะเบียน พร้อมระบบจัดการสื่อและอัปโหลดรูปภาพกิจกรรม",
      icon: Bell,
      iconTitle: "ระบบแจ้งเตือนอัจฉริยะ",
      iconDesc: "ไม่พลาดข่าวสารและกิจกรรมสำคัญ",
      gradient: "from-indigo-500 via-purple-500 to-pink-500",
      features: ["แจ้งเตือนกิจกรรม", "ข่าวสารชมรม", "อัปโหลดสื่อ"],
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop&crop=center"
    },
  ];

  // Auto slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };


  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // ฟังก์ชันสำหรับจัดการการคลิกปุ่มสร้างชมรม
  const handleCreateClub = () => {
    if (isLoggedIn) {
      window.location.href = '/create-club';
    } else {
      window.location.href = '/login';
    }
  };

  const currentSlideData = slides[currentSlide];
  const IconComponent = currentSlideData.icon;

  return (
    <section className="min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] bg-gradient-to-r from-purple-800 via-purple-600 to-pink-600 text-white py-8 sm:py-12 lg:py-16 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-16 h-16 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-20 w-12 h-12 bg-white rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-10 left-1/4 w-8 h-8 bg-white rounded-full animate-ping delay-500"></div>
        <div className="absolute bottom-20 right-1/3 w-12 h-12 bg-white rounded-full animate-pulse delay-700"></div>
      </div>

      {/* Navigation Arrows - ซ่อนในมือถือ */}
      <button
        onClick={prevSlide}
        className="hidden sm:block absolute left-2 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-300 hover:scale-110"
      >
        <ChevronLeft className="h-4 w-4 text-white" />
      </button>

      <button
        onClick={nextSlide}
        className="hidden sm:block absolute right-2 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-300 hover:scale-110"
      >
        <ChevronRight className="h-4 w-4 text-white" />
      </button>

      <div className="container mx-auto px-4 relative z-10 h-full">
        <div className="flex flex-col items-center justify-center h-full gap-6 lg:gap-8">
          
          {/* Content Section */}
          <div className="w-full text-center">
            <div className="transform transition-all duration-700 ease-out">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight animate-fade-in">
                {currentSlideData.title}
                <br />
                <span className="text-yellow-300 drop-shadow-lg">{currentSlideData.subtitle}</span>
              </h1>

              <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 text-white/90 leading-relaxed animate-fade-in-delay max-w-2xl mx-auto px-4">
                {currentSlideData.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-fade-in-delay-2 px-4">
                <button className="px-6 py-3 bg-white text-gray-800 rounded-full font-medium hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base">
                  ค้นหากิจกรรม
                </button>
                <button 
                  onClick={handleCreateClub}
                  className="px-6 py-3 bg-yellow-400 text-gray-800 rounded-full font-medium hover:bg-yellow-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base relative group"
                >
                  {isLoggedIn ? 'สร้างชมรมใหม่' : 'สร้างชมรมใหม่'}
                  {!isLoggedIn && (
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      กรุณาเข้าสู่ระบบก่อน
                    </span>
                  )}
                </button>
              </div>

              {/* Login Status Indicator */}
              <div className="mt-1 text-sm text-white/70">
                {isLoggedIn ? null : (
                  <span className="text-orange-300">⚠ ยังไม่ได้เข้าสู่ระบบ</span>
                )}
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto">
            <div className="relative overflow-hidden rounded-xl shadow-2xl">
              <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80">
                <img
                  src={currentSlideData.image}
                  alt={currentSlideData.title}
                  className="w-full h-full object-cover transition-all duration-1000 ease-in-out"
                />

                {/* Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                {/* Icon Badge */}
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-2.5 border border-white/30">
                    <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-white drop-shadow-lg" />
                  </div>
                </div>

                {/* Stats Overlay */}
                <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3">
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-2.5 sm:p-3 border border-white/20">
                    <h3 className="text-white font-semibold text-xs sm:text-sm mb-2 truncate">
                      {currentSlideData.iconTitle}
                    </h3>

                    {/* Mini Stats */}
                    <div className="grid grid-cols-3 gap-1 sm:gap-2">
                      <div className="text-center">
                        <div className="text-xs sm:text-sm font-bold text-yellow-300">50+</div>
                        <div className="text-xs text-white/70">ชมรม</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs sm:text-sm font-bold text-yellow-300">200+</div>
                        <div className="text-xs text-white/70">กิจกรรม</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs sm:text-sm font-bold text-yellow-300">1K+</div>
                        <div className="text-xs text-white/70">นักศึกษา</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center space-x-2 mt-6 sm:mt-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${index === currentSlide
                  ? 'bg-yellow-300 scale-125'
                  : 'bg-white/40 hover:bg-white/60'
                }`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-2 sm:mt-3 max-w-xs mx-auto">
          <div className="w-full bg-white/20 rounded-full h-0.5">
            <div
              className="bg-yellow-300 h-0.5 rounded-full transition-all duration-4000 ease-linear"
              style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Touch/Swipe indicators for mobile */}
      <div className="sm:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-2 text-white/60 text-xs">
          <span>← เลื่อนดูเพิ่มเติม →</span>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.2s both;
        }
        
        .animate-fade-in-delay-2 {
          animation: fade-in 0.8s ease-out 0.4s both;
        }
        
        /* Touch support for mobile */
        @media (max-width: 640px) {
          .container {
            touch-action: pan-y;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;