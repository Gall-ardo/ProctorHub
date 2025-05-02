// TAProctoringPage.jsx
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

        const pendingResponse = await axios.get(`${API_URL}/ta/proctorings/pending`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (pendingResponse.data.success) {
          const formatted = pendingResponse.data.data.map(item => ({
            id: item.id,
            course: item.exam.Course?.courseCode || 'N/A',
            type: item.exam.examType,
            date: formatDate(item.exam.date),
            time: formatTime(item.exam.date, item.exam.duration),
            classrooms: item.exam.examRooms?.map(room => room.name).join(', ') || 'N/A'
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
            classrooms: item.exam.examRooms?.map(room => room.name).join(', ') || 'N/A'
          }));
          setAssignedProctorings(formatted);
        }

        const statsResponse = await axios.get(`${API_URL}/ta/proctorings/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (statsResponse.data.success) {
          setProctoringStats(statsResponse.data.data);
          setIsMultidepartment(statsResponse.data.data.isMultidepartment);
        }

        setLoading(false);
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        setError('Failed to load proctoring data.');
        setLoading(false);
      }
    };

    fetchProctoringData();
  }, []);

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
      const token = localStorage.getItem('token');
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
    setCurrentAction({ action, id });
    setConfirmDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!currentAction) return;
    const { action, id } = currentAction;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');

      const response = await axios.put(`${API_URL}/ta/proctorings/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        if (action === 'accept') {
          const accepted = waitingProctorings.find(p => p.id === id);
          setAssignedProctorings(prev => [...prev, accepted]);
          setWaitingProctorings(prev => prev.filter(p => p.id !== id));
        } else {
          setWaitingProctorings(prev => prev.filter(p => p.id !== id));
        }
      }
    } catch (err) {
      console.error(`Failed to ${action} proctoring:`, err);
      setError(`Failed to ${action} proctoring.`);
    }

    setConfirmDialogOpen(false);
    setCurrentAction(null);
  };

  const closeConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setCurrentAction(null);
  };

  const renderWaitingProctoringList = () => {
    if (loading) return <div className="ta-proctoring-page-loading">Loading...</div>;
    if (waitingProctorings.length === 0) return <div className="ta-proctoring-page-empty-list">No pending proctoring assignments</div>;
    return waitingProctorings.map((p) => (
      <div key={p.id} className="ta-proctoring-page-proctoring-item">
        <div className="ta-proctoring-page-proctoring-details">
          <div className="ta-proctoring-page-course-info">{p.course} {p.type}</div>
          <div className="ta-proctoring-page-proctoring-meta">
            <div>{p.date} {p.time}</div>
            <div>Classrooms: {p.classrooms}</div>
          </div>
        </div>
        <div className="ta-proctoring-page-proctoring-actions">
          <button className="ta-proctoring-page-action-button accept" onClick={() => handleProctoringAction('accept', p.id)}>✓</button>
          <button className="ta-proctoring-page-action-button reject" onClick={() => handleProctoringAction('reject', p.id)}>✕</button>
        </div>
      </div>
    ));
  };

  const renderAssignedProctoringList = () => {
    if (loading) return <div className="ta-proctoring-page-loading">Loading...</div>;
    if (assignedProctorings.length === 0) return <div className="ta-proctoring-page-empty-list">No active proctoring assignments</div>;
    return assignedProctorings.map((p) => (
      <div key={p.id} className="ta-proctoring-page-proctoring-item">
        <div className="ta-proctoring-page-proctoring-details">
          <div className="ta-proctoring-page-course-info">{p.course} {p.type}</div>
          <div className="ta-proctoring-page-proctoring-meta">
            <div>{p.date} {p.time}</div>
            <div>Classrooms: {p.classrooms}</div>
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
                  <path className="ta-proctoring-page-circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="ta-proctoring-page-circle" strokeDasharray={`${proctoringStats.totalProctoringHours}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke="#4CAF50" />
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
                  <path className="ta-proctoring-page-circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="ta-proctoring-page-circle" strokeDasharray={`${proctoringStats.totalRejectedProctoring}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke="#F44336" />
                  <text x="18" y="20.35" className="ta-proctoring-page-percentage">{proctoringStats.totalRejectedProctoring}</text>
                </svg>
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
            ? "Are you sure you want to accept this proctoring assignment?" 
            : "Are you sure you want to reject this proctoring assignment?"
        }
      />
    </div>
  );
};

export default TAProctoringPage;
