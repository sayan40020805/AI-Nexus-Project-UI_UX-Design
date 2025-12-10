import { useState } from 'react';
import { Search, Filter, Star, Download, ExternalLink, Tag } from 'lucide-react';
import '../styles/ModelDirectory.css';

const categories = ['All', 'Language Models', 'Computer Vision', 'Audio', 'Multimodal', 'Reinforcement Learning'];
const tags = ['Open Source', 'Commercial', 'Research', 'Production Ready', 'Fine-tunable'];

const modelsData = [
  {
    id: 1,
    name: 'GPT-4 Turbo',
    developer: 'OpenAI',
    category: 'Language Models',
    description: 'Advanced language model with enhanced reasoning capabilities and extended context window.',
    rating: 4.8,
    downloads: 1250000,
    tags: ['Commercial', 'Production Ready', 'Fine-tunable'],
    license: 'Proprietary',
    lastUpdated: '2025-12-01',
  },
  {
    id: 2,
    name: 'CLIP',
    developer: 'OpenAI',
    category: 'Multimodal',
    description: 'Connects text and images, enabling zero-shot image classification and retrieval.',
    rating: 4.7,
    downloads: 890000,
    tags: ['Open Source', 'Research', 'Production Ready'],
    license: 'MIT',
    lastUpdated: '2025-11-28',
  },
  {
    id: 3,
    name: 'Stable Diffusion XL',
    developer: 'Stability AI',
    category: 'Computer Vision',
    description: 'State-of-the-art text-to-image generation model with improved quality and composition.',
    rating: 4.9,
    downloads: 2100000,
    tags: ['Open Source', 'Production Ready', 'Fine-tunable'],
    license: 'CreativeML Open RAIL-M',
    lastUpdated: '2025-12-05',
  },
  {
    id: 4,
    name: 'Whisper',
    developer: 'OpenAI',
    category: 'Audio',
    description: 'Robust speech recognition model supporting multiple languages and accents.',
    rating: 4.6,
    downloads: 650000,
    tags: ['Open Source', 'Production Ready'],
    license: 'MIT',
    lastUpdated: '2025-11-20',
  },
  {
    id: 5,
    name: 'LLaMA 3',
    developer: 'Meta AI',
    category: 'Language Models',
    description: 'Large language model optimized for efficiency and performance across various tasks.',
    rating: 4.7,
    downloads: 1450000,
    tags: ['Open Source', 'Research', 'Fine-tunable'],
    license: 'LLaMA License',
    lastUpdated: '2025-12-03',
  },
  {
    id: 6,
    name: 'YOLO v8',
    developer: 'Ultralytics',
    category: 'Computer Vision',
    description: 'Real-time object detection system with industry-leading speed and accuracy.',
    rating: 4.8,
    downloads: 980000,
    tags: ['Open Source', 'Production Ready'],
    license: 'AGPL-3.0',
    lastUpdated: '2025-11-25',
  },
  {
    id: 7,
    name: 'MusicGen',
    developer: 'Meta AI',
    category: 'Audio',
    description: 'Controllable music generation model that creates high-quality music from text descriptions.',
    rating: 4.5,
    downloads: 420000,
    tags: ['Open Source', 'Research'],
    license: 'MIT',
    lastUpdated: '2025-11-15',
  },
  {
    id: 8,
    name: 'Claude 3',
    developer: 'Anthropic',
    category: 'Language Models',
    description: 'Advanced AI assistant with strong reasoning, analysis, and coding capabilities.',
    rating: 4.9,
    downloads: 1100000,
    tags: ['Commercial', 'Production Ready'],
    license: 'Proprietary',
    lastUpdated: '2025-12-07',
  },
];

export function ModelDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('popularity');

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredModels = modelsData
    .filter(
      (model) =>
        (selectedCategory === 'All' || model.category === selectedCategory) &&
        (selectedTags.length === 0 ||
          selectedTags.some((tag) => model.tags.includes(tag))) &&
        (searchTerm === '' ||
          model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          model.developer.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'popularity') return b.downloads - a.downloads;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'recent')
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      return 0;
    });

  return (
    <div className="model-directory">
      <div className="model-directory-filters">
        <div className="model-directory-search-sort">
          <div className="model-directory-search">
            <Search className="model-directory-search-icon" />
            <input
              type="text"
              placeholder="Search models, developers, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="model-directory-search-input"
            />
          </div>
          <div className="model-directory-sort">
            <Filter className="model-directory-sort-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="model-directory-sort-select"
            >
              <option value="popularity">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="recent">Recently Updated</option>
            </select>
          </div>
        </div>

        <div className="model-directory-categories-tags">
          <div className="model-directory-section">
            <h4 className="model-directory-section-title">Categories</h4>
            <div className="model-directory-buttons">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? 'model-directory-button model-directory-button-active' : 'model-directory-button model-directory-button-inactive'}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="model-directory-section">
            <h4 className="model-directory-section-title">Tags</h4>
            <div className="model-directory-buttons">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={selectedTags.includes(tag) ? 'model-directory-button model-directory-button-active' : 'model-directory-button model-directory-button-inactive'}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="model-directory-grid">
        {filteredModels.map((model) => (
          <div
            key={model.id}
            className="model-directory-card"
          >
            <div className="model-directory-card-header">
              <div className="model-directory-card-info">
                <h3 className="model-directory-card-title">{model.name}</h3>
                <p className="model-directory-card-developer">{model.developer}</p>
              </div>
              <div className="model-directory-card-rating">
                <Star className="model-directory-card-rating-icon" />
                <span className="model-directory-card-rating-text">{model.rating}</span>
              </div>
            </div>

            <p className="model-directory-card-description">{model.description}</p>

            <div className="model-directory-card-tags">
              <span className="model-directory-card-category">
                {model.category}
              </span>
              {model.tags.map((tag) => (
                <span
                  key={tag}
                  className="model-directory-card-tag"
                >
                  <Tag className="model-directory-card-tag-icon" />
                  {tag}
                </span>
              ))}
            </div>

            <div className="model-directory-card-footer">
              <div className="model-directory-card-stats">
                <div className="model-directory-card-stat">
                  <Download className="model-directory-card-stat-icon" />
                  <span>{(model.downloads / 1000).toFixed(0)}k</span>
                </div>
                <div>{model.license}</div>
              </div>
              <button className="model-directory-card-button">
                View Details
                <ExternalLink className="model-directory-card-button-icon" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
