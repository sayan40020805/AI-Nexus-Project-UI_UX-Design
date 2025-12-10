import { ArrowRight, Sparkles, Users } from 'lucide-react';
import '../styles/Hero.css';

export function Hero({ onExploreModels, onJoinCommunity }) {
  return (
    <div className="hero">
      <div className="hero-overlay"></div>
      <div className="hero-pattern"></div>

      <div className="hero-content">
        <div className="hero-text">
          <div className="hero-badge">
            <Sparkles className="hero-badge-icon" />
            <span className="hero-badge-text">Welcome to the Future of AI</span>
          </div>

          <h1 className="hero-title">
            Your Gateway to the AI Industry
          </h1>

          <p className="hero-description">
            Explore cutting-edge AI models, stay updated with industry news, advance your career, and connect with the global AI community.
          </p>

          <div className="hero-buttons">
            <button
              onClick={onExploreModels}
              className="hero-button-primary"
            >
              Explore AI Models
              <ArrowRight className="hero-button-icon" />
            </button>
            <button
              onClick={onJoinCommunity}
              className="hero-button-secondary"
            >
              <Users className="hero-button-icon" />
              Join Community
            </button>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-number">500+</div>
              <div className="hero-stat-label">AI Models</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">10k+</div>
              <div className="hero-stat-label">Community Members</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">2k+</div>
              <div className="hero-stat-label">Job Listings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
