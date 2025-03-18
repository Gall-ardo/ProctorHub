// src/pages/admin/Dashboard.js
import React from 'react';
import './AdminMainPage.css';

function Dashboard() {
  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="user-info">
          <span>Welcome, Admin</span>
          <button className="logout-button">Logout</button>
        </div>
      </header>
      
      <div className="dashboard-content">
        <div className="sidebar">
          <ul className="nav-menu">
            <li className="active">Dashboard</li>
            <li>Users</li>
            <li>Exams</li>
            <li>Reports</li>
            <li>Settings</li>
          </ul>
        </div>
        
        <div className="main-content">
          <div className="stats-row">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-number">1,245</p>
              <p className="stat-change positive">+12% from last month</p>
            </div>
            
            <div className="stat-card">
              <h3>Active Exams</h3>
              <p className="stat-number">32</p>
              <p className="stat-change positive">+5 new exams</p>
            </div>
            
            <div className="stat-card">
              <h3>Pending Approvals</h3>
              <p className="stat-number">8</p>
              <p className="stat-change negative">Requires attention</p>
            </div>
          </div>
          
          <div className="recent-activities">
            <h2>Recent Activities</h2>
            <div className="activity-list">
              <div className="activity-item">
                <p><strong>John Doe</strong> created a new exam: Introduction to Computer Science</p>
                <span className="activity-time">2 hours ago</span>
              </div>
              <div className="activity-item">
                <p><strong>Jane Smith</strong> requested approval for Data Structures Exam</p>
                <span className="activity-time">5 hours ago</span>
              </div>
              <div className="activity-item">
                <p><strong>System</strong> completed automatic backup</p>
                <span className="activity-time">12 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;