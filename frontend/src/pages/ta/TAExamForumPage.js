import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TAExamForumPage.css';
import TAPersonalSwapRequest from './TAPersonalSwapRequest';
import TASwapExamDetailsPopup from './TASwapExamDetailsPopup';
import TASubmitForumRequest from './TASubmitForumRequest';
import TASubmittedSwapRequests from './TASubmittedSwapRequests';
import TANavBar from './TANavBar';

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, type }) => {
  if (!isOpen) return null;

  return (
    <div className="ta-exam-forum-page-dialog-overlay">
      <div className="ta-exam-forum-page-dialog-container">
        <div className="ta-exam-forum-page-dialog-icon">
          <span>ⓘ</span>
        </div>
        <div className="ta-exam-forum-page-dialog-content">
          <div className="ta-exam-forum-page-dialog-title">Submit for {type}</div>
          <div className="ta-exam-forum-page-dialog-message">Are you sure you want to continue?</div>
          <div className="ta-exam-forum-page-dialog-actions">
            <button className="ta-exam-forum-page-dialog-button confirm" onClick={onConfirm}>Yes</button>
          </div>
        </div>
        <button className="ta-exam-forum-page-dialog-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

const TAExamForumPage = () => {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmationType, setConfirmationType] = useState('');
  const [selectedExam, setSelectedExam] = useState(null);
  const [swapRequestModalOpen, setSwapRequestModalOpen] = useState(false);
  const [examDetailsModalOpen, setExamDetailsModalOpen] = useState(false);
  const [selectedForumExam, setSelectedForumExam] = useState(null);
  const [submitForumModalOpen, setSubmitForumModalOpen] = useState(false);
  const [submittedRequestsModalOpen, setSubmittedRequestsModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  const API_URL = 'http://localhost:5001/api';

  // States for loading and errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Current user's exams for swap
  const [currentUserExams, setCurrentUserExams] = useState([]);
  
  // Swap requests waiting for approval
  const [waitingSwapRequests, setWaitingSwapRequests] = useState([]);
  
  // Swap forum items
  const [swapForumItems, setSwapForumItems] = useState([]);

  // Fetch data on component mount
  useEffect(() => {
    // Get user ID from token first - this is most reliable
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      const userId = getUserIdFromToken(token);
      if (userId) {
        console.log('User ID from token:', userId);
        setCurrentUserId(userId);
      }
    }

    fetchUserExams();
    fetchWaitingSwapRequests();
    fetchCurrentUserId().then(() => {
      fetchForumItems();
    });
  }, []);

  // Extract user ID from JWT token
  const getUserIdFromToken = (token) => {
    try {
      // JWT tokens consist of three parts separated by dots
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      // The second part contains the payload
      const payload = JSON.parse(atob(parts[1]));
      
      // Get user ID - adjust property name based on your token structure
      // Common fields are 'id', 'userId', 'sub', etc.
      return payload.id || payload.userId || payload.sub || payload.teachingAssistant?.id;
    } catch (err) {
      console.error('Error parsing token:', err);
      return null;
    }
  };

  // Identify the current user's ID
  const fetchCurrentUserId = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return null;
      
      // Try to get user ID from token first
      const tokenUserId = getUserIdFromToken(token);
      if (tokenUserId) {
        setCurrentUserId(tokenUserId);
        return tokenUserId;
      }
      
      // If not available in token, try to get from submitted requests
      const response = await axios.get(`${API_URL}/ta/swaps/submitted`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success && response.data.data.length > 0) {
        // Get the requesterId from the first submitted request
        const fetchedUserId = response.data.data[0].requesterId;
        console.log('User ID from submitted requests:', fetchedUserId);
        setCurrentUserId(fetchedUserId);
        return fetchedUserId;
      }
    } catch (err) {
      console.error('Error identifying current user:', err);
    }
    return null;
  };

  // Fetch user's exams
  const fetchUserExams = async () => {
    try {
      setLoading(true);
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
        setCurrentUserExams(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch exams');
      }
    } catch (err) {
      setError('Error fetching your exams. Please try again.');
      console.error('Error fetching exams:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch waiting swap requests
  const fetchWaitingSwapRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/ta/swaps/mine`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setWaitingSwapRequests(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch swap requests');
      }
    } catch (err) {
      setError('Error fetching swap requests. Please try again.');
      console.error('Error fetching swap requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch forum items - improved implementation with better filtering
  const fetchForumItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      // Fetch all forum items
      const response = await axios.get(`${API_URL}/ta/swaps/forum-items`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Log all forum items for debugging
        console.log('All forum items:', response.data.data);
        
        // Get all submitted requests to identify user's own forum posts
        const submittedResponse = await axios.get(`${API_URL}/ta/swaps/submitted`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        let userId = currentUserId;
        
        // If we don't have currentUserId yet, try to get it from submitted requests
        if (!userId && submittedResponse.data.success && submittedResponse.data.data.length > 0) {
          userId = submittedResponse.data.data[0].requesterId;
          setCurrentUserId(userId);
        }
        
        // Double-check by comparing forum items with submitted forum requests
        if (submittedResponse.data.success) {
          const userForumRequestIds = new Set();
          
          // Collect IDs of user's forum requests
          submittedResponse.data.data.forEach(request => {
            if (request.isForumPost) {
              userForumRequestIds.add(request.id);
            }
          });
          
          console.log('User forum request IDs:', [...userForumRequestIds]);
          
          // Filter out forum items that match user's submitted forum requests
          const filteredItems = response.data.data.filter(item => {
            return !userForumRequestIds.has(item.id) && item.requesterId !== userId;
          });
          
          console.log('Filtered forum items:', filteredItems);
          setSwapForumItems(filteredItems);
        } else if (userId) {
          // Fall back to filtering by requesterId if we have userId
          console.log('Filtering with user ID:', userId);
          const filteredItems = response.data.data.filter(item => item.requesterId !== userId);
          setSwapForumItems(filteredItems);
        } else {
          // If all else fails, show all forum items
          console.log('No user identification possible, showing all forum items');
          setSwapForumItems(response.data.data);
        }
      } else {
        setError(response.data.message || 'Failed to fetch forum items');
      }
    } catch (err) {
      setError('Error fetching forum items. Please try again.');
      console.error('Error fetching forum items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data after submitting new requests or responding to requests
  const refreshData = () => {
    fetchUserExams();
    fetchWaitingSwapRequests();
    fetchForumItems();
  };

  // Confirm action
  const confirmAction = () => {
    if (selectedExam) {
      console.log(`${confirmationType} confirmed for exam ${selectedExam.course}`);
      
      // Filter out the selected exam from waiting list
      if (confirmationType === 'Accept' || confirmationType === 'Reject') {
        setWaitingSwapRequests(prev => 
          prev.filter(request => request.id !== selectedExam.id)
        );
      }
    }
    
    // Close dialog and reset selection
    setConfirmDialogOpen(false);
    setSelectedExam(null);
  };

  // Close confirmation dialog
  const closeConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setSelectedExam(null);
  };

  // Open swap request modal
  const openSwapRequestModal = () => {
    setSwapRequestModalOpen(true);
  };

  // Close swap request modal
  const closeSwapRequestModal = () => {
    setSwapRequestModalOpen(false);
    // Refresh data after modal closes
    refreshData();
  };

  // Open exam details modal - now used for both forum and waiting items
  const openExamDetailsModal = (exam) => {
    setSelectedForumExam(exam);
    setExamDetailsModalOpen(true);
  };

  // Close exam details modal
  const closeExamDetailsModal = () => {
    setExamDetailsModalOpen(false);
    setSelectedForumExam(null);
    // Refresh data after modal closes
    refreshData();
  };

  // Open submit forum modal
  const openSubmitForumModal = () => {
    setSubmitForumModalOpen(true);
  };

  // Close submit forum modal
  const closeSubmitForumModal = () => {
    setSubmitForumModalOpen(false);
    // Refresh data after modal closes
    refreshData();
  };

  // Open submitted requests modal
  const openSubmittedRequestsModal = () => {
    setSubmittedRequestsModalOpen(true);
  };

  // Close submitted requests modal
  const closeSubmittedRequestsModal = () => {
    setSubmittedRequestsModalOpen(false);
    // Refresh data after modal closes
    refreshData();
  };

  // Render waiting swap requests
  const renderWaitingSwapRequests = () => {
    if (loading) {
      return <div className="ta-exam-forum-page-loading">Loading swap requests...</div>;
    }
    
    if (error) {
      return <div className="ta-exam-forum-page-error">{error}</div>;
    }
    
    if (waitingSwapRequests.length === 0) {
      return <div className="ta-exam-forum-page-empty">No pending swap requests</div>;
    }
    
    return waitingSwapRequests.map((request) => (
      <div 
        key={request.id} 
        className="ta-exam-forum-page-forum-item"
        onClick={() => openExamDetailsModal(request)}
      >
        <div className="ta-exam-forum-page-forum-details">
          <div className="ta-exam-forum-page-course-info">
            {request.course} Midterm Exam
          </div>
          <div className="ta-exam-forum-page-swap-meta">
            <div>{request.date}      {request.time}</div>
            <div>Clasrooms: {request.classroom || request.classrooms}</div>
          </div>
        </div>
        <div className="ta-exam-forum-page-submitter-info">
          <div className="ta-exam-forum-page-submitter-avatar"></div>
          <div className="ta-exam-forum-page-submitter-details">
            <div>{request.requestedBy}</div>
            <div>Submit time: {request.submitTime}</div>
          </div>
        </div>
      </div>
    ));
  };

  // Render swap forum items
  const renderSwapForumItems = () => {
    if (loading) {
      return <div className="ta-exam-forum-page-loading">Loading forum items...</div>;
    }
    
    if (error) {
      return <div className="ta-exam-forum-page-error">{error}</div>;
    }
    
    if (swapForumItems.length === 0) {
      return <div className="ta-exam-forum-page-empty">No items in the forum</div>;
    }
    
    return swapForumItems.map((item) => (
      <div 
        key={item.id} 
        className="ta-exam-forum-page-forum-item"
        onClick={() => openExamDetailsModal(item)}
      >
        <div className="ta-exam-forum-page-forum-details">
          <div className="ta-exam-forum-page-course-info">
            {item.course} Midterm Exam
          </div>
          <div className="ta-exam-forum-page-swap-meta">
            <div>{item.date}      {item.time}</div>
            <div>Classroom: {item.classroom}</div>
          </div>
        </div>
        <div className="ta-exam-forum-page-submitter-info">
          <div className="ta-exam-forum-page-submitter-avatar"></div>
          <div className="ta-exam-forum-page-submitter-details">
            <div>{item.submitter}</div>
            <div>Submit time: {item.submitTime}</div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="ta-exam-forum-page-main-page">
      <TANavBar />
      
      <div className="ta-exam-forum-page-main-content">
        {/* Left sidebar for buttons */}
        <div className="ta-exam-forum-page-sidebar-actions">
          {/* Personal Swap Request Button */}
          <div className="ta-exam-forum-page-button-container">
            <div className="ta-exam-forum-page-send-request-container">
              <div className="ta-exam-forum-page-send-button-label">Send Personal Swap Request</div>
              <div className="ta-exam-forum-page-send-icon" onClick={openSwapRequestModal}></div>
            </div>
          </div>
          
          {/* Submit Forum Request Button */}
          <div className="ta-exam-forum-page-button-container">
            <div className="ta-exam-forum-page-submit-forum-container">
              <div className="ta-exam-forum-page-submit-button-label">Submit Swap Request on Forum</div>
              <div className="ta-exam-forum-page-submit-icon" onClick={openSubmitForumModal}>
                <span>+</span>
              </div>
            </div>
          </div>

          {/* Submitted Swap Requests Button */}
          <div className="ta-exam-forum-page-button-container">
            <div className="ta-exam-forum-page-send-request-container">
              <div className="ta-exam-forum-page-send-button-label">View My Submitted Requests</div>
              <div 
                className="ta-exam-forum-page-send-icon-v2" 
                onClick={openSubmittedRequestsModal}
                style={{ backgroundColor: '#4CAF50' }}
              >
                <span style={{ color: 'white', fontSize: '48px' }}>✓</span>
              </div>
            </div>
          </div>
        </div>

        <div className="ta-exam-forum-page-content-wrapper">
          <div className="ta-exam-forum-page-forum-section">
            <div className="ta-exam-forum-page-forum-container">
              <div className="ta-exam-forum-page-forum-header">
                <div className="ta-exam-forum-page-forum-icon"></div>
                <h2 className="ta-exam-forum-page-forum-title">Proctoring Swap Forum</h2>
              </div>
              
              <div className="ta-exam-forum-page-forum-list">
                {renderSwapForumItems()}
              </div>
            </div>
          </div>
          
          <div className="ta-exam-forum-page-waiting-container">
            <h2 className="ta-exam-forum-page-section-title">Waiting Proctoring Swap Requests</h2>
            
            <div className="ta-exam-forum-page-waiting-list">
              {renderWaitingSwapRequests()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <ConfirmationDialog 
        isOpen={confirmDialogOpen}
        onClose={closeConfirmDialog}
        onConfirm={confirmAction}
        type={confirmationType}
      />

      {/* Personal Swap Request Modal */}
      <TAPersonalSwapRequest 
        isOpen={swapRequestModalOpen}
        onClose={closeSwapRequestModal}
        currentUserExams={currentUserExams}
      />

      {/* Exam Details Modal - now used for both forum and waiting items */}
      <TASwapExamDetailsPopup 
        isOpen={examDetailsModalOpen}
        onClose={closeExamDetailsModal}
        examDetails={selectedForumExam}
        userExams={currentUserExams}
      />

      {/* Submit Forum Request Modal */}
      <TASubmitForumRequest 
        isOpen={submitForumModalOpen}
        onClose={closeSubmitForumModal}
        userExams={currentUserExams}
      />

      {/* Submitted Swap Requests Modal */}
      <TASubmittedSwapRequests
        isOpen={submittedRequestsModalOpen}
        onClose={closeSubmittedRequestsModal}
      />
    </div>
  );
};

export default TAExamForumPage;