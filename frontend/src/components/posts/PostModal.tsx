'use client';

import { useState } from 'react';
import { Avatar } from '@radix-ui/react-avatar';
import { 
  PhotoIcon, 
  FaceSmileIcon, 
  MapPinIcon, 
  CalendarIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/contexts/PostsContext';
import FileUpload from '@/components/ui/FileUpload';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PostModal({ isOpen, onClose }: PostModalProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { createPost, isLoading } = usePosts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !mediaUrl) return;
    
    setError(null);
    const result = await createPost({ 
      content: content.trim(),
      media_url: mediaUrl || undefined,
      media_type: mediaType || undefined
    });
    
    if (result.success) {
      setContent('');
      setMediaUrl(null);
      setMediaType(null);
      onClose();
    } else {
      setError(result.error || 'Failed to create post');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  const getCharacterColor = () => {
    if (content.length > 260) return 'text-red-500';
    if (content.length > 240) return 'text-yellow-500';
    return 'text-gray-400';
  };

  const handleMediaUpload = (url: string, type: string) => {
    setMediaUrl(url);
    setMediaType(type);
  };

  const handleMediaError = (error: string) => {
    setError(error);
  };

  const clearMedia = () => {
    setMediaUrl(null);
    setMediaType(null);
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Create Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <Avatar className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex-shrink-0 shadow-medium flex items-center justify-center text-white font-semibold">
                {user.full_name.charAt(0).toUpperCase()}
              </Avatar>
              <div className="flex-1">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What's on your mind?"
                  className="w-full resize-none border-none outline-none text-lg placeholder-gray-400 bg-transparent leading-relaxed text-gray-900"
                  rows={4}
                  maxLength={280}
                  autoFocus
                />
              </div>
            </div>
            
            {/* Media Upload */}
            <div className="pt-4">
              <FileUpload
                onUpload={handleMediaUpload}
                onError={handleMediaError}
                className="mb-4"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-4">
              <button
                type="button"
                className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-full transition-all duration-200 hover:scale-110"
              >
                <FaceSmileIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="p-2 text-purple-500 hover:bg-purple-50 rounded-full transition-all duration-200 hover:scale-110"
              >
                <MapPinIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="p-2 text-amber-500 hover:bg-amber-50 rounded-full transition-all duration-200 hover:scale-110"
              >
                <CalendarIcon className="h-5 w-5" />
              </button>
            </div>
            
            {/* Bottom section */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <SparklesIcon className="h-3 w-3" />
                  <span>Everyone can reply</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    content.length > 260 
                      ? 'bg-red-100 text-red-600' 
                      : content.length > 240 
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {280 - content.length}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={(!content.trim() && !mediaUrl) || content.length > 280 || isLoading}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold hover:shadow-medium hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <SparklesIcon className="h-4 w-4" />
                  )}
                  {isLoading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
