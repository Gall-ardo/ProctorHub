import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './AdminNavBar.module.css';
import logo from '../../assets/bilkent-logo.png';
import notificationIcon from '../../assets/notification-icon.png';
import profileIcon from '../../assets/user-icon.png';


const AdminNavBar = () => {
  const location = useLocation();
  const path = location.pathname;

  // Determine active tab based on current path
  const isActive = (navPath) => {
    if (navPath === '/admin/logs' && path.includes('/admin/logs')) return true;
    if (navPath === '/admin/user' && path.includes('/admin/user')) return true;
    if (navPath === '/admin/student' && path.includes('/admin/student')) return true;
    if (navPath === '/admin/course' && path.includes('/admin/course')) return true;
    if (navPath === '/admin/classroom' && path.includes('/admin/classroom')) return true;
    if (navPath === '/admin/offering' && path.includes('/admin/offering')) return true;
    if (navPath === '/admin/semester' && path.includes('/admin/semester')) return true;
    return false;
  };

  return (
    <div className={styles.topNavbar}>
      <div className={styles.logo}>
        <img src={logo} alt="Logo" />
      </div>
      <div className={styles.navLinks}>
        <Link to="/admin/logs" className={isActive('/admin/logs') ? styles.active : ''}>
          Logs and Reports
        </Link>
        <Link to="/admin/user" className={isActive('/admin/user') ? styles.active : ''}>
          User
        </Link>
        <Link to="/admin/student" className={isActive('/admin/student') ? styles.active : ''}>
          Student
        </Link>
        <Link to="/admin/course" className={isActive('/admin/course') ? styles.active : ''}>
          Course
        </Link>
        <Link to="/admin/classroom" className={isActive('/admin/classroom') ? styles.active : ''}>
          Classroom
        </Link>
        <Link to="/admin/offering" className={isActive('/admin/offering') ? styles.active : ''}>
          Offering
        </Link>
        <Link to="/admin/semester" className={isActive('/admin/semester') ? styles.active : ''}>
          Semester
        </Link>
      </div>
      <div className={styles.navIcons}>
        <div className={styles.notificationIcon}>
          <img src={notificationIcon} alt="Notifications" />
        </div>
        <div className={styles.profileIcon}>
          <img src={profileIcon} alt="Profile" />
        </div>
      </div>
    </div>
  );
};

export default AdminNavBar;