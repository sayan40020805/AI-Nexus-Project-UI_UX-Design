import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PostCard from '../../components/PostCard/PostCard';
import '../../styles/ProfilePage.css';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Users, 
  MessageCircle, 
  Heart,
  Video,
  Image as ImageIcon,
  Zap,
  ExternalLink,
  Edit,
  Settings,
  Camera,
  Mail,
  Globe,
  Briefcase,
  Star
} from 'lucide-react';

const CompanyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [companyUser, setCompanyUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [stats, setStats] = useState({
    posts: 0,
    likes: 0,
    comments: 0,
    followers: 0,
    following: 0
  });

  // Check if viewing own company profile
  const isOwnCompany = user && companyUser && (user._id === companyUser.id || user.id === companyUser.id);

  // Fetch company profile and posts
  const fetchCompanyProfile = async () => {
    if (!token || !id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch company posts and profile info
      const [postsResponse, userResponse] = await Promise.all([
        fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/feed/user/${id}?page=1&limit=50`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        ),
        fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/user/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )
      ]);

      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        setPosts(postsData.posts || []);
        setCompanyUser(postsData.user);

        // Calculate stats
        const totalLikes = postsData.posts?.reduce((sum, post) => 
          sum + (post.likesCount || 0), 0) || 0;
        const totalComments = postsData.posts?.reduce((sum, post) => 
          sum + (post.commentsCount || 0), 0) || 0;
        
        setStats(prev => ({
          ...prev,
          posts: postsData.posts?.length || 0,
          likes: totalLikes,
          comments: totalComments
        }));
      } else {
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCompanyUser(userData);
        }
        throw new Error('Failed to fetch company posts');
      }
    } catch (err) {
      console.error('Error fetching company profile:', err);
      setError('Failed to load company profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCompanyProfile();
    }
  }, [id, token]);

  const handlePostUpdate = (updatedPost) => {
    setPosts(prev => prev.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    ));
  };

  const handlePostDelete = (deletedPostId) => {
    setPosts(prev => prev.filter(post => post._id !== deletedPostId));
  };

  // Filter posts by type for tabs
  const getFilteredPosts = () => {
    switch (activeTab) {
      case 'posts':
        return posts.filter(post => post.postType === 'normal');
      case 'shorts':
        return posts.filter(post => post.postType === 'ai_short');
      case 'videos':
        return posts.filter(post => post.postType === 'ai_showcase');
      case 'all':
      default:
        return posts;
    }
  };

  const formatJoinDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getCompanyDisplayName = (userData) => {
    if (!userData) return 'Unknown Company';
    return userData.companyName || 'Company';
  };

  const getCompanyLogo = (userData) => {
    if (!userData) return '/default-avatar.svg';
    return userData.companyLogo || userData.profilePicture || '/default-avatar.svg';
  };

  const getCompanyDescription = (userData) => {
    if (!userData) return '';
    return userData.companyDescription || userData.bio || '';
  };

  const getCompanyLocation = (userData) => {
    if (!userData) return '';
    return userData.location || '';
  };

  if (loading) {
    return (
      <div className="profile-page page-with-header">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page page-with-header">
        <div className="profile-error">
          <p>{error}</p>
          <button onClick={fetchCompanyProfile} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!companyUser) {
    return (
      <div className="profile-page page-with-header">
        <div className="profile-not-found">
          <Building2 size={48} />
          <h3>Company not found</h3>
          <p>The company profile you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/')} className="back-button">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Ensure this is a company account
  if (companyUser.role !== 'company') {
    return (
      <div className="profile-page page-with-header">
        <div className="profile-not-found">
          <Building2 size={48} />
          <h3>Not a Company</h3>
          <p>This profile is not a company account.</p>
          <button onClick={() => navigate(`/profile/${id}`)} className="back-button">
            View User Profile
          </button>
        </div>
      </div>
    );
  }

  const filteredPosts = getFilteredPosts();

  return (
    <div className="profile-page page-with-header">
      <div className="profile-header">
        {/* Cover Photo */}
        <div className="profile-cover">
          <div className="cover-placeholder">
            <Camera size={24} />
            <span>Add Cover Photo</span>
          </div>
        </div>

        {/* Company Info */}
        <div className="profile-info">
          <div className="profile-avatar-section">
            <div className="profile-avatar company-avatar">
              <img
                src={getCompanyLogo(companyUser)}
                alt={getCompanyDisplayName(companyUser)}
                onError={(e) => { e.target.src = '/default-avatar.svg'; }}
              />
              {isOwnCompany && (
                <button className="avatar-edit-btn">
                  <Camera size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-name-section">
              <h1 className="profile-name">
                {getCompanyDisplayName(companyUser)}
                <span className="verified-badge company-verified">✓</span>
              </h1>
              {companyUser.companyName && (
                <p className="profile-handle">@{companyUser.username}</p>
              )}
            </div>

            <div className="profile-bio">
              {getCompanyDescription(companyUser) && (
                <p>{getCompanyDescription(companyUser)}</p>
              )}
            </div>

            <div className="profile-meta">
              {getCompanyLocation(companyUser) && (
                <div className="meta-item">
                  <MapPin size={16} />
                  <span>{getCompanyLocation(companyUser)}</span>
                </div>
              )}
              <div className="meta-item">
                <Calendar size={16} />
                <span>Founded {formatJoinDate(companyUser.createdAt)}</span>
              </div>
              <div className="meta-item">
                <Briefcase size={16} />
                <span>Company</span>
              </div>
            </div>

            {/* Company Stats */}
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-number">{stats.posts}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.likes}</span>
                <span className="stat-label">Likes</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.comments}</span>
                <span className="stat-label">Comments</span>
              </div>
            </div>

            {/* Action Buttons */}
            {isOwnCompany ? (
              <div className="profile-actions">
                <button className="edit-profile-btn">
                  <Edit size={16} />
                  Edit Company
                </button>
                <button className="settings-btn">
                  <Settings size={16} />
                  Settings
                </button>
              </div>
            ) : (
              <div className="profile-actions">
                <button className="message-btn">
                  <Mail size={16} />
                  Contact
                </button>
                <button className="follow-btn">
                  <Star size={16} />
                  Follow Company
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Company Content */}
      <div className="profile-content">
        {/* Tab Navigation */}
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Posts ({posts.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            <ImageIcon size={16} />
            Posts ({posts.filter(p => p.postType === 'normal').length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'shorts' ? 'active' : ''}`}
            onClick={() => setActiveTab('shorts')}
          >
            <Zap size={16} />
            Shorts ({posts.filter(p => p.postType === 'ai_short').length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            <Video size={16} />
            Videos ({posts.filter(p => p.postType === 'ai_showcase').length})
          </button>
        </div>

        {/* Posts Content */}
        <div className="profile-posts">
          {filteredPosts.length === 0 ? (
            <div className="no-posts">
              <div className="no-posts-icon">
                {activeTab === 'shorts' ? <Zap size={48} /> : 
                 activeTab === 'videos' ? <Video size={48} /> :
                 <ImageIcon size={48} />}
              </div>
              <h3>
                {activeTab === 'shorts' ? 'No Shorts yet' :
                 activeTab === 'videos' ? 'No Videos yet' :
                 activeTab === 'posts' ? 'No Posts yet' :
                 'No Posts yet'}
              </h3>
              <p>
                {isOwnCompany ? 
                  `Start sharing your ${activeTab === 'shorts' ? 'shorts' : 
                                        activeTab === 'videos' ? 'videos' : 
                                        activeTab === 'posts' ? 'posts' : 'content'}!` :
                  `${getCompanyDisplayName(companyUser)} hasn't shared anything yet.`}
              </p>
              {isOwnCompany && (
                <a href="/create-post" className="create-post-btn">
                  Create Your First Post
                </a>
              )}
            </div>
          ) : (
            <div className="posts-grid">
              {filteredPosts.map((post) => (
                <div key={post._id} className="profile-post-item">
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
        </div>
      </div>
    </div>
  );
};

export default CompanyPage;
