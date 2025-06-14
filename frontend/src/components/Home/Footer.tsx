import React from 'react';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const socialLinks = [
    {
      name: 'Facebook',
      href: 'https://facebook.com',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )
    },
    {
      name: 'X',
      href: 'https://x.com',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      )
    },
  ];

  const quickLinks = [
    { name: 'หน้าหลัก', href: '/' },
    { name: 'กิจกรรมทั้งหมด', href: '/activities' },
    { name: 'ชมรมทั้งหมด', href: '/clubs' },
    { name: 'ข่าวสารและประกาศ', href: '/news' }
  ];

  const supportLinks = [
    { name: 'คำถามที่พบบ่อย', href: '/faq' },
    { name: 'ติดต่อเรา', href: '/contact' },
    { name: 'นโยบายความเป็นส่วนตัว', href: '/privacy' },
    { name: 'ข้อกำหนดการใช้งาน', href: '/terms' }
  ];

  const clubCategories = [
    { name: 'ชมรมกีฬา', href: '/clubs?category=sports' },
    { name: 'ชมรมวิชาการ', href: '/clubs?category=academic' },
    { name: 'ชมรมศิลปะ', href: '/clubs?category=arts' },
    { name: 'ชมรมอาสา', href: '/clubs?category=volunteer' }
  ];

  return (
    <footer className={`bg-[#640D5F] ${className}`}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Brand section */}
          <div className="lg:col-span-4">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">CEMS</h3>
              <p className="text-pink-200 text-sm">Club & Event Management in University</p>
            </div>

            <p className="text-pink-100 leading-relaxed mb-6 max-w-sm">
              ระบบจัดการชมรมและกิจกรรมที่ทันสมัย เพื่อเชื่อมโยงนักศึกษาและส่งเสริมการเรียนรู้นอกห้องเรียน
            </p>

            {/* Social links */}
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-pink-200 hover:text-white hover:bg-[#D91656] transition-all duration-200"
                  aria-label={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links sections */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4 relative">
                ลิงก์ด่วน
                <div className="absolute -bottom-1 left-0 w-6 h-0.5 bg-[#FFB200]"></div>
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-pink-100 hover:text-[#FFB200] transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="text-white font-semibold mb-4 relative">
                ช่วยเหลือ
                <div className="absolute -bottom-1 left-0 w-6 h-0.5 bg-[#FFB200]"></div>
              </h4>
              <ul className="space-y-3">
                {supportLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-pink-100 hover:text-[#FFB200] transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Club Categories */}
            <div>
              <h4 className="text-white font-semibold mb-4 relative">
                หมวดหมู่ชมรม
                <div className="absolute -bottom-1 left-0 w-6 h-0.5 bg-[#FFB200]"></div>
              </h4>
              <ul className="space-y-3">
                {clubCategories.map((category) => (
                  <li key={category.name}>
                    <a
                      href={category.href}
                      className="text-pink-100 hover:text-[#FFB200] transition-colors duration-200 text-sm"
                    >
                      {category.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="border-t border-pink-300/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-pink-200 text-sm">
            <p className="mb-2 md:mb-0">
              &copy; {new Date().getFullYear()} CEMS - ระบบจัดการชมรมและกิจกรรม. สงวนลิขสิทธิ์.
            </p>
            <p className="flex items-center">
              Made with
              <span className="text-[#FFB200] mx-1">♥</span>
              for Education
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;