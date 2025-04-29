import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './ForgotPassword.module.css';
import bilkentLogo from '../../assets/bilkent-logo.png';

const API_URL = process.env.REACT_APP_API_URL;

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSendPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      // we always return { success: true } even if email not found,
      // to avoid leaking valid emails
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message || 'Failed to send reset email');
      }

      // Success: inform user and redirect to login
      alert(`If that email exists, a reset link has been sent to ${email}.`);
      navigate('/'); // or '/auth/login' if that’s your login route
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
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
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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