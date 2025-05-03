import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavBar from '../AdminNavBar';
import axios from 'axios';
import styles from './AdminCourseManagement.module.css';
import ErrorPopup from '../ErrorPopup';
import ConfirmationPopup from '../ConfirmationPopup';

// Define API URL with fallback for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const AdminCourseManagement = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('add'); // 'add', 'delete', 'edit'
  
  // Form states
  const [department, setDepartment] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [credit, setCredit] = useState(3);
  const [isGradCourse, setIsGradCourse] = useState(false);
  const [teachingAssistantNumber, setTeachingAssistantNumber] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(null);
  const [foundCourse, setFoundCourse] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Department options
  const departmentOptions = [
    { label: 'CS', value: 'CS' },
    { label: 'EEE', value: 'EEE' },
    { label: 'IE', value: 'IE' },
    { label: 'ME', value: 'ME' }
  ];

  // Fetch semesters when component mounts
  useEffect(() => {
    fetchSemesters();
  }, []);

  // Reset form when active view changes
  useEffect(() => {
    resetForm();
  }, [activeView]);

  // Fetch semesters from backend
  const fetchSemesters = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/semesters`);
      if (response.data.success) {
        setSemesters(response.data.data);
        // Set the active semester as default if available
        const activeSemester = response.data.data.find(sem => sem.isActive);
        if (activeSemester) {
          setSelectedSemester(activeSemester.id);
        }
      }
    } catch (error) {
      console.error('Error fetching semesters:', error);
      setErrorMessage('Failed to fetch semesters. Please try again.');
      setShowError(true);
    }
  };

  const resetForm = () => {
    setDepartment('');
    setCourseCode('');
    setCourseName('');
    setCredit(3);
    setIsGradCourse(false);
    setTeachingAssistantNumber(1);
    setSelectedFile(null);
    setFoundCourse(null);
    setEditMode(false);
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

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      // Handle different form submissions based on active view
      switch(activeView) {
        case 'add':
          await addCourse();
          break;
        case 'delete':
          await findCourseToDelete();
          break;
        case 'edit':
          if (editMode && foundCourse) {
            await updateCourse();
          } else {
            await findCourseToEdit();
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error in ${activeView} course:`, error);
      setErrorMessage(error.response?.data?.message || 'An error occurred. Please try again.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (activeView === 'add' || (activeView === 'edit' && editMode)) {
      if (!department || !courseCode || !selectedSemester) {
        setErrorMessage('Department, course code, and semester are required.');
        setShowError(true);
        return false;
      }
    } else if ((activeView === 'delete' || activeView === 'edit') && !courseCode) {
      setErrorMessage('Course code is required to find a course.');
      setShowError(true);
      return false;
    }
    
    return true;
  };

  const addCourse = async () => {
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const courseData = {
        department,
        courseCode,
        courseName: courseName || `${department}${courseCode}`,
        credit,
        isGradCourse,
        semesterId: selectedSemester
      };

      const response = await axios.post(`${API_URL}/api/admin/courses`, courseData);
      
      if (response.data.success) {
        setSuccess('Course added successfully!');
        resetForm();
      }
    } catch (error) {
      console.error('Error adding course:', error);
      throw error;
    }
  };

  const findCourseToDelete = async () => {
    if (!courseCode) {
      setErrorMessage('Course code is required to find a course.');
      setShowError(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/admin/courses/code/${courseCode}`);
      
      if (response.data.success) {
        setFoundCourse(response.data.data);
        setCourseToDelete(response.data.data);
        setShowConfirmation(true);
      }
    } catch (error) {
      console.error('Error finding course:', error);
      setErrorMessage('Course not found with the provided code.');
      setShowError(true);
    }
  };

  const handleDeleteConfirm = async () => {
    setShowConfirmation(false);
    setIsLoading(true);
    
    try {
      const response = await axios.delete(`${API_URL}/api/admin/courses/${courseToDelete.id}`);
      
      if (response.data.success) {
        setSuccess('Course deleted successfully!');
        resetForm();
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to delete course.');
      setShowError(true);
    } finally {
      setIsLoading(false);
      setCourseToDelete(null);
    }
  };

  const findCourseToEdit = async () => {
    if (!courseCode) {
      setErrorMessage('Course code is required to find a course.');
      setShowError(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/admin/courses/code/${courseCode}`);
      
      if (response.data.success) {
        const course = response.data.data;
        setFoundCourse(course);
        
        // Populate form with course data
        setDepartment(course.department);
        setCourseCode(course.courseCode);
        setCourseName(course.courseName);
        setCredit(course.credit);
        setIsGradCourse(course.isGradCourse);
        setSelectedSemester(course.semesterId);
        setEditMode(true);
      }
    } catch (error) {
      console.error('Error finding course:', error);
      setErrorMessage('Course not found with the provided code.');
      setShowError(true);
    }
  };

  const updateCourse = async () => {
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const courseData = {
        department,
        courseCode,
        courseName: courseName || `${department}${courseCode}`,
        credit,
        isGradCourse,
        semesterId: selectedSemester
      };

      const response = await axios.put(`${API_URL}/api/admin/courses/${foundCourse.id}`, courseData);
      
      if (response.data.success) {
        setSuccess('Course updated successfully!');
        resetForm();
      }
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a file first');
      setShowError(true);
      return;
    }
    
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setErrorMessage('Only CSV files are allowed');
      setShowError(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await axios.post(`${API_URL}/api/admin/courses/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess(response.data.message || `File uploaded successfully. ${response.data.success} courses created.`);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to upload file');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // We'll simply use the number input for teaching assistants
  // without showing a popup for selecting specific TAs

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
                accept=".csv"
                hidden 
                onChange={handleFileSelect}
              />
            </label>
            {selectedFile && <div className={styles.selectedFile}>{selectedFile.name}</div>}
            <button 
              className={styles.uploadFileBtn}
              onClick={handleFileUpload}
              disabled={isLoading}
            >
              {isLoading ? 'Uploading...' : 'Upload File'}
            </button>
            <div className={styles.uploadNote}>
              Note: CSV should contain columns for CourseCode, Department, and SemesterId.
              <br />
              Optional columns: CourseName, Credit, IsGradCourse, StudentCount.
            </div>
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
                    <label>Department <span className={styles.requiredField}>*</span></label>
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
                    <label>Course Code <span className={styles.requiredField}>*</span></label>
                    <input 
                      type="text" 
                      placeholder="Enter course code" 
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Course Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter course name (optional)" 
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                    />
                    <div className={styles.helpText}>
                      If not provided, it will be generated from department and course code.
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Credit</label>
                    <input 
                      type="number" 
                      min="1"
                      max="6"
                      value={credit}
                      onChange={(e) => setCredit(parseInt(e.target.value))}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Semester <span className={styles.requiredField}>*</span></label>
                    <select 
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(e.target.value)}
                      className={styles.selectInput}
                    >
                      <option value="">Select Semester</option>
                      {semesters.map(semester => (
                        <option key={semester.id} value={semester.id}>
                          {semester.name} {semester.isActive ? '(Active)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <div className={styles.checkboxGroup}>
                      <label>
                        <input 
                          type="checkbox" 
                          checked={isGradCourse}
                          onChange={() => setIsGradCourse(!isGradCourse)}
                        />
                        <span>Graduate Course</span>
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
                      />
                    </div>
                    <div className={styles.helpText}>
                      Number of teaching assistants needed for this course.
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    className={styles.formSubmitBtn}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Adding...' : 'Add Course'}
                  </button>
                </form>
              </>
            )}

            {activeView === 'delete' && (
              <>
                <h2 className={styles.formTitle}>Enter Course Code to find Course</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className={styles.formGroup}>
                    <label>Course Code <span className={styles.requiredField}>*</span></label>
                    <input 
                      type="text" 
                      placeholder="Enter course code" 
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className={styles.formSubmitBtn}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Finding...' : 'Find Course to Delete'}
                  </button>
                </form>
                
                {/* Found Course */}
                {foundCourse && !showConfirmation && (
                  <div className={styles.foundCourseContainer}>
                    <h3>Found Course</h3>
                    <div className={styles.foundCourseDetails}>
                      <p><strong>Course Code:</strong> {foundCourse.courseCode}</p>
                      <p><strong>Course Name:</strong> {foundCourse.courseName}</p>
                      <p><strong>Department:</strong> {foundCourse.department}</p>
                      <p><strong>Credit:</strong> {foundCourse.credit}</p>
                      <p><strong>Type:</strong> {foundCourse.isGradCourse ? 'Graduate' : 'Undergraduate'}</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeView === 'edit' && (
              <>
                {!editMode ? (
                  // Search form
                  <>
                    <h2 className={styles.formTitle}>Enter Course Code to find Course</h2>
                    <form onSubmit={handleFormSubmit}>
                      <div className={styles.formGroup}>
                        <label>Course Code <span className={styles.requiredField}>*</span></label>
                        <input 
                          type="text" 
                          placeholder="Enter course code" 
                          value={courseCode}
                          onChange={(e) => setCourseCode(e.target.value)}
                        />
                      </div>
                      <button 
                        type="submit" 
                        className={styles.formSubmitBtn}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Finding...' : 'Find Course to Edit'}
                      </button>
                    </form>
                  </>
                ) : (
                  // Edit form - similar to add form but with populated values
                  <>
                    <h2 className={styles.formTitle}>Edit Course Information</h2>
                    <form onSubmit={handleFormSubmit}>
                      <div className={styles.formGroup}>
                        <label>Department <span className={styles.requiredField}>*</span></label>
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
                        <label>Course Code <span className={styles.requiredField}>*</span></label>
                        <input 
                          type="text" 
                          placeholder="Enter course code" 
                          value={courseCode}
                          onChange={(e) => setCourseCode(e.target.value)}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Course Name</label>
                        <input 
                          type="text" 
                          placeholder="Enter course name (optional)" 
                          value={courseName}
                          onChange={(e) => setCourseName(e.target.value)}
                        />
                        <div className={styles.helpText}>
                          If not provided, it will be generated from department and course code.
                        </div>
                      </div>
                      <div className={styles.formGroup}>
                        <label>Credit</label>
                        <input 
                          type="number" 
                          min="1"
                          max="6"
                          value={credit}
                          onChange={(e) => setCredit(parseInt(e.target.value))}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Semester <span className={styles.requiredField}>*</span></label>
                        <select 
                          value={selectedSemester}
                          onChange={(e) => setSelectedSemester(e.target.value)}
                          className={styles.selectInput}
                        >
                          <option value="">Select Semester</option>
                          {semesters.map(semester => (
                            <option key={semester.id} value={semester.id}>
                              {semester.name} {semester.isActive ? '(Active)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <div className={styles.checkboxGroup}>
                          <label>
                            <input 
                              type="checkbox" 
                              checked={isGradCourse}
                              onChange={() => setIsGradCourse(!isGradCourse)}
                            />
                            <span>Graduate Course</span>
                          </label>
                          <span className={`${styles.optionIndicator} ${isGradCourse ? styles.selected : ''}`}></span>
                        </div>
                      </div>
                      <div className={styles.formButtonGroup}>
                        <button 
                          type="button" 
                          className={styles.cancelBtn}
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className={styles.formSubmitBtn}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Updating...' : 'Update Course'}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Popup for Delete */}
      {showConfirmation && (
        <ConfirmationPopup
          title="Confirm Course Deletion"
          message={`Are you sure you want to delete the course "${courseToDelete?.courseName}" (${courseToDelete?.courseCode})? This action cannot be undone.`}
          confirmText="Delete Course"
          onCancel={() => setShowConfirmation(false)}
          onConfirm={handleDeleteConfirm}
          confirmButtonClass={styles.dangerButton}
        />
      )}

      {/* We removed the TA popup component */}

      {/* Error Popup */}
      {showError && (
        <ErrorPopup
          message={errorMessage}
          onClose={() => setShowError(false)}
        />
      )}

      {/* Success Message */}
      {success && (
        <div className={styles.successMessage}>
          {success}
          <button onClick={() => setSuccess(null)} className={styles.closeBtn}>×</button>
        </div>
      )}
    </div>
  );
};

export default AdminCourseManagement;