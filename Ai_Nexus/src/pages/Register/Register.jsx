




import React, { useState, Suspense } from 'react';
import './Register.css';
import SkyGlowBalls from '../../components/animations/SkyGlowBalls';

const Register = () => {
  const [isCompany, setIsCompany] = useState(false);

  return (
    <div className="register-container">
      <div className="register-form">
        <h2>Create Account</h2>
        <div className="role-selector">
          <button
            className={!isCompany ? 'active' : ''}
            onClick={() => setIsCompany(false)}
          >
            User
          </button>
          <button
            className={isCompany ? 'active' : ''}
            onClick={() => setIsCompany(true)}
          >
            Company
          </button>
        </div>

        {isCompany ? <CompanyRegister /> : <UserRegister />}

        <p className="login-link">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>

      <div className="animation-container">
        <Suspense fallback={<div>Loading...</div>}>
          <SkyGlowBalls />
        </Suspense>
      </div>
    </div>
  );
};

const UserRegister = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('role', 'user');
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      
      if (profilePic) {
        formData.append('profile-pic', profilePic);
      }

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        body: formData, // Don't set Content-Type header for FormData
      });

      const data = await response.json();

      if (response.ok) {
        alert('Registration successful! You can now log in.');
        // Optionally redirect to login page
        window.location.href = '/login';
      } else {
        const errorMessages = data.errors ? data.errors.map(err => err.msg).join('\n') : (data.msg || 'Unknown error');
        alert(`Registration failed:\n${errorMessages}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        alert('Registration failed. Please ensure the backend server is running and accessible.');
      } else {
        alert(`An error occurred during registration: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        e.target.value = '';
        return;
      }
      setProfilePic(file);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-group">
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a unique username"
        />
      </div>
      <div className="input-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          required
          minLength="6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <small>Password must be at least 6 characters long and include an uppercase letter, a lowercase letter, and a number.</small>
      </div>
      <div className="input-group">
        <label htmlFor="profile-pic">Profile Picture (Optional)</label>
        <input 
          type="file" 
          id="profile-pic" 
          name="profile-pic" 
          accept="image/*"
          onChange={handleFileChange}
        />
        <small>Max size: 5MB. Supported formats: JPG, PNG, GIF</small>
      </div>
      <button type="submit" className="register-button" disabled={loading}>
        {loading ? 'Registering...' : 'Register as User'}
      </button>
    </form>
  );
};

const CompanyRegister = () => {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [companyLogo, setCompanyLogo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('role', 'company');
      formData.append('email', email);
      formData.append('password', password);
      formData.append('companyName', companyName);
      
      if (companyDescription) {
        formData.append('companyDescription', companyDescription);
      }
      
      if (companyLogo) {
        formData.append('company-logo', companyLogo);
      }

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        body: formData, // Don't set Content-Type header for FormData
      });

      const data = await response.json();

      if (response.ok) {
        alert('Company registration successful! You can now log in.');
        // Optionally redirect to login page
        window.location.href = '/login';
      } else {
        const errorMessages = data.errors ? data.errors.map(err => err.msg).join('\n') : (data.msg || 'Unknown error');
        alert(`Registration failed:\n${errorMessages}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        alert('Registration failed. Please ensure the backend server is running and accessible.');
      } else {
        alert(`An error occurred during registration: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        e.target.value = '';
        return;
      }
      setCompanyLogo(file);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-group">
        <label htmlFor="company-name">Company Name</label>
        <input
          type="text"
          id="company-name"
          name="company-name"
          required
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Enter your company name"
        />
      </div>
      <div className="input-group">
        <label htmlFor="company-email">Company Email</label>
        <input
          type="email"
          id="company-email"
          name="company-email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          required
          minLength="6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <small>Password must be at least 6 characters long and include an uppercase letter, a lowercase letter, and a number.</small>
      </div>
      <div className="input-group">
        <label htmlFor="company-logo">Company Logo (Optional)</label>
        <input 
          type="file" 
          id="company-logo" 
          name="company-logo" 
          accept="image/*"
          onChange={handleLogoChange}
        />
        <small>Max size: 5MB. Supported formats: JPG, PNG, GIF</small>
      </div>
      <div className="input-group">
        <label htmlFor="company-desc">Company Description (Optional)</label>
        <textarea
          id="company-desc"
          name="company-desc"
          rows="3"
          value={companyDescription}
          onChange={(e) => setCompanyDescription(e.target.value)}
          placeholder="Brief description of your company"
          maxLength="500"
        />
        <small>{companyDescription.length}/500 characters</small>
      </div>
      <button type="submit" className="register-button" disabled={loading}>
        {loading ? 'Registering...' : 'Register as Company'}
      </button>
    </form>
  );
};

export default Register;
