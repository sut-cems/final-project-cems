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
    <>
      <div
        className="relative h-96 w-full bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: "url('/images/club-hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#640D5F]/90 via-[#D91656]/80 to-[#FFB200]/70 flex items-center justify-center"></div>

        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFB200]/40 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#640D5F]/40 rounded-full filter blur-3xl animate-bounce delay-300"></div>
          <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-[#D91656]/30 rounded-full filter blur-2xl animate-ping delay-500"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold animate-fade-in leading-tight">
              <span className="text-[#FFB200] text-6xl md:text-7xl">ชมรม</span> ในมหาวิทยาลัย
            </h1>
            <p className="text-white/90 text-base sm:text-lg lg:text-xl font-medium animate-fade-in-delay">
              ค้นหาชมรมที่เหมาะกับความสนใจของคุณ
            </p>

            <div className="animate-fade-in-delay-2">
              <div className="relative w-full max-w-md mx-auto px-4 sm:px-0">
                <input
                  id="club-search"
                  type="text"
                  placeholder="ค้นหาชมรม..."
                  className="w-full py-3 px-6 rounded-full bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#FFB200] text-gray-800 placeholder-gray-500 transition-all duration-300 text-sm sm:text-base"
                  value={localSearchTerm}
                  onChange={handleInputChange}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#D91656]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {onCreateClub && (
              <div className="animate-fade-in-delay-2">
                <button
                  onClick={onCreateClub}
                  className="group relative bg-gradient-to-r from-[#D91656] to-[#FFB200] text-white px-6 py-2 rounded-full font-semibold text-sm shadow hover:shadow-lg transform hover:scale-105 transition duration-300"
                >
                  <span className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    สร้างชมรมใหม่
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.3s both;
        }

        .animate-fade-in-delay-2 {
          animation: fade-in 0.8s ease-out 0.6s both;
        }
      `}</style>
    </>
  );
};

export default HeroBanner;
