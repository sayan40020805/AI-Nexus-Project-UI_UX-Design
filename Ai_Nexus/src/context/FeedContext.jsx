
import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export const FeedContext = createContext(null);

export function FeedProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [liveStreams, setLiveStreams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, user } = useAuth();

  // Fetch home feed (posts from followed users/companies)
  const fetchHomeFeed = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/feed/home`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      } else {
        throw new Error('Failed to fetch feed');
      }
    } catch (err) {
      console.error('Fetch feed error:', err);
      setError('Failed to load feed');
      // Fallback to empty array
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch live streams
  const fetchLiveStreams = async () => {
    if (!token) return;
    
    try {

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/live`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLiveStreams(data.sessions || []);
      }
    } catch (err) {
      console.error('Fetch live streams error:', err);
    }
  };

  // Like a post
  const likePost = async (postId) => {
    if (!token) return;
    
    try {

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
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
      }
    } catch (err) {
      console.error('Like post error:', err);
    }
  };

  // Comment on a post
  const commentOnPost = async (postId, content) => {
    if (!token) return;
    
    try {

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local posts state
        setPosts(prev => prev.map(post => 
          post._id === postId 
            ? { 
                ...post, 
                comments: data.comments 
              }
            : post
        ));
        
        return data.comment;
      }
    } catch (err) {
      console.error('Comment post error:', err);
      throw err;
    }
  };

  // Share a post
  const sharePost = async (postId) => {
    if (!token) return;
    
    try {

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/posts/${postId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local posts state
        setPosts(prev => prev.map(post => 
          post._id === postId 
            ? { 
                ...post, 
                shares: data.shares 
              }
            : post
        ));
      }
    } catch (err) {
      console.error('Share post error:', err);
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
