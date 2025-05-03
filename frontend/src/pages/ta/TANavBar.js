import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './TANavBar.css';
// Import the icons
import bilkentIcon from '../../assets/bilkent-logo.png';
import notificationIcon from '../../assets/notification-icon.png';
import userIcon from '../../assets/user-icon.png';

const API_URL = 'http://localhost:5001/api';

const TANavBar = () => {
  const location = useLocation();
  const path = location.pathname;
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);  // Initialize loading state
  const profileDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const modalRef = useRef(null);

  // Sample notifications data - this would come from your backend in a real app
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'workload',
      icon: '👍',
      text: 'Uğur Güdükbay has accepted your workload request.',
      date: '07.03.2025',
      time: '15:30'
    },
    {
      id: 2,
      type: 'workload',
      icon: '👎',
      text: 'Can Alkan has rejected your workload request :(. Reason: Duration is invalid.',
      date: '07.03.2025',
      time: '15:30'
    },
    {
      id: 3,
      type: 'personal',
      icon: '↩',
      text: 'Şebnem Ferah has accepted your personal request. Check your proctorings!',
      date: '07.03.2025',
      time: '15:30'
    },
    {
      id: 4,
      type: 'swap',
      icon: '💬',
      text: 'Fatma Turgut has accepted your swap request on forum. Check your proctorings!',
      date: '07.03.2025',
      time: '15:30'
    },
    {
      id: 5,
      type: 'proctoring',
      icon: '💬',
      text: 'You have 2 pending proctoring requests. Check your proctorings!',
      date: '07.03.2025',
      time: '15:30'
    },
    {
      id: 6,
      type: 'leave',
      icon: '📅',
      text: 'Your Leave of Absence request has been accepted.',
      date: '07.03.2025',
      time: '15:30'
    },
    {
      id: 7,
      type: 'leave',
      icon: '📅',
      text: 'Your Leave of Absence request has been rejected :(.',
      date: '07.03.2025',
      time: '15:30'
    },
    {
      id: 8,
      type: 'swap',
      icon: '↩',
      text: 'Sezen Aksu send you a personal swap request. Exam: CS224 - 02.04.2025 13.30-16.30',
      date: '07.03.2025',
      time: '15:30'
    }
  ]);

  // Determine active tab based on current path
  const isActive = (navPath) => {
    if (navPath === '/ta/tamain' && path.includes('/ta/tamain')) return true;
    if (navPath === '/ta/taworkload' && path.includes('/ta/taworkload')) return true;
    if (navPath === '/ta/taproctoring' && path.includes('/ta/taproctoring')) return true;
    if (navPath === '/ta/taleaveofabsence' && path.includes('/ta/taleaveofabsence')) return true;
    if (navPath === '/ta/taforum' && path.includes('/ta/taforum')) return true;
    return false;
  };

  // Toggle profile dropdown visibility
  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    // Close notification dropdown if it's open
    if (showNotificationDropdown) setShowNotificationDropdown(false);
  };

  // Toggle notification dropdown visibility
  const toggleNotificationDropdown = () => {
    setShowNotificationDropdown(!showNotificationDropdown);
    // Close profile dropdown if it's open
    if (showProfileDropdown) setShowProfileDropdown(false);
  };

  // Open password change modal
  const openPasswordModal = () => {
    setShowPasswordModal(true);
    setShowProfileDropdown(false);
    // Reset form fields when opening the modal
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  // Close password change modal
  const closePasswordModal = () => {
    setShowPasswordModal(false);
  };

  // State for logout confirmation
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Show logout confirmation dialog
  const confirmLogout = () => {
    setShowLogoutConfirm(true);
    setShowProfileDropdown(false);
  };
  
  // Cancel logout
  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };
  
  // Handle log out function
  const handleLogout = () => {
    // Add your logout logic here
    console.log('Logging out...');
    
    /* 
    BACKEND INTEGRATION COMMENT:
    For logout functionality, you'll want to:
    1. Call your backend API to invalidate the session token
    2. Remove any local storage tokens/cookies
    3. Redirect to login page
    
    Example implementation with fetch API:
    
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(response => {
      if (response.ok) {
        localStorage.removeItem('token');
        window.location.href = '/';  // Redirect to root where Login component is mounted
      }
    })
    .catch(error => console.error('Logout error:', error));
    */
    
    // For now, just redirect to the login page
    window.location.href = '/';  // Redirect to root where Login component is mounted
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    // Password strength validation (optional)
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    // Get the token from localStorage (ensure the token exists)
    const token = localStorage.getItem('token');
    if (!token) {
      setPasswordError('You must be logged in to change the password');
      return;
    }

    // Set loading state to true
    setLoading(true);

    // Send the password change request to the backend
    fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`  // Ensure the token is correctly passed as "Bearer <token>"
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            throw new Error(errorData.message || 'Server error occurred');
          });
        }
        return response.json();
      })
      .then(data => {
        alert('Password changed successfully');
        closePasswordModal();  
      })
      .catch(error => {
        console.error('Password change error:', error);
        setPasswordError(error.message || 'An error occurred. Please try again.');
      });
  };
  

  // Function to get the appropriate icon for each notification type
  // Note: This is a placeholder and would ideally be replaced with actual icons
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'workload':
        return '👍';
      case 'personal':
        return '↩';
      case 'swap':
        return '💬';
      case 'proctoring':
        return '💬';
      case 'leave':
        return '📅';
      default:
        return '📣';
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setShowNotificationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="ta-nav-top-navbar">
      <div className="ta-nav-logo">
        <img src={bilkentIcon} alt="Bilkent Logo" />
      </div>
      <div className="ta-nav-links">
        <Link to="/ta/tamain" className={isActive('/ta/tamain') ? 'active' : ''}>Home</Link>
        <Link to="/ta/taworkload" className={isActive('/ta/taworkload') ? 'active' : ''}>Workload</Link>
        <Link to="/ta/taproctoring" className={isActive('/ta/taproctoring') ? 'active' : ''}>Proctoring</Link>
        <Link to="/ta/taleaveofabsence" className={isActive('/ta/taleaveofabsence') ? 'active' : ''}>Leave of Absence</Link>
        <Link to="/ta/taforum" className={isActive('/ta/taforum') ? 'active' : ''}>Swap</Link>
      </div>
      <div style={{ marginLeft: 'auto' }} className="ta-nav-icons">
        <div className="ta-nav-notification-container" ref={notificationDropdownRef}>
          <div className="ta-nav-notification-icon" onClick={toggleNotificationDropdown}>
            <img src={notificationIcon} alt="Notifications" />
          </div>
          {showNotificationDropdown && (
            <div className="ta-nav-notification-dropdown">
              <div className="notification-header">Notifications</div>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification.id} className="notification-item">
                    <div className="notification-icon">
                      {notification.icon}
                    </div>
                    <div className="notification-content">
                      <p className="notification-text">{notification.text}</p>
                      <div className="notification-meta">
                        {notification.date} {notification.time}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-notifications">No notifications to display</div>
              )}
            </div>
          )}
        </div>
        <div className="ta-nav-profile-container" ref={profileDropdownRef}>
          <div className="ta-nav-profile-icon" onClick={toggleProfileDropdown}>
            <img src={userIcon} alt="Profile" />
          </div>
          {showProfileDropdown && (
            <div className="ta-nav-profile-dropdown">
              <div className="dropdown-item" onClick={openPasswordModal}>Change Password
              </div>
              <div className="dropdown-item" onClick={confirmLogout}>Log Out
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Password Change Modal */}
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
                <input 
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              
              <div className="password-input-group">
                <label>New Password</label>
                <input 
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              
              <div className="password-input-group">
                <label>New Password Again</label>
                <input 
                  type="password"
                  placeholder="Enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              
              {passwordError && <div className="password-error">{passwordError}</div>}
              
              <button type="submit" className="change-password-btn">
                Change Password
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="password-modal-overlay">
          <div className="confirmation-modal">
            <div className="confirmation-modal-header">
              <h2>Confirm Logout</h2>
              <button className="close-modal-btn" onClick={cancelLogout}>✕</button>
            </div>
            
            <div className="confirmation-content">
              <p>Are you sure you want to log out of your account?</p>
              <p>Any unsaved changes will be lost.</p>
              
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

export default TANavBar;