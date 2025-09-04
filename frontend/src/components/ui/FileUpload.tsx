'use client';

import { useState, useRef } from 'react';
import { 
  PhotoIcon, 
  VideoCameraIcon, 
  XMarkIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { fileUploader, UploadProgress } from '@/lib/upload';

interface FileUploadProps {
  onUpload: (url: string, type: string) => void;
  onError: (error: string) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
  children?: React.ReactNode;
}

export default function FileUpload({ 
  onUpload, 
  onError, 
  accept = "image/*,video/*",
  maxSize = 10 * 1024 * 1024,
  className = "",
  children
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file size
    if (file.size > maxSize) {
      onError(`File too large. Maximum size: ${Math.round(maxSize / (1024 * 1024))}MB`);
      return;
    }

    // Create preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file after preview is set
    setTimeout(() => {
      uploadFile(file);
    }, 100);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(null);
    setUploadSuccess(false);

    try {
      const response = await fileUploader.uploadMedia(file, (progress) => {
        setUploadProgress(progress);
      });

      setUploadSuccess(true);
      onUpload(response.media_url!, response.media_type!);
      
      // Keep preview visible until user manually clears it or submits
      // Don't auto-clear the preview
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Upload failed');
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

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />
      
      {preview ? (
        <div className="relative">
          <div className="relative rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
            {preview.startsWith('data:image/') ? (
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-48 object-cover"
              />
            ) : (
              <video 
                src={preview} 
                className="w-full h-48 object-cover"
                controls
              />
            )}
            
            {/* Upload Status Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="text-center text-white">
                  <CloudArrowUpIcon className="h-8 w-8 mx-auto mb-2 animate-bounce" />
                  <p className="text-sm font-medium">Uploading...</p>
                  {uploadProgress && (
                    <div className="mt-3">
                      <div className="w-32 bg-white/20 rounded-full h-2 mb-1">
                        <div 
                          className="bg-white h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-white/80">{uploadProgress.percentage}%</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Success Indicator */}
            {!isUploading && uploadSuccess && (
              <div className="absolute top-2 left-2">
                <div className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-full text-xs font-medium animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  Uploaded!
                </div>
              </div>
            )}
            
            {/* Ready Indicator */}
            {!isUploading && !uploadSuccess && (
              <div className="absolute top-2 left-2">
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded-full text-xs font-medium">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  Ready
                </div>
              </div>
            )}
            
            {/* Remove Button */}
            <button
              onClick={clearPreview}
              className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
          
          {/* File Info */}
          <div className="mt-2 text-xs text-gray-500 text-center">
            {preview.startsWith('data:image/') ? '📷 Image' : '🎥 Video'} • {
              isUploading ? 'Uploading...' : 
              uploadSuccess ? 'Uploaded successfully!' : 
              'Ready to post'
            }
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
            ${isDragging 
              ? 'border-purple-500 bg-purple-50' 
              : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
            }
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          {children || (
            <div className="space-y-3">
              <div className="flex justify-center">
                <PhotoIcon className="h-12 w-12 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {isDragging ? 'Drop your file here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Images and videos up to {Math.round(maxSize / (1024 * 1024))}MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

