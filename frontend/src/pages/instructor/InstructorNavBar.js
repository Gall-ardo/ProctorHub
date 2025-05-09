import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './InstructorNavBar.css';
// Import the icons
import bilkentIcon from '../../assets/bilkent-logo.png';
import notificationIcon from '../../assets/notification-icon.png';
import userIcon from '../../assets/user-icon.png';

const API_URL = 'http://localhost:5001/api';

const InstructorNavBar = () => {
  const location = useLocation();
  const path = location.pathname;

  // dropdown & modal sinstructorte
  const [showProfileDropdown, setShowProfileDropdown]     = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showPasswordModal, setShowPasswordModal]         = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm]         = useState(false);

  // password form sinstructorte
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError]     = useState('');
  const [loading, setLoading]                 = useState(false);

  // notifications from DB
  const [notifications, setNotifications]         = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const profileDropdownRef      = useRef(null);
  const notificationDropdownRef = useRef(null);
  const modalRef                = useRef(null);

  // active‐link helper
  const isActive = (navPath) => path.startsWith(navPath);

  // icon mapper
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'workload':   return '👍';
      case 'personal':   return '↩';
      case 'swap':       return '💬';
      case 'proctoring': return '💬';
      case 'leave':      return '📅';
      default:           return '📣';
    }
  };

  // fetch notifications once on mount
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      setLoadingNotifications(false);
      return;
    }

    axios
      .get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (res.dainstructor.success) {
          // map raw DB rows to your dropdown shape
          const mapped = res.dainstructor.dainstructor.map(n => {
            const d = new Date(n.date);
            return {
              id:   n.id,
              icon: getNotificationIcon(n.subject.toLowerCase()),
              text: n.message,
              date: d.toLocaleDateString(),
              time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          });
          setNotifications(mapped);
        }
      })
      .catch(err => console.error('Could not load notifications', err))
      .finally(() => setLoadingNotifications(false));
  }, []);

  // click‐outside handler for both dropdowns
  useEffect(() => {
    const handleClickOutside = e => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(e.target)) {
        setShowNotificationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // toggles
  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    if (showNotificationDropdown) setShowNotificationDropdown(false);
  };
  const toggleNotificationDropdown = () => {
    setShowNotificationDropdown(!showNotificationDropdown);
    if (showProfileDropdown) setShowProfileDropdown(false);
  };

  // password modal handlers, logout, etc.
  const openPasswordModal  = () => { setShowPasswordModal(true); setShowProfileDropdown(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPasswordError(''); };
  const closePasswordModal = () => setShowPasswordModal(false);
  const confirmLogout      = () => { setShowLogoutConfirm(true); setShowProfileDropdown(false); };
  const cancelLogout       = () => setShowLogoutConfirm(false);
  const handleLogout       = () => { sessionStorage.clear(); localStorage.clear(); window.location.href = '/'; };

  const handlePasswordChange = e => {
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
    fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    })
      .then(res => {
        if (!res.ok) return res.json().then(err => Promise.reject(err.message || 'Server error'));
        return res.json();
      })
      .then(() => { alert('Password changed successfully'); closePasswordModal(); })
      .catch(err => setPasswordError(err))
      .finally(() => setLoading(false));
  };

  return (
    <div className="instructor-nav-top-navbar">
      <div className="instructor-nav-logo">
        <img src={bilkentIcon} alt="Bilkent Logo" />
      </div>
      <div className="instructor-nav-links">
        <Link to="/instructor/home"       className={isActive('/instructor/home')       ? 'active' : ''}>Home</Link>
        <Link to="/instructor/ta-workload" className={isActive('/instructor/ta-workload') ? 'active' : ''}>TA Workload</Link>
        <Link to="/instructor/exams"      className={isActive('/instructor/exams')      ? 'active' : ''}>Exams</Link>
        <Link to="/instructor/assign"     className={isActive('/instructor/assign')     ? 'active' : ''}>TA Assign</Link>
      </div>
      <div style={{ marginLeft: 'auto' }} className="instructor-nav-icons">
        {/* Notifications */}
        <div className="instructor-nav-notification-container" ref={notificationDropdownRef}>
          <div className="instructor-nav-notification-icon" onClick={toggleNotificationDropdown}>
            <img src={notificationIcon} alt="Notifications" />
          </div>
          {showNotificationDropdown && (
            <div className="instructor-nav-notification-dropdown">
              <div className="notification-header">Notifications</div>
              {loadingNotifications ? (
                <div className="no-notifications">Loading…</div>
              ) : notifications.length > 0 ? (
                notifications.map(n => (
                  <div key={n.id} className="notification-item">
                    <div className="notification-icon">{n.icon}</div>
                    <div className="notification-content">
                      <p className="notification-text">{n.text}</p>
                      <div className="notification-meinstructor">{n.date} {n.time}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-notifications">No notifications to display</div>
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="instructor-nav-profile-container" ref={profileDropdownRef}>
          <div className="instructor-nav-profile-icon" onClick={toggleProfileDropdown}>
            <img src={userIcon} alt="Profile" />
          </div>
          {showProfileDropdown && (
            <div className="instructor-nav-profile-dropdown">
              <div className="dropdown-item" onClick={openPasswordModal}>Change Password</div>
              <div className="dropdown-item" onClick={confirmLogout}>Log Out</div>
            </div>
          )}
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="password-modal-overlay">
          <div className="password-modal" ref={modalRef}>
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
                <input type="password" value={newPassword}    onChange={e => setNewPassword(e.target.value)} />
              </div>
              <div className="password-input-group">
                <label>New Password Again</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </div>
              {passwordError && <div className="password-error">{passwordError}</div>}
              <button type="submit" className="change-password-btn">Change Password</button>
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
                <button className="cancel-btn"  onClick={cancelLogout}>Cancel</button>
                <button className="confirm-btn" onClick={handleLogout}>Confirm Logout</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorNavBar;