import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TAPersonalSwapRequest.css';

const TAPersonalSwapRequest = ({ isOpen, onClose, currentUserExams = [] }) => {
  const [taEmail, setTaEmail] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get user's exams from props or fetch them if not provided
  const [exams, setExams] = useState([]);

  const API_URL = 'http://localhost:5001/api';

  useEffect(() => {
    // If current user exams were provided as props, use those
    if (currentUserExams.length > 0) {
      setExams(currentUserExams);
    } else {
      // Otherwise fetch them from the API
      fetchUserExams();
    }
  }, [currentUserExams]);

  const fetchUserExams = async () => {
    try {
      setLoading(true);
      // Get the token from localStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/ta/swaps/my-exams`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setExams(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch exams');
      }
    } catch (err) {
      if (err.response) {
        console.error('Server error:', err.response.data);
        setError(err.response.data.message || 'Server error');
      } else if (err.request) {
        console.error('No response received:', err.request);
        setError('No response from server.');
      } else {
        console.error('Error', err.message);
        setError('Unexpected error: ' + err.message);
      }
      
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Reset messages
    setError('');
    setSuccess('');
    
    // Validate inputs
    if (!taEmail) {
      setError('Please enter a TA email');
      return;
    }
    
    if (!selectedExam) {
      setError('Please select an exam to swap');
      return;
    }
    
    if (!startDate || !endDate) {
      setError('Please select date range');
      return;
    }
    
    try {
      setLoading(true);
      // Get the token from localStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }
      
      // Prepare request data
      const requestData = {
        targetTaEmail: taEmail,
        examId: selectedExam,
        startDate,
        endDate
      };
      
      // Send API request
      const response = await axios.post(`${API_URL}/ta/swaps`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setSuccess('Swap request sent successfully');
        // Reset form and close modal after a brief delay to show success message
        setTimeout(() => {
          resetForm();
          onClose();
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to send swap request');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
      console.error('Error sending swap request:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTaEmail('');
    setStartDate('');
    setEndDate('');
    setSelectedExam(null);
    setError('');
    setSuccess('');
  };

  const handleExamSelection = (exam) => {
    setSelectedExam(exam.id === selectedExam ? null : exam.id);
  };

  if (!isOpen) return null;

  return (
    <div className="ta-personal-swap-overlay">
      <div className="ta-personal-swap-modal">
        <div className="ta-personal-swap-header">
          <h2 className="ta-personal-swap-title">Send Personal Swap Request</h2>
          <button className="ta-personal-swap-close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="ta-personal-swap-content">
          {/* Success Message */}
          {success && (
            <div className="ta-personal-swap-success" style={{ padding: '15px', backgroundColor: '#dff0d8', color: '#3c763d', margin: '15px', borderRadius: '4px' }}>
              {success}
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="ta-personal-swap-error" style={{ padding: '15px', backgroundColor: '#f2dede', color: '#a94442', margin: '15px', borderRadius: '4px' }}>
              {error}
            </div>
          )}
          
          {/* TA Email Input */}
          <div className="ta-personal-swap-section">
            <label className="ta-personal-swap-label">TA Email</label>
            <input 
              type="email" 
              className="ta-personal-swap-input" 
              placeholder="Enter TA e-mail" 
              value={taEmail} 
              onChange={(e) => setTaEmail(e.target.value)} 
            />
          </div>
          
          {/* Date Selection */}
          <div className="ta-personal-swap-section">
            <label className="ta-personal-swap-label">Select date</label>
            <div className="ta-personal-swap-date-container">
              <div className="ta-personal-swap-date-header">
              </div>
              
              <div className="ta-personal-swap-date-inputs">
                <div className="ta-personal-swap-date-fields">
                  <div className="ta-personal-swap-date-field">
                    <div className="ta-personal-swap-date-label">Start date</div>
                    <div className="ta-personal-swap-input-with-icon">
                      <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)}  
                      />
                    </div>
                  </div>
                  <div className="ta-personal-swap-date-field">
                    <div className="ta-personal-swap-date-label">End date</div>
                    <div className="ta-personal-swap-input-with-icon">
                      <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)}  
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Exam Selection */}
          <div className="ta-personal-swap-section">
            <label className="ta-personal-swap-label">Exam to Swap</label>
            {loading && <div style={{ textAlign: 'center', padding: '20px' }}>Loading exams...</div>}
            {!loading && exams.length === 0 && 
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                No exams available for swap
              </div>
            }
            {!loading && exams.length > 0 && (
              <div className="ta-personal-swap-exam-list">
                {exams.map((exam) => (
                  <div 
                    key={exam.id} 
                    className={`ta-personal-swap-exam-item ${selectedExam === exam.id ? 'selected' : ''}`}
                    onClick={() => handleExamSelection(exam)}
                  >
                    <div className="ta-personal-swap-exam-info">
                      {exam.course} / {exam.date} / {exam.time}
                    </div>
                    <div className="ta-personal-swap-exam-radio">
                      {selectedExam === exam.id ? <div className="radio-selected"></div> : <div className="radio-unselected"></div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="ta-personal-swap-footer">
          <button 
            className="ta-personal-swap-submit-button" 
            onClick={handleSubmit}
            disabled={loading || !taEmail || !selectedExam}
          >
            {loading ? 'Sending...' : 'Send Personal Swap Request'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TAPersonalSwapRequest;