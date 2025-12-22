
import { useState } from 'react';
import { X, Upload, FileText, User, Mail, Phone, Building, Heart, Star } from 'lucide-react';
import eventService from '../services/eventService';
import { useAuth } from '../context/AuthContext';

export function EventRegistrationModal({ event, onClose, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  const [formData, setFormData] = useState({
    firstName: user?.username?.split(' ')[0] || '',
    lastName: user?.username?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    profession: '',
    company: '',
    experience: '',
    education: '',
    motivation: '',
    expectations: '',
    aiExperience: 'No experience',
    skills: '',
    portfolio: '',
    github: '',
    linkedin: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    dietaryRestrictions: '',
    accessibilityNeeds: '',
    specialRequests: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      file,
      type: getFileType(file.name),
      name: file.name
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return 'Resume';
    if (['doc', 'docx'].includes(ext)) return 'Portfolio';
    if (['jpg', 'jpeg', 'png'].includes(ext)) return 'ID Card';
    return 'Other';
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const registrationData = {
        ...formData,
        skills: formData.skills
      };

      await eventService.registerForEvent(event._id, registrationData, uploadedFiles);
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="event-registration-modal-overlay">
        <div className="event-registration-success-container">
          <div className="success-content">
            <div className="success-icon">
              <svg className="success-checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="success-title">Registration Submitted!</h2>
            <p className="success-message">
              Your registration for <strong>{event.title}</strong> has been submitted successfully. 
              You will receive a confirmation email shortly.
            </p>
            <div className="success-close">
              <button onClick={onClose} className="success-close-btn">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="event-registration-modal-overlay">
      <div className="event-registration-container">
        <div className="event-registration-wrapper">
          {/* Header */}
          <div className="event-registration-header">
            <div className="header-content">
              <h1 className="event-registration-title">Register for Event</h1>
              <button onClick={onClose} className="close-button">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="header-divider"></div>
          </div>

          {/* Event Info */}
          <div className="event-info-card">
            <h2 className="event-title">{event.title}</h2>
            <div className="event-meta">
              <span className="event-date">{eventService.formatDate(event.startDate)}</span>
              <span className="event-time">{event.startTime} - {event.endTime}</span>
              <span className="event-location">{event.location}</span>
            </div>
            <p className="event-description">{event.description}</p>
          </div>

          {/* Form */}
          <div className="event-registration-form">
            {error && (
              <div className="error-alert">
                <div className="error-icon">⚠️</div>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="registration-form">
              {/* Personal Information */}
              <div className="form-section">
                <h3 className="section-title">
                  <User className="w-5 h-5" />
                  Personal Information
                </h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="Enter your first name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="form-section">
                <h3 className="section-title">
                  <Building className="w-5 h-5" />
                  Professional Information
                </h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Profession</label>
                    <input
                      type="text"
                      name="profession"
                      value={formData.profession}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Software Engineer, Data Scientist, etc."
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Company/Organization</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Your company or organization"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Experience Level</label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Select experience level</option>
                      <option value="Student">Student</option>
                      <option value="0-1 years">0-1 years</option>
                      <option value="1-3 years">1-3 years</option>
                      <option value="3-5 years">3-5 years</option>
                      <option value="5-10 years">5-10 years</option>
                      <option value="10+ years">10+ years</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Education</label>
                    <input
                      type="text"
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Bachelor's in Computer Science, etc."
                    />
                  </div>
                </div>
              </div>

              {/* AI/ML Background */}
              <div className="form-section">
                <h3 className="section-title">
                  <Star className="w-5 h-5" />
                  AI/ML Background
                </h3>
                
                <div className="form-group">
                  <label className="form-label">AI/ML Experience Level</label>
                  <select
                    name="aiExperience"
                    value={formData.aiExperience}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="No experience">No experience</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Relevant Skills (comma-separated)</label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Python, TensorFlow, PyTorch, etc."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Portfolio Website</label>
                    <input
                      type="url"
                      name="portfolio"
                      value={formData.portfolio}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="https://your-portfolio.com"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">GitHub Profile</label>
                    <input
                      type="url"
                      name="github"
                      value={formData.github}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="https://github.com/username"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">LinkedIn Profile</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>

              {/* Motivation and Expectations */}
              <div className="form-section">
                <h3 className="section-title">
                  <Heart className="w-5 h-5" />
                  Motivation & Expectations
                </h3>
                
                <div className="form-group">
                  <label className="form-label">Why do you want to attend this event? *</label>
                  <textarea
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="form-textarea"
                    placeholder="Tell us about your interest in this event and what you hope to gain from attending..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">What are your expectations?</label>
                  <textarea
                    name="expectations"
                    value={formData.expectations}
                    onChange={handleInputChange}
                    rows={3}
                    className="form-textarea"
                    placeholder="What specific knowledge, skills, or connections do you hope to gain?"
                  />
                </div>
              </div>

              {/* Required Documents */}
              {event.requiredDocuments && event.requiredDocuments.length > 0 && (
                <div className="form-section">
                  <h3 className="section-title">
                    <FileText className="w-5 h-5" />
                    Required Documents
                  </h3>
                  
                  <div className="form-group">
                    <label className="form-label">Upload Documents</label>
                    <div className="file-upload-area">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        className="hidden-input"
                        id="documents-upload"
                      />
                      <label htmlFor="documents-upload" className="file-upload-label">
                        <Upload className="w-8 h-8" />
                        <p>Click to upload or drag and drop</p>
                        <small>PDF, DOC, DOCX, JPG, PNG (max 10MB each)</small>
                      </label>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="uploaded-files">
                        <h4>Uploaded Files:</h4>
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="uploaded-file">
                            <div className="file-info">
                              <FileText className="w-4 h-4" />
                              <span>{file.name}</span>
                              <span className="file-type">({file.type})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="remove-file-btn"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="required-docs-info">
                    <p><strong>Required Documents:</strong></p>
                    <ul>
                      {event.requiredDocuments.map((doc, index) => (
                        <li key={index}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              <div className="form-section">
                <h3 className="section-title">Emergency Contact</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Contact Name</label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Emergency contact full name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Relationship</label>
                    <input
                      type="text"
                      name="emergencyContactRelationship"
                      value={formData.emergencyContactRelationship}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Parent, Spouse, Friend, etc."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="form-section">
                <h3 className="section-title">Additional Information</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Dietary Restrictions</label>
                    <input
                      type="text"
                      name="dietaryRestrictions"
                      value={formData.dietaryRestrictions}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Vegetarian, Vegan, Gluten-free, etc."
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Accessibility Needs</label>
                    <input
                      type="text"
                      name="accessibilityNeeds"
                      value={formData.accessibilityNeeds}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Wheelchair access, Sign language interpreter, etc."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Special Requests</label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    rows={3}
                    className="form-textarea"
                    placeholder="Any other special requests or accommodations needed..."
                  />
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
                      <span>Submitting Registration...</span>
                    </div>
                  ) : (
                    <span>Submit Registration</span>
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

