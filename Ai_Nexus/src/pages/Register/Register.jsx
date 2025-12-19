import React, { useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Register.css';
import SkyGlowBalls from '../../components/animations/SkyGlowBalls';


const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
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
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Password complexity check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      setLoading(false);
      return;
    }
    
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

      const result = await register(formData);

      if (result.success) {
        // Redirect to user dashboard
        navigate('/dashboard?tab=user');
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred during registration. Please try again.');
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
  const { register } = useAuth();
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [companyLogo, setCompanyLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Password complexity check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      setLoading(false);
      return;
    }
    
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

      const result = await register(formData);

      if (result.success) {
        // Redirect to company dashboard
        navigate('/dashboard?tab=company');
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred during registration. Please try again.');
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
