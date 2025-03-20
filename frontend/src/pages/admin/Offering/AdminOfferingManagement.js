import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminOfferingManagement.css';

const AdminOfferingManagement = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('add'); // 'add', 'delete', 'edit'
  
  // Form states
  const [instructor, setInstructor] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [semester, setSemester] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Instructor options
  const instructorOptions = [
    { label: 'Fazlı Can', value: 'fazli_can' },
    { label: 'Ayşegül Dündar', value: 'aysegul_dundar' },
    { label: 'Can Alkan', value: 'can_alkan' }
  ];

  // Semester options
  const semesterOptions = [
    { label: '2025 Spring', value: '2025_spring' },
    { label: '2024 Fall', value: '2024_fall' }
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
        console.log('Adding offering:', { instructor, courseCode, sectionId, semester });
        // Add API call here
        break;
      case 'delete':
        console.log('Finding offering to delete:', { courseCode, sectionId });
        // Delete API call here
        break;
      case 'edit':
        console.log('Finding offering to edit:', { courseCode, sectionId });
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
    <div className="offering-management">
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
          <a href="#">Classrooms</a>
          <a href="#" className="active">Offering</a>
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
              <span className={`button-label ${activeView === 'add' ? 'active' : ''}`}>Add Offering</span>
            </div>
            
            <div 
              className={`action-button ${activeView === 'delete' ? 'active' : ''}`} 
              onClick={() => setActiveView('delete')}
            >
              <div className={`circle-icon ${activeView === 'delete' ? 'active' : ''}`}>
                <span>-</span>
              </div>
              <span className={`button-label ${activeView === 'delete' ? 'active' : ''}`}>Delete Offering</span>
            </div>
            
            <div 
              className={`action-button ${activeView === 'edit' ? 'active' : ''}`} 
              onClick={() => setActiveView('edit')}
            >
              <div className={`circle-icon ${activeView === 'edit' ? 'active' : ''}`}>
                <span>✎</span>
              </div>
              <span className={`button-label ${activeView === 'edit' ? 'active' : ''}`}>Edit Offering</span>
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
                <h2 className="form-title">Enter Offering Information</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label>Instructors</label>
                    <div className="instructor-options">
                      {instructorOptions.map((inst) => (
                        <div 
                          key={inst.value} 
                          className={`instructor-option ${instructor === inst.value ? 'selected' : ''}`}
                          onClick={() => setInstructor(inst.value)}
                        >
                          {inst.label}
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
                    <label>Section ID</label>
                    <input 
                      type="text" 
                      placeholder="Enter section ID" 
                      value={sectionId}
                      onChange={(e) => setSectionId(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Semester</label>
                    <div className="semester-options">
                      {semesterOptions.map((sem) => (
                        <div 
                          key={sem.value} 
                          className={`semester-option ${semester === sem.value ? 'selected' : ''}`}
                          onClick={() => setSemester(sem.value)}
                        >
                          {sem.label}
                          <span className="option-indicator"></span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="form-submit-btn">Add Offering</button>
                </form>
              </>
            )}

            {activeView === 'delete' && (
              <>
                <h2 className="form-title">Enter Course Code and Section ID to find Section</h2>
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
                  <div className="form-group">
                    <label>Section ID</label>
                    <input 
                      type="text" 
                      placeholder="Enter section ID" 
                      value={sectionId}
                      onChange={(e) => setSectionId(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="form-submit-btn">Find Offerings To Delete</button>
                </form>
              </>
            )}

            {activeView === 'edit' && (
              <>
                <h2 className="form-title">Enter Course Code and Section ID to find Section</h2>
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
                  <div className="form-group">
                    <label>Section ID</label>
                    <input 
                      type="text" 
                      placeholder="Enter section ID" 
                      value={sectionId}
                      onChange={(e) => setSectionId(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="form-submit-btn">Find Offerings To Edit</button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOfferingManagement;