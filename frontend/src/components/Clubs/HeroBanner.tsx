import { useState, useEffect } from "react";

interface HeroBannerProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onCreateClub?: () => void;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ searchTerm, setSearchTerm, onCreateClub }) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const delay = setTimeout(() => {
      setSearchTerm(localSearchTerm);
    }, 300);

    return () => clearTimeout(delay);
  }, [localSearchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
  };

  return (
    <div className="relative h-screen min-h-[600px] w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full blur-3xl animate-[float_20s_infinite]" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full blur-3xl animate-[float-delay_25s_infinite]" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full blur-3xl animate-[float-slow_30s_infinite]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-slate-800 leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                ชมรม
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 font-light max-w-2xl mx-auto leading-relaxed">
              ค้นหาชมรมที่เหมาะกับความสนใจของคุณ
            </p>
          </div>

          <div className="space-y-6 animate-fade-in-delay">
            <div className="relative max-w-2xl mx-auto group">
              <input
                id="club-search"
                type="text"
                placeholder="ค้นหาชมรม..."
                className="w-full py-4 px-6 pr-14 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-slate-800 placeholder-slate-400 transition-all duration-300 text-lg shadow-lg hover:shadow-xl"
                value={localSearchTerm}
                onChange={handleInputChange}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-violet-500 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {onCreateClub && (
              <div className="animate-fade-in-delay-2">
                <button
                  onClick={onCreateClub}
                  className="group relative bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:from-violet-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-violet-500/30 backdrop-blur-sm"
                >
                  <span className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    สร้างชมรมใหม่
                  </span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-16 animate-fade-in-delay-3">
            {[
              {
                iconBg: "from-violet-500 to-purple-500",
                icon: <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
                title: "เข้าร่วมชุมชน",
                desc: "พบเพื่อนใหม่ที่มีความสนใจเดียวกัน"
              },
              {
                iconBg: "from-blue-500 to-indigo-500",
                icon: <path d="M13 10V3L4 14h7v7l9-11h-7z" />,
                title: "พัฒนาทักษะ",
                desc: "เรียนรู้และฝึกฝนความสามารถใหม่ๆ"
              },
              {
                iconBg: "from-amber-500 to-orange-500",
                icon: <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />,
                title: "สร้างผลงาน",
                desc: "ร่วมกันสร้างสรรค์โปรเจกต์ที่มีความหมาย"
              }
            ].map(({ iconBg, icon, title, desc }, idx) => (
              <div key={idx} className="text-center space-y-2">
                <div className={`w-12 h-12 bg-gradient-to-br ${iconBg} rounded-xl mx-auto flex items-center justify-center`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {icon}
                  </svg>
                </div>
                <h3 className="text-slate-700 font-medium">{title}</h3>
                <p className="text-slate-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
