import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Briefcase, MapPin, Clock } from 'lucide-react';
import jobService from '../../services/jobService';
import './CreateJob.css';

export default function CreateJob() {
  const navigate = useNavigate();
  const location = useLocation();
  const job = location.state?.job || null;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    jobTitle: job?.jobTitle || '',
    jobDescription: job?.jobDescription || '',
    skillsRequired: job?.skillsRequired || '',
    location: job?.location || '',
    jobType: job?.jobType || 'Full-Time',
    applyDeadline: job?.applyDeadline ? job.applyDeadline.split('T')[0] : ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const jobData = {
        ...formData,
        applyDeadline: formData.applyDeadline || null
      };

      if (job) {
        await jobService.updateJob(job._id, jobData);
      } else {
        await jobService.createJob(jobData);
      }
      
      navigate('/career');
    } catch (err) {
      setError(err.message || 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/career');
  };

  return (
    <div className="create-job-page">
      <div className="create-job-container">
        {/* Header */}
        <div className="create-job-header">
          <button onClick={handleCancel} className="back-button">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Jobs</span>
          </button>
          <h1>{job ? 'Edit Job Vacancy' : 'Post New Job'}</h1>
          <p className="subtitle">Fill in the details to create your job listing</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="create-job-form">
          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label htmlFor="jobTitle">Job Title *</label>
              <div className="input-with-icon">
                <Briefcase className="w-5 h-5" />
                <input
                  type="text"
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Senior Machine Learning Engineer"
                />
              </div>
            </div>

            <div className="form-row">
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
                    placeholder="e.g., San Francisco, CA or Remote"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="jobType">Job Type *</label>
                <select
                  id="jobType"
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="applyDeadline">Application Deadline *</label>
              <div className="input-with-icon">
                <Clock className="w-5 h-5" />
                <input
                  type="date"
                  id="applyDeadline"
                  name="applyDeadline"
                  value={formData.applyDeadline}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Job Details</h2>

            <div className="form-group">
              <label htmlFor="jobDescription">Job Description *</label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleInputChange}
                required
                rows={6}
                placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
              />
              <span className="helper-text">Include information about the team, projects, and growth opportunities</span>
            </div>

            <div className="form-group">
              <label htmlFor="skillsRequired">Skills Required *</label>
              <textarea
                id="skillsRequired"
                name="skillsRequired"
                value={formData.skillsRequired}
                onChange={handleInputChange}
                required
                rows={4}
                placeholder="List the required skills, experience, and qualifications..."
              />
              <span className="helper-text">Include technical skills, soft skills, and any certifications needed</span>
            </div>
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
              {loading ? 'Saving...' : (job ? 'Update Job' : 'Post Job')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

