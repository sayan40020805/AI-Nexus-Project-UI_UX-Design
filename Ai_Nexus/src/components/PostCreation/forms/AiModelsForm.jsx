import React, { useState } from 'react';

const AiModelsForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    modelName: '',
    modelType: 'language-model',
    description: '',
    capabilities: [],
    useCases: [],
    pricing: 'free',
    performance: '',
    limitations: '',
    githubUrl: '',
    demoUrl: '',
    paperUrl: '',
    images: [],
    tags: '',
    category: 'nlp',
    releaseDate: '',
    company: '',
    license: 'open-source',
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [newCapability, setNewCapability] = useState('');
  const [newUseCase, setNewUseCase] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...files],
      }));
      
      const newPreviews = files.map(file => ({
        file,
        url: URL.createObjectURL(file),
        name: file.name
      }));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setFormData(prev => ({ ...prev, images: newImages }));
    setImagePreviews(newPreviews);
  };

  const addCapability = () => {
    if (newCapability.trim() && !formData.capabilities.includes(newCapability.trim())) {
      setFormData(prev => ({
        ...prev,
        capabilities: [...prev.capabilities, newCapability.trim()]
      }));
      setNewCapability('');
    }
  };

  const removeCapability = (index) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.filter((_, i) => i !== index)
    }));
  };

  const addUseCase = () => {
    if (newUseCase.trim() && !formData.useCases.includes(newUseCase.trim())) {
      setFormData(prev => ({
        ...prev,
        useCases: [...prev.useCases, newUseCase.trim()]
      }));
      setNewUseCase('');
    }
  };

  const removeUseCase = (index) => {
    setFormData(prev => ({
      ...prev,
      useCases: prev.useCases.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.modelName && formData.description) {
      // CRITICAL FIX: Add required content field for backend
      const submitData = {
        postType: 'ai_models',
        content: `${formData.modelName}\n\n${formData.description}`, // Required field
        modelName: formData.modelName,
        modelType: formData.modelType,
        description: formData.description,
        capabilities: formData.capabilities,
        useCases: formData.useCases,
        pricing: formData.pricing,
        performance: formData.performance,
        limitations: formData.limitations,
        githubUrl: formData.githubUrl,
        demoUrl: formData.demoUrl,
        paperUrl: formData.paperUrl,
        category: formData.category,
        releaseDate: formData.releaseDate,
        company: formData.company,
        license: formData.license,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        media: formData.images.length > 0 ? { images: formData.images } : {},
      };

      console.log('Submitting model post data:', submitData);
      onSubmit(submitData);
    }
  };

  const modelTypes = [
    { value: 'language-model', label: 'Language Model' },
    { value: 'vision-model', label: 'Computer Vision' },
    { value: 'audio-model', label: 'Audio/Speech' },
    { value: 'multimodal', label: 'Multimodal' },
    { value: 'generative', label: 'Generative AI' },
    { value: 'classification', label: 'Classification' },
    { value: 'other', label: 'Other' }
  ];

  const categories = [
    { value: 'nlp', label: 'Natural Language Processing' },
    { value: 'cv', label: 'Computer Vision' },
    { value: 'audio', label: 'Audio Processing' },
    { value: 'robotics', label: 'Robotics' },
    { value: 'recommendation', label: 'Recommendation Systems' },
    { value: 'prediction', label: 'Prediction & Forecasting' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <form className="post-form ai-models-form linkedin-style" onSubmit={handleSubmit}>
      {/* Model Basic Info */}
      <div className="form-section">
        <h3>🤖 Model Information</h3>
        
        <div className="form-row">
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
            <label htmlFor="modelType">Model Type *</label>
            <select
              id="modelType"
              name="modelType"
              value={formData.modelType}
              onChange={handleInputChange}
              required
            >
              {modelTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="company">Company/Organization</label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              placeholder="OpenAI, Anthropic, Meta, etc."
            />
          </div>

          <div className="form-group">
            <label htmlFor="releaseDate">Release Date</label>
            <input
              type="date"
              id="releaseDate"
              name="releaseDate"
              value={formData.releaseDate}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe what this model does, its key features, and what makes it unique..."
            required
            maxLength={2000}
            rows={4}
          />
          <span className="char-count">{formData.description.length}/2000</span>
        </div>
      </div>

      {/* Capabilities */}
      <div className="form-section">
        <h3>⚡ Key Capabilities</h3>
        <div className="tag-input-container">
          <div className="tag-input-wrapper">
            <input
              type="text"
              value={newCapability}
              onChange={(e) => setNewCapability(e.target.value)}
              placeholder="Add a capability (e.g., Text Generation, Image Analysis)"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCapability())}
            />
            <button type="button" onClick={addCapability} className="add-tag-btn">Add</button>
          </div>
          <div className="tag-list">
            {formData.capabilities.map((capability, index) => (
              <span key={index} className="tag">
                {capability}
                <button type="button" onClick={() => removeCapability(index)}>×</button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="form-section">
        <h3>🎯 Use Cases</h3>
        <div className="tag-input-container">
          <div className="tag-input-wrapper">
            <input
              type="text"
              value={newUseCase}
              onChange={(e) => setNewUseCase(e.target.value)}
              placeholder="Add a use case (e.g., Content Writing, Code Generation)"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addUseCase())}
            />
            <button type="button" onClick={addUseCase} className="add-tag-btn">Add</button>
          </div>
          <div className="tag-list">
            {formData.useCases.map((useCase, index) => (
              <span key={index} className="tag">
                {useCase}
                <button type="button" onClick={() => removeUseCase(index)}>×</button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Performance & Limitations */}
      <div className="form-section">
        <h3>📊 Performance & Limitations</h3>
        
        <div className="form-group">
          <label htmlFor="performance">Performance Metrics</label>
          <textarea
            id="performance"
            name="performance"
            value={formData.performance}
            onChange={handleInputChange}
            placeholder="Benchmarks, accuracy scores, speed metrics, etc."
            maxLength={1000}
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="limitations">Known Limitations</label>
          <textarea
            id="limitations"
            name="limitations"
            value={formData.limitations}
            onChange={handleInputChange}
            placeholder="What are the known limitations or areas for improvement?"
            maxLength={1000}
            rows={3}
          />
        </div>
      </div>

      {/* Links & Resources */}
      <div className="form-section">
        <h3>🔗 Resources & Links</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="githubUrl">GitHub Repository</label>
            <input
              type="url"
              id="githubUrl"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleInputChange}
              placeholder="https://github.com/..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="demoUrl">Demo/Live URL</label>
            <input
              type="url"
              id="demoUrl"
              name="demoUrl"
              value={formData.demoUrl}
              onChange={handleInputChange}
              placeholder="https://demo.example.com"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="paperUrl">Research Paper</label>
            <input
              type="url"
              id="paperUrl"
              name="paperUrl"
              value={formData.paperUrl}
              onChange={handleInputChange}
              placeholder="https://arxiv.org/abs/..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="license">License</label>
            <select
              id="license"
              name="license"
              value={formData.license}
              onChange={handleInputChange}
            >
              <option value="open-source">Open Source</option>
              <option value="commercial">Commercial</option>
              <option value="research">Research Only</option>
              <option value="proprietary">Proprietary</option>
            </select>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="form-section">
        <h3>📝 Additional Details</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Primary Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="pricing">Pricing Model</label>
            <select
              id="pricing"
              name="pricing"
              value={formData.pricing}
              onChange={handleInputChange}
            >
              <option value="free">Free</option>
              <option value="freemium">Freemium</option>
              <option value="paid">Paid</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="transformer, language-model, gpt, nlp"
          />
        </div>

        {/* Image Upload */}
        <div className="form-group">
          <label htmlFor="images">Model Screenshots/Diagrams</label>
          <input
            type="file"
            id="images"
            name="images"
            onChange={handleImageChange}
            accept="image/*"
            multiple
            className="file-input"
          />
          
          {imagePreviews.length > 0 && (
            <div className="image-preview-grid">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="image-preview-item">
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="preview-thumbnail"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="remove-image-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button type="submit" className="submit-btn linkedin-style">
        Showcase Model
      </button>
    </form>
  );
};

export default AiModelsForm;
