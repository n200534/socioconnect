'use client';

import { useState } from 'react';
import { Avatar } from '@radix-ui/react-avatar';
import { 
  PhotoIcon, 
  FaceSmileIcon, 
  MapPinIcon, 
  CalendarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/contexts/PostsContext';

export default function PostComposer() {
  const [content, setContent] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { createPost, isLoading } = usePosts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setError(null);
    const result = await createPost({ content: content.trim() });
    
    if (result.success) {
      setContent('');
      setIsComposing(false);
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

  if (!user) return null;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/50 p-6">
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
              onFocus={() => setIsComposing(true)}
              onKeyDown={handleKeyDown}
              placeholder="What's on your mind?"
              className="w-full resize-none border-none outline-none text-lg placeholder-gray-400 bg-transparent leading-relaxed text-gray-900"
              rows={isComposing ? 4 : 2}
              maxLength={280}
            />
            
            {isComposing && (
              <div className="mt-4 space-y-4">
                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-2 text-cyan-500 hover:bg-cyan-50 rounded-full transition-all duration-200 hover:scale-110"
                  >
                    <PhotoIcon className="h-5 w-5" />
                  </button>
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
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
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
                      disabled={!content.trim() || content.length > 280}
                      className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold hover:shadow-medium hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 flex items-center gap-2"
                    >
                      <SparklesIcon className="h-4 w-4" />
                      Post
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
