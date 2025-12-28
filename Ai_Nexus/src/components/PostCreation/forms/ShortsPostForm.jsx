import React, { useState } from 'react';

const ShortsPostForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    video: null,
    caption: '',
    category: 'lifestyle',
  });

  const [videoPreview, setVideoPreview] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        const duration = video.duration;
        setVideoDuration(duration);
        
        if (duration > 60) {
          alert('Video must be 60 seconds or less for Shorts');
          return;
        }

        setFormData(prev => ({ ...prev, video: file }));
        
        const reader = new FileReader();
        reader.onload = (e) => {
          setVideoPreview(e.target.result);
        };
        reader.readAsDataURL(file);
      };

      video.src = URL.createObjectURL(file);
    }
  };

  const removeVideo = () => {
    setFormData(prev => ({ ...prev, video: null }));
    setVideoPreview(null);
    setVideoDuration(0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.video && formData.caption.trim()) {
      onSubmit({
        postType: 'ai_short', // Map to backend expected type for shorts
        content: formData.caption,
        // Remove caption field as it doesn't exist in Post schema
        tags: [formData.category], // Map category to tags array for backend
        media: { video: formData.video },
        // Remove duration field as it doesn't exist in Post schema
      });
    }
  };

  const categories = [
    { value: 'lifestyle', label: '🏠 Lifestyle' },
    { value: 'technology', label: '💻 Technology' },
    { value: 'education', label: '📚 Education' },
    { value: 'entertainment', label: '🎭 Entertainment' },
    { value: 'comedy', label: '😄 Comedy' },
    { value: 'music', label: '🎵 Music' },
    { value: 'food', label: '🍕 Food' },
    { value: 'travel', label: '✈️ Travel' },
    { value: 'fitness', label: '💪 Fitness' },
    { value: 'business', label: '💼 Business' },
    { value: 'art', label: '🎨 Art' },
    { value: 'other', label: '📌 Other' },
  ];

  return (
    <form onSubmit={handleSubmit} className="post-form-container">
      <div className="form-section">
        <h3>🎬 Shorts Video</h3>
        
        {!videoPreview ? (
          <div className="upload-area" onClick={() => document.getElementById('shorts-input').click()}>
            <div className="upload-placeholder">
              <span className="upload-icon">🎥</span>
              <p>Click to upload video</p>
              <small>Max 60 seconds, max 100MB</small>
              <div className="duration-warning">⏱️ Must be 60 seconds or less</div>
            </div>
            <input
              type="file"
              id="shorts-input"
              accept="video/*"
              onChange={handleVideoChange}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div className="video-preview">
            <video src={videoPreview} controls />
            <button type="button" onClick={removeVideo} className="remove-btn">×</button>
            <div className="video-info">
              <p>Duration: {Math.floor(videoDuration)}s</p>
            </div>
          </div>
        )}
      </div>

      <div className="form-section">
        <h3>✍️ Caption</h3>
        <textarea
          name="caption"
          value={formData.caption}
          onChange={handleInputChange}
          placeholder="What's this Shorts about?"
          required
          maxLength={500}
          rows={3}
        />
        <div className="char-count">{formData.caption.length}/500</div>
      </div>

      <div className="form-section">
        <h3>📂 Category</h3>
        <select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
        >
          {categories.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <button 
        type="submit" 
        className="submit-btn"
        disabled={!formData.video || !formData.caption.trim() || videoDuration > 60}
      >
        🎬 Post Shorts
      </button>
      
      {videoDuration > 60 && (
        <p className="error-message">⚠️ Video must be 60 seconds or less</p>
      )}
    </form>
  );
};

export default ShortsPostForm;
