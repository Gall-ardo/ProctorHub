import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
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
          <div className="ta-proctoring-page-dialog-title">Confirmation</div>
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
  const [isMultidepartment, setIsMultidepartment] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [waitingProctorings, setWaitingProctorings] = useState([]);
  const [assignedProctorings, setAssignedProctorings] = useState([]);
  const [proctoringStats, setProctoringStats] = useState({
    totalProctoringHours: 0,
    totalRejectedProctoring: 0,
    isMultidepartment: false
  });

  const API_URL = 'http://localhost:5001/api';

  useEffect(() => {
    const fetchProctoringData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        
        // Fetch pending proctorings
        const pendingResponse = await axios.get(`${API_URL}/ta/proctorings/pending`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (pendingResponse.data.success) {
          // Map the API data to the format expected by the component
          const formattedPendingProctorings = pendingResponse.data.data.map(item => ({
            id: item.id,
            course: item.exam.courseName,
            type: item.exam.examType,
            date: formatDate(item.exam.date),
            time: formatTime(item.exam.date, item.exam.duration),
            classrooms: item.exam.classrooms
          }));
          
          setWaitingProctorings(formattedPendingProctorings);
          console.log('🔄 Pending proctorings:', formattedPendingProctorings);
        } else {
          console.warn('⚠️ Pending fetch returned success = false:', pendingResponse.data);
        }
  
        // Fetch active proctorings
        const activeResponse = await axios.get(`${API_URL}/ta/proctorings/active`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (activeResponse.data.success) {
          // Map the API data to the format expected by the component
          const formattedActiveProctorings = activeResponse.data.data.map(item => ({
            id: item.id,
            course: item.exam.courseName,
            type: item.exam.examType,
            date: formatDate(item.exam.date),
            time: formatTime(item.exam.date, item.exam.duration),
            classrooms: item.exam.classrooms
          }));
          
          setAssignedProctorings(formattedActiveProctorings);
          console.log('✅ Active proctorings:', formattedActiveProctorings);
        } else {
          console.warn('⚠️ Active fetch returned success = false:', activeResponse.data);
        }
  
        // Fetch proctoring stats
        const statsResponse = await axios.get(`${API_URL}/ta/proctorings/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (statsResponse.data.success) {
          setProctoringStats(statsResponse.data.data);
          setIsMultidepartment(statsResponse.data.data.isMultidepartment);
          console.log('📈 Proctoring stats:', statsResponse.data.data);
        } else {
          console.warn('⚠️ Stats fetch returned success = false:', statsResponse.data);
        }
  
        setLoading(false);
        console.log('🎉 Finished fetching all proctoring data.');
      } catch (err) {
        console.error('❌ Error fetching proctoring data:', err?.response || err.message || err);
        setError('Failed to load proctoring data. Please try again later.');
        setLoading(false);
      }
    };
  
    fetchProctoringData();
  }, []);
  
  
  // Helper function to format date string
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  
  // Helper function to format time range
  const formatTime = (dateString, duration) => {
    if (!dateString || !duration) return '';
    
    const date = new Date(dateString);
    const startHour = date.getHours().toString().padStart(2, '0');
    const startMinute = date.getMinutes().toString().padStart(2, '0');
    
    // Calculate end time
    const endDate = new Date(date.getTime() + duration * 60000);
    const endHour = endDate.getHours().toString().padStart(2, '0');
    const endMinute = endDate.getMinutes().toString().padStart(2, '0');
    
    return `${startHour}.${startMinute}-${endHour}.${endMinute}`;
  };

  // Toggle multidepartment status
  const toggleMultidepartment = async () => {
    try {
      // In a real implementation, you would make an API call here
      // to update the TA's preference for multidepartment proctorings
      setIsMultidepartment(!isMultidepartment);
    } catch (err) {
      console.error('Error toggling multidepartment status:', err);
    }
  };

  // Handle accept/reject proctoring request
  const handleProctoringAction = (action, id) => {
    setCurrentAction({ action, id });
    setConfirmDialogOpen(true);
  };

  // Confirm accept/reject action
  const confirmAction = async () => {
    if (currentAction) {
      const { action, id } = currentAction;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        
        if (action === 'accept') {
          const response = await axios.put(`${API_URL}/ta/proctorings/${id}/accept`, {}, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (response.data.success) {
            // Find the proctoring in waiting list
            const proctoring = waitingProctorings.find(p => p.id === id);
            if (proctoring) {
              // Add to assigned and remove from waiting
              setAssignedProctorings(prev => [...prev, proctoring]);
              setWaitingProctorings(prev => prev.filter(p => p.id !== id));
              
              // Update stats
              setProctoringStats(prev => ({
                ...prev,
                totalProctoringHours: prev.totalProctoringHours + 3 // Assuming 3 hours per proctoring as default
              }));
            }
          }
        } else if (action === 'reject') {
          const response = await axios.put(`${API_URL}/ta/proctorings/${id}/reject`, {}, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (response.data.success) {
            // Just remove from waiting list
            setWaitingProctorings(prev => prev.filter(p => p.id !== id));
            
            // Update stats
            setProctoringStats(prev => ({
              ...prev,
              totalRejectedProctoring: prev.totalRejectedProctoring + 1
            }));
          }
        }
      } catch (err) {
        console.error(`Error ${action}ing proctoring:`, err);
        setError(`Failed to ${action} proctoring. Please try again.`);
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
    if (loading) {
      return <div className="ta-proctoring-page-loading">Loading...</div>;
    }
    
    if (waitingProctorings.length === 0) {
      return <div className="ta-proctoring-page-empty-list">No pending proctoring assignments</div>;
    }
    
    return waitingProctorings.map((proctoring) => (
      <div key={proctoring.id} className="ta-proctoring-page-proctoring-item">
        <div className="ta-proctoring-page-proctoring-details">
          <div className="ta-proctoring-page-course-info">
            {proctoring.course} {proctoring.type}
          </div>
          <div className="ta-proctoring-page-proctoring-meta">
            <div>{proctoring.date}      {proctoring.time}</div>
            <div>Classrooms: {proctoring.classrooms}</div>
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
    if (loading) {
      return <div className="ta-proctoring-page-loading">Loading...</div>;
    }
    
    if (assignedProctorings.length === 0) {
      return <div className="ta-proctoring-page-empty-list">No active proctoring assignments</div>;
    }
    
    return assignedProctorings.map((proctoring) => (
      <div key={proctoring.id} className="ta-proctoring-page-proctoring-item">
        <div className="ta-proctoring-page-proctoring-details">
          <div className="ta-proctoring-page-course-info">
            {proctoring.course} {proctoring.type}
          </div>
          <div className="ta-proctoring-page-proctoring-meta">
            <div>{proctoring.date}      {proctoring.time}</div>
            <div>Classrooms: {proctoring.classrooms}</div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="ta-proctoring-page-main-page">
      <TANavBar />
      <main className="ta-proctoring-page-main-content ta-proctoring-page-proctoring-main">
        {error && <div className="ta-proctoring-page-error">{error}</div>}
        
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
                    strokeDasharray={`${proctoringStats.totalProctoringHours}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    stroke="#4CAF50"
                  />
                  <text x="18" y="20.35" className="ta-proctoring-page-percentage">{proctoringStats.totalProctoringHours}</text>
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
                    strokeDasharray={`${proctoringStats.totalRejectedProctoring}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    stroke="#F44336"
                  />
                  <text x="18" y="20.35" className="ta-proctoring-page-percentage">{proctoringStats.totalRejectedProctoring}</text>
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