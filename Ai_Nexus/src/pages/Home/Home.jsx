import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FeedContext } from '../../context/FeedContext';
import PostCard from '../../components/PostCard/PostCard';
import { Home as HomeIcon, RefreshCw, Users, Heart, MessageCircle } from 'lucide-react';
import './Home.css';

const Home = () => {
  const { user, loading: authLoading } = useAuth();
  const feedContext = React.useContext(FeedContext);
  const { posts = [], loading = false, error = null, refreshFeed } = feedContext || {};
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshFeed();
    } catch (error) {
      console.error('Error refreshing feed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate feed statistics
  const totalLikes = posts.reduce((sum, post) => sum + (post.likesCount || 0), 0);
  const totalComments = posts.reduce((sum, post) => sum + (post.commentsCount || 0), 0);
  const totalShares = posts.reduce((sum, post) => sum + (post.sharesCount || 0), 0);

  if (authLoading) {
    return (
      <div className="home-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your feed...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="home-container">
        <div className="login-prompt">
          <HomeIcon size={48} className="login-icon" />
          <h2>Welcome to AI Nexus</h2>
          <p>Please log in to view your personalized feed and connect with the AI community.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Home Header */}
      <div className="home-header">
        <div className="home-header-content">
          <div className="home-title-section">
            <HomeIcon className="home-icon" size={24} />
            <h1>Home Feed</h1>
            <p className="home-subtitle">Discover posts from the entire AI community</p>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="refresh-button"
          >
            <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        {/* Feed Statistics */}
        <div className="feed-stats">
          <div className="stat-item">
            <Users size={16} />
            <span>{posts.length} Posts</span>
          </div>
          <div className="stat-item">
            <Heart size={16} />
            <span>{totalLikes} Likes</span>
          </div>
          <div className="stat-item">
            <MessageCircle size={16} />
            <span>{totalComments} Comments</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="home-content">
        {/* Error State */}
        {error && (
          <div className="error-state">
            <p>Error loading feed: {error}</p>
            <button onClick={handleRefresh} className="retry-button">
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && posts.length === 0 && (
          <div className="loading-feed">
            <div className="loading-spinner"></div>
            <p>Loading feed...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && !error && (
          <div className="empty-feed">
            <HomeIcon size={48} className="empty-icon" />
            <h3>No posts yet</h3>
            <p>Be the first to share something with the community! Visit the Create Post page to get started.</p>
          </div>
        )}

        {/* Posts Feed */}
        {posts.length > 0 && (
          <div className="posts-feed">
            {posts.map((post, index) => {
              console.log(`🏠 Home - Rendering post ${index + 1}:`, {
                postId: post._id,
                has_id: !!post._id,
                content: post.content?.substring(0, 50),
                author: post.author?.username || post.author?.companyName
              });
              
              return (
                <div key={post._id || `temp-${index}`} className="feed-post-item">
                  <PostCard 
                    post={post}
                    onPostUpdate={(updatedPost) => {
                      // Handle post updates if needed
                      console.log('Post updated:', updatedPost);
                    }}
                    onPostDelete={(deletedPostId) => {
                      // Handle post deletion if needed
                      console.log('Post deleted:', deletedPostId);
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Load More / Pagination could be added here */}
        {posts.length > 0 && (
          <div className="feed-footer">
            <p className="feed-info">
              Showing {posts.length} posts from the AI community
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
