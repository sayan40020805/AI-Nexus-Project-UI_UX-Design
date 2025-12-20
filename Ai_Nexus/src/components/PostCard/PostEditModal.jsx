import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Upload, 
  Image, 
  Video, 
  FileText, 
  Link,
  Save,
  Trash2
} from 'lucide-react';
import './PostEditModal.css';

/**
 * PostEditModal Component
 * 
 * Modal for editing existing posts with:
 * - Content editing with rich text support
 * - Media upload/management
 * - Post type and visibility settings
 * - Real-time preview
 * - Form validation
 * - Auto-save functionality
 */
const PostEditModal = ({ post, onClose, onUpdate }) => {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [content, setContent] = useState(post?.content || '');
  const [title, setTitle] = useState(post?.title || '');
  const [postType, setPostType] = useState(post?.postType || 'normal');
  const [isPublic, setIsPublic] = useState(post?.isPublic !== false);
  const [media, setMedia] = useState({
    images: post?.media?.images || [],
    video: post?.media?.video || '',
    document: post?.media?.document || ''
  });
  const [link, setLink] = useState(post?.link || '');
  const [location, setLocation] = useState(post?.location || '');
  const [eventDate, setEventDate] = useState(
    post?.eventDate ? new Date(post.eventDate).toISOString().split('T')[0] : ''
  );
  const [tags, setTags] = useState(post?.tags?.join(', ') || '');
  
  // Media management state
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [removedImages, setRemovedImages] = useState([]);

  // Character limits
  const CONTENT_LIMIT = 2000;
  const TITLE_LIMIT = 100;
  const TAGS_LIMIT = 10;

  // Validate form
  const validateForm = () => {
    if (!content.trim()) {
      setError('Content is required');
      return false;
    }
    if (content.length > CONTENT_LIMIT) {
      setError(`Content must be less than ${CONTENT_LIMIT} characters`);
      return false;
    }
    if (title.length > TITLE_LIMIT) {
      setError(`Title must be less than ${TITLE_LIMIT} characters`);
      return false;
    }
    return true;
  };

  // Handle content change with character counter
  const handleContentChange = (e) => {
    const value = e.target.value;
    if (value.length <= CONTENT_LIMIT) {
      setContent(value);
      setError(null);
    }
  };

  // Handle title change with character counter
  const handleTitleChange = (e) => {
    const value = e.target.value;
    if (value.length <= TITLE_LIMIT) {
      setTitle(value);
      setError(null);
    }
  };

  // Handle tags change
  const handleTagsChange = (e) => {
    const value = e.target.value;
    const tagList = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    if (tagList.length <= TAGS_LIMIT) {
      setTags(value);
    }
  };

  // Handle media upload
  const handleMediaUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    try {
      setUploadingMedia(true);
      setError(null);

      for (const file of files) {
        const formData = new FormData();
        formData.append('media', file);

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          const mediaUrl = result.url;

          if (type === 'image') {
            setMedia(prev => ({
              ...prev,
              images: [...(prev.images || []), mediaUrl]
            }));
          } else if (type === 'video') {
            setMedia(prev => ({
              ...prev,
              video: mediaUrl
            }));
          } else if (type === 'document') {
            setMedia(prev => ({
              ...prev,
              document: mediaUrl
            }));
          }
        } else {
          throw new Error(`Failed to upload ${type}`);
        }
      }
    } catch (err) {
      setError(`Failed to upload media: ${err.message}`);
    } finally {
      setUploadingMedia(false);
    }
  };

  // Handle image removal
  const handleRemoveImage = (index) => {
    const imageToRemove = media.images[index];
    setRemovedImages(prev => [...prev, imageToRemove]);
    setMedia(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Handle video removal
  const handleRemoveVideo = () => {
    setMedia(prev => ({
      ...prev,
      video: ''
    }));
  };

  // Handle document removal
  const handleRemoveDocument = () => {
    setMedia(prev => ({
      ...prev,
      document: ''
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const updateData = {
        content: content.trim(),
        title: title.trim(),
        postType,
        isPublic,
        media,
        link: link.trim(),
        location: location.trim(),
        eventDate: eventDate || null,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      // Remove null/undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null || updateData[key] === '') {
          delete updateData[key];
        }
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/posts/${post._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const updatedPost = await response.json();
        onUpdate(updatedPost);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to update post');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  // Post type options
  const postTypeOptions = [
    { value: 'normal', label: 'Normal Post' },
    { value: 'news', label: 'AI News' },
    { value: 'shorts', label: 'AI Shorts' },
    { value: 'model', label: 'AI Model' },
    { value: 'showcase', label: 'AI Showcase' },
    { value: 'career', label: 'Career' },
    { value: 'event', label: 'Event' }
  ];

  return (
    <div className="post-edit-modal-overlay" onClick={handleClose}>
      <div className="post-edit-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2>Edit Post</h2>
          <button 
            onClick={handleClose}
            disabled={isLoading}
            className="close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="edit-post-form">
          {/* Post Type Selection */}
          <div className="form-group">
            <label>Post Type</label>
            <select 
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
              className="form-select"
            >
              {postTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          {postType !== 'normal' && (
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="Enter post title..."
                className="form-input"
                maxLength={TITLE_LIMIT}
              />
              <div className="char-counter">
                {title.length}/{TITLE_LIMIT}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="form-group">
            <label>Content *</label>
            <textarea
              value={content}
              onChange={handleContentChange}
              placeholder="What's on your mind?"
              className="form-textarea"
              rows="6"
              maxLength={CONTENT_LIMIT}
              required
            />
            <div className="char-counter">
              {content.length}/{CONTENT_LIMIT}
            </div>
          </div>

          {/* Media Section */}
          <div className="form-group">
            <label>Media</label>
            
            {/* Image Upload */}
            <div className="media-upload-section">
              <label className="upload-btn">
                <Image size={16} />
                Add Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleMediaUpload(e, 'image')}
                  style={{ display: 'none' }}
                  disabled={uploadingMedia}
                />
              </label>

              {/* Video Upload */}
              <label className="upload-btn">
                <Video size={16} />
                Add Video
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleMediaUpload(e, 'video')}
                  style={{ display: 'none' }}
                  disabled={uploadingMedia}
                />
              </label>

              {/* Document Upload */}
              <label className="upload-btn">
                <FileText size={16} />
                Add Document
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => handleMediaUpload(e, 'document')}
                  style={{ display: 'none' }}
                  disabled={uploadingMedia}
                />
              </label>
            </div>

            {/* Upload Progress */}
            {uploadingMedia && (
              <div className="upload-progress">
                Uploading media...
              </div>
            )}

            {/* Media Preview */}
            <div className="media-preview">
              {/* Images */}
              {media.images && media.images.length > 0 && (
                <div className="images-grid">
                  {media.images.map((image, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={image} alt={`Upload ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="remove-media-btn"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Video */}
              {media.video && (
                <div className="video-preview">
                  <video src={media.video} controls />
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    className="remove-media-btn"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}

              {/* Document */}
              {media.document && (
                <div className="document-preview">
                  <FileText size={20} />
                  <span>Document uploaded</span>
                  <button
                    type="button"
                    onClick={handleRemoveDocument}
                    className="remove-media-btn"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Additional Fields */}
          <div className="form-row">
            {/* Link */}
            <div className="form-group half">
              <label>External Link</label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
                className="form-input"
              />
            </div>

            {/* Location */}
            <div className="form-group half">
              <label>Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="form-input"
              />
            </div>
          </div>

          {/* Event Date */}
          {postType === 'event' && (
            <div className="form-group">
              <label>Event Date</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="form-input"
              />
            </div>
          )}

          {/* Tags */}
            <div className="form-group">
              <label>Tags</label>
              <input
                type="text"
                value={tags}
                onChange={handleTagsChange}
                placeholder="AI, Machine Learning, Deep Learning"
                className="form-input"
              />
              <small>Separate tags with commas (max {TAGS_LIMIT})</small>
            </div>

            {/* Visibility */}
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                Make this post public
              </label>
            </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !content.trim()}
              className="save-btn"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostEditModal;
