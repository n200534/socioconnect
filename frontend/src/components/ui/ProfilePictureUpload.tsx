'use client';

import { useState, useRef } from 'react';
import { Avatar } from '@radix-ui/react-avatar';
import { 
  CameraIcon, 
  XMarkIcon,
  CloudArrowUpIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { fileUploader, UploadProgress } from '@/lib/upload';
import { useAuth } from '@/contexts/AuthContext';
import { getProfilePictureUrl } from '@/lib/media';

interface ProfilePictureUploadProps {
  onUpload?: (url: string) => void;
  onError?: (error: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export default function ProfilePictureUpload({ 
  onUpload, 
  onError,
  size = 'md',
  className = ""
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, refreshUser } = useAuth();

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
    xl: 'h-40 w-40',
    '2xl': 'h-48 w-48'
  };

  const handleFileSelect = (file: File) => {
    // Validate file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      onError?.('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
      return;
    }

    if (file.size > maxSize) {
      onError?.('File too large. Maximum size is 10MB.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(null);

    try {
      const response = await fileUploader.uploadProfilePicture(file, (progress) => {
        setUploadProgress(progress);
      });

      // Update user context
      await refreshUser();
      
      onUpload?.(response.avatar_url!);
      setPreview(null);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Upload failed');
      setPreview(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!user?.avatar_url) return;
    
    try {
      await fileUploader.deleteProfilePicture();
      await refreshUser();
      onUpload?.('');
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to delete profile picture');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarContent = () => {
    if (preview) {
      return (
        <div className="relative w-full h-full">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <CloudArrowUpIcon className="h-6 w-6 mx-auto mb-1 animate-bounce" />
                {uploadProgress && (
                  <div className="w-12 bg-white/20 rounded-full h-1">
                    <div 
                      className="bg-white h-1 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.percentage}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          {!isUploading && (
            <div className="absolute top-1 left-1">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      );
    }
    
    if (user?.avatar_url) {
      return (
        <img 
          src={getProfilePictureUrl(user.avatar_url) || ''} 
          alt={user.full_name || user.username} 
          className="w-full h-full object-cover"
          onError={(e) => {
            // If image fails to load, show initials instead
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              // Create a new div with the default avatar content
              const defaultAvatar = document.createElement('div');
              defaultAvatar.className = 'w-full h-full rounded-full flex items-center justify-center text-white font-bold text-lg';
              
              // Use the same color selection logic as getDefaultAvatarContent
              const colors = [
                { from: '#3B82F6', to: '#1E40AF' },
                { from: '#8B5CF6', to: '#6D28D9' },
                { from: '#EC4899', to: '#BE185D' },
                { from: '#10B981', to: '#047857' },
                { from: '#F59E0B', to: '#B45309' },
                { from: '#EF4444', to: '#B91C1C' },
                { from: '#6366F1', to: '#4338CA' },
                { from: '#14B8A6', to: '#0F766E' },
                { from: '#F97316', to: '#C2410C' },
                { from: '#84CC16', to: '#65A30D' }
              ];
              const displayName = user?.full_name || user?.username || 'User';
              const colorIndex = displayName.length % colors.length;
              const selectedColor = colors[colorIndex];
              
              defaultAvatar.style.background = `linear-gradient(135deg, ${selectedColor.from}, ${selectedColor.to})`;
              defaultAvatar.textContent = displayName.charAt(0).toUpperCase();
              parent.appendChild(defaultAvatar);
            }
          }}
        />
      );
    }
    
    return getDefaultAvatarContent();
  };

  const getDefaultAvatarContent = () => {
    const displayName = user?.full_name || user?.username || 'User';
    const initials = getInitials(displayName);
    
    // Generate a consistent color based on the user's name
    const colors = [
      { from: '#3B82F6', to: '#1E40AF' }, // blue - more vibrant
      { from: '#8B5CF6', to: '#6D28D9' }, // purple - more vibrant
      { from: '#EC4899', to: '#BE185D' }, // pink - more vibrant
      { from: '#10B981', to: '#047857' }, // green - more vibrant
      { from: '#F59E0B', to: '#B45309' }, // orange - more vibrant
      { from: '#EF4444', to: '#B91C1C' }, // red - more vibrant
      { from: '#6366F1', to: '#4338CA' }, // indigo - more vibrant
      { from: '#14B8A6', to: '#0F766E' }, // teal - more vibrant
      { from: '#F97316', to: '#C2410C' }, // amber - new color
      { from: '#84CC16', to: '#65A30D' }  // lime - new color
    ];
    
    const colorIndex = displayName.length % colors.length;
    const selectedColor = colors[colorIndex];
    
    return (
      <div 
        className="absolute inset-0 w-full h-full flex items-center justify-center rounded-full border-2 border-white/20"
        style={{ 
          background: `linear-gradient(135deg, ${selectedColor.from}, ${selectedColor.to})`,
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <span 
          className={`text-white font-bold select-none ${size === '2xl' ? 'text-2xl' : size === 'xl' ? 'text-xl' : size === 'lg' ? 'text-lg' : 'text-sm'}`}
          style={{
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.4), 0 0 8px rgba(255, 255, 255, 0.1)',
            letterSpacing: '0.1em',
            lineHeight: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            fontWeight: '700'
          }}
        >
          {initials}
        </span>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
      
      <div className="relative group">
        <Avatar 
          className={`${sizeClasses[size]} rounded-full overflow-hidden shadow-medium cursor-pointer transition-all duration-200 group-hover:shadow-large`}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          {getAvatarContent()}
        </Avatar>
        
        {/* Upload overlay */}
        <div
          className={`
            absolute inset-0 rounded-full bg-black/50 flex items-center justify-center
            opacity-0 group-hover:opacity-100 transition-opacity duration-200
            ${isUploading ? 'opacity-100' : ''}
          `}
        >
          {isUploading ? (
            <div className="text-center text-white">
              <CloudArrowUpIcon className="h-6 w-6 mx-auto mb-1 animate-bounce" />
              <p className="text-xs">Uploading...</p>
              {uploadProgress && (
                <div className="w-16 bg-white/20 rounded-full h-1 mt-1">
                  <div 
                    className="bg-white h-1 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.percentage}%` }}
                  />
                </div>
              )}
            </div>
          ) : preview ? (
            <div className="text-center text-white">
              <div className="w-6 h-6 mx-auto mb-1 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <p className="text-xs">Ready</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <CameraIcon className={`text-white ${size === '2xl' ? 'h-6 w-6' : size === 'xl' ? 'h-5 w-5' : 'h-4 w-4'}`} />
              </button>
              {user?.avatar_url && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProfilePicture();
                  }}
                  className="p-1 bg-red-500/80 rounded-full hover:bg-red-500 transition-colors"
                  title="Delete profile picture"
                >
                  <XMarkIcon className="h-3 w-3 text-white" />
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Clear preview button */}
        {preview && !isUploading && (
          <button
            onClick={clearPreview}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-medium"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
