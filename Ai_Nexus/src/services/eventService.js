// Event service for API calls
const getApiUrl = () => {
  // Ensure consistent URL format to avoid CORS issues
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.replace('http://127.0.0.1', 'http://localhost').replace('https://127.0.0.1', 'http://localhost');
  }
  return 'http://localhost:5001';
};

const API_URL = getApiUrl();

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Enhanced retry mechanism with better error handling
const fetchWithRetry = async (url, options, maxRetries = 2) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      // If rate limited, wait and retry with backoff
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || Math.min(Math.pow(2, i) * 2000, 10000);
        console.log(`Rate limited. Retrying after ${retryAfter}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter));
        continue;
      }
      
      // If server error, retry after delay
      if (response.status >= 500 && response.status < 600) {
        const delay = Math.min(Math.pow(2, i) * 1000, 5000); // Cap at 5 seconds
        console.log(`Server error ${response.status}. Retrying after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === maxRetries - 1) {
        // Don't throw network errors immediately - could be offline mode
        console.warn(`Network error on attempt ${i + 1}:`, error.message);
        throw new Error(`Network error: ${error.message}`);
      }
      const delay = Math.min(Math.pow(2, i) * 1000, 3000);
      console.log(`Network error. Retrying after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
};

// Get all events with filtering (PUBLIC ENDPOINT - NO AUTH)
export const getEvents = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params);
    const response = await fetchWithRetry(`${API_URL}/api/events?${queryParams}`, {
      headers: { 'Content-Type': 'application/json' } // No auth headers for public endpoint
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch events`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get events error:', error);
    throw new Error(`Unable to load events: ${error.message}`);
  }
};

// Get single event
export const getEvent = async (eventId) => {
  try {
    const response = await fetch(`${API_URL}/api/events/${eventId}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch event');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get event error:', error);
    throw error;
  }
};

// Create new event (company only)
export const createEvent = async (eventData) => {
  try {
    const response = await fetch(`${API_URL}/api/events`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData)
    });
    
    if (!response.ok) {
      // Parse server error body if available and include message (supports both `message` and `msg` keys)
      const errorBody = await response.json().catch(() => ({}));
      const serverMessage = errorBody?.message || errorBody?.msg || errorBody?.error || null;
      throw new Error(serverMessage || `HTTP ${response.status}: Failed to create event`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Create event error:', error);
    throw error;
  }
};

// Update event (company only, own events)
export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await fetch(`${API_URL}/api/events/${eventId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to update event');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Update event error:', error);
    throw error;
  }
};

// Delete event (company only, own events)
export const deleteEvent = async (eventId) => {
  try {
    const response = await fetch(`${API_URL}/api/events/${eventId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to delete event');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Delete event error:', error);
    throw error;
  }
};

// Get company's events (company only)
export const getCompanyEvents = async () => {
  try {
    const response = await fetch(`${API_URL}/api/events/user/my-events`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch company events');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get company events error:', error);
    throw error;
  }
};

// Register for event (both user and company)
export const registerForEvent = async (eventId, registrationData = {}) => {
  try {
    const response = await fetch(`${API_URL}/api/events/${eventId}/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(registrationData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to register for event');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Register for event error:', error);
    throw error;
  }
};

// Get user's event registrations (both user and company)
export const getUserEventRegistrations = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_URL}/api/events/my/registrations?${queryParams}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      // If unauthorized, return an empty registrations list so UI can continue gracefully
      if (response.status === 401) {
        console.warn('Unauthorized while fetching event registrations');
        return { registrations: [] };
      }

      const errBody = await response.json().catch(() => ({}));
      const msg = errBody?.message || errBody?.msg || `HTTP ${response.status}: Failed to fetch registrations`;
      throw new Error(msg);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get user registrations error:', error);
    // If network or other error, return empty registrations to avoid breaking page
    return { registrations: [] };
  }
};

// Get event participants (company only, own events)
export const getEventParticipants = async (eventId) => {
  try {
    const response = await fetch(`${API_URL}/api/events/${eventId}/participants`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to fetch participants');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get event participants error:', error);
    throw error;
  }
};

// Cancel registration (both user and company)
export const cancelEventRegistration = async (eventId) => {
  try {
    const response = await fetch(`${API_URL}/api/events/${eventId}/register`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to cancel registration');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Cancel registration error:', error);
    throw error;
  }
};

export default {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getCompanyEvents,
  registerForEvent,
  getUserEventRegistrations,
  getEventParticipants,
  cancelEventRegistration
};

