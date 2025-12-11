import { useState } from 'react';
import { Play, Pause, Heart, Share2, MessageCircle, Eye, ThumbsUp, ThumbsDown, Bookmark, MoreHorizontal } from 'lucide-react';
import '../../styles/AIShorts.css';

const aiShortsData = [
  {
    id: 1,
    title: '5 AI Trends That Will Dominate 2025',
    description: 'Discover the most important AI developments shaping our future',
    thumbnail: 'https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjUyMzE2OTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '2:34',
    views: 45600,
    likes: 2100,
    dislikes: 45,
    comments: 320,
    author: 'AI Insights',
    authorAvatar: '🤖',
    category: 'Trends',
    publishDate: '2 hours ago',
    tags: ['AI', 'Trends', '2025', 'Technology']
  },
  {
    id: 2,
    title: 'How ChatGPT Works: A Simple Explanation',
    description: 'Understanding transformer architecture in plain English',
    thumbnail: 'https://images.unsplash.com/photo-1625314887424-9f190599bd56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMHJvYm90JTIwZnV0dXJpc3RpY3xlbnwxfHx8fDE3NjUyNjMwODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '1:45',
    views: 78200,
    likes: 3400,
    dislikes: 23,
    comments: 580,
    author: 'Tech Explained',
    authorAvatar: '🔬',
    category: 'Education',
    publishDate: '5 hours ago',
    tags: ['ChatGPT', 'Transformers', 'NLP', 'AI']
  },
  {
    id: 3,
    title: 'AI vs Human: The Ultimate Challenge',
    description: 'Can AI really replace human creativity? Let\'s find out',
    thumbnail: 'https://images.unsplash.com/photo-1622131815526-eaae1e615381?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjBsYXB0b3B8ZW58MXx8fHwxNzY1MjA5NzcwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '3:12',
    views: 92300,
    likes: 5100,
    dislikes: 89,
    comments: 750,
    author: 'Future AI',
    authorAvatar: '🚀',
    category: 'Debate',
    publishDate: '1 day ago',
    tags: ['AI', 'Human', 'Creativity', 'Future']
  },
  {
    id: 4,
    title: 'Building Your First Neural Network',
    description: 'Step-by-step tutorial for beginners',
    thumbnail: 'https://images.unsplash.com/photo-1584291527908-033f4d6542c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwdmlzdWFsaXphdGlvbiUyMHNjcmVlbnxlbnwxfHx8fDE3NjUyNTk4MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '4:56',
    views: 34100,
    likes: 1800,
    dislikes: 12,
    comments: 280,
    author: 'Code Academy',
    authorAvatar: '💻',
    category: 'Tutorial',
    publishDate: '2 days ago',
    tags: ['Neural Network', 'Python', 'Tutorial', 'Beginner']
  },
  {
    id: 5,
    title: 'AI Art: The Controversy Explained',
    description: 'The debate around AI-generated art and its implications',
    thumbnail: 'https://images.unsplash.com/photo-1582192904915-d89c7250b235?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwY29uZmVyZW5jZSUyMHByZXNlbnRhdGlvbnxlbnwxfHx8fDE3NjUyMDk3NDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '2:18',
    views: 67800,
    likes: 2900,
    dislikes: 156,
    comments: 420,
    author: 'Art & AI',
    authorAvatar: '🎨',
    category: 'Discussion',
    publishDate: '3 days ago',
    tags: ['AI Art', 'Ethics', 'Creativity', 'Discussion']
  },
  {
    id: 6,
    title: 'The Future of AI in Healthcare',
    description: 'How AI is revolutionizing medical diagnosis and treatment',
    thumbnail: 'https://images.unsplash.com/photo-1739298061740-5ed03045b280?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMG9mZmljZXxlbnwxfHx8fDE3NjUxODE3MTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '3:45',
    views: 55800,
    likes: 2700,
    dislikes: 34,
    comments: 390,
    author: 'Health Tech',
    authorAvatar: '🏥',
    category: 'Healthcare',
    publishDate: '4 days ago',
    tags: ['Healthcare', 'AI', 'Medical', 'Future']
  }
];

const categories = ['All', 'Education', 'Trends', 'Tutorial', 'Discussion', 'Debate', 'Healthcare'];

