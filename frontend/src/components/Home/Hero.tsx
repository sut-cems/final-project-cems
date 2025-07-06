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

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoggedIn] = useState(localStorage.getItem('isLogin') === 'true');
  const navigate = useNavigate();
  const slides = [
    {
      id: 1,
      title: "ค้นพบกิจกรรมและชมรม",
      subtitle: "ในมหาวิทยาลัยของคุณ",
      description: "ระบบจัดการชมรมและกิจกรรมที่ทันสมัย ช่วยให้คุณค้นหา เข้าร่วม และบริหารจัดการได้อย่างมีประสิทธิภาพ",
      icon: Calendar,
      gradient: "from-purple-500 to-pink-500",
      features: ["ลงทะเบียนออนไลน์", "เช็กชื่ออัตโนมัติ", "จัดการสถานที่"],
      stats: { clubs: "50+", events: "200+", students: "1K+" },
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop&crop=center"
    },
    {
      id: 2,
      title: "เข้าร่วมชุมชน",
      subtitle: "และสร้างเครือข่าย",
      description: "พบกับเพื่อนใหม่ในชมรมที่คุณสนใจ พร้อมระบบแจ้งเตือนข่าวสารชมรมแบบเรียลไทม์",
      icon: Users,
      gradient: "from-orange-500 to-red-500",
      features: ["หมวดหมู่ชมรมหลากหลาย", "ระบบสมาชิกชมรม", "ข่าวสารชมรม"],
      stats: { clubs: "80+", events: "150+", students: "2K+" },
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop&crop=center"
    },
    {
      id: 3,
      title: "บันทึกชั่วโมงกิจกรรม",
      subtitle: "และสร้างผลงาน",
      description: "ระบบบันทึกชั่วโมงกิจกรรมอัตโนมัติ พร้อมการตรวจสอบและสร้างรายงานสำหรับทุนการศึกษา",
      icon: Clock,
      gradient: "from-yellow-500 to-orange-500",
      features: ["บันทึกชั่วโมงอัตโนมัติ", "การตรวจสอบ", "สร้างรายงาน"],
      stats: { clubs: "60+", events: "300+", students: "1.5K+" },
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop&crop=center"
    },
    {
      id: 4,
      title: "ระบบแจ้งเตือน",
      subtitle: "ไม่พลาดทุกกิจกรรม",
      description: "รับแจ้งเตือนกิจกรรมใหม่ ข่าวสารชมรม และการอัปเดตสถานะการลงทะเบียนแบบทันที",
      icon: Bell,
      gradient: "from-purple-500 to-indigo-500",
      features: ["แจ้งเตือนกิจกรรม", "ข่าวสารชมรม", "อัปโหลดสื่อ"],
      stats: { clubs: "70+", events: "250+", students: "3K+" },
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
  const handleActivity = () => {
    navigate('/activity');
  };

  // ฟังก์ชันสำหรับจัดการการคลิกปุ่มสร้างชมรม
  const handleCreateClub = () => {
    console.log('สร้างชมรมใหม่ clicked, isLoggedIn:', isLoggedIn);
    if (isLoggedIn) {
      navigate('/create-club');
    } else {
      navigate('/login');
    }
  };

  const currentSlideData = slides[currentSlide];
  const IconComponent = currentSlideData.icon;

  return (
    <section className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-[#640D5F] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#D91656] rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-[#EB5B00] rounded-full blur-2xl"></div>
      </div>


      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-8rem)]">

          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-[#FFB200]/10 rounded-full">
                <IconComponent className="w-4 h-4 text-[#EB5B00] mr-2" />
                <span className="text-sm font-medium text-[#EB5B00]">
                  {currentSlideData.features[0]}
                </span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {currentSlideData.title}
                <br />
                <span className="text-[#D91656]">{currentSlideData.subtitle}</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                {currentSlideData.description}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#640D5F]">{currentSlideData.stats.clubs}</div>
                <div className="text-sm text-gray-500">ชมรม</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#D91656]">{currentSlideData.stats.events}</div>
                <div className="text-sm text-gray-500">กิจกรรม</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#EB5B00]">{currentSlideData.stats.students}</div>
                <div className="text-sm text-gray-500">นักศึกษา</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={handleActivity}
                className="relative z-40 bg-[#640D5F] text-white px-8 py-4 rounded-full hover:bg-[#4a0a47] transition-all hover:scale-105 flex items-center space-x-2"
              >
                <span>ค้นหากิจกรรม</span>
                <ArrowRight className="w-5 h-5" />
              </button>


              <div className="relative group">
                <button
                  onClick={handleCreateClub}
                  className="border-2 border-[#640D5F] text-[#640D5F] px-8 py-4 rounded-full hover:bg-[#640D5F] hover:text-white transition-all hover:scale-105 flex items-center space-x-2"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>สร้างชมรมใหม่</span>
                </button>

                {/* Tooltip */}
                {!isLoggedIn && (
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    กรุณาเข้าสู่ระบบก่อน
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                )}
              </div>

            </div>


            {/* Rating */}
            <div className="flex items-center space-x-4 pt-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#FFB200] fill-current" />
                ))}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold">4.8</span> จาก <span className="font-semibold">2,500+</span> รีวิว
              </div>
            </div>
            {/* Login Status Indicator */}
            <div className="text-sm text-gray-500">
              {isLoggedIn ? null : (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#FFB200] rounded-full animate-pulse"></div>
                  <span className="text-[#EB5B00]">ยังไม่ได้เข้าสู่ระบบ</span>
                </div>
              )}
            </div>
          </div>



          {/* Right Column - Image */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src={currentSlideData.image}
                alt={currentSlideData.title}
                className="w-full h-[500px] object-cover rounded-3xl shadow-2xl"
              />

              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#640D5F] rounded-full flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {currentSlideData.features[0]}
                    </div>
                    <div className="text-xs text-gray-500">
                      เปิดให้บริการ 24/7
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute top-8 right-8 w-32 h-32 bg-[#FFB200]/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-8 left-8 w-24 h-24 bg-[#D91656]/20 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>

      {/* Slide Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
        <button
          onClick={prevSlide}
          className="w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${index === currentSlide
                ? 'bg-[#640D5F] scale-125'
                : 'bg-gray-300 hover:bg-gray-400'
                }`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          className="w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
        <div
          className="h-full bg-[#640D5F] transition-all duration-300 ease-out"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>
    </section>
  );
};

export default HeroSection;