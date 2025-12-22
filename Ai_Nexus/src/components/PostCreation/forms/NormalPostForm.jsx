import React, { useState } from 'react';

const NormalPostForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    content: '',
    feeling: '',
    location: '',
    tags: '',
    image: null,
    privacy: 'public',
  });

  const [imagePreview, setImagePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
      
      // Create preview
      const preview = {
        file,
        url: URL.createObjectURL(file),
        name: file.name
      };
      setImagePreview(preview);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.content.trim()) {
      onSubmit({
        postType: 'normal',
        content: formData.content,
        feeling: formData.feeling,
        location: formData.location,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        media: formData.image ? { images: [formData.image] } : {},
        privacy: formData.privacy,
      });
    }
  };

  const feelingOptions = [
    'feeling happy', 'feeling excited', 'feeling grateful', 'feeling inspired',
    'feeling focused', 'feeling creative', 'feeling accomplished', 'feeling optimistic'
  ];

  return (
    <form className="post-form normal-post-form" onSubmit={handleSubmit}>
      {/* Main content area */}
      <div className="form-group">
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          placeholder="What's on your mind?"
          required
          maxLength={5000}
          rows={4}
          className="content-textarea main-textarea"
        />
        <span className="char-count">{formData.content.length}/5000</span>
      </div>

      {/* Feeling/Activity */}
      <div className="form-group">
        <div className="input-with-icon">
          <span className="input-icon">😊</span>
          <input
            type="text"
            id="feeling"
            name="feeling"
            value={formData.feeling}
            onChange={handleInputChange}
            placeholder="How are you feeling?"
            list="feeling-options"
            className="feeling-input"
          />
          <datalist id="feeling-options">
            {feelingOptions.map(feeling => (
              <option key={feeling} value={feeling} />
            ))}
          </datalist>
        </div>
      </div>

      {/* Location */}
      <div className="form-group">
        <div className="input-with-icon">
          <span className="input-icon">📍</span>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Add location"
            className="location-input"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="form-group">
        <div className="input-with-icon">
          <span className="input-icon">#</span>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="Add tags (separate with commas)"
            className="tags-input"
          />
        </div>
      </div>

      {/* Image upload */}
      <div className="form-group">
        <label htmlFor="image" className="image-upload-label">
          <span className="upload-icon">📷</span>
          Add Photo
        </label>
        <input
          type="file"
          id="image"
          name="image"
          onChange={handleImageChange}
          accept="image/*"
          className="file-input hidden"
        />
        
        {imagePreview && (
          <div className="image-preview-item">
            <img
              src={imagePreview.url}
              alt={imagePreview.name}
              className="preview-thumbnail"
            />
            <button
              type="button"
              onClick={removeImage}
              className="remove-image-btn"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Privacy settings */}
      <div className="form-group">
        <label htmlFor="privacy">Privacy</label>
        <select
          id="privacy"
          name="privacy"
          value={formData.privacy}
          onChange={handleInputChange}
          className="privacy-select"
        >
          <option value="public">🌍 Public</option>
          <option value="friends">👥 Friends</option>
          <option value="private">🔒 Only me</option>
        </select>
      </div>

      <button type="submit" className="submit-btn facebook-style">
        Post
      </button>
    </form>
  );
};

export default NormalPostForm;
