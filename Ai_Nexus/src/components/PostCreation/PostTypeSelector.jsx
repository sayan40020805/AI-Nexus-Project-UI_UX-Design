import React from 'react';
import './PostCreation.css';

const POST_TYPES = [
  {
    id: 'photo',
    label: 'Photo Post',
    description: 'Share photos with captions and hashtags',
    icon: '📸',
    color: '#6366F1',
  },
  {
    id: 'shorts',
    label: 'Shorts Post',
    description: 'Quick video content (max 60s)',
    icon: '🎬',
    color: '#4ECDC4',
  },
  {
    id: 'video',
    label: 'Video Post',
    description: 'Regular video with title and description',
    icon: '🎥',
    color: '#FFD93D',
  },
  {
    id: 'ai_model',
    label: 'AI Model Post',
    description: 'Showcase AI models and tools',
    icon: '🤖',
    color: '#95E1D3',
  },
];

const PostTypeSelector = ({ selectedType, onTypeChange }) => {
  return (
    <div className="post-type-selector">
      <h2 className="selector-title">What would you like to post?</h2>
      <div className="post-types-grid">
        {POST_TYPES.map((type) => (
          <button
            key={type.id}
            className={`post-type-card ${selectedType === type.id ? 'active' : ''}`}
            onClick={() => onTypeChange(type.id)}
            style={{
              '--card-color': type.color,
            }}
            data-type={type.id}
          >
            <div className="card-icon">{type.icon}</div>
            <div className="card-label">{type.label}</div>
            <div className="card-description">{type.description}</div>
            {selectedType === type.id && <div className="card-checkmark">✓</div>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PostTypeSelector;
