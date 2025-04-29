import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import styles from './ForgotPassword.module.css';
import bilkentLogo from '../../assets/bilkent-logo.png';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export default function ResetPassword() {
  const [searchParams]   = useSearchParams();
  const token            = searchParams.get('token');
  const [newPassword, setNewPassword]   = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setErrorMessage('Invalid or missing password reset token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      setErrorMessage('Please enter your new password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch(
        `${API_URL}/api/auth/reset-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword }),
        }
      );

      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message || 'Failed to reset password');
      }

      alert('Your password has been reset. Please log in with your new password.');
      navigate('/');
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate('/');

  return (
    <div className={styles.forgotPasswordPage}>
      <div className={styles.forgotPasswordCard}>
        <div className={styles.logoContainer}>
          <img
            src={bilkentLogo}
            alt="Bilkent Logo"
            className={styles.universityLogo}
          />
        </div>

        <div className={styles.forgotPasswordForm}>
          <h2>Reset Your Password</h2>

          <div className={styles.formField}>
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setErrorMessage('');
              }}
            />
          </div>

          {errorMessage && (
            <div className={styles.errorMessage}>{errorMessage}</div>
          )}

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
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </div>

        <div className={styles.footer}>
          <p>2025 ProctorHub. All rights reserved.</p>
          <Link to="/about" className={styles.aboutLink}>
            About Us
          </Link>
        </div>
      </div>
    </div>
  );
}