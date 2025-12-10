import { ArrowRight, Sparkles, Users } from 'lucide-react';
import '../styles/Hero.css';

export function Hero({ onExploreModels, onJoinCommunity }) {
  return (
    <div className="hero">
      <div className="hero-overlay" />

      <div className="hero-inner">
        <div className="max-w-3xl mx-auto text-center">
          <div className="hero-badge">
            <Sparkles />
            <span>Welcome to the Future of AI</span>
          </div>

          <h1 className="hero-title">Your Gateway to the AI Industry</h1>

          <p className="hero-subtitle">
            Explore cutting-edge AI models, stay updated with industry news, advance your career, and connect with the global AI community.
          </p>

          <div className="hero-cta-group">
            <button onClick={onExploreModels} className="hero-btn-primary">
              Explore AI Models
              <ArrowRight />
            </button>

            <button onClick={onJoinCommunity} className="hero-btn-secondary">
              <Users />
              Join Community
            </button>
          </div>

          <div className="hero-stats-grid">
            <div className="hero-stat">
              <div className="hero-stat-value">500+</div>
              <div className="hero-stat-label">AI Models</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">10k+</div>
              <div className="hero-stat-label">Community Members</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">2k+</div>
              <div className="hero-stat-label">Job Listings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
