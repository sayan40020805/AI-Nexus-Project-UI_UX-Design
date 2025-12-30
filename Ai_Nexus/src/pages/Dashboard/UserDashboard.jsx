import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FeedContext } from '../../context/FeedContext';
import PostCard from '../../components/PostCard/PostCard';
import { getImageUrl, DEFAULT_AVATAR } from '../../utils/imageUtils';
import { usePostInteractions } from '../../hooks/usePostInteractions';
import './Dashboard.css';

const UserDashboard = () => {
  const { user, token } = useAuth();
  const feedCtx = useContext(FeedContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    bio: '',
    profilePicture: '',
    coverPhoto: ''
  });

  // Fetch user's posts and profile data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !token) return;
      
      try {
        setLoading(true);
        
        // Fetch user profile data (avoid cached 304 responses)
        const profileResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        });

        if (profileResponse.ok) {
          const profileResult = await profileResponse.json();
          const userData = profileResult.user || {};
          setProfileData({
            username: userData.username || user?.username || 'User',
            email: userData.email || user?.email || '',
            bio: userData.bio || 'AI enthusiast exploring the future of technology',
            profilePicture: userData.profilePicture || user?.profilePicture || '',
            coverPhoto: userData.coverPhoto || user?.coverPhoto || ''
          });
        }

        // Fetch user's posts with high limit to get ALL posts
        let postsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/user/posts?limit=100`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        });

        // If server responds with 304 Not Modified (often due to caching proxies), force a fresh fetch
        if (postsResponse && postsResponse.status === 304) {
          console.log('📋 Dashboard - Received 304 for /api/user/posts, re-fetching with no-store');
          postsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/user/posts?limit=100`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            cache: 'no-store'
          });
        }

        console.log('📋 Dashboard - Posts API response status:', postsResponse.status);
        
        if (postsResponse.ok) {
          const postsResult = await postsResponse.json();
          console.log('📋 Dashboard - Posts API result:', {
            postsCount: postsResult.posts?.length || 0,
            pagination: postsResult.pagination
          });
          
          const userPosts = postsResult.posts || [];
          
          // Format posts for PostCard compatibility
          const formattedPosts = userPosts.map((post, index) => {
            console.log(`📋 Dashboard - Processing post ${index + 1}:`, {
              id: post._id,
              content: post.content?.substring(0, 30)
            });
            return {
              _id: post._id || post.id,
              id: post._id || post.id,
              content: post.content,
              title: post.title,
              postType: post.postType || 'normal',
              author: {
                _id: user._id,
                id: user._id,
                username: userData.username || user?.username || 'User',
                displayName: userData.username || user?.username || 'User',
                profilePicture: userData.profilePicture || user?.profilePicture || '',
                role: user?.role || 'user'
              },
              media: post.media || { images: [], video: '', document: '' },
              mediaList: post.mediaList || [],
              likes: post.likes || [],
              likesCount: post.likesCount || post.likes?.length || 0,
              comments: post.comments || [],
              commentsCount: post.commentsCount || post.comments?.length || 0,
              shares: post.shares || [],
              sharesCount: post.sharesCount || post.shares?.length || 0,
              createdAt: post.createdAt,
              updatedAt: post.updatedAt,
              isLiked: post.isLiked || false,
              isOwner: true,
              isPublic: post.isPublic !== false
            };
          });
          
          console.log('📋 Dashboard - Final formatted posts:', formattedPosts.length);
          
          // Only set posts if we have them and state is empty (avoid overwriting with empty)
          if (formattedPosts.length > 0) {
            setPosts(formattedPosts);
          } else {
            console.log('📋 Dashboard - No posts found in API response');
          }
        } else {
          const errorText = await postsResponse.text();
          console.error('📋 Dashboard - Posts API error:', postsResponse.status, errorText);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback to basic user data if API fails
        setProfileData({
          username: user?.username || 'User',
          email: user?.email || '',
          bio: user?.bio || 'AI enthusiast exploring the future of technology',
          profilePicture: user?.profilePicture || '',
          coverPhoto: user?.coverPhoto || ''
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
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
          id: result.post._id,
          content: newPost,
          title: result.post.title,
          postType: result.post.postType || 'normal',
          author: {
            _id: user._id,
            id: user._id,
            username: user?.username || 'User',
            displayName: user?.username || 'User',
            profilePicture: user?.profilePicture || '',
            role: user?.role || 'user'
          },
          media: result.post.media || { images: [], video: '', document: '' },
          mediaList: result.post.mediaList || [],
          likes: [],
          likesCount: 0,
          comments: [],
          commentsCount: 0,
          shares: [],
          sharesCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isLiked: false,
          isOwner: true,
          isPublic: true
        };

        setPosts([newPostData, ...posts]);
        setNewPost('');
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('username', profileData.username);
      formData.append('bio', profileData.bio);
      
      if (profileData.profilePicture instanceof File) {
        formData.append('profilePicture', profileData.profilePicture);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setProfileData(prev => ({
          ...prev,
          username: result.user.username,
          bio: result.user.bio,
          profilePicture: result.user.profilePicture
        }));
        setEditingProfile(false);
        alert('Profile updated successfully!');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData(prev => ({
        ...prev,
        profilePicture: file
      }));
    }
  };

  // Listen for new posts added to the global feed and add them to dashboard if authored by current user
  useEffect(() => {
    if (!feedCtx || !feedCtx.posts || !user) return;

    const latest = feedCtx.posts[0];
    if (!latest) return;

    const latestAuthorId = latest.author?._id || latest.author;
    const currentUserId = user._id || user.id || user;

    try {
      // Only add to existing posts if the latest post is from the current user
      // and we already have posts loaded (avoid overwriting all posts)
      if (latestAuthorId && currentUserId && latestAuthorId.toString() === currentUserId.toString()) {
        setPosts(prev => {
          // If we have no posts yet, use all feed posts from current user
          if (prev.length === 0) {
            return feedCtx.posts.filter(p => {
              const authorId = p.author?._id || p.author;
              return authorId?.toString() === currentUserId.toString();
            });
          }
          // Otherwise, just prepend the latest post if not duplicate
          if (prev.some(p => p._id === latest._id || p.id === latest._id)) return prev;
          return [latest, ...prev];
        });
      }
    } catch (err) {
      // Defensive: if author shape differs, ignore
      console.warn('Feed integration check failed:', err.message);
    }
  }, [feedCtx?.posts, user]);

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

  // Helper to get full image URL or default
  const getCoverPhoto = () => {
    if (profileData.coverPhoto) {
      return profileData.coverPhoto.startsWith('http') ? profileData.coverPhoto : profileData.coverPhoto;
    }
    return 'https://cdn.pixabay.com/photo/2023/07/26/16/09/ai-generated-8151978_1280.png';
  };

  const getProfilePicture = () => {
    if (profileData.profilePicture) {
      return profileData.profilePicture.startsWith('http') ? profileData.profilePicture : profileData.profilePicture;
    }
    return DEFAULT_AVATAR;
  };

  return (
    <div className="dashboard-container">
      {/* Cover Photo and Profile Section */}
      <div 
        className="cover-photo" 
        style={{ 
          backgroundImage: `url(${getCoverPhoto()})` 
        }}
      >
        <img 
          src={getProfilePicture()} 
          alt="Profile" 
          className="profile-pic-large" 
          onError={(e) => {
            e.target.src = DEFAULT_AVATAR;
          }}
        />
      </div>

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h1 className="user-name">{profileData.username}</h1>
        <p className="username">@{profileData.email}</p>
        <p className="user-bio">{profileData.bio}</p>
        <div className="user-stats">
          <span>0 Followers</span>
          <span>0 Following</span>
        </div>
        <div className="profile-actions">
          <button className="follow-button" onClick={() => setEditingProfile(true)}>Edit Profile</button>
          <button className="message-button" onClick={() => setEditingProfile(true)}>Settings</button>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {editingProfile && (
        <div className="profile-edit-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Profile</h3>
              <button className="close-btn" onClick={() => setEditingProfile(false)}>&times;</button>
            </div>
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  rows="3"
                  maxLength="200"
                />
                <span className="char-count">{profileData.bio.length}/200</span>
              </div>
              <div className="form-group">
                <label>Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
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
            {posts.length === 0 ? (
              <div className="no-posts-message" style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                color: 'var(--text-muted)',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                marginTop: '1rem'
              }}>
                <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No posts yet</p>
                <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Share your first AI discovery or update above!</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id || post._id}
                  post={post}
                  onPostUpdate={(updatedPost) => {
                    setPosts(prev => prev.map(p => (p.id || p._id) === (updatedPost.id || updatedPost._id) ? updatedPost : p));
                  }}
                  onPostDelete={(deletedPostId) => {
                    setPosts(prev => prev.filter(p => (p.id || p._id) !== deletedPostId));
                  }}
                  showComments={false}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
