import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCheck, Calendar, Users, AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface Notifications {
  ID: number;
  Message: string;
  Type: string;
  IsRead: boolean;
  CreatedAtTime: string;
}

interface NotificationModalProps {
  notifications: Notifications[];
  loading: boolean;
  onMarkAsRead: (notificationId: number) => Promise<boolean>;
  onMarkAllAsRead: () => Promise<boolean>;
  unreadCount?: number;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  notifications,
  loading,
  onMarkAsRead,
  onMarkAllAsRead,
  unreadCount
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredNotification, setHoveredNotification] = useState<number | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [processingAll, setProcessingAll] = useState(false);

  const getNotificationConfig = (type: string) => {
    switch (type) {
      case 'announcement':
        return {
          icon: <Bell className="w-4 h-4" />,
          color: "#640D5F",
          bgColor: "#F8F4F8"
        };
      case 'activity':
        return {
          icon: <Users className="w-4 h-4" />,
          color: "#D91656",
          bgColor: "#FDF2F5"
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: "#EB5B00",
          bgColor: "#FFF6F0"
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          color: "#FFB200",
          bgColor: "#FFFBF0"
        };
      case 'info':
        return {
          icon: <Info className="w-4 h-4" />,
          color: "#640D5F",
          bgColor: "#F8F4F8"
        };
      case 'system':
        return {
          icon: <XCircle className="w-4 h-4" />,
          color: "#6B7280",
          bgColor: "#F9FAFB"
        };
      default:
        return {
          icon: <Bell className="w-4 h-4" />,
          color: "#640D5F",
          bgColor: "#F8F4F8"
        };
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'ไม่ระบุวันที่';

      let date = new Date(dateString);
      if (isNaN(date.getTime())) {
        const cleanDateString = dateString.replace(/\.\d+Z?$/, 'Z');
        date = new Date(cleanDateString);
        
        if (isNaN(date.getTime())) {
          return 'วันที่ไม่ถูกต้อง';
        }
      }

      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

      if (diffInMinutes < 1) {
        return 'เมื่อสักครู่';
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} นาทีที่แล้ว`;
      } else if (diffInHours < 24) {
        return `${diffInHours} ชั่วโมงที่แล้ว`;
      } else if (diffInHours < 168) {
        const days = Math.floor(diffInHours / 24);
        return `${days} วันที่แล้ว`;
      } else {
        return date.toLocaleDateString('th-TH', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          timeZone: 'Asia/Bangkok'
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'วันที่ไม่ถูกต้อง';
    }
  };

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

  const handleMarkAsRead = async (notificationId: number) => {
    if (processingIds.has(notificationId)) return;
    
    setProcessingIds(prev => new Set(prev).add(notificationId));
    try {
      await onMarkAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (processingAll) return;
    
    setProcessingAll(true);
    try {
      await onMarkAllAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    } finally {
      setProcessingAll(false);
    }
  };

  const currentUnreadCount = unreadCount ?? notifications.filter(n => !n.IsRead).length;

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div className="relative">
      {/* Notification Bell Button - Clean minimal style */}
      <button 
        onClick={() => setIsOpen(true)}
        className="relative p-3 text-slate-600 hover:text-[#640D5F] hover:bg-slate-50 rounded-full transition-all duration-200 group"
        disabled={loading}
      >
        <Bell className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
        {currentUnreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D91656] rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {currentUnreadCount > 9 ? '9+' : currentUnreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0"
            style={{ zIndex: 9999 }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal Container */}
          <div 
            className="fixed inset-0 min-h-screen flex items-center justify-center p-4"
            style={{ zIndex: 10000 }}
            onClick={() => setIsOpen(false)}
          >
            <div 
              className="relative bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                      <Bell className="w-4 h-4 text-[#640D5F]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">การแจ้งเตือน</h2>
                      <p className="text-sm text-slate-500">
                        {loading ? 'กำลังโหลด...' : 
                         currentUnreadCount > 0 ? `${currentUnreadCount} ข้อความใหม่` : 'ไม่มีข้อความใหม่'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {currentUnreadCount > 0 && !loading && (
                      <button
                        onClick={handleMarkAllAsRead}
                        disabled={processingAll}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-[#640D5F] hover:bg-[#4A0A47] text-white rounded-full text-sm transition-colors duration-200 disabled:opacity-50"
                      >
                        {processingAll ? (
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <CheckCheck className="w-3 h-3" />
                        )}
                        <span className="text-xs">อ่านทั้งหมด</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors duration-200 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto max-h-[calc(85vh-120px)] p-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-slate-200 border-t-[#640D5F] rounded-full animate-spin mb-3"></div>
                    <p className="text-slate-500 text-sm">กำลังโหลดการแจ้งเตือน...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                      <Bell className="w-6 h-6 text-slate-400" />
                    </div>
                    <h3 className="text-base font-medium text-slate-800 mb-2">ไม่มีการแจ้งเตือน</h3>
                    <p className="text-slate-500 text-sm">คุณจะได้รับการแจ้งเตือนเมื่อมีข้อมูลใหม่</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((notification) => {
                      const config = getNotificationConfig(notification.Type);
                      const isProcessing = processingIds.has(notification.ID);
                      
                      return (
                        <div
                          key={notification.ID}
                          className={`relative bg-white border border-slate-200 rounded-2xl transition-all duration-200 hover:shadow-sm cursor-pointer ${
                            !notification.IsRead 
                              ? 'border-l-4 border-l-[#D91656] bg-slate-50/50' 
                              : 'hover:border-slate-300'
                          } ${isProcessing ? 'opacity-50' : ''}`}
                          onMouseEnter={() => setHoveredNotification(notification.ID)}
                          onMouseLeave={() => setHoveredNotification(null)}
                          onClick={() => !notification.IsRead && !isProcessing && handleMarkAsRead(notification.ID)}
                        >
                          <div className="p-4">
                            <div className="flex items-start space-x-3">
                              {/* Icon */}
                              <div 
                                className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: config.bgColor, color: config.color }}
                              >
                                {config.icon}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <span 
                                    className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md"
                                    style={{ backgroundColor: config.bgColor, color: config.color }}
                                  >
                                    {getTypeLabel(notification.Type)}
                                  </span>
                                  <div className="flex items-center text-slate-400 text-xs">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {formatDate(notification.CreatedAtTime)}
                                  </div>
                                </div>

                                <p className="text-slate-700 text-sm leading-relaxed mb-3">
                                  {notification.Message}
                                </p>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    {notification.IsRead ? (
                                      <div className="flex items-center text-xs text-slate-500">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                        <span>อ่านแล้ว</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center text-xs text-[#D91656] font-medium">
                                        <div className="w-2 h-2 bg-[#D91656] rounded-full mr-2 animate-pulse"></div>
                                        <span>ใหม่</span>
                                      </div>
                                    )}
                                  </div>

                                  {!notification.IsRead && hoveredNotification === notification.ID && !isProcessing && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkAsRead(notification.ID);
                                      }}
                                      className="px-3 py-1 text-xs bg-[#640D5F] text-white rounded-full hover:bg-[#4A0A47] transition-colors duration-200"
                                    >
                                      คลิ๊กเพื่ออ่าน
                                    </button>
                                  )}

                                  {isProcessing && (
                                    <div className="flex items-center space-x-1 text-xs text-slate-500">
                                      <div className="w-3 h-3 border-2 border-slate-200 border-t-[#640D5F] rounded-full animate-spin"></div>
                                      <span>กำลังอัพเดต...</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {!loading && notifications.length > 0 && (
                <div className="border-t border-slate-100 px-6 py-3">
                  <div className="flex items-center justify-center space-x-6 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#D91656] rounded-full"></div>
                      <span className="text-slate-600">ยังไม่ได้อ่าน {currentUnreadCount}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-slate-600">อ่านแล้ว {notifications.length - currentUnreadCount}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                      <span className="text-slate-600">ทั้งหมด {notifications.length}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationModal;