import React from 'react';
import './NetworkAnimation.css';

export default function NetworkAnimation() {
  return (
    <div className="network-animation">
      <div className="network-grid" />
      <div className="network-particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }} />
        ))}
      </div>
    </div>
  );
}
