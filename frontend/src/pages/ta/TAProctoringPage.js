import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './TAProctoringPage.css';

const NavBar = () => {
  return (
    <div className="top-navbar">
      <div className="nav-links">
        <Link to="/ta/tamainpage">Home</Link>
        <Link to="/ta/taworkloadpage">Workload</Link>
        <Link to="/ta/taproctoringpage"><strong>Proctoring</strong></Link>
        <Link to="#">Leave of Absence</Link>
        <Link to="#">Swap</Link>
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

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-container">
        <div className="dialog-icon">
          <span>ⓘ</span>
        </div>
        <div className="dialog-content">
          <div className="dialog-title">Submit for Accept</div>
          <div className="dialog-message">{message || "Are you sure you want to continue?"}</div>
          <div className="dialog-actions">
            <button className="dialog-button confirm" onClick={onConfirm}>Yes</button>
            <button className="dialog-button cancel" onClick={onClose}>Cancel</button>
          </div>
        </div>
        <button className="dialog-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

const TAProctoringPage = () => {
  const [isMultidepartment, setIsMultidepartment] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  
  const [waitingProctorings, setWaitingProctorings] = useState([
    {
      id: 1,
      course: 'CS102',
      type: 'Midterm Exam',
      date: '18.03.2025',
      time: '13.00-16.00',
      classrooms: 'EE201 - EE202'
    },
    {
      id: 2,
      course: 'CS315',
      type: 'Midterm Exam',
      date: '21.03.2025',
      time: '18.00-21.00',
      classrooms: 'EA101 - EA102'
    }
  ]);
  
  const [assignedProctorings, setAssignedProctorings] = useState([
    {
      id: 3,
      course: 'CS201',
      type: 'Midterm Exam',
      date: '22.03.2025',
      time: '13.00-16.00',
      classrooms: 'EE101 - EE102'
    },
    {
      id: 4,
      course: 'MATH102',
      type: 'Midterm Exam',
      date: '25.03.2025',
      time: '18.00-21.00',
      classrooms: 'B101 - B102 - B103 - B104'
    },
    {
      id: 5,
      course: 'CS101',
      type: 'Midterm Exam',
      date: '27.03.2025',
      time: '15.00-18.00',
      classrooms: 'EA201- EA202'
    },
    {
      id: 6,
      course: 'CS319',
      type: 'Midterm Exam',
      date: '29.03.2025',
      time: '10.00-12.00',
      classrooms: 'EB102'
    }
  ]);

  // Toggle multidepartment status
  const toggleMultidepartment = () => {
    setIsMultidepartment(!isMultidepartment);
  };

  // Handle accept/reject proctoring request
  const handleProctoringAction = (action, id) => {
    setCurrentAction({ action, id });
    setConfirmDialogOpen(true);
  };

  // Confirm accept/reject action
  const confirmAction = () => {
    if (currentAction) {
      const { action, id } = currentAction;
      
      if (action === 'accept') {
        // Find the proctoring in waiting list
        const proctoring = waitingProctorings.find(p => p.id === id);
        if (proctoring) {
          // Add to assigned and remove from waiting
          setAssignedProctorings(prev => [...prev, proctoring]);
          setWaitingProctorings(prev => prev.filter(p => p.id !== id));
        }
      } else if (action === 'reject') {
        // Just remove from waiting list
        setWaitingProctorings(prev => prev.filter(p => p.id !== id));
      }
    }
    
    // Close dialog and reset current action
    setConfirmDialogOpen(false);
    setCurrentAction(null);
  };

  // Close confirmation dialog
  const closeConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setCurrentAction(null);
  };

  // Render proctoring items for waiting approval
  const renderWaitingProctoringList = () => {
    return waitingProctorings.map((proctoring) => (
      <div key={proctoring.id} className="proctoring-item">
        <div className="proctoring-details">
          <div className="course-info">
            {proctoring.course} {proctoring.type}
          </div>
          <div className="proctoring-meta">
            <div>{proctoring.date}      {proctoring.time}</div>
            <div>Clasrooms: {proctoring.classrooms}</div>
          </div>
        </div>
        <div className="proctoring-actions">
          <button 
            className="action-button accept"
            onClick={() => handleProctoringAction('accept', proctoring.id)}
          >
            ✓
          </button>
          <button 
            className="action-button reject"
            onClick={() => handleProctoringAction('reject', proctoring.id)}
          >
            ✕
          </button>
        </div>
      </div>
    ));
  };

  // Render assigned proctoring items
  const renderAssignedProctoringList = () => {
    return assignedProctorings.map((proctoring) => (
      <div key={proctoring.id} className="proctoring-item">
        <div className="proctoring-details">
          <div className="course-info">
            {proctoring.course} {proctoring.type}
          </div>
          <div className="proctoring-meta">
            <div>{proctoring.date}      {proctoring.time}</div>
            <div>Clasrooms: {proctoring.classrooms}</div>
          </div>
        </div>
      </div>
    ));
  };

  const totalProctoringHours = 12; // This could be calculated based on assigned proctorings
  const totalRejectedProctoring = 1; // This could be tracked separately

  return (
    <div className="ta-main-page">
      <NavBar />
      <main className="main-content proctoring-main">
        <div className="proctoring-stats-vertical">
          <div className="stat-container">
            <div className="stat-item">
              <div className="stat-label">Total Proctoring Hours</div>
              <div className="circle proctoring">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path 
                    className="circle-bg" 
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path 
                    className="circle"
                    strokeDasharray={`${totalProctoringHours}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    stroke="#4CAF50"
                  />
                  <text x="18" y="20.35" className="percentage">{totalProctoringHours}</text>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="middle-stat">
            <div className="stat-item">
              <div className="stat-label">Total Rejected Proctoring Number</div>
              <div className="circle rejected">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path 
                    className="circle-bg" 
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path 
                    className="circle"
                    strokeDasharray={`${totalRejectedProctoring}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    stroke="#F44336"
                  />
                  <text x="18" y="20.35" className="percentage">{totalRejectedProctoring}</text>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="multidepartment-container" onClick={toggleMultidepartment}>
            <div className="stat-item">
              <div className="stat-label">Multidepartment Exam<br/>Proctoring Request</div>
              <div className={`circle multidepartment ${isMultidepartment ? 'active' : 'inactive'}`}>
                {isMultidepartment ? (
                  <span className="check-icon">✓</span>
                ) : (
                  <span className="x-icon">✕</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="proctoring-lists">
          <div className="proctoring-list-container">
            <h2>Waiting for Approval</h2>
            <div className="proctoring-content">
              {renderWaitingProctoringList()}
            </div>
          </div>
          <div className="proctoring-list-container">
            <h2>Current Proctoring Assignments</h2>
            <div className="proctoring-content">
              {renderAssignedProctoringList()}
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Dialog */}
      <ConfirmationDialog 
        isOpen={confirmDialogOpen}
        onClose={closeConfirmDialog}
        onConfirm={confirmAction}
        message={
          currentAction?.action === 'accept' 
            ? "Are you sure you want to accept this proctoring assignment?" 
            : "Are you sure you want to reject this proctoring assignment?"
        }
      />
    </div>
  );
};

export default TAProctoringPage;