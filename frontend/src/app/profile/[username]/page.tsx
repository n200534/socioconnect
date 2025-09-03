'use client';

import MainLayout from '@/components/layout/MainLayout';
import PostCard from '@/components/posts/PostCard';
import { Avatar } from '@radix-ui/react-avatar';
import { 
  CalendarIcon, 
  MapPinIcon, 
  LinkIcon,
  PencilIcon,
  CameraIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon,
  AtSymbolIcon,
  GlobeAltIcon,
  MapPinIcon as LocationIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/contexts/PostsContext';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

export default function UserProfilePage() {
  const { user: currentUser } = useAuth();
  const { posts, isLoading, error } = usePosts();
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [profileUser, setProfileUser] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  // Filter posts based on active tab
  const getFilteredPosts = () => {
    if (!userPosts) return [];
    
    switch (activeTab) {
      case 'posts':
        return userPosts.filter(post => !post.is_repost && !post.is_reply);
      case 'reposts':
        return userPosts.filter(post => post.is_repost);
      case 'replies':
        return userPosts.filter(post => post.is_reply);
      case 'media':
        return userPosts.filter(post => post.media_url);
      case 'likes':
        return [];
      default:
        return userPosts;
    }
  };

  // Handle follow/unfollow
  const handleFollow = async () => {
    if (!profileUser || !currentUser || isFollowLoading) return;
    
    // Debug logging
    console.log('Follow attempt:', {
      profileUser: profileUser,
      profileUserId: profileUser.id,
      currentUser: currentUser,
      isFollowing: isFollowing,
      accessToken: localStorage.getItem('access_token')
    });
    
    if (!profileUser.id || typeof profileUser.id !== 'number') {
      console.error('Profile user ID is missing or invalid:', profileUser);
      alert('Invalid user profile. Please try again.');
      return;
    }
    
    // Check if user is authenticated
    if (!localStorage.getItem('access_token')) {
      console.error('User is not authenticated');
      alert('Please log in to follow users');
      return;
    }
    
    // Check if trying to follow self
    if (currentUser.id === profileUser.id) {
      console.error('Cannot follow yourself');
      alert('You cannot follow yourself');
      return;
    }
    
    // Test basic connectivity first
    try {
      console.log('Testing basic API connectivity...');
      const testResponse = await apiClient.testPostsEndpoint();
      console.log('Test response:', testResponse);
      
      if (testResponse.error) {
        console.error('API test returned error:', testResponse.error);
        alert(`API Error: ${testResponse.error}`);
        return;
      }
    } catch (testError) {
      console.error('Basic API test failed:', testError);
      alert('Cannot connect to server. Please check if the backend is running.');
      return;
    }
    
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        console.log('Attempting to unfollow user:', profileUser.id);
        const response = await apiClient.unfollowUser(profileUser.id);
        console.log('Unfollow response:', response);
        if (response.data) {
          setIsFollowing(false);
          setProfileUser(prev => ({
            ...prev,
            followers_count: prev.followers_count - 1
          }));
        }
      } else {
        console.log('Attempting to follow user:', profileUser.id);
        const response = await apiClient.followUser(profileUser.id);
        console.log('Follow response:', response);
        if (response.data) {
          setIsFollowing(true);
          setProfileUser(prev => ({
            ...prev,
            followers_count: prev.followers_count + 1
          }));
        }
      }
    } catch (error) {
      console.error('Follow/unfollow error:', error);
      // Show user-friendly error message
      alert('Failed to follow/unfollow user. Please try again.');
    } finally {
      setIsFollowLoading(false);
    }
  };

  useEffect(() => {
    if (posts) {
      // Find the user by username from posts
      const foundUser = posts.find(post => post.author.username === username)?.author;
      if (foundUser) {
        setProfileUser(foundUser);
        setIsFollowing(foundUser.is_following || false);
        // Filter posts by this user
        const filteredPosts = posts.filter(post => {
          if (post.author_id === foundUser.id) {
            return true;
          }
          if (post.is_repost && post.author_id === foundUser.id) {
            return true;
          }
          return false;
        });
        setUserPosts(filteredPosts);
      }
      setIsLoadingProfile(false);
    }
  }, [posts, username]);

  if (isLoadingProfile) {
    return (
      <MainLayout>
        <div className="max-w-5xl mx-auto p-6">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="h-80 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
            <div className="relative px-10 pb-10">
              <div className="flex flex-col items-center text-center -mt-24">
                <div className="relative group mb-6">
                  <div className="h-48 w-48 rounded-full border-6 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-purple-400 via-pink-400 to-cyan-400 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                  </div>
                </div>
                <div className="mb-8">
                  <div className="h-8 bg-gray-200 rounded-lg w-48 mb-4 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded-lg w-32 mb-4 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!profileUser) {
    return (
      <MainLayout>
        <div className="max-w-5xl mx-auto p-6">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="h-80 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              <button 
                onClick={() => router.back()}
                className="absolute top-6 left-6 p-3 bg-white/95 backdrop-blur-sm rounded-2xl hover:bg-white hover:scale-105 transition-all duration-200 shadow-xl border border-white/20"
              >
                <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
              </button>
            </div>
            <div className="relative px-10 pb-10">
              <div className="flex flex-col items-center text-center -mt-24">
                <div className="relative group mb-6">
                  <div className="h-48 w-48 rounded-full border-6 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-purple-400 via-pink-400 to-cyan-400 flex items-center justify-center">
                    <UserIcon className="h-20 w-20 text-white/80" />
                  </div>
                </div>
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">User Not Found</h1>
                  <p className="text-gray-600 text-xl">@{username}</p>
                  <p className="text-gray-500 text-lg mt-4">This user doesn't exist or hasn't posted anything yet.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const isOwnProfile = currentUser && currentUser.username === username;

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto p-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Cover Image */}
          <div className="h-80 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
            <button 
              onClick={() => router.back()}
              className="absolute top-6 left-6 p-3 bg-white/95 backdrop-blur-sm rounded-2xl hover:bg-white hover:scale-105 transition-all duration-200 shadow-xl border border-white/20"
            >
              <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
            </button>
            {/* Decorative elements */}
            <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 left-10 w-32 h-32 bg-pink-400/20 rounded-full blur-2xl"></div>
          </div>

          {/* Profile Content */}
          <div className="relative px-10 pb-10">
            {/* Avatar and Profile Info */}
            <div className="flex flex-col items-center text-center -mt-24">
              <div className="relative group mb-6">
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative h-48 w-48 rounded-full border-6 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-purple-400 via-pink-400 to-cyan-400 flex items-center justify-center">
                  {profileUser.avatar_url ? (
                    <img 
                      src={profileUser.avatar_url} 
                      alt={`${profileUser.full_name || profileUser.username}'s avatar`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <UserIcon className="h-20 w-20 text-white/80" />
                    </div>
                  )}
                </div>
                {/* Online indicator */}
                <div className="absolute bottom-6 left-6 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-lg"></div>
              </div>

              {/* Name and Username - Centered */}
              <div className="mb-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <h1 className="text-4xl font-bold text-gray-900">{profileUser.full_name || profileUser.username}</h1>
                    {profileUser.is_verified && (
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 text-xl">@{profileUser.username}</p>
                  {profileUser.bio && (
                    <p className="text-gray-700 text-lg leading-relaxed max-w-2xl mx-auto">{profileUser.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Button - Centered */}
            <div className="flex justify-center mb-8">
              {isOwnProfile ? (
                <button
                  onClick={() => router.push('/profile')}
                  className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-3 text-lg shadow-lg"
                >
                  <PencilIcon className="h-6 w-6" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-4">
                  <button 
                    onClick={handleFollow}
                    disabled={isFollowLoading}
                    className={`px-10 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center gap-3 text-lg shadow-lg ${
                      isFollowing 
                        ? 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-2xl hover:scale-105'
                    } ${isFollowLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isFollowLoading ? (
                      <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : isFollowing ? (
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    )}
                    {isFollowLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button className="px-10 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg transition-all duration-200 flex items-center gap-3 text-lg">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Message
                  </button>
                </div>
              )}
            </div>

            {/* Bio and Info */}
            <div className="mt-8 space-y-8">
              {/* Info Fields */}
              <div className="flex flex-wrap justify-center gap-6 text-gray-600">
                {profileUser.location && (
                  <div className="flex items-center gap-2">
                    <LocationIcon className="h-5 w-5" />
                    <span className="text-lg">{profileUser.location}</span>
                  </div>
                )}
                {profileUser.website && (
                  <div className="flex items-center gap-2">
                    <GlobeAltIcon className="h-5 w-5" />
                    <a 
                      href={profileUser.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 text-lg hover:underline"
                    >
                      {profileUser.website.replace('https://', '')}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  <span className="text-lg">Joined {new Date(profileUser.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 text-center border border-purple-100 hover:shadow-lg transition-all duration-200">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{profileUser.following_count || 0}</div>
                  <div className="text-gray-600 font-medium">Following</div>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-cyan-50 rounded-2xl p-6 text-center border border-pink-100 hover:shadow-lg transition-all duration-200">
                  <div className="text-3xl font-bold text-pink-600 mb-1">{(profileUser.followers_count || 0).toLocaleString()}</div>
                  <div className="text-gray-600 font-medium">Followers</div>
                </div>
                <div className="bg-gradient-to-br from-cyan-50 to-purple-50 rounded-2xl p-6 text-center border border-cyan-100 hover:shadow-lg transition-all duration-200">
                  <div className="text-3xl font-bold text-cyan-600 mb-1">{profileUser.posts_count || 0}</div>
                  <div className="text-gray-600 font-medium">Posts</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-100 bg-gray-50/50">
            <nav className="flex px-6">
              {['posts', 'reposts', 'replies', 'media', 'likes'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-5 text-sm font-semibold capitalize transition-all duration-200 relative ${
                    activeTab === tab
                      ? 'text-purple-600 bg-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-full"></div>
                  )}
                  <span className="relative z-10">{tab}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-8 bg-white">
            {isLoading ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-6">
                  <svg className="w-8 h-8 text-purple-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <p className="text-gray-600 text-lg font-medium">Loading posts...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 text-lg font-medium">Error loading posts: {error}</p>
              </div>
            ) : getFilteredPosts().length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-8">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {activeTab === 'posts' && 'No posts yet'}
                  {activeTab === 'reposts' && 'No reposts yet'}
                  {activeTab === 'replies' && 'No replies yet'}
                  {activeTab === 'media' && 'No media posts yet'}
                  {activeTab === 'likes' && 'No liked posts yet'}
                </h3>
                <p className="text-gray-500 text-lg max-w-md mx-auto">
                  {activeTab === 'posts' && 'This user hasn\'t shared any posts yet.'}
                  {activeTab === 'reposts' && 'This user hasn\'t reposted anything yet.'}
                  {activeTab === 'replies' && 'This user hasn\'t replied to any posts yet.'}
                  {activeTab === 'media' && 'This user hasn\'t shared any media posts yet.'}
                  {activeTab === 'likes' && 'This user hasn\'t liked any posts yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {getFilteredPosts().map((post, index) => (
                  <div key={post.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <PostCard post={post} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
