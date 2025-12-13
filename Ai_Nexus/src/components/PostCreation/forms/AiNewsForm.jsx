import React, { useState } from 'react';

const AiNewsForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    sourceLink: '',
    thumbnail: null,
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
        thumbnail: file,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && formData.summary) {
      onSubmit({
        type: 'ai_news',
        ...formData,
      });
    }
  };

  return (
    <form className="post-form ai-news-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">News Title *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter news headline"
          required
          maxLength={200}
        />
        <span className="char-count">{formData.title.length}/200</span>
      </div>

      <div className="form-group">
        <label htmlFor="summary">Summary *</label>
        <textarea
          id="summary"
          name="summary"
          value={formData.summary}
          onChange={handleInputChange}
          placeholder="Provide a brief summary of the news"
          required
          maxLength={1000}
          rows={4}
        />
        <span className="char-count">{formData.summary.length}/1000</span>
      </div>

      <div className="form-group">
        <label htmlFor="sourceLink">Source Link</label>
        <input
          type="url"
          id="sourceLink"
          name="sourceLink"
          value={formData.sourceLink}
          onChange={handleInputChange}
          placeholder="https://example.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="thumbnail">Thumbnail Image</label>
        <input
          type="file"
          id="thumbnail"
          name="thumbnail"
          onChange={handleFileChange}
          accept="image/*"
          className="file-input"
        />
        {formData.thumbnail && (
          <span className="file-selected">✓ {formData.thumbnail.name}</span>
        )}
      </div>

      <button type="submit" className="submit-btn">
        Post News
      </button>
    </form>
  );
};

export default AiNewsForm;
