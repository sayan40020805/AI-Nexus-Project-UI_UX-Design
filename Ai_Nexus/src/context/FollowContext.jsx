import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

const FollowContext = createContext();

/**
 * FollowProvider - Global follow state management
 * Manages follow/unfollow operations and provides optimistic updates
 */
export const FollowProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [followingMap, setFollowingMap] = useState(new Map());
  const [followLoading, setFollowLoading] = useState(new Map());
  const [followStats, setFollowStats] = useState(new Map());

  // API base URL
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  /**
   * Check follow status for a specific user
   */
  const checkFollowStatus = useCallback(async (targetId) => {
    if (!token || !targetId) return { isFollowing: false };

    try {
      const response = await fetch(`${API_BASE}/api/follow/status/${targetId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }

    return { isFollowing: false };
  }, [token]);

  /**
   * Follow a user or company
   */
  const followUser = useCallback(async (targetId) => {
    if (!token || !targetId) return { success: false, error: 'Invalid parameters' };

    // Optimistic update - mark as following immediately
    const previousFollowing = followingMap.get(targetId);
    const previousLoading = followLoading.get(targetId);

    setFollowingMap(prev => new Map(prev).set(targetId, true));
    setFollowLoading(prev => new Map(prev).set(targetId, true));

    try {
      const response = await fetch(`${API_BASE}/api/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ followingId: targetId })
      });

      const data = await response.json();

      if (response.ok) {
        // Success - keep optimistic update
        return { success: true, data };
      } else {
        // Error - rollback optimistic update
        setFollowingMap(prev => {
          const newMap = new Map(prev);
          if (previousFollowing !== undefined) {
            newMap.set(targetId, previousFollowing);
          } else {
            newMap.delete(targetId);
          }
          return newMap;
        });
        setFollowLoading(prev => {
          const newMap = new Map(prev);
          newMap.delete(targetId);
          return newMap;
        });

        return { success: false, error: data.msg || 'Failed to follow user' };
      }
    } catch (error) {
      console.error('Error following user:', error);
      
      // Rollback on network error
      setFollowingMap(prev => {
        const newMap = new Map(prev);
        if (previousFollowing !== undefined) {
          newMap.set(targetId, previousFollowing);
        } else {
          newMap.delete(targetId);
        }
        return newMap;
      });
      setFollowLoading(prev => {
        const newMap = new Map(prev);
        newMap.delete(targetId);
        return newMap;
      });

      return { success: false, error: 'Network error occurred' };
    }
  }, [token, followingMap, followLoading]);

  /**
   * Unfollow a user or company
   */
  const unfollowUser = useCallback(async (targetId) => {
    if (!token || !targetId) return { success: false, error: 'Invalid parameters' };

    // Optimistic update - mark as not following immediately
    const previousFollowing = followingMap.get(targetId);
    const previousLoading = followLoading.get(targetId);

    setFollowingMap(prev => new Map(prev).set(targetId, false));
    setFollowLoading(prev => new Map(prev).set(targetId, true));

    try {
      const response = await fetch(`${API_BASE}/api/follow/${targetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Success - keep optimistic update
        return { success: true, data };
      } else {
        // Error - rollback optimistic update
        setFollowingMap(prev => {
          const newMap = new Map(prev);
          if (previousFollowing !== undefined) {
            newMap.set(targetId, previousFollowing);
          } else {
            newMap.delete(targetId);
          }
          return newMap;
        });
        setFollowLoading(prev => {
          const newMap = new Map(prev);
          newMap.delete(targetId);
          return newMap;
        });

        return { success: false, error: data.msg || 'Failed to unfollow user' };
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
      
      // Rollback on network error
      setFollowingMap(prev => {
        const newMap = new Map(prev);
        if (previousFollowing !== undefined) {
          newMap.set(targetId, previousFollowing);
        } else {
          newMap.delete(targetId);
        }
        return newMap;
      });
      setFollowLoading(prev => {
        const newMap = new Map(prev);
        newMap.delete(targetId);
        return newMap;
      });

      return { success: false, error: 'Network error occurred' };
    }
  }, [token, followingMap, followLoading]);

  /**
   * Toggle follow/unfollow status
   */
  const toggleFollow = useCallback(async (targetId, currentStatus) => {
    if (currentStatus || followingMap.get(targetId)) {
      return await unfollowUser(targetId);
    } else {
      return await followUser(targetId);
    }
  }, [followUser, unfollowUser, followingMap]);

  /**
   * Get follow status for a user (from local state first)
   */
  const getFollowStatus = useCallback((targetId) => {
    if (!targetId) return false;
    return followingMap.get(targetId) || false;
  }, [followingMap]);

  /**
   * Get follow loading state for a user
   */
  const getFollowLoading = useCallback((targetId) => {
    if (!targetId) return false;
    return followLoading.get(targetId) || false;
  }, [followLoading]);

  /**
   * Update follow status for multiple users (for search results)
   */
  const updateMultipleFollowStatus = useCallback((statusMap) => {
    setFollowingMap(prev => {
      const newMap = new Map(prev);
      Object.entries(statusMap).forEach(([userId, status]) => {
        newMap.set(userId, status.isFollowing);
      });
      return newMap;
    });
  }, []);

  /**
   * Clear follow state (useful for logout)
   */
  const clearFollowState = useCallback(() => {
    setFollowingMap(new Map());
    setFollowLoading(new Map());
    setFollowStats(new Map());
  }, []);

  /**
   * Initialize follow status for search results
   */
  const initializeFollowStatus = useCallback((searchResults) => {
    if (!Array.isArray(searchResults)) return;

    const statusMap = {};
    searchResults.forEach(result => {
      if (result.id && result.isFollowing !== undefined) {
        statusMap[result.id] = { isFollowing: result.isFollowing };
      }
    });

    updateMultipleFollowStatus(statusMap);
  }, [updateMultipleFollowStatus]);

  // Clear follow state when user logs out
  useEffect(() => {
    if (!user) {
      clearFollowState();
    }
  }, [user, clearFollowState]);

  const value = {
    // State
    followingMap,
    followLoading,
    followStats,
    
    // Actions
    followUser,
    unfollowUser,
    toggleFollow,
    checkFollowStatus,
    getFollowStatus,
    getFollowLoading,
    updateMultipleFollowStatus,
    initializeFollowStatus,
    clearFollowState
  };

  return (
    <FollowContext.Provider value={value}>
      {children}
    </FollowContext.Provider>
  );
};

/**
 * Custom hook to use FollowContext
 */
export const useFollow = () => {
  const context = useContext(FollowContext);
  if (!context) {
    throw new Error('useFollow must be used within a FollowProvider');
  }
  return context;
};

export default FollowContext;
