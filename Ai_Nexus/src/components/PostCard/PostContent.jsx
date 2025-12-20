import React, { useState } from 'react';
import { 
  Image, 
  Video, 
  FileText, 
  ExternalLink,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  Lightbulb,
  Newspaper,
  Zap
} from 'lucide-react';
import './PostContent.css';

/**
 * PostContent Component
 * 
 * Handles rendering of post content with support for:
 * - Text content with formatting
 * - Images with lightbox view
 * - Videos with embedded player
 * - Documents/files
 * - Links with preview
 * - Location and event info
 * - Post type specific styling
 */
const PostContent = ({ post, compact = false }) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showImageLightbox, setShowImageLightbox] = useState(false);

  if (!post) return null;

  const { content, media, postType, title, link, location, eventDate, tags } = post;

  // Get post type icon and styling
  const getPostTypeConfig = (type) => {
    const configs = {
      'normal': { icon: FileText, label: 'Post', color: '#6366f1' },
      'news': { icon: Newspaper, label: 'AI News', color: '#ef4444' },
      'shorts': { icon: Zap, label: 'AI Short', color: '#f59e0b' },
      'model': { icon: Lightbulb, label: 'AI Model', color: '#10b981' },
      'showcase': { icon: Users, label: 'Showcase', color: '#8b5cf6' },
      'career': { icon: Briefcase, label: 'Career', color: '#06b6d4' },
      'event': { icon: Calendar, label: 'Event', color: '#ec4899' }
    };
    return configs[type] || configs.normal;
  };

  const postConfig = getPostTypeConfig(postType);

  // Format content text
  const formatContent = (text) => {
    if (!text) return '';
    
    // Simple URL detection
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const formattedText = text.replace(urlRegex, (url) => 
      `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
    );
    
    return formattedText;
  };

  // Check if content should be truncated
  const shouldTruncateContent = content && content.length > 300 && !showFullContent;

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
  };

  // Handle image click for lightbox
  const handleImageClick = (imageSrc) => {
    setShowImageLightbox(true);
  };

  return (
    <div className={`post-content ${compact ? 'compact' : ''}`}>
      {/* Post Type Badge */}
      <div className="post-type-badge" style={{ color: postConfig.color }}>
        <postConfig.icon size={16} />
        <span>{postConfig.label}</span>
      </div>

      {/* Post Title (for news, events, etc.) */}
      {title && (
        <h3 className="post-title">{title}</h3>
      )}

      {/* Post Text Content */}
      {content && (
        <div className="post-text-content">
          <div 
            className="post-text"
            dangerouslySetInnerHTML={{ __html: formatContent(content) }}
          />
          {shouldTruncateContent && (
            <button 
              className="show-more-btn"
              onClick={() => setShowFullContent(true)}
            >
              Show more
            </button>
          )}
          {showFullContent && content.length > 300 && (
            <button 
              className="show-less-btn"
              onClick={() => setShowFullContent(false)}
            >
              Show less
            </button>
          )}
        </div>
      )}

      {/* Media Content */}
      {media && (
        <div className="post-media">
          {/* Images */}
          {media.images && media.images.length > 0 && (
            <div className="post-images">
              {media.images.map((image, index) => (
                <div 
                  key={index} 
                  className={`post-image ${media.images.length === 1 ? 'single' : ''}`}
                  onClick={() => handleImageClick(image)}
                >
                  {!imageError ? (
                    <img
                      src={image}
                      alt={`Post image ${index + 1}`}
                      onError={handleImageError}
                      loading="lazy"
                    />
                  ) : (
                    <div className="image-placeholder">
                      <Image size={24} />
                      <span>Image unavailable</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Video */}
          {media.video && (
            <div className="post-video">
              <video
                controls
                poster={media.thumbnail}
                preload="metadata"
              >
                <source src={media.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* Document */}
          {media.document && (
            <div className="post-document">
              <a 
                href={media.document} 
                target="_blank" 
                rel="noopener noreferrer"
                className="document-link"
              >
                <FileText size={20} />
                <span>Download Document</span>
                <ExternalLink size={16} />
              </a>
            </div>
          )}
        </div>
      )}

      {/* External Link */}
      {link && (
        <div className="post-link">
          <a 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="link-preview"
          >
            <ExternalLink size={16} />
            <span className="link-text">{link}</span>
          </a>
        </div>
      )}

      {/* Location Info */}
      {location && (
        <div className="post-location">
          <MapPin size={16} />
          <span>{location}</span>
        </div>
      )}

      {/* Event Date */}
      {eventDate && (
        <div className="post-event-date">
          <Calendar size={16} />
          <span>{new Date(eventDate).toLocaleDateString()}</span>
        </div>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="post-tags">
          {tags.map((tag, index) => (
            <span key={index} className="post-tag">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Image Lightbox */}
      {showImageLightbox && (
        <div className="image-lightbox" onClick={() => setShowImageLightbox(false)}>
          <div className="lightbox-content">
            <img 
              src={media?.images?.[0]} 
              alt="Full size" 
            />
            <button 
              className="lightbox-close"
              onClick={() => setShowImageLightbox(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostContent;
