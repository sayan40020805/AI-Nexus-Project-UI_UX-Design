import React, { useState } from 'react';

const AIModelPostForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    modelName: '',
    description: '',
    githubLink: '',
    modelFile: null,
    tags: '',
    visibility: 'public',
    category: 'language-model',
    version: '',
    license: 'open-source',
    pricing: 'free',
  });

  const [filePreview, setFilePreview] = useState(null);
  const [uploadMethod, setUploadMethod] = useState('github');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, modelFile: file }));
      setFilePreview({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
      });
      setUploadMethod('file');
    }
  };

  const handleGitHubChange = (e) => {
    const link = e.target.value;
    setFormData(prev => ({ ...prev, githubLink: link }));
    if (link.trim()) {
      setUploadMethod('github');
    }
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, modelFile: null }));
    setFilePreview(null);
    setUploadMethod('github');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.modelName.trim() && formData.description.trim()) {
      const submitData = {
        postType: 'ai_model',
        content: `${formData.modelName}\n\n${formData.description}`,
        modelName: formData.modelName,
        description: formData.description,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        privacy: formData.visibility, // Map visibility → privacy for backend
        modelType: formData.category, // Map category → modelType for backend
        version: formData.version,
        license: formData.license,
        pricing: formData.pricing,
      };

      if (uploadMethod === 'file' && formData.modelFile) {
        submitData.modelFile = formData.modelFile;
      } else if (uploadMethod === 'github' && formData.githubLink.trim()) {
        submitData.githubUrl = formData.githubLink; // Map to backend expected field
      }

      onSubmit(submitData);
    }
  };

  const isValid = formData.modelName.trim() && formData.description.trim() && 
    ((uploadMethod === 'file' && formData.modelFile) || (uploadMethod === 'github' && formData.githubLink.trim()));

  const categories = [
    { value: 'language-model', label: 'Language Model' },
    { value: 'vision-model', label: 'Computer Vision' },
    { value: 'audio-model', label: 'Audio/Speech' },
    { value: 'multimodal', label: 'Multimodal' },
    { value: 'generative', label: 'Generative AI' },
    { value: 'classification', label: 'Classification' },
    { value: 'recommendation', label: 'Recommendation' },
    { value: 'other', label: 'Other' }
  ];

  const licenses = [
    { value: 'open-source', label: 'Open Source' },
    { value: 'mit', label: 'MIT License' },
    { value: 'apache-2.0', label: 'Apache 2.0' },
    { value: 'gpl-3.0', label: 'GPL 3.0' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'proprietary', label: 'Proprietary' }
  ];

  const pricingModels = [
    { value: 'free', label: 'Free' },
    { value: 'freemium', label: 'Freemium' },
    { value: 'paid', label: 'Paid' },
    { value: 'enterprise', label: 'Enterprise' }
  ];

  return (
    <form onSubmit={handleSubmit} className="post-form-container">
      <div className="form-section">
        <h3>🤖 Model Information</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Model Name *</label>
            <input
              type="text"
              name="modelName"
              value={formData.modelName}
              onChange={handleInputChange}
              placeholder="e.g., GPT-4, Claude, Stable Diffusion"
              required
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label>Version</label>
            <input
              type="text"
              name="version"
              value={formData.version}
              onChange={handleInputChange}
              placeholder="e.g., 1.0, v2.1"
              maxLength={20}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe what this model does..."
            required
            maxLength={2000}
            rows={4}
          />
          <div className="char-count">{formData.description.length}/2000</div>
        </div>
      </div>

      <div className="form-section">
        <h3>📦 Model Source</h3>
        
        <div className="upload-method-tabs">
          <button
            type="button"
            className={`tab-btn ${uploadMethod === 'github' ? 'active' : ''}`}
            onClick={() => setUploadMethod('github')}
          >
            🔗 GitHub Link
          </button>
          <button
            type="button"
            className={`tab-btn ${uploadMethod === 'file' ? 'active' : ''}`}
            onClick={() => setUploadMethod('file')}
          >
            📁 Upload File
          </button>
        </div>

        {uploadMethod === 'github' ? (
          <div className="form-group">
            <label>GitHub Repository *</label>
            <input
              type="url"
              name="githubLink"
              value={formData.githubLink}
              onChange={handleGitHubChange}
              placeholder="https://github.com/username/repository"
            />
            <small>Provide the GitHub repository URL for your model</small>
          </div>
        ) : (
          <div className="form-group">
            <label>Model File *</label>
            
            {!filePreview ? (
              <div className="upload-area" onClick={() => document.getElementById('model-file-input').click()}>
                <div className="upload-placeholder">
                  <span className="upload-icon">🤖</span>
                  <p>Click to upload model file</p>
                  <small>H5, PyTorch, TensorFlow, ONNX (max 2GB)</small>
                </div>
                <input
                  type="file"
                  id="model-file-input"
                  onChange={handleFileChange}
                  accept=".h5,.pt,.pth,.pkl,.bin,.onnx,.pb,.tflite"
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div className="file-preview">
                <div className="file-info">
                  <span className="file-icon">🤖</span>
                  <div>
                    <p>{filePreview.name}</p>
                    <small>{filePreview.size}</small>
                  </div>
                </div>
                <button type="button" onClick={removeFile} className="remove-btn">×</button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="form-section">
        <h3>⚙️ Additional Details</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select
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
            <label>License</label>
            <select
              name="license"
              value={formData.license}
              onChange={handleInputChange}
            >
              {licenses.map(license => (
                <option key={license.value} value={license.value}>{license.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Pricing Model</label>
            <select
              name="pricing"
              value={formData.pricing}
              onChange={handleInputChange}
            >
              {pricingModels.map(pricing => (
                <option key={pricing.value} value={pricing.value}>{pricing.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Visibility</label>
            <select
              name="visibility"
              value={formData.visibility}
              onChange={handleInputChange}
            >
              <option value="public">🌍 Public</option>
              <option value="private">🔒 Private</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Tags</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="Add tags (separate with commas)"
          />
          <small>Example: transformer, nlp, text-generation, ai</small>
        </div>
      </div>

      <button 
        type="submit" 
        className="submit-btn"
        disabled={!isValid}
      >
        🤖 Publish AI Model
      </button>
      
      {!isValid && (
        <p className="error-message">⚠️ Please provide model name, description, and either a file or GitHub link</p>
      )}
    </form>
  );
};

export default AIModelPostForm;
