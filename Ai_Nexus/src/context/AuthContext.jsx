import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);


  // =========================
  // INIT AUTH FROM STORAGE
  // =========================
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          // First try to restore from localStorage
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);

          // Then verify token with server
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (!res.ok) {
            // Token is invalid, clear storage
            logout();
            return;
          }

          const data = await res.json();
          
          // Update user data from server (in case it changed)
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));

        } catch (err) {
          console.error('Auth initialization error:', err);
          // Clear local storage and state
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // =========================
  // LOGIN
  // =========================
  const login = async (email, password) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.msg || 'Login failed' };
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (err) {
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
      // Optional: Call logout endpoint to invalidate token on server
      if (token) {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
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
