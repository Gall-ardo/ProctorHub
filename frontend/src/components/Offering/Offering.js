import React, { useState } from 'react';
import './Offering.css';

const Offering = () => {
  const [activeView, setActiveView] = useState('add'); // 'add', 'delete', 'edit'
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
    <div className="offering-container">
      <div className="header">
        <h1>Offering Management</h1>
      </div>

      <div className="offering-content">
        {/* Left Side Buttons */}
        <div className="left-side">
          <div className="buttons">
            <button 
              className={`button add ${activeView === 'add' ? 'active' : ''}`}
              onClick={() => setActiveView('add')}
            >
              Add Offering
            </button>
            <button 
              className={`button delete ${activeView === 'delete' ? 'active' : ''}`}
              onClick={() => setActiveView('delete')}
            >
              Delete Offering
            </button>
            <button 
              className={`button edit ${activeView === 'edit' ? 'active' : ''}`}
              onClick={() => setActiveView('edit')}
            >
              Edit Offering
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
              <h2>Enter Offering Information</h2>
              <form onSubmit={handleFormSubmit}>
                <div className="input-field">
                  <label>Instructors</label>
                  <div className="instructor-selection">
                    {instructorOptions.map((inst) => (
                      <div 
                        key={inst.value} 
                        className={`instructor-option ${instructor === inst.value ? 'selected' : ''}`}
                        onClick={() => setInstructor(inst.value)}
                      >
                        {inst.label}
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
                  <label>Section ID</label>
                  <input
                    type="text"
                    placeholder="Enter section ID"
                    value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                  />
                </div>
                <div className="input-field">
                  <label>Semester</label>
                  <div className="semester-selection">
                    {semesterOptions.map((sem) => (
                      <div 
                        key={sem.value} 
                        className={`semester-option ${semester === sem.value ? 'selected' : ''}`}
                        onClick={() => setSemester(sem.value)}
                      >
                        {sem.label}
                        <span className="radio-indicator"></span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-buttons">
                  <button className="add-offering" type="submit">
                    Add Offering
                  </button>
                </div>
              </form>
            </>
          )}

          {activeView === 'delete' && (
            <>
              <h2>Enter Course Code and Section ID to find Section</h2>
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
                <div className="input-field">
                  <label>Section ID</label>
                  <input
                    type="text"
                    placeholder="Enter section ID"
                    value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                  />
                </div>
                <div className="form-buttons">
                  <button className="find-offering" type="submit">
                    Find Offerings To Delete
                  </button>
                </div>
              </form>
            </>
          )}

          {activeView === 'edit' && (
            <>
              <h2>Enter Course Code and Section ID to find Section</h2>
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
                <div className="input-field">
                  <label>Section ID</label>
                  <input
                    type="text"
                    placeholder="Enter section ID"
                    value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                  />
                </div>
                <div className="form-buttons">
                  <button className="find-offering" type="submit">
                    Find Offerings To Edit
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

export default Offering;