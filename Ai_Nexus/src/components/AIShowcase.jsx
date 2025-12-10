import { useState } from 'react';
import '../styles/AIShowcase.css';
import { Play, Eye, Heart, ChevronLeft, ChevronRight } from 'lucide-react';

const showcaseItems = [
  {
    id: 1,
    title: 'Real-time Object Detection in Autonomous Vehicles',
    description: 'Advanced computer vision system identifying and tracking objects with 99.8% accuracy in complex urban environments.',
    category: 'Computer Vision',
    company: 'Tesla AI',
    image: 'https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjUyMzE2OTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    views: 45200,
    likes: 3420,
  },
  {
    id: 2,
    title: 'AI-Powered Drug Discovery Platform',
    description: 'Machine learning model that accelerates pharmaceutical research by predicting molecular interactions and drug efficacy.',
    category: 'Healthcare',
    company: 'DeepMind Health',
    image: 'https://images.unsplash.com/photo-1625314887424-9f190599bd56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMHJvYm90JTIwZnV0dXJpc3RpY3xlbnwxfHx8fDE3NjUyNjMwODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    views: 38900,
    likes: 2850,
  },
  {
    id: 3,
    title: 'Natural Language Code Generation',
    description: 'Transform plain English descriptions into production-ready code across multiple programming languages.',
    category: 'Development',
    company: 'OpenAI',
    image: 'https://images.unsplash.com/photo-1622131815526-eaae1e615381?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjBsYXB0b3B8ZW58MXx8fHwxNzY1MjA5NzcwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    views: 62100,
    likes: 5240,
  },
  {
    id: 4,
    title: 'Climate Prediction and Modeling System',
    description: 'AI system analyzing vast climate datasets to predict weather patterns and environmental changes with unprecedented precision.',
    category: 'Environment',
    company: 'Google AI',
    image: 'https://images.unsplash.com/photo-1584291527908-033f4d6542c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwdmlzdWFsaXphdGlvbiUyMHNjcmVlbnxlbnwxfHx8fDE3NjUyNTk4MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    views: 29400,
    likes: 2180,
  },
  {
    id: 5,
    title: 'AI Music Composition Engine',
    description: 'Generative AI creating original music compositions across various genres, mimicking the styles of renowned composers.',
    category: 'Creative',
    company: 'Anthropic Arts',
    image: 'https://images.unsplash.com/photo-1582192904915-d89c7250b235?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwY29uZmVyZW5jZSUyMHByZXNlbnRhdGlvbnxlbnwxfHx8fDE3NjUyMDk3NDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    views: 51800,
    likes: 4620,
  },
  {
    id: 6,
    title: 'Smart Manufacturing Quality Control',
    description: 'Computer vision and machine learning system detecting defects in manufacturing processes with millisecond response times.',
    category: 'Industry',
    company: 'Siemens AI',
    image: 'https://images.unsplash.com/photo-1739298061740-5ed03045b280?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMG9mZmljZXxlbnwxfHx8fDE3NjUxODE3MTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    views: 33500,
    likes: 2740,
  },
];

export function AIShowcase({ preview = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedItems, setLikedItems] = useState(new Set());

  const displayedItems = preview ? showcaseItems.slice(0, 3) : showcaseItems;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayedItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === displayedItems.length - 1 ? 0 : prev + 1));
  };

  const toggleLike = (id) => {
    setLikedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (preview) {
    return (
      <div className="showcase-grid">
        {displayedItems.map((item) => (
          <div key={item.id} className="showcase-card">
            <div className="showcase-image-wrapper">
              <img
                src={item.image}
                alt={item.title}
                className="showcase-image"
              />
              <div className="showcase-image-overlay">
                <button className="showcase-play-btn">
                  <Play className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="showcase-content">
              <div className="showcase-meta">
                <span className="showcase-category">{item.category}</span>
                <span className="showcase-company">{item.company}</span>
              </div>
              <h3 className="showcase-title">{item.title}</h3>
              <p className="showcase-description">{item.description}</p>
              <div className="showcase-stats">
                <div className="showcase-stat">
                  <Eye className="w-5 h-5" />
                  <span>{item.views.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => toggleLike(item.id)}
                  className={`showcase-like-btn ${likedItems.has(item.id) ? 'liked' : ''}`}
                >
                  <Heart
                    className={`w-5 h-5 ${likedItems.has(item.id) ? 'fill-current' : ''}`}
                  />
                  <span>{item.likes.toLocaleString()}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="showcase-container">
      <div className="showcase-container-inner">
        <div className="showcase-carousel">
          <div className="showcase-main">
            <img
              src={displayedItems[currentIndex].image}
              alt={displayedItems[currentIndex].title}
              className="showcase-main-image"
              key={currentIndex}
            />
            <div className="showcase-gradient"></div>
            <div className="showcase-main-content">
              <div className="showcase-main-meta">
                <span className="showcase-main-category">{displayedItems[currentIndex].category}</span>
                <span className="showcase-main-company">{displayedItems[currentIndex].company}</span>
              </div>
              <h2 className="showcase-main-title">{displayedItems[currentIndex].title}</h2>
              <p className="showcase-main-description">{displayedItems[currentIndex].description}</p>
              <div className="showcase-main-stats">
                <div className="showcase-main-stat">
                  <Eye className="w-5 h-5" />
                  <span>{displayedItems[currentIndex].views.toLocaleString()} views</span>
                </div>
                <button
                  onClick={() => toggleLike(displayedItems[currentIndex].id)}
                  className={`showcase-main-like-btn ${likedItems.has(displayedItems[currentIndex].id) ? 'liked' : ''}`}
                >
                  <Heart className={`w-5 h-5 ${likedItems.has(displayedItems[currentIndex].id) ? 'fill-current' : ''}`} />
                  <span>{displayedItems[currentIndex].likes.toLocaleString()} likes</span>
                </button>
              </div>
            </div>
            <button className="showcase-play-overlay">
              <span className="showcase-play-circle">
                <Play className="w-8 h-8" />
              </span>
            </button>
          </div>

          <button
            onClick={handlePrevious}
            className="showcase-nav-btn showcase-nav-btn-left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="showcase-nav-btn showcase-nav-btn-right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="showcase-thumbnails">
          {displayedItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(index)}
              className={`showcase-thumbnail ${index === currentIndex ? 'active' : ''}`}
            >
              <img src={item.image} alt={item.title} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
