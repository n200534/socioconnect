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

interface ProfilePictureUploadProps {
  onUpload?: (url: string) => void;
  onError?: (error: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
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
    xl: 'h-40 w-40'
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

  const getAvatarContent = () => {
    if (preview) {
      return <img src={preview} alt="Preview" className="w-full h-full object-cover" />;
    }
    
    if (user?.avatar_url) {
      return <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />;
    }
    
    return (
      <div className="w-full h-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
        <UserIcon className="h-8 w-8 text-white" />
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
        <Avatar className={`${sizeClasses[size]} rounded-full overflow-hidden shadow-medium cursor-pointer transition-all duration-200 group-hover:shadow-large`}>
          {getAvatarContent()}
        </Avatar>
        
        {/* Upload overlay */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`
            absolute inset-0 rounded-full bg-black/50 flex items-center justify-center
            opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer
            ${isUploading ? 'opacity-100' : ''}
          `}
        >
          {isUploading ? (
            <div className="text-center text-white">
              <CloudArrowUpIcon className="h-6 w-6 mx-auto mb-1 animate-bounce" />
              {uploadProgress && (
                <div className="w-16 bg-white/20 rounded-full h-1">
                  <div 
                    className="bg-white h-1 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.percentage}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <CameraIcon className="h-6 w-6 text-white" />
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
