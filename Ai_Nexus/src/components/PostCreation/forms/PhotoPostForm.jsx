import React, { useState } from 'react';

const PhotoPostForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    image: null,
    caption: '',
    hashtags: '',
  });

  const [imagePreview, setImagePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, image: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.image && formData.caption.trim()) {
      const hashtags = formData.hashtags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag)
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`);

      onSubmit({
        postType: 'normal', // Map to backend expected type for photo posts (shows on home page)
        content: formData.caption,
        // Remove caption field as it doesn't exist in Post schema
        tags: hashtags, // Map hashtags → tags for backend
        media: { images: [formData.image] },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="post-form-container">
      <div className="form-section">
        <h3>📸 Photo</h3>
        
        {!imagePreview ? (
          <div className="upload-area" onClick={() => document.getElementById('photo-input').click()}>
            <div className="upload-placeholder">
              <span className="upload-icon">📷</span>
              <p>Click to upload photo</p>
              <small>JPG, PNG (max 10MB)</small>
            </div>
            <input
              type="file"
              id="photo-input"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" />
            <button type="button" onClick={removeImage} className="remove-btn">×</button>
          </div>
        )}
      </div>

      <div className="form-section">
        <h3>✍️ Caption</h3>
        <textarea
          name="caption"
          value={formData.caption}
          onChange={handleInputChange}
          placeholder="Write a caption..."
          required
          maxLength={2200}
          rows={4}
        />
        <div className="char-count">{formData.caption.length}/2200</div>
      </div>

      <div className="form-section">
        <h3>#️⃣ Hashtags</h3>
        <input
          type="text"
          name="hashtags"
          value={formData.hashtags}
          onChange={handleInputChange}
          placeholder="Add hashtags (separate with commas)"
        />
        <small>Example: photography, nature, travel</small>
      </div>

      <button 
        type="submit" 
        className="submit-btn"
        disabled={!formData.image || !formData.caption.trim()}
      >
        📸 Post Photo
      </button>
    </form>
  );
};

export default PhotoPostForm;
