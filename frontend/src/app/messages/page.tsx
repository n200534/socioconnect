import MainLayout from '@/components/layout/MainLayout';
import { Avatar } from '@radix-ui/react-avatar';
import { MagnifyingGlassIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

// Mock conversation data
const conversations = [
  {
    id: '1',
    user: {
      name: 'Sarah Wilson',
      username: 'sarahw',
      avatar: '/api/placeholder/40/40',
    },
    lastMessage: 'Thanks for the great conversation about productivity!',
    timestamp: '2m',
    unreadCount: 0,
  },
  {
    id: '2',
    user: {
      name: 'Mike Johnson',
      username: 'mikej',
      avatar: '/api/placeholder/40/40',
    },
    lastMessage: 'Hey, did you see the new React features?',
    timestamp: '15m',
    unreadCount: 2,
  },
  {
    id: '3',
    user: {
      name: 'Emma Davis',
      username: 'emmad',
      avatar: '/api/placeholder/40/40',
    },
    lastMessage: 'Coffee meetup this weekend?',
    timestamp: '1h',
    unreadCount: 1,
  },
  {
    id: '4',
    user: {
      name: 'Alex Chen',
      username: 'alexc',
      avatar: '/api/placeholder/40/40',
    },
    lastMessage: 'The design looks amazing! Great work.',
    timestamp: '3h',
    unreadCount: 0,
  },
];

export default function MessagesPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-900">Messages</h1>
              <div className="mt-3 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages"
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>
            
            <div className="overflow-y-auto">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 rounded-full bg-gray-300 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900 truncate">
                          {conversation.user.name}
                        </p>
                        <p className="text-xs text-gray-500 flex-shrink-0">
                          {conversation.timestamp}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 flex-shrink-0">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 rounded-full bg-gray-300" />
                <div>
                  <h2 className="font-semibold text-gray-900">Sarah Wilson</h2>
                  <p className="text-sm text-gray-500">@sarahw</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-xs">
                  <Avatar className="h-8 w-8 rounded-full bg-gray-300 flex-shrink-0" />
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-sm text-gray-900">
                      Hey! How's your day going?
                    </p>
                    <p className="text-xs text-gray-500 mt-1">2:30 PM</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="bg-blue-600 text-white rounded-lg p-3 max-w-xs">
                  <p className="text-sm">
                    It's going great! Just finished working on a new feature.
                  </p>
                  <p className="text-xs text-blue-200 mt-1">2:32 PM</p>
                </div>
              </div>

              <div className="flex justify-start">
                <div className="flex gap-2 max-w-xs">
                  <Avatar className="h-8 w-8 rounded-full bg-gray-300 flex-shrink-0" />
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-sm text-gray-900">
                      That's awesome! What kind of feature?
                    </p>
                    <p className="text-xs text-gray-500 mt-1">2:33 PM</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="bg-blue-600 text-white rounded-lg p-3 max-w-xs">
                  <p className="text-sm">
                    It's a real-time notification system. Pretty excited about it!
                  </p>
                  <p className="text-xs text-blue-200 mt-1">2:35 PM</p>
                </div>
              </div>

              <div className="flex justify-start">
                <div className="flex gap-2 max-w-xs">
                  <Avatar className="h-8 w-8 rounded-full bg-gray-300 flex-shrink-0" />
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-sm text-gray-900">
                      Sounds interesting! I'd love to hear more about it sometime.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">2:36 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Start a new message"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
