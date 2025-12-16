import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const CompanyDashboard = () => {
  const { user, token } = useAuth();
  const [companyPosts, setCompanyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch company data and posts
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        
        // Mock company posts data - in real app, fetch from API
        const mockCompanyPosts = [
          {
            id: 1,
            author: user?.companyName || 'Company',
            authorPic: user?.companyLogo || '/api/placeholder/40/40',
            content: 'We are excited to announce our new AI-powered solution! Stay tuned for more updates.',
            timestamp: '1 day ago',
            image: '',
            likes: 12,
            comments: [
              { id: 101, author: 'John Doe', text: 'This looks amazing!', timestamp: '20 hours ago' }
            ],
          }
        ];
        
        setCompanyPosts(mockCompanyPosts);
      } catch (error) {
        console.error('Error fetching company data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && token) {
      fetchCompanyData();
    }
  }, [user, token]);

  const handlePostSubmit = async (event) => {
    event.preventDefault();
    
    if (!newPost.trim()) return;

    try {
      // In a real app, you'd POST to /api/company/posts
      const newPostData = {
        id: companyPosts.length + 1,
        author: user?.companyName || 'Company',
        authorPic: user?.companyLogo || '/api/placeholder/40/40',
        content: newPost,
        timestamp: 'Just now',
        image: '',
        likes: 0,
        comments: [],
      };

      setCompanyPosts([newPostData, ...companyPosts]);
      setNewPost('');
    } catch (error) {
      console.error('Error creating company post:', error);
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
        Loading company dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Cover Photo and Company Profile Section */}
      <div 
        className="cover-photo" 
        style={{ 
          backgroundImage: `url(${user?.companyLogo ? user.companyLogo : 'https://cdn.pixabay.com/photo/2023/07/26/16/09/ai-generated-8151978_1280.png'})` 
        }}
      >
        <img 
          src={user?.companyLogo || '/api/placeholder/80/80'} 
          alt="Company Logo" 
          className="profile-pic-large" 
        />
      </div>

      {/* Company Dashboard Header */}
      <div className="dashboard-header">
        <h1 className="user-name">{user?.companyName || 'Company'}</h1>
        <p className="username">{user?.email || 'company@email.com'}</p>
        <p className="user-bio">{user?.companyDescription || 'Leading the future with AI innovation'}</p>
        <div className="user-stats">
          <span>0 Followers</span>
          <span>0 Following</span>
        </div>
        <div className="profile-actions">
          <button className="follow-button">Edit Company Profile</button>
          <button className="message-button">Company Settings</button>
        </div>
      </div>

      {/* Company Dashboard Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
        <button
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      {/* Company Dashboard Content */}
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="about-section">
            <div className="about-card">
              <h3>About {user?.companyName || 'Company'}</h3>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Description:</strong> {user?.companyDescription || 'No description provided'}</p>
              <p><strong>Member since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
              
              <h4>Company Features:</h4>
              <ul className="skills-list">
                <li>AI Solutions Provider</li>
                <li>Innovation Hub</li>
                <li>Technology Leader</li>
                <li>Community Builder</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="posts-section">
            {/* Company Post Creation */}
            <div className="post-creator-card">
              <form onSubmit={handlePostSubmit}>
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share an update about your company..."
                  rows="3"
                ></textarea>
                <button type="submit" className="create-post-button" disabled={!newPost.trim()}>
                  Share Update
                </button>
              </form>
            </div>

            {/* Company Posts Feed */}
            <div className="post-feed">
              {companyPosts.map((post) => (
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
                    <button>Share</button>
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
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <div className="analytics-card">
              <h3>Company Analytics</h3>
              <div className="analytics-grid">
                <div className="analytics-item">
                  <h4>Followers</h4>
                  <p className="analytics-number">0</p>
                </div>
                <div className="analytics-item">
                  <h4>Total Posts</h4>
                  <p className="analytics-number">{companyPosts.length}</p>
                </div>
                <div className="analytics-item">
                  <h4>Engagement Rate</h4>
                  <p className="analytics-number">0%</p>
                </div>
                <div className="analytics-item">
                  <h4>Views</h4>
                  <p className="analytics-number">0</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;
