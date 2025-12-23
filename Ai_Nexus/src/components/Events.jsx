import React, { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, Clock, MapPin, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CompanyOnly } from './RoleBasedComponents';
import eventService from '../services/eventService';
import EventCreationForm from './EventCreationForm';
import EventRegistrationModal from './EventRegistrationModal';
import '../styles/Events.css';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Load events
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await eventService.getEvents({ status: 'published' });
      setEvents(response.events || []);
      
      // Load user's registrations
      if (user) {
        const registrations = await eventService.getUserEventRegistrations();
        const registeredEventIds = new Set(registrations.registrations?.map(r => r.event._id) || []);
        setRegisteredEvents(registeredEventIds);
      }
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

  const handleCancelRegistration = async (eventId) => {
    try {
      await eventService.cancelEventRegistration(eventId);
      loadEvents();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getEventsForDay = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((event) => {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const toggleRegistration = (eventId) => {
    const newRegistered = new Set(registeredEvents);
    if (newRegistered.has(eventId)) {
      newRegistered.delete(eventId);
    } else {
      newRegistered.add(eventId);
    }
    setRegisteredEvents(newRegistered);
  };

  const isCompany = user?.role === 'company';
  const isUser = user?.role === 'user';

  return (
    <div className="events-page">
      <div className="events-container">
        {/* Page Header */}
        <div className="events-page-header">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="events-page-title">Events & Conferences</h1>
              <p className="events-page-subtitle">
                Discover and register for the latest AI, tech, and networking events
              </p>
            </div>
            <CompanyOnly>
              <button
                onClick={handleCreateEvent}
                className="create-event-btn"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Event
              </button>
            </CompanyOnly>
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
            <div className="spinner"></div>
            <p>Loading events...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && events.length === 0 && !error && (
          <div className="empty-container">
            <CalendarIcon className="empty-icon" />
            <h3 className="empty-title">No events available</h3>
            <p className="empty-text">
              {isCompany ? 'Be the first to create an event!' : 'Check back later for new events.'}
            </p>
            <CompanyOnly>
              <button onClick={handleCreateEvent} className="create-event-btn">
                <Plus className="w-5 h-5 mr-2" />
                Create First Event
              </button>
            </CompanyOnly>
          </div>
        )}

        {/* Events Grid */}
        {!loading && events.map((event) => (
          <div key={event._id} className="event-card">
            <div className="event-header">
              <h3 className="event-title">{event.title}</h3>
              <div className="event-type-badge">
                {event.eventType || event.category}
              </div>
            </div>

            <p className="event-description">{event.description}</p>

            <div className="event-meta">
              <div className="meta-item">
                <CalendarIcon className="meta-icon" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="meta-item">
                <Clock className="meta-icon" />
                <span>{formatTime(event.time)}</span>
              </div>
              <div className="meta-item">
                <MapPin className="meta-icon" />
                <span>{event.location}</span>
              </div>
              <div className="meta-item">
                <Users className="meta-icon" />
                <span>{event.currentAttendees || event.attendees || 0} registered</span>
              </div>
            </div>

            <div className="event-footer">
              {isUser && (
                registeredEvents.has(event._id) ? (
                  <button
                    onClick={() => handleCancelRegistration(event._id)}
                    className="cancel-registration-btn"
                  >
                    Cancel Registration
                  </button>
                ) : (
                  <button
                    onClick={() => handleRegisterEvent(event)}
                    className="register-btn"
                  >
                    Register Now
                  </button>
                )
              )}
              
              {isCompany && event.organizer === user.id && (
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
    </div>
  );
};

export default Events;
