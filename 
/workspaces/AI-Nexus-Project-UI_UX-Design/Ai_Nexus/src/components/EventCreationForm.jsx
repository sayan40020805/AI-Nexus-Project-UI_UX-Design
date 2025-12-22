
import { useState } from 'react';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import eventService from '../services/eventService';

export function EventCreationForm({ event, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    eventType: event?.eventType || 'AI Hackathon',
    category: event?.category || 'AI/ML',
    format: event?.format || 'Virtual',
    startDate: event?.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '',
    endDate: event?.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
    startTime: event?.startTime || '',
    endTime: event?.endTime || '',
    location: event?.location || '',
    address: event?.address || '',
    virtualLink: event?.virtualLink || '',
    maxAttendees: event?.maxAttendees || 100,
    registrationDeadline: event?.registrationDeadline ? new Date(event.registrationDeadline).toISOString().split('T')[0] : '',
    isFree: event?.isFree !== false,
    ticketPrice: event?.ticketPrice || 0,
    requirements: event?.requirements || '',
    requiredDocuments: event?.requiredDocuments || [],
    speakers: event?.speakers || [],
    agenda: event?.agenda || [],
    tags: event?.tags || [],
    skillsRequired: event?.skillsRequired || [],
    bannerImage: event?.bannerImage || '',
    contactEmail: event?.contactEmail || '',
    contactPhone: event?.contactPhone || '',
    allowWaitlist: event?.allowWaitlist || false,
    requiresApproval: event?.requiresApproval || false,
    aiCategory: event?.aiCategory || 'Machine Learning',
    difficultyLevel: event?.difficultyLevel || 'Intermediate'
  });

  const [newSpeaker, setNewSpeaker] = useState({
    name: '',
    title: '',
    company: '',
    bio: ''
  });

  const [newAgendaItem, setNewAgendaItem] = useState({
    time: '',
    title: '',
    description: '',
    speaker: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDocumentToggle = (docType) => {
    setFormData(prev => ({
      ...prev,
      requiredDocuments: prev.requiredDocuments.includes(docType)
        ? prev.requiredDocuments.filter(d => d !== docType)
        : [...prev.requiredDocuments, docType]
    }));
  };

  const handleAddSpeaker = () => {
    if (newSpeaker.name.trim()) {
      setFormData(prev => ({
        ...prev,
        speakers: [...prev.speakers, { ...newSpeaker }]
      }));
      setNewSpeaker({ name: '', title: '', company: '', bio: '' });
    }
  };

  const handleRemoveSpeaker = (index) => {
    setFormData(prev => ({
      ...prev,
      speakers: prev.speakers.filter((_, i) => i !== index)
    }));
  };

  const handleAddAgendaItem = () => {
    if (newAgendaItem.time.trim() && newAgendaItem.title.trim()) {
      setFormData(prev => ({
        ...prev,
        agenda: [...prev.agenda, { ...newAgendaItem }]
      }));
      setNewAgendaItem({ time: '', title: '', description: '', speaker: '' });
    }
  };

  const handleRemoveAgendaItem = (index) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index)
    }));
  };

  const handleTagInput = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const handleSkillsInput = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setFormData(prev => ({
      ...prev,
      skillsRequired: skills
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (event) {
        await eventService.updateEvent(event._id, formData);
      } else {
        await eventService.createEvent(formData);
      }
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const documentTypes = [
    'Resume',
    'Portfolio',
    'ID Card',
    'Student ID',
    'Professional Certificate',
    'Project Proposal',
    'GitHub Link',
    'LinkedIn Profile',
    'Other'
  ];

  if (success) {
    return (
      <div className="event-form-modal-overlay">
        <div className="event-form-success-container">
          <div className="success-content">
            <div className="success-icon">
              <svg className="success-checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="success-title">
              {event ? 'Event Updated!' : 'Event Created!'}
            </h2>
            <p className="success-message">
              Your event has been {event ? 'updated' : 'created'} successfully and is now {event ? 'live' : 'available for registration'}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="event-form-modal-overlay">
      <div className="event-form-container">
        <div className="event-form-wrapper">
          {/* Header */}
          <div className="event-form-header">
            <div className="header-content">
              <h1 className="event-form-title">
                {event ? 'Edit Event' : 'Create New Event'}
              </h1>
              <button onClick={onClose} className="close-button">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="header-divider"></div>
          </div>

          {/* Form */}
          <div className="event-form-content">
            {error && (
              <div className="error-alert">
                <div className="error-icon">⚠️</div>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="event-form">
              {/* Basic Information */}
              <div className="form-section">
                <h3 className="section-title">Basic Information</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Event Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="Enter event title"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Event Type *</label>
                    <select
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleInputChange}
                      required
                      className="form-select"
                    >
                      <option value="AI Hackathon">AI Hackathon</option>
                      <option value="AI Quiz">AI Quiz</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Conference">Conference</option>
                      <option value="Webinar">Webinar</option>
                      <option value="Symposium">Symposium</option>
                      <option value="Competition">Competition</option>
                      <option value="Meetup">Meetup</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="form-textarea"
                    placeholder="Describe your event..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="form-select"
                    >
                      <option value="AI/ML">AI/ML</option>
                      <option value="Deep Learning">Deep Learning</option>
                      <option value="NLP">NLP</option>
                      <option value="Computer Vision">Computer Vision</option>
                      <option value="Robotics">Robotics</option>
                      <option value="Healthcare AI">Healthcare AI</option>
                      <option value="Climate AI">Climate AI</option>
                      <option value="General AI">General AI</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Format *</label>
                    <select
                      name="format"
                      value={formData.format}
                      onChange={handleInputChange}
                      required
                      className="form-select"
                    >
                      <option value="Virtual">Virtual</option>
                      <option value="In-person">In-person</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Date and Time */}
              <div className="form-section">
                <h3 className="section-title">Date & Time</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">End Date *</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Time *</label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">End Time *</label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Registration Deadline *</label>
                  <input
                    type="date"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="form-section">
                <h3 className="section-title">Location</h3>
                
                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="City, State or Online Platform"
                  />
                </div>

                {formData.format === 'In-person' && (
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Full address"
                    />
                  </div>
                )}

                {formData.format === 'Virtual' && (
                  <div className="form-group">
                    <label className="form-label">Virtual Link</label>
                    <input
                      type="url"
                      name="virtualLink"
                      value={formData.virtualLink}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Zoom/Teams/YouTube link"
                    />
                  </div>
                )}
              </div>

              {/* Event Settings */}
              <div className="form-section">
                <h3 className="section-title">Event Settings</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Max Attendees</label>
                    <input
                      type="number"
                      name="maxAttendees"
                      value={formData.maxAttendees}
                      onChange={handleInputChange}
                      min="1"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">AI Category</label>
                    <select
                      name="aiCategory"
                      value={formData.aiCategory}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="Machine Learning">Machine Learning</option>
                      <option value="Generative AI">Generative AI</option>
                      <option value="Computer Vision">Computer Vision</option>
                      <option value="Natural Language Processing">Natural Language Processing</option>
                      <option value="Reinforcement Learning">Reinforcement Learning</option>
                      <option value="AI Safety">AI Safety</option>
                      <option value="AI Ethics">AI Ethics</option>
                      <option value="Robotics">Robotics</option>
                      <option value="Healthcare AI">Healthcare AI</option>
                      <option value="Climate AI">Climate AI</option>
                      <option value="Financial AI">Financial AI</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Difficulty Level</label>
                    <select
                      name="difficultyLevel"
                      value={formData.difficultyLevel}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isFree"
                        checked={formData.isFree}
                        onChange={handleInputChange}
                      />
                      Free Event
                    </label>
                  </div>
                </div>

                {!formData.isFree && (
                  <div className="form-group">
                    <label className="form-label">Ticket Price ($)</label>
                    <input
                      type="number"
                      name="ticketPrice"
                      value={formData.ticketPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="form-input"
                    />
                  </div>
                )}

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="allowWaitlist"
                      checked={formData.allowWaitlist}
                      onChange={handleInputChange}
                    />
                    Allow waitlist when full
                  </label>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="requiresApproval"
                      checked={formData.requiresApproval}
                      onChange={handleInputChange}
                    />
                    Manual approval required
                  </label>
                </div>
              </div>

              {/* Tags and Skills */}
              <div className="form-section">
                <h3 className="section-title">Tags & Skills</h3>
                
                <div className="form-group">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={handleTagInput}
                    className="form-input"
                    placeholder="AI, Machine Learning, Python, etc."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Required Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.skillsRequired.join(', ')}
                    onChange={handleSkillsInput}
                    className="form-input"
                    placeholder="Python, TensorFlow, Data Analysis, etc."
                  />
                </div>
              </div>

              {/* Requirements and Documents */}
              <div className="form-section">
                <h3 className="section-title">Requirements & Documents</h3>
                
                <div className="form-group">
                  <label className="form-label">Requirements</label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    rows={3}
                    className="form-textarea"
                    placeholder="What participants need to prepare or know..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Required Documents</label>
                  <div className="checkbox-grid">
                    {documentTypes.map(doc => (
                      <label key={doc} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.requiredDocuments.includes(doc)}
                          onChange={() => handleDocumentToggle(doc)}
                        />
                        {doc}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="form-section">
                <h3 className="section-title">Contact Information</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Contact Email</label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="contact@company.com"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button
                  type="button"
                  onClick={onClose}
                  className="cancel-button"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="loading-content">
                      <div className="loading-spinner"></div>
                      <span>{event ? 'Updating...' : 'Creating...'}</span>
                    </div>
                  ) : (
                    <span>{event ? 'Update Event' : 'Create Event'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

