import React, { useState } from 'react';
import { Clock, MapPin, Users, ExternalLink, Video } from 'lucide-react';

const EventCard = ({ event, isRegistered, onToggleRegistration }) => {
  const [isHovered, setIsHovered] = useState(false);

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const locationIcon = event.format === 'Virtual' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />;

  return (
    <div 
      className="event-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Event Image */}
      <div className="event-image-wrapper">
        <img 
          src={event.image} 
          alt={event.title} 
          className="event-image"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%230284c7" width="100" height="100"/%3E%3C/svg%3E';
          }}
        />
        <div className="event-image-overlay">
          <span className="event-type-badge">{event.type}</span>
        </div>
      </div>

      {/* Event Content */}
      <div className="event-content">
        {/* Title */}
        <h3 className="event-title">{event.title}</h3>

        {/* Description */}
        <p className="event-description">{event.description}</p>

        {/* Details Grid */}
        <div className="event-details">
          <div className="event-detail">
            <span className="event-detail-icon">
              {(() => {
                const now = new Date();
                const eventDateObj = new Date(event.date);
                return eventDateObj.toDateString() === now.toDateString() ? '📅' : '📆';
              })()}
            </span>
            <span>{formattedDate}</span>
          </div>
          <div className="event-detail">
            <span className="event-detail-icon">⏰</span>
            <span>{event.time}</span>
          </div>
          <div className="event-detail">
            <span className="event-detail-icon">
              {event.format === 'Virtual' ? '🌐' : '📍'}
            </span>
            <span>{event.location}</span>
          </div>
          <div className="event-detail">
            <span className="event-detail-icon">👥</span>
            <span>{event.attendees.toLocaleString()} attendees</span>
          </div>
        </div>

        {/* Speakers */}
        {event.speakers && event.speakers.length > 0 && (
          <div className="event-speakers">
            <p className="event-speakers-title">Featured Speakers</p>
            <div className="event-speakers-list">
              {event.speakers.map((speaker) => (
                <span key={speaker} className="event-speaker-tag">
                  {speaker}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="event-actions">
          <button 
            onClick={() => onToggleRegistration(event.id)}
            className={`event-btn primary ${isRegistered ? 'registered' : ''}`}
          >
            {isRegistered ? (
              <>
                <span>✓</span> Registered
              </>
            ) : (
              'Register Now'
            )}
          </button>
          <button className="event-btn secondary" aria-label="View event details">
            <span>Details</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
