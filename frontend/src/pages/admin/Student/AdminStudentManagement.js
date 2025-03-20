import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminStudentManagement.css';

const AdminStudentManagement = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('add'); // 'add', 'delete', 'edit'
  
  // Form states
  const [studentId, setStudentId] = useState('');
  const [nameSurname, setNameSurname] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // Department options
  const departmentOptions = [
    { label: 'CS', value: 'CS' },
    { label: 'IE', value: 'IE' },
    { label: 'EEE', value: 'EEE' }
  ];

  // Course options
  const courseOptions = [
    { label: 'CS-101', value: 'CS-101' },
    { label: 'CS-102', value: 'CS-102' }
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

  const toggleCourse = (courseValue) => {
    if (selectedCourses.includes(courseValue)) {
      setSelectedCourses(selectedCourses.filter(course => course !== courseValue));
    } else {
      setSelectedCourses([...selectedCourses, courseValue]);
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    
    // Handle different form submissions based on active view
    switch(activeView) {
      case 'add':
        console.log('Adding student:', { 
          studentId, 
          nameSurname, 
          email, 
          department,
          selectedCourses 
        });
        // Add API call here
        break;
      case 'delete':
        console.log('Finding student to delete:', { studentId, email });
        // Delete API call here
        break;
      case 'edit':
        console.log('Finding student to edit:', { studentId, email });
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
    <div className="student-management">
      {/* Top Navigation Bar */}
      <div className="top-navbar">
        <div className="logo">
          <img src="/logo.png" alt="Logo" />
        </div>
        <div className="nav-links">
          <a href="#">Logs and Reports</a>
          <a href="#">User</a>
          <a href="#" className="active">Student</a>
          <a href="#">Course</a>
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
              <span className={`button-label ${activeView === 'add' ? 'active' : ''}`}>Add Student</span>
            </div>
            
            <div 
              className={`action-button ${activeView === 'delete' ? 'active' : ''}`} 
              onClick={() => setActiveView('delete')}
            >
              <div className={`circle-icon ${activeView === 'delete' ? 'active' : ''}`}>
                <span>-</span>
              </div>
              <span className={`button-label ${activeView === 'delete' ? 'active' : ''}`}>Delete Student</span>
            </div>
            
            <div 
              className={`action-button ${activeView === 'edit' ? 'active' : ''}`} 
              onClick={() => setActiveView('edit')}
            >
              <div className={`circle-icon ${activeView === 'edit' ? 'active' : ''}`}>
                <span>✎</span>
              </div>
              <span className={`button-label ${activeView === 'edit' ? 'active' : ''}`}>Edit Student</span>
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
                <h2 className="form-title">Enter Student Information</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label>ID</label>
                    <input 
                      type="text" 
                      placeholder="Enter ID" 
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Name Surname</label>
                    <input 
                      type="text" 
                      placeholder="Enter name surname" 
                      value={nameSurname}
                      onChange={(e) => setNameSurname(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mail</label>
                    <input 
                      type="email" 
                      placeholder="Enter mail" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <div className="selection-list">
                      {departmentOptions.map((dept) => (
                        <div 
                          key={dept.value} 
                          className={`selection-item ${department === dept.value ? 'selected' : ''}`}
                          onClick={() => setDepartment(dept.value)}
                        >
                          {dept.label}
                          <span className="option-indicator"></span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Courses</label>
                    <div className="selection-list">
                      {courseOptions.map((course) => (
                        <div 
                          key={course.value} 
                          className={`selection-item ${selectedCourses.includes(course.value) ? 'selected' : ''}`}
                          onClick={() => toggleCourse(course.value)}
                        >
                          {course.label}
                          <span className="option-indicator"></span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="form-submit-btn">Add Student</button>
                </form>
              </>
            )}

            {activeView === 'delete' && (
              <>
                <h2 className="form-title">Enter ID or mail to find Student</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label>ID</label>
                    <input 
                      type="text" 
                      placeholder="Enter ID" 
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mail</label>
                    <input 
                      type="email" 
                      placeholder="Enter mail" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="form-submit-btn">Find Student to Delete</button>
                </form>
              </>
            )}

            {activeView === 'edit' && (
              <>
                <h2 className="form-title">Enter ID or mail to find Student</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label>ID</label>
                    <input 
                      type="text" 
                      placeholder="Enter ID" 
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mail</label>
                    <input 
                      type="email" 
                      placeholder="Enter mail" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="form-submit-btn">Find Student to Edit</button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStudentManagement;