import React, { useState } from 'react';
import './TAExamForumPage.css';
import TAPersonalSwapRequest from './TAPersonalSwapRequest';
import TASwapExamDetailsPopup from './TASwapExamDetailsPopup';
import TASubmitForumRequest from './TASubmitForumRequest';
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
  
  // Current user's exams for swap
  const [currentUserExams, setCurrentUserExams] = useState([
    { id: 1, course: 'CS201', date: '25.03.2025', time: '13.00-16.00' },
    { id: 2, course: 'MATH102', date: '22.03.2025', time: '18.00-21.00' },
    { id: 3, course: 'CS101', date: '27.03.2025', time: '15.00-18.00' }
  ]);
  
  // Swap requests waiting for approval
  const [waitingSwapRequests, setWaitingSwapRequests] = useState([
    {
      id: 1,
      course: 'CS201',
      date: '17.03.2025',
      time: '13.00-16.00',
      classrooms: 'EE201 - EE202',
      requestedBy: 'Sude Ergün',
    },
    {
      id: 2,
      course: 'CS101',
      date: '20.03.2025',
      time: '10.00-13.00',
      classrooms: 'EA101 - EA102',
      requestedBy: 'Halil Arda Özongün'


    },
    {
      id: 3,
      course: 'CS202',
      date: '16.03.2025',
      time: '13.00-16.00',
      classrooms: 'BZ101 - BZ102',
      requestedBy: 'Sude Ergün'
    },
    {
      id: 4,
      course: 'GE301',
      date: '19.03.2025',
      time: '10.00-13.00',
      classrooms: 'EA101 - EA102',
      requestedBy: 'Halil Arda Özongün'
    },
    {
      id: 5,
      course: 'CS202',
      date: '16.03.2025',
      time: '13.00-16.00',
      classrooms: 'BZ101 - BZ102',
      requestedBy: 'Sude Ergün'
    },
    {
      id: 6,
      course: 'GE301',
      date: '19.03.2025',
      time: '10.00-13.00',
      classrooms: 'EA101 - EA102',
      requestedBy: 'Halil Arda Özongün'
    }
  ]);
  
  // Swap forum items
  const [swapForumItems, setSwapForumItems] = useState([
    {
      id: 3,
      course: 'CS202',
      date: '16.03.2025',
      time: '13.00-16.00',
      classroom: 'BZ101-BZ102',
      submitter: 'Sude Ergün',
      submitTime: '07.03.2025',
      requestedBy: 'sude.ergun@bilkent.edu.tr'
    },
    {
      id: 4,
      course: 'GE301',
      date: '19.03.2025',
      time: '10.00-13.00',
      classroom: 'EA101-EA102',
      submitter: 'Halil Arda Özongün',
      submitTime: '11.03.2025',
      requestedBy: 'halil.ozongun@bilkent.edu.tr'
    },
    {
      id: 121,
      course: 'GE301',
      date: '19.03.2025',
      time: '10.00-13.00',
      classroom: 'EA101-EA102',
      submitter: 'Halil Arda Özongün',
      submitTime: '11.03.2025',
      requestedBy: 'halil.ozongun@bilkent.edu.tr'
    },
    {
      id: 122,
      course: 'GE301',
      date: '19.03.2025',
      time: '10.00-13.00',
      classroom: 'EA101-EA102',
      submitter: 'Halil Arda Özongün',
      submitTime: '11.03.2025',
      requestedBy: 'halil.ozongun@bilkent.edu.tr'
    }
  ]);

  // Handle accept action
  const handleAccept = (exam) => {
    setSelectedExam(exam);
    setConfirmationType('Accept');
    setConfirmDialogOpen(true);
  };

  // Handle reject action
  const handleReject = (exam) => {
    setSelectedExam(exam);
    setConfirmationType('Reject');
    setConfirmDialogOpen(true);
  };

  // Confirm action
  const confirmAction = () => {
    if (selectedExam) {
      // In a real app, you would perform API requests here
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
  };

  // Open exam details modal
  const openExamDetailsModal = (exam) => {
    setSelectedForumExam(exam);
    setExamDetailsModalOpen(true);
  };

  // Close exam details modal
  const closeExamDetailsModal = () => {
    setExamDetailsModalOpen(false);
    setSelectedForumExam(null);
  };

  // Open submit forum modal
  const openSubmitForumModal = () => {
    setSubmitForumModalOpen(true);
  };

  // Close submit forum modal
  const closeSubmitForumModal = () => {
    setSubmitForumModalOpen(false);
  };

  // Render waiting swap requests
  const renderWaitingSwapRequests = () => {
    return waitingSwapRequests.map((request) => (
      <div key={request.id} className="ta-exam-forum-page-swap-item">
        <div className="ta-exam-forum-page-swap-details">
          <div className="ta-exam-forum-page-course-info">
            {request.course} Midterm Exam
          </div>
          <div className="ta-exam-forum-page-swap-meta">
            <div>{request.date}      {request.time}</div>
            <div>Clasrooms: {request.classrooms}</div>
            <div>Requested by: {request.requestedBy}</div>
          </div>
        </div>
        <div className="ta-exam-forum-page-swap-actions">
          <button 
            className="ta-exam-forum-page-action-button accept"
            onClick={() => handleAccept(request)}
          >
            ✓
          </button>
          <button 
            className="ta-exam-forum-page-action-button reject"
            onClick={() => handleReject(request)}
          >
            ✕
          </button>
        </div>
      </div>
    ));
  };

  // Render swap forum items
  const renderSwapForumItems = () => {
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
        <div className="ta-exam-forum-page-send-request-container">
          <div className="ta-exam-forum-page-send-icon"></div>
          <button 
            className="ta-exam-forum-page-send-button"
            onClick={openSwapRequestModal}
          >
            Send Personal Swap Request
          </button>
        </div>
        
        <div className="ta-exam-forum-page-content-wrapper">
          <div className="ta-exam-forum-page-sidebar">
            <div className="ta-exam-forum-page-forum-container">
              <div className="ta-exam-forum-page-forum-header">
                <div className="ta-exam-forum-page-forum-icon"></div>
                <h2 className="ta-exam-forum-page-forum-title">Proctoring Swap Forum</h2>
              </div>
              
              <div className="ta-exam-forum-page-forum-list">
                {renderSwapForumItems()}
              </div>
              
              <div className="ta-exam-forum-page-add-button-container">
                <button 
                  className="ta-exam-forum-page-add-button"
                  onClick={openSubmitForumModal}
                >
                  Publish on Swap Forum
                </button>
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

      {/* Exam Details Modal */}
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
    </div>
  );
};

export default TAExamForumPage;