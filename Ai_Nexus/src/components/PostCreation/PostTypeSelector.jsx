import React from 'react';
import './PostCreation.css';

const POST_TYPES = [
  {
    id: 'normal',
    label: 'Post',
    description: 'Share photos and thoughts',
    icon: '📝',
    color: '#6366F1',
  },
  {
    id: 'ai_news',
    label: 'AI News',
    description: 'Share latest AI news and updates',
    icon: '📰',
    color: '#FF6B6B',
  },
  {
    id: 'ai_shorts',
    label: 'AI Shorts',
    description: 'Create quick video content',
    icon: '🎬',
    color: '#4ECDC4',
  },
  {
    id: 'ai_models',
    label: 'AI Models',
    description: 'Showcase AI models and tools',
    icon: '🤖',
    color: '#95E1D3',
  },
  {
    id: 'ai_showcase',
    label: 'AI Showcase',
    description: 'Long-form video content',
    icon: '🎥',
    color: '#FFD93D',
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
