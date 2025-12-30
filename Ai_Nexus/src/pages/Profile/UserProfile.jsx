import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, Building2, MapPin, Link as LinkIcon, 
  Calendar, Image, Video, Heart, MessageCircle,
  Users, Settings, Check, Loader2, Grid, List
} from 'lucide-react';
import './UserProfile.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Custom hook for cursor-based pagination
function useCursorPagination(fetchFn, options = {}) {
  const { limit = 20 } = options;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(null);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const loadMore = useCallback(async (reset = false) => {
    if (loading) return;
    
    if (reset) {
      setData([]);
      setCursor(null);
      setHasMore(true);
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn(reset ? null : cursor, limit);
      
      if (reset) {
        setData(result.posts || []);
      } else {
        setData(prev => [...prev, ...(result.posts || [])]);
      }
      
      setHasMore(result.pagination?.hasMore || false);
      setCursor(result.pagination?.nextCursor || null);
      setTotal(result.pagination?.total || 0);
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cursor, limit, fetchFn, loading]);

  const reset = useCallback(() => loadMore(true), [loadMore]);

  return { data, loading, hasMore, error, total, cursor, loadMore, reset };
}

// Skeleton for profile header
const ProfileHeaderSkeleton = () => (
  <div className="profile-header-skeleton">
    <div className="skeleton-cover" />
    <div className="skeleton-content">
      <div className="skeleton-avatar" />
      <div className="skeleton-info">
        <div className="skeleton-line" style={{ width: '40%', height: '28px' }} />
        <div className="skeleton-line" style={{ width: '30%' }} />
        <div className="skeleton-line" style={{ width: '50%' }} />
      </div>
    </div>
  </div>
);

// Profile header component
const ProfileHeader = ({ profile, isOwnProfile, onEdit, onFollow, onMessage }) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  
  const avatar = profile.type === 'user' ? profile.profilePicture : profile.companyLogo;
  const name = profile.type === 'user' ? profile.username : profile.companyName;
  const displayName = profile.displayName || name;
  const bio = profile.bio;
  const isFollowing = profile.isFollowing;
  
  return (
    <div className="profile-header">
      <div className="profile-cover">
        {profile.coverPhoto && (
          <img 
            src={profile.coverPhoto.startsWith('http') ? profile.coverPhoto : `${baseUrl}${profile.coverPhoto}`}
            alt="Cover"
            className="cover-image"
          />
        )}
      </div>
      
      <div className="profile-info-section">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {avatar ? (
              <img 
                src={avatar.startsWith('http') ? avatar : `${baseUrl}${avatar}`}
                alt={displayName}
                onError={(e) => { e.target.src = '/default-avatar.svg'; }}
              />
            ) : (
              <div className="avatar-placeholder">
                {profile.type === 'user' ? <User size={40} /> : <Building2 size={40} />}
              </div>
            )}
          </div>
          {profile.verified && (
            <span className="verified-badge-large">✓</span>
          )}
        </div>
        
        <div className="profile-details">
          <div className="profile-names">
            <h1 className="profile-display-name">{displayName}</h1>
            {profile.type === 'user' && (
              <span className="profile-username">@{name}</span>
            )}
            {profile.verificationBadge && profile.verificationBadge !== 'none' && (
              <span className={`verification-badge ${profile.verificationBadge}`}>
                {profile.verificationBadge === 'verified' && '✓ Verified'}
                {profile.verificationBadge === 'premium' && '★ Premium'}
                {profile.verificationBadge === 'official' && '✔ Official'}
              </span>
            )}
          </div>
          
          {bio && <p className="profile-bio">{bio}</p>}
          
          <div className="profile-meta">
            {profile.location && (
              <span className="meta-item">
                <MapPin size={14} />
                {profile.location}
              </span>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="meta-item">
                <LinkIcon size={14} />
                Website
              </a>
            )}
            <span className="meta-item">
              <Calendar size={14} />
              Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          
          <div className="profile-stats">
            <div className="stat-item" onClick={() => {}}>
              <span className="stat-value">{profile.stats?.postsCount || 0}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{profile.stats?.followersCount || 0}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{profile.stats?.followingCount || 0}</span>
              <span className="stat-label">Following</span>
            </div>
          </div>
          
          {profile.mutualFollowersCount > 0 && (
            <div className="mutual-followers">
              <Users size={14} />
              <span>{profile.mutualFollowersCount} mutual followers</span>
            </div>
          )}
        </div>
        
        <div className="profile-actions">
          {isOwnProfile ? (
            <button className="action-button secondary" onClick={onEdit}>
              <Settings size={16} />
              Edit Profile
            </button>
          ) : (
            <>
              <button 
                className={`action-button ${isFollowing ? 'secondary' : 'primary'}`}
                onClick={onFollow}
              >
                {isFollowing ? (
                  <>
                    <Check size={16} />
                    Following
                  </>
                ) : 'Follow'}
              </button>
              <button className="action-button secondary" onClick={onMessage}>
                <MessageCircle size={16} />
                Message
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Tab navigation component
const ProfileTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'posts', label: 'Posts', icon: List },
    { id: 'media', label: 'Media', icon: Image },
    { id: 'likes', label: 'Likes', icon: Heart },
    { id: 'activity', label: 'Activity', icon: Grid }
  ];

  return (
    <div className="profile-tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <tab.icon size={18} />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

// Post card component (simplified)
const PostCard = ({ post }) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  
  const author = post.author;
  const authorName = author?.type === 'company' ? author.companyName : author?.username;
  const authorAvatar = author?.type === 'company' ? author.companyLogo : author?.profilePicture;
  
  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author">
          {authorAvatar ? (
            <img 
              src={authorAvatar.startsWith('http') ? authorAvatar : `${baseUrl}${authorAvatar}`}
              alt={authorName}
              className="author-avatar"
            />
          ) : (
            <div className="author-avatar-placeholder">
              {author?.type === 'company' ? <Building2 size={16} /> : <User size={16} />}
            </div>
          )}
          <div className="author-info">
            <span className="author-name">{authorName}</span>
            <span className="post-time">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      
      {post.title && <h3 className="post-title">{post.title}</h3>}
      
      <p className="post-content">
        {post.content.length > 200 
          ? `${post.content.substring(0, 200)}...` 
          : post.content}
      </p>
      
      {post.media?.images?.length > 0 && (
        <div className="post-media-grid">
          {post.media.images.slice(0, 4).map((img, idx) => (
            <img 
              key={idx}
              src={img.startsWith('http') ? img : `${baseUrl}${img}`}
              alt={`Media ${idx + 1}`}
              className="media-thumbnail"
            />
          ))}
        </div>
      )}
      
      <div className="post-stats">
        <span><Heart size={14} /> {post.likesCount || 0}</span>
        <span><MessageCircle size={14} /> {post.commentsCount || 0}</span>
      </div>
    </div>
  );
};

// Posts grid component
const PostsGrid = ({ posts, loading, hasMore, onLoadMore, mediaType }) => {
  if (loading && posts.length === 0) {
    return (
      <div className="posts-loading">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="post-skeleton">
            <div className="skeleton-line" style={{ width: '30%' }} />
            <div className="skeleton-block" />
            <div className="skeleton-line" style={{ width: '60%' }} />
          </div>
        ))}
      </div>
    );
  }
  
  if (posts.length === 0) {
    return (
      <div className="no-posts">
        <Grid size={48} />
        <h3>No posts yet</h3>
        <p>
          {mediaType === 'media' 
            ? 'This user hasn\'t shared any media yet.' 
            : 'When they post, it will show up here.'}
        </p>
      </div>
    );
  }
  
  return (
    <div className="posts-grid">
      {posts.map((post, index) => (
        <div key={post._id || index} className="post-grid-item">
          <PostCard post={post} />
        </div>
      ))}
      
      {hasMore && (
        <button className="load-more-posts" onClick={onLoadMore} disabled={loading}>
          {loading ? <Loader2 size={20} className="spin" /> : 'Load more'}
        </button>
      )}
    </div>
  );
};

