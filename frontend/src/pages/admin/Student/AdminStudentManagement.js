import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavBar from '../AdminNavBar';
import styles from './AdminStudentManagement.module.css';

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
    <div className={styles.studentManagement}>
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
              <span className={`${styles.buttonLabel} ${activeView === 'add' ? styles.active : ''}`}>Add Student</span>
            </div>
            
            <div 
              className={`${styles.actionButton} ${activeView === 'delete' ? styles.active : ''}`} 
              onClick={() => setActiveView('delete')}
            >
              <div className={`${styles.circleIcon} ${activeView === 'delete' ? styles.active : ''}`}>
                <span>-</span>
              </div>
              <span className={`${styles.buttonLabel} ${activeView === 'delete' ? styles.active : ''}`}>Delete Student</span>
            </div>
            
            <div 
              className={`${styles.actionButton} ${activeView === 'edit' ? styles.active : ''}`} 
              onClick={() => setActiveView('edit')}
            >
              <div className={`${styles.circleIcon} ${activeView === 'edit' ? styles.active : ''}`}>
                <span>✎</span>
              </div>
              <span className={`${styles.buttonLabel} ${activeView === 'edit' ? styles.active : ''}`}>Edit Student</span>
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
                <h2 className={styles.formTitle}>Enter Student Information</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className={styles.formGroup}>
                    <label>ID</label>
                    <input 
                      type="text" 
                      placeholder="Enter ID" 
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Name Surname</label>
                    <input 
                      type="text" 
                      placeholder="Enter name surname" 
                      value={nameSurname}
                      onChange={(e) => setNameSurname(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Mail</label>
                    <input 
                      type="email" 
                      placeholder="Enter mail" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Department</label>
                    <div className={styles.selectionList}>
                      {departmentOptions.map((dept) => (
                        <div 
                          key={dept.value} 
                          className={`${styles.selectionItem} ${department === dept.value ? styles.selected : ''}`}
                          onClick={() => setDepartment(dept.value)}
                        >
                          {dept.label}
                          <span className={styles.optionIndicator}></span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Courses</label>
                    <div className={styles.selectionList}>
                      {courseOptions.map((course) => (
                        <div 
                          key={course.value} 
                          className={`${styles.selectionItem} ${selectedCourses.includes(course.value) ? styles.selected : ''}`}
                          onClick={() => toggleCourse(course.value)}
                        >
                          {course.label}
                          <span className={styles.optionIndicator}></span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className={styles.formSubmitBtn}>Add Student</button>
                </form>
              </>
            )}

            {activeView === 'delete' && (
              <>
                <h2 className={styles.formTitle}>Enter ID or mail to find Student</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className={styles.formGroup}>
                    <label>ID</label>
                    <input 
                      type="text" 
                      placeholder="Enter ID" 
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Mail</label>
                    <input 
                      type="email" 
                      placeholder="Enter mail" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <button type="submit" className={styles.formSubmitBtn}>Find Student to Delete</button>
                </form>
              </>
            )}

            {activeView === 'edit' && (
              <>
                <h2 className={styles.formTitle}>Enter ID or mail to find Student</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className={styles.formGroup}>
                    <label>ID</label>
                    <input 
                      type="text" 
                      placeholder="Enter ID" 
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Mail</label>
                    <input 
                      type="email" 
                      placeholder="Enter mail" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <button type="submit" className={styles.formSubmitBtn}>Find Student to Edit</button>
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