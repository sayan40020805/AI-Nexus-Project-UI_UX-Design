
import React, { useState, useContext } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FeedContext } from '../../context/FeedContext';
import PostTypeSelector from './PostTypeSelector';
import PhotoPostForm from './forms/PhotoPostForm';
import ShortsPostForm from './forms/ShortsPostForm';
import VideoPostForm from './forms/VideoPostForm';
import AIModelPostForm from './forms/AIModelPostForm';
import PostTypeAnimation from './PostTypeAnimation';
import './PostCreation.css';

const PostForm = () => {
  const [selectedType, setSelectedType] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, token } = useAuth();
  const feedCtx = useContext(FeedContext) || {};
  const { addPost, refreshFeed } = feedCtx;
  const navigate = useNavigate();

  // Post type mapping for navigation
  const getPostTypeNavigation = (postType) => {
    const typeMap = {
      'normal': '/', // Photo posts show on home page
      'ai_short': '/shorts', // Shorts show on shorts page
      'ai_showcase': '/', // Video showcase shows on home page  
      'ai_models': '/models' // AI Models show on models page
    };
    return typeMap[postType] || '/';
  };

  const handleTypeChange = (typeId) => {
    setSelectedType(typeId);
    setFormSubmitted(false);
  };

  const handleFormSubmit = async (data) => {
    if (!token || !user) {
      alert('Please log in to create a post');
      return;
    }

    // Role-based restrictions (currently no restrictions for new post types)
    // All users can create photo, shorts, video, and ai_model posts
    const restrictedTypesForUsers = [];
    if (user.role === 'user' && restrictedTypesForUsers.includes(data.postType)) {
      alert('Only company accounts can create this type of post');
      return;
    }

    setIsSubmitting(true);
    setFormSubmitted(true);

    try {
      const formData = new FormData();
      
      // Add post data and files (append File objects correctly)
      Object.keys(data).forEach(key => {
        const val = data[key];

        // If value is a File (browser File API), append it directly
        if (val instanceof File) {
          formData.append(key, val);
        } else if (Array.isArray(val) && val.length && val[0] instanceof File) {
          // Array of files
          val.forEach((file) => formData.append(key, file));
        } else {
          // Fallback: append primitive values
          formData.append(key, val);
        }
      });

      // Also support an explicit `media` array if provided by some forms
      if (data.media && Array.isArray(data.media)) {
        data.media.forEach((file) => {
          if (file instanceof File) formData.append('media', file);
        });
      }

      // Support `media.images` object shape (used by NormalPostForm)
      if (data.media && data.media.images && Array.isArray(data.media.images)) {
        data.media.images.forEach((file) => {
          if (file instanceof File) formData.append('media', file);
        });
      }

      // Support `media.video` object shape (used by ShortsPostForm and VideoPostForm)
      if (data.media && data.media.video) {
        if (data.media.video instanceof File) {
          formData.append('media', data.media.video);
        }
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();

        // Normalize result.post so frontend components that expect `media.images` or `media.video` render correctly
        let createdPost = result?.post || null;
        if (createdPost) {
          // If backend provided mediaList but not media.images/video, map them into media
          if (!createdPost.media) createdPost.media = {};
          if ((!createdPost.media.images || createdPost.media.images.length === 0) && Array.isArray(createdPost.mediaList)) {
            const firstImage = createdPost.mediaList.find(m => m.type === 'image');
            const firstVideo = createdPost.mediaList.find(m => m.type === 'video');
            if (firstImage) createdPost.media.images = [firstImage.url];
            if (firstVideo) createdPost.media.video = firstVideo.url;
          }
        }

        // Add created post to feed (if FeedContext available)
        if (createdPost && typeof addPost === 'function') {
          addPost(createdPost);
        } else if (typeof refreshFeed === 'function') {
          // fallback: refresh feed
          refreshFeed();
        }

        // Show success message
        alert(`Post created successfully!\n\nType: ${data.type}`);
        
        // Navigate to appropriate page based on post type
        const navigateTo = getPostTypeNavigation(data.type);
        navigate(navigateTo);
        
        // Reset form
        setSelectedType(null);
        setFormSubmitted(false);
      } else {
        const errorData = await response.json();
        console.error('Post creation failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        // Enhanced error messages
        let errorMessage = 'Failed to create post';
        if (errorData.msg) {
          errorMessage = errorData.msg;
        } else if (errorData.validationErrors) {
          errorMessage = `Validation error: ${errorData.validationErrors.map(e => e.field + ': ' + e.message).join(', ')}`;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Post creation error:', error);
      alert(`Error creating post: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderForm = () => {
    const formProps = { onSubmit: handleFormSubmit };

    switch (selectedType) {
      case 'photo':
        return <PhotoPostForm {...formProps} />;
      case 'shorts':
        return <ShortsPostForm {...formProps} />;
      case 'video':
        return <VideoPostForm {...formProps} />;
      case 'ai_model':
        return <AIModelPostForm {...formProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="post-form-container">
      <div className="post-form-header">
        <h1>Create a Post</h1>
        <p>Share your thoughts and content with the community</p>
      </div>

      <PostTypeSelector selectedType={selectedType} onTypeChange={handleTypeChange} />

      {selectedType && (
        <div className="form-section">
          {renderForm()}
        </div>
      )}

      <PostTypeAnimation selectedType={selectedType} />
    </div>
  );
};

export default PostForm;
