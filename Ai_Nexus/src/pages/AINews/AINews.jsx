import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import PostCard from '../../components/PostCard/PostCard';
import { Search, Filter, Newspaper, TrendingUp, Calendar } from 'lucide-react';
import '../../styles/NewsFeed.css';

const AINews = () => {
  const { token, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch AI News posts
  const fetchAiNewsPosts = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/feed/by-type/ai_news?page=1&limit=50`,
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
        throw new Error('Failed to fetch AI News posts');
      }
    } catch (err) {
      console.error('Error fetching AI News posts:', err);
      setError('Failed to load AI News posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAiNewsPosts();
  }, [token]);

  // Filter and sort posts
  const filteredPosts = posts
    .filter(post => 
      (searchTerm === '' || 
        post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.title?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategory === 'All' || post.category === selectedCategory)
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
      <div className="ai-news-page">
        <div className="page-header">
          <h2>AI News</h2>
          <p>Please log in to view AI News posts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-news-page page-with-header">
      <div className="app-main">
        <section className="app-section">
          <div className="app-section-header">
            <div className="section-title-container">
              <Newspaper className="section-icon" />
              <h2 className="section-title">AI News</h2>
            </div>
            <div className="section-underline" />
            <p className="section-description">
              Latest AI news and updates from the community
            </p>
          </div>

          <div className="app-section-content">
            {/* Search and Filter Controls */}
            <div className="ai-news-controls">
              <div className="news-feed-search-section">
                <div className="news-feed-search-wrapper">
                  <Search className="news-feed-search-icon" />
                  <input
                    type="text"
                    placeholder="Search AI news..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="news-feed-search-input"
                  />
                </div>
                <div className="news-feed-sort-wrapper">
                  <Filter className="news-feed-sort-icon" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="news-feed-sort-select"
                  >
                    <option value="date">Latest</option>
                    <option value="likes">Most Popular</option>
                  </select>
                </div>
              </div>

              <div className="news-feed-category-section">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`news-feed-category-btn ${selectedCategory === 'All' ? 'active' : ''}`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedCategory('Healthcare AI')}
                  className={`news-feed-category-btn ${selectedCategory === 'Healthcare AI' ? 'active' : ''}`}
                >
                  Healthcare AI
                </button>
                <button
                  onClick={() => setSelectedCategory('FinTech AI')}
                  className={`news-feed-category-btn ${selectedCategory === 'FinTech AI' ? 'active' : ''}`}
                >
                  FinTech AI
                </button>
                <button
                  onClick={() => setSelectedCategory('Generative AI')}
                  className={`news-feed-category-btn ${selectedCategory === 'Generative AI' ? 'active' : ''}`}
                >
                  Generative AI
                </button>
                <button
                  onClick={() => setSelectedCategory('Computer Vision')}
                  className={`news-feed-category-btn ${selectedCategory === 'Computer Vision' ? 'active' : ''}`}
                >
                  Computer Vision
                </button>
                <button
                  onClick={() => setSelectedCategory('NLP')}
                  className={`news-feed-category-btn ${selectedCategory === 'NLP' ? 'active' : ''}`}
                >
                  NLP
                </button>
                <button
                  onClick={() => setSelectedCategory('Robotics')}
                  className={`news-feed-category-btn ${selectedCategory === 'Robotics' ? 'active' : ''}`}
                >
                  Robotics
                </button>
                <button
                  onClick={() => setSelectedCategory('Ethics & Policy')}
                  className={`news-feed-category-btn ${selectedCategory === 'Ethics & Policy' ? 'active' : ''}`}
                >
                  Ethics & Policy
                </button>
              </div>
            </div>

            {/* Posts Grid */}
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading AI News...</p>
              </div>
            ) : error ? (
              <div className="error-container">
                <p className="error-message">{error}</p>
                <button onClick={fetchAiNewsPosts} className="retry-btn">
                  Try Again
                </button>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="empty-state">
                <Newspaper className="empty-icon" />
                <h3>No AI News Found</h3>
                <p>
                  {searchTerm 
                    ? 'No news articles match your search.' 
                    : 'Be the first to share AI news!'}
                </p>
                <a href="/create-post" className="create-post-btn">
                  Share AI News
                </a>
              </div>
            ) : (
              <div className="ai-news-grid">
                {filteredPosts.map((post) => (
                  <div key={post._id} className="ai-news-item">
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
              <div className="ai-news-stats">
                <div className="stat-item">
                  <span className="stat-number">{filteredPosts.length}</span>
                  <span className="stat-label">News Articles</span>
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

export default AINews;
