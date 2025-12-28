import React, { useState } from 'react';

const VideoPostForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    video: null,
    thumbnail: null,
    title: '',
    description: '',
  });

  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setFormData(prev => ({ ...prev, video: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, thumbnail: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeVideo = () => {
    setFormData(prev => ({ ...prev, video: null }));
    setVideoPreview(null);
  };

  const removeThumbnail = () => {
    setFormData(prev => ({ ...prev, thumbnail: null }));
    setThumbnailPreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.video && formData.title.trim() && formData.description.trim()) {
      const media = { video: formData.video };
      if (formData.thumbnail) {
        media.thumbnail = formData.thumbnail;
      }

      onSubmit({
        postType: 'ai_showcase', // Map to backend expected type for video posts
        content: `${formData.title}\n\n${formData.description}`,
        title: formData.title,
        // Remove description field as it doesn't exist in Post schema
        media,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="post-form-container">
      <div className="form-section">
        <h3>🎥 Video</h3>
        
        {!videoPreview ? (
          <div className="upload-area" onClick={() => document.getElementById('video-input').click()}>
            <div className="upload-placeholder">
              <span className="upload-icon">📹</span>
              <p>Click to upload video</p>
              <small>MP4, MOV, AVI (max 500MB)</small>
            </div>
            <input
              type="file"
              id="video-input"
              accept="video/*"
              onChange={handleVideoChange}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div className="video-preview">
            <video src={videoPreview} controls />
            <button type="button" onClick={removeVideo} className="remove-btn">×</button>
          </div>
        )}
      </div>

      <div className="form-section">
        <h3>🖼️ Thumbnail (Optional)</h3>
        
        {!thumbnailPreview ? (
          <div className="upload-area" onClick={() => document.getElementById('thumbnail-input').click()}>
            <div className="upload-placeholder">
              <span className="upload-icon">🖼️</span>
              <p>Add thumbnail</p>
              <small>JPG, PNG (optional)</small>
            </div>
            <input
              type="file"
              id="thumbnail-input"
              accept="image/*"
              onChange={handleThumbnailChange}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div className="thumbnail-preview">
            <img src={thumbnailPreview} alt="Thumbnail" />
            <button type="button" onClick={removeThumbnail} className="remove-btn">×</button>
          </div>
        )}
      </div>

      <div className="form-section">
        <h3>📝 Title</h3>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Give your video a title..."
          required
          maxLength={100}
        />
        <div className="char-count">{formData.title.length}/100</div>
      </div>

      <div className="form-section">
        <h3>📄 Description</h3>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe your video..."
          required
          maxLength={2000}
          rows={6}
        />
        <div className="char-count">{formData.description.length}/2000</div>
      </div>

      <button 
        type="submit" 
        className="submit-btn"
        disabled={!formData.video || !formData.title.trim() || !formData.description.trim()}
      >
        🎥 Post Video
      </button>
    </form>
  );
};

export default VideoPostForm;
