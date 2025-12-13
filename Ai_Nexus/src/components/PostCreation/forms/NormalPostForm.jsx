import React, { useState } from 'react';

const NormalPostForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null,
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
        image: file,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.content) {
      onSubmit({
        type: 'normal_post',
        ...formData,
      });
    }
  };

  return (
    <form className="post-form normal-post-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">Title (Optional)</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Add a title to your post"
          maxLength={200}
        />
        <span className="char-count">{formData.title.length}/200</span>
      </div>

      <div className="form-group">
        <label htmlFor="content">What's on your mind? *</label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          placeholder="Share your thoughts, insights, or updates..."
          required
          maxLength={5000}
          rows={6}
          className="content-textarea"
        />
        <span className="char-count">{formData.content.length}/5000</span>
      </div>

      <div className="form-group">
        <label htmlFor="image">Attach Image (Optional)</label>
        <input
          type="file"
          id="image"
          name="image"
          onChange={handleFileChange}
          accept="image/*"
          className="file-input"
        />
        {formData.image && (
          <div className="image-preview">
            <span className="file-selected">✓ {formData.image.name}</span>
            <img
              src={URL.createObjectURL(formData.image)}
              alt="Preview"
              className="preview-thumbnail"
            />
          </div>
        )}
      </div>

      <button type="submit" className="submit-btn">
        Post
      </button>
    </form>
  );
};

export default NormalPostForm;
