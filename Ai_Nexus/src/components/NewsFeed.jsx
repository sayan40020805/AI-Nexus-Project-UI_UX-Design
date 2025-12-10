import { useState } from 'react';
import { Calendar, TrendingUp, Filter, Search } from 'lucide-react';
import '../styles/NewsFeed.css';

const categories = [
  'All',
  'Healthcare AI',
  'FinTech AI',
  'Generative AI',
  'Computer Vision',
  'NLP',
  'Robotics',
  'Ethics & Policy',
];

const newsData = [
  {
    id: 1,
    title: 'Revolutionary Healthcare AI Diagnoses Rare Diseases with 95% Accuracy',
    category: 'Healthcare AI',
    date: '2025-12-08',
    summary: 'A new AI system developed by researchers has achieved breakthrough accuracy in diagnosing rare genetic disorders, potentially saving thousands of lives.',
    image: 'https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjUyMzE2OTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    views: 15420,
  },
  {
    id: 2,
    title: 'Major Banks Adopt AI-Powered Fraud Detection Systems',
    category: 'FinTech AI',
    date: '2025-12-07',
    summary: 'Leading financial institutions are implementing advanced AI algorithms to combat sophisticated fraud schemes in real-time transactions.',
    image: 'https://images.unsplash.com/photo-1584291527908-033f4d6542c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwdmlzdWFsaXphdGlvbiUyMHNjcmVlbnxlbnwxfHx8fDE3NjUyNTk4MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    views: 12850,
  },
  {
    id: 3,
    title: 'New Generative AI Model Creates Photorealistic Videos from Text',
    category: 'Generative AI',
    date: '2025-12-06',
    summary: 'The latest advancement in generative AI technology can now produce high-quality video content from simple text descriptions.',
    image: 'https://images.unsplash.com/photo-1625314887424-9f190599bd56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMHJvYm90JTIwZnV0dXJpc3RpY3xlbnwxfHx8fDE3NjUyNjMwODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    views: 23100,
  },
  {
    id: 4,
    title: 'AI-Powered Language Models Break Translation Barriers',
    category: 'NLP',
    date: '2025-12-05',
    summary: 'Researchers unveil new natural language processing models capable of translating over 200 languages with unprecedented accuracy.',
    image: 'https://images.unsplash.com/photo-1622131815526-eaae1e615381?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjBsYXB0b3B8ZW58MXx8fHwxNzY1MjA5NzcwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    views: 18640,
  },
  {
    id: 5,
    title: 'EU Proposes New AI Regulations for Ethical Development',
    category: 'Ethics & Policy',
    date: '2025-12-04',
    summary: 'European Union introduces comprehensive framework for AI governance, focusing on transparency, accountability, and human rights.',
    image: 'https://images.unsplash.com/photo-1582192904915-d89c7250b235?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwY29uZmVyZW5jZSUyMHByZXNlbnRhdGlvbnxlbnwxfHx8fDE3NjUyMDk3NDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    views: 9820,
  },
  {
    id: 6,
    title: 'Autonomous Robots Transform Warehouse Operations',
    category: 'Robotics',
    date: '2025-12-03',
    summary: 'AI-driven robotic systems are revolutionizing logistics and supply chain management with improved efficiency and safety.',
    image: 'https://images.unsplash.com/photo-1739298061740-5ed03045b280?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMG9mZmljZXxlbnwxfHx8fDE3NjUxODE3MTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    views: 14200,
  },
];

export function NewsFeed({ preview = false }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

  const displayedNews = preview ? newsData.slice(0, 3) : newsData;
  
  const filteredNews = displayedNews
    .filter(
      (item) =>
        (selectedCategory === 'All' || item.category === selectedCategory) &&
        (searchTerm === '' ||
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.summary.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'popularity') return b.views - a.views;
      return 0;
    });

  return (
    <div className="news-feed">
      {!preview && (
        <div className="news-feed-filters">
          <div className="news-feed-search-sort">
            <div className="news-feed-search">
              <Search className="news-feed-search-icon" />
              <input
                type="text"
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="news-feed-search-input"
              />
            </div>
            <div className="news-feed-sort">
              <Filter className="news-feed-sort-icon" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="news-feed-sort-select"
              >
                <option value="date">Latest</option>
                <option value="popularity">Most Popular</option>
              </select>
            </div>
          </div>

          <div className="news-feed-categories">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? 'news-feed-category-button news-feed-category-button-active' : 'news-feed-category-button news-feed-category-button-inactive'}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="news-feed-grid">
        {filteredNews.map((item) => (
          <article
            key={item.id}
            className="news-feed-article"
          >
            <img
              src={item.image}
              alt={item.title}
              className="news-feed-article-image"
            />
            <div className="news-feed-article-content">
              <span className="news-feed-article-category">
                {item.category}
              </span>
              <h3 className="news-feed-article-title">{item.title}</h3>
              <p className="news-feed-article-summary">{item.summary}</p>
              <div className="news-feed-article-meta">
                <div className="news-feed-article-meta-item">
                  <Calendar className="news-feed-article-meta-icon" />
                  <span>{new Date(item.date).toLocaleDateString()}</span>
                </div>
                <div className="news-feed-article-meta-item">
                  <TrendingUp className="news-feed-article-meta-icon" />
                  <span>{item.views.toLocaleString()} views</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
