import { useState } from 'react';
import { Search, Filter, Star, Download, ExternalLink, Tag } from 'lucide-react';

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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 p-6 bg-white dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
              <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <input
                      type="text"
                      placeholder="Search models, developers, or descriptions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
              </div>
          </div>
          <div className="lg:col-span-3">
              <div className="relative">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full appearance-none pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                      <option value="popularity">Most Popular</option>
                      <option value="rating">Highest Rated</option>
                      <option value="recent">Recently Updated</option>
                  </select>
              </div>
          </div>
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button key={category} onClick={() => setSelectedCategory(category)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === category ? 'bg-sky-600 text-white dark:bg-sky-500' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedTags.includes(tag) ? 'bg-sky-600 text-white dark:bg-sky-500' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredModels.map((model) => (
          <div key={model.id} className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-700 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{model.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">by {model.developer}</p>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-sm font-semibold">
                <Star className="w-4 h-4 fill-current" />
                <span>{model.rating}</span>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-sm mb-5 flex-grow clamp-2">{model.description}</p>

            <div className="flex flex-wrap gap-2 mb-5">
              <span className="inline-flex items-center bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-300 text-xs font-semibold px-2.5 py-1 rounded-full">{model.category}</span>
              {model.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium px-2.5 py-1 rounded-full">
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Download className="w-4 h-4" />
                  <span>{(model.downloads / 1000).toFixed(0)}k</span>
                </div>
                <span>License: {model.license}</span>
              </div>
              <button className="inline-flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 transition-colors">
                Details
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
