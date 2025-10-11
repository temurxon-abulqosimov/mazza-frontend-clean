import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocalization } from './LocalizationContext';
import { useTelegram } from './TelegramContext';

export interface Notification {
  id: string;
  type: 'order' | 'product' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  orderId?: string;
  productId?: string;
  sellerId?: string;
  userId?: string;
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotifications: () => {},
  removeNotification: () => {},
});

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const { t } = useLocalization();
  const { user, userProfile, userRole } = useTelegram();

  // Load notifications from localStorage on mount
  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications);
        const notificationsWithDates = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setAllNotifications(notificationsWithDates);
      }
    } catch (err) {
      console.warn('Failed to load notifications from localStorage:', err);
      // Clear corrupted data
      try {
        localStorage.removeItem('notifications');
      } catch (e) {
        console.warn('Failed to clear localStorage:', e);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('notifications', JSON.stringify(allNotifications));
    } catch (err) {
      console.warn('Failed to save notifications to localStorage:', err);
    }
  }, [allNotifications]);

  // Filter notifications based on current user
  const notifications = allNotifications.filter(notification => {
    // If no user is logged in, show no notifications
    if (!user || !userRole) return false;
    
    // System notifications are shown to everyone
    if (notification.type === 'system') return true;
    
    // Filter by user role and ID
    if (userRole === 'SELLER') {
      // Sellers see notifications for their seller ID
      return notification.sellerId === userProfile?.id?.toString() || 
             notification.sellerId === user.id?.toString();
    } else if (userRole === 'USER') {
      // Regular users see notifications for their user ID
      return notification.userId === user.id?.toString();
    } else if (userRole === 'ADMIN') {
      // Admins see all notifications
      return true;
    }
    
    return false;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const notification: Notification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      isRead: false,
    };

    setAllNotifications(prev => [notification, ...prev]);

    // Show browser notification if permission is granted and available
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id,
        });
      }
    } catch (err) {
      console.warn('Failed to show browser notification:', err);
    }
  };

  const markAsRead = (id: string) => {
    setAllNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setAllNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const clearNotifications = () => {
    setAllNotifications([]);
    try {
      localStorage.removeItem('notifications');
    } catch (err) {
      console.warn('Failed to clear notifications from localStorage:', err);
    }
  };

  const removeNotification = (id: string) => {
    setAllNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Request notification permission on mount
  useEffect(() => {
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } catch (err) {
      console.warn('Failed to request notification permission:', err);
    }
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
