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
  BookmarkIcon,
  EyeIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolidIcon,
  BookmarkIcon as BookmarkSolidIcon
} from '@heroicons/react/24/solid';
import { usePosts } from '@/contexts/PostsContext';
import { Post } from '@/lib/api';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const { likePost, repost } = usePosts();

  const handleLike = async () => {
    await likePost(post.id);
  };

  const handleRepost = async () => {
    await repost(post.id);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const formatNumber = (num: number) => {
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
              className="text-gray-500 hover:text-purple-600 transition-colors font-medium"
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
            <p className="text-gray-900 whitespace-pre-wrap leading-relaxed text-base font-medium">
              {post.content}
            </p>
          </div>

          {/* Enhanced Actions */}
          <div className="flex items-center justify-between max-w-2xl">
            {/* Comment */}
            <button className="flex items-center gap-3 text-gray-500 hover:text-cyan-500 transition-all duration-300 hover:scale-110 group/btn">
              <div className="p-3 rounded-full group-hover/btn:bg-cyan-50 transition-all duration-300 group-hover/btn:shadow-medium">
                <ChatBubbleLeftIcon className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold">{formatNumber(post.comments)}</span>
            </button>

            {/* Repost */}
            <button 
              onClick={handleRepost}
              className={`flex items-center gap-3 transition-all duration-300 hover:scale-110 group/btn ${
                isReposted 
                  ? 'text-emerald-500' 
                  : 'text-gray-500 hover:text-emerald-500'
              }`}
            >
              <div className={`p-3 rounded-full transition-all duration-300 ${
                isReposted 
                  ? 'bg-emerald-50 shadow-medium' 
                  : 'group-hover/btn:bg-emerald-50 group-hover/btn:shadow-medium'
              }`}>
                <ArrowPathIcon className={`h-5 w-5 ${isReposted ? 'animate-spin' : ''}`} />
              </div>
              <span className="text-sm font-semibold">{formatNumber(post.reposts)}</span>
            </button>

            {/* Like */}
            <button 
              onClick={handleLike}
              className={`flex items-center gap-3 transition-all duration-300 hover:scale-110 group/btn ${
                post.is_liked 
                  ? 'text-rose-500' 
                  : 'text-gray-500 hover:text-rose-500'
              }`}
            >
              <div className={`p-3 rounded-full transition-all duration-300 ${
                post.is_liked 
                  ? 'bg-rose-50 shadow-medium' 
                  : 'group-hover/btn:bg-rose-50 group-hover/btn:shadow-medium'
              }`}>
                {post.is_liked ? (
                  <HeartSolidIcon className="h-5 w-5 animate-pulse" />
                ) : (
                  <HeartIcon className="h-5 w-5" />
                )}
              </div>
              <span className="text-sm font-semibold">{formatNumber(post.likes_count)}</span>
            </button>

            {/* Bookmark */}
            <button 
              onClick={handleBookmark}
              className={`flex items-center gap-3 transition-all duration-300 hover:scale-110 group/btn ${
                isBookmarked 
                  ? 'text-amber-500' 
                  : 'text-gray-500 hover:text-amber-500'
              }`}
            >
              <div className={`p-3 rounded-full transition-all duration-300 ${
                isBookmarked 
                  ? 'bg-amber-50 shadow-medium' 
                  : 'group-hover/btn:bg-amber-50 group-hover/btn:shadow-medium'
              }`}>
                {isBookmarked ? (
                  <BookmarkSolidIcon className="h-5 w-5" />
                ) : (
                  <BookmarkIcon className="h-5 w-5" />
                )}
              </div>
            </button>

            {/* Share */}
            <button className="flex items-center gap-3 text-gray-500 hover:text-indigo-500 transition-all duration-300 hover:scale-110 group/btn">
              <div className="p-3 rounded-full group-hover/btn:bg-indigo-50 transition-all duration-300 group-hover/btn:shadow-medium">
                <ShareIcon className="h-5 w-5" />
              </div>
            </button>
          </div>

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
