import React, { useState, Suspense } from 'react';
import './Register.css';
import NetworkAnimation from '../../components/animations/NetworkAnimation';

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
          <NetworkAnimation />
        </Suspense>
      </div>
    </div>
  );
};

const UserRegister = () => {
  return (
    <form>
      <div className="input-group">
        <label htmlFor="name">Full Name</label>
        <input type="text" id="name" name="name" required />
      </div>
      <div className="input-group">
        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" required />
      </div>
      <div className="input-group">
        <label htmlFor="password">Password</label>
        <input type="password" id="password" name="password" required />
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
