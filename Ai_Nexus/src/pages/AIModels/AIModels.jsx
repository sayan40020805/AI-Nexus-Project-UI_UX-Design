import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import PostCard from '../../components/PostCard/PostCard';
import { Search, Filter, Bot, Cpu } from 'lucide-react';
import '../../styles/ModelDirectory.css';

const AIModels = () => {
  const { token, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

  // Fetch AI Models posts
  const fetchAiModelsPosts = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/feed/by-type/model?page=1&limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      } else {
        throw new Error('Failed to fetch AI Models posts');
      }
    } catch (err) {
      console.error('Error fetching AI Models posts:', err);
      setError('Failed to load AI Models posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAiModelsPosts();
  }, [token]);

  // Filter and sort posts
  const filteredPosts = posts
    .filter(post => 
      searchTerm === '' || 
      post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.modelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'likes') return (b.likes?.length || 0) - (a.likes?.length || 0);
      return 0;
    });

  const handlePostUpdate = (updatedPost) => {
    setPosts(prev => prev.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    ));
  };

  const handlePostDelete = (deletedPostId) => {
    setPosts(prev => prev.filter(post => post._id !== deletedPostId));
  };

  if (!user) {
    return (
      <div className="ai-models-page">
        <div className="page-header">
          <h2>AI Models</h2>
          <p>Please log in to view AI Models posts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-models-page page-with-header">
      <div className="app-main">
        <section className="app-section">
          <div className="app-section-header">
            <div className="section-title-container">
              <Bot className="section-icon" />
              <h2 className="section-title">AI Models</h2>
            </div>
            <div className="section-underline" />
            <p className="section-description">
              AI models and tools shared by the community
            </p>
          </div>

          <div className="app-section-content">
            {/* Search and Filter Controls */}
            <div className="ai-models-controls">
              <div className="search-wrapper">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Search AI Models..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="filter-wrapper">
                <Filter className="filter-icon" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="date">Latest</option>
                  <option value="likes">Most Liked</option>
                </select>
              </div>
            </div>

            {/* Posts Grid */}
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading AI Models...</p>
              </div>
            ) : error ? (
              <div className="error-container">
                <p className="error-message">{error}</p>
                <button onClick={fetchAiModelsPosts} className="retry-btn">
                  Try Again
                </button>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="empty-state">
                <Bot className="empty-icon" />
                <h3>No AI Models Found</h3>
                <p>
                  {searchTerm 
                    ? 'No models match your search.' 
                    : 'Be the first to share an AI Model!'}
                </p>
                <a href="/create-post" className="create-post-btn">
                  Share AI Model
                </a>
              </div>
            ) : (
              <div className="ai-models-grid">
                {filteredPosts.map((post) => (
                  <div key={post._id} className="ai-models-item">
                    <PostCard
                      post={post}
                      onPostUpdate={handlePostUpdate}
                      onPostDelete={handlePostDelete}
                      showComments={false}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Stats */}
            {filteredPosts.length > 0 && (
              <div className="ai-models-stats">
                <div className="stat-item">
                  <span className="stat-number">{filteredPosts.length}</span>
                  <span className="stat-label">AI Models</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {filteredPosts.reduce((total, post) => total + (post.likes?.length || 0), 0)}
                  </span>
                  <span className="stat-label">Total Likes</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {filteredPosts.reduce((total, post) => total + (post.comments?.length || 0), 0)}
                  </span>
                  <span className="stat-label">Total Comments</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {new Set(filteredPosts.map(post => post.category).filter(Boolean)).size}
                  </span>
                  <span className="stat-label">Categories</span>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AIModels;
