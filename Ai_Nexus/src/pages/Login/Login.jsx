import React from 'react';
import './Login.css';

const Login = () => {
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
        <form>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" required />
          </div>

          <button type="submit" className="login-button">Login</button>
        </form>

        <p className="register-link">
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>

    </div>
  );
};

export default Login;
