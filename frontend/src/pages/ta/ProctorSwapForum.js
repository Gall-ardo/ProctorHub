import React, { useState } from 'react';
import './ProctorSwapForum.css';
import ExamInfoPopup from './ExamInfoPopup';

const ProctorSwapForum = ({ scheduleEvents, swapRequests }) => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    if (typeof date === 'string' && date.includes('/')) {
      return date;
    }
    
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '.');
  };

  // Format time for display
  const formatTime = (startTime, endTime) => {
    if (typeof startTime === 'number' && typeof endTime === 'number') {
      const formatHour = (hour) => {
        const h = Math.floor(hour);
        const m = Math.round((hour - h) * 60);
        return `${h.toString().padStart(2, '0')}.${m.toString().padStart(2, '0')}`;
      };
      return `${formatHour(startTime)}-${formatHour(endTime)}`;
    }
    return 'N/A';
  };

  // Handler for when the info button is clicked
  const handleInfoClick = (request) => {
    setSelectedRequest(request);
    setShowPopup(true);
  };

  // Handler for when the popup is closed
  const handleClosePopup = () => {
    setShowPopup(false);
  };

  // Handler for when a swap is requested
  const handleRequestSwap = (myExamId) => {
    // In a real app, this would send the swap request to the backend
    console.log(`Swap requested between my exam ${myExamId} and ${selectedRequest.exam.id} from ${selectedRequest.requesterName}`);
    
    // Close the popup after the request is made
    setShowPopup(false);
    
    // You would typically show a success message or notification here
    alert('Swap request accepted successfully!');
  };

  // Parse date string in DD/MM/YYYY format
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  // Get my exams from schedule that are within the requester's time window
  const getCompatibleMyExams = (request) => {
    if (!request || !scheduleEvents || scheduleEvents.length === 0) return [];
    
    // Parse the time window 
    const startDate = parseDate(request.availableTimeStart);
    const endDate = parseDate(request.availableTimeEnd);
    
    if (!startDate || !endDate) return [];
    
    // Set end date to end of day
    endDate.setHours(23, 59, 59, 999);
    
    // Filter my exams that fall within the requester's time window
    return scheduleEvents.filter(event => {
      // Only include proctoring exams (isExam = true)
      if (!event.isExam) return false;
      
      // Parse the exam date
      const eventDate = parseDate(event.examDate);
      if (!eventDate) return false;
      
      // Check if within time window
      return eventDate >= startDate && eventDate <= endDate;
    });
  };

  // Get course code from title or course object
  const getCourseCode = (exam) => {
    if (exam.course && exam.course.code) {
      return exam.course.code;
    } else if (exam.title) {
      const parts = exam.title.split(' - ');
      return parts[0];
    }
    return 'Unknown';
  };

  return (
    <div className="ta-main-page-proctor-swap-forum-proctor-swap-forum">
      <h2>Proctoring Swap Forum</h2>
      
      <div className="ta-main-page-proctor-swap-forum-swap-requests">
        {swapRequests && swapRequests.map(request => (
          <div key={request.id} className="ta-main-page-proctor-swap-forum-swap-request-card">
            <div className="ta-main-page-proctor-swap-forum-request-header">
              <div className="ta-main-page-proctor-swap-forum-requester-info">
                {request.requesterName} wants to swap:
              </div>
              
            </div>
            
            <div className="ta-main-page-proctor-swap-forum-exam-card">
              <div className="ta-main-page-proctor-swap-forum-exam-header">
                
                <div className="ta-main-page-proctor-swap-forum-exam-title">
                    {request.exam.title}
                </div>

                
                <button 
                  className="ta-main-page-proctor-swap-forum-info-button"
                  onClick={() => handleInfoClick(request)}
                  title="View details and possible swaps"
                >
                  i
                </button>
              </div>
              
              <div className="ta-main-page-proctor-swap-forum-exam-details">
                <div className="ta-main-page-proctor-swap-forum-exam-date">{formatDate(request.exam.examDate)}</div>
                <div className="ta-main-page-proctor-swap-forum-exam-time">
                  {formatTime(request.exam.startTime, request.exam.endTime)}
                </div>
                <div className="ta-main-page-proctor-swap-forum-swap-window">
                  Available: {formatDate(request.availableTimeStart)} to {formatDate(request.availableTimeEnd)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Display message if no swap requests */}
      {(!swapRequests || swapRequests.length === 0) && (
        <div className="ta-main-page-proctor-swap-forum-no-requests-message">
          No swap requests available at this time.
        </div>
      )}
      
      {/* Render the popup when a request is selected and showPopup is true */}
      {showPopup && selectedRequest && (
        <ExamInfoPopup 
          request={selectedRequest}
          onClose={handleClosePopup}
          onRequestSwap={handleRequestSwap}
          myCompatibleExams={getCompatibleMyExams(selectedRequest)}
        />
      )}
    </div>
  );
};

export default ProctorSwapForum;