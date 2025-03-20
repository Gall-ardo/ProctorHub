import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminCourseManagement.css';

const AdminCourseManagement = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('add'); // 'add', 'delete', 'edit'
  
  // Form states
  const [department, setDepartment] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [isGradCourse, setIsGradCourse] = useState(false);
  const [teachingAssistantNumber, setTeachingAssistantNumber] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);

  // Department options
  const departmentOptions = [
    { label: 'CS', value: 'CS' },
    { label: 'EEE', value: 'EEE' },
    { label: 'IE', value: 'IE' },
    { label: 'ME', value: 'ME' }
  ];

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
        console.log('Adding course:', { department, courseCode, isGradCourse, teachingAssistantNumber });
        // Add API call here
        break;
      case 'delete':
        console.log('Finding course to delete:', { courseCode });
        // Delete API call here
        break;
      case 'edit':
        console.log('Finding course to edit:', { courseCode });
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

  const handleSelectTeachingAssistants = () => {
    // Logic to select teaching assistants
    console.log('Selecting TAs for number:', teachingAssistantNumber);
  };

  return (
    <div className="course-management">
      {/* Top Navigation Bar */}
      <div className="top-navbar">
        <div className="logo">
          <img src="/logo.png" alt="Logo" />
        </div>
        <div className="nav-links">
          <a href="#">Logs and Reports</a>
          <a href="#">User</a>
          <a href="#">Student</a>
          <a href="#" className="active">Course</a>
          <a href="#">Classrooms</a>
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
              <span className={`button-label ${activeView === 'add' ? 'active' : ''}`}>Add Course</span>
            </div>
            
            <div 
              className={`action-button ${activeView === 'delete' ? 'active' : ''}`} 
              onClick={() => setActiveView('delete')}
            >
              <div className={`circle-icon ${activeView === 'delete' ? 'active' : ''}`}>
                <span>-</span>
              </div>
              <span className={`button-label ${activeView === 'delete' ? 'active' : ''}`}>Delete Course</span>
            </div>
            
            <div 
              className={`action-button ${activeView === 'edit' ? 'active' : ''}`} 
              onClick={() => setActiveView('edit')}
            >
              <div className={`circle-icon ${activeView === 'edit' ? 'active' : ''}`}>
                <span>✎</span>
              </div>
              <span className={`button-label ${activeView === 'edit' ? 'active' : ''}`}>Edit Course</span>
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
                <h2 className="form-title">Enter Course Information</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label>Department</label>
                    <div className="department-options">
                      {departmentOptions.map((dept) => (
                        <div 
                          key={dept.value} 
                          className={`department-option ${department === dept.value ? 'selected' : ''}`}
                          onClick={() => setDepartment(dept.value)}
                        >
                          {dept.label}
                          <span className="option-indicator"></span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Course Code</label>
                    <input 
                      type="text" 
                      placeholder="Enter course code" 
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <div className="checkbox-group">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={isGradCourse}
                          onChange={() => setIsGradCourse(!isGradCourse)}
                        />
                        <span>Grad Course</span>
                      </label>
                      <span className="option-indicator"></span>
                    </div>
                  </div>
                  <div className="form-group teaching-assistant">
                    <label>Teaching Assistant Number</label>
                    <div className="ta-input-group">
                      <input 
                        type="number" 
                        min="1"
                        value={teachingAssistantNumber}
                        onChange={(e) => setTeachingAssistantNumber(parseInt(e.target.value))}
                      />
                      <button 
                        type="button" 
                        className="select-ta-btn"
                        onClick={handleSelectTeachingAssistants}
                      >
                        Select Teaching Assistant(s)
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="form-submit-btn">Add Course</button>
                </form>
              </>
            )}

            {activeView === 'delete' && (
              <>
                <h2 className="form-title">Enter Course Code to find Course</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label>Course Code</label>
                    <input 
                      type="text" 
                      placeholder="Enter course code" 
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="form-submit-btn">Find Course to Delete</button>
                </form>
              </>
            )}

            {activeView === 'edit' && (
              <>
                <h2 className="form-title">Enter Course Code to find Course</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label>Course Code</label>
                    <input 
                      type="text" 
                      placeholder="Enter course code" 
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="form-submit-btn">Find Course to Edit</button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCourseManagement;