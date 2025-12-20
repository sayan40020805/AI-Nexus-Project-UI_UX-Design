import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FeedContext } from '../../context/FeedContext';
import PostCard from '../../components/PostCard/PostCard';
import { usePostInteractions } from '../../hooks/usePostInteractions';
import './Dashboard.css';

const CompanyDashboard = () => {
  const { user, token } = useAuth();
  const [companyPosts, setCompanyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [editingProfile, setEditingProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [companyData, setCompanyData] = useState({
    companyName: '',
    email: '',
    description: '',
    companyLogo: '',
    website: '',
    industry: ''
  });
  const [analytics, setAnalytics] = useState({
    totalPosts: 0,
    followers: 0,
    totalLikes: 0,
    totalComments: 0,
    engagement: 0,
    views: 0
  });

  // Fetch company data and posts
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!user || !token) return;
      
      try {
        setLoading(true);
        
        // Fetch company profile data
        const profileResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/company/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (profileResponse.ok) {
          const profileResult = await profileResponse.json();
          setCompanyData({
            companyName: profileResult.company?.companyName || user?.companyName || 'Company',
            email: profileResult.company?.email || user?.email || '',
            description: profileResult.company?.companyDescription || user?.companyDescription || 'Leading the future with AI innovation',
            companyLogo: profileResult.company?.companyLogo || user?.companyLogo || '',
            website: profileResult.company?.website || '',
            industry: profileResult.company?.industry || ''
          });
        }

        // Fetch company's posts
        const postsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/company/posts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (postsResponse.ok) {
          const postsResult = await postsResponse.json();
          const posts = postsResult.posts || [];
          
          // Format posts for display with new structure
          const formattedPosts = posts.map(post => ({
            _id: post._id,
            content: post.content,
            postType: post.postType || 'normal',
            author: {
              _id: user._id,
              username: user.username,
              companyName: user.companyName,
              profilePicture: user.profilePicture,
              companyLogo: user.companyLogo,
              role: user.role
            },
            media: post.media || {},
            likes: post.likes || [],
            comments: post.comments || [],
            shares: post.shares || [],
            savedBy: post.savedBy || [],
            isPublic: post.isPublic !== false,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            isLiked: post.likes?.some(like => like.user === user._id) || false,
            isSaved: post.savedBy?.some(save => save.user === user._id) || false
          }));
          
          setCompanyPosts(formattedPosts);
        }

        // Fetch company analytics
        const analyticsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/company/analytics`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (analyticsResponse.ok) {
          const analyticsResult = await analyticsResponse.json();
          setAnalytics(analyticsResult.analytics || {
            totalPosts: 0,
            followers: 0,
            totalLikes: 0,
            totalComments: 0,
            engagement: 0,
            views: 0
          });
        }
      } catch (error) {
        console.error('Error fetching company data:', error);
        // Fallback to basic company data if API fails
        setCompanyData({
          companyName: user?.companyName || 'Company',
          email: user?.email || '',
          description: user?.companyDescription || 'Leading the future with AI innovation',
          companyLogo: user?.companyLogo || '',
          website: user?.website || '',
          industry: user?.industry || ''
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [user, token]);

  const handlePostSubmit = async (event) => {
    event.preventDefault();
    
    if (!newPost.trim()) return;

    try {
      const formData = new FormData();
      formData.append('content', newPost);
      formData.append('postType', 'normal');

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        
        const newPostData = {
          _id: result.post._id,
          content: result.post.content,
          postType: result.post.postType || 'normal',
          author: {
            _id: user._id,
            username: user.username,
            companyName: user.companyName,
            profilePicture: user.profilePicture,
            companyLogo: user.companyLogo,
            role: user.role
          },
          media: result.post.media || {},
          likes: result.post.likes || [],
          comments: result.post.comments || [],
          shares: result.post.shares || [],
          savedBy: result.post.savedBy || [],
          isPublic: result.post.isPublic !== false,
          createdAt: result.post.createdAt,
          updatedAt: result.post.updatedAt,
          isLiked: false,
          isSaved: false
        };

        setCompanyPosts([newPostData, ...companyPosts]);
        setNewPost('');
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating company post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  const handleCompanyProfileUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('companyName', companyData.companyName);
      formData.append('companyDescription', companyData.description);
      formData.append('website', companyData.website);
      formData.append('industry', companyData.industry);
      
      if (companyData.companyLogo instanceof File) {
        formData.append('companyLogo', companyData.companyLogo);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/company/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setCompanyData(prev => ({
          ...prev,
          companyName: result.company.companyName,
          description: result.company.companyDescription,
          website: result.company.website,
          industry: result.company.industry,
          companyLogo: result.company.companyLogo
        }));
        setEditingProfile(false);
        alert('Company profile updated successfully!');
      } else {
        throw new Error('Failed to update company profile');
      }
    } catch (error) {
      console.error('Error updating company profile:', error);
      alert('Failed to update company profile. Please try again.');
    }
  };

  const handleCompanySettingsUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData(e.target);
      const settings = {
        privacy: formData.get('privacy'),
        notifications: {
          email: formData.get('emailNotifications') === 'on',
          push: formData.get('pushNotifications') === 'on',
          sms: formData.get('smsNotifications') === 'on'
        },
        messaging: {
          allowDirectMessages: formData.get('allowDirectMessages') === 'on',
          allowConnectionsOnly: formData.get('allowConnectionsOnly') === 'on'
        },
        profile: {
          showEmail: formData.get('showEmail') === 'on',
          showPhone: formData.get('showPhone') === 'on',
          showLocation: formData.get('showLocation') === 'on'
        }
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings })
      });

      if (response.ok) {
        setShowSettings(false);
        alert('Company settings updated successfully!');
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating company settings:', error);
      alert('Failed to update settings. Please try again.');
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompanyData(prev => ({
        ...prev,
        companyLogo: file
      }));
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
          backgroundImage: `url(${companyData.companyLogo ? companyData.companyLogo : 'https://cdn.pixabay.com/photo/2023/07/26/16/09/ai-generated-8151978_1280.png'})` 
        }}
      >
        <img 
          src={companyData.companyLogo || '/default-avatar.svg'} 
          alt="Company Logo" 
          className="profile-pic-large" 
          onError={(e) => {
            e.target.src = '/default-avatar.svg';
          }}
        />
      </div>

      {/* Company Dashboard Header */}
      <div className="dashboard-header">
        <h1 className="user-name">{companyData.companyName}</h1>
        <p className="username">{companyData.email}</p>
        <p className="user-bio">{companyData.description}</p>
        <div className="user-stats">
          <span>0 Followers</span>
          <span>0 Following</span>
        </div>
        <div className="profile-actions">
          <button className="follow-button" onClick={() => setEditingProfile(true)}>Edit Company Profile</button>
          <button className="message-button" onClick={() => setShowSettings(true)}>Company Settings</button>
        </div>
      </div>

      {/* Company Profile Edit Modal */}
      {editingProfile && (
        <div className="profile-edit-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Company Profile</h3>
              <button className="close-btn" onClick={() => setEditingProfile(false)}>&times;</button>
            </div>
            <form onSubmit={handleCompanyProfileUpdate}>
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  value={companyData.companyName}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, companyName: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={companyData.description}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  maxLength="500"
                />
                <span className="char-count">{companyData.description.length}/500</span>
              </div>
              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  value={companyData.website}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://company.com"
                />
              </div>
              <div className="form-group">
                <label>Industry</label>
                <input
                  type="text"
                  value={companyData.industry}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, industry: e.target.value }))}
                  placeholder="e.g., Technology, Healthcare, Finance"
                />
              </div>
              <div className="form-group">
                <label>Company Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setEditingProfile(false)} className="cancel-btn">Cancel</button>
                <button type="submit" className="save-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Company Settings Modal */}
      {showSettings && (
        <div className="profile-edit-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Company Settings</h3>
              <button className="close-btn" onClick={() => setShowSettings(false)}>&times;</button>
            </div>
            <form onSubmit={handleCompanySettingsUpdate}>
              <div className="form-group">
                <label>Privacy Settings</label>
                <select name="privacy">
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="connections">Connections Only</option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" name="emailNotifications" defaultChecked /> Email Notifications
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" name="pushNotifications" defaultChecked /> Push Notifications
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" name="smsNotifications" /> SMS Notifications
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" name="allowDirectMessages" defaultChecked /> Allow Direct Messages
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" name="allowConnectionsOnly" /> Allow Messages from Connections Only
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" name="showEmail" /> Show Email in Profile
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" name="showPhone" /> Show Phone in Profile
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" name="showLocation" /> Show Location in Profile
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowSettings(false)} className="cancel-btn">Cancel</button>
                <button type="submit" className="save-btn">Save Settings</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <PostCard
                  key={post._id}
                  post={post}
                  onPostUpdate={(updatedPost) => {
                    setCompanyPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
                  }}
                  onPostDelete={(deletedPostId) => {
                    setCompanyPosts(prev => prev.filter(p => p._id !== deletedPostId));
                  }}
                  showComments={false}
                />
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
                  <p className="analytics-number">{analytics.followers}</p>
                </div>
                <div className="analytics-item">
                  <h4>Total Posts</h4>
                  <p className="analytics-number">{analytics.totalPosts}</p>
                </div>
                <div className="analytics-item">
                  <h4>Total Likes</h4>
                  <p className="analytics-number">{analytics.totalLikes}</p>
                </div>
                <div className="analytics-item">
                  <h4>Total Comments</h4>
                  <p className="analytics-number">{analytics.totalComments}</p>
                </div>
                <div className="analytics-item">
                  <h4>Engagement Rate</h4>
                  <p className="analytics-number">{analytics.engagement}%</p>
                </div>
                <div className="analytics-item">
                  <h4>Views</h4>
                  <p className="analytics-number">{analytics.views}</p>
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
