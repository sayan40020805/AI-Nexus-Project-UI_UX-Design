import React, { useState } from 'react';
import './AiModelsForm.css';

const AiModelsForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    modelName: '',
    description: '',
    category: '',
    tags: '',
    images: []
  });

  const [previewImages, setPreviewImages] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));

    // Create preview URLs
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(previewImages[index]);
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.modelName && formData.description) {
      // CRITICAL FIX: Include 'content' field required by backend
      onSubmit({
        postType: 'ai_models',
        content: `${formData.modelName}\n\n${formData.description}`, // Add required content field
        modelName: formData.modelName,
        description: formData.description,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        media: formData.images.length > 0 ? { images: formData.images } : {},
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ai-models-form">
      <div className="form-group">
        <label htmlFor="modelName">Model Name *</label>
        <input
          type="text"
          id="modelName"
          name="modelName"
          value={formData.modelName}
          onChange={handleInputChange}
          placeholder="e.g., GPT-4, Claude, Gemini"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe the AI model, its capabilities, and use cases..."
          rows={4}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
        >
          <option value="">Select Category</option>
          <option value="LLM">Large Language Models</option>
          <option value="Vision">Computer Vision</option>
          <option value="Audio">Audio Processing</option>
          <option value="Multimodal">Multimodal</option>
          <option value="Specialized">Specialized AI</option>
          <option value="Open Source">Open Source</option>
          <option value="Commercial">Commercial</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags</label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleInputChange}
          placeholder="e.g., transformer, nlp, text-generation"
        />
        <small>Separate tags with commas</small>
      </div>

      <div className="form-group">
        <label htmlFor="images">Model Images</label>
        <input
          type="file"
          id="images"
          name="images"
          onChange={handleImageChange}
          accept="image/*"
          multiple
        />
        {previewImages.length > 0 && (
          <div className="image-previews">
            {previewImages.map((preview, index) => (
              <div key={index} className="image-preview">
                <img src={preview} alt={`Preview ${index + 1}`} />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="remove-image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button type="submit" className="submit-btn">
        Publish AI Model
      </button>
    </form>
  );
};

export default AiModelsForm;
