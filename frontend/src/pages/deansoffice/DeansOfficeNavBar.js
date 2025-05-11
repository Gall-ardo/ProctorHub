import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './DeansOfficeNavBar.css';
import bilkentIcon from '../../assets/bilkent-logo.png';
import notificationIcon from '../../assets/notification-icon.png';
import userIcon from '../../assets/user-icon.png';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5001') + '/api';

const DeansOfficeNavBar = () => {
  const location = useLocation();
  const path = location.pathname;
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (navPath) => path.includes(navPath);
  const toggleDropdown = () => setShowProfileDropdown((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openPasswordModal = () => {
    setShowPasswordModal(true);
    setShowProfileDropdown(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  const closePasswordModal = () => setShowPasswordModal(false);
  const confirmLogout = () => {
    setShowLogoutConfirm(true);
    setShowProfileDropdown(false);
  };
  const cancelLogout = () => setShowLogoutConfirm(false);
  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = '/';
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      setPasswordError('You must be logged in to change the password');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Password change failed');
      }

      alert('Password changed successfully');
      closePasswordModal();
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="deansoffice-nav-top-navbar">
      <div className="deansoffice-nav-logo">
        <img src={bilkentIcon} alt="Bilkent Logo" />
      </div>
      <div className="deansoffice-nav-links">
        <Link to="/deansoffice/home" className={isActive('/deansoffice/home') ? 'active' : ''}>
          Home
        </Link>
        <Link to="/deansoffice/exams" className={isActive('/deansoffice/exams') ? 'active' : ''}>
          Exams
        </Link>
        <Link to="/deansoffice/leaverequest" className={isActive('/deansoffice/leaverequest') ? 'active' : ''}>
          TA Leave Request
        </Link>
      </div>
      <div className="deansoffice-nav-icons" style={{ marginLeft: 'auto' }}>
        <div className="deansoffice-nav-notification-icon">
          <img src={notificationIcon} alt="Notifications" />
        </div>
        <div className="deansoffice-nav-profile-container" ref={dropdownRef}>
          <div className="deansoffice-nav-profile-icon" onClick={toggleDropdown}>
            <img src={userIcon} alt="Profile" />
          </div>
          {showProfileDropdown && (
            <div className="deansoffice-nav-profile-dropdown">
              <div className="dropdown-item" onClick={openPasswordModal}>Change Password</div>
              <div className="dropdown-item" onClick={confirmLogout}>Log Out</div>
            </div>
          )}
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="password-modal-overlay">
          <div className="password-modal">
            <div className="password-modal-header">
              <h2>Change Password</h2>
              <button className="close-modal-btn" onClick={closePasswordModal}>✕</button>
            </div>
            <form onSubmit={handlePasswordChange}>
              <div className="password-input-group">
                <label>Current Password</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
              </div>
              <div className="password-input-group">
                <label>New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <div className="password-input-group">
                <label>New Password Again</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </div>
              {passwordError && <div className="password-error">{passwordError}</div>}
              <button type="submit" className="change-password-btn" disabled={loading}>
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="password-modal-overlay">
          <div className="confirmation-modal">
            <div className="confirmation-modal-header">
              <h2>Confirm Logout</h2>
              <button className="close-modal-btn" onClick={cancelLogout}>✕</button>
            </div>
            <div className="confirmation-content">
              <p>Are you sure you want to log out?</p>
              <div className="confirmation-buttons">
                <button className="cancel-btn" onClick={cancelLogout}>Cancel</button>
                <button className="confirm-btn" onClick={handleLogout}>Confirm Logout</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeansOfficeNavBar;
