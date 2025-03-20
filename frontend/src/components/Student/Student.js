import React, { useState } from 'react';
import './Student.css';

const Student = () => {
  const [activeView, setActiveView] = useState('add'); // 'add', 'delete', 'edit'
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
    <div className="student-container">
      <div className="header">
        <h1>Student Management</h1>
      </div>

      <div className="student-content">
        {/* Left Side Buttons */}
        <div className="left-side">
          <div className="buttons">
            <button 
              className={`button add ${activeView === 'add' ? 'active' : ''}`}
              onClick={() => setActiveView('add')}
            >
              Add Student
            </button>
            <button 
              className={`button delete ${activeView === 'delete' ? 'active' : ''}`}
              onClick={() => setActiveView('delete')}
            >
              Delete Student
            </button>
            <button 
              className={`button edit ${activeView === 'edit' ? 'active' : ''}`}
              onClick={() => setActiveView('edit')}
            >
              Edit Student
            </button>
          </div>

          {/* File Upload Section */}
          <div className="upload-section">
            <div 
              className="upload-box"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <p>Drag and Drop here</p>
              <label className="file-input-label">
                <span className="button">Select file</span>
                <input 
                  type="file" 
                  hidden 
                  onChange={handleFileSelect}
                />
              </label>
              {selectedFile && <p className="selected-file">{selectedFile.name}</p>}
            </div>
            <button 
              className="button upload-btn"
              onClick={handleFileUpload}
            >
              Upload File
            </button>
          </div>
        </div>

        {/* Right Side Form Section */}
        <div className="form-section">
          {activeView === 'add' && (
            <>
              <h2>Enter Student Information</h2>
              <form onSubmit={handleFormSubmit}>
                <div className="input-field">
                  <label>ID</label>
                  <input
                    type="text"
                    placeholder="Enter ID"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                </div>
                <div className="input-field">
                  <label>Name Surname</label>
                  <input
                    type="text"
                    placeholder="Enter name surname"
                    value={nameSurname}
                    onChange={(e) => setNameSurname(e.target.value)}
                  />
                </div>
                <div className="input-field">
                  <label>Mail</label>
                  <input
                    type="email"
                    placeholder="Enter mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="input-field">
                  <label>Department</label>
                  <div className="selection-list">
                    {departmentOptions.map((dept) => (
                      <div 
                        key={dept.value} 
                        className={`selection-option ${department === dept.value ? 'selected' : ''}`}
                        onClick={() => setDepartment(dept.value)}
                      >
                        {dept.label}
                        <span className="radio-indicator"></span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="input-field">
                  <label>Courses</label>
                  <div className="selection-list">
                    {courseOptions.map((course) => (
                      <div 
                        key={course.value} 
                        className={`selection-option ${selectedCourses.includes(course.value) ? 'selected' : ''}`}
                        onClick={() => toggleCourse(course.value)}
                      >
                        {course.label}
                        <span className="radio-indicator"></span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-buttons">
                  <button className="add-student" type="submit">
                    Add Student
                  </button>
                </div>
              </form>
            </>
          )}

          {activeView === 'delete' && (
            <>
              <h2>Enter ID or mail to find Student</h2>
              <form onSubmit={handleFormSubmit}>
                <div className="input-field">
                  <label>ID</label>
                  <input
                    type="text"
                    placeholder="Enter ID"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                </div>
                <div className="input-field">
                  <label>Mail</label>
                  <input
                    type="email"
                    placeholder="Enter mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-buttons">
                  <button className="find-student" type="submit">
                    Find Student to Delete
                  </button>
                </div>
              </form>
            </>
          )}

          {activeView === 'edit' && (
            <>
              <h2>Enter ID or mail to find Student</h2>
              <form onSubmit={handleFormSubmit}>
                <div className="input-field">
                  <label>ID</label>
                  <input
                    type="text"
                    placeholder="Enter ID"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                </div>
                <div className="input-field">
                  <label>Mail</label>
                  <input
                    type="email"
                    placeholder="Enter mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-buttons">
                  <button className="find-student" type="submit">
                    Find Student to Edit
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Student;