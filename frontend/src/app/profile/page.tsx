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
  MapPinIcon as LocationIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/contexts/PostsContext';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import ProfilePictureUpload from '@/components/ui/ProfilePictureUpload';

// TODO: Replace with real user data from API

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { posts, isLoading, error } = usePosts();
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [editForm, setEditForm] = useState({
    full_name: '',
    username: '',
    bio: '',
    location: '',
    website: ''
  });

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
        // TODO: Implement likes functionality
        return [];
      default:
        return userPosts;
    }
  };

  useEffect(() => {
    if (user && posts) {
      // Filter posts by current user (including reposts)
      const filteredPosts = posts.filter(post => {
        // Show original posts by the user
        if (post.author_id === user.id) {
          return true;
        }
        // Show reposts made by the user
        if (post.is_repost && post.author_id === user.id) {
          return true;
        }
        return false;
      });
      setUserPosts(filteredPosts);
    }
  }, [user, posts]);

  useEffect(() => {
    if (user) {
      setEditForm({
        full_name: user.full_name || '',
        username: user.username || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || ''
      });
    }
  }, [user]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsUpdating(true);
    try {
      console.log('Updating profile:', editForm);
      
      // Make API call to update profile
      const response = await apiClient.updateProfile({
        full_name: editForm.full_name,
        username: editForm.username,
        bio: editForm.bio,
        location: editForm.location,
        website: editForm.website
      });
      
      if (response.data) {
        console.log('Profile updated successfully:', response.data);
        // Refresh user data to show updated information
        await refreshUser();
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else if (response.error) {
        console.error('Profile update failed:', response.error);
        alert(`Failed to update profile: ${response.error}`);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setEditForm({
        full_name: user.full_name || '',
        username: user.username || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || ''
      });
    }
    setIsEditing(false);
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-gray-400 mb-6">
              <UserIcon className="w-20 h-20 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Please log in</h3>
            <p className="text-gray-500 text-lg">You need to be logged in to view your profile.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto p-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Cover Image */}
          <div className="h-80 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
            {isEditing && (
              <button className="absolute top-6 right-6 p-4 bg-white/95 backdrop-blur-sm rounded-2xl hover:bg-white hover:scale-105 transition-all duration-200 shadow-xl border border-white/20">
                <CameraIcon className="h-6 w-6 text-gray-700" />
              </button>
            )}
            {/* Decorative elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-400/20 rounded-full blur-2xl"></div>
          </div>

          {/* Profile Content */}
          <div className="relative px-10 pb-10">
            {/* Avatar and Profile Info */}
            <div className="flex flex-col items-center text-center -mt-24">
              <div className="relative group mb-6">
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative border-6 border-white shadow-2xl rounded-full">
                  <ProfilePictureUpload 
                    size="xl"
                    onUpload={() => {
                      // Profile picture updated successfully
                      console.log('Profile picture updated');
                    }}
                    onError={(error) => {
                      console.error('Profile picture upload error:', error);
                    }}
                  />
                </div>
                {isEditing && (
                  <button className="absolute bottom-4 right-4 p-4 bg-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 border border-gray-100">
                    <CameraIcon className="h-6 w-6 text-gray-700" />
                  </button>
                )}
                {/* Online indicator */}
                <div className="absolute bottom-6 left-6 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-lg"></div>
              </div>

              {/* Name and Username - Centered */}
              <div className="mb-8">
                {isEditing ? (
                  <div className="space-y-6 max-w-md">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">Full Name</label>
                      <input
                        type="text"
                        value={editForm.full_name}
                        onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-200 text-lg font-medium text-center text-gray-900"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">Username</label>
                      <div className="relative">
                        <AtSymbolIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={editForm.username}
                          onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-200 text-lg font-medium text-center text-gray-900"
                          placeholder="Enter your username"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <h1 className="text-4xl font-bold text-gray-900">{user.full_name || user.username}</h1>
                      {user.is_verified && (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 text-xl">@{user.username}</p>
                    {user.bio && (
                      <p className="text-gray-700 text-lg leading-relaxed max-w-2xl mx-auto">{user.bio}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Edit Button - Centered */}
            <div className="flex justify-center mb-8">
              {isEditing ? (
                <div className="flex gap-4">
                  <button
                    onClick={handleEditSubmit}
                    disabled={isUpdating}
                    className={`px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-3 text-lg shadow-lg ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isUpdating ? (
                      <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : (
                      <CheckIcon className="h-6 w-6" />
                    )}
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                    className={`px-10 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg transition-all duration-200 flex items-center gap-3 text-lg ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <XMarkIcon className="h-6 w-6" />
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-3 text-lg shadow-lg"
                  >
                    <PencilIcon className="h-6 w-6" />
                    Edit Profile
                  </button>
                  <button className="px-10 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg transition-all duration-200 flex items-center gap-3 text-lg">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Share Profile
                  </button>
                </div>
              )}
            </div>

            {/* Bio and Info */}
            <div className="mt-8 space-y-8">
              {isEditing ? (
                <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-100">
                  <label className="block text-sm font-semibold text-gray-800 mb-4">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 resize-none text-lg text-gray-900"
                    placeholder="Tell us about yourself..."
                  />
                  <p className="text-sm text-gray-500 mt-2">Share a bit about yourself with your followers</p>
                </div>
              ) : (
                user.bio && (
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <p className="text-gray-900 text-lg leading-relaxed">{user.bio}</p>
                  </div>
                )
              )}
              
              {/* Info Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isEditing ? (
                  <>
                    <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-100">
                      <label className="block text-sm font-semibold text-gray-800 mb-4">Location</label>
                      <div className="relative">
                        <LocationIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={editForm.location}
                          onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                          className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-lg text-gray-900"
                          placeholder="Your location"
                        />
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-100">
                      <label className="block text-sm font-semibold text-gray-800 mb-4">Website</label>
                      <div className="relative">
                        <GlobeAltIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="url"
                          value={editForm.website}
                          onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                          className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-lg text-gray-900"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-wrap gap-6 text-gray-600">
                    {user.location && (
                      <div className="flex items-center gap-2">
                        <LocationIcon className="h-5 w-5" />
                        <span className="text-lg">{user.location}</span>
                      </div>
                    )}
                    {user.website && (
                      <div className="flex items-center gap-2">
                        <GlobeAltIcon className="h-5 w-5" />
                        <a 
                          href={user.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-700 text-lg hover:underline"
                        >
                          {user.website.replace('https://', '')}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      <span className="text-lg">Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 text-center border border-purple-100 hover:shadow-lg transition-all duration-200">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{user.following_count || 0}</div>
                  <div className="text-gray-600 font-medium">Following</div>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-cyan-50 rounded-2xl p-6 text-center border border-pink-100 hover:shadow-lg transition-all duration-200">
                  <div className="text-3xl font-bold text-pink-600 mb-1">{(user.followers_count || 0).toLocaleString()}</div>
                  <div className="text-gray-600 font-medium">Followers</div>
                </div>
                <div className="bg-gradient-to-br from-cyan-50 to-purple-50 rounded-2xl p-6 text-center border border-cyan-100 hover:shadow-lg transition-all duration-200">
                  <div className="text-3xl font-bold text-cyan-600 mb-1">{user.posts_count || 0}</div>
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
                  {activeTab === 'posts' && 'Share your first post to get started!'}
                  {activeTab === 'reposts' && 'Repost content you like to see it here.'}
                  {activeTab === 'replies' && 'Reply to posts to see them here.'}
                  {activeTab === 'media' && 'Share posts with media to see them here.'}
                  {activeTab === 'likes' && 'Like posts to see them here.'}
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
