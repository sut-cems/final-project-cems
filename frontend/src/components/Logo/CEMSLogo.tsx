import React from 'react';

interface CEMSLogoProps {
    className?: string;
    onClick?: () => void;
}

const CEMSLogo: React.FC<CEMSLogoProps> = ({ className = '', onClick }) => {
    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            window.location.href = '/';
        }
    };

    return (
        <div className={`flex items-center group ${className}`} onClick={handleClick}>
            {/* Geometric Crystal Logo */}
            <div className="relative">
                <svg className="h-12 w-12 transform transition-transform duration-300 group-hover:scale-110" viewBox="0 0 80 80" fill="none">
                    <defs>
                        <linearGradient id="modernGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#640D5F" />
                            <stop offset="100%" stopColor="#D91656" />
                        </linearGradient>

                        <linearGradient id="modernGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#D91656" />
                            <stop offset="100%" stopColor="#EB5B00" />
                        </linearGradient>

                        <linearGradient id="modernGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#EB5B00" />
                            <stop offset="100%" stopColor="#FFB200" />
                        </linearGradient>

                        <filter id="modernShadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#640D5F" floodOpacity="0.25" />
                        </filter>
                    </defs>

                    {/* Geometric Crystal */}
                    <g transform="translate(10, 10)" filter="url(#modernShadow)">
                        {/* Main crystal body - diamond shape */}
                        <polygon points="30,10 50,30 30,70 10,30" fill="url(#modernGrad1)" className="transition-all duration-300 group-hover:opacity-90" />
                        {/* Right facet - top triangle */}
                        <polygon points="30,10 70,30 50,30" fill="url(#modernGrad2)" className="transition-all duration-300 group-hover:opacity-90" />
                        {/* Bottom facet - bottom triangle */}
                        <polygon points="50,30 70,30 30,70" fill="url(#modernGrad3)" className="transition-all duration-300 group-hover:opacity-90" />
                    </g>
                </svg>

                {/* Subtle glow effect on hover */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#640D5F] to-[#D91656] opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
            </div>

            {/* Logo Text */}
            <div className="ml-3 flex flex-col">
                <span className="text-2xl font-bold text-[#640D5F] select-none tracking-tight">
                    CEMS
                </span>
                <span className="text-xs text-gray-600 select-none leading-tight -mt-1">
                    ระบบจัดการชมรมและกิจกรรมภายในมหาวิทยาลัย
                </span>
            </div>
        </div>

    )

}

export default CEMSLogo;

interface CEMSLogoNoTextProps {
    className?: string;
    onClick?: () => void;
}

const CEMSLogoNoText: React.FC<CEMSLogoNoTextProps> = ({ className = '', onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className={`relative group cursor-pointer ${className}`} onClick={handleClick}>
      <svg className="w-full h-full transform transition-transform duration-300 group-hover:scale-110" viewBox="0 0 80 80" fill="none">
        <defs>
          <linearGradient id="modernGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#640D5F" />
            <stop offset="100%" stopColor="#D91656" />
          </linearGradient>
          <linearGradient id="modernGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D91656" />
            <stop offset="100%" stopColor="#EB5B00" />
          </linearGradient>
          <linearGradient id="modernGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EB5B00" />
            <stop offset="100%" stopColor="#FFB200" />
          </linearGradient>
          <filter id="modernShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#640D5F" floodOpacity="0.25" />
          </filter>
        </defs>
        {/* Geometric Crystal */}
        <g transform="translate(10, 10)" filter="url(#modernShadow)">
          {/* Main crystal body - diamond shape */}
          <polygon points="30,10 50,30 30,70 10,30" fill="url(#modernGrad1)" className="transition-all duration-300 group-hover:opacity-90" />
          {/* Right facet - top triangle */}
          <polygon points="30,10 70,30 50,30" fill="url(#modernGrad2)" className="transition-all duration-300 group-hover:opacity-90" />
          {/* Bottom facet - bottom triangle */}
          <polygon points="50,30 70,30 30,70" fill="url(#modernGradient3)" className="transition-all duration-300 group-hover:opacity-90" />
        </g>
      </svg>
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#640D5F] to-[#D91656] opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
    </div>
  );
};
export { CEMSLogoNoText };