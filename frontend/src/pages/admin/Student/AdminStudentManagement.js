import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavBar from '../AdminNavBar';
import styles from './AdminStudentManagement.module.css';
import axios from 'axios';

// Define API URL with fallback for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

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
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

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

  // Clear form and status
  const clearForm = () => {
    setStudentId('');
    setNameSurname('');
    setEmail('');
    setDepartment('');
    setSelectedCourses([]);
    setSearchResults([]);
  };

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

  const handleViewChange = (view) => {
    setActiveView(view);
    clearForm();
    setError(null);
    setSuccess(null);
  };

  const validateForm = () => {
    if (activeView === 'add') {
      if (!studentId || !nameSurname || !email || !department) {
        setError('Please fill all required fields');
        return false;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        return false;
      }
    } else if (activeView === 'delete' || activeView === 'edit') {
      if (!studentId && !email) {
        setError('Please enter either ID or email to search');
        return false;
      }
    }
    
    return true;
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Handle different form submissions based on active view
      switch(activeView) {
        case 'add':
          const addResponse = await axios.post(`${API_URL}/api/admin/students`, {
            studentId,
            nameSurname,
            email,
            department,
            courses: selectedCourses
          });
          
          setSuccess(addResponse.data.message || 'Student added successfully');
          clearForm();
          break;
          
        case 'delete':
          // First find the student
          if (!studentId && !email) {
            setError('Please provide either ID or email to find student');
            setLoading(false);
            return;
          }
          
          let findParams = {};
          if (studentId) findParams.studentId = studentId;
          if (email) findParams.email = email;
          
          const findResponse = await axios.get(`${API_URL}/api/admin/students`, { params: findParams });
          
          if (findResponse.data.success && findResponse.data.data.length > 0) {
            setSearchResults(findResponse.data.data);
          } else {
            setError('No students found with the provided information');
          }
          break;
          
        case 'edit':
          // First find the student
          if (!studentId && !email) {
            setError('Please provide either ID or email to find student');
            setLoading(false);
            return;
          }
          
          let editFindParams = {};
          if (studentId) editFindParams.studentId = studentId;
          if (email) editFindParams.email = email;
          
          const editFindResponse = await axios.get(`${API_URL}/api/admin/students`, { params: editFindParams });
          
          if (editFindResponse.data.success && editFindResponse.data.data.length > 0) {
            setSearchResults(editFindResponse.data.data);
          } else {
            setError('No students found with the provided information');
          }
          break;
          
        default:
          break;
      }
    } catch (err) {
      console.error('Error:', err);
      if (err.response) {
        setError(err.response.data?.message || `Error ${err.response.status}: Request failed`);
      } else if (err.request) {
        setError('Server not responding. Please check your connection.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }
    
    if (selectedFile.type !== 'text/csv') {
      setError('Only CSV files are allowed');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await axios.post(
        `${API_URL}/api/admin/students/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setSuccess(response.data.message || `File uploaded successfully. ${response.data.studentsCreated} students created.`);
      setSelectedFile(null);
    } catch (err) {
      console.error('Error uploading file:', err);
      if (err.response) {
        setError(err.response.data?.message || `Error ${err.response.status}: Failed to upload file`);
      } else if (err.request) {
        setError('Server not responding. Please check your connection.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await axios.delete(`${API_URL}/api/admin/students/${id}`);
      
      setSuccess(response.data.message || 'Student deleted successfully');
      setSearchResults(searchResults.filter(student => student.id !== id));
      
      if (searchResults.length <= 1) {
        clearForm();
      }
    } catch (err) {
      console.error('Error deleting student:', err);
      if (err.response) {
        setError(err.response.data?.message || `Error ${err.response.status}: Failed to delete student`);
      } else if (err.request) {
        setError('Server not responding. Please check your connection.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = (student) => {
    setStudentId(student.studentId);
    setNameSurname(student.nameSurname);
    setEmail(student.email);
    setDepartment(student.department);
    setSelectedCourses(student.courses || []);
    
    setActiveView('add');
  };

  return (
    <div className={styles.studentManagement}>
      {/* Using the reusable AdminNavBar component */}
      <AdminNavBar />

      <div className={styles.mainContent}>
        {/* Status messages */}
        {error && (
          <div className={styles.errorMessage}>
            {error}
            <button onClick={() => setError(null)} className={styles.closeBtn}>×</button>
          </div>
        )}
        
        {success && (
          <div className={styles.successMessage}>
            {success}
            <button onClick={() => setSuccess(null)} className={styles.closeBtn}>×</button>
          </div>
        )}
        
        {/* Loading indicator */}
        {loading && (
          <div className={styles.loadingIndicator}>Loading...</div>
        )}
        
        {/* Left Panel */}
        <div className={styles.leftPanel}>
          <div className={styles.actionButtons}>
            <div 
              className={`${styles.actionButton} ${activeView === 'add' ? styles.active : ''}`} 
              onClick={() => handleViewChange('add')}
            >
              <div className={`${styles.circleIcon} ${activeView === 'add' ? styles.active : ''}`}>
                <span>+</span>
              </div>
              <span className={`${styles.buttonLabel} ${activeView === 'add' ? styles.active : ''}`}>Add Student</span>
            </div>
            
            <div 
              className={`${styles.actionButton} ${activeView === 'delete' ? styles.active : ''}`} 
              onClick={() => handleViewChange('delete')}
            >
              <div className={`${styles.circleIcon} ${activeView === 'delete' ? styles.active : ''}`}>
                <span>-</span>
              </div>
              <span className={`${styles.buttonLabel} ${activeView === 'delete' ? styles.active : ''}`}>Delete Student</span>
            </div>
            
            <div 
              className={`${styles.actionButton} ${activeView === 'edit' ? styles.active : ''}`} 
              onClick={() => handleViewChange('edit')}
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
                accept=".csv" 
                hidden 
                onChange={handleFileSelect}
              />
            </label>
            {selectedFile && <div className={styles.selectedFile}>{selectedFile.name}</div>}
            <button 
              className={styles.uploadFileBtn}
              onClick={handleFileUpload}
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Upload File'}
            </button>
            <div className={styles.uploadNote}>
              Note: CSV should contain columns for StudentID, NameSurname, Email, Department, and Courses (optional).
            </div>
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
                    <label>ID <span className={styles.requiredField}>*</span></label>
                    <input 
                      type="text" 
                      placeholder="Enter ID" 
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Name Surname <span className={styles.requiredField}>*</span></label>
                    <input 
                      type="text" 
                      placeholder="Enter name surname" 
                      value={nameSurname}
                      onChange={(e) => setNameSurname(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Mail <span className={styles.requiredField}>*</span></label>
                    <input 
                      type="email" 
                      placeholder="Enter mail" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Department <span className={styles.requiredField}>*</span></label>
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
                  <button 
                    type="submit" 
                    className={styles.formSubmitBtn}
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add Student'}
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
                    disabled={loading}
                  >
                    {loading ? 'Searching...' : 'Find Student to Delete'}
                  </button>
                </form>
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className={styles.searchResults}>
                    <h3>Search Results</h3>
                    <ul className={styles.resultsList}>
                      {searchResults.map(student => (
                        <li key={student.id} className={styles.resultItem}>
                          <div className={styles.resultInfo}>
                            <div><strong>ID:</strong> {student.studentId}</div>
                            <div><strong>Name:</strong> {student.nameSurname}</div>
                            <div><strong>Email:</strong> {student.email}</div>
                            <div><strong>Department:</strong> {student.department}</div>
                          </div>
                          <button 
                            onClick={() => handleDeleteStudent(student.id)}
                            className={styles.deleteBtn}
                          >
                            Delete
                          </button>
                        </li>
                      ))}
                    </ul>
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
                    disabled={loading}
                  >
                    {loading ? 'Searching...' : 'Find Student to Edit'}
                  </button>
                </form>
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className={styles.searchResults}>
                    <h3>Search Results</h3>
                    <ul className={styles.resultsList}>
                      {searchResults.map(student => (
                        <li key={student.id} className={styles.resultItem}>
                          <div className={styles.resultInfo}>
                            <div><strong>ID:</strong> {student.studentId}</div>
                            <div><strong>Name:</strong> {student.nameSurname}</div>
                            <div><strong>Email:</strong> {student.email}</div>
                            <div><strong>Department:</strong> {student.department}</div>
                          </div>
                          <button 
                            onClick={() => handleEditStudent(student)}
                            className={styles.editBtn}
                          >
                            Edit
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStudentManagement;