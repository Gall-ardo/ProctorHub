import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavBar from '../AdminNavBar'; // Import the AdminNavBar component
import styles from './AdminOfferingManagement.module.css';
import axios from "axios"; // Make sure you import it at the top


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


  const handleFormSubmit = async (event) => {
    event.preventDefault();
    
    switch (activeView) {
      case 'add':
        console.log('Adding offering:', { instructor, courseCode, sectionId, semester });
        
        try {
          console.log('Sending data:', { 
            instructor, 
            courseCode, 
            sectionId, 
            semester, 
            studentCount: 0 
          });
          
          const response = await axios.post("http://localhost:5050/api/admin/offerings", {
            instructor: instructor,
            courseCode: courseCode,
            sectionId: sectionId,
            semester: semester,
            studentCount: 0
          });
          console.log('Offering created successfully:', response.data);
          alert('Offering Created Successfully!');
        } catch (error) {
          console.error('Error creating offering:', error.response?.data || error.message);
          alert(`Error creating offering: ${JSON.stringify(error.response?.data || error.message)}`);
        }
        break;
  
      case 'delete':
        console.log('Finding offering to delete:', { courseCode, sectionId });
        break;
  
      case 'edit':
        console.log('Finding offering to edit:', { courseCode, sectionId });
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
    <div className={styles.offeringManagement}>
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
              <span className={`${styles.buttonLabel} ${activeView === 'add' ? styles.active : ''}`}>Add Offering</span>
            </div>
            
            <div 
              className={`${styles.actionButton} ${activeView === 'delete' ? styles.active : ''}`} 
              onClick={() => setActiveView('delete')}
            >
              <div className={`${styles.circleIcon} ${activeView === 'delete' ? styles.active : ''}`}>
                <span>-</span>
              </div>
              <span className={`${styles.buttonLabel} ${activeView === 'delete' ? styles.active : ''}`}>Delete Offering</span>
            </div>
            
            <div 
              className={`${styles.actionButton} ${activeView === 'edit' ? styles.active : ''}`} 
              onClick={() => setActiveView('edit')}
            >
              <div className={`${styles.circleIcon} ${activeView === 'edit' ? styles.active : ''}`}>
                <span>✎</span>
              </div>
              <span className={`${styles.buttonLabel} ${activeView === 'edit' ? styles.active : ''}`}>Edit Offering</span>
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
                <h2 className={styles.formTitle}>Enter Offering Information</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className={styles.formGroup}>
                    <label>Instructors</label>
                    <div className={styles.instructorOptions}>
                      {instructorOptions.map((inst) => (
                        <div 
                          key={inst.value} 
                          className={`${styles.instructorOption} ${instructor === inst.value ? styles.selected : ''}`}
                          onClick={() => setInstructor(inst.value)}
                        >
                          {inst.label}
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
                    <label>Section ID</label>
                    <input 
                      type="text" 
                      placeholder="Enter section ID" 
                      value={sectionId}
                      onChange={(e) => setSectionId(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Semester</label>
                    <div className={styles.semesterOptions}>
                      {semesterOptions.map((sem) => (
                        <div 
                          key={sem.value} 
                          className={`${styles.semesterOption} ${semester === sem.value ? styles.selected : ''}`}
                          onClick={() => setSemester(sem.value)}
                        >
                          {sem.label}
                          <span className={styles.optionIndicator}></span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className={styles.formSubmitBtn}>Add Offering</button>
                </form>
              </>
            )}

            {activeView === 'delete' && (
              <>
                <h2 className={styles.formTitle}>Enter Course Code and Section ID to find Section</h2>
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
                  <div className={styles.formGroup}>
                    <label>Section ID</label>
                    <input 
                      type="text" 
                      placeholder="Enter section ID" 
                      value={sectionId}
                      onChange={(e) => setSectionId(e.target.value)}
                    />
                  </div>
                  <button type="submit" className={styles.formSubmitBtn}>Find Offerings To Delete</button>
                </form>
              </>
            )}

            {activeView === 'edit' && (
              <>
                <h2 className={styles.formTitle}>Enter Course Code and Section ID to find Section</h2>
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
                  <div className={styles.formGroup}>
                    <label>Section ID</label>
                    <input 
                      type="text" 
                      placeholder="Enter section ID" 
                      value={sectionId}
                      onChange={(e) => setSectionId(e.target.value)}
                    />
                  </div>
                  <button type="submit" className={styles.formSubmitBtn}>Find Offerings To Edit</button>
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