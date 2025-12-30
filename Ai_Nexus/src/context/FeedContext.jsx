
import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export const FeedContext = createContext(null);

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function for API calls with retry logic
const makeApiCall = async (url, options = {}, retries = 0) => {
  try {
    console.log(`🌐 API Call: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      }
    });

    console.log(`📡 API Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      if (response.status === 401 && retries < MAX_RETRIES) {
        console.log(`🔄 Token expired, retrying... (${retries + 1}/${MAX_RETRIES})`);
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return makeApiCall(url, options, retries + 1);
      }
      
      const errorData = await response.json().catch(() => ({ msg: 'Unknown error' }));
      throw new Error(errorData.msg || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ API Success:`, data);
    return data;
  } catch (err) {
    console.error(`❌ API Error:`, err.message);
    
    if (retries < MAX_RETRIES && (err.name === 'TypeError' || err.message.includes('fetch'))) {
      console.log(`🔄 Network error, retrying... (${retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return makeApiCall(url, options, retries + 1);
    }
    
    throw err;
  }
};

export function FeedProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [liveStreams, setLiveStreams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const { token, user } = useAuth();

  // Fetch home feed (posts from followed users/companies)
  const fetchHomeFeed = async () => {
    if (!token) {
      console.log('⚠️ No token available for feed fetch');
      setError('Authentication required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setRetryCount(prev => prev + 1);
      
      console.log(`🔄 Fetching home feed... (Attempt ${retryCount + 1})`);
      
      const data = await makeApiCall(
        `${API_BASE_URL}/api/feed`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setPosts(data.posts || []);
      console.log(`✅ Home feed loaded: ${data.posts?.length || 0} posts`);
      
    } catch (err) {
      console.error('❌ Fetch feed error:', err);
      const errorMessage = err.message.includes('401') 
        ? 'Authentication failed. Please log in again.'
        : err.message.includes('fetch')
        ? 'Network error. Please check your connection.'
        : 'Failed to load feed. Please try again.';
        
      setError(errorMessage);
      setPosts([]); // Clear posts on error
      
      // Don't log network errors to user as they're often temporary
      if (!err.message.includes('fetch')) {
        console.warn('⚠️ User-facing error:', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch live streams
  const fetchLiveStreams = async () => {
    if (!token) {
      console.log('⚠️ No token available for live streams fetch');
      return;
    }
    
    try {
      console.log('🔄 Fetching live streams...');
      
      const data = await makeApiCall(
        `${API_BASE_URL}/api/live`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setLiveStreams(data.sessions || []);
      console.log(`✅ Live streams loaded: ${data.sessions?.length || 0} sessions`);
      
    } catch (err) {
      console.error('❌ Fetch live streams error:', err);
      // Don't set error state for live streams as it's secondary to feed
      setLiveStreams([]); // Clear streams on error
    }
  };

  // Like a post
  const likePost = async (postId) => {
    if (!token) {
      console.log('⚠️ No token available for like post');
      return;
    }
    
    try {
      console.log(`👍 Liking post: ${postId}`);
      
      const data = await makeApiCall(
        `${API_BASE_URL}/api/posts/${postId}/like`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Update local posts state
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { 
              ...post, 
              likes: data.likes,
              isLiked: data.isLiked 
            }
          : post
      ));
      
      console.log(`✅ Post liked successfully`);
      
    } catch (err) {
      console.error('❌ Like post error:', err);
      // Don't throw error to avoid breaking user interaction
    }
  };

  // Comment on a post
  const commentOnPost = async (postId, content) => {
    if (!token) {
      console.log('⚠️ No token available for comment');
      throw new Error('Authentication required');
    }
    
    try {
      console.log(`💬 Commenting on post: ${postId}`);
      
      const data = await makeApiCall(
        `${API_BASE_URL}/api/posts/${postId}/comment`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ content })
        }
      );
      
      // Update local posts state
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { 
              ...post, 
              comments: data.comments 
            }
          : post
      ));
      
      console.log(`✅ Comment added successfully`);
      return data.comment;
      
    } catch (err) {
      console.error('❌ Comment post error:', err);
      throw err; // Re-throw to allow UI handling
    }
  };

  // Share a post
  const sharePost = async (postId) => {
    if (!token) {
      console.log('⚠️ No token available for share post');
      return;
    }
    
    try {
      console.log(`🔗 Sharing post: ${postId}`);
      
      const data = await makeApiCall(
        `${API_BASE_URL}/api/posts/${postId}/share`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Update local posts state
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { 
              ...post, 
              shares: data.shares 
            }
          : post
      ));
      
      console.log(`✅ Post shared successfully`);
      
    } catch (err) {
      console.error('❌ Share post error:', err);
      // Don't throw error to avoid breaking user interaction
    }
  };

  // Add new post to feed
  const addPost = (post) => {
    setPosts(prev => [post, ...prev]);
  };

  // Add new live stream
  const addLive = (live) => {
    setLiveStreams(prev => [live, ...prev]);
  };

  useEffect(() => {
    if (token) {
      fetchHomeFeed();
      fetchLiveStreams();
    } else {
      // Clear data when not authenticated
      setPosts([]);
      setLiveStreams([]);
    }
  }, [token]);

  return (
    <FeedContext.Provider value={{ 
      posts, 
      liveStreams, 
      loading, 
      error,
      addPost, 
      addLive,
      likePost,
      commentOnPost,
      sharePost,
      refreshFeed: fetchHomeFeed
    }}>
      {children}
    </FeedContext.Provider>
  );
}

export default FeedContext;
