import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users } from 'lucide-react';
import eventService from '../../services/eventService';
import './CreateEvent.css';

export default function CreateEvent() {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event || null;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date ? event.date.split('T')[0] : '',
    time: event?.time || '',
    endTime: event?.endTime || '',
    location: event?.location || '',
    eventType: event?.eventType || 'Seminar',
    registrationDeadline: event?.registrationDeadline ? event.registrationDeadline.split('T')[0] : '',
    maxAttendees: event?.maxAttendees || '',
    isVirtual: event?.isVirtual || false,
    meetingLink: event?.meetingLink || ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const eventData = {
        ...formData,
        date: new Date(formData.date),
        registrationDeadline: formData.registrationDeadline ? new Date(formData.registrationDeadline) : undefined,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined
      };

      if (event) {
        await eventService.updateEvent(event._id, eventData);
      } else {
        await eventService.createEvent(eventData);
      }
      
      navigate('/events');
    } catch (err) {
      setError(err.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/events');
  };

  return (
    <div className="create-event-page">
      <div className="create-event-container">
        {/* Header */}
        <div className="create-event-header">
          <button onClick={handleCancel} className="back-button">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Events</span>
          </button>
          <h1>{event ? 'Edit Event' : 'Create New Event'}</h1>
          <p className="subtitle">Fill in the details to create your event</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="create-event-form">
          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label htmlFor="title">Event Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., AI Workshop 2025"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Event Date *</label>
                <div className="input-with-icon">
                  <Calendar className="w-5 h-5" />
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="time">Start Time *</label>
                <div className="input-with-icon">
                  <Clock className="w-5 h-5" />
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="endTime">End Time</label>
                <div className="input-with-icon">
                  <Clock className="w-5 h-5" />
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="eventType">Event Type *</label>
                <select
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Seminar">Seminar</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Workshop">Workshop</option>
                  <option value="conference">Conference</option>
                  <option value="networking">Networking</option>
                  <option value="training">Training</option>
                  <option value="meetup">Meetup</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <div className="input-with-icon">
                <MapPin className="w-5 h-5" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., San Francisco, CA or Online"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Event Details</h2>

            <div className="form-group">
              <label htmlFor="description">Event Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={5}
                placeholder="Describe the event, what attendees can expect, agenda, etc..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="registrationDeadline">Registration Deadline</label>
                <div className="input-with-icon">
                  <Calendar className="w-5 h-5" />
                  <input
                    type="date"
                    id="registrationDeadline"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="maxAttendees">Max Attendees</label>
                <div className="input-with-icon">
                  <Users className="w-5 h-5" />
                  <input
                    type="number"
                    id="maxAttendees"
                    name="maxAttendees"
                    value={formData.maxAttendees}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Virtual Event Settings</h2>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isVirtual"
                  checked={formData.isVirtual}
                  onChange={handleInputChange}
                />
                <span className="checkmark"></span>
                This is a virtual event
              </label>
            </div>

            {formData.isVirtual && (
              <div className="form-group">
                <label htmlFor="meetingLink">Meeting Link</label>
                <input
                  type="url"
                  id="meetingLink"
                  name="meetingLink"
                  value={formData.meetingLink}
                  onChange={handleInputChange}
                  placeholder="https://meet.google.com/..."
                />
                <span className="helper-text">Add the video conferencing link (Google Meet, Zoom, etc.)</span>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Saving...' : (event ? 'Update Event' : 'Create Event')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

