import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import bilkentLogo from '../../assets/bilkent-logo.png'; // Ensure you have this logo in your assets folder

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password) {
      setErrorMessage('E-mail or Password is Incorrect!');
      return;
    }
    
    console.log('Login attempted with:', email, password, 'Remember me:', rememberMe);
    
    // Here you would typically make an API call to authenticate
    // For demo purposes, we'll just navigate
    if (email.includes('admin')) {
      navigate('/admin/adminmainpage');
    } else if (email.includes('instructor')) {
      navigate('/instructor/dashboard');
    } else if (email.includes('ta')) {
      navigate('/teaching_assistant/dashboard');
    } else {
      // Failed login attempt
      setErrorMessage('E-mail or Password is Incorrect!');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo-container">
          <img src={bilkentLogo} alt="Bilkent University Logo" className="university-logo" />
        </div>
        
        <div className="login-form-container">
          <div className="form-field">
            <label htmlFor="email">Bilkent Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage(''); // Clear error on input change
              }}
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage(''); // Clear error on input change
              }}
            />
          </div>
          
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          
          <button 
            className="sign-in-button"
            onClick={handleSubmit}
          >
            Sign In
          </button>
          
          <div className="login-options">
            <Link to="/forgotpassword" className="forgot-password-link">
              Forgot password?
            </Link>
            
            <label className="remember-me-container">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <span className="checkbox-label">Remember Me</span>
            </label>
          </div>
        </div>
        
        <div className="footer">
          <p>2025 ProctorHub. All rights reserved.</p>
          <Link to="/about" className="about-link">About Us</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;