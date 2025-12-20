import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FeedContext } from '../../context/FeedContext';
import PostCard from '../../components/PostCard/PostCard';
import { usePostInteractions } from '../../hooks/usePostInteractions';
import './Dashboard.css';

const UserDashboard = () => {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    bio: '',
    profilePicture: ''
  });

  // Fetch user's posts and profile data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !token) return;
      
      try {
        setLoading(true);
        
        // Fetch user profile data
        const profileResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (profileResponse.ok) {
          const profileResult = await profileResponse.json();
          setProfileData({
            username: profileResult.user?.username || user?.username || 'User',
            email: profileResult.user?.email || user?.email || '',
            bio: profileResult.user?.bio || 'AI enthusiast exploring the future of technology',
            profilePicture: profileResult.user?.profilePicture || user?.profilePicture || ''
          });
        }

        // Fetch user's posts
        const postsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/user/posts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (postsResponse.ok) {
          const postsResult = await postsResponse.json();
          const userPosts = postsResult.posts || [];
          
          // Format posts for display
          const formattedPosts = userPosts.map(post => ({
            id: post._id,
            author: user?.username || 'User',
            authorPic: user?.profilePicture || '/default-avatar.svg',
            content: post.content,
            timestamp: new Date(post.createdAt).toLocaleDateString(),
            image: post.media?.images?.[0] || '',
            likes: post.likes?.length || 0,
            comments: post.comments?.length || 0,
          }));
          
          setPosts(formattedPosts);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback to basic user data if API fails
        setProfileData({
          username: user?.username || 'User',
          email: user?.email || '',
          bio: 'AI enthusiast exploring the future of technology',
          profilePicture: user?.profilePicture || ''
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
          id: result.post._id,
          author: user?.username || 'User',
          authorPic: user?.profilePicture || '/default-avatar.svg',
          content: newPost,
          timestamp: 'Just now',
          image: '',
          likes: 0,
          comments: [],
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

  return (
    <div className="dashboard-container">
      {/* Cover Photo and Profile Section */}
      <div 
        className="cover-photo" 
        style={{ 
          backgroundImage: `url(${profileData.profilePicture ? profileData.profilePicture : 'https://cdn.pixabay.com/photo/2023/07/26/16/09/ai-generated-8151978_1280.png'})` 
        }}
      >
        <img 
          src={profileData.profilePicture || '/default-avatar.svg'} 
          alt="Profile" 
          className="profile-pic-large" 
          onError={(e) => {
            e.target.src = '/default-avatar.svg';
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
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onPostUpdate={(updatedPost) => {
                  setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
                }}
                onPostDelete={(deletedPostId) => {
                  setPosts(prev => prev.filter(p => p._id !== deletedPostId));
                }}
                showComments={false}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
