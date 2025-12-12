import React, { useEffect, useRef } from 'react';
import './SkyGlowBalls.css';

export default function SkyGlowBalls() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create multiple layers of balls with different properties
    const createBalls = (count, className, minSize, maxSize, duration) => {
      for (let i = 0; i < count; i++) {
        const ball = document.createElement('div');
        ball.className = `glow-ball ${className}`;
        
        // Random properties
        const size = Math.random() * (maxSize - minSize) + minSize;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random() * 8;
        const duration_var = duration + (Math.random() * 4 - 2);
        
        ball.style.width = `${size}px`;
        ball.style.height = `${size}px`;
        ball.style.left = `${left}%`;
        ball.style.top = `${top}%`;
        ball.style.animationDelay = `${delay}s`;
        ball.style.animationDuration = `${duration_var}s`;
        
        container.appendChild(ball);
      }
    };

    // Create different layers of balls
    createBalls(8, 'large-balls', 40, 80, 12);      // Large slow-moving balls
    createBalls(12, 'medium-balls', 20, 40, 8);     // Medium balls
    createBalls(20, 'small-balls', 8, 20, 6);       // Small fast balls
    createBalls(15, 'tiny-balls', 4, 12, 4);        // Tiny very fast balls

    // Cleanup function
    return () => {
      if (container) {
        const balls = container.querySelectorAll('.glow-ball');
        balls.forEach(ball => ball.remove());
      }
    };
  }, []);

  return (
    <div className="sky-glow-container" ref={containerRef}>
      <div className="sky-gradient-overlay"></div>
      <div className="floating-particles">
        {[...Array(30)].map((_, i) => (
          <div 
            key={i} 
            className="floating-particle" 
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${5 + Math.random() * 5}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}
