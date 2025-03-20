import React, { useState } from 'react';
import './Course.css';

const Course = () => {
  const [activeView, setActiveView] = useState('add'); // 'add', 'delete', 'edit'
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
    <div className="course-container">
      <div className="header">
        <h1>Course Management</h1>
      </div>

      <div className="course-content">
        {/* Left Side Buttons */}
        <div className="left-side">
          <div className="buttons">
            <button 
              className={`button add ${activeView === 'add' ? 'active' : ''}`}
              onClick={() => setActiveView('add')}
            >
              Add Course
            </button>
            <button 
              className={`button delete ${activeView === 'delete' ? 'active' : ''}`}
              onClick={() => setActiveView('delete')}
            >
              Delete Course
            </button>
            <button 
              className={`button edit ${activeView === 'edit' ? 'active' : ''}`}
              onClick={() => setActiveView('edit')}
            >
              Edit Course
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
              <h2>Enter Course Information</h2>
              <form onSubmit={handleFormSubmit}>
                <div className="input-field">
                  <label>Department</label>
                  <div className="department-selection">
                    {departmentOptions.map((dept) => (
                      <div 
                        key={dept.value} 
                        className={`dept-option ${department === dept.value ? 'selected' : ''}`}
                        onClick={() => setDepartment(dept.value)}
                      >
                        {dept.label}
                        <span className="radio-indicator"></span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="input-field">
                  <label>Course Code</label>
                  <input
                    type="text"
                    placeholder="Enter course code"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                  />
                </div>
                <div className="input-field">
                  <div className="checkbox-field">
                    <label>
                      <input
                        type="checkbox"
                        checked={isGradCourse}
                        onChange={() => setIsGradCourse(!isGradCourse)}
                      />
                      <span>Grad Course</span>
                    </label>
                    <span className={`checkbox-indicator ${isGradCourse ? 'checked' : ''}`}></span>
                  </div>
                </div>
                <div className="input-field">
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

                <div className="form-buttons">
                  <button className="add-course" type="submit">
                    Add Course
                  </button>
                </div>
              </form>
            </>
          )}

          {activeView === 'delete' && (
            <>
              <h2>Enter Course Code to find Course</h2>
              <form onSubmit={handleFormSubmit}>
                <div className="input-field">
                  <label>Course Code</label>
                  <input
                    type="text"
                    placeholder="Enter course code"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                  />
                </div>
                <div className="form-buttons">
                  <button className="find-course" type="submit">
                    Find Course to Delete
                  </button>
                </div>
              </form>
            </>
          )}

          {activeView === 'edit' && (
            <>
              <h2>Enter Course Code to find Course</h2>
              <form onSubmit={handleFormSubmit}>
                <div className="input-field">
                  <label>Course Code</label>
                  <input
                    type="text"
                    placeholder="Enter course code"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                  />
                </div>
                <div className="form-buttons">
                  <button className="find-course" type="submit">
                    Find Course to Edit
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

export default Course;