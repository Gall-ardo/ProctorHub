// Revised TAProctoringPage.jsx with departmental breakdown
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './TAProctoringPage.css';
import TANavBar from './TANavBar';

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, message, isError = false }) => {
  if (!isOpen) return null;

  return (
    <div className="ta-proctoring-page-dialog-overlay">
      <div className="ta-proctoring-page-dialog-container">
        <div className={`ta-proctoring-page-dialog-icon ${isError ? 'error' : ''}`}>
          <span>{isError ? "⚠" : "ⓘ"}</span>
        </div>
        <div className="ta-proctoring-page-dialog-content">
          <div className="ta-proctoring-page-dialog-title">{isError ? "Warning" : "Confirmation"}</div>
          <div className="ta-proctoring-page-dialog-message">{message || "Are you sure you want to continue?"}</div>
          <div className="ta-proctoring-page-dialog-actions">
            {!isError && (
              <button className="ta-proctoring-page-dialog-button confirm" onClick={onConfirm}>Yes</button>
            )}
            <button 
              className={`ta-proctoring-page-dialog-button ${isError ? 'okay' : 'cancel'}`} 
              onClick={onClose}
            >
              {isError ? 'Okay' : 'Cancel'}
            </button>
          </div>
        </div>
        <button className="ta-proctoring-page-dialog-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

const SuccessDialog = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="ta-proctoring-page-dialog-overlay">
      <div className="ta-proctoring-page-dialog-container">
        <div className="ta-proctoring-page-dialog-icon" style={{ backgroundColor: "#4CAF50" }}>
          <span>✓</span>
        </div>
        <div className="ta-proctoring-page-dialog-content">
          <div className="ta-proctoring-page-dialog-title">Success</div>
          <div className="ta-proctoring-page-dialog-message">{message}</div>
          <div className="ta-proctoring-page-dialog-actions">
            <button 
              className="ta-proctoring-page-dialog-button okay" 
              onClick={onClose}
              style={{
                backgroundColor: "#2196F3", 
                color: "white", 
                border: "none", 
                padding: "8px 16px", 
                borderRadius: "4px", 
                cursor: "pointer", 
                fontWeight: "500"
              }}
            >
              OK
            </button>
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
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentAction, setCurrentAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taDepartment, setTaDepartment] = useState('');
  
  const [waitingProctorings, setWaitingProctorings] = useState([]);
  const [assignedProctorings, setAssignedProctorings] = useState([]);
  const [proctoringStats, setProctoringStats] = useState({
    totalProctoringHours: 0,
    departmentProctoringHours: 0,
    nonDepartmentProctoringHours: 0,
    totalRejectedProctoring: 0,
    maxRejectionsAllowed: 2,
    isRejectionLimitReached: false,
    isMultidepartment: false
  });

  const API_URL = 'http://localhost:5001/api';

  useEffect(() => {
    fetchProctoringData();
    fetchTAInfo();
  }, []);

  const fetchTAInfo = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      // This is a placeholder - in a real application, you'd fetch the TA info with department
      // For now, we'll assume the TA department is available in the stats response
      const response = await axios.get(`${API_URL}/ta/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setTaDepartment(response.data.data.department);
      }
    } catch (err) {
      console.error('Error fetching TA info:', err);
    }
  };

  const fetchProctoringData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const pendingResponse = await axios.get(`${API_URL}/ta/proctorings/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (pendingResponse.data.success) {
        const formatted = pendingResponse.data.data.map(item => ({
          id: item.id,
          course: item.exam.Course?.department + " " + item.exam.Course?.courseCode || 'N/A',
          type: item.exam.examType,
          date: formatDate(item.exam.date),
          time: formatTime(item.exam.date, item.exam.duration),
          classrooms: item.exam.examRooms?.map(room => room.name).join(', ') || 'N/A',
          duration: item.exam.duration || 0, // Store duration in minutes
          department: item.exam.department // Store department for comparison
        }));
        setWaitingProctorings(formatted);
      }

      const activeResponse = await axios.get(`${API_URL}/ta/proctorings/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (activeResponse.data.success) {
        const formatted = activeResponse.data.data.map(item => ({
          id: item.id,
          course: item.exam.Course?.courseCode || 'N/A',
          type: item.exam.examType,
          date: formatDate(item.exam.date),
          time: formatTime(item.exam.date, item.exam.duration),
          classrooms: item.exam.examRooms?.map(room => room.name).join(', ') || 'N/A',
          duration: item.exam.duration || 0, // Store duration in minutes
          department: item.exam.department // Store department for comparison
        }));
        setAssignedProctorings(formatted);
      }

      const statsResponse = await axios.get(`${API_URL}/ta/proctorings/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (statsResponse.data.success) {
        setProctoringStats(statsResponse.data.data);
        setIsMultidepartment(statsResponse.data.data.isMultidepartment);
        
        // If we didn't get the department from profile, try to use it from stats
        if (!taDepartment && statsResponse.data.data.department) {
          setTaDepartment(statsResponse.data.data.department);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching data:', err);
      setError('Failed to load proctoring data.');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (dateString, duration) => {
    if (!dateString || !duration) return '';
    const date = new Date(dateString);
    const endDate = new Date(date.getTime() + duration * 60000);
    return `${date.getHours().toString().padStart(2, '0')}.${date.getMinutes().toString().padStart(2, '0')}` +
           `-${endDate.getHours().toString().padStart(2, '0')}.${endDate.getMinutes().toString().padStart(2, '0')}`;
  };

  const toggleMultidepartment = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const updatedValue = !isMultidepartment;

      const response = await axios.put(`${API_URL}/ta/profile/multidepartment`, {
        isMultidepartmentExam: updatedValue
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setIsMultidepartment(updatedValue);
      } else {
        throw new Error('Failed to update preference');
      }
    } catch (err) {
      console.error('Error updating multidepartment status:', err);
      setError('Failed to update multidepartment setting.');
    }
  };

  const handleProctoringAction = (action, id) => {
    if (action === 'reject' && proctoringStats.isRejectionLimitReached) {
      setErrorMessage(`You have reached the maximum number of allowed rejections (${proctoringStats.maxRejectionsAllowed}). Please accept proctoring assignments or contact your administrator.`);
      setErrorDialogOpen(true);
      return;
    }
    
    // Find the proctoring to get information about it
    const proctoring = waitingProctorings.find(p => p.id === id);
    
    if (action === 'accept') {
      const hours = Math.ceil(proctoring.duration / 60);
      const isDepartmentProctoring = proctoring.department === taDepartment;
      const departmentLabel = isDepartmentProctoring ? 'your department' : 'another department';
      
      const confirmMessage = `Are you sure you want to accept this proctoring assignment? 
      \nThis will add ${hours} hour${hours !== 1 ? 's' : ''} to your ${departmentLabel} proctoring hours and total workload.`;
      
      setCurrentAction({ action, id, proctoring, isDepartmentProctoring, hours });
      setConfirmDialogOpen(true);
      return;
    }
    
    setCurrentAction({ action, id, proctoring });
    setConfirmDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!currentAction) return;
    const { action, id, proctoring, isDepartmentProctoring, hours } = currentAction;

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) throw new Error('No token');

      const response = await axios.put(`${API_URL}/ta/proctorings/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        if (action === 'accept') {
          const accepted = waitingProctorings.find(p => p.id === id);
          
          setAssignedProctorings(prev => [...prev, accepted]);
          setWaitingProctorings(prev => prev.filter(p => p.id !== id));
          
          // Show success message with workload hours information
          const departmentText = isDepartmentProctoring ? 'your department' : 'non-department';
          setSuccessMessage(`Proctoring assignment accepted successfully! ${hours} hour${hours !== 1 ? 's' : ''} has been added to your ${departmentText} proctoring count and total workload.`);
          setSuccessDialogOpen(true);
          
          // Update statistics
          setProctoringStats(prev => {
            const updatedStats = { ...prev };
            
            if (isDepartmentProctoring) {
              updatedStats.departmentProctoringHours += hours;
            } else {
              updatedStats.nonDepartmentProctoringHours += hours;
            }
            
            updatedStats.totalProctoringHours = updatedStats.departmentProctoringHours + updatedStats.nonDepartmentProctoringHours;
            return updatedStats;
          });
        } else {
          setWaitingProctorings(prev => prev.filter(p => p.id !== id));
          // Update rejection count in stats
          setProctoringStats(prev => ({
            ...prev,
            totalRejectedProctoring: prev.totalRejectedProctoring + 1,
            isRejectionLimitReached: prev.totalRejectedProctoring + 1 >= prev.maxRejectionsAllowed
          }));
        }
      }
    } catch (err) {
      console.error(`Failed to ${action} proctoring:`, err);
      if (err.response?.data?.maxRejectionsReached) {
        setErrorMessage(err.response.data.message);
        setErrorDialogOpen(true);
      } else {
        setError(`Failed to ${action} proctoring.`);
      }
    }

    setConfirmDialogOpen(false);
    setCurrentAction(null);
  };

  const closeConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setCurrentAction(null);
  };

  const closeErrorDialog = () => {
    setErrorDialogOpen(false);
  };
  
  const closeSuccessDialog = () => {
    setSuccessDialogOpen(false);
  };

  const renderWaitingProctoringList = () => {
    if (loading) return <div className="ta-proctoring-page-loading">Loading...</div>;
    if (waitingProctorings.length === 0) return <div className="ta-proctoring-page-empty-list">No pending proctoring assignments</div>;
    return waitingProctorings.map((p) => {
      const isDepartmentProctoring = p.department === taDepartment;
      return (
        <div key={p.id} className="ta-proctoring-page-proctoring-item">
          <div className="ta-proctoring-page-proctoring-details">
            <div className="ta-proctoring-page-course-info">{p.course} {p.type}</div>
            <div className="ta-proctoring-page-proctoring-meta">
              <div>{p.date} {p.time}</div>
              <div>Classrooms: {p.classrooms}</div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginTop: '5px'
              }}>
                <div style={{
                  backgroundColor: '#e3f2fd',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '0.85rem',
                  color: '#1565c0',
                  display: 'inline-block'
                }}>
                  Workload: {Math.ceil(p.duration / 60)} hour{Math.ceil(p.duration / 60) !== 1 ? 's' : ''}
                </div>
                <div style={{
                  backgroundColor: isDepartmentProctoring ? '#e8f5e9' : '#fff3e0',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '0.85rem',
                  color: isDepartmentProctoring ? '#2e7d32' : '#ef6c00',
                  display: 'inline-block'
                }}>
                  {isDepartmentProctoring ? 'Department Exam' : 'Non-Department Exam'}
                </div>
              </div>
            </div>
          </div>
          <div className="ta-proctoring-page-proctoring-actions">
            <button className="ta-proctoring-page-action-button accept" onClick={() => handleProctoringAction('accept', p.id)}>✓</button>
            <button 
              className={`ta-proctoring-page-action-button reject ${proctoringStats.isRejectionLimitReached ? 'disabled' : ''}`} 
              onClick={() => handleProctoringAction('reject', p.id)}
              disabled={proctoringStats.isRejectionLimitReached}
            >
              ✕
            </button>
          </div>
        </div>
      );
    });
  };

  const renderAssignedProctoringList = () => {
    if (loading) return <div className="ta-proctoring-page-loading">Loading...</div>;
    if (assignedProctorings.length === 0) return <div className="ta-proctoring-page-empty-list">No active proctoring assignments</div>;
    return assignedProctorings.map((p) => {
      const isDepartmentProctoring = p.department === taDepartment;
      return (
        <div key={p.id} className="ta-proctoring-page-proctoring-item">
          <div className="ta-proctoring-page-proctoring-details">
            <div className="ta-proctoring-page-course-info">{p.course} {p.type}</div>
            <div className="ta-proctoring-page-proctoring-meta">
              <div>{p.date} {p.time}</div>
              <div>Classrooms: {p.classrooms}</div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginTop: '5px'
              }}>
                <div style={{
                  backgroundColor: '#e3f2fd',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '0.85rem',
                  color: '#1565c0',
                  display: 'inline-block'
                }}>
                  Workload: {Math.ceil(p.duration / 60)} hour{Math.ceil(p.duration / 60) !== 1 ? 's' : ''}
                </div>
                <div style={{
                  backgroundColor: isDepartmentProctoring ? '#e8f5e9' : '#fff3e0',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '0.85rem',
                  color: isDepartmentProctoring ? '#2e7d32' : '#ef6c00',
                  display: 'inline-block'
                }}>
                  {isDepartmentProctoring ? 'Department Exam' : 'Non-Department Exam'}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  // Calculate percentage for rejected proctorings circle
  const rejectionPercentage = proctoringStats.maxRejectionsAllowed > 0
    ? (proctoringStats.totalRejectedProctoring / proctoringStats.maxRejectionsAllowed) * 100
    : 0;
  
  // Clip to 100% maximum
  const clippedRejectionPercentage = Math.min(rejectionPercentage, 100);

  // Get breakdown of department vs non-department hours
  const departmentProctoringHours = proctoringStats.departmentProctoringHours || 0;
  const nonDepartmentProctoringHours = proctoringStats.nonDepartmentProctoringHours || 0;
  const totalProctoringHours = departmentProctoringHours + nonDepartmentProctoringHours;

  return (
    <div className="ta-proctoring-page-main-page">
      <TANavBar />
      <main className="ta-proctoring-page-main-content ta-proctoring-page-proctoring-main">
        {error && <div className="ta-proctoring-page-error">{error}</div>}

        <div className="ta-proctoring-page-proctoring-stats-vertical">
          <div className="ta-proctoring-page-stat-container">
            <div className="ta-proctoring-page-stat-item">
              <div className="ta-proctoring-page-stat-label">
                Total Proctoring Hours
              </div>
              <div className="ta-proctoring-page-circle proctoring">
                <svg viewBox="0 0 36 36" className="ta-proctoring-page-circular-chart">
                  <path className="ta-proctoring-page-circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="ta-proctoring-page-circle" strokeDasharray={`${totalProctoringHours}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke="#4CAF50" />
                  <text x="18" y="20.35" className="ta-proctoring-page-percentage">{totalProctoringHours}</text>
                </svg>
              </div>
              
              {/* Department Hours Breakdown */}
              {totalProctoringHours > 0 && (
                <div style={{
                  marginTop: '10px',
                  width: '100%',
                  fontSize: '0.85rem'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '4px'
                  }}>
                    <span style={{ color: '#2e7d32' }}>Department:</span>
                    <span style={{ fontWeight: 'bold' }}>{departmentProctoringHours}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ color: '#ef6c00' }}>Non-Department:</span>
                    <span style={{ fontWeight: 'bold' }}>{nonDepartmentProctoringHours}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="ta-proctoring-page-middle-stat">
            <div className="ta-proctoring-page-stat-item">
              <div className="ta-proctoring-page-stat-label">
                Total Rejected Proctoring 
                <br />
                <span className={`ta-proctoring-page-limit-text ${proctoringStats.isRejectionLimitReached ? 'limit-reached' : ''}`}>
                  ({proctoringStats.totalRejectedProctoring}/{proctoringStats.maxRejectionsAllowed} limit)
                </span>
              </div>
              <div className={`ta-proctoring-page-circle rejected ${proctoringStats.isRejectionLimitReached ? 'limit-reached' : ''}`}>
                <svg viewBox="0 0 36 36" className="ta-proctoring-page-circular-chart">
                  <path className="ta-proctoring-page-circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path 
                    className="ta-proctoring-page-circle" 
                    strokeDasharray={`${clippedRejectionPercentage}, 100`} 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    stroke={proctoringStats.isRejectionLimitReached ? "#F44336" : "#FF9800"}
                  />
                  <text x="18" y="20.35" className="ta-proctoring-page-percentage">{proctoringStats.totalRejectedProctoring}</text>
                </svg>
                {proctoringStats.isRejectionLimitReached && (
                  <div className="ta-proctoring-page-limit-indicator">
                    <span className="ta-proctoring-page-limit-icon">!</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="ta-proctoring-page-multidepartment-container" onClick={toggleMultidepartment}>
            <div className="ta-proctoring-page-stat-item">
              <div className="ta-proctoring-page-stat-label">Multidepartment Exam<br />Proctoring Request</div>
              <div className={`ta-proctoring-page-circle multidepartment ${isMultidepartment ? 'active' : 'inactive'}`}>
                {isMultidepartment ? <span className="ta-proctoring-page-check-icon">✓</span> : <span className="ta-proctoring-page-x-icon">✕</span>}
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

      <ConfirmationDialog 
        isOpen={confirmDialogOpen}
        onClose={closeConfirmDialog}
        onConfirm={confirmAction}
        message={
          currentAction?.action === 'accept' 
            ? `Are you sure you want to accept this proctoring assignment? This will add ${currentAction.hours} hour${currentAction.hours !== 1 ? 's' : ''} to your ${currentAction.isDepartmentProctoring ? 'department' : 'non-department'} proctoring hours and total workload.` 
            : "Are you sure you want to reject this proctoring assignment?"
        }
      />
      
      <ConfirmationDialog 
        isOpen={errorDialogOpen}
        onClose={closeErrorDialog}
        message={errorMessage}
        isError={true}
      />
      
      <SuccessDialog
        isOpen={successDialogOpen}
        onClose={closeSuccessDialog}
        message={successMessage}
      />
    </div>
  );
};

export default TAProctoringPage;