'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import NotificationItem from '@/components/notifications/NotificationItem';
import { useNotifications } from '@/contexts/NotificationsContext';
import { 
  BellIcon, 
  CheckIcon, 
  TrashIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function NotificationsPage() {
  const { 
    notifications, 
    stats, 
    isLoading, 
    error, 
    fetchNotifications, 
    markAllAsRead, 
    clearAllNotifications 
  } = useNotifications();
  
  const [filter, setFilter] = useState<{
    type?: string;
    is_read?: boolean;
  }>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchNotifications(filter);
  }, [filter]);

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      await clearAllNotifications();
    }
  };

  const handleFilterChange = (key: string, value: string | boolean | undefined) => {
    setFilter(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }));
  };

  const filteredNotifications = (notifications || []).filter(notification => {
    if (filter.type && notification.type !== filter.type) return false;
    if (filter.is_read !== undefined && notification.is_read !== filter.is_read) return false;
    return true;
  });

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                  {stats && (
                    <p className="text-sm text-gray-600 mt-1">
                      {stats.unread} unread • {stats.total} total
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Filter notifications"
                  >
                    <FunnelIcon className="h-5 w-5" />
                  </button>
                  
                  {stats && stats.unread > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                    >
                      <CheckIcon className="h-4 w-4" />
                      Mark all read
                    </button>
                  )}
                  
                  {(notifications || []).length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Clear all notifications"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Filters */}
              {showFilters && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={filter.type || 'all'}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="all">All types</option>
                        <option value="like">Likes</option>
                        <option value="comment">Comments</option>
                        <option value="repost">Reposts</option>
                        <option value="follow">Follows</option>
                        <option value="mention">Mentions</option>
                        <option value="system">System</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={filter.is_read === undefined ? 'all' : filter.is_read.toString()}
                        onChange={(e) => handleFilterChange('is_read', e.target.value === 'all' ? undefined : e.target.value === 'true')}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="all">All</option>
                        <option value="false">Unread</option>
                        <option value="true">Read</option>
                      </select>
                    </div>
                    
                    <button
                      onClick={() => setFilter({})}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Clear filters
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="divide-y divide-gray-200">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading notifications...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BellIcon className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-gray-600">Error loading notifications: {error}</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <BellIcon className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {(notifications || []).length === 0 ? 'No notifications yet' : 'No notifications match your filters'}
                  </h3>
                  <p className="text-gray-500">
                    {(notifications || []).length === 0 
                      ? "When people interact with your posts, you'll see notifications here."
                      : 'Try adjusting your filters to see more notifications.'
                    }
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
