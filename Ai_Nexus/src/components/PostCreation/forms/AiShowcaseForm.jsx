import React, { useState } from 'react';

const AiShowcaseForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    videoUpload: null,
  });

  const [useUrl, setUseUrl] = useState(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxShowcaseSize = 200 * 1024 * 1024; // 200MB
    if (file.size > maxShowcaseSize) {
      alert('Showcase videos must be 200MB or smaller');
      e.target.value = null;
      return;
    }

    setFormData((prev) => ({
      ...prev,
      videoUpload: file,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      formData.title &&
      formData.description &&
      (useUrl ? formData.videoUrl : formData.videoUpload)
    ) {
      onSubmit({
        postType: 'ai_showcase',
        ...formData,
        videoSource: useUrl ? 'url' : 'upload',
      });
    }
  };

  return (
    <form className="post-form ai-showcase-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">Showcase Title *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Give your showcase a compelling title"
          required
          maxLength={200}
        />
        <span className="char-count">{formData.title.length}/200</span>
      </div>

      <div className="form-group">
        <label htmlFor="description">Long Description *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Provide detailed information about your showcase"
          required
          maxLength={3000}
          rows={6}
        />
        <span className="char-count">{formData.description.length}/3000</span>
      </div>

      <div className="form-group video-source">
        <label>Video Source *</label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="videoSource"
              checked={useUrl}
              onChange={() => setUseUrl(true)}
            />
            Video URL
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="videoSource"
              checked={!useUrl}
              onChange={() => setUseUrl(false)}
            />
            Upload Video
          </label>
        </div>
      </div>

      {useUrl ? (
        <div className="form-group">
          <label htmlFor="videoUrl">Video URL *</label>
          <input
            type="url"
            id="videoUrl"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleInputChange}
            placeholder="https://youtube.com/watch?v=... or similar"
            required={useUrl}
          />
        </div>
      ) : (
        <div className="form-group">
          <label htmlFor="videoUpload">Upload Video *</label>
          <input
            type="file"
            id="videoUpload"
            name="videoUpload"
            onChange={handleFileChange}
            accept="video/*"
            className="file-input"
            required={!useUrl}
          />
          {formData.videoUpload && (
            <span className="file-selected">✓ {formData.videoUpload.name}</span>
          )}
          <span className="helper-text">Supports MP4, WebM, MOV</span>
        </div>
      )}

      <button type="submit" className="submit-btn">
        Publish Showcase
      </button>
    </form>
  );
};

export default AiShowcaseForm;
