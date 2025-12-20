/**
 * Post Utilities
 * 
 * Helper functions for post-related operations
 */

// Format post timestamp for display
export const formatPostTimestamp = (timestamp) => {
  const now = new Date();
  const postTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now - postTime) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
  
  return postTime.toLocaleDateString();
};

// Format comment timestamp for display
export const formatCommentTimestamp = (timestamp) => {
  const now = new Date();
  const commentTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now - commentTime) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
  
  return commentTime.toLocaleDateString();
};

// Format count display (e.g., 1.2k, 1.5M)
export const formatCount = (count) => {
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
  return `${(count / 1000000).toFixed(1)}M`;
};

// Check if user can perform action on post
export const canUserEditPost = (post, user) => {
  return user && post && post.author && post.author._id === user._id;
};

export const canUserDeletePost = (post, user) => {
  return user && post && post.author && post.author._id === user._id;
};

export const canUserModeratePost = (post, user) => {
  return user && (user.role === 'company' || user.role === 'admin');
};

export const canUserReportPost = (post, user) => {
  return user && post && post.author && post.author._id !== user._id;
};

// Get post type configuration
export const getPostTypeConfig = (postType) => {
  const configs = {
    'normal': { 
      label: 'Post', 
      icon: 'FileText', 
      color: '#6366f1',
      page: 'home'
    },
    'news': { 
      label: 'AI News', 
      icon: 'Newspaper', 
      color: '#ef4444',
      page: 'news'
    },
    'shorts': { 
      label: 'AI Short', 
      icon: 'Zap', 
      color: '#f59e0b',
      page: 'shorts'
    },
    'model': { 
      label: 'AI Model', 
      icon: 'Lightbulb', 
      color: '#10b981',
      page: 'models'
    },
    'showcase': { 
      label: 'Showcase', 
      icon: 'Users', 
      color: '#8b5cf6',
      page: 'showcase'
    },
    'career': { 
      label: 'Career', 
      icon: 'Briefcase', 
      color: '#06b6d4',
      page: 'career'
    },
    'event': { 
      label: 'Event', 
      icon: 'Calendar', 
      color: '#ec4899',
      page: 'events'
    }
  };
  
  return configs[postType] || configs.normal;
};

// Generate post URL
export const generatePostUrl = (postId) => {
  return `${window.location.origin}/post/${postId}`;
};

// Copy post link to clipboard
export const copyPostLink = async (postId) => {
  try {
    const url = generatePostUrl(postId);
    await navigator.clipboard.writeText(url);
    return true;
  } catch (err) {
    console.error('Failed to copy post link:', err);
    return false;
  }
};

// Validate post content
export const validatePostContent = (content, limits = {}) => {
  const errors = [];
  
  const CONTENT_LIMIT = limits.content || 2000;
  const TITLE_LIMIT = limits.title || 100;
  const TAGS_LIMIT = limits.tags || 10;
  
  if (!content.content || content.content.trim().length === 0) {
    errors.push('Content is required');
  }
  
  if (content.content && content.content.length > CONTENT_LIMIT) {
    errors.push(`Content must be less than ${CONTENT_LIMIT} characters`);
  }
  
  if (content.title && content.title.length > TITLE_LIMIT) {
    errors.push(`Title must be less than ${TITLE_LIMIT} characters`);
  }
  
  if (content.tags && content.tags.length > TAGS_LIMIT) {
    errors.push(`Maximum ${TAGS_LIMIT} tags allowed`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sanitize post content
export const sanitizePostContent = (content) => {
  if (!content) return '';
  
  // Simple HTML sanitization (in production, use a proper library like DOMPurify)
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '');
};

// Process media files for upload
export const processMediaFiles = (files) => {
  const media = {
    images: [],
    video: null,
    document: null
  };
  
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
  const allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  
  for (const file of files) {
    if (file.size > maxFileSize) {
      throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
    }
    
    if (allowedImageTypes.includes(file.type)) {
      media.images.push(file);
    } else if (allowedVideoTypes.includes(file.type) && !media.video) {
      media.video = file;
    } else if (allowedDocumentTypes.includes(file.type) && !media.document) {
      media.document = file;
    } else {
      throw new Error(`Unsupported file type: ${file.type}`);
    }
  }
  
  return media;
};

// Generate post excerpt
export const generatePostExcerpt = (content, maxLength = 150) => {
  if (!content) return '';
  
  // Remove HTML tags
  const cleanContent = content.replace(/<[^>]*>/g, '');
  
  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }
  
  // Find the last complete word within the limit
  const truncated = cleanContent.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  return lastSpaceIndex > 0 
    ? truncated.substring(0, lastSpaceIndex) + '...'
    : truncated + '...';
};

// Check if post is expired
export const isPostExpired = (post) => {
  if (!post.eventDate) return false;
  
  const now = new Date();
  const eventDate = new Date(post.eventDate);
  
  return eventDate < now;
};

// Get time until post event
export const getTimeUntilEvent = (eventDate) => {
  const now = new Date();
  const event = new Date(eventDate);
  const diffInMs = event - now;
  
  if (diffInMs <= 0) return null;
  
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

// Sort posts by engagement
export const sortPostsByEngagement = (posts) => {
  return [...posts].sort((a, b) => {
    const aEngagement = (a.likes?.length || 0) + (a.comments?.length || 0) + (a.shares?.length || 0);
    const bEngagement = (b.likes?.length || 0) + (b.comments?.length || 0) + (b.shares?.length || 0);
    
    return bEngagement - aEngagement;
  });
};

// Filter posts by type
export const filterPostsByType = (posts, postType) => {
  if (!postType) return posts;
  
  return posts.filter(post => post.postType === postType);
};

// Search posts by content
export const searchPosts = (posts, searchTerm) => {
  if (!searchTerm || searchTerm.trim().length === 0) return posts;
  
  const term = searchTerm.toLowerCase().trim();
  
  return posts.filter(post => {
    const contentMatch = post.content?.toLowerCase().includes(term);
    const titleMatch = post.title?.toLowerCase().includes(term);
    const authorMatch = post.author?.username?.toLowerCase().includes(term) ||
                       post.author?.companyName?.toLowerCase().includes(term);
    const tagsMatch = post.tags?.some(tag => tag.toLowerCase().includes(term));
    
    return contentMatch || titleMatch || authorMatch || tagsMatch;
  });
};

// Check if user has interacted with post
export const hasUserLikedPost = (post, userId) => {
  return post.likes?.some(like => like.user === userId) || false;
};

export const hasUserSharedPost = (post, userId) => {
  return post.shares?.some(share => share.user === userId) || false;
};

export const hasUserCommentedOnPost = (post, userId) => {
  return post.comments?.some(comment => comment.user === userId) || false;
};

// Calculate post engagement rate
export const calculateEngagementRate = (post, totalFollowers = 0) => {
  const totalEngagements = (post.likes?.length || 0) + (post.comments?.length || 0) + (post.shares?.length || 0);
  
  if (totalFollowers === 0) return 0;
  
  return ((totalEngagements / totalFollowers) * 100).toFixed(2);
};

// Generate post share text
export const generateShareText = (post) => {
  const authorName = post.author?.username || post.author?.companyName || 'Someone';
  const postType = getPostTypeConfig(post.postType).label;
  const excerpt = generatePostExcerpt(post.content, 100);
  
  return `Check out this ${postType} by ${authorName}: ${excerpt}`;
};

