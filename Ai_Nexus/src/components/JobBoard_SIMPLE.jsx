import { useState, useEffect } from 'react';
import { MapPin, Briefcase, Building, Plus, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import jobService from '../services/jobService';
import { JobVacancyForm } from './JobVacancyForm';
import { JobApplicationModal } from './JobApplicationModal';
import '../styles/JobBoard.css';

export function JobBoard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showJobForm, setShowJobForm] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Load jobs
  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Simple API call to get all active jobs
      const response = await jobService.getJobs({ status: 'active' });
      setJobs(response.jobs || []);
    } catch (err) {
      console.error('Load jobs error:', err);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = () => {
    setSelectedJob(null);
    setShowJobForm(true);
  };

  const handleEditJob = (job) => {
    setSelectedJob(job);
    setShowJobForm(true);
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await jobService.deleteJob(jobId);
        loadJobs();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleApplyJob = (job) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  // Check user roles
  const isCompany = user?.role === 'company';
  const isUser = user?.role === 'user';

  return (
    <div className="job-board-container">
      {/* Header */}
      <div className="job-header-section">
        <h2 className="page-title">Job Vacancies</h2>
        {isCompany && (
          <button onClick={handleCreateJob} className="create-job-btn">
            <Plus className="w-5 h-5 mr-2" />
            Post Job
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="error-container">
          <p className="error-text">{error}</p>
          <button onClick={loadJobs} className="retry-button">Try Again</button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading jobs...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && jobs.length === 0 && !error && (
        <div className="empty-container">
          <Building className="empty-icon" />
          <h3 className="empty-title">No jobs available</h3>
          <p className="empty-text">
            {isCompany ? 'Be the first to post a job vacancy!' : 'Check back later for new opportunities.'}
          </p>
          {isCompany && (
            <button onClick={handleCreateJob} className="create-job-btn">
              <Plus className="w-5 h-5 mr-2" />
              Post First Job
            </button>
          )}
        </div>
      )}

      {/* Job List */}
      {!loading && jobs.map((job) => (
        <div key={job._id} className="job-item">
          <div className="job-main">
            <div className="company-section">
              <div className="company-logo">
                {job.company?.companyLogo ? (
                  <img 
                    src={job.company.companyLogo} 
                    alt={job.company.companyName}
                    className="logo-img"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="logo-placeholder">
                    <Building className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="job-basic-info">
                <h3 className="job-title">{job.title}</h3>
                <div className="company-name">
                  <Building className="w-4 h-4" />
                  <span>{job.company?.companyName}</span>
                </div>
                <p className="job-desc">{job.description}</p>
              </div>
            </div>
            
            {/* Company Actions */}
            {isCompany && job.company?._id === user.id && (
              <div className="company-actions">
                <button
                  onClick={() => handleEditJob(job)}
                  className="action-button edit"
                  title="Edit Job"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteJob(job._id)}
                  className="action-button delete"
                  title="Delete Job"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="job-meta">
            <div className="meta-item">
              <MapPin className="meta-icon" />
              <span>{job.location}</span>
            </div>
            <div className="meta-item">
              <Briefcase className="meta-icon" />
              <span>{job.jobType}</span>
            </div>
            <div className="meta-item">
              <Clock className="meta-icon" />
              <span>{formatDate(job.createdAt)}</span>
            </div>
          </div>

          {job.techStack && job.techStack.length > 0 && (
            <div className="tech-tags">
              {job.techStack.map((tech, index) => (
                <span key={index} className="tech-tag">
                  {tech}
                </span>
              ))}
            </div>
          )}

          <div className="job-footer">
            <span className="applicant-info">
              {job.applicantCount || job.applicants?.length || 0} applicants
            </span>
            
            <div className="action-section">
              {isUser ? (
                <button 
                  onClick={() => handleApplyJob(job)}
                  className="apply-button"
                >
                  Apply Now
                </button>
              ) : isCompany && job.company?._id === user.id ? (
                <span className="company-stats">
                  {job.applicantCount || 0} total applications
                </span>
              ) : (
                <span className="login-hint">
                  Sign in to apply
                </span>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Modals */}
      {showJobForm && (
        <JobVacancyForm
          job={selectedJob}
          onClose={() => setShowJobForm(false)}
          onSuccess={() => {
            loadJobs();
            setShowJobForm(false);
          }}
        />
      )}

      {showApplicationModal && selectedJob && (
        <JobApplicationModal
          job={selectedJob}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedJob(null);
          }}
          onSuccess={() => {
            loadJobs();
            setShowApplicationModal(false);
            setSelectedJob(null);
          }}
        />
      )}
    </div>
  );
}

