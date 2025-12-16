

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';


const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);

      if (result.success) {
        // Redirect based on user role
        const dashboardPath = result.user.role === 'company' 
          ? '/dashboard?tab=company' 
          : '/dashboard?tab=user';
        
        navigate(dashboardPath);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* LEFT SIDE ANIMATION */}
      <div className="animation-container">
        <div className="ball" style={{ top: "40px", left: "50px", animationDelay: "0s" }}></div>
        <div className="ball" style={{ top: "150px", left: "120px", animationDelay: "1s" }}></div>
        <div className="ball" style={{ top: "260px", left: "30px", animationDelay: "2s" }}></div>
        <div className="ball" style={{ top: "370px", left: "140px", animationDelay: "3s" }}></div>
        <div className="ball" style={{ top: "480px", left: "60px", animationDelay: "1.5s" }}></div>
        <div className="ball" style={{ top: "600px", left: "110px", animationDelay: "2.8s" }}></div>
      </div>

      {/* RIGHT SIDE LOGIN FORM */}
      <div className="login-form">
        <h2>Login</h2>
        
        {error && (
          <div className="error-message" style={{ 
            background: '#ff4444', 
            color: 'white', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '15px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="register-link">
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
