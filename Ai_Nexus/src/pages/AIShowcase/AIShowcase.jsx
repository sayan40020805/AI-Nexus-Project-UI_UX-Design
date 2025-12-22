import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import PostCard from '../../components/PostCard/PostCard';
import { Search, Filter, Video, Play } from 'lucide-react';
import '../../styles/AIShowcase.css';

const AIShowcase = () => {
  const { token, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

  // Fetch AI Showcase posts
  const fetchAiShowcasePosts = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/feed/by-type/showcase?page=1&limit=50`,
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
        throw new Error('Failed to fetch AI Showcase posts');
      }
    } catch (err) {
      console.error('Error fetching AI Showcase posts:', err);
      setError('Failed to load AI Showcase posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAiShowcasePosts();
  }, [token]);

  // Filter and sort posts
  const filteredPosts = posts
    .filter(post => 
      searchTerm === '' || 
      post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.title?.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="ai-showcase-page">
        <div className="page-header">
          <h2>AI Showcase</h2>
          <p>Please log in to view AI Showcase posts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-showcase-page page-with-header">
      <div className="app-main">
        <section className="app-section">
          <div className="app-section-header">
            <div className="section-title-container">
              <Play className="section-icon" />
              <h2 className="section-title">AI Showcase</h2>
            </div>
            <div className="section-underline" />
            <p className="section-description">
              Long-form video content and demonstrations
            </p>
          </div>

          <div className="app-section-content">
            {/* Search and Filter Controls */}
            <div className="ai-showcase-controls">
              <div className="search-wrapper">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Search AI Showcase..."
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
                <p>Loading AI Showcase...</p>
              </div>
            ) : error ? (
              <div className="error-container">
                <p className="error-message">{error}</p>
                <button onClick={fetchAiShowcasePosts} className="retry-btn">
                  Try Again
                </button>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="empty-state">
                <Video className="empty-icon" />
                <h3>No AI Showcase Found</h3>
                <p>
                  {searchTerm 
                    ? 'No posts match your search.' 
                    : 'Be the first to create an AI Showcase!'}
                </p>
                <a href="/create-post" className="create-post-btn">
                  Create AI Showcase
                </a>
              </div>
            ) : (
              <div className="ai-showcase-grid">
                {filteredPosts.map((post) => (
                  <div key={post._id} className="ai-showcase-item">
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
              <div className="ai-showcase-stats">
                <div className="stat-item">
                  <span className="stat-number">{filteredPosts.length}</span>
                  <span className="stat-label">Showcase Videos</span>
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
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AIShowcase;
