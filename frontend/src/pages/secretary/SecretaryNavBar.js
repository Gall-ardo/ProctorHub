import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './SecretaryNavBar.css';
import bilkentIcon from '../../assets/bilkent-logo.png';
import notificationIcon from '../../assets/notification-icon.png';
import userIcon from '../../assets/user-icon.png';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export default function SecretaryNavBar() {
  const location = useLocation();
  const path = location.pathname;

  // UI state
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown]       = useState(false);
  const [showPasswordModal, setShowPasswordModal]           = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm]           = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError]     = useState('');
  const [loading, setLoading]                 = useState(false);

  // Sample notifications; swap these out for a real fetch if you like
  const [notifications] = useState([
    { id:1, type:'workload', icon:'👍', text:'Workload approved', date:'07.03.2025', time:'15:30' },
    { id:2, type:'swap',     icon:'💬', text:'Swap request received', date:'07.03.2025', time:'16:00' },
    // …etc
  ]);

  const notificationRef = useRef(null);
  const profileRef      = useRef(null);
  const modalRef        = useRef(null);

  // Helpers
  const isActive = navPath => path.includes(navPath);
  const getToken = () =>
    localStorage.getItem('token') || sessionStorage.getItem('token');

  // Outside-click handlers
  useEffect(() => {
    const handleClickOutside = e => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotificationDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Logout
  const confirmLogout = () => {
    setShowLogoutConfirm(true);
    setShowProfileDropdown(false);
  };
  const cancelLogout = () => setShowLogoutConfirm(false);
  const handleLogout = () => {
    // clear both storages
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    window.location.href = '/';
  };

  // Password change
  const openPasswordModal = () => {
    setShowPasswordModal(true);
    setShowProfileDropdown(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };
  const closePasswordModal = () => setShowPasswordModal(false);

  const handlePasswordChange = async e => {
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
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    const token = getToken();
    if (!token) {
      setPasswordError('You must be logged in');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error changing password');
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
    <div className="secretary-nav-top-navbar">
      <div className="secretary-nav-logo">
        <img src={bilkentIcon} alt="Bilkent Logo" />
      </div>
      <div className="secretary-nav-links">
        <Link to="/secretary/home"       className={isActive('/secretary/home')       ? 'active' : ''}>Home</Link>
        <Link to="/secretary/ta-workload" className={isActive('/secretary/ta-workload') ? 'active' : ''}>TA Workload</Link>
        <Link to="/secretary/leaverequest"     className={isActive('/secretary/leaverequest')     ? 'active' : ''}>TA Leave Request</Link>
      </div>

      <div className="secretary-nav-icons" style={{ marginLeft: 'auto' }}>
        {/* notifications */}
        <div ref={notificationRef}>
          <img
            src={notificationIcon}
            alt="Notifications"
            className="secretary-nav-notification-icon"
            onClick={() => {
              setShowNotificationDropdown(v => !v);
              setShowProfileDropdown(false);
            }}
          />
          {showNotificationDropdown && (
            <div className="secretary-nav-notification-dropdown">
              <div className="notification-header">Notifications</div>
              {notifications.map(n => (
                <div key={n.id} className="notification-item">
                  <span className="notification-icon">{n.icon}</span>
                  <div>
                    <p>{n.text}</p>
                    <small>{n.date} {n.time}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* profile / change‐password / logout */}
        <div ref={profileRef}>
          <img
            src={userIcon}
            alt="Profile"
            className="secretary-nav-profile-icon"
            onClick={() => {
              setShowProfileDropdown(v => !v);
              setShowNotificationDropdown(false);
            }}
          />
          {showProfileDropdown && (
            <div className="secretary-nav-profile-dropdown">
              <div className="dropdown-item" onClick={openPasswordModal}>Change Password</div>
              <div className="dropdown-item" onClick={confirmLogout}>Log Out</div>
            </div>
          )}
        </div>
      </div>

      {/* ===== Change Password Modal ===== */}
      {showPasswordModal && (
        <div className="modal-backdrop">
          <div className="modal-content" ref={modalRef}>
            <button className="close-button" onClick={closePasswordModal}>×</button>
            <h3>Change Password</h3>
            <form onSubmit={handlePasswordChange}>
              <label>Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
              />
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
              {passwordError && <p className="error">{passwordError}</p>}
              <button type="submit" disabled={loading}>
                {loading ? 'Saving…' : 'Save'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== Logout Confirmation ===== */}
      {showLogoutConfirm && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Are you sure you want to log out?</h3>
            <div className="button-row">
              <button onClick={cancelLogout}>Cancel</button>
              <button onClick={handleLogout}>Yes, Log Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}