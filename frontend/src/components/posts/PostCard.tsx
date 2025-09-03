'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Avatar } from '@radix-ui/react-avatar';
import { 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  ArrowPathIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolidIcon
} from '@heroicons/react/24/solid';
import { usePosts } from '@/contexts/PostsContext';
import { Post } from '@/lib/api';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isReposting, setIsReposting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  const { likePost, repost, createComment } = usePosts();

  const handleLike = async () => {
    setIsLiking(true);
    try {
      await likePost(post.id);
    } finally {
      // Add a small delay for better UX
      setTimeout(() => {
        setIsLiking(false);
      }, 500);
    }
  };

  const handleCommentClick = () => {
    setShowComments(!showComments);
    if (!showComments) {
      setShowCommentForm(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      try {
        const result = await createComment(post.id, newComment.trim());
        if (result.success) {
          setNewComment('');
          setShowCommentForm(false);
          // Optionally refresh comments or show success message
        } else {
          console.error('Failed to create comment:', result.error);
          // Show error message to user
        }
      } catch (error) {
        console.error('Error creating comment:', error);
      }
    }
  };

  const handleRepost = async () => {
    setIsReposting(true);
    try {
      await repost(post.id);
    } finally {
      // Stop the spinning animation after a short delay
      setTimeout(() => {
        setIsReposting(false);
      }, 1000);
    }
  };



  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <article 
      className="bg-white/70 backdrop-blur-md rounded-3xl shadow-soft border border-white/60 p-6 hover:shadow-large hover:bg-white/90 transition-all duration-500 group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex gap-4">
        <Link href={`/profile/${post.author.username}`}>
          <Avatar className="h-14 w-14 rounded-full gradient-primary flex-shrink-0 cursor-pointer shadow-medium hover:shadow-large transition-all duration-300 hover:scale-110" />
        </Link>
        
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <Link 
              href={`/profile/${post.author.username}`}
              className="font-bold text-gray-900 hover:text-purple-600 transition-colors text-lg"
            >
              {post.author.full_name}
            </Link>
            <span className="text-gray-400 text-lg">·</span>
            <Link 
              href={`/profile/${post.author.username}`}
              className="text-gray-500 hover:text-purple-600 transition-colors font-medium hover:underline"
            >
              @{post.author.username}
            </Link>
            <span className="text-gray-400">·</span>
            <time className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
              {new Date(post.created_at).toLocaleDateString()}
            </time>
            
            {/* Menu Button */}
            <div className="ml-auto relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
              >
                <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500" />
              </button>
              
              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 top-10 bg-white rounded-xl shadow-large border border-gray-200 py-2 w-48 z-10">
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <EyeIcon className="h-4 w-4" />
                    View post
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <ShareIcon className="h-4 w-4" />
                    Share post
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <FlagIcon className="h-4 w-4" />
                    Report post
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            {post.is_repost && post.original_post ? (
              <div className="border-l-4 border-purple-200 pl-4 bg-purple-50 rounded-r-lg p-4">
                <div className="flex items-center gap-2 mb-2 text-sm text-purple-600">
                  <ArrowPathIcon className="h-4 w-4" />
                  <span className="font-medium">Reposted by {post.author.full_name}</span>
                </div>
                <div className="bg-white rounded-lg p-4 border border-purple-100">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-8 w-8 rounded-full gradient-primary flex-shrink-0" />
                    <div>
                      <span className="font-bold text-gray-900 text-sm">{post.original_post.author.full_name}</span>
                      <span className="text-gray-500 text-sm ml-2">@{post.original_post.author.username}</span>
                    </div>
                  </div>
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed text-base font-medium">
                    {post.original_post.content}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-900 whitespace-pre-wrap leading-relaxed text-base font-medium">
                {post.content}
              </p>
            )}
          </div>

          {/* Enhanced Actions */}
          <div className="flex items-center justify-between max-w-2xl">
            {/* Comment */}
            <button 
              onClick={handleCommentClick}
              className={`flex items-center gap-3 transition-all duration-300 hover:scale-110 group/btn ${
                showComments 
                  ? 'text-cyan-500' 
                  : 'text-gray-500 hover:text-cyan-500'
              }`}
            >
              <div className={`p-3 rounded-full transition-all duration-300 ${
                showComments 
                  ? 'bg-cyan-50 shadow-medium' 
                  : 'group-hover/btn:bg-cyan-50 group-hover/btn:shadow-medium'
              }`}>
                <ChatBubbleLeftIcon className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold">{formatNumber(post.comments_count)}</span>
            </button>

            {/* Repost */}
            <button 
              onClick={handleRepost}
              disabled={isReposting}
              className={`flex items-center gap-3 transition-all duration-300 hover:scale-110 group/btn ${
                post.is_reposted 
                  ? 'text-emerald-500' 
                  : 'text-gray-500 hover:text-emerald-500'
              } ${isReposting ? 'opacity-75' : ''}`}
            >
              <div className={`p-3 rounded-full transition-all duration-300 ${
                post.is_reposted 
                  ? 'bg-emerald-50 shadow-medium' 
                  : 'group-hover/btn:bg-emerald-50 group-hover/btn:shadow-medium'
              }`}>
                <ArrowPathIcon className={`h-5 w-5 ${isReposting ? 'animate-spin' : ''}`} />
              </div>
              <span className="text-sm font-semibold">{formatNumber(post.reposts_count)}</span>
            </button>

            {/* Like */}
            <button 
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-3 transition-all duration-300 hover:scale-110 group/btn ${
                post.is_liked 
                  ? 'text-rose-500' 
                  : 'text-gray-500 hover:text-rose-500'
              } ${isLiking ? 'opacity-75' : ''}`}
            >
              <div className={`p-3 rounded-full transition-all duration-300 ${
                post.is_liked 
                  ? 'bg-rose-50 shadow-medium' 
                  : 'group-hover/btn:bg-rose-50 group-hover/btn:shadow-medium'
              }`}>
                {post.is_liked ? (
                  <HeartSolidIcon className={`h-5 w-5 ${isLiking ? 'animate-bounce' : 'animate-pulse'}`} />
                ) : (
                  <HeartIcon className={`h-5 w-5 ${isLiking ? 'animate-pulse' : ''}`} />
                )}
              </div>
              <span className="text-sm font-semibold">{formatNumber(post.likes_count)}</span>
            </button>



            {/* Share */}
            <button className="flex items-center gap-3 text-gray-500 hover:text-indigo-500 transition-all duration-300 hover:scale-110 group/btn">
              <div className="p-3 rounded-full group-hover/btn:bg-indigo-50 transition-all duration-300 group-hover/btn:shadow-medium">
                <ShareIcon className="h-5 w-5" />
              </div>
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="space-y-4">
                {/* Comment Form */}
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10 rounded-full gradient-primary flex-shrink-0" />
                  <div className="flex-1">
                    <form onSubmit={handleCommentSubmit} className="space-y-3">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-white transition-all duration-200 text-sm resize-none text-gray-900"
                        rows={2}
                        maxLength={280}
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{newComment.length}/280</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowCommentForm(false)}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={!newComment.trim()}
                            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            Comment
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-3">
                  {/* Placeholder for comments - will be replaced with real data */}
                  <div className="text-center py-8 text-gray-500">
                    <ChatBubbleLeftIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No comments yet. Be the first to comment!</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Engagement Bar */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{formatNumber(post.likes_count + post.comments_count + post.reposts_count)} total engagements</span>
              <span>View insights</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
