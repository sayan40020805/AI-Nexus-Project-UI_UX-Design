import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * usePostInteractions Hook
 * 
 * Custom hook for managing post interactions with optimistic updates,
 * error handling, and loading states.
 */
export const usePostInteractions = () => {
  const { token } = useAuth();
  const [loadingStates, setLoadingStates] = useState({});
  const [errors, setErrors] = useState({});

  // Set loading state for an action
  const setLoading = useCallback((action, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [action]: isLoading
    }));
  }, []);

  // Set error state for an action
  const setError = useCallback((action, error) => {
    setErrors(prev => ({
      ...prev,
      [action]: error
    }));
  }, []);

  // Clear error for an action
  const clearError = useCallback((action) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[action];
      return newErrors;
    });
  }, []);

  // Generic API call helper
  const apiCall = useCallback(async (url, options = {}) => {
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${url}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || `HTTP ${response.status}`);
    }

    return response.json();
  }, [token]);

  // Like/unlike a post
  const likePost = useCallback(async (postId) => {
    const action = `like-${postId}`;
    try {
      setLoading(action, true);
      setError(action, null);

      const result = await apiCall(`/api/posts/${postId}/like`, {
        method: 'POST'
      });

      return result;
    } catch (err) {
      setError(action, err.message);
      throw err;
    } finally {
      setLoading(action, false);
    }
  }, [apiCall]);

  // Comment on a post
  const commentOnPost = useCallback(async (postId, content) => {
    const action = `comment-${postId}`;
    try {
      setLoading(action, true);
      setError(action, null);

      const result = await apiCall(`/api/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content })
      });

      return result;
    } catch (err) {
      setError(action, err.message);
      throw err;
    } finally {
      setLoading(action, false);
    }
  }, [apiCall]);

  // Share a post
  const sharePost = useCallback(async (postId) => {
    const action = `share-${postId}`;
    try {
      setLoading(action, true);
      setError(action, null);

      const result = await apiCall(`/api/posts/${postId}/share`, {
        method: 'POST'
      });

      return result;
    } catch (err) {
      setError(action, err.message);
      throw err;
    } finally {
      setLoading(action, false);
    }
  }, [apiCall]);

  // Save/unsave a post
  const savePost = useCallback(async (postId) => {
    const action = `save-${postId}`;
    try {
      setLoading(action, true);
      setError(action, null);

      const result = await apiCall(`/api/posts/${postId}/save`, {
        method: 'POST'
      });

      return result;
    } catch (err) {
      setError(action, err.message);
      throw err;
    } finally {
      setLoading(action, false);
    }
  }, [apiCall]);

  // Update a post
  const updatePost = useCallback(async (postId, updateData) => {
    const action = `update-${postId}`;
    try {
      setLoading(action, true);
      setError(action, null);

      const result = await apiCall(`/api/posts/${postId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      return result;
    } catch (err) {
      setError(action, err.message);
      throw err;
    } finally {
      setLoading(action, false);
    }
  }, [apiCall]);

  // Delete a post
  const deletePost = useCallback(async (postId) => {
    const action = `delete-${postId}`;
    try {
      setLoading(action, true);
      setError(action, null);

      const result = await apiCall(`/api/posts/${postId}`, {
        method: 'DELETE'
      });

      return result;
    } catch (err) {
      setError(action, err.message);
      throw err;
    } finally {
      setLoading(action, false);
    }
  }, [apiCall]);

  // Report a post
  const reportPost = useCallback(async (postId, reason) => {
    const action = `report-${postId}`;
    try {
      setLoading(action, true);
      setError(action, null);

      const result = await apiCall(`/api/posts/${postId}/report`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });

      return result;
    } catch (err) {
      setError(action, err.message);
      throw err;
    } finally {
      setLoading(action, false);
    }
  }, [apiCall]);

  // Get post statistics
  const getPostStats = useCallback(async (postId) => {
    const action = `stats-${postId}`;
    try {
      setLoading(action, true);
      setError(action, null);

      const result = await apiCall(`/api/posts/${postId}/stats`);

      return result;
    } catch (err) {
      setError(action, err.message);
      throw err;
    } finally {
      setLoading(action, false);
    }
  }, [apiCall]);

  // Get loading state for an action
  const isLoading = useCallback((action) => {
    return loadingStates[action] || false;
  }, [loadingStates]);

  // Get error for an action
  const getError = useCallback((action) => {
    return errors[action] || null;
  }, [errors]);

  return {
    // Actions
    likePost,
    commentOnPost,
    sharePost,
    savePost,
    updatePost,
    deletePost,
    reportPost,
    getPostStats,
    
    // State helpers
    isLoading,
    getError,
    setError,
    clearError,
    
    // Loading states
    loadingStates,
    errors
  };
};

export default usePostInteractions;

