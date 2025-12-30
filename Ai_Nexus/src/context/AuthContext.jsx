  import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Token validation helpers
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (err) {
    console.warn('⚠️ Token validation error:', err.message);
    return true; // Consider expired if we can't parse it
  }
};

const getTokenExpirationTime = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // Convert to milliseconds
  } catch (err) {
    return null;
  }
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [tokenRefreshTimer, setTokenRefreshTimer] = useState(null);


  // =========================
  // INIT AUTH FROM STORAGE
  // =========================
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          console.log('🔐 Initializing auth from storage...');
          
          // First try to restore from localStorage
          const parsedUser = JSON.parse(storedUser);
          
          // Check if token is expired before setting
          if (isTokenExpired(storedToken)) {
            console.log('⚠️ Stored token is expired, attempting refresh...');
            const refreshSuccess = await refreshToken();
            if (!refreshSuccess) {
              console.log('❌ Token refresh failed during init');
              return;
            }
          } else {
            // Token is valid, set it up
            setToken(storedToken);
            setUser(parsedUser);
            console.log('✅ Valid token found, setting up refresh timer');
            setupTokenRefresh(storedToken);
          }

          // Only verify token with server if user data is missing or incomplete
          if (!parsedUser || !parsedUser.id) {
            console.log('🔍 User data incomplete, verifying with server...');
            await verifyTokenWithServer(storedToken);
          }

        } catch (err) {
          console.error('❌ Auth initialization error:', err);
          // Clear local storage and state
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
          
          // Clear any existing refresh timer
          if (tokenRefreshTimer) {
            clearTimeout(tokenRefreshTimer);
            setTokenRefreshTimer(null);
          }
        }
      } else {
        console.log('ℹ️ No stored auth data found');
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // Helper function to verify token with server
  const verifyTokenWithServer = async (token) => {
    try {
      console.log('🔐 Verifying token with server...');
      
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 429) {
          // Rate limited - don't clear auth, just log it
          console.warn('⚠️ Rate limited during auth verification, keeping local session');
          return;
        }
        if (res.status === 401) {
          console.log('❌ Token invalid, logging out...');
          // Token is invalid, clear storage
          logout();
          return;
        }
        // Other errors - keep session but log
        console.warn('⚠️ Auth verification error:', res.status, res.statusText);
        return;
      }

      const data = await res.json();
      
      // Update user data from server
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('✅ Token verified successfully');

    } catch (err) {
      console.warn('⚠️ Auth verification failed, keeping local session:', err.message);
      // Don't clear auth on network errors, just log warning
    }
  };

  // Helper function to refresh token automatically
  const refreshToken = async () => {
    try {
      console.log('🔄 Refreshing token...');
      
      const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.log('❌ Token refresh failed, logging out');
        logout();
        return false;
      }

      const data = await res.json();
      
      // Update token and user
      setToken(data.token);
      setUser(data.user);
      
      // Update localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      console.log('✅ Token refreshed successfully');
      return true;

    } catch (err) {
      console.error('❌ Token refresh error:', err.message);
      logout();
      return false;
    }
  };

  // Setup automatic token refresh
  const setupTokenRefresh = (currentToken) => {
    if (!currentToken) return;

    // Clear existing timer
    if (tokenRefreshTimer) {
      clearTimeout(tokenRefreshTimer);
    }

    const expirationTime = getTokenExpirationTime(currentToken);
    if (!expirationTime) return;

    const timeUntilExpiration = expirationTime - Date.now();
    const refreshTime = Math.max(timeUntilExpiration - 5 * 60 * 1000, 60 * 1000); // Refresh 5 minutes before expiry, minimum 1 minute

    console.log(`⏰ Token refresh scheduled in ${Math.round(refreshTime / 1000 / 60)} minutes`);

    const timer = setTimeout(() => {
      console.log('🔄 Token refresh timer triggered');
      refreshToken();
    }, refreshTime);

    setTokenRefreshTimer(timer);
  };

  // =========================
  // LOGIN
  // =========================
  const login = async (email, password) => {
    try {
      console.log('🔑 Attempting login...');
      
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log('❌ Login failed:', data.msg || 'Login failed');
        return { success: false, error: data.msg || 'Login failed' };
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
      
      // Setup token refresh for new login
      setupTokenRefresh(data.token);
      
      console.log('✅ Login successful');
      return { success: true, user: data.user };
    } catch (err) {
      console.error('❌ Login error:', err.message);
      return { success: false, error: 'Server error. Try again later.' };
    }
  };

  // =========================
  // REGISTER (USER / COMPANY)
  // =========================
  const register = async (formData) => {
    try {
      if (!(formData instanceof FormData)) {
        return { success: false, error: 'Invalid form data' };
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/signup`, {
        method: 'POST',
        body: formData, // ⚠️ DO NOT SET CONTENT-TYPE
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.msg || 'Registration failed' };
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: 'Server error during registration' };
    }
  };


  // =========================
  // LOGOUT
  // =========================
  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      
      // Clear token refresh timer first
      if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer);
        setTokenRefreshTimer(null);
      }
      
      // Optional: Call logout endpoint to invalidate token on server
      if (token) {
        try {
          await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (serverError) {
          console.warn('⚠️ Server logout failed (continuing with local logout):', serverError.message);
        }
      }
      
      console.log('✅ Logout successful');
      
    } catch (err) {
      console.error('❌ Logout error:', err);
      // Continue with local logout even if server call fails
    } finally {
      // Always clear local storage and state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
