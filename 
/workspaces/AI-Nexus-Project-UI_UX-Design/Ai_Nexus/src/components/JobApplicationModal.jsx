
import { useState } from 'react';
import { X, Upload, FileText, User, Mail, MapPin, Briefcase, Building, Send } from 'lucide-react';
import jobService from '../services/jobService';
import { useAuth } from '../context/AuthContext';
import '../styles/JobApplicationModal.css';

export function JobApplicationModal({ job, onClose, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    coverLetter: '',
    additionalInfo: '',
    resume: null,
    portfolio: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const applicationData = {
        coverLetter: formData.coverLetter,
        additionalInfo: formData.additionalInfo,
        resume: formData.resume ? formData.resume.name : null,
        portfolio: formData.portfolio ? formData.portfolio.name : null
      };

      await jobService.applyForJob(job._id, applicationData);
      
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (success) {
    return (
      <div className="application-modal-overlay">
        <div className="application-success-container">
          <div className="success-content">
            <div className="success-icon">
              <svg className="success-checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="success-title">Application Submitted!</h2>
            <p className="success-message">
              Your application has been successfully submitted. The company will review it and get back to you soon.
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
    <div className="application-modal-overlay">
      <div className="application-form-container">
        <div className="application-form-wrapper">
          {/* Header */}
          <div className="application-header">
            <div className="header-content">
              <h1 className="application-title">Apply for Position</h1>
              <button onClick={onClose} className="close-button">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="header-divider"></div>
          </div>

          {/* Job Information Card */}
          <div className="job-info-card">
            <div className="job-header">
              <div className="company-logo-section">
                {job.company?.companyLogo ? (
                  <img 
                    src={job.company.companyLogo} 
                    alt={job.company.companyName}
                    className="company-logo"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="company-logo-placeholder">
                    <Building className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="job-details">
                <h2 className="job-title">{job.title}</h2>
                <div className="company-name">
                  <Building className="w-4 h-4" />
                  <span>{job.company?.companyName}</span>
                </div>
                <div className="job-meta">
                  <div className="meta-item">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="meta-item">
                    <Briefcase className="w-4 h-4" />
                    <span>{job.jobType}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Container */}
          <div className="application-form">
            {error && (
              <div className="error-alert">
                <div className="error-icon">⚠️</div>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="form-content">
              {/* Cover Letter Section */}
              <div className="form-section">
                <div className="section-header">
                  <label className="section-label">Cover Letter *</label>
                  <span className="section-hint">Tell us why you're a great fit for this position</span>
                </div>
                <textarea
                  name="coverLetter"
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="form-textarea"
                  placeholder="Write a compelling cover letter explaining why you're the perfect candidate for this role..."
                />
              </div>

              {/* Additional Information Section */}
              <div className="form-section">
                <div className="section-header">
                  <label className="section-label">Additional Information</label>
                  <span className="section-hint">Portfolio links, availability, salary expectations, etc.</span>
                </div>
                <textarea
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  rows={4}
                  className="form-textarea"
                  placeholder="Any additional information you'd like to share with the employer..."
                />
              </div>

              {/* File Upload Section */}
              <div className="form-section">
                <div className="section-header">
                  <label className="section-label">Documents</label>
                  <span className="section-hint">Upload your resume and portfolio</span>
                </div>
                <div className="file-upload-grid">
                  {/* Resume Upload */}
                  <div className="file-upload-card">
                    <input
                      type="file"
                      name="resume"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      className="hidden-input"
                      id="resume-upload"
                    />
                    <label htmlFor="resume-upload" className="file-upload-label">
                      <div className="upload-icon">
                        <Upload className="w-8 h-8" />
                      </div>
                      <div className="upload-content">
                        <h4 className="upload-title">Resume</h4>
                        <p className="upload-subtitle">
                          {formData.resume ? formData.resume.name : 'Click to upload'}
                        </p>
                        {formData.resume && (
                          <p className="upload-size">{formatFileSize(formData.resume.size)}</p>
                        )}
                        <span className="upload-hint">PDF, DOC, DOCX (max 5MB)</span>
                      </div>
                    </label>
                  </div>

                  {/* Portfolio Upload */}
                  <div className="file-upload-card">
                    <input
                      type="file"
                      name="portfolio"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.zip"
                      className="hidden-input"
                      id="portfolio-upload"
                    />
                    <label htmlFor="portfolio-upload" className="file-upload-label">
                      <div className="upload-icon">
                        <FileText className="w-8 h-8" />
                      </div>
                      <div className="upload-content">
                        <h4 className="upload-title">Portfolio</h4>
                        <p className="upload-subtitle">
                          {formData.portfolio ? formData.portfolio.name : 'Click to upload'}
                        </p>
                        {formData.portfolio && (
                          <p className="upload-size">{formatFileSize(formData.portfolio.size)}</p>
                        )}
                        <span className="upload-hint">PDF, DOC, DOCX, ZIP (max 10MB)</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Applicant Information */}
              <div className="applicant-info-card">
                <div className="info-header">
                  <h4 className="info-title">Your Application Will Include</h4>
                </div>
                <div className="info-content">
                  <div className="info-item">
                    <User className="w-4 h-4" />
                    <span>Name: {user.username}</span>
                  </div>
                  <div className="info-item">
                    <Mail className="w-4 h-4" />
                    <span>Email: {user.email}</span>
                  </div>
                  {user.profilePicture && (
                    <div className="info-item">
                      <div className="w-4 h-4 bg-blue-100 rounded-full"></div>
                      <span>Profile picture will be included</span>
                    </div>
                  )}
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
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <div className="submit-content">
                      <Send className="w-4 h-4" />
                      <span>Submit Application</span>
                    </div>
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

