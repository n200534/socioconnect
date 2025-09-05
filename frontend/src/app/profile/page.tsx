'use client';

import MainLayout from '@/components/layout/MainLayout';
import PostCard from '@/components/posts/PostCard';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
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
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: '',
    username: '',
    bio: '',
    location: '',
    website: ''
  });

  // This should never happen due to ProtectedRoute, but adding for TypeScript
  if (!user) {
    return null;
  }

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

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="min-h-screen bg-gray-50">
          {/* Notification */}
          {notification && (
            <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
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
                <span>{notification.message}</span>
                <button
                  onClick={() => setNotification(null)}
                  className="ml-2 hover:opacity-70"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
              {/* Cover Photo */}
              <div className="relative h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                {isEditing && (
                  <button className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-all duration-200 shadow-md">
                    <CameraIcon className="h-5 w-5 text-gray-700" />
                  </button>
                )}
              </div>

              {/* Profile Info */}
              <div className="px-6 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16">
                  {/* Avatar and Basic Info */}
                  <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                        <ProfilePictureUpload 
                          size="xl"
                          onUpload={(url) => {
                            console.log('Profile picture updated:', url);
                            // Refresh user data to show updated avatar
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
                        <button className="absolute -bottom-2 -right-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-200 shadow-lg">
                          <CameraIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {isEditing ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                              type="text"
                              value={editForm.full_name}
                              onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              placeholder="Enter your full name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <div className="relative">
                              <AtSymbolIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                type="text"
                                value={editForm.username}
                                onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                placeholder="Enter your username"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900">{user.full_name || user.username}</h1>
                            {user.is_verified && (
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <p className="text-gray-600">@{user.username}</p>
                          {user.bio && (
                            <p className="text-gray-700 mt-2 max-w-md">{user.bio}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4 sm:mt-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleEditSubmit}
                          disabled={isUpdating}
                          className={`px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all duration-200 flex items-center gap-2 ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isUpdating ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          ) : (
                            <CheckIcon className="h-4 w-4" />
                          )}
                          {isUpdating ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={isUpdating}
                          className={`px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 flex items-center gap-2 ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <XMarkIcon className="h-4 w-4" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all duration-200 flex items-center gap-2"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-6 space-y-4">
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea
                          value={editForm.bio}
                          onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                          <div className="relative">
                            <LocationIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              value={editForm.location}
                              onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              placeholder="Your location"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                          <div className="relative">
                            <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="url"
                              value={editForm.website}
                              onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              placeholder="https://yourwebsite.com"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-6 text-gray-600">
                      {user.location && (
                        <div className="flex items-center gap-2">
                          <LocationIcon className="h-4 w-4" />
                          <span>{user.location}</span>
                        </div>
                      )}
                      {user.website && (
                        <div className="flex items-center gap-2">
                          <GlobeAltIcon className="h-4 w-4" />
                          <a 
                            href={user.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            {user.website.replace('https://', '')}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex gap-8 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">{user.following_count || 0}</div>
                      <div className="text-sm text-gray-600">Following</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">{(user.followers_count || 0).toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">{user.posts_count || 0}</div>
                      <div className="text-sm text-gray-600">Posts</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white border-b border-gray-200">
              <nav className="flex overflow-x-auto">
                {['posts', 'reposts', 'replies', 'media', 'likes'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 text-sm font-medium capitalize transition-all duration-200 whitespace-nowrap border-b-2 ${
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
            <div className="bg-white min-h-screen">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                          </div>
                          <div className="space-y-1">
                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="p-6 text-center py-12">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600">Error loading posts: {error}</p>
                </div>
              ) : getFilteredPosts().length === 0 ? (
                <div className="p-6 text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {activeTab === 'posts' && 'No posts yet'}
                    {activeTab === 'reposts' && 'No reposts yet'}
                    {activeTab === 'replies' && 'No replies yet'}
                    {activeTab === 'media' && 'No media posts yet'}
                    {activeTab === 'likes' && 'No liked posts yet'}
                  </h3>
                  <p className="text-gray-500">
                    {activeTab === 'posts' && 'Share your first post to get started!'}
                    {activeTab === 'reposts' && 'Repost content you like to see it here.'}
                    {activeTab === 'replies' && 'Reply to posts to see them here.'}
                    {activeTab === 'media' && 'Share posts with media to see them here.'}
                    {activeTab === 'likes' && 'Like posts to see them here.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
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
