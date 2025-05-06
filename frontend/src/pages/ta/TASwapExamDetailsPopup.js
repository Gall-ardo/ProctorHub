import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TASwapExamDetailsPopup.css';

const TASwapExamDetailsPopup = ({ isOpen, onClose, examDetails, userExams = [] }) => {
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [myExams, setMyExams] = useState([]);

  const API_URL = 'http://localhost:5001/api';

  // Reset selected exam when modal opens with new exam details
  useEffect(() => {
    if (isOpen && examDetails) {
      setSelectedExam(null);
      setError('');
      setSuccess('');
      
      // Use provided exams or fetch them if not provided
      if (userExams && userExams.length > 0) {
        setMyExams(userExams);
      } else {
        fetchMyExams();
      }
    }
  }, [isOpen, examDetails, userExams]);

  // Fetch user's exams for swap
  const fetchMyExams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
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
        setMyExams(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch your exams');
      }
    } catch (err) {
      setError('Error fetching your exams. Please try again.');
      console.error('Error fetching exams:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle exam selection
  const handleExamSelection = (exam) => {
    setSelectedExam(exam.id === selectedExam ? null : exam.id);
  };

  // Handle swap button click
  const handleSwap = async () => {
    if (!selectedExam) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }
      
      const response = await axios.post(`${API_URL}/ta/swaps/respond`, {
        swapRequestId: examDetails.id,
        examIdToSwap: selectedExam
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setSuccess('Swap completed successfully!');
        // Close the modal after a brief delay to show success message
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to complete swap');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error completing swap. Please try again.');
      console.error('Error completing swap:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !examDetails) return null;

  return (
    <div className="ta-exam-details-overlay">
      <div className="ta-exam-details-modal">
        <div className="ta-exam-details-close">
          <button onClick={onClose}>×</button>
        </div>
        
        <div className="ta-exam-details-content">
          {/* Success Message */}
          {success && (
            <div style={{ padding: '15px', backgroundColor: '#dff0d8', color: '#3c763d', marginBottom: '20px', borderRadius: '4px' }}>
              {success}
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div style={{ padding: '15px', backgroundColor: '#f2dede', color: '#a94442', marginBottom: '20px', borderRadius: '4px' }}>
              {error}
            </div>
          )}
          
          {/* Exam details section */}
          <div className="ta-exam-details-info">
            <h2>{examDetails.course} Midterm Exam</h2>
            <div className="ta-exam-details-meta">
              <div className="ta-exam-details-row">
                <div>{examDetails.date}</div>
                <div>{examDetails.time}</div>
              </div>
              <div className="ta-exam-details-classroom">
                Classrooms: {examDetails.classroom || examDetails.classrooms}
              </div>
              {examDetails.requestedBy && (
                <div className="ta-exam-details-requested-by">
                  Requested by: {examDetails.requestedBy}
                </div>
              )}
            </div>
          </div>
          
          {/* Possible exams to swap section */}
          <div className="ta-exam-details-possible-exams">
            <h3>Possible Exams to Swap</h3>
            
            {loading && <div style={{ textAlign: 'center', padding: '20px' }}>Loading your exams...</div>}
            
            {!loading && myExams.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                You don't have any exams available for swap
              </div>
            )}
            
            {!loading && myExams.length > 0 && (
              <div className="ta-exam-details-exam-list">
                {myExams.map((exam) => (
                  <div 
                    key={exam.id} 
                    className={`ta-exam-details-exam-item ${selectedExam === exam.id ? 'selected' : ''}`}
                    onClick={() => handleExamSelection(exam)}
                  >
                    <div className="ta-exam-details-exam-info">
                      {exam.course} / {exam.date} / {exam.time}
                    </div>
                    <div className="ta-exam-details-exam-radio">
                      {selectedExam === exam.id ? (
                        <div className="radio-selected"></div>
                      ) : (
                        <div className="radio-unselected"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Swap button */}
          <div className="ta-exam-details-actions">
            <button 
              className="ta-exam-details-swap-button" 
              onClick={handleSwap}
              disabled={loading || !selectedExam}
            >
              {loading ? 'Processing...' : 'Swap'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TASwapExamDetailsPopup;