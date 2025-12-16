
import React, { createContext, useState, useContext, useEffect } from 'react';
import { validateEmail, validatePassword, validateRole } from '../utils/validation';
import { handleApiError, createLoadingState } from '../utils/errorHandler';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          

          // Verify token with backend
          const response = await fetch('/auth/me', {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
          } else {
            // Token is invalid, clear auth data
            logout();
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);



  const login = async (email, password) => {
    // Validate parameters using utility functions
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return { success: false, error: emailValidation.error };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.error };
    }

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: emailValidation.email, 
          password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const { token: newToken, user: userData } = data;
        
        // Validate response data
        if (!newToken || !userData) {
          return { success: false, error: 'Invalid response from server' };
        }
        
        // Store auth data
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(newToken);
        setUser(userData);
        
        return { success: true, user: userData };
      } else {
        return { 
          success: false, 
          error: data.msg || data.message || 'Login failed. Please check your credentials.' 
        };
      }
    } catch (error) {
      const errorResult = handleApiError(error);
      return errorResult;
    }
  };



  const register = async (formData) => {
    try {
      // Validate FormData presence
      if (!(formData instanceof FormData)) {
        return { success: false, error: 'Invalid form data provided' };
      }

      const response = await fetch('/auth/signup', {
        method: 'POST',
        body: formData, // Don't set Content-Type header for FormData
      });

      const data = await response.json();

      if (response.ok) {
        const { token: newToken, user: userData } = data;
        
        // Validate response data
        if (!newToken || !userData) {
          return { success: false, error: 'Invalid response from server' };
        }
        
        // Store auth data
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(newToken);
        setUser(userData);
        
        return { success: true, user: userData };
      } else {
        return { 
          success: false, 
          error: data.msg || data.message || 'Registration failed. Please check your information.' 
        };
      }
    } catch (error) {
      const errorResult = handleApiError(error);
      return errorResult;
    }
  };

  const logout = () => {
    // Clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
