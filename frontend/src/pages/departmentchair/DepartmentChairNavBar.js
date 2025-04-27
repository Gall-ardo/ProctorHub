import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './DepartmentChairNavBar.css';
import bilkentIcon from '../../assets/bilkent-logo.png';
import notificationIcon from '../../assets/notification-icon.png';
import userIcon from '../../assets/user-icon.png';

const DepartmentChairNavBar = () => {
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
        <div className="departmentchair-nav-top-navbar">
            <div className="departmentchair-nav-logo">
                <img src={bilkentIcon} alt="Bilkent Logo" />
            </div>
            <div className="departmentchair-nav-links">
                <Link to="/departmentchair/home" className={isActive('/departmentchair/home') ? 'active' : ''}>
                    Home
                </Link>
                <Link to="/departmentchair/ta-workload" className={isActive('/departmentchair/ta-workload') ? 'active' : ''}>
                    TA Workload
                </Link>
                <Link to="/departmentchair/exams" className={isActive('/departmentchair/exams') ? 'active' : ''}>
                    Exams
                </Link>
                <Link to="/departmentchair/assign" className={isActive('/departmentchair/assign') ? 'active' : ''}>
                    TA Assign
                </Link>
                <Link to="/departmentchair/leaverequest" className={isActive('/departmentchair/leaverequest') ? 'active' : ''}>
                    TA Leave Request
                </Link>
            </div>
            <div className="instructor-nav-icons" style={{ marginLeft: 'auto' }}>
                <div className="instructor-nav-notification-icon">
                    <img src={notificationIcon} alt="Notifications" />
                </div>
                <div className="instructor-nav-profile-container" ref={dropdownRef}>
                    <div className="instructor-nav-profile-icon" onClick={toggleDropdown}>
                        <img src={userIcon} alt="Profile" />
                    </div>
                    {showProfileDropdown && (
                        <div className="instructor-nav-profile-dropdown">
                            <div className="dropdown-item">Change Password</div>
                            <div className="dropdown-item">Log Out</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DepartmentChairNavBar;