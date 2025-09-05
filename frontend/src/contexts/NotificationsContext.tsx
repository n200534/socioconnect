'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient, Notification, NotificationStats } from '@/lib/api';
import { useAuth } from './AuthContext';

interface NotificationsContextType {
  notifications: Notification[];
  stats: NotificationStats | null;
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  fetchNotifications: (params?: {
    limit?: number;
    offset?: number;
    type?: string;
    is_read?: boolean;
    is_archived?: boolean;
  }) => Promise<void>;
  markAsRead: (notificationIds: number[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  archiveNotification: (notificationId: number) => Promise<void>;
  refreshStats: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

interface NotificationsProviderProps {
  children: ReactNode;
}

export function NotificationsProvider({ children }: NotificationsProviderProps) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = stats?.unread || 0;

  // Add a check to prevent API calls when user is not loaded
  const shouldMakeApiCalls = isAuthenticated && typeof window !== 'undefined';

  const fetchNotifications = async (params?: {
    limit?: number;
    offset?: number;
    type?: string;
    is_read?: boolean;
    is_archived?: boolean;
  }) => {
    if (!shouldMakeApiCalls) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getNotifications(params);
      
      if (response.error) {
        // API returned an error
        setError(response.error);
        setNotifications([]);
      } else if (response.data && Array.isArray(response.data)) {
        // Valid array data
        setNotifications(response.data);
        setError(null);
      } else {
        // Invalid data format
        console.error('Invalid notifications data:', response.data, 'Type:', typeof response.data);
        setNotifications([]);
        setError('Invalid response format from server');
      }
    } catch (err) {
      setError('Network error while fetching notifications');
      setNotifications([]);
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStats = async () => {
    if (!shouldMakeApiCalls) return;
    
    try {
      const response = await apiClient.getNotificationStats();
      if (response.data) {
        setStats(response.data);
      } else if (response.error) {
        console.error('Error fetching notification stats:', response.error);
        // Don't set error state for stats, just log it
      }
    } catch (err) {
      console.error('Error fetching notification stats:', err);
      // Don't set error state for stats, just log it
    }
  };

  const markAsRead = async (notificationIds: number[]) => {
    try {
      const response = await apiClient.markNotificationsRead(notificationIds);
      if (response.data) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notificationIds.includes(notification.id)
              ? { ...notification, is_read: true }
              : notification
          )
        );
        // Refresh stats
        await refreshStats();
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await apiClient.markAllNotificationsRead();
      if (response.data) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, is_read: true }))
        );
        // Refresh stats
        await refreshStats();
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      const response = await apiClient.deleteNotification(notificationId);
      if (response.data) {
        // Remove from local state
        setNotifications(prev => 
          prev.filter(notification => notification.id !== notificationId)
        );
        // Refresh stats
        await refreshStats();
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const response = await apiClient.clearAllNotifications();
      if (response.data) {
        // Clear local state
        setNotifications([]);
        // Refresh stats
        await refreshStats();
      }
    } catch (err) {
      console.error('Error clearing all notifications:', err);
    }
  };

  const archiveNotification = async (notificationId: number) => {
    try {
      const response = await apiClient.archiveNotification(notificationId);
      if (response.data) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId
              ? { ...notification, is_archived: true }
              : notification
          )
        );
        // Refresh stats
        await refreshStats();
      }
    } catch (err) {
      console.error('Error archiving notification:', err);
    }
  };

  // Load notifications and stats on mount
  useEffect(() => {
    if (shouldMakeApiCalls) {
      fetchNotifications();
      refreshStats();
    }
  }, [shouldMakeApiCalls]);

  // Add a delay to prevent race conditions with authentication
  useEffect(() => {
    const timer = setTimeout(() => {
      if (shouldMakeApiCalls) {
        refreshStats();
      }
    }, 1000); // 1 second delay

    return () => clearTimeout(timer);
  }, [shouldMakeApiCalls]);

  // Set up polling for real-time updates (every 30 seconds)
  useEffect(() => {
    if (!shouldMakeApiCalls) return;

    const interval = setInterval(() => {
      refreshStats();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [shouldMakeApiCalls]);

  const value: NotificationsContextType = {
    notifications,
    stats,
    isLoading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    archiveNotification,
    refreshStats,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
