import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavBar from '../AdminNavBar';
import CourseSelectionPopup from './CourseSelectionPopup';
import axios from 'axios';
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
  
  // Course popup state
  const [isCoursePopupOpen, setIsCoursePopupOpen] = useState(false);
  
  // Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [findResults, setFindResults] = useState(null);

  // Department options
  const departmentOptions = [
    { label: 'CS', value: 'CS' },
    { label: 'IE', value: 'IE' },
    { label: 'EEE', value: 'EEE' }
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

  const handleCourseSelection = (selectedCourses) => {
    setSelectedCourses(selectedCourses);
    setIsCoursePopupOpen(false);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      // Handle different form submissions based on active view
      switch(activeView) {
        case 'add':
          // If there's a findResults._id, it means we're updating
          if (findResults && findResults._id) {
            const updateResponse = await axios.put(`/api/admin/students/${findResults._id}`, { 
              studentId, 
              nameSurname, 
              email, 
              department,
              courses: selectedCourses 
            });
            
            if (updateResponse.data.success) {
              setMessage({ text: 'Student updated successfully!', type: 'success' });
              resetForm();
            }
          } else {
            // Creating a new student
            const addResponse = await axios.post('/api/admin/students', { 
              studentId, 
              nameSurname, 
              email, 
              department,
              courses: selectedCourses 
            });
            
            if (addResponse.data.success) {
              setMessage({ text: 'Student added successfully!', type: 'success' });
              resetForm();
            }
          }
          break;
          
        case 'delete':
          // First find the student
          if (!studentId && !email) {
            setMessage({ text: 'Please provide either ID or email to find student', type: 'error' });
            setIsLoading(false);
            return;
          }
          
          const findParams = {};
          if (studentId) findParams.studentId = studentId;
          if (email) findParams.email = email;
          
          const findResponse = await axios.get('/api/admin/students', { params: findParams });
          
          if (findResponse.data.success && findResponse.data.data.length > 0) {
            setFindResults(findResponse.data.data);
          } else {
            setMessage({ text: 'No students found with the provided information', type: 'error' });
          }
          break;
          
        case 'edit':
          // First find the student
          if (!studentId && !email) {
            setMessage({ text: 'Please provide either ID or email to find student', type: 'error' });
            setIsLoading(false);
            return;
          }
          
          const editFindParams = {};
          if (studentId) editFindParams.studentId = studentId;
          if (email) editFindParams.email = email;
          
          const editFindResponse = await axios.get('/api/admin/students', { params: editFindParams });
          
          if (editFindResponse.data.success && editFindResponse.data.data.length > 0) {
            setFindResults(editFindResponse.data.data);
          } else {
            setMessage({ text: 'No students found with the provided information', type: 'error' });
          }
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ 
        text: error.response?.data?.message || 'An error occurred', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setMessage({ text: 'Please select a file first', type: 'error' });
      return;
    }
    
    setIsLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await axios.post('/api/admin/students/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setMessage({ 
          text: `Uploaded successfully! ${response.data.studentsCreated} students added, ${response.data.studentsFailed} errors.`, 
          type: 'success' 
        });
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage({ 
        text: error.response?.data?.message || 'An error occurred uploading the file', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.delete(`/api/admin/students/${id}`);
      
      if (response.data.success) {
        setMessage({ text: 'Student deleted successfully!', type: 'success' });
        setFindResults(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      setMessage({ 
        text: error.response?.data?.message || 'An error occurred deleting the student', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStudent = (student) => {
    // Switch to add view and fill the form with the student's data
    setActiveView('add');
    setStudentId(student.studentId);
    setNameSurname(student.nameSurname);
    setEmail(student.email);
    setDepartment(student.department);
    setSelectedCourses(student.courses || []);
    
    // Store the MongoDB ID for the update operation
    setFindResults({ _id: student._id });
  };

  const resetForm = () => {
    setStudentId('');
    setNameSurname('');
    setEmail('');
    setDepartment('');
    setSelectedCourses([]);
    setMessage({ text: '', type: '' });
    setFindResults(null);
  };

  return (
    <div className={styles.studentManagement}>
      {/* Using the reusable AdminNavBar component */}
      <AdminNavBar />

      <div className={styles.mainContent}>
        {/* Status message */}
        {message.text && (
          <div className={`${styles.statusMessage} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className={styles.loadingIndicator}>
            Loading...
          </div>
        )}
        
        {/* Left Panel */}
        <div className={styles.leftPanel}>
          <div className={styles.actionButtons}>
            <div 
              className={`${styles.actionButton} ${activeView === 'add' ? styles.active : ''}`} 
              onClick={() => {
                setActiveView('add');
                resetForm();
              }}
            >
              <div className={`${styles.circleIcon} ${activeView === 'add' ? styles.active : ''}`}>
                <span>+</span>
              </div>
              <span className={`${styles.buttonLabel} ${activeView === 'add' ? styles.active : ''}`}>Add Student</span>
            </div>
            
            <div 
              className={`${styles.actionButton} ${activeView === 'delete' ? styles.active : ''}`} 
              onClick={() => {
                setActiveView('delete');
                resetForm();
              }}
            >
              <div className={`${styles.circleIcon} ${activeView === 'delete' ? styles.active : ''}`}>
                <span>-</span>
              </div>
              <span className={`${styles.buttonLabel} ${activeView === 'delete' ? styles.active : ''}`}>Delete Student</span>
            </div>
            
            <div 
              className={`${styles.actionButton} ${activeView === 'edit' ? styles.active : ''}`} 
              onClick={() => {
                setActiveView('edit');
                resetForm();
              }}
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
                accept=".csv"
                onChange={handleFileSelect}
              />
            </label>
            {selectedFile && <div className={styles.selectedFile}>{selectedFile.name}</div>}
            <button 
              className={styles.uploadFileBtn}
              onClick={handleFileUpload}
              disabled={isLoading}
            >
              Upload File
            </button>
            <div className={styles.fileFormat}>
              <small>Accepted format: CSV</small>
              <small>Required columns: studentId, nameSurname, email, department</small>
              <small>Optional columns: courses (comma-separated)</small>
            </div>
          </div>
        </div>

        {/* Right Panel - Form Section */}
        <div className={styles.rightPanel}>
          <div className={styles.formContainer}>
            {activeView === 'add' && (
              <>
                <h2 className={styles.formTitle}>
                  {findResults && findResults._id ? 'Edit Student Information' : 'Enter Student Information'}
                </h2>
                <form onSubmit={handleFormSubmit}>
                  <div className={styles.formGroup}>
                    <label>ID</label>
                    <input 
                      type="text" 
                      placeholder="Enter ID" 
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Name Surname</label>
                    <input 
                      type="text" 
                      placeholder="Enter name surname" 
                      value={nameSurname}
                      onChange={(e) => setNameSurname(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Mail</label>
                    <input 
                      type="email" 
                      placeholder="Enter mail" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
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
                    <div className={styles.selectContainer} onClick={() => setIsCoursePopupOpen(true)}>
                      <div className={styles.inputField}>
                        {selectedCourses.length > 0 
                          ? `${selectedCourses.length} course${selectedCourses.length > 1 ? 's' : ''} selected` 
                          : 'Select Course(s)'}
                      </div>
                      <div className={styles.arrowIcon}>▼</div>
                    </div>
                    {selectedCourses.length > 0 && (
                      <div className={styles.selectedItemsContainer}>
                        {selectedCourses.map(course => (
                          <div key={course} className={styles.selectedItem}>
                            <span>{course}</span>
                            <button 
                              type="button"
                              className={styles.removeButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCourses(selectedCourses.filter(c => c !== course));
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button 
                    type="submit" 
                    className={styles.formSubmitBtn}
                    disabled={isLoading}
                  >
                    {findResults && findResults._id ? 'Update Student' : 'Add Student'}
            </button>
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
      <button 
        type="submit" 
        className={styles.formSubmitBtn}
        disabled={isLoading}
      >
        Find Student to Delete
      </button>
    </form>
    
    {/* Display find results for deletion */}
    {findResults && findResults.length > 0 && (
      <div className={styles.findResults}>
        <h3>Found Students:</h3>
        {findResults.map(student => (
          <div key={student._id} className={styles.studentCard}>
            <div className={styles.studentInfo}>
              <p><strong>ID:</strong> {student.studentId}</p>
              <p><strong>Name:</strong> {student.nameSurname}</p>
              <p><strong>Email:</strong> {student.email}</p>
              <p><strong>Department:</strong> {student.department}</p>
              {student.courses && student.courses.length > 0 && (
                <p>
                  <strong>Courses:</strong> {student.courses.join(', ')}
                </p>
              )}
            </div>
            <button 
              className={styles.deleteBtn}
              onClick={() => handleDeleteStudent(student._id)}
              disabled={isLoading}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    )}
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
      <button 
        type="submit" 
        className={styles.formSubmitBtn}
        disabled={isLoading}
      >
        Find Student to Edit
      </button>
    </form>
    
    {/* Display find results for editing */}
    {findResults && findResults.length > 0 && (
      <div className={styles.findResults}>
        <h3>Found Students:</h3>
        {findResults.map(student => (
          <div key={student._id} className={styles.studentCard}>
            <div className={styles.studentInfo}>
              <p><strong>ID:</strong> {student.studentId}</p>
              <p><strong>Name:</strong> {student.nameSurname}</p>
              <p><strong>Email:</strong> {student.email}</p>
              <p><strong>Department:</strong> {student.department}</p>
              {student.courses && student.courses.length > 0 && (
                <p>
                  <strong>Courses:</strong> {student.courses.join(', ')}
                </p>
              )}
            </div>
            <button 
              className={styles.editBtn}
              onClick={() => handleEditStudent(student)}
              disabled={isLoading}
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    )}
  </>
)}
          </div>
        </div>
      </div>

      {/* Course Selection Popup */}
      <CourseSelectionPopup 
        isOpen={isCoursePopupOpen}
        onClose={() => setIsCoursePopupOpen(false)}
        onSelectCourses={setSelectedCourses}
        selectedCourses={selectedCourses}
        department={department}
      />
    </div>
  );
};

export default AdminStudentManagement;