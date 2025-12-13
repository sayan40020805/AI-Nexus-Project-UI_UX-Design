import React, { useState } from 'react';

const AiModelsForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    modelName: '',
    description: '',
    useCase: '',
    githubLink: '',
    apiLink: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.modelName && formData.description) {
      onSubmit({
        type: 'ai_models',
        ...formData,
      });
    }
  };

  return (
    <form className="post-form ai-models-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="modelName">Model Name *</label>
        <input
          type="text"
          id="modelName"
          name="modelName"
          value={formData.modelName}
          onChange={handleInputChange}
          placeholder="e.g., GPT-4, Claude, Stable Diffusion"
          required
          maxLength={100}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe what this model does and its key features"
          required
          maxLength={1500}
          rows={4}
        />
        <span className="char-count">{formData.description.length}/1500</span>
      </div>

      <div className="form-group">
        <label htmlFor="useCase">Use Case *</label>
        <textarea
          id="useCase"
          name="useCase"
          value={formData.useCase}
          onChange={handleInputChange}
          placeholder="What are the primary use cases for this model?"
          required
          maxLength={1000}
          rows={3}
        />
        <span className="char-count">{formData.useCase.length}/1000</span>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="githubLink">GitHub Link</label>
          <input
            type="url"
            id="githubLink"
            name="githubLink"
            value={formData.githubLink}
            onChange={handleInputChange}
            placeholder="https://github.com/..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="apiLink">API Link</label>
          <input
            type="url"
            id="apiLink"
            name="apiLink"
            value={formData.apiLink}
            onChange={handleInputChange}
            placeholder="https://api.example.com"
          />
        </div>
      </div>

      <button type="submit" className="submit-btn">
        Showcase Model
      </button>
    </form>
  );
};

export default AiModelsForm;
