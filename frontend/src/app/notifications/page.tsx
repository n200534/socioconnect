import MainLayout from '@/components/layout/MainLayout';
import { BellIcon, HeartIcon, ChatBubbleLeftIcon, ArrowPathIcon, UserPlusIcon } from '@heroicons/react/24/outline';

// Mock notification data
const notifications = [
  {
    id: '1',
    type: 'like',
    user: {
      name: 'Sarah Wilson',
      username: 'sarahw',
      avatar: '/api/placeholder/40/40',
    },
    action: 'liked your post',
    post: 'Just shipped a new feature that I\'ve been working on for weeks!',
    timestamp: '2m',
    isRead: false,
  },
  {
    id: '2',
    type: 'comment',
    user: {
      name: 'Mike Johnson',
      username: 'mikej',
      avatar: '/api/placeholder/40/40',
    },
    action: 'commented on your post',
    post: 'Coffee and code - the perfect combination for a productive day.',
    comment: 'Couldn\'t agree more! Coffee is essential fuel for coding.',
    timestamp: '15m',
    isRead: false,
  },
  {
    id: '3',
    type: 'follow',
    user: {
      name: 'Emma Davis',
      username: 'emmad',
      avatar: '/api/placeholder/40/40',
    },
    action: 'started following you',
    timestamp: '1h',
    isRead: true,
  },
  {
    id: '4',
    type: 'repost',
    user: {
      name: 'Alex Chen',
      username: 'alexc',
      avatar: '/api/placeholder/40/40',
    },
    action: 'reposted your post',
    post: 'Reading about the latest trends in web development.',
    timestamp: '2h',
    isRead: true,
  },
];

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
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          </div>
          
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
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
            ))}
          </div>
          
          <div className="p-4 text-center">
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Load more notifications
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
