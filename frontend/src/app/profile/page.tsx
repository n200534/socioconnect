'use client';

import MainLayout from '@/components/layout/MainLayout';
import PostCard from '@/components/posts/PostCard';
import { Avatar } from '@radix-ui/react-avatar';
import { 
  CalendarIcon, 
  MapPinIcon, 
  LinkIcon,
  PencilIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/contexts/PostsContext';
import { useEffect, useState } from 'react';

// TODO: Replace with real user data from API

export default function ProfilePage() {
  const { user } = useAuth();
  const { posts, isLoading, error } = usePosts();
  const [userPosts, setUserPosts] = useState<any[]>([]);

  useEffect(() => {
    if (user && posts) {
      // Filter posts by current user
      const filteredPosts = posts.filter(post => post.author_id === user.id);
      setUserPosts(filteredPosts);
    }
  }, [user, posts]);

  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Please log in</h3>
            <p className="text-gray-500">You need to be logged in to view your profile.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

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
                <h1 className="text-2xl font-bold text-gray-900">{user.full_name || user.username}</h1>
                <p className="text-gray-600">@{user.username}</p>
              </div>
            </div>
            <button className="mt-4 px-4 py-2 border border-gray-300 rounded-full font-medium hover:bg-gray-50 transition-colors">
              Edit Profile
            </button>
          </div>

          {/* Bio and Info */}
          <div className="mt-4 space-y-3">
            {user.bio && <p className="text-gray-900">{user.bio}</p>}
            
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
                <span>Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-sm">
              <div className="flex gap-1">
                <span className="font-semibold text-gray-900">{user.following_count || 0}</span>
                <span className="text-gray-600">Following</span>
              </div>
              <div className="flex gap-1">
                <span className="font-semibold text-gray-900">{(user.followers_count || 0).toLocaleString()}</span>
                <span className="text-gray-600">Followers</span>
              </div>
              <div className="flex gap-1">
                <span className="font-semibold text-gray-900">{user.posts_count || 0}</span>
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
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-8 h-8 mx-auto animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p className="text-gray-500">Loading posts...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500">Error loading posts: {error}</p>
            </div>
          ) : userPosts.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-500">Share your first post to get started!</p>
            </div>
          ) : (
            userPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
