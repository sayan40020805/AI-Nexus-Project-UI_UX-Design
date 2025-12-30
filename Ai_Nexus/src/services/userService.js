const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile data
 */
export const getProfile = async (userId) => {
  const response = await fetch(`${API_BASE}/users/${userId}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || 'Failed to get profile');
  }

  return response.json();
};

/**
 * Get user's posts with pagination
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {string} options.cursor - Cursor for pagination
 * @param {number} options.limit - Posts per page (default: 20)
 * @param {string} options.tab - Tab type: 'posts', 'media', 'likes', 'activity'
 * @param {string} options.mediaType - Media type filter: 'all', 'images', 'videos'
 * @returns {Promise<Object>} Posts with pagination
 */
export const getUserPosts = async (userId, options = {}) => {
  const { cursor = null, limit = 20, tab = 'posts', mediaType = 'all' } = options;

  const params = new URLSearchParams({
    limit: limit.toString(),
    tab,
    mediaType
  });

  if (cursor) {
    params.append('cursor', cursor);
  }

  const response = await fetch(`${API_BASE}/users/${userId}/posts?${params}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || 'Failed to get posts');
  }

  return response.json();
};

/**
 * Get user's media posts only
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Posts with pagination
 */
export const getUserMedia = async (userId, options = {}) => {
  const { cursor = null, limit = 20, type = 'all' } = options;

  const params = new URLSearchParams({
    limit: limit.toString(),
    type
  });

  if (cursor) {
    params.append('cursor', cursor);
  }

  const response = await fetch(`${API_BASE}/users/${userId}/media?${params}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || 'Failed to get media');
  }

  return response.json();
};

/**
 * Get posts user has liked
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Posts with pagination
 */
export const getUserLikes = async (userId, options = {}) => {
  const { cursor = null, limit = 20 } = options;

  const params = new URLSearchParams({
    limit: limit.toString()
  });

  if (cursor) {
    params.append('cursor', cursor);
  }

  const response = await fetch(`${API_BASE}/users/${userId}/likes?${params}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || 'Failed to get likes');
  }

  return response.json();
};

/**
 * Get user's followers
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Followers list with pagination
 */
export const getFollowers = async (userId, options = {}) => {
  const { page = 1, limit = 20 } = options;

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });

  const response = await fetch(`${API_BASE}/users/${userId}/followers?${params}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || 'Failed to get followers');
  }

  return response.json();
};

/**
 * Get users that this user is following
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Following list with pagination
 */
export const getFollowing = async (userId, options = {}) => {
  const { page = 1, limit = 20 } = options;

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });

  const response = await fetch(`${API_BASE}/users/${userId}/following?${params}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || 'Failed to get following');
  }

  return response.json();
};

/**
 * Follow a user
 * @param {string} userId - User ID to follow
 * @returns {Promise<Object>} Follow result
 */
export const followUser = async (userId) => {
  const response = await fetch(`${API_BASE}/follow/${userId}`, {
    method: 'POST',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || 'Failed to follow user');
  }

  return response.json();
};

/**
 * Unfollow a user
 * @param {string} userId - User ID to unfollow
 * @returns {Promise<Object>} Unfollow result
 */
export const unfollowUser = async (userId) => {
  const response = await fetch(`${API_BASE}/follow/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || 'Failed to unfollow user');
  }

  return response.json();
};

/**
 * Check if current user is following a user
 * @param {string} userId - User ID to check
 * @returns {Promise<Object>} Follow status
 */
export const checkFollowStatus = async (userId) => {
  const response = await fetch(`${API_BASE}/follow/status/${userId}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || 'Failed to check follow status');
  }

  return response.json();
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} data - Profile data to update
 * @returns {Promise<Object>} Updated profile
 */
export const updateProfile = async (userId, data) => {
  const response = await fetch(`${API_BASE}/user/profile/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || 'Failed to update profile');
  }

  return response.json();
};

/**
 * Upload profile picture
 * @param {File} file - Image file
 * @returns {Promise<Object>} Upload result with file path
 */
export const uploadProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append('profilePicture', file);

  const token = localStorage.getItem('token') || localStorage.getItem('authToken');

  const response = await fetch(`${API_BASE}/user/upload/profile-picture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || 'Failed to upload profile picture');
  }

  return response.json();
};

/**
 * Upload cover photo
 * @param {File} file - Image file
 * @returns {Promise<Object>} Upload result with file path
 */
export const uploadCoverPhoto = async (file) => {
  const formData = new FormData();
  formData.append('coverPhoto', file);

  const token = localStorage.getItem('token') || localStorage.getItem('authToken');

  const response = await fetch(`${API_BASE}/user/upload/cover-photo`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || 'Failed to upload cover photo');
  }

  return response.json();
};

export default {
  getProfile,
  getUserPosts,
  getUserMedia,
  getUserLikes,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
  checkFollowStatus,
  updateProfile,
  uploadProfilePicture,
  uploadCoverPhoto
};

