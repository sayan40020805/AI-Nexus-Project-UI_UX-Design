/**
 * Error handling utilities
 * Provides consistent error handling and user-friendly error messages
 */

/**
 * Parse network error and return user-friendly message
 * @param {Error} error - Error object
 * @returns {string} - User-friendly error message
 */
export const parseNetworkError = (error) => {
  if (!error) return 'An unexpected error occurred';

  // Network/fetch errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return 'Network error. Please check your internet connection and try again.';
  }

  // Timeout errors
  if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  // Aborted requests
  if (error.name === 'AbortError') {
    return 'Request was cancelled. Please try again.';
  }

  // Default error message
  return error.message || 'An unexpected error occurred. Please try again.';
};

/**
 * Parse HTTP response error and return user-friendly message
 * @param {Response} response - Fetch response object
 * @param {Object} data - Response data
 * @returns {string} - User-friendly error message
 */
export const parseHttpError = (response, data) => {
  // Handle different HTTP status codes
  switch (response.status) {
    case 400:
      return data?.msg || data?.message || 'Invalid request. Please check your input.';
    
    case 401:
      return 'Authentication failed. Please log in again.';
    
    case 403:
      return 'Access denied. You do not have permission to perform this action.';
    
    case 404:
      return 'The requested resource was not found.';
    
    case 409:
      return data?.msg || data?.message || 'A conflict occurred. The resource may already exist.';
    
    case 422:
      return data?.msg || data?.message || 'Validation error. Please check your input.';
    
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    
    case 500:
      return 'Server error. Please try again later.';
    
    case 502:
    case 503:
    case 504:
      return 'Service temporarily unavailable. Please try again later.';
    
    default:
      return data?.msg || data?.message || `Request failed with status ${response.status}`;
  }
};

/**
 * Generic error handler for API calls
 * @param {Error} error - Error object
 * @param {Response} response - Optional fetch response
 * @returns {Object} - Standardized error object
 */
export const handleApiError = (error, response = null) => {
  const timestamp = new Date().toISOString();
  
  // Log error for debugging
  console.error('API Error:', {
    message: error.message,
    stack: error.stack,
    response: response ? {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    } : null,
    timestamp
  });

  // Handle HTTP response errors
  if (response && !response.ok) {
    return {
      success: false,
      error: parseHttpError(response, null),
      status: response.status,
      timestamp
    };
  }

  // Handle network and other errors
  return {
    success: false,
    error: parseNetworkError(error),
    timestamp
  };
};

/**
 * Create a retry wrapper for failed API calls
 * @param {Function} apiCall - API function to call
 * @param {Object} options - Retry options
 * @returns {Promise} - Promise that resolves with result or rejects with last error
 */
export const withRetry = async (apiCall, options = {}) => {
  const {
    maxRetries = 3,
    delay = 1000,
    backoffMultiplier = 2,
    retryCondition = (error) => true
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Check if error is retryable
      if (!retryCondition(error)) {
        break;
      }

      // Wait before retrying with exponential backoff
      const waitTime = delay * Math.pow(backoffMultiplier, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
};

/**
 * Create a debounced function to prevent rapid API calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

/**
 * Create a throttled function to limit API call frequency
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, limit = 1000) => {
  let inThrottle;
  
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Validate response data structure
 * @param {Object} data - Response data
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} - Validation result
 */
export const validateResponse = (data, requiredFields = []) => {
  const errors = [];
  
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: ['Invalid response data format']
    };
  }

  for (const field of requiredFields) {
    if (!(field in data) || data[field] === null || data[field] === undefined) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Format validation errors for display
 * @param {Object} errors - Validation errors object
 * @returns {string} - Formatted error message
 */
export const formatValidationErrors = (errors) => {
  if (!errors || typeof errors !== 'object') {
    return 'Validation failed';
  }

  const errorMessages = Object.values(errors).filter(Boolean);
  
  if (errorMessages.length === 0) {
    return 'Validation failed';
  }

  if (errorMessages.length === 1) {
    return errorMessages[0];
  }

  return `Multiple errors: ${errorMessages.join(', ')}`;
};

/**
 * Create a loading state manager
 * @param {string} key - Loading state key
 * @returns {Object} - Loading state manager
 */
export const createLoadingState = (key = 'default') => {
  const loadingStates = new Map();

  return {
    setLoading: (isLoading) => {
      loadingStates.set(key, isLoading);
    },
    isLoading: () => loadingStates.get(key) || false,
    start: () => loadingStates.set(key, true),
    stop: () => loadingStates.set(key, false),
    reset: () => loadingStates.delete(key)
  };
};

/**
 * Create a request cache to prevent duplicate API calls
 * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
 * @returns {Object} - Cache manager
 */
export const createRequestCache = (ttl = 5 * 60 * 1000) => {
  const cache = new Map();

  return {
    get: (key) => {
      const item = cache.get(key);
      
      if (!item) return null;
      
      // Check if cache is expired
      if (Date.now() - item.timestamp > ttl) {
        cache.delete(key);
        return null;
      }
      
      return item.data;
    },
    set: (key, data) => {
      cache.set(key, {
        data,
        timestamp: Date.now()
      });
    },
    clear: () => cache.clear(),
    has: (key) => cache.has(key)
  };
};
