import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const UserDashboard = () => {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');

  // Fetch user's posts and profile data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // In a real app, you'd have endpoints for:
        // 1. Getting user profile data
        // 2. Getting user's posts
        // For now, we'll use mock data but structure it properly
        
        // Mock posts data - in real app, fetch from API
        const mockPosts = [
          {
            id: 1,
            author: user?.username || 'User',
            authorPic: user?.profilePicture || '/api/placeholder/40/40',
            content: 'Welcome to AI Nexus! Excited to be part of this amazing community.',
            timestamp: '2 hours ago',
            image: '',
            likes: 5,
            comments: [],
          }
        ];
        
        setPosts(mockPosts);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && token) {
      fetchUserData();
    }
  }, [user, token]);

  const handlePostSubmit = async (event) => {
    event.preventDefault();
    
    if (!newPost.trim()) return;

    try {
      // In a real app, you'd POST to /api/posts
      const newPostData = {
        id: posts.length + 1,
        author: user?.username || 'User',
        authorPic: user?.profilePicture || '/api/placeholder/40/40',
        content: newPost,
        timestamp: 'Just now',
        image: '',
        likes: 0,
        comments: [],
      };

      setPosts([newPostData, ...posts]);
      setNewPost('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Cover Photo and Profile Section */}
      <div 
        className="cover-photo" 
        style={{ 
          backgroundImage: `url(${user?.profilePicture ? user.profilePicture : 'https://cdn.pixabay.com/photo/2023/07/26/16/09/ai-generated-8151978_1280.png'})` 
        }}
      >
        <img 
          src={user?.profilePicture || '/api/placeholder/80/80'} 
          alt="Profile" 
          className="profile-pic-large" 
        />
      </div>

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h1 className="user-name">{user?.username || 'User'}</h1>
        <p className="username">@{user?.email || 'user'}</p>
        <p className="user-bio">AI enthusiast exploring the future of technology</p>
        <div className="user-stats">
          <span>0 Followers</span>
          <span>0 Following</span>
        </div>
        <div className="profile-actions">
          <button className="follow-button">Edit Profile</button>
          <button className="message-button">Settings</button>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <div className="dashboard-tabs">
        <button className="tab-button active">Posts</button>
        <button className="tab-button">About</button>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {/* Post Creation */}
        <div className="posts-section">
          <div className="post-creator-card">
            <form onSubmit={handlePostSubmit}>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's new in your AI journey?"
                rows="3"
              ></textarea>
              <button type="submit" className="create-post-button" disabled={!newPost.trim()}>
                Post Update
              </button>
            </form>
          </div>

          {/* Posts Feed */}
          <div className="post-feed">
            {posts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-author-info">
                  <img 
                    src={post.authorPic} 
                    alt="Author" 
                    className="post-author-pic" 
                    onError={(e) => {
                      e.target.src = '/api/placeholder/40/40';
                    }}
                  />
                  <div>
                    <span className="post-author-name">{post.author}</span>
                    <span className="post-timestamp">{post.timestamp}</span>
                  </div>
                </div>
                <p className="post-content-text">{post.content}</p>
                {post.image && <img src={post.image} alt="Post" className="post-image" />}
                <div className="post-actions">
                  <button>Like ({post.likes})</button>
                  <button>Comment ({post.comments.length})</button>
                </div>
                {post.comments.length > 0 && (
                  <div className="post-comments">
                    {post.comments.map(comment => (
                      <div key={comment.id} className="comment-item">
                        <strong>{comment.author}:</strong> {comment.text}
                        <span className="comment-timestamp">{comment.timestamp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
