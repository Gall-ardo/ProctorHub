import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ForgotPassword.css';
import bilkentLogo from '../../assets/bilkent-logo.png';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSendPassword = (e) => {
    e.preventDefault();
    
    if (!email) {
      setErrorMessage('Please enter your email address');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Password reset requested for:', email);
      // Here you would typically make an API call to send a password reset email
      
      setIsSubmitting(false);
      
      // Show success message or redirect
      alert(`Password reset link has been sent to ${email}. Please check your inbox.`);
      navigate('/auth/login');
    }, 1500);
  };

  const handleCancel = () => {
    navigate('/auth/login');
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <div className="logo-container">
          <img src={bilkentLogo} alt="Bilkent University Logo" className="university-logo" />
        </div>
        
        <div className="forgot-password-form">
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter e-mail"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage('');
              }}
            />
          </div>
          
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          
          <div className="form-buttons">
            <button 
              className="cancel-button"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            
            <button 
              className="send-password-button"
              onClick={handleSendPassword}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send New Password'}
            </button>
          </div>
        </div>
        
        <div className="footer">
          <p>2025 Erasmus Wizard. All rights reserved.</p>
          <Link to="/about" className="about-link">About Us</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;