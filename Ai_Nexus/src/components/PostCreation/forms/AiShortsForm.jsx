import React, { useState } from 'react';

const AiShortsForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    caption: '',
    video: null,
    tags: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        video: file,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.caption && formData.video) {
      onSubmit({
        type: 'ai_shorts',
        ...formData,
        tagsArray: formData.tags.split(',').map((tag) => tag.trim()),
      });
    }
  };

  return (
    <form className="post-form ai-shorts-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="caption">Caption *</label>
        <textarea
          id="caption"
          name="caption"
          value={formData.caption}
          onChange={handleInputChange}
          placeholder="Add a catchy caption for your short video"
          required
          maxLength={500}
          rows={3}
        />
        <span className="char-count">{formData.caption.length}/500</span>
      </div>

      <div className="form-group">
        <label htmlFor="video">Short Video Upload *</label>
        <input
          type="file"
          id="video"
          name="video"
          onChange={handleFileChange}
          accept="video/*"
          className="file-input"
          required
        />
        {formData.video && (
          <span className="file-selected">✓ {formData.video.name}</span>
        )}
        <span className="helper-text">Recommended: 15-60 seconds, MP4 format</span>
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags</label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleInputChange}
          placeholder="AI, Technology, News (comma-separated)"
          maxLength={200}
        />
        <span className="helper-text">Separate tags with commas</span>
      </div>

      <button type="submit" className="submit-btn">
        Create Short
      </button>
    </form>
  );
};

export default AiShortsForm;
