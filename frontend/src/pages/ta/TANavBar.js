import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './TANavBar.css';
// Import the icons
import bilkentIcon from '../../assets/bilkent-logo.png';
import notificationIcon from '../../assets/notification-icon.png';
import userIcon from '../../assets/user-icon.png';

const TANavBar = () => {
  const location = useLocation();
  const path = location.pathname;
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);

  // Determine active tab based on current path
  const isActive = (navPath) => {
    if (navPath === '/ta/tamain' && path.includes('/ta/tamain')) return true;
    if (navPath === '/ta/taworkload' && path.includes('/ta/taworkload')) return true;
    if (navPath === '/ta/taproctoring' && path.includes('/ta/taproctoring')) return true;
    if (navPath === '/ta/taleaveofabsence' && path.includes('/ta/taleaveofabsence')) return true;
    if (navPath === '/ta/taforum' && path.includes('/ta/taforum')) return true;
    return false;
  };

  // Toggle dropdown visibility
  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
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

  // Handle password change submission
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
    
    /* 
    BACKEND INTEGRATION COMMENT:
    For password change functionality, you'll want to:
    1. Send the current password and new password to your backend API
    2. Handle success/error responses appropriately
    
    Example implementation with fetch API:
    
    fetch('/api/user/change-password', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        currentPassword: currentPassword,
        newPassword: newPassword
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Show success message
        alert('Password changed successfully');
        closePasswordModal();
      } else {
        // Show error message
        setPasswordError(data.message || 'Failed to change password');
      }
    })
    .catch(error => {
      console.error('Password change error:', error);
      setPasswordError('An error occurred. Please try again.');
    });
    */
    
    // For now, just show a success message and close the modal
    alert('Password change functionality will be implemented with backend integration');
    closePasswordModal();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
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
        <div className="ta-nav-notification-icon">
          <img src={notificationIcon} alt="Notifications" />
        </div>
        <div className="ta-nav-profile-container" ref={dropdownRef}>
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