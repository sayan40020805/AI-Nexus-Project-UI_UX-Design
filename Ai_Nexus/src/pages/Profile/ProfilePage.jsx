import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PostCard from '../../components/PostCard/PostCard';
import { getUserAvatar, getImageUrl, handleImageError, DEFAULT_AVATAR } from '../../utils/imageUtils';
import '../../styles/ProfilePage.css';
import { 
  User, 
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
  Briefcase
} from 'lucide-react';

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
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

  // Check if viewing own profile (handle both _id and id formats)
  const isOwnProfile = user && profileUser && (user._id === profileUser.id || user.id === profileUser.id);

  // Fetch user profile and posts
  const fetchUserProfile = async () => {
    if (!token || !id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch user posts and profile info
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
        setProfileUser(postsData.user);

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
          setProfileUser(userData);
        }
        throw new Error('Failed to fetch user posts');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUserProfile();
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

  const getUserDisplayName = (userData) => {
    if (!userData) return 'Unknown User';
    return userData.username || userData.companyName || 'User';
  };

  const getUserCoverPhoto = (userData) => {
    if (!userData) return null;
    return userData.coverPhoto || null;
  };

  const getUserBio = (userData) => {
    if (!userData) return '';
    return userData.bio || userData.companyDescription || '';
  };

  const getUserLocation = (userData) => {
    if (!userData) return '';
    return userData.location || '';
  };

  if (loading) {
    return (
      <div className="profile-page page-with-header">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page page-with-header">
        <div className="profile-error">
          <p>{error}</p>
          <button onClick={fetchUserProfile} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="profile-page page-with-header">
        <div className="profile-not-found">
          <User size={48} />
          <h3>User not found</h3>
          <p>The profile you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/')} className="back-button">
            Go Home
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
          {getUserCoverPhoto(profileUser) ? (
            <img
              src={getImageUrl(getUserCoverPhoto(profileUser))}
              alt={`${getUserDisplayName(profileUser)} cover photo`}
              className="cover-image"
              onError={(e) => handleImageError(e)}
            />
          ) : (
            <div className="cover-placeholder">
              <Camera size={24} />
              <span>Add Cover Photo</span>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="profile-info">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              <img
                src={getUserAvatar(profileUser)}
                alt={getUserDisplayName(profileUser)}
                onError={(e) => handleImageError(e)}
              />
              {isOwnProfile && (
                <button className="avatar-edit-btn">
                  <Camera size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-name-section">
              <h1 className="profile-name">
                {getUserDisplayName(profileUser)}
                {profileUser.role === 'company' && (
                  <span className="verified-badge">✓</span>
                )}
              </h1>
              {profileUser.username && profileUser.companyName && (
                <p className="profile-handle">@{profileUser.username}</p>
              )}
            </div>

            <div className="profile-bio">
              {getUserBio(profileUser) && (
                <p>{getUserBio(profileUser)}</p>
              )}
            </div>

            <div className="profile-meta">
              {getUserLocation(profileUser) && (
                <div className="meta-item">
                  <MapPin size={16} />
                  <span>{getUserLocation(profileUser)}</span>
                </div>
              )}
              <div className="meta-item">
                <Calendar size={16} />
                <span>Joined {formatJoinDate(profileUser.createdAt)}</span>
              </div>
              {profileUser.role === 'company' && (
                <div className="meta-item">
                  <Briefcase size={16} />
                  <span>Company</span>
                </div>
              )}
            </div>

            {/* Profile Stats */}
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
            {isOwnProfile ? (
              <div className="profile-actions">
                <button className="edit-profile-btn">
                  <Edit size={16} />
                  Edit Profile
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
                  Message
                </button>
                <button className="follow-btn">
                  <Users size={16} />
                  Follow
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
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
                {isOwnProfile ? 
                  `Start sharing your ${activeTab === 'shorts' ? 'shorts' : 
                                        activeTab === 'videos' ? 'videos' : 
                                        activeTab === 'posts' ? 'posts' : 'content'}!` :
                  `${getUserDisplayName(profileUser)} hasn't shared anything yet.`}
              </p>
              {isOwnProfile && (
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

export default ProfilePage;
