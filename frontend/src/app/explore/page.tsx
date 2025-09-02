import MainLayout from '@/components/layout/MainLayout';
import PostCard from '@/components/posts/PostCard';

// Mock data for trending posts
const trendingPosts = [
  {
    id: '1',
    author: {
      name: 'Tech News',
      username: 'technews',
      avatar: '/api/placeholder/40/40',
    },
    content: 'Breaking: New AI breakthrough in natural language processing! This could revolutionize how we interact with technology. 🤖✨',
    timestamp: '1h',
    likes: 1250,
    comments: 89,
    reposts: 156,
    isLiked: false,
    isReposted: false,
  },
  {
    id: '2',
    author: {
      name: 'Sarah Wilson',
      username: 'sarahw',
      avatar: '/api/placeholder/40/40',
    },
    content: 'Just finished reading an amazing book about productivity. The key insight: focus on systems, not goals. What are your favorite productivity tips? 📚',
    timestamp: '3h',
    likes: 342,
    comments: 67,
    reposts: 23,
    isLiked: true,
    isReposted: false,
  },
  {
    id: '3',
    author: {
      name: 'Design Daily',
      username: 'designdaily',
      avatar: '/api/placeholder/40/40',
    },
    content: 'Beautiful minimal design inspiration for today. Sometimes less really is more. What do you think about this aesthetic? 🎨',
    timestamp: '5h',
    likes: 567,
    comments: 34,
    reposts: 45,
    isLiked: false,
    isReposted: true,
  },
  {
    id: '4',
    author: {
      name: 'Alex Chen',
      username: 'alexc',
      avatar: '/api/placeholder/40/40',
    },
    content: 'Coffee shop productivity mode activated! ☕ There\'s something magical about working in a bustling environment. Where\'s your favorite place to work?',
    timestamp: '7h',
    likes: 189,
    comments: 28,
    reposts: 12,
    isLiked: false,
    isReposted: false,
  },
];

const trendingTopics = [
  { tag: '#AI', posts: '12.5K posts' },
  { tag: '#Productivity', posts: '8.2K posts' },
  { tag: '#Design', posts: '6.7K posts' },
  { tag: '#Tech', posts: '15.3K posts' },
  { tag: '#Coffee', posts: '4.1K posts' },
];

export default function ExplorePage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-4 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-900">Explore</h1>
                <p className="text-gray-600 mt-1">Discover what's happening around the world</p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {trendingPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Topics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Trending Topics</h2>
              </div>
              <div className="p-4 space-y-3">
                {trendingTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-blue-600">{topic.tag}</p>
                      <p className="text-sm text-gray-500">{topic.posts}</p>
                    </div>
                    <div className="text-gray-400">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Who to Follow */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Who to Follow</h2>
              </div>
              <div className="p-4 space-y-4">
                {[
                  { name: 'Emma Davis', username: 'emmad', followers: '12.5K followers' },
                  { name: 'Tech Insights', username: 'techinsights', followers: '8.9K followers' },
                  { name: 'Creative Studio', username: 'creativestudio', followers: '15.2K followers' },
                ].map((user, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                        <p className="text-xs text-gray-400">{user.followers}</p>
                      </div>
                    </div>
                    <button className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-colors">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