export function AIShorts() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [playingVideo, setPlayingVideo] = useState(null);
  const [likedVideos, setLikedVideos] = useState(new Set());
  const [dislikedVideos, setDislikedVideos] = useState(new Set());
  const [savedVideos, setSavedVideos] = useState(new Set());

  const filteredVideos = selectedCategory === 'All' 
    ? aiShortsData 
    : aiShortsData.filter(video => video.category === selectedCategory);

  const handlePlayPause = (videoId) => {
    if (playingVideo === videoId) {
      setPlayingVideo(null);
    } else {
      setPlayingVideo(videoId);
    }
  };

  const handleLike = (videoId) => {
    setLikedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
        // Remove from disliked if it was there
        setDislikedVideos(prev => {
          const newDisliked = new Set(prev);
          newDisliked.delete(videoId);
          return newDisliked;
        });
      }
      return newSet;
    });
  };

  const handleDislike = (videoId) => {
    setDislikedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
        // Remove from liked if it was there
        setLikedVideos(prev => {
          const newLiked = new Set(prev);
          newLiked.delete(videoId);
          return newLiked;
        });
      }
      return newSet;
    });
  };

  const handleSave = (videoId) => {
    setSavedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="ai-shorts-container">
      <div className="ai-shorts-header">
        <div className="ai-shorts-title">
          <h1>AI Shorts</h1>
          <p>Quick, engaging videos about artificial intelligence</p>
        </div>
        
        <div className="ai-shorts-stats">
          <div className="ai-shorts-stat">
            <Eye className="w-5 h-5" />
            <span>1.2M+ views today</span>
          </div>
          <div className="ai-shorts-stat">
            <MessageCircle className="w-5 h-5" />
            <span>50K+ comments</span>
          </div>
        </div>
      </div>

      <div className="ai-shorts-categories">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`ai-shorts-category ${selectedCategory === category ? 'active' : ''}`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="ai-shorts-grid">
        {filteredVideos.map((video) => (
          <div key={video.id} className="ai-short-card">
            <div className="ai-short-thumbnail">
              <img src={video.thumbnail} alt={video.title} />
              <div className="ai-short-overlay">
                <button
                  onClick={() => handlePlayPause(video.id)}
                  className="ai-short-play-btn"
                >
                  {playingVideo === video.id ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8" />
                  )}
                </button>
              </div>
              <div className="ai-short-duration">{video.duration}</div>
            </div>

            <div className="ai-short-content">
              <div className="ai-short-header">
                <div className="ai-short-author">
                  <div className="ai-short-avatar">{video.authorAvatar}</div>
                  <div className="ai-short-author-info">
                    <h4 className="ai-short-author-name">{video.author}</h4>
                    <span className="ai-short-publish-date">{video.publishDate}</span>
                  </div>
                </div>
                <button className="ai-short-more-btn">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              <h3 className="ai-short-title">{video.title}</h3>
              <p className="ai-short-description">{video.description}</p>

              <div className="ai-short-tags">
                {video.tags.map((tag) => (
                  <span key={tag} className="ai-short-tag">#{tag}</span>
                ))}
              </div>

              <div className="ai-short-stats">
                <div className="ai-short-stat">
                  <Eye className="w-4 h-4" />
                  <span>{formatNumber(video.views)} views</span>
                </div>
              </div>

              <div className="ai-short-actions">
                <div className="ai-short-action-group">
                  <button
                    onClick={() => handleLike(video.id)}
                    className={`ai-short-action ${likedVideos.has(video.id) ? 'liked' : ''}`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{formatNumber(video.likes + (likedVideos.has(video.id) ? 1 : 0))}</span>
                  </button>
                  
                  <button
                    onClick={() => handleDislike(video.id)}
                    className={`ai-short-action ${dislikedVideos.has(video.id) ? 'disliked' : ''}`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span>{video.dislikes}</span>
                  </button>
                  
                  <button className="ai-short-action">
                    <MessageCircle className="w-4 h-4" />
                    <span>{video.comments}</span>
                  </button>
                  
                  <button className="ai-short-action">
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
                
                <button
                  onClick={() => handleSave(video.id)}
                  className={`ai-short-save ${savedVideos.has(video.id) ? 'saved' : ''}`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="ai-shorts-empty">
          <div className="ai-shorts-empty-icon">🎬</div>
          <h3>No videos found</h3>
          <p>Try selecting a different category or check back later for new content.</p>
        </div>
      )}
    </div>
  );
}
