import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ExamInfoPopup.css';

const ExamInfoPopup = ({ request, onClose, onRequestSwap, myCompatibleExams }) => {
  const [selectedExam, setSelectedExam] = useState(null);
  const [userExams, setUserExams] = useState(myCompatibleExams || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const API_URL = 'http://localhost:5001/api';

  // If myCompatibleExams is not provided, fetch them
  useEffect(() => {
    if (!myCompatibleExams || myCompatibleExams.length === 0) {
      fetchUserExams();
    }
  }, []);

  // Function to get authentication headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
  };

  // Fetch user's exams for swap
  const fetchUserExams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/ta/swaps/my-exams`, getAuthHeaders());
      
      if (response.data.success) {
        // Filter compatible exams based on the time window
        const compatibleExams = filterCompatibleExams(response.data.data);
        setUserExams(compatibleExams);
      } else {
        setError(response.data.message || 'Failed to fetch your exams');
      }
    } catch (err) {
      console.error('Error fetching user exams:', err);
      setError('Error loading your exams');
    } finally {
      setLoading(false);
    }
  };

  // Filter exams that are compatible with the request time window
  const filterCompatibleExams = (exams) => {
    if (!request || !exams || exams.length === 0) return [];
    
    // Parse the time window 
    const startDate = parseDate(request.availableTimeStart);
    const endDate = parseDate(request.availableTimeEnd);
    
    if (!startDate || !endDate) return exams; // If dates can't be parsed, return all
    
    // Set end date to end of day
    endDate.setHours(23, 59, 59, 999);
    
    // Filter exams that fall within the requester's time window
    return exams.filter(exam => {
      // Parse the exam date
      const examDate = parseDate(exam.examDate || exam.date);
      if (!examDate) return false;
      
      // Check if within time window
      return examDate >= startDate && examDate <= endDate;
    });
  };

  // Format date for display
  const formatDate = (dateInput) => {
    if (typeof dateInput === 'string' && dateInput.includes('/')) {
      return dateInput;
    } else if (dateInput instanceof Date) {
      return dateInput.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '.');
    }
    return 'N/A';
  };
  
  // Format time from startTime/endTime numeric values
  const formatTime = (startTime, endTime) => {
    if (typeof startTime !== 'number' || typeof endTime !== 'number') {
      return 'N/A';
    }
    
    const formatHour = (hour) => {
      const h = Math.floor(hour);
      const m = Math.round((hour - h) * 60);
      return `${h.toString().padStart(2, '0')}.${m.toString().padStart(2, '0')}`;
    };
    
    return `${formatHour(startTime)}-${formatHour(endTime)}`;
  };

  // Parse date string in DD/MM/YYYY format
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    
    if (dateStr instanceof Date) {
      return dateStr;
    }
    
    // Handle format DD/MM/YYYY
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/').map(Number);
      return new Date(year, month - 1, day);
    }
    
    // Handle format YYYY-MM-DD
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
      return new Date(dateStr);
    }
    
    return null;
  };

  const handleSelectExam = (examId) => {
    setSelectedExam(examId);
  };

  const handleSwapSubmit = () => {
    if (selectedExam) {
      onRequestSwap(selectedExam);
    }
  };

  // Get classroom list as a string
  const getClassroomList = (rooms) => {
    if (!rooms || !rooms.length) return 'TBA';
    
    if (typeof rooms === 'string') {
      return rooms;
    }
    
    return rooms.join(', ');
  };

  // Get course code from either course object or title
  const getCourseCode = (examObj) => {
    if (!examObj) return 'Unknown';
    
    if (examObj.course && examObj.course.code) {
      return examObj.course.code;
    } else if (examObj.course && typeof examObj.course === 'string') {
      return examObj.course;
    } else if (examObj.title) {
      const parts = examObj.title.split(' - ');
      return parts[0];
    } else if (examObj.courseCode) {
      return examObj.courseCode;
    }
    
    return 'Unknown';
  };

  return (
    <div className="ta-main-page-exam-info-popup-exam-info-popup-overlay">
      <div className="ta-main-page-exam-info-popup-exam-info-popup">
        <div className="ta-main-page-exam-info-popup-popup-header">
          <h3>Swap Request from {request.requesterName}</h3>
          <button className="ta-main-page-exam-info-popup-close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="ta-main-page-exam-info-popup-popup-content">
          {/* Requester's exam details */}
          <div className="ta-main-page-exam-info-popup-requester-exam-section">
            <h4>Requester's Exam</h4>
            <div className="ta-main-page-exam-info-popup-exam-details-section">
              <p><strong>Course:</strong> {getCourseCode(request.exam)}</p>
              <p><strong>Date:</strong> {formatDate(request.exam.examDate)}</p>
              <p><strong>Time:</strong> {formatTime(request.exam.startTime, request.exam.endTime)}</p>
              <p><strong>Classrooms:</strong> {getClassroomList(request.exam.examRooms)}</p>
            </div>
          </div>
          
          <div className="ta-main-page-exam-info-popup-swap-window-section">
            <p><strong>Available Swap Period:</strong> {formatDate(request.availableTimeStart)} to {formatDate(request.availableTimeEnd)}</p>
          </div>

          {/* Your exams that are compatible */}
          <div className="ta-main-page-exam-info-popup-swap-section">
            <h4>Your Compatible Exams</h4>
            
            {loading ? (
              <div className="ta-main-page-exam-info-popup-loading">Loading your exams...</div>
            ) : error ? (
              <div className="ta-main-page-exam-info-popup-error">{error}</div>
            ) : (
              <div className="ta-main-page-exam-info-popup-possible-exams-list">
                {userExams && userExams.length > 0 ? (
                  userExams.map(exam => (
                    <div 
                      key={exam.id} 
                      className={`ta-main-page-exam-info-popup-possible-exam-item ${selectedExam === exam.id ? 'selected' : ''}`}
                      onClick={() => handleSelectExam(exam.id)}
                    >
                      <div className="ta-main-page-exam-info-popup-possible-exam-course">
                        {getCourseCode(exam)} / {formatDate(exam.examDate || exam.date)}
                      </div>
                      <div className="ta-main-page-exam-info-popup-possible-exam-time">
                        {formatTime(exam.startTime, exam.endTime)}
                      </div>
                      <div className="ta-main-page-exam-info-popup-selection-indicator"></div>
                    </div>
                  ))
                ) : (
                  <div className="ta-main-page-exam-info-popup-no-exams-message">
                    You don't have any exams within the requester's available time period.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="ta-main-page-exam-info-popup-swap-action">
            <button 
              className="ta-main-page-exam-info-popup-swap-button"
              disabled={!selectedExam || loading}
              onClick={handleSwapSubmit}
            >
              Accept Swap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamInfoPopup;