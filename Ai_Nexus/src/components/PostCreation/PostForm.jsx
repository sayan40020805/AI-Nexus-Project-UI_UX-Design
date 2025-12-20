
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PostTypeSelector from './PostTypeSelector';
import AiNewsForm from './forms/AiNewsForm';
import AiShortsForm from './forms/AiShortsForm';
import AiModelsForm from './forms/AiModelsForm';
import AiShowcaseForm from './forms/AiShowcaseForm';
import PostTypeAnimation from './PostTypeAnimation';
import './PostCreation.css';

const PostForm = () => {
  const [selectedType, setSelectedType] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Post type mapping for navigation
  const getPostTypeNavigation = (postType) => {
    const typeMap = {
      'ai_news': '/news',
      'ai_shorts': '/shorts',
      'ai_models': '/models',
      'ai_showcase': '/showcase'
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

    // Role-based restrictions
    const restrictedTypesForUsers = ['ai_news', 'career', 'event'];
    if (user.role === 'user' && restrictedTypesForUsers.includes(data.type)) {
      alert('Only company accounts can create this type of post');
      return;
    }

    setIsSubmitting(true);
    setFormSubmitted(true);

    try {
      const formData = new FormData();
      
      // Add post data
      Object.keys(data).forEach(key => {
        if (key !== 'media') {
          formData.append(key, data[key]);
        }
      });

      // Add media files if present
      if (data.media) {
        if (Array.isArray(data.media)) {
          data.media.forEach((file, index) => {
            formData.append(`media_${index}`, file);
          });
        } else {
          formData.append('media', data.media);
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
        throw new Error(errorData.msg || 'Failed to create post');
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
      case 'ai_news':
        return <AiNewsForm {...formProps} />;
      case 'ai_shorts':
        return <AiShortsForm {...formProps} />;
      case 'ai_models':
        return <AiModelsForm {...formProps} />;
      case 'ai_showcase':
        return <AiShowcaseForm {...formProps} />;
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

      <div className="post-form-layout">
        <div className="post-form-left">
          <PostTypeSelector selectedType={selectedType} onTypeChange={handleTypeChange} />

          {selectedType && (
            <div className={`form-wrapper ${formSubmitted ? 'submitting' : ''}`}>
              {renderForm()}
            </div>
          )}
        </div>

        <div className="post-form-right">
          <PostTypeAnimation selectedType={selectedType} />
        </div>
      </div>
    </div>
  );
};

export default PostForm;
