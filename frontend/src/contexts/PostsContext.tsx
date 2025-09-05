'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, Post, PostCreate, Comment } from '@/lib/api';
import { useAuth } from './AuthContext';

interface PostsContextType {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  hasNext: boolean;
  hasPrev: boolean;
  currentPage: number;
  totalPosts: number;
  fetchPosts: (page?: number, refresh?: boolean) => Promise<void>;
  createPost: (postData: PostCreate) => Promise<{ success: boolean; error?: string }>;
  deletePost: (postId: number) => Promise<{ success: boolean; error?: string }>;
  likePost: (postId: number) => Promise<void>;
  repost: (postId: number) => Promise<void>;
  createComment: (postId: number, content: string) => Promise<{ success: boolean; error?: string }>;
  getComments: (postId: number) => Promise<Comment[]>;
  refreshPosts: () => Promise<void>;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

interface PostsProviderProps {
  children: ReactNode;
}

export function PostsProvider({ children }: PostsProviderProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  
  const { isAuthenticated } = useAuth();

  const fetchPosts = async (page = 1, refresh = false) => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.getPosts(page, 20);
      
      if (response.data) {
        if (refresh || page === 1) {
          setPosts(response.data.posts || []);
        } else {
          setPosts(prev => [...prev, ...(response.data?.posts || [])]);
        }
        
        setHasNext(response.data.has_next || false);
        setHasPrev(response.data.has_prev || false);
        setCurrentPage(response.data.page || 1);
        setTotalPosts(response.data.total || 0);
      } else {
        console.error('Posts API Error:', response.error);
        setError(response.error || 'Failed to fetch posts');
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setError('Network error - please check if the server is running');
      // Set empty posts array to prevent crashes
      setPosts([]);
      setHasNext(false);
      setHasPrev(false);
      setCurrentPage(1);
      setTotalPosts(0);
    } finally {
      setIsLoading(false);
    }
  };

  const createPost = async (postData: PostCreate) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.createPost(postData);
      
      if (response.data) {
        // Add the new post to the beginning of the list
        setPosts(prev => [response.data!, ...prev]);
        setTotalPosts(prev => prev + 1);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Failed to create post' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  const deletePost = async (postId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.deletePost(postId);
      
      if (response.data) {
        // Remove the post from the list
        setPosts(prev => prev.filter(post => post.id !== postId));
        setTotalPosts(prev => Math.max(0, prev - 1));
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Failed to delete post' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  const likePost = async (postId: number) => {
    try {
      const response = await apiClient.likePost(postId);
      
      if (response.data) {
        // Update the post in the list
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              is_liked: response.data!.liked,
              likes_count: response.data!.liked 
                ? post.likes_count + 1 
                : Math.max(0, post.likes_count - 1)
            };
          }
          return post;
        }));
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const repost = async (postId: number) => {
    try {
      const response = await apiClient.repost(postId);
      
      if (response.data) {
        // Update the post in the list
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              is_reposted: response.data!.reposted,
              reposts_count: response.data!.reposted 
                ? post.reposts_count + 1 
                : Math.max(0, post.reposts_count - 1)
            };
          }
          return post;
        }));
        
        // Refresh posts to get the new repost entry
        await fetchPosts(1, true);
      }
    } catch (error) {
      console.error('Failed to repost:', error);
    }
  };

  const createComment = async (postId: number, content: string) => {
    try {
      const response = await apiClient.createComment(postId, content);
      
      if (response.data) {
        // Update the post's comment count
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments_count: post.comments_count + 1
            };
          }
          return post;
        }));
        
        return { success: true };
      } else if (response.error) {
        return { success: false, error: response.error };
      }
      
      return { success: false, error: 'Failed to create comment' };
    } catch (error) {
      console.error('Failed to create comment:', error);
      return { success: false, error: 'Failed to create comment' };
    }
  };

  const getComments = async (postId: number) => {
    try {
      const response = await apiClient.getComments(postId);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      return [];
    }
  };

  const refreshPosts = async () => {
    await fetchPosts(1, true);
  };

  // Fetch posts when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts(1, true);
    } else {
      setPosts([]);
      setError(null);
    }
  }, [isAuthenticated]);

  const value: PostsContextType = {
    posts,
    isLoading,
    error,
    hasNext,
    hasPrev,
    currentPage,
    totalPosts,
    fetchPosts,
    createPost,
    deletePost,
    likePost,
    repost,
    createComment,
    getComments,
    refreshPosts,
  };

  return (
    <PostsContext.Provider value={value}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
}
