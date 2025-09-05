'use client';

import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { BellIcon, HeartIcon, ChatBubbleLeftIcon, ArrowPathIcon, UserPlusIcon } from '@heroicons/react/24/outline';

// TODO: Replace with real notifications from API
const notifications: any[] = [];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'like':
      return <HeartIcon className="h-5 w-5 text-red-500" />;
    case 'comment':
      return <ChatBubbleLeftIcon className="h-5 w-5 text-blue-500" />;
    case 'repost':
      return <ArrowPathIcon className="h-5 w-5 text-green-500" />;
    case 'follow':
      return <UserPlusIcon className="h-5 w-5 text-purple-500" />;
    default:
      return <BellIcon className="h-5 w-5 text-gray-500" />;
  }
};

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          </div>
          
          <div className="divide-y divide-gray-200">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <BellIcon className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
                <p className="text-gray-500">When people interact with your posts, you'll see notifications here.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-semibold">{notification.user.name}</span>{' '}
                            <span className="text-gray-600">{notification.action}</span>
                          </p>
                          {notification.post && (
                            <p className="text-sm text-gray-600 mt-1 truncate">
                              "{notification.post}"
                            </p>
                          )}
                          {notification.comment && (
                            <p className="text-sm text-gray-600 mt-1">
                              "{notification.comment}"
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                        </div>
                      </div>
                    </div>
                    
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-4 text-center">
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Load more notifications
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
    </ProtectedRoute>
  );
}
