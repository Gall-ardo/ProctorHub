import React, { useState } from 'react';
import './TAExamForumPage.css';
import TAPersonalSwapRequest from './TAPersonalSwapRequest';
import TASwapExamDetailsPopup from './TASwapExamDetailsPopup';
import TASubmitForumRequest from './TASubmitForumRequest';
import TANavBar from './TANavBar'; // Import TANavBar from existing component

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
    { id: 1, course: 'CS201', date: '25.03.2025', time: '13.00-16.00', classrooms: 'EE101 - EE102' },
    { id: 2, course: 'MATH102', date: '22.03.2025', time: '18.00-21.00', classrooms: 'B101 - B102 - B103 - B104' },
    { id: 3, course: 'CS101', date: '27.03.2025', time: '15.00-18.00', classrooms: 'EA201 - EA202' }
  ]);
  
  // Swap requests waiting for approval - modified to match screenshot
  const [waitingSwapRequests, setWaitingSwapRequests] = useState([
    {
      id: 1,
      course: 'CS201',
      date: '22.03.2025',
      time: '13.00-16.00',
      classrooms: 'EE101 - EE102',
      requestedBy: 'Sude Ergün',
      submitTime: '07.03.2025'
    },
    {
      id: 2,
      course: 'MATH102',
      date: '25.03.2025',
      time: '18.00-21.00',
      classrooms: 'B101 - B102 - B103 - B104',
      requestedBy: 'Halil Arda Özongün',
      submitTime: '11.03.2025'
    },
    {
      id: 3,
      course: 'CS101',
      date: '27.03.2025',
      time: '15.00-18.00',
      classrooms: 'EA201- EA202',
      requestedBy: 'Sude Ergün',
      submitTime: '07.03.2025'
    },
    {
      id: 3,
      course: 'CS101',
      date: '27.03.2025',
      time: '15.00-18.00',
      classrooms: 'EA201- EA202',
      requestedBy: 'Sude Ergün',
      submitTime: '07.03.2025'
    },
    {
      id: 3,
      course: 'CS101',
      date: '27.03.2025',
      time: '15.00-18.00',
      classrooms: 'EA201- EA202',
      requestedBy: 'Sude Ergün',
      submitTime: '07.03.2025'
    }
  ]);
  
  // Swap forum items - modified to match screenshot
  const [swapForumItems, setSwapForumItems] = useState([
    {
      id: 1,
      course: 'CS202',
      date: '16.03.2025',
      time: '13.00-16.00',
      classroom: 'BZ101-BZ102',
      submitter: 'Sude Ergün',
      submitTime: '07.03.2025',
      requestedBy: 'sude.ergun@bilkent.edu.tr'
    },
    {
      id: 2,
      course: 'GE301',
      date: '19.03.2025',
      time: '10.00-13.00',
      classroom: 'EA101-EA102',
      submitter: 'Halil Arda Özongün',
      submitTime: '11.03.2025',
      requestedBy: 'halil.ozongun@bilkent.edu.tr'
    },
    {
      id: 3,
      course: 'GE301',
      date: '19.03.2025',
      time: '10.00-13.00',
      classroom: 'EA101-EA102',
      submitter: 'Halil Arda Özongün',
      submitTime: '11.03.2025',
      requestedBy: 'halil.ozongun@bilkent.edu.tr'
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
    }
  ]);

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

  // Open exam details modal - now used for both forum and waiting items
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

  // Render waiting swap requests - modified to be clickable and match forum items
  const renderWaitingSwapRequests = () => {
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
            <div>Clasrooms: {request.classrooms}</div>
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
        {/* Left sidebar for buttons, similar to TAWorkloadPage */}
        <div className="ta-exam-forum-page-sidebar-actions">
          {/* Personal Swap Request Button */}
          <div className="ta-exam-forum-page-button-container">
            <div className="ta-exam-forum-page-send-request-container">
              <div className="ta-exam-forum-page-send-button-label">Send Personal Swap Request</div>
              <div className="ta-exam-forum-page-send-icon" onClick={openSwapRequestModal}></div>
            </div>
          </div>
          
          {/* Removed middle container to bring buttons closer */}
          
          {/* Submit Forum Request Button */}
          <div className="ta-exam-forum-page-submit-container">
            <div className="ta-exam-forum-page-submit-forum-container">
              <div className="ta-exam-forum-page-submit-button-label">Submit Swap Request on Forum</div>
              <div className="ta-exam-forum-page-submit-icon" onClick={openSubmitForumModal}>
                <span>+</span>
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
              
              {/* Removed "Publish on Swap Forum" button */}
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
    </div>
  );
};

export default TAExamForumPage;