const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Global search for users and companies
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @param {string} options.type - Filter by type: 'all', 'user', 'company'
 * @param {string} options.cursor - Cursor for pagination
 * @param {number} options.limit - Results per page (default: 20)
 * @returns {Promise<Object>} Search results with pagination
 */
export const search = async (query, options = {}) => {
  const { type = 'all', cursor = null, limit = 20 } = options;

  const params = new URLSearchParams({
    q: query,
    type,
    limit: limit.toString()
  });

  if (cursor) {
    params.append('cursor', cursor);
  }

  const response = await fetch(`${API_BASE}/search?${params}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || 'Search failed');
  }

  return response.json();
};

/**
 * Get search suggestions for typeahead
 * @param {string} query - Search query
 * @param {number} limit - Number of suggestions (default: 5)
 * @returns {Promise<Array>} Array of suggestions
 */
export const getSuggestions = async (query, limit = 5) => {
  if (!query || query.length < 2) {
    return [];
  }

  const params = new URLSearchParams({
    q: query,
    limit: limit.toString()
  });

  const response = await fetch(`${API_BASE}/search/suggestions?${params}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.suggestions || [];
};

/**
 * Search users only
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Search results
 */
export const searchUsers = async (query, options = {}) => {
  const { cursor = null, limit = 20 } = options;

  const params = new URLSearchParams({
    q: query,
    limit: limit.toString()
  });

  if (cursor) {
    params.append('cursor', cursor);
  }

  const response = await fetch(`${API_BASE}/search/users?${params}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || 'Search users failed');
  }

  return response.json();
};

/**
 * Search companies only
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Search results
 */
export const searchCompanies = async (query, options = {}) => {
  const { cursor = null, limit = 20 } = options;

  const params = new URLSearchParams({
    q: query,
    limit: limit.toString()
  });

  if (cursor) {
    params.append('cursor', cursor);
  }

  const response = await fetch(`${API_BASE}/search/companies?${params}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || 'Search companies failed');
  }

  return response.json();
};

/**
 * Get trending users/companies
 * @param {string} type - 'all', 'user', or 'company'
 * @param {number} limit - Number of results (default: 10)
 * @returns {Promise<Array>} Trending results
 */
export const getTrending = async (type = 'all', limit = 10) => {
  const params = new URLSearchParams({
    type,
    limit: limit.toString()
  });

  const response = await fetch(`${API_BASE}/search/trending?${params}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || 'Failed to get trending');
  }

  return response.json();
};

/**
 * Get recent searches (from localStorage)
 * @returns {Array} Array of recent search queries
 */
export const getRecentSearches = () => {
  try {
    const recent = localStorage.getItem('recentSearches');
    return recent ? JSON.parse(recent) : [];
  } catch {
    return [];
  }
};

/**
 * Add a search query to recent searches
 * @param {string} query - Search query to add
 */
export const addToRecentSearches = (query) => {
  if (!query) return;

  const recent = getRecentSearches();
  const updated = [query, ...recent.filter(q => q !== query)].slice(0, 10);
  localStorage.setItem('recentSearches', JSON.stringify(updated));
};

/**
 * Clear recent searches
 */
export const clearRecentSearches = () => {
  localStorage.removeItem('recentSearches');
};

export default {
  search,
  getSuggestions,
  searchUsers,
  searchCompanies,
  getTrending,
  getRecentSearches,
  addToRecentSearches,
  clearRecentSearches
};

