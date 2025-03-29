import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavBar from '../AdminNavBar'; // Import the AdminNavBar component
import styles from './AdminClassroomManagement.module.css'; // Import CSS module

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
    <div className={styles.classroomManagement}>
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
              <span className={`${styles.buttonLabel} ${activeView === 'add' ? styles.active : ''}`}>Add Classroom</span>
            </div>
            
            <div 
              className={`${styles.actionButton} ${activeView === 'delete' ? styles.active : ''}`} 
              onClick={() => setActiveView('delete')}
            >
              <div className={`${styles.circleIcon} ${activeView === 'delete' ? styles.active : ''}`}>
                <span>-</span>
              </div>
              <span className={`${styles.buttonLabel} ${activeView === 'delete' ? styles.active : ''}`}>Delete Classroom</span>
            </div>
            
            <div 
              className={`${styles.actionButton} ${activeView === 'edit' ? styles.active : ''}`} 
              onClick={() => setActiveView('edit')}
            >
              <div className={`${styles.circleIcon} ${activeView === 'edit' ? styles.active : ''}`}>
                <span>✎</span>
              </div>
              <span className={`${styles.buttonLabel} ${activeView === 'edit' ? styles.active : ''}`}>Edit Classroom</span>
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
                <h2 className={styles.formTitle}>Enter Classroom Information</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className={styles.formGroup}>
                    <label>Building</label>
                    <input 
                      type="text" 
                      placeholder="Enter building ID" 
                      value={buildingId}
                      onChange={(e) => setBuildingId(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Classroom ID</label>
                    <input 
                      type="text" 
                      placeholder="Enter classroom ID" 
                      value={classroomId}
                      onChange={(e) => setClassroomId(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Capacity</label>
                    <input 
                      type="number" 
                      placeholder="Enter capacity" 
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Exam Capacity</label>
                    <input 
                      type="number" 
                      placeholder="Enter exam capacity" 
                      value={examCapacity}
                      onChange={(e) => setExamCapacity(e.target.value)}
                    />
                  </div>
                  <button type="submit" className={styles.formSubmitBtn}>Add Classroom</button>
                </form>
              </>
            )}

            {activeView === 'delete' && (
              <>
                <h2 className={styles.formTitle}>Enter building ID and classroom ID to Find Classroom</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className={styles.formGroup}>
                    <label>Building</label>
                    <input 
                      type="text" 
                      placeholder="Enter building ID" 
                      value={buildingId}
                      onChange={(e) => setBuildingId(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Classroom ID</label>
                    <input 
                      type="text" 
                      placeholder="Enter classroom ID" 
                      value={classroomId}
                      onChange={(e) => setClassroomId(e.target.value)}
                    />
                  </div>
                  <button type="submit" className={styles.formSubmitBtn}>Find Classroom to Delete</button>
                </form>
              </>
            )}

            {activeView === 'edit' && (
              <>
                <h2 className={styles.formTitle}>Enter building ID and classroom ID to Find Classroom</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className={styles.formGroup}>
                    <label>Building</label>
                    <input 
                      type="text" 
                      placeholder="Enter building ID" 
                      value={buildingId}
                      onChange={(e) => setBuildingId(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Classroom ID</label>
                    <input 
                      type="text" 
                      placeholder="Enter classroom ID" 
                      value={classroomId}
                      onChange={(e) => setClassroomId(e.target.value)}
                    />
                  </div>
                  <button type="submit" className={styles.formSubmitBtn}>Find Classroom to Edit</button>
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