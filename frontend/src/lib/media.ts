/**
 * Media URL utilities
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Get the full URL for a media file
 */
export function getMediaUrl(mediaUrl: string | null | undefined): string | null {
  if (!mediaUrl) return null;
  
  // If it's already a full URL, return as-is
  if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
    return mediaUrl;
  }
  
  // If it's a relative URL, prepend the API base URL
  if (mediaUrl.startsWith('/')) {
    const fullUrl = `${API_BASE_URL}${mediaUrl}`;
    console.log('Media URL constructed:', { original: mediaUrl, full: fullUrl });
    return fullUrl;
  }
  
  // If it's just a filename, construct the full path
  const fullUrl = `${API_BASE_URL}/api/v1/uploads/media/${mediaUrl}`;
  console.log('Media URL constructed:', { original: mediaUrl, full: fullUrl });
  return fullUrl;
}

/**
 * Get the full URL for a profile picture
 */
export function getProfilePictureUrl(avatarUrl: string | null | undefined): string | null {
  if (!avatarUrl) return null;
  
  // If it's already a full URL, return as-is
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }
  
  // If it's a relative URL, prepend the API base URL
  if (avatarUrl.startsWith('/')) {
    return `${API_BASE_URL}${avatarUrl}`;
  }
  
  // If it's just a filename, construct the full path
  return `${API_BASE_URL}/api/v1/uploads/profile-pictures/${avatarUrl}`;
}
