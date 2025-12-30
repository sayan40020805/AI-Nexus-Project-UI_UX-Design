/**
 * Image utility functions for consistent URL handling
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
export const DEFAULT_AVATAR = '/default-avatar.svg';

/**
 * Constructs a full image URL from a relative path
 * @param {string} imagePath - Relative path to image (e.g., '/uploads/profiles/image.jpg')
 * @returns {string} - Full image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If starts with /uploads, prepend API base URL
  if (imagePath.startsWith('/uploads/')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  
  // If it's just a filename, assume it's in the uploads directory
  if (!imagePath.includes('/')) {
    return `${API_BASE_URL}/uploads/profiles/${imagePath}`;
  }
  
  return `${API_BASE_URL}${imagePath}`;
};

/**
 * Gets the appropriate avatar URL for a user
 * @param {Object} user - User object with profilePicture/companyLogo
 * @returns {string} - Full avatar URL
 */
export const getUserAvatar = (user) => {
  if (!user) return DEFAULT_AVATAR;
  
  // For companies, use companyLogo; for users, use profilePicture
  const avatarPath = user.role === 'company' 
    ? user.companyLogo 
    : user.profilePicture;
  
  // If avatarPath is already a full URL (from backend), return it directly
  if (avatarPath && (avatarPath.startsWith('http://') || avatarPath.startsWith('https://'))) {
    return avatarPath;
  }
    
  return getImageUrl(avatarPath);
};

/**
 * Handles image loading errors with fallback to default avatar
 * @param {Object} event - Image onError event
 * @param {string} fallback - Fallback image URL (optional)
 */
export const handleImageError = (event, fallback = DEFAULT_AVATAR) => {
  console.warn('Image failed to load:', event.target.src);
  event.target.src = fallback;
  event.target.onerror = null; // Prevent infinite loop
};

/**
 * Preloads an image and returns a promise that resolves when loaded
 * @param {string} src - Image URL
 * @returns {Promise} - Promise that resolves when image loads
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};

/**
 * Validates if a URL is a valid image URL
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid image URL
 */
export const isValidImageUrl = (url) => {
  if (!url) return false;
  
  // Check if it's a valid URL format
  try {
    new URL(url.startsWith('http') ? url : `${API_BASE_URL}${url}`);
  } catch {
    return false;
  }
  
  // Check file extension
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
  const hasImageExtension = imageExtensions.some(ext => 
    url.toLowerCase().includes(ext)
  );
  
  return hasImageExtension || url.includes('/uploads/');
};

/**
 * Creates a responsive image component props
 * @param {Object} options - Configuration options
 * @returns {Object} - Props for img element
 */
export const createImageProps = (options = {}) => {
  const {
    src,
    alt,
    fallback = DEFAULT_AVATAR,
    className = '',
    onError: customOnError,
    ...otherProps
  } = options;
  
  const imageUrl = getImageUrl(src);
  
  return {
    src: imageUrl,
    alt: alt || 'Image',
    className,
    onError: (e) => {
      handleImageError(e, fallback);
      if (customOnError) customOnError(e);
    },
    ...otherProps
  };
};

export default {
  getImageUrl,
  getUserAvatar,
  handleImageError,
  preloadImage,
  isValidImageUrl,
  createImageProps
};
