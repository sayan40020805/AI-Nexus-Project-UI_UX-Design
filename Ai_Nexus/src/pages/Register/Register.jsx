



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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: name, email, password }),
      });

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMsg = 'Registration failed';
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMsg = errorData.msg || errorMsg;
        } else {
          errorMsg = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        alert(`Registration failed: ${errorMsg}`);
        return;
      }

      const data = await response.json();

      if (response.ok) {
        alert('Registration successful!');
        // TODO: Redirect to login or dashboard
        console.log('Token:', data.token);
      } else {
        alert(`Registration failed: ${data.msg}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert(`An error occurred during registration: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-group">
        <label htmlFor="name">Full Name</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label htmlFor="profile-pic">Profile Picture</label>
        <input type="file" id="profile-pic" name="profile-pic" />
      </div>
      <button type="submit" className="register-button">Register as User</button>
    </form>
  );
};

const CompanyRegister = () => {
  // TODO: Implement company registration
  return (
    <form>
      <div className="input-group">
        <label htmlFor="company-name">Company Name</label>
        <input type="text" id="company-name" name="company-name" required />
      </div>
      <div className="input-group">
        <label htmlFor="company-email">Company Email</label>
        <input type="email" id="company-email" name="company-email" required />
      </div>
      <div className="input-group">
        <label htmlFor="password">Password</label>
        <input type="password" id="password" name="password" required />
      </div>
      <div className="input-group">
        <label htmlFor="company-logo">Company Logo</label>
        <input type="file" id="company-logo" name="company-logo" />
      </div>
      <div className="input-group">
        <label htmlFor="company-desc">Company Description</label>
        <textarea id="company-desc" name="company-desc" rows="3"></textarea>
      </div>
      <button type="submit" className="register-button">Register as Company</button>
    </form>
  );
};

export default Register;
