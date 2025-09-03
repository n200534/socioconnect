'use client';

import MainLayout from '@/components/layout/MainLayout';
import PostComposer from '@/components/posts/PostComposer';
import PostCard from '@/components/posts/PostCard';
import { usePosts } from '@/contexts/PostsContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { posts, isLoading, error } = usePosts();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to SocioConnect</h2>
            <p className="text-gray-600 mb-8">Please sign in to view your feed</p>
            <a 
              href="/login" 
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-large transition-all duration-200"
            >
              Sign In
            </a>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Post Composer */}
        <PostComposer />

        {/* Feed */}
        <div className="space-y-4">
          {isLoading && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading posts...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          {posts.length === 0 && !isLoading && !error && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600">Be the first to share something!</p>
            </div>
          )}
          
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
