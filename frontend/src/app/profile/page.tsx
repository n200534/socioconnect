import MainLayout from '@/components/layout/MainLayout';
import PostCard from '@/components/posts/PostCard';
import { Avatar } from '@radix-ui/react-avatar';
import { 
  CalendarIcon, 
  MapPinIcon, 
  LinkIcon,
  PencilIcon 
} from '@heroicons/react/24/outline';

// Mock user data
const user = {
  name: 'John Doe',
  username: 'johndoe',
  bio: 'Software developer passionate about building amazing products. Love coffee, coding, and connecting with people.',
  location: 'San Francisco, CA',
  website: 'https://johndoe.dev',
  joinDate: 'January 2023',
  avatar: '/api/placeholder/150/150',
  coverImage: '/api/placeholder/600/200',
  following: 234,
  followers: 1890,
  posts: 156,
};

// Mock user posts
const userPosts = [
  {
    id: '1',
    author: {
      name: user.name,
      username: user.username,
      avatar: user.avatar,
    },
    content: 'Just shipped a new feature that I\'ve been working on for weeks! The feeling of seeing your code in production is unmatched. 🚀',
    timestamp: '2h',
    likes: 42,
    comments: 8,
    reposts: 5,
    isLiked: false,
    isReposted: false,
  },
  {
    id: '2',
    author: {
      name: user.name,
      username: user.username,
      avatar: user.avatar,
    },
    content: 'Coffee and code - the perfect combination for a productive day. What\'s your favorite way to start the morning? ☕',
    timestamp: '1d',
    likes: 28,
    comments: 12,
    reposts: 3,
    isLiked: true,
    isReposted: false,
  },
  {
    id: '3',
    author: {
      name: user.name,
      username: user.username,
      avatar: user.avatar,
    },
    content: 'Reading about the latest trends in web development. The ecosystem is evolving so fast! What technologies are you most excited about?',
    timestamp: '3d',
    likes: 15,
    comments: 7,
    reposts: 2,
    isLiked: false,
    isReposted: false,
  },
];

export default function ProfilePage() {
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Profile Header */}
        <div className="relative px-4 pb-4">
          <div className="flex justify-between items-start">
            <div className="flex items-end gap-4 -mt-16">
              <Avatar className="h-32 w-32 rounded-full bg-gray-300 border-4 border-white" />
              <div className="pb-4">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600">@{user.username}</p>
              </div>
            </div>
            <button className="mt-4 px-4 py-2 border border-gray-300 rounded-full font-medium hover:bg-gray-50 transition-colors">
              Edit Profile
            </button>
          </div>

          {/* Bio and Info */}
          <div className="mt-4 space-y-3">
            <p className="text-gray-900">{user.bio}</p>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.website && (
                <div className="flex items-center gap-1">
                  <LinkIcon className="h-4 w-4" />
                  <a 
                    href={user.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {user.website.replace('https://', '')}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span>Joined {user.joinDate}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-sm">
              <div className="flex gap-1">
                <span className="font-semibold text-gray-900">{user.following}</span>
                <span className="text-gray-600">Following</span>
              </div>
              <div className="flex gap-1">
                <span className="font-semibold text-gray-900">{user.followers.toLocaleString()}</span>
                <span className="text-gray-600">Followers</span>
              </div>
              <div className="flex gap-1">
                <span className="font-semibold text-gray-900">{user.posts}</span>
                <span className="text-gray-600">Posts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button className="px-4 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
              Posts
            </button>
            <button className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900">
              Replies
            </button>
            <button className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900">
              Media
            </button>
            <button className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900">
              Likes
            </button>
          </nav>
        </div>

        {/* Posts */}
        <div className="divide-y divide-gray-200">
          {userPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
