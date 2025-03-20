import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminClassroomManagement.css';

const AdminClassroomManagement = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('add'); // 'add', 'delete', 'edit'
  
  // Form states
  const [buildingId, setBuildingId] = useState('');
  const [classroomId, setClassroomId] = useState('');
  const [capacity, setCapacity] = useState('');
  const [examCapacity, setExamCapacity] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setSelectedFile(event.dataTransfer.files[0]);
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    
    // Handle different form submissions based on active view
    switch(activeView) {
      case 'add':
        console.log('Adding classroom:', { buildingId, classroomId, capacity, examCapacity });
        // Add API call here
        break;
      case 'delete':
        console.log('Finding classroom to delete:', { buildingId, classroomId });
        // Delete API call here
        break;
      case 'edit':
        console.log('Finding classroom to edit:', { buildingId, classroomId });
        // Edit API call here
        break;
      default:
        break;
    }
  };

  const handleFileUpload = () => {
    if (selectedFile) {
      console.log('Uploading file:', selectedFile);
      // File upload API call here
    } else {
      alert('Please select a file first');
    }
  };

  return (
    <div className="classroom-management">
      {/* Top Navigation Bar */}
      <div className="top-navbar">
        <div className="logo">
          <img src="/logo.png" alt="Logo" />
        </div>
        <div className="nav-links">
          <a href="#">Logs and Reports</a>
          <a href="#">User</a>
          <a href="#">Student</a>
          <a href="#">Course</a>
          <a href="#" className="active">Classrooms</a>
          <a href="#">Offering</a>
          <a href="#">Semester</a>
        </div>
        <div className="nav-icons">
          <div className="notification-icon">
            <img src="/notification.png" alt="Notifications" />
          </div>
          <div className="profile-icon">
            <img src="/profile.png" alt="Profile" />
          </div>
        </div>
      </div>

      <div className="main-content">
        {/* Left Panel */}
        <div className="left-panel">
          <div className="action-buttons">
            <div 
              className={`action-button ${activeView === 'add' ? 'active' : ''}`} 
              onClick={() => setActiveView('add')}
            >
              <div className={`circle-icon ${activeView === 'add' ? 'active' : ''}`}>
                <span>+</span>
              </div>
              <span className={`button-label ${activeView === 'add' ? 'active' : ''}`}>Add Classroom</span>
            </div>
            
            <div 
              className={`action-button ${activeView === 'delete' ? 'active' : ''}`} 
              onClick={() => setActiveView('delete')}
            >
              <div className={`circle-icon ${activeView === 'delete' ? 'active' : ''}`}>
                <span>-</span>
              </div>
              <span className={`button-label ${activeView === 'delete' ? 'active' : ''}`}>Delete Classroom</span>
            </div>
            
            <div 
              className={`action-button ${activeView === 'edit' ? 'active' : ''}`} 
              onClick={() => setActiveView('edit')}
            >
              <div className={`circle-icon ${activeView === 'edit' ? 'active' : ''}`}>
                <span>✎</span>
              </div>
              <span className={`button-label ${activeView === 'edit' ? 'active' : ''}`}>Edit Classroom</span>
            </div>
          </div>

          <div 
            className="file-upload-area"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="upload-icon">
              <img src="/upload-icon.png" alt="Upload" />
            </div>
            <div className="upload-text">Drag and Drop here</div>
            <div className="upload-divider">or</div>
            <label className="select-file-btn">
              Select file
              <input 
                type="file" 
                hidden 
                onChange={handleFileSelect}
              />
            </label>
            {selectedFile && <div className="selected-file">{selectedFile.name}</div>}
            <button 
              className="upload-file-btn"
              onClick={handleFileUpload}
            >
              Upload File
            </button>
          </div>
        </div>

        {/* Right Panel - Form Section */}
        <div className="right-panel">
          <div className="form-container">
            {activeView === 'add' && (
              <>
                <h2 className="form-title">Enter Classroom Information</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label>Building</label>
                    <input 
                      type="text" 
                      placeholder="Enter building ID" 
                      value={buildingId}
                      onChange={(e) => setBuildingId(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Classroom ID</label>
                    <input 
                      type="text" 
                      placeholder="Enter classroom ID" 
                      value={classroomId}
                      onChange={(e) => setClassroomId(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Capacity</label>
                    <input 
                      type="number" 
                      placeholder="Enter capacity" 
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Exam Capacity</label>
                    <input 
                      type="number" 
                      placeholder="Enter exam capacity" 
                      value={examCapacity}
                      onChange={(e) => setExamCapacity(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="form-submit-btn">Add Classroom</button>
                </form>
              </>
            )}

            {activeView === 'delete' && (
              <>
                <h2 className="form-title">Enter building ID and classroom ID to Find Classroom</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label>Building</label>
                    <input 
                      type="text" 
                      placeholder="Enter building ID" 
                      value={buildingId}
                      onChange={(e) => setBuildingId(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Classroom ID</label>
                    <input 
                      type="text" 
                      placeholder="Enter classroom ID" 
                      value={classroomId}
                      onChange={(e) => setClassroomId(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="form-submit-btn">Find Classroom to Delete</button>
                </form>
              </>
            )}

            {activeView === 'edit' && (
              <>
                <h2 className="form-title">Enter building ID and classroom ID to Find Classroom</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label>Building</label>
                    <input 
                      type="text" 
                      placeholder="Enter building ID" 
                      value={buildingId}
                      onChange={(e) => setBuildingId(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Classroom ID</label>
                    <input 
                      type="text" 
                      placeholder="Enter classroom ID" 
                      value={classroomId}
                      onChange={(e) => setClassroomId(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="form-submit-btn">Find Classroom to Edit</button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminClassroomManagement;