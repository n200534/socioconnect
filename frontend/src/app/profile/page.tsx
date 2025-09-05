'use client';

import MainLayout from '@/components/layout/MainLayout';
import PostCard from '@/components/posts/PostCard';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { 
  CalendarIcon, 
  PencilIcon,
  CameraIcon,
  CheckIcon,
  XMarkIcon,
  AtSymbolIcon,
  GlobeAltIcon,
  MapPinIcon as LocationIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/contexts/PostsContext';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import ProfilePictureUpload from '@/components/ui/ProfilePictureUpload';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { posts, isLoading, error } = usePosts();
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: '',
    username: '',
    bio: '',
    location: '',
    website: ''
  });

  // Load user posts when component mounts
  useEffect(() => {
    const loadUserPosts = async () => {
      if (user?.id) {
        // First try to get posts from the general posts feed (which is already loaded)
        const fallbackPosts = posts.filter(post => post.author_id === user.id);
        if (fallbackPosts.length > 0) {
          console.log('Using posts from general feed:', fallbackPosts.length, 'posts');
          setUserPosts(fallbackPosts);
        }

        // Then try to get more specific user posts if authenticated
        if (apiClient.isAuthenticated()) {
          try {
            console.log('Loading user posts for user ID:', user.id);
            const response = await apiClient.getUserPosts(user.id);
            if (response.data) {
              console.log('User posts loaded successfully:', response.data);
              setUserPosts(response.data.posts);
            } else {
              console.error('Failed to load user posts:', response.error);
            }
          } catch (error) {
            console.error('Error loading user posts:', error);
            // Keep the fallback posts if API call fails
            console.log('Keeping fallback posts due to API error');
          }
        } else {
          console.log('User not authenticated, using fallback posts');
        }
      } else {
        console.log('No user ID, setting empty posts');
        setUserPosts([]);
      }
    };

    loadUserPosts();
  }, [user?.id, posts]);

  // Initialize edit form when user data changes
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

  // This should never happen due to ProtectedRoute, but adding for TypeScript
  if (!user) {
    return null;
  }

  // Filter posts based on active tab
  const getFilteredPosts = () => {
    if (!userPosts) return [];
    
    switch (activeTab) {
      case 'posts':
        return userPosts.filter(post => !post.is_reply && !post.is_repost);
      case 'replies':
        return userPosts.filter(post => post.is_reply);
      case 'reposts':
        return userPosts.filter(post => post.is_repost);
      case 'media':
        return userPosts.filter(post => post.media_url);
      case 'likes':
        return userPosts.filter(post => post.liked_by_user);
      default:
        return userPosts;
    }
  };

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
        showNotification('success', 'Profile updated successfully!');
      } else if (response.error) {
        console.error('Profile update failed:', response.error);
        showNotification('error', `Failed to update profile: ${response.error}`);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      showNotification('error', 'Failed to update profile. Please try again.');
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

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
          {/* Notification */}
          {notification && (
            <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl transition-all duration-300 ${
              notification.type === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              <div className="flex items-center gap-2">
                {notification.type === 'success' ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  <XMarkIcon className="h-5 w-5" />
                )}
                <span className="font-medium">{notification.message}</span>
                <button
                  onClick={() => setNotification(null)}
                  className="ml-2 hover:opacity-70"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          
          <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Profile Header */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-8">
              {/* Cover Photo */}
              <div className="relative h-80 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/40 to-transparent"></div>
                {isEditing && (
                  <button className="absolute top-6 right-6 p-3 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-all duration-200 shadow-xl">
                    <CameraIcon className="h-6 w-6 text-gray-700" />
                  </button>
                )}
              </div>

              {/* Profile Info */}
              <div className="px-8 pb-8">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between -mt-24">
                  {/* Avatar and Basic Info */}
                  <div className="flex flex-col lg:flex-row lg:items-end space-y-6 lg:space-y-0 lg:space-x-8">
                    <div className="relative">
                      <div className="w-44 h-44 rounded-3xl border-4 border-white shadow-2xl overflow-hidden bg-gray-100">
                        <ProfilePictureUpload 
                          size="2xl"
                          onUpload={(url) => {
                            console.log('Profile picture updated:', url);
                            refreshUser();
                            showNotification('success', 'Profile picture updated successfully!');
                          }}
                          onError={(error) => {
                            console.error('Profile picture upload error:', error);
                            showNotification('error', `Failed to upload profile picture: ${error}`);
                          }}
                        />
                      </div>
                      {isEditing && (
                        <button className="absolute -bottom-3 -right-3 p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-xl">
                          <CameraIcon className="h-6 w-6" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {isEditing ? (
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">Full Name</label>
                            <input
                              type="text"
                              value={editForm.full_name}
                              onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                              className="px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-xl font-medium"
                              placeholder="Enter your full name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">Username</label>
                            <div className="relative">
                              <AtSymbolIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                              <input
                                type="text"
                                value={editForm.username}
                                onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                                className="w-full pl-14 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-xl font-medium"
                                placeholder="Enter your username"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <h1 className="text-4xl font-bold text-gray-900">{user.full_name || user.username}</h1>
                            {user.is_verified && (
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <p className="text-gray-600 text-xl mb-4 font-medium">@{user.username}</p>
                          {user.bio && (
                            <p className="text-gray-700 text-lg max-w-2xl leading-relaxed">{user.bio}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 mt-8 lg:mt-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleEditSubmit}
                          disabled={isUpdating}
                          className={`px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-3 shadow-xl hover:shadow-2xl ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                          className={`px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all duration-200 flex items-center gap-3 ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <XMarkIcon className="h-6 w-6" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-3 shadow-xl hover:shadow-2xl"
                      >
                        <PencilIcon className="h-6 w-6" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-10 space-y-8">
                  {isEditing ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">Bio</label>
                        <textarea
                          value={editForm.bio}
                          onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                          rows={5}
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none text-lg"
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3">Location</label>
                          <div className="relative">
                            <LocationIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                            <input
                              type="text"
                              value={editForm.location}
                              onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                              className="w-full pl-14 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                              placeholder="Your location"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3">Website</label>
                          <div className="relative">
                            <GlobeAltIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                            <input
                              type="url"
                              value={editForm.website}
                              onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                              className="w-full pl-14 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                              placeholder="https://yourwebsite.com"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-6">
                      {user.location && (
                        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 rounded-xl border border-blue-200">
                          <LocationIcon className="h-6 w-6 text-blue-600" />
                          <span className="font-semibold text-blue-800">{user.location}</span>
                        </div>
                      )}
                      {user.website && (
                        <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 rounded-xl border border-green-200">
                          <GlobeAltIcon className="h-6 w-6 text-green-600" />
                          <a 
                            href={user.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-green-700 hover:text-green-800 hover:underline font-semibold"
                          >
                            {user.website.replace('https://', '')}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 rounded-xl border border-purple-200">
                        <CalendarIcon className="h-6 w-6 text-purple-600" />
                        <span className="font-semibold text-purple-800">Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6 pt-8 border-t-2 border-gray-100">
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                      <div className="text-3xl font-bold text-blue-600 mb-2">{user.following_count || 0}</div>
                      <div className="text-sm text-blue-700 font-semibold uppercase tracking-wide">Following</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                      <div className="text-3xl font-bold text-purple-600 mb-2">{(user.followers_count || 0).toLocaleString()}</div>
                      <div className="text-sm text-purple-700 font-semibold uppercase tracking-wide">Followers</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200">
                      <div className="text-3xl font-bold text-green-600 mb-2">{user.posts_count || 0}</div>
                      <div className="text-sm text-green-700 font-semibold uppercase tracking-wide">Posts</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-8">
              <nav className="flex overflow-x-auto">
                {['posts', 'replies', 'reposts', 'media', 'likes'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-8 py-6 text-lg font-semibold capitalize transition-all duration-200 whitespace-nowrap border-b-4 ${
                      activeTab === tab
                        ? 'text-blue-600 border-blue-500 bg-blue-50'
                        : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 min-h-screen">
              {isLoading ? (
                <div className="p-8 space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border border-gray-200 rounded-2xl p-6 animate-pulse">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="p-8 text-center py-16">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-lg">Error loading posts: {error}</p>
                </div>
              ) : getFilteredPosts().length === 0 ? (
                <div className="p-8 text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {activeTab === 'posts' && 'No posts yet'}
                    {activeTab === 'replies' && 'No replies yet'}
                    {activeTab === 'reposts' && 'No reposts yet'}
                    {activeTab === 'media' && 'No media posts yet'}
                    {activeTab === 'likes' && 'No liked posts yet'}
                  </h3>
                  <p className="text-gray-500 text-lg">
                    {activeTab === 'posts' && 'Share your first post to get started!'}
                    {activeTab === 'replies' && 'Reply to posts to see them here.'}
                    {activeTab === 'reposts' && 'Repost content you like to see it here.'}
                    {activeTab === 'media' && 'Share posts with media to see them here.'}
                    {activeTab === 'likes' && 'Like posts to see them here.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {getFilteredPosts().map((post, index) => (
                    <div 
                      key={post.id} 
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <PostCard post={post} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}