import React, { useEffect, useState } from 'react';
import { Calendar, Bell, ArrowRight, Users, Clock, AlertCircle, CheckCircle, Info, XCircle, User } from 'lucide-react';
import type { Notifications } from '../../interfaces/INotifications';
import { useNotifications } from './UseNotifications';

interface NotificationDisplay {
  notification: Notifications;
  icon: React.ReactNode;
  badgeColor: string;
  bgColor: string;
}

interface NotificationsAndUpdatesProps {
  userId: number; 
}

const NotificationsAndUpdates: React.FC<NotificationsAndUpdatesProps> = ({ userId }) => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const { notifications, loading, error, markAsRead, markAllAsRead } = useNotifications(userId);
  const [isLoggedIn] = useState(localStorage.getItem('isLogin') !== null);

  const getNotificationConfig = (type: string): { icon: React.ReactNode; badgeColor: string; bgColor: string } => {
    switch (type) {
      case 'announcement':
        return {
          icon: <Bell className="w-5 h-5" />,
          badgeColor: "from-purple-800 to-red-600",
          bgColor: "from-purple-50 to-red-50"
        };
      case 'activity':
        return {
          icon: <Users className="w-5 h-5" />,
          badgeColor: "from-blue-600 to-indigo-600",
          bgColor: "from-blue-50 to-indigo-50"
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          badgeColor: "from-green-600 to-emerald-600",
          bgColor: "from-green-50 to-emerald-50"
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          badgeColor: "from-yellow-600 to-orange-600",
          bgColor: "from-yellow-50 to-orange-50"
        };
      case 'info':
        return {
          icon: <Info className="w-5 h-5" />,
          badgeColor: "from-cyan-600 to-blue-600",
          bgColor: "from-cyan-50 to-blue-50"
        };
      case 'system':
        return {
          icon: <XCircle className="w-5 h-5" />,
          badgeColor: "from-gray-600 to-slate-600",
          bgColor: "from-gray-50 to-slate-50"
        };
      default:
        return {
          icon: <Bell className="w-5 h-5" />,
          badgeColor: "from-purple-800 to-red-600",
          bgColor: "from-purple-50 to-red-50"
        };
    }
  };

  const handleNotificationClick = async (notificationId: number, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(notificationId);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const notificationDisplayConfig: NotificationDisplay[] = notifications.map(notification => ({
    notification,
    ...getNotificationConfig(notification.Type)
  }));

  const formatDate = (dateString: string) => {
    try {
      // ตรวจสอบว่า dateString มีค่าหรือไม่
      if (!dateString) {
        return 'ไม่ระบุวันที่';
      }

      // แปลงเป็น Date object
      let date = new Date(dateString);

      // ตรวจสอบว่า date ถูกต้องหรือไม่
      if (isNaN(date.getTime())) {
        // ลองใช้วิธีอื่นในการแปลง
        const cleanDateString = dateString.replace(/\.\d+Z?$/, 'Z');
        date = new Date(cleanDateString);

        // ถ้ายังไม่ได้ ให้ใช้ current date
        if (isNaN(date.getTime())) {
          console.warn('Invalid date string:', dateString);
          return 'วันที่ไม่ถูกต้อง';
        }
      }

      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

      // คำนวณเวลาที่ผ่านไป
      if (diffInMinutes < 1) {
        return 'เมื่อสักครู่';
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} นาทีที่แล้ว`;
      } else if (diffInHours < 1) {
        return 'เมื่อสักครู่';
      } else if (diffInHours < 24) {
        return `${diffInHours} ชั่วโมงที่แล้ว`;
      } else if (diffInHours < 168) { // 7 days
        const days = Math.floor(diffInHours / 24);
        return `${days} วันที่แล้ว`;
      } else {
        // แสดงวันที่เต็ม
        return date.toLocaleDateString('th-TH', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          timeZone: 'Asia/Bangkok' // ใช้ timezone ของไทย
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error, 'Input:', dateString);
      return 'วันที่ไม่ถูกต้อง';
    }
  };

  // ฟังก์ชันสำหรับ debug date
  const debugDate = (dateString: string) => {
    console.log('Original date string:', dateString);
    console.log('Date object:', new Date(dateString));
    console.log('Is valid:', !isNaN(new Date(dateString).getTime()));
    console.log('ISO string:', new Date(dateString).toISOString());
    console.log('Formatted:', formatDate(dateString));
  };

  useEffect(() => {
    if (notifications.length > 0) {
      console.log('First notification date:', notifications[0].CreatedAtTime);
      debugDate(notifications[0].CreatedAtTime);
    }
  }, [notifications]);

  const getTypeLabel = (type: string) => {
    const typeLabels: { [key: string]: string } = {
      'registration': 'การลงทะเบียน',
      'reminder': 'แจ้งเตือน',
      'hour_approved': 'อนุมัติชั่วโมงกิจกรรม',
      'new_activity': 'กิจกรรมใหม่',
      'attendance_reminder': 'เตือนความจำเข้าร่วมกิจกรรม',
      'announcement': 'ประกาศ',
      'activity': 'กิจกรรม',
      'success': 'สำเร็จ',
      'warning': 'เตือน',
      'info': 'ข้อมูล',
      'system': 'ระบบ'
    };
    return typeLabels[type] || 'ทั่วไป';
  };

  const unreadCount = notifications.filter(n => !n.IsRead).length;
  const totalNotifications = notifications.length;

  if (!isLoggedIn) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-800 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-800 to-orange-500 rounded-full mb-8">
              <Bell className="w-12 h-12 text-white" />
            </div>

            {/* Title */}
            <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-800 via-red-600 to-orange-500 bg-clip-text text-transparent mb-6">
              การแจ้งเตือนและอัพเดต
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-purple-800 to-orange-500 mx-auto rounded-full mb-8"></div>

            {/* Message */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  เข้าสู่ระบบเพื่อดูการแจ้งเตือน
                </h3>
                
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  กรุณาเข้าสู่ระบบเพื่อดูการแจ้งเตือนและข่าวสารอัพเดตล่าสุดของคุณ 
                  เพื่อไม่ให้พลาดข้อมูลสำคัญและกิจกรรมต่างๆ ที่เกี่ยวข้องกับคุณ
                </p>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <Info className="w-6 h-6 text-blue-600 mt-1" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-blue-800 mb-2">
                        เมื่อคุณเข้าสู่ระบบแล้ว คุณจะได้รับ:
                      </h4>
                      <ul className="text-blue-700 space-y-2">
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>การแจ้งเตือนเกี่ยวกับกิจกรรมใหม่ๆ</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>ประกาศและข่าวสารสำคัญ</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>การอนุมัติชั่วโมงกิจกรรม</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>เตือนความจำสำหรับกิจกรรมที่สำคัญ</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">การแจ้งเตือนแบบเรียลไทม์</h3>
                <p className="text-gray-600 text-sm">รับการแจ้งเตือนทันทีเมื่อมีข้อมูลใหม่</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">ติดตามกิจกรรม</h3>
                <p className="text-gray-600 text-sm">อัพเดตสถานะกิจกรรมและการเข้าร่วม</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">จัดการเวลา</h3>
                <p className="text-gray-600 text-sm">ติดตามชั่วโมงกิจกรรมและการอนุมัติ</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดการแจ้งเตือน...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 text-center">
          <div className="text-red-500 text-lg">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-800 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-800 via-red-600 to-orange-500 bg-clip-text text-transparent mb-4">
              การแจ้งเตือนและอัพเดต
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-purple-800 to-orange-500 mx-auto rounded-full"></div>
          </div>
          <p className="text-gray-600 mt-6 text-lg max-w-2xl mx-auto">
            ติดตามการแจ้งเตือนและข่าวสารอัพเดตล่าสุดของคุณ
          </p>

          {/* Notification Summary */}
          <div className="flex justify-center items-center space-x-6 mt-8">
            <div className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-full">
              <Bell className="w-4 h-4" />
              <span className="font-semibold">{unreadCount} ข้อความใหม่</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full">
              <Clock className="w-4 h-4" />
              <span className="font-semibold">ทั้งหมด {totalNotifications} รายการ</span>
            </div>
          </div>
        </div>

        {/* Recent Notifications Grid - แสดงเฉพาะ 4 รายการล่าสุด */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {notificationDisplayConfig.slice(0, 4).map((notificationDisplay, index) => (
            <div
              key={`${notificationDisplay.notification.ID}-${index}`}
              className={`group relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-500 transform hover:scale-105 hover:shadow-2xl cursor-pointer ${hoveredCard === notificationDisplay.notification.ID ? 'ring-4 ring-yellow-300' : ''
                } ${!notificationDisplay.notification.IsRead ? 'ring-2 ring-red-200' : ''}`}
              onMouseEnter={() => setHoveredCard(notificationDisplay.notification.ID)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleNotificationClick(notificationDisplay.notification.ID, notificationDisplay.notification.IsRead)}
            >
              {/* Unread indicator */}
              {!notificationDisplay.notification.IsRead && (
                <div className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              )}

              <div className={`absolute inset-0 bg-gradient-to-br ${notificationDisplay.bgColor} opacity-30`}></div>

              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex items-center space-x-2 px-3 py-1 bg-gradient-to-r ${notificationDisplay.badgeColor} text-white text-sm rounded-full font-medium`}>
                    {notificationDisplay.icon}
                    <span>{getTypeLabel(notificationDisplay.notification.Type)}</span>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(notificationDisplay.notification.CreatedAtTime)}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-800 leading-relaxed text-base">
                    {notificationDisplay.notification.Message}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {notificationDisplay.notification.IsRead ? (
                      <span className="text-sm text-green-600 font-medium">อ่านแล้ว</span>
                    ) : (
                      <span className="text-sm text-red-600 font-medium">ยังไม่ได้อ่าน</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-purple-600 group-hover:text-orange-500 transition-colors duration-300">
                    <span className="text-sm font-medium">ดูรายละเอียด</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-orange-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>

        {/* Show more notifications hint */}
        {notificationDisplayConfig.length > 6 && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>และอีก {notificationDisplayConfig.length - 6} การแจ้งเตือน</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 mt-16">
          <button className="group relative px-8 py-4 bg-gradient-to-r from-purple-800 via-red-600 to-orange-500 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
            <span className="relative z-10 flex items-center justify-center space-x-2">
              <span>ดูการแจ้งเตือนทั้งหมด</span>
              <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          <button
            onClick={handleMarkAllAsRead}
            className="group px-8 py-4 bg-white text-purple-800 border-2 border-purple-800 rounded-full font-semibold text-lg hover:bg-purple-800 hover:text-white transition-all duration-300"
          >
            <span className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>ทำเครื่องหมายอ่านทั้งหมด</span>
            </span>
          </button>
        </div>

        {/* Statistics */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {unreadCount}
            </div>
            <p className="text-gray-600">ยังไม่ได้อ่าน</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-800 mb-2">
              {totalNotifications}
            </div>
            <p className="text-gray-600">ทั้งหมด</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500 mb-2">
              {notifications.filter(n => n.Type === 'announcement').length}
            </div>
            <p className="text-gray-600">ประกาศ</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {notifications.filter(n => n.Type === 'activity').length}
            </div>
            <p className="text-gray-600">กิจกรรม</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotificationsAndUpdates;