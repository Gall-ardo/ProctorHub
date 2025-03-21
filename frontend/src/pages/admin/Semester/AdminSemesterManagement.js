import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminSemesterManagement.css';

const AdminSemesterManagement = () => {
  const navigate = useNavigate();
  
  // Form states
  const [semesterYear, setSemesterYear] = useState('');
  const [term, setTerm] = useState('');
  
  // Upload states
  const [offeringsFile, setOfferingsFile] = useState(null);
  const [studentsFile, setStudentsFile] = useState(null);
  const [assistantsFile, setAssistantsFile] = useState(null);

  // Term options
  const termOptions = [
    { label: 'Fall', value: 'Fall' },
    { label: 'Spring', value: 'Spring' },
    { label: 'Summer', value: 'Summer' }
  ];

  const handleFileSelect = (fileType, event) => {
    const file = event.target.files[0];
    if (file) {
      switch(fileType) {
        case 'offerings':
          setOfferingsFile(file);
          break;
        case 'students':
          setStudentsFile(file);
          break;
        case 'assistants':
          setAssistantsFile(file);
          break;
        default:
          break;
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (fileType, event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      switch(fileType) {
        case 'offerings':
          setOfferingsFile(file);
          break;
        case 'students':
          setStudentsFile(file);
          break;
        case 'assistants':
          setAssistantsFile(file);
          break;
        default:
          break;
      }
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    
    console.log('Adding semester:', { 
      semesterYear, 
      term,
      offeringsFile,
      studentsFile,
      assistantsFile
    });
    
    // Add API call here
    // Example: await api.addSemester(formData);
    
    // Reset form or navigate to another page
    // navigate('/admin/semesters');
  };

  return (
    <div className="semester-management">
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
          <a href="#">Offering</a>
          <a href="#" className="active">Semester</a>
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

      <div className="semester-content">
        {/* Semester Information Form */}
        <div className="semester-info-card">
          <h2 className="card-title">Enter Semester Information</h2>
          <form>
            <div className="form-group">
              <label>Year</label>
              <input 
                type="text" 
                placeholder="Enter semester year" 
                value={semesterYear}
                onChange={(e) => setSemesterYear(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Term</label>
              <div className="term-options">
                {termOptions.map((termOption) => (
                  <div 
                    key={termOption.value} 
                    className={`term-option ${term === termOption.value ? 'selected' : ''}`}
                    onClick={() => setTerm(termOption.value)}
                  >
                    {termOption.label}
                    <span className="radio-indicator"></span>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
        
        {/* Upload Cards */}
        <div className="upload-cards-container">
          {/* Offerings Upload Card */}
          <div className="upload-card">
            <h3 className="upload-title">Upload Offerings List</h3>
            <div 
              className="upload-area"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop('offerings', e)}
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
                  accept=".xlsx,.xls,.csv" 
                  hidden 
                  onChange={(e) => handleFileSelect('offerings', e)}
                />
              </label>
              {offeringsFile && <div className="selected-file">{offeringsFile.name}</div>}
            </div>
          </div>
          
          {/* Students Upload Card */}
          <div className="upload-card">
            <h3 className="upload-title">Upload Students List</h3>
            <div 
              className="upload-area"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop('students', e)}
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
                  accept=".xlsx,.xls,.csv" 
                  hidden 
                  onChange={(e) => handleFileSelect('students', e)}
                />
              </label>
              {studentsFile && <div className="selected-file">{studentsFile.name}</div>}
            </div>
          </div>
          
          {/* Teaching Assistants Upload Card */}
          <div className="upload-card">
            <h3 className="upload-title">Upload Teaching Assistants List</h3>
            <div 
              className="upload-area"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop('assistants', e)}
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
                  accept=".xlsx,.xls,.csv" 
                  hidden 
                  onChange={(e) => handleFileSelect('assistants', e)}
                />
              </label>
              {assistantsFile && <div className="selected-file">{assistantsFile.name}</div>}
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="semester-submit">
          <button 
            className="add-semester-btn"
            onClick={handleFormSubmit}
          >
            Add Semester
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSemesterManagement;