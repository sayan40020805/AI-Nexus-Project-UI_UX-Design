// Job service for API calls
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Get all jobs with filtering
export const getJobs = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_URL}/api/jobs?${queryParams}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get jobs error:', error);
    throw error;
  }
};

// Get single job
export const getJob = async (jobId) => {
  try {
    const response = await fetch(`${API_URL}/api/jobs/${jobId}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch job');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get job error:', error);
    throw error;
  }
};

// Create new job (company only)
export const createJob = async (jobData) => {
  try {
    const response = await fetch(`${API_URL}/api/jobs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(jobData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to create job');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Create job error:', error);
    throw error;
  }
};

// Update job (company only, own jobs)
export const updateJob = async (jobId, jobData) => {
  try {
    const response = await fetch(`${API_URL}/api/jobs/${jobId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(jobData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to update job');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Update job error:', error);
    throw error;
  }
};

// Delete job (company only, own jobs)
export const deleteJob = async (jobId) => {
  try {
    const response = await fetch(`${API_URL}/api/jobs/${jobId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to delete job');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Delete job error:', error);
    throw error;
  }
};

// Get company's jobs (company only)
export const getCompanyJobs = async () => {
  try {
    const response = await fetch(`${API_URL}/api/jobs/company/my-jobs`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch company jobs');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get company jobs error:', error);
    throw error;
  }
};

// Get job statistics (company only)
export const getJobStats = async () => {
  try {
    const response = await fetch(`${API_URL}/api/jobs/company/stats`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch job statistics');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get job stats error:', error);
    throw error;
  }
};

// Apply for job (user only)
export const applyForJob = async (jobId, applicationData) => {
  try {
    const response = await fetch(`${API_URL}/api/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(applicationData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to apply for job');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Apply for job error:', error);
    throw error;
  }
};

// Get user's applications (user only)
export const getUserApplications = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_URL}/api/my-applications?${queryParams}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch applications');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get user applications error:', error);
    throw error;
  }
};

// Get company's applications (company only)
export const getCompanyApplications = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_URL}/api/company/applications?${queryParams}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch company applications');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get company applications error:', error);
    throw error;
  }
};

// Update application status (company only)
export const updateApplicationStatus = async (applicationId, statusData) => {
  try {
    const response = await fetch(`${API_URL}/api/${applicationId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(statusData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to update application status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Update application status error:', error);
    throw error;
  }
};

// Withdraw application (user only)
export const withdrawApplication = async (applicationId) => {
  try {
    const response = await fetch(`${API_URL}/api/${applicationId}/withdraw`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to withdraw application');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Withdraw application error:', error);
    throw error;
  }
};

// Get application statistics (company only)
export const getApplicationStats = async () => {
  try {
    const response = await fetch(`${API_URL}/api/company/stats`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch application statistics');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get application stats error:', error);
    throw error;
  }
};

export default {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getCompanyJobs,
  getJobStats,
  applyForJob,
  getUserApplications,
  getCompanyApplications,
  updateApplicationStatus,
  withdrawApplication,
  getApplicationStats
};
