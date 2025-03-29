import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminUserSelectUserPopup from './AdminUserSelectUserPopup';
import AdminNavBar from '../AdminNavBar'; // Import the AdminNavBar component
import styles from './AdminCourseManagement.module.css';

const AdminCourseManagement = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('add'); // 'add', 'delete', 'edit'
  
  // Form states
  const [department, setDepartment] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [isGradCourse, setIsGradCourse] = useState(false);
  const [teachingAssistantNumber, setTeachingAssistantNumber] = useState(1);
  const [selectedAssistants, setSelectedAssistants] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showTAPopup, setShowTAPopup] = useState(false);

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
        console.log('Adding course:', { 
          department, 
          courseCode, 
          isGradCourse, 
          teachingAssistantNumber,
          selectedAssistants 
        });
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
    setShowTAPopup(true);
  };

  const handleTAPopupCancel = () => {
    setShowTAPopup(false);
  };

  const handleTAPopupConfirm = (assistants) => {
    setSelectedAssistants(assistants);
    setTeachingAssistantNumber(assistants.length);
    setShowTAPopup(false);
  };

  return (
    <div className={styles.courseManagement}>
      {/* Using the reusable AdminNavBar component */}
      <AdminNavBar />

      <div className={styles.mainContent}>
        {/* Left Panel */}
        <div className={styles.leftPanel}>
          <div className={styles.actionButtons}>
            <div 
              className={`${styles.actionButton} ${activeView === 'add' ? styles.active : ''}`} 
              onClick={() => setActiveView('add')}
            >
              <div className={`${styles.circleIcon} ${activeView === 'add' ? styles.active : ''}`}>
                <span>+</span>
              </div>
              <span className={`${styles.buttonLabel} ${activeView === 'add' ? styles.active : ''}`}>Add Course</span>
            </div>
            
            <div 
              className={`${styles.actionButton} ${activeView === 'delete' ? styles.active : ''}`} 
              onClick={() => setActiveView('delete')}
            >
              <div className={`${styles.circleIcon} ${activeView === 'delete' ? styles.active : ''}`}>
                <span>-</span>
              </div>
              <span className={`${styles.buttonLabel} ${activeView === 'delete' ? styles.active : ''}`}>Delete Course</span>
            </div>
            
            <div 
              className={`${styles.actionButton} ${activeView === 'edit' ? styles.active : ''}`} 
              onClick={() => setActiveView('edit')}
            >
              <div className={`${styles.circleIcon} ${activeView === 'edit' ? styles.active : ''}`}>
                <span>✎</span>
              </div>
              <span className={`${styles.buttonLabel} ${activeView === 'edit' ? styles.active : ''}`}>Edit Course</span>
            </div>
          </div>

          <div 
            className={styles.fileUploadArea}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className={styles.uploadIcon}>
              <img src="/upload-icon.png" alt="Upload" />
            </div>
            <div className={styles.uploadText}>Drag and Drop here</div>
            <div className={styles.uploadDivider}>or</div>
            <label className={styles.selectFileBtn}>
              Select file
              <input 
                type="file" 
                hidden 
                onChange={handleFileSelect}
              />
            </label>
            {selectedFile && <div className={styles.selectedFile}>{selectedFile.name}</div>}
            <button 
              className={styles.uploadFileBtn}
              onClick={handleFileUpload}
            >
              Upload File
            </button>
          </div>
        </div>

        {/* Right Panel - Form Section */}
        <div className={styles.rightPanel}>
          <div className={styles.formContainer}>
            {activeView === 'add' && (
              <>
                <h2 className={styles.formTitle}>Enter Course Information</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className={styles.formGroup}>
                    <label>Department</label>
                    <div className={styles.departmentOptions}>
                      {departmentOptions.map((dept) => (
                        <div 
                          key={dept.value} 
                          className={`${styles.departmentOption} ${department === dept.value ? styles.selected : ''}`}
                          onClick={() => setDepartment(dept.value)}
                        >
                          {dept.label}
                          <span className={styles.optionIndicator}></span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Course Code</label>
                    <input 
                      type="text" 
                      placeholder="Enter course code" 
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <div className={styles.checkboxGroup}>
                      <label>
                        <input 
                          type="checkbox" 
                          checked={isGradCourse}
                          onChange={() => setIsGradCourse(!isGradCourse)}
                        />
                        <span>Grad Course</span>
                      </label>
                      <span className={`${styles.optionIndicator} ${isGradCourse ? styles.selected : ''}`}></span>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Teaching Assistant Number</label>
                    <div className={styles.taInputGroup}>
                      <input 
                        type="number" 
                        min="1"
                        value={teachingAssistantNumber}
                        onChange={(e) => setTeachingAssistantNumber(parseInt(e.target.value))}
                        readOnly={selectedAssistants.length > 0}
                      />
                      <button 
                        type="button" 
                        className={styles.selectTaBtn}
                        onClick={handleSelectTeachingAssistants}
                      >
                        Select Teaching Assistant(s)
                      </button>
                    </div>
                    
                    {/* Display selected assistants */}
                    {selectedAssistants.length > 0 && (
                      <div className={styles.selectedAssistants}>
                        {selectedAssistants.map(assistant => (
                          <div key={assistant.id} className={styles.assistantChip}>
                            {assistant.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button type="submit" className={styles.formSubmitBtn}>Add Course</button>
                </form>
              </>
            )}

            {activeView === 'delete' && (
              <>
                <h2 className={styles.formTitle}>Enter Course Code to find Course</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className={styles.formGroup}>
                    <label>Course Code</label>
                    <input 
                      type="text" 
                      placeholder="Enter course code" 
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                    />
                  </div>
                  <button type="submit" className={styles.formSubmitBtn}>Find Course to Delete</button>
                </form>
              </>
            )}

            {activeView === 'edit' && (
              <>
                <h2 className={styles.formTitle}>Enter Course Code to find Course</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className={styles.formGroup}>
                    <label>Course Code</label>
                    <input 
                      type="text" 
                      placeholder="Enter course code" 
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                    />
                  </div>
                  <button type="submit" className={styles.formSubmitBtn}>Find Course to Edit</button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Teaching Assistant Selection Popup */}
      {showTAPopup && (
        <AdminUserSelectUserPopup
          onCancel={handleTAPopupCancel}
          onConfirm={handleTAPopupConfirm}
          selectedAssistants={selectedAssistants}
          setSelectedAssistants={setSelectedAssistants}
        />
      )}
    </div>
  );
};

export default AdminCourseManagement;