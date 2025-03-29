import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './TALeaveOfAbsence.css';

const NavBar = () => {
  return (
    <div className="ta-leave-of-absence-top-navbar">
      <div className="ta-leave-of-absence-nav-links">
        <Link to="/ta/tamainpage">Home</Link>
        <Link to="/ta/taworkloadpage">Workload</Link>
        <Link to="/ta/taproctoringpage">Proctoring</Link>
        <Link to="/ta/taleaveofabsence"><strong>Leave of Absence</strong></Link>
        <Link to="#">Swap</Link>
      </div>
      <div className="ta-leave-of-absence-nav-icons">
        <div className="ta-leave-of-absence-notification-icon">
          <img src="/notification.png" alt="Notifications" />
        </div>
        <div className="ta-leave-of-absence-profile-icon">
          <img src="/profile.png" alt="Profile" />
        </div>
      </div>
    </div>
  );
};

const TALeaveOfAbsence = () => {
  // This state simulates the different request statuses
  // 0: No request, 1: Pending request, 2: Accepted request
  const [requestStatus, setRequestStatus] = useState(0);
  
  // Form state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // For demonstration purposes - toggle between different views
  const toggleRequestStatus = () => {
    setRequestStatus((prevStatus) => (prevStatus + 1) % 3);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real implementation, you would send this to your database
    console.log({
      startDate,
      endDate,
      reason,
      selectedFile
    });
    
    // Update status to "pending" after submission
    setRequestStatus(1);
  };

  // Handle form update
  const handleUpdate = (e) => {
    e.preventDefault();
    // In a real implementation, you would update this in your database
    console.log('Updated request:', {
      startDate,
      endDate,
      reason,
      selectedFile
    });
    
    // Keep status as "pending" after update
    setRequestStatus(1);
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // File drop handler
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };


  
  // Render based on request status
  const renderLeaveOfAbsenceContent = () => {
    switch (requestStatus) {
      case 0: // No request
        return (
          <div className="ta-leave-of-absence-leave-container">
            <div className="ta-leave-of-absence-leave-status not-submitted">
              <h1 className="ta-leave-of-absence-leave-title">You have not submitted a request for a leave of absence.</h1>
            </div>
            
            <form onSubmit={handleSubmit} className="ta-leave-of-absence-leave-form">
              <div className="ta-leave-of-absence-form-row">
                <div className="ta-leave-of-absence-date-selector">
                  <label>Select date</label>
                  <div className="ta-leave-of-absence-date-inputs">
                    <div className="ta-leave-of-absence-date-field">
                      <label>Start Date</label>
                      <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        placeholder="mm/dd/yyyy"
                      />
                    </div>
                    <div className="ta-leave-of-absence-date-field">
                      <label>End ate</label>
                      <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                        placeholder="mm/dd/yyyy"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="ta-leave-of-absence-file-upload"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <div className="ta-leave-of-absence-file-upload-content">
                    <div className="ta-leave-of-absence-upload-icon">⬆️</div>
                    <p>Drag and Drop here</p>
                    <p>or</p>
                    <label className="ta-leave-of-absence-select-file-btn">
                      Select file
                      <input 
                        type="file" 
                        onChange={handleFileChange} 
                        style={{ display: 'none' }} 
                      />
                    </label>
                    {selectedFile && (
                      <p className="ta-leave-of-absence-selected-file">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="ta-leave-of-absence-reason-container">
                <label>Enter Your Reason</label>
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason"
                />
              </div>

              <div className="ta-leave-of-absence-form-submit">
                <button type="submit" className="ta-leave-of-absence-submit-btn">
                  Submit Leave of Absence Request
                </button>
              </div>
            </form>
          </div>
        );
      
      case 1: // Pending request
        return (
          <div className="ta-leave-of-absence-leave-container">
            <div className="ta-leave-of-absence-leave-status pending">
              <h1 className="ta-leave-of-absence-leave-title">You have a pending request. Do you want to modify it?</h1>
            </div>
            
            <form onSubmit={handleUpdate} className="ta-leave-of-absence-leave-form">
              <div className="ta-leave-of-absence-form-row">
                <div className="ta-leave-of-absence-date-selector">
                  <label>Select date</label>
                  <div className="ta-leave-of-absence-date-inputs">
                    <div className="ta-leave-of-absence-date-field">
                      <label>Start Date</label>
                      <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        placeholder="mm/dd/yyyy"
                      />
                    </div>
                    <div className="ta-leave-of-absence-date-field">
                      <label>End Date</label>
                      <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                        placeholder="mm/dd/yyyy"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="ta-leave-of-absence-file-upload"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <div className="ta-leave-of-absence-file-upload-content">
                    <div className="ta-leave-of-absence-upload-icon">⬆️</div>
                    <p>Drag and Drop here</p>
                    <p>or</p>
                    <label className="ta-leave-of-absence-select-file-btn">
                      Select file
                      <input 
                        type="file" 
                        onChange={handleFileChange} 
                        style={{ display: 'none' }} 
                      />
                    </label>
                    {selectedFile && (
                      <p className="ta-leave-of-absence-selected-file">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="ta-leave-of-absence-reason-container">
                <label>Enter Your Reason</label>
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason"
                />
              </div>

              <div className="ta-leave-of-absence-form-submit">
                <button type="submit" className="ta-leave-of-absence-submit-btn">
                  Update Leave of Absence Request
                </button>
              </div>
            </form>
          </div>
        );
      
      case 2: // Accepted request
        return (
          <div className="ta-leave-of-absence-leave-container">
            <div className="ta-leave-of-absence-leave-status accepted">
              <h1 className="ta-leave-of-absence-leave-title">Your leave of absence request has been accepted.</h1>
            </div>
            
            <div className="ta-leave-of-absence-leave-details">
              <p className="ta-leave-of-absence-leave-date">Start time: 01/01/2025</p>
              <p className="ta-leave-of-absence-leave-date">End time: 01/04/2025</p>
              
              <p className="ta-leave-of-absence-remaining-days">Remaining: 14 days</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="ta-leave-of-absence-main-page">
      <NavBar />
      <main className="ta-leave-of-absence-main-content">
        {renderLeaveOfAbsenceContent()}
        
        {/* Debug button to toggle between states - you can remove this in production */}
        <button 
          onClick={toggleRequestStatus} 
          className="ta-leave-of-absence-debug-toggle"
          title="For testing: Click to cycle through different request states"
        >
          Toggle Status (Current: {
            requestStatus === 0 ? "No Request" : 
            requestStatus === 1 ? "Pending" : "Accepted"
          })
        </button>
      </main>
    </div>
  );
};

export default TALeaveOfAbsence;