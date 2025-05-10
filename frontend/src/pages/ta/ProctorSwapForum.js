import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProctorSwapForum.css';
import TASwapExamDetailsPopup from './TASwapExamDetailsPopup';

const ProctorSwapForum = ({ scheduleEvents }) => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [forumSwapRequests, setForumSwapRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userExams, setUserExams] = useState([]);
  
  // API base URL
  const API_URL = 'http://localhost:5001/api';
  
  // Set up headers with authentication
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchForumSwapRequests();
    fetchUserExams();
    
    // Set up auto-refresh every 5 minutes
    const intervalId = setInterval(() => {
      fetchForumSwapRequests();
    }, 300000); // 5 minutes
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, []);

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    if (typeof date === 'string' && date.includes('/')) {
      return date;
    }
    
    if (typeof date === 'string' && date.includes('-')) {
      // Convert YYYY-MM-DD to DD/MM/YYYY
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`;
    }
    
    if (date instanceof Date) {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '.');
    }
    
    return date;
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
    return startTime; // Return as is if not numeric
  };
  
  // Parse time string to float
  const parseTimeToFloat = (timeStr) => {
    if (!timeStr) return null;
    if (typeof timeStr === 'number') return timeStr;
    
    // Handle formats like "13:30" or "13.30"
    const separator = timeStr.includes(':') ? ':' : '.';
    const [hours, minutes] = timeStr.split(separator).map(Number);
    
    if (!isNaN(hours) && !isNaN(minutes)) {
      return hours + (minutes / 60);
    }
    
    return null;
  };

  const formatTimeRangeFromRawString = (rawTime) => {
    if (!rawTime || !rawTime.includes('-')) return rawTime;

    const toHHMM = (time) => {
      const [h, m] = time.trim().split(':');
      return `${h}.${m}`;
    };

    const [start, end] = rawTime.split('-');
    return `${toHHMM(start)}–${toHHMM(end)}`;
  };


  // Fetch forum swap requests
  const fetchForumSwapRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${API_URL}/ta/swaps/forum-items`, getAuthHeaders());
      
      if (response.data.success) {
        // Process API response to match the required format
        const processedRequests = response.data.data.map(item => ({
          id: item.id,
          requesterName: item.submitter || item.requesterName || 'Anonymous TA',
          exam: {
            id: item.examId || item.id,
            examDate: formatDate(item.date || item.examDate),
            title: `${item.course} Exam`,
            startTime: parseTimeToFloat(item.startTime || item.time),
            endTime: parseTimeToFloat(item.endTime),
            course: { code: item.course },
            examRooms: item.classroom ? [item.classroom] : (item.examRooms || [])
          },
          requestDate: new Date(item.submitTime || item.requestDate || Date.now()),
          availableTimeStart: item.availableTimeStart || item.startDate || item.date,
          availableTimeEnd: item.availableTimeEnd || item.endDate || item.date,
          // Additional properties to match TASwapExamDetailsPopup format
          course: item.course,
          date: formatDate(item.date || item.examDate),
          time: formatTimeRangeFromRawString(item.time),
          classroom: item.classroom || (Array.isArray(item.examRooms) ? item.examRooms.join(', ') : '')
        }));
        
        console.log('Processed forum requests:', processedRequests);
        setForumSwapRequests(processedRequests);
      } else {
        console.warn('Failed to fetch forum items:', response.data.message);
        setForumSwapRequests([]);
      }
    } catch (err) {
      console.error('Error fetching forum items:', err);
      setError('Failed to fetch swap requests');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch user's exams for swap
  const fetchUserExams = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        console.warn('Token not found for fetching user exams');
        return;
      }
      
      const response = await axios.get(`${API_URL}/ta/swaps/my-exams`, getAuthHeaders());
      
      if (response.data.success) {
        setUserExams(response.data.data);
      } else {
        console.warn('Failed to fetch user exams:', response.data.message);
      }
    } catch (err) {
      console.error('Error fetching user exams:', err);
    }
  };

  // Handler for when the info button is clicked
  const handleInfoClick = (request) => {
    setSelectedRequest(request);
    setShowPopup(true);
  };

  // Handler for when the popup is closed
  const handleClosePopup = () => {
    setShowPopup(false);
    // Refresh data after popup is closed
    fetchForumSwapRequests();
  };

  // Parse date string in DD/MM/YYYY format
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    
    if (dateStr instanceof Date) {
      return dateStr;
    }
    
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/').map(Number);
      return new Date(year, month - 1, day);
    }
    
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
      return new Date(dateStr);
    }
    
    return null;
  };

  // Get my exams from schedule that are within the requester's time window
  const getCompatibleMyExams = (request) => {
    if (!request || !scheduleEvents || scheduleEvents.length === 0) return [];
    
    // Parse the time window 
    const startDate = parseDate(request.availableTimeStart);
    const endDate = parseDate(request.availableTimeEnd);
    
    if (!startDate || !endDate) return userExams || [];
    
    // Set end date to end of day
    endDate.setHours(23, 59, 59, 999);
    
    // If we have user exams from API, filter them by date
    if (userExams && userExams.length > 0) {
      return userExams.filter(exam => {
        const examDate = parseDate(exam.date || exam.examDate);
        if (!examDate) return false;
        return examDate >= startDate && examDate <= endDate;
      });
    }
    
    // Fallback to scheduled events
    return scheduleEvents.filter(event => {
      if (!event.isExam) return false;
      
      const eventDate = parseDate(event.examDate);
      if (!eventDate) return false;
      
      return eventDate >= startDate && eventDate <= endDate;
    });
  };

  return (
    <div className="ta-main-page-proctor-swap-forum-proctor-swap-forum">
      <h2>Proctoring Swap Forum</h2>
      
      {loading ? (
        <div className="ta-main-page-proctor-swap-forum-loading-message">
          Loading swap requests...
        </div>
      ) : error ? (
        <div className="ta-main-page-proctor-swap-forum-error-message">
          {error}
        </div>
      ) : (
        <div className="ta-main-page-proctor-swap-forum-swap-requests">
          {forumSwapRequests && forumSwapRequests.length > 0 ? (
            forumSwapRequests.map(request => (
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
                    <div className="ta-main-page-proctor-swap-forum-exam-date">{request.exam.examDate}</div>
                    <div className="ta-main-page-proctor-swap-forum-exam-time">
                      {request.time}
                    </div>
                    <div className="ta-main-page-proctor-swap-forum-swap-window">
                      Available: {formatDate(request.availableTimeStart)} to {formatDate(request.availableTimeEnd)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="ta-main-page-proctor-swap-forum-no-requests-message">
              No swap requests available at this time.
            </div>
          )}
        </div>
      )}
      
      {/* Use TASwapExamDetailsPopup for exam details */}
      {showPopup && selectedRequest && (
        <TASwapExamDetailsPopup 
          isOpen={showPopup}
          onClose={handleClosePopup}
          examDetails={selectedRequest}
          userExams={getCompatibleMyExams(selectedRequest)}
        />
      )}
    </div>
  );
};

export default ProctorSwapForum;