
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Building, Plus, Search, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import eventService from '../services/eventService';
import { EventCreationForm } from './EventCreationForm';
import { EventRegistrationModal } from './EventRegistrationModal';
import '../styles/Events_DYNAMIC.css';

export function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Load events
  useEffect(() => {
    loadEvents();
  }, [searchTerm, filterType, currentPage]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        search: searchTerm || undefined,
        eventType: filterType !== 'All' ? filterType : undefined,
        page: currentPage,
        limit: 12
      };

      const response = await eventService.getEvents(params);
      setEvents(response.events || []);
    } catch (err) {
      console.error('Load events error:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventService.deleteEvent(eventId);
        loadEvents();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleRegisterEvent = (event) => {
    setSelectedEvent(event);
    setShowRegistrationModal(true);
  };

  const formatDate = (dateString) => {
    return eventService.formatDate(dateString);
  };

  const formatTime = (timeString) => {
    return eventService.formatTime(timeString);
  };

  const isEventUpcoming = (event) => {
    return eventService.isUpcoming(event);
  };

  const isRegistrationOpen = (event) => {
    return eventService.isRegistrationOpen(event);
  };

  // Check user roles
  const isCompany = user?.role === 'company';
  const isUser = user?.role === 'user';

  const eventTypes = [
    'All',
    'AI Hackathon',
    'AI Quiz',
    'Workshop',
    'Conference',
    'Webinar',
    'Symposium',
    'Competition',
    'Meetup'
  ];

  return (
    <div className="events-page-container">
      {/* Header */}
      <div className="events-header">
        <div className="events-header-content">
          <div className="events-title-section">
            <h1 className="events-title">AI Events & Conferences</h1>
            <p className="events-subtitle">
              Discover, organize, and participate in AI events, hackathons, and competitions
            </p>
          </div>
          {isCompany && (
            <button onClick={handleCreateEvent} className="create-event-btn">
              <Plus className="w-5 h-5 mr-2" />
              Create Event
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="events-controls">
        <div className="search-section">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search events, companies, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        <div className="filter-section">
          <div className="filter-wrapper">
            <Filter className="filter-icon" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              {eventTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'All' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="error-container">
          <p className="error-text">{error}</p>
          <button onClick={loadEvents} className="retry-button">Try Again</button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading events...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && events.length === 0 && !error && (
        <div className="empty-container">
          <Calendar className="empty-icon" />
          <h3 className="empty-title">No events found</h3>
          <p className="empty-text">
            {searchTerm || filterType !== 'All' 
              ? 'Try adjusting your search or filters' 
              : isCompany 
                ? 'Be the first to create an AI event!' 
                : 'Check back later for new events.'
            }
          </p>
          {isCompany && !searchTerm && filterType === 'All' && (
            <button onClick={handleCreateEvent} className="create-event-btn">
              <Plus className="w-5 h-5 mr-2" />
              Create First Event
            </button>
          )}
        </div>
      )}

      {/* Events Grid */}
      {!loading && events.map((event) => (
        <div key={event._id} className="event-card">
          {/* Event Image */}
          <div className="event-image-section">
            {event.bannerImage ? (
              <img 
                src={event.bannerImage} 
                alt={event.title}
                className="event-image"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="event-image-placeholder">
                <Calendar className="w-12 h-12" />
              </div>
            )}
            <div className="event-badges">
              <span className={`event-type-badge ${event.eventType.toLowerCase().replace(' ', '-')}`}>
                {event.eventType}
              </span>
              {event.isFree && (
                <span className="free-badge">Free</span>
              )}
            </div>
          </div>

          {/* Event Content */}
          <div className="event-content">
            <div className="event-header">
              <h3 className="event-title">{event.title}</h3>
              <div className="event-company">
                <div className="company-logo">
                  {event.organizer?.companyLogo ? (
                    <img 
                      src={event.organizer.companyLogo} 
                      alt={event.organizer.companyName}
                      className="logo-img"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="logo-placeholder">
                      <Building className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <span className="company-name">{event.organizer?.companyName}</span>
              </div>
            </div>

            <p className="event-description">{event.description}</p>

            {/* Event Details */}
            <div className="event-details">
              <div className="detail-item">
                <Calendar className="detail-icon" />
                <span>{formatDate(event.startDate)}</span>
              </div>
              <div className="detail-item">
                <Clock className="detail-icon" />
                <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
              </div>
              <div className="detail-item">
                <MapPin className="detail-icon" />
                <span>{event.location}</span>
              </div>
              <div className="detail-item">
                <Users className="detail-icon" />
                <span>{event.currentAttendees || 0}/{event.maxAttendees || '∞'}</span>
              </div>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="event-tags">
                {event.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="event-tag">{tag}</span>
                ))}
                {event.tags.length > 3 && (
                  <span className="tag-more">+{event.tags.length - 3}</span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="event-actions">
              {isCompany && event.organizer?._id === user.id && (
                <div className="company-actions">
                  <button
                    onClick={() => handleEditEvent(event)}
                    className="action-button edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event._id)}
                    className="action-button delete"
                  >
                    Delete
                  </button>
                </div>
              )}
              
              <div className="user-actions">
                {isUser ? (
                  <button 
                    onClick={() => handleRegisterEvent(event)}
                    className="register-button"
                    disabled={!isRegistrationOpen(event)}
                  >
                    {isRegistrationOpen(event) ? 'Register Now' : 'Registration Closed'}
                  </button>
                ) : isCompany && event.organizer?._id === user.id ? (
                  <span className="organizer-stats">
                    {event.currentAttendees || 0} registered
                  </span>
                ) : (
                  <span className="login-hint">
                    Sign in to register
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Modals */}
      {showEventForm && (
        <EventCreationForm
          event={selectedEvent}
          onClose={() => setShowEventForm(false)}
          onSuccess={() => {
            loadEvents();
            setShowEventForm(false);
          }}
        />
      )}

      {showRegistrationModal && selectedEvent && (
        <EventRegistrationModal
          event={selectedEvent}
          onClose={() => {
            setShowRegistrationModal(false);
            setSelectedEvent(null);
          }}
          onSuccess={() => {
            loadEvents();
            setShowRegistrationModal(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
}

