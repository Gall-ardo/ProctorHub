import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './DeansOfficeNavBar.css';
import bilkentIcon from '../../assets/bilkent-logo.png';
import notificationIcon from '../../assets/notification-icon.png';
import userIcon from '../../assets/user-icon.png';

const DeansOfficeNavBar = () => {
    const location = useLocation();
    const path = location.pathname;
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Determine active tab based on current path
    const isActive = (navPath) => path.includes(navPath);

    const toggleDropdown = () => {
        setShowProfileDropdown((prev) => !prev);
    };

    // Close dropdown when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                            <div className="dropdown-item">Change Password</div>
                            <div className="dropdown-item">Log Out</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeansOfficeNavBar;