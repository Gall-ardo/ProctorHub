import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './TAProctoringPage.css';
import TANavBar from './TANavBar';

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="ta-proctoring-page-dialog-overlay">
      <div className="ta-proctoring-page-dialog-container">
        <div className="ta-proctoring-page-dialog-icon">
          <span>ⓘ</span>
        </div>
        <div className="ta-proctoring-page-dialog-content">
          <div className="ta-proctoring-page-dialog-title">Submit for Accept</div>
          <div className="ta-proctoring-page-dialog-message">{message || "Are you sure you want to continue?"}</div>
          <div className="ta-proctoring-page-dialog-actions">
            <button className="ta-proctoring-page-dialog-button confirm" onClick={onConfirm}>Yes</button>
            <button className="ta-proctoring-page-dialog-button cancel" onClick={onClose}>Cancel</button>
          </div>
        </div>
        <button className="ta-proctoring-page-dialog-close" onClick={onClose}>×</button>
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
      <div key={proctoring.id} className="ta-proctoring-page-proctoring-item">
        <div className="ta-proctoring-page-proctoring-details">
          <div className="ta-proctoring-page-course-info">
            {proctoring.course} {proctoring.type}
          </div>
          <div className="ta-proctoring-page-proctoring-meta">
            <div>{proctoring.date}      {proctoring.time}</div>
            <div>Clasrooms: {proctoring.classrooms}</div>
          </div>
        </div>
        <div className="ta-proctoring-page-proctoring-actions">
          <button 
            className="ta-proctoring-page-action-button accept"
            onClick={() => handleProctoringAction('accept', proctoring.id)}
          >
            ✓
          </button>
          <button 
            className="ta-proctoring-page-action-button reject"
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
      <div key={proctoring.id} className="ta-proctoring-page-proctoring-item">
        <div className="ta-proctoring-page-proctoring-details">
          <div className="ta-proctoring-page-course-info">
            {proctoring.course} {proctoring.type}
          </div>
          <div className="ta-proctoring-page-proctoring-meta">
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
    <div className="ta-proctoring-page-main-page">
      <TANavBar />
      <main className="ta-proctoring-page-main-content ta-proctoring-page-proctoring-main">
        <div className="ta-proctoring-page-proctoring-stats-vertical">
          <div className="ta-proctoring-page-stat-container">
            <div className="ta-proctoring-page-stat-item">
              <div className="ta-proctoring-page-stat-label">Total Proctoring Hours</div>
              <div className="ta-proctoring-page-circle proctoring">
                <svg viewBox="0 0 36 36" className="ta-proctoring-page-circular-chart">
                  <path 
                    className="ta-proctoring-page-circle-bg" 
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path 
                    className="ta-proctoring-page-circle"
                    strokeDasharray={`${totalProctoringHours}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    stroke="#4CAF50"
                  />
                  <text x="18" y="20.35" className="ta-proctoring-page-percentage">{totalProctoringHours}</text>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="ta-proctoring-page-middle-stat">
            <div className="ta-proctoring-page-stat-item">
              <div className="ta-proctoring-page-stat-label">Total Rejected Proctoring Number</div>
              <div className="ta-proctoring-page-circle rejected">
                <svg viewBox="0 0 36 36" className="ta-proctoring-page-circular-chart">
                  <path 
                    className="ta-proctoring-page-circle-bg" 
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path 
                    className="ta-proctoring-page-circle"
                    strokeDasharray={`${totalRejectedProctoring}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    stroke="#F44336"
                  />
                  <text x="18" y="20.35" className="ta-proctoring-page-percentage">{totalRejectedProctoring}</text>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="ta-proctoring-page-multidepartment-container" onClick={toggleMultidepartment}>
            <div className="ta-proctoring-page-stat-item">
              <div className="ta-proctoring-page-stat-label">Multidepartment Exam<br/>Proctoring Request</div>
              <div className={`ta-proctoring-page-circle multidepartment ${isMultidepartment ? 'active' : 'inactive'}`}>
                {isMultidepartment ? (
                  <span className="ta-proctoring-page-check-icon">✓</span>
                ) : (
                  <span className="ta-proctoring-page-x-icon">✕</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="ta-proctoring-page-proctoring-lists">
          <div className="ta-proctoring-page-proctoring-list-container">
            <h2>Waiting for Approval</h2>
            <div className="ta-proctoring-page-proctoring-content">
              {renderWaitingProctoringList()}
            </div>
          </div>
          <div className="ta-proctoring-page-proctoring-list-container">
            <h2>Current Proctoring Assignments</h2>
            <div className="ta-proctoring-page-proctoring-content">
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