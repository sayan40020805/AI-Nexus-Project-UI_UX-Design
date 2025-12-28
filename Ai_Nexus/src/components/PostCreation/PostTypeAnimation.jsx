import React, { useEffect, useRef } from 'react';
import './PostCreation.css';

const PostTypeAnimation = ({ selectedType }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !selectedType) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let rotation = 0;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const getAnimationConfig = (type) => {
      const configs = {
        photo: {
          color: '#6366F1',
          shape: 'pyramid',
          speed: 1.2,
          emoji: '📸',
        },
        shorts: {
          color: '#4ECDC4',
          shape: 'film',
          speed: 1.5,
          emoji: '🎬',
        },
        video: {
          color: '#FFD93D',
          shape: 'sphere',
          speed: 0.8,
          emoji: '🎥',
        },
        ai_model: {
          color: '#95E1D3',
          shape: 'cube',
          speed: 1,
          emoji: '🤖',
        },
      };
      return configs[type] || configs.photo; // fallback to photo
    };

    const config = getAnimationConfig(selectedType);
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    const drawNewspaper = (x, y, angle, color) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Draw newspaper shape
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.8;
      ctx.fillRect(-40, -60, 80, 120);

      // Draw lines
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-30, -40);
      ctx.lineTo(30, -40);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-30, -20);
      ctx.lineTo(30, -20);
      ctx.stroke();

      ctx.restore();
    };

    const drawFilm = (x, y, angle, color) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Draw film reel
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.8;

      // Center
      ctx.fillRect(-30, -40, 60, 80);

      // Film perforations
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      for (let i = -30; i < 40; i += 10) {
        ctx.fillRect(-25, i, 8, 5);
        ctx.fillRect(17, i, 8, 5);
      }

      ctx.restore();
    };

    const drawCube = (x, y, angle, color) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      const size = 40;
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.8;

      // Front face
      ctx.fillRect(-size / 2, -size / 2, size, size);

      // Right face
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(size / 2, -size / 2);
      ctx.lineTo(size / 2 + 15, -size / 2 - 15);
      ctx.lineTo(size / 2 + 15, size / 2 - 15);
      ctx.lineTo(size / 2, size / 2);
      ctx.fill();

      // Top face
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(-size / 2, -size / 2);
      ctx.lineTo(-size / 2 + 15, -size / 2 - 15);
      ctx.lineTo(size / 2 + 15, -size / 2 - 15);
      ctx.lineTo(size / 2, -size / 2);
      ctx.fill();

      ctx.restore();
    };

    const drawSphere = (x, y, angle, color) => {
      ctx.save();
      ctx.translate(x, y);

      // Draw sphere
      const gradient = ctx.createRadialGradient(-10, -10, 0, 0, 0, 50);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color);

      ctx.fillStyle = gradient;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(0, 0, 50, 0, Math.PI * 2);
      ctx.fill();

      // Rotation indicator
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 50, angle, angle + Math.PI / 4);
      ctx.stroke();

      ctx.restore();
    };

    const drawPyramid = (x, y, angle, color) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.fillStyle = color;
      ctx.globalAlpha = 0.8;

      // Base
      ctx.beginPath();
      ctx.moveTo(-40, 40);
      ctx.lineTo(40, 40);
      ctx.lineTo(0, -50);
      ctx.closePath();
      ctx.fill();

      // Highlight
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.moveTo(-20, 40);
      ctx.lineTo(0, -50);
      ctx.lineTo(0, 40);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    const drawShape = (type, x, y, angle, color) => {
      switch (type) {
        case 'newspaper':
          drawNewspaper(x, y, angle, color);
          break;
        case 'film':
          drawFilm(x, y, angle, color);
          break;
        case 'cube':
          drawCube(x, y, angle, color);
          break;
        case 'sphere':
          drawSphere(x, y, angle, color);
          break;
        case 'pyramid':
          drawPyramid(x, y, angle, color);
          break;
        default:
          break;
      }
    };

    const animate = () => {
      // Clear canvas with gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, 'rgba(10,10,20,0.1)');
      gradient.addColorStop(1, 'rgba(20,20,40,0.1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      rotation += config.speed;

      // Draw particles
      ctx.fillStyle = config.color;
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < 3; i++) {
        const offset = (i * Math.PI * 2) / 3;
        const x = centerX + Math.cos(rotation * 0.01 + offset) * 100;
        const y = centerY + Math.sin(rotation * 0.01 + offset) * 100;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw main shape
      drawShape(
        config.shape,
        centerX,
        centerY,
        (rotation * Math.PI) / 180,
        config.color
      );

      // Draw orbiting dots
      ctx.globalAlpha = 0.6;
      for (let i = 0; i < 4; i++) {
        const angle = (rotation * 0.02 + (i * Math.PI * 2) / 4) * (Math.PI / 180);
        const orbitX = centerX + Math.cos(angle) * 120;
        const orbitY = centerY + Math.sin(angle) * 120;
        ctx.fillStyle = config.color;
        ctx.beginPath();
        ctx.arc(orbitX, orbitY, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [selectedType]);

  return (
    <div className="animation-container">
      {selectedType ? (
        <>
          <canvas ref={canvasRef} className="animation-canvas" />
          <div className="animation-label">
            {selectedType === 'photo' && '📸 Photo Post'}
            {selectedType === 'shorts' && '🎬 Shorts Post'}
            {selectedType === 'video' && '🎥 Video Post'}
            {selectedType === 'ai_model' && '🤖 AI Model Post'}
          </div>
        </>
      ) : (
        <div className="empty-animation">
          <div className="empty-icon">✨</div>
          <p>Select a post type to see the animation</p>
        </div>
      )}
    </div>
  );
};

export default PostTypeAnimation;