const UserProfile = () => {
  // Route param is registered as :id in App.jsx — read it and alias to userId
  const { id: userId } = useParams();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  
  const currentUserId = localStorage.getItem('userId');
  const isOwnProfile = userId === currentUserId || !userId;
  const targetUserId = userId || currentUserId;
  
  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    if (!targetUserId) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE}/users/${targetUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        if (response.status === 403) {
          throw new Error('This profile is private');
        }
        throw new Error('Failed to load profile');
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [targetUserId, navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Fetch posts with cursor pagination
  const fetchPosts = useCallback(async (cursor, limit) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    let url = `${API_BASE}/users/${targetUserId}/posts?limit=${limit}`;
    if (cursor) {
      url += `&cursor=${encodeURIComponent(cursor)}`;
    }
    if (activeTab === 'media') {
      url += `&tab=media`;
    } else if (activeTab === 'likes') {
      url += `&tab=likes`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load posts');
    }

    return response.json();
  }, [targetUserId, activeTab]);

  const { data: posts, loading: postsLoading, hasMore, loadMore, reset } = useCursorPagination(fetchPosts);

  // Refetch when tab changes
  useEffect(() => {
    reset();
  }, [activeTab, reset]);

  // Handle follow
  const handleFollow = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE}/follow/${profile.id}`, {
        method: profile.isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setProfile(prev => ({
          ...prev,
          isFollowing: !prev.isFollowing,
          stats: {
            ...prev.stats,
            followersCount: prev.stats.followersCount + (prev.isFollowing ? -1 : 1)
          }
        }));
      }
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  // Handle edit profile
  const handleEditProfile = () => {
    navigate('/settings/profile');
  };

  // Handle message
  const handleMessage = () => {
    navigate(`/messages?user=${profile.id}`);
  };

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Trigger global search open event
        window.dispatchEvent(new CustomEvent('openSearch'));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading && !profile) {
    return (
      <div className="user-profile-page">
        <div className="profile-container">
          <ProfileHeaderSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile-page">
        <div className="error-state">
          <User size={48} />
          <h2>Oops!</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)}>Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      <div className="profile-container">
        <ProfileHeader 
          profile={profile}
          isOwnProfile={isOwnProfile}
          onEdit={handleEditProfile}
          onFollow={handleFollow}
          onMessage={handleMessage}
        />
        
        <ProfileTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        
        <PostsGrid 
          posts={posts}
          loading={postsLoading}
          hasMore={hasMore}
          onLoadMore={loadMore}
          mediaType={activeTab === 'media' ? 'media' : 'posts'}
        />
      </div>
    </div>
  );
};

export default UserProfile;

