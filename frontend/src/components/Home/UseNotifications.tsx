import { useState, useEffect, useCallback } from 'react';
import type { Notifications } from '../../interfaces/INotifications';
import NotificationService from '../../services/http';

export const useNotifications = (userId: number) => {
  const [notifications, setNotifications] = useState<Notifications[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const notificationService = new NotificationService();

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(userId);
      setNotifications(data);
      setError(null);
    } catch (err) {
      setError('Failed to load notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // เพิ่มการแจ้งเตือนใหม่
  const addNotification = useCallback((newNotification: Notifications) => {
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  // อัพเดตสถานะอ่านแล้ว
  const markAsRead = useCallback(async (notificationId: number) => {
    const success = await notificationService.markAsRead(notificationId);
    if (success) {
      setNotifications(prev =>
        prev.map(notification =>
          notification.ID === notificationId
            ? { ...notification, IsRead: true }
            : notification
        )
      );
    }
    return success;
  }, []);

  // อัพเดตอ่านทั้งหมด
  const markAllAsRead = useCallback(async () => {
    const success = await notificationService.markAllAsRead(userId);
    if (success) {
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, IsRead: true }))
      );
    }
    return success;
  }, [userId]);

  // เริ่ม Real-time connection
  useEffect(() => {
    if (userId) {
      loadNotifications();
      notificationService.startRealTimeConnection(userId, addNotification);
    }

    return () => {
      notificationService.stopRealTimeConnection();
    };
  }, [userId, loadNotifications, addNotification]);

  return {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refresh: loadNotifications,
  };
};