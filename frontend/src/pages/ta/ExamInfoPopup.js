import React, { useState } from 'react';
import './ExamInfoPopup.css';

const ExamInfoPopup = ({ request, onClose, onRequestSwap, myCompatibleExams }) => {
  const [selectedExam, setSelectedExam] = useState(null);

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
    return rooms.join(', ');
  };

  // Get course code from either course object or title
  const getCourseCode = (examObj) => {
    if (examObj.course && examObj.course.code) {
      return examObj.course.code;
    } else if (examObj.title) {
      const parts = examObj.title.split(' - ');
      return parts[0];
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
            <div className="ta-main-page-exam-info-popup-possible-exams-list">
              {myCompatibleExams && myCompatibleExams.length > 0 ? (
                myCompatibleExams.map(exam => (
                  <div 
                    key={exam.id} 
                    className={`ta-main-page-exam-info-popup-possible-exam-item ${selectedExam === exam.id ? 'selected' : ''}`}
                    onClick={() => handleSelectExam(exam.id)}
                  >
                    <div className="ta-main-page-exam-info-popup-possible-exam-course">
                      {getCourseCode(exam)} / {formatDate(exam.examDate)}
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
          </div>

          <div className="ta-main-page-exam-info-popup-swap-action">
            <button 
              className="ta-main-page-exam-info-popup-swap-button"
              disabled={!selectedExam}
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