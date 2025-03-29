import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './ForgotPassword.module.css';
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
    <div className={styles.forgotPasswordPage}>
      <div className={styles.forgotPasswordCard}>
        <div className={styles.logoContainer}>
          <img src={bilkentLogo} alt="Bilkent University Logo" className={styles.universityLogo} />
        </div>
        
        <div className={styles.forgotPasswordForm}>
          <div className={styles.formField}>
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
          
          {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
          
          <div className={styles.formButtons}>
            <button
               className={styles.cancelButton}
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            
            <button
               className={styles.sendPasswordButton}
              onClick={handleSendPassword}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send New Password'}
            </button>
          </div>
        </div>
        
        <div className={styles.footer}>
          <p>2025 Erasmus Wizard. All rights reserved.</p>
          <Link to="/about" className={styles.aboutLink}>About Us</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;