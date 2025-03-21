import React from 'react';
import './NavBar.css';

const NavBar = () => {
  return (
    <div className="top-navbar">
      <div className="nav-links">
        <a href="#">Home</a>
        <a href="#"><strong>Workload</strong></a>
        <a href="#">Proctoring</a>
        <a href="#">Leave of Absence</a>
        <a href="#">Swap</a>
      </div>
      <div className="nav-icons">
        <div className="notification-icon">
          <img src="/notification.png" alt="Notifications" />
        </div>
        <div className="profile-icon">
          <img src="/profile.png" alt="Profile" />
        </div>
      </div>
    </div>
  );
};

export default NavBar;