'use client';

import { useState } from 'react';
import { Notification } from '@/lib/api';
import { 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  ArrowPathIcon, 
  UserPlusIcon,
  AtSymbolIcon,
  BellIcon,
  TrashIcon,
  ArchiveBoxIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { getProfilePictureUrl } from '@/lib/media';
import { useNotifications } from '@/contexts/NotificationsContext';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (notificationId: number) => void;
  onDelete?: (notificationId: number) => void;
  onArchive?: (notificationId: number) => void;
}

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
    case 'mention':
      return <AtSymbolIcon className="h-5 w-5 text-orange-500" />;
    case 'system':
      return <BellIcon className="h-5 w-5 text-gray-500" />;
    default:
      return <BellIcon className="h-5 w-5 text-gray-500" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'like':
      return 'bg-red-50 border-red-200';
    case 'comment':
      return 'bg-blue-50 border-blue-200';
    case 'repost':
      return 'bg-green-50 border-green-200';
    case 'follow':
      return 'bg-purple-50 border-purple-200';
    case 'mention':
      return 'bg-orange-50 border-orange-200';
    case 'system':
      return 'bg-gray-50 border-gray-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

export default function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDelete, 
  onArchive 
}: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { markAsRead, deleteNotification, archiveNotification } = useNotifications();

  const handleMarkAsRead = async () => {
    if (!notification.is_read) {
      await markAsRead([notification.id]);
      onMarkAsRead?.(notification.id);
    }
  };

  const handleDelete = async () => {
    await deleteNotification(notification.id);
    onDelete?.(notification.id);
  };

  const handleArchive = async () => {
    await archiveNotification(notification.id);
    onArchive?.(notification.id);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div
      className={`p-4 border-l-4 transition-all duration-200 hover:shadow-sm ${
        notification.is_read 
          ? 'bg-white border-gray-200' 
          : `${getNotificationColor(notification.type)} border-l-4`
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex gap-3">
        {/* Notification Icon */}
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>
        
        {/* Actor Avatar */}
        {notification.actor && (
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
              {notification.actor.avatar_url ? (
                <img 
                  src={getProfilePictureUrl(notification.actor.avatar_url) || ''} 
                  alt={notification.actor.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {notification.actor.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Notification Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-700 mb-2">
                {notification.message}
              </p>
              <p className="text-xs text-gray-500">
                {formatTimeAgo(notification.created_at)}
              </p>
            </div>
            
            {/* Unread indicator */}
            {!notification.is_read && (
              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        {isHovered && (
          <div className="flex-shrink-0 flex gap-1">
            {!notification.is_read && (
              <button
                onClick={handleMarkAsRead}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Mark as read"
              >
                <CheckIcon className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleArchive}
              className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
              title="Archive"
            >
              <ArchiveBoxIcon className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
