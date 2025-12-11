import React from 'react';
import { Sparkles, Users, ArrowRight } from 'lucide-react';

export function LeftPanel() {
  return (
    <aside className="hero-left-panel">
      <div className="panel-card profile-card">
        <div className="profile-header">
          <div className="profile-avatar">👨‍💼</div>
        </div>
        <div className="profile-content">
          <h3 className="profile-name">You</h3>
          <p className="profile-status">AI Enthusiast & Developer</p>
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-value">42</span>
              <span className="stat-label">Connections</span>
            </div>
            <div className="stat">
              <span className="stat-value">8</span>
              <span className="stat-label">Posts</span>
            </div>
          </div>
        </div>
        <button className="profile-btn">View Profile</button>
      </div>

      <div className="panel-card suggestions-card">
        <h4 className="suggestions-title">Trending Topics</h4>
        <div className="suggestions-list">
          <a href="#" className="suggestion-item">#AI</a>
          <a href="#" className="suggestion-item">#MachineLearning</a>
          <a href="#" className="suggestion-item">#DataScience</a>
          <a href="#" className="suggestion-item">#Technology</a>
          <a href="#" className="suggestion-item">#Innovation</a>
        </div>
      </div>
    </aside>
  );
}

export function CenterPanel({ children }) {
  return <main className="hero-center-panel">{children}</main>;
}

export function RightPanel({ children }) {
  return <aside className="hero-right-panel">{children}</aside>;
}

export function FeedWelcome({ onExploreModels, onJoinCommunity }) {
  return (
    <div className="feed-welcome">
      <div className="welcome-badge">
        <Sparkles className="badge-icon" />
        <span>Welcome to AI Nexus</span>
      </div>
      <h2 className="welcome-title">Discover the Future of AI</h2>
      <p className="welcome-description">Connect with AI enthusiasts, explore cutting-edge models, and share your innovations.</p>
      <div className="welcome-actions">
        <button onClick={onExploreModels} className="welcome-btn welcome-btn-primary">
          <span>Explore AI Models</span>
          <ArrowRight className="btn-icon" />
        </button>
        <button onClick={onJoinCommunity} className="welcome-btn welcome-btn-secondary">
          <Users className="btn-icon" />
          <span>Join Community</span>
        </button>
      </div>
    </div>
  );
}

export default { LeftPanel, CenterPanel, RightPanel, FeedWelcome };
