import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavBar from '../AdminNavBar';
import axios from 'axios';
import styles from './AdminCourseManagement.module.css';
import ErrorPopup from '../ErrorPopup';
import ConfirmationPopup from '../ConfirmationPopup';
import SelectUserPopup from './SelectUserPopup';

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
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [selectedTAs, setSelectedTAs] = useState([]); // Kept for Edit mode
  const [instructorCount, setInstructorCount] = useState(1);
  const [teachingAssistantNumber, setTeachingAssistantNumber] = useState(1); // Kept for Edit mode
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Popup states
  const [showInstructorPopup, setShowInstructorPopup] = useState(false);
  const [showTAPopup, setShowTAPopup] = useState(false); // Kept for Edit mode
  
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

  const fetchSemesters = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/semesters`);
      if (response.data.success) {
        setSemesters(response.data.data);
        if (response.data.data.length > 0) {
          const sortedSemesters = [...response.data.data].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          const activeSemester = sortedSemesters.find(sem => sem.isActive === true) || sortedSemesters[0];
          if (activeSemester) {
            setSelectedSemester(activeSemester.id);
          }
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
    setInstructorCount(1);
    setSelectedInstructors([]);
    setTeachingAssistantNumber(1); // Reset for edit mode
    setSelectedTAs([]); // Reset for edit mode
    setSelectedFile(null);
    setFoundCourse(null);
    setEditMode(false);
  };

  const handleOpenInstructorPopup = () => {
    if (!department) {
      setErrorMessage('Please select a department first');
      setShowError(true);
      return;
    }
    if (selectedInstructors.length > 0 && selectedInstructors.some(instructor => instructor.department !== department)) {
      setSelectedInstructors([]);
      setInstructorCount(1);
    }
    setShowInstructorPopup(true);
  };

  const handleCloseInstructorPopup = () => {
    setShowInstructorPopup(false);
  };

  const handleConfirmInstructorSelection = (instructors) => {
    setSelectedInstructors(instructors);
    setInstructorCount(instructors.length || 1); // Ensure count is at least 1 if instructors array is empty
    setShowInstructorPopup(false);
  };

  // TA Popup handlers are kept for Edit mode
  const handleOpenTAPopup = () => {
    if (!department) {
      setErrorMessage('Please select a department first');
      setShowError(true);
      return;
    }
    if (selectedTAs.length > 0 && selectedTAs.some(ta => ta.department !== department)) {
      setSelectedTAs([]);
      setTeachingAssistantNumber(1);
    }
    setShowTAPopup(true);
  };

  const handleCloseTAPopup = () => {
    setShowTAPopup(false);
  };

  const handleConfirmTASelection = (tas) => {
    setSelectedTAs(tas);
    setTeachingAssistantNumber(tas.length || 1); // Ensure count is at least 1 if TAs array is empty
    setShowTAPopup(false);
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
      const backendMessage = error.response?.data?.message;
      const backendError = error.response?.data?.error;
      setErrorMessage(backendError || backendMessage || 'An error occurred. Please try again.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (activeView === 'add' || (activeView === 'edit' && editMode)) {
      if (!department || !courseCode || !selectedSemester || selectedInstructors.length === 0) {
        setErrorMessage('Department, course code, semester, and at least one instructor are required.');
        setShowError(true);
        return false;
      }
      const invalidInstructors = selectedInstructors.filter(instructor => instructor.department !== department);
      // TA validation is only relevant for edit mode now
      const invalidTAs = activeView === 'edit' && editMode ? selectedTAs.filter(ta => ta.department !== department) : [];
      
      if (invalidInstructors.length > 0 || invalidTAs.length > 0) {
        setErrorMessage(`All instructors ${activeView === 'edit' && editMode ? 'and TAs ' : ''}must belong to the ${department} department.`);
        setShowError(true);
        return false;
      }
    } else if ((activeView === 'delete' || activeView === 'edit') && !editMode) {
      if (!selectedSemester || !department || !courseCode) {
        setErrorMessage('Semester, department, and course code are required to find a course.');
        setShowError(true);
        return false;
      }
    }
    return true;
  };

  const updateCourseAssociations = async (courseId, instructors, tas) => {
    try {
      await axios.put(`${API_URL}/api/admin/courses/${courseId}`, {
        instructorIds: instructors.map(instructor => instructor.id),
        taIds: tas.map(ta => ta.id) // This will be an empty array for new courses
      });
      return true;
    } catch (error) {
      console.error('Error updating course associations:', error);
      throw error;
    }
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
        const courseId = response.data.data.id;
        // For adding a new course, TAs are not assigned initially from the form.
        await updateCourseAssociations(
          courseId,
          selectedInstructors,
          [] // Pass an empty array for TAs
        );
        setSuccess('Course added successfully!');
        resetForm();
      }
    } catch (error) {
      console.error('Error adding course:', error);
      throw error;
    }
  };

  const findCourseToDelete = async () => {
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }
    try {
      const courseId = `${department}${courseCode}${selectedSemester}`.replace(/\s+/g, '');
      const response = await axios.get(`${API_URL}/api/admin/courses/${courseId}`);
      if (response.data.success) {
        setFoundCourse(response.data.data);
        setCourseToDelete(response.data.data);
        setShowConfirmation(true);
      }
    } catch (error) {
      console.error('Error finding course:', error);
      setErrorMessage('Course not found. Please check semester, department, and course code.');
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
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }
    try {
      const courseId = `${department}${courseCode}${selectedSemester}`.replace(/\s+/g, '');
      const response = await axios.get(`${API_URL}/api/admin/courses/${courseId}`);
      if (response.data.success) {
        const course = response.data.data;
        setFoundCourse(course);
        setDepartment(course.department);
        setCourseCode(course.courseCode);
        setCourseName(course.courseName);
        setCredit(course.credit);
        setIsGradCourse(course.isGradCourse);
        setSelectedSemester(course.semesterId);
        
        try {
          const instructorsResponse = await axios.get(`${API_URL}/api/admin/courses/${course.id}/instructors`);
          if (instructorsResponse.data.success && Array.isArray(instructorsResponse.data.data)) {
            const instructors = instructorsResponse.data.data.map(inst => ({ ...inst, department: inst.department || course.department }));
            setSelectedInstructors(instructors);
            setInstructorCount(instructors.length || 1);
          } else {
            setSelectedInstructors([]);
            setInstructorCount(1);
          }
        } catch (error) {
          console.error('Error fetching course instructors:', error);
          setSelectedInstructors([]);
          setInstructorCount(1);
        }
        
        try {
          const tasResponse = await axios.get(`${API_URL}/api/admin/courses/${course.id}/teaching-assistants`);
          if (tasResponse.data.success && Array.isArray(tasResponse.data.data)) {
            const tas = tasResponse.data.data.map(ta => ({ ...ta, department: ta.department || course.department }));
            setSelectedTAs(tas);
            setTeachingAssistantNumber(tas.length || 1);
          } else {
            setSelectedTAs([]);
            setTeachingAssistantNumber(1);
          }
        } catch (error) {
          console.error('Error fetching course TAs:', error);
          setSelectedTAs([]);
          setTeachingAssistantNumber(1);
        }
        setEditMode(true);
      }
    } catch (error) {
      console.error('Error finding course:', error);
      setErrorMessage('Course not found. Please check semester, department, and course code.');
      setShowError(true);
    } finally {
      setIsLoading(false);
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
        await updateCourseAssociations(
          foundCourse.id, 
          selectedInstructors, 
          selectedTAs // TAs are included for updates
        );
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
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      let response;
      if (activeView === 'add') {
        response = await axios.post(`${API_URL}/api/admin/courses/import`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess(response.data.message || `File uploaded successfully. ${response.data.coursesCreated} courses created, ${response.data.coursesFailed} failed.`);
      } else if (activeView === 'delete') {
        response = await axios.post(`${API_URL}/api/admin/courses/delete-by-csv`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess(response.data.message || `File processed. ${response.data.coursesDeleted} courses deleted, ${response.data.coursesFailed} failed.`);
      } else {
        setErrorMessage('Invalid action for file upload.');
        setShowError(true);
        setIsLoading(false);
        return;
      }
      setSelectedFile(null);
    } catch (error) {
      console.error(`Error uploading file for ${activeView}:`, error);
      setErrorMessage(error.response?.data?.message || `Failed to process file for ${activeView}`);
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.courseManagement}>
      <AdminNavBar />
      <div className={styles.mainContent}>
        <div className={styles.leftPanel}>
          <div className={styles.actionButtons}>
            <div 
              className={`${styles.actionButton} ${activeView === 'add' ? styles.active : ''}`} 
              onClick={() => setActiveView('add')}
            >
              <div className={`${styles.circleIcon} ${activeView === 'add' ? styles.active : ''}`}><span>+</span></div>
              <span className={`${styles.buttonLabel} ${activeView === 'add' ? styles.active : ''}`}>Add Course</span>
            </div>
            <div 
              className={`${styles.actionButton} ${activeView === 'delete' ? styles.active : ''}`} 
              onClick={() => setActiveView('delete')}
            >
              <div className={`${styles.circleIcon} ${activeView === 'delete' ? styles.active : ''}`}><span>-</span></div>
              <span className={`${styles.buttonLabel} ${activeView === 'delete' ? styles.active : ''}`}>Delete Course</span>
            </div>
            <div 
              className={`${styles.actionButton} ${activeView === 'edit' ? styles.active : ''}`} 
              onClick={() => setActiveView('edit')}
            >
              <div className={`${styles.circleIcon} ${activeView === 'edit' ? styles.active : ''}`}><span>✎</span></div>
              <span className={`${styles.buttonLabel} ${activeView === 'edit' ? styles.active : ''}`}>Edit Course</span>
            </div>
          </div>

          {(activeView === 'add' || activeView === 'delete') && (
            <div className={styles.fileUploadArea} onDragOver={handleDragOver} onDrop={handleDrop}>
              <div className={styles.uploadIcon}><img src="/upload-icon.png" alt="Upload" /></div>
              <div className={styles.uploadText}>Drag and Drop here</div>
              <div className={styles.uploadDivider}>or</div>
              <label className={styles.selectFileBtn}>
                Select file <input type="file" accept=".csv" hidden onChange={handleFileSelect}/>
              </label>
              {selectedFile && <div className={styles.selectedFile}>{selectedFile.name}</div>}
              <button className={styles.uploadFileBtn} onClick={handleFileUpload} disabled={isLoading || !selectedFile}>
                {isLoading ? 'Processing...' : (activeView === 'add' ? 'Upload to Add Courses' : 'Upload to Delete Courses')}
              </button>
              <div className={styles.uploadNote}>
                {activeView === 'add' ? (
                  <>
                    Note: CSV for ADDING should contain columns for CourseCode, Department, and SemesterId.
                    <br />
                    Optional columns: CourseName, Credit, IsGradCourse, StudentCount, InstructorNames (comma-separated). {/* REMOVED TaNames */}
                  </>
                ) : activeView === 'delete' ? (
                  <>
                    Note: CSV for DELETING should contain columns for CourseCode, Department, and SemesterId.
                    <br />
                    Each row will identify a course to be deleted.
                  </>
                ) : null }
              </div>
            </div>
          )}
        </div>

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
                          onClick={() => {
                            if (department !== dept.value) {
                              setDepartment(dept.value);
                              setSelectedInstructors([]);
                              setSelectedTAs([]); // Still clear for consistency if switching from edit
                              setInstructorCount(1);
                              setTeachingAssistantNumber(1); // Still clear for consistency
                            }
                          }}
                        >
                          {dept.label}<span className={styles.optionIndicator}></span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Course Code <span className={styles.requiredField}>*</span></label>
                    <input type="text" placeholder="Enter course code" value={courseCode} onChange={(e) => setCourseCode(e.target.value)}/>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Course Name</label>
                    <input type="text" placeholder="Enter course name (optional)" value={courseName} onChange={(e) => setCourseName(e.target.value)}/>
                    <div className={styles.helpText}>If not provided, generated from department and course code.</div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Credit</label>
                    <input type="number" min="1" max="6" value={credit} onChange={(e) => setCredit(parseInt(e.target.value))}/>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Semester <span className={styles.requiredField}>*</span></label>
                    <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className={styles.selectInput}>
                      <option value="">Select Semester</option>
                      {semesters && semesters.length > 0 ? (
                        semesters.map(semester => (
                          <option key={semester.id} value={semester.id}>
                            {semester.name || `${semester.year} ${semester.semesterType}`}
                            {semester.isActive ? ' (Active)' : ''}
                          </option>
                        ))
                      ) : <option value="" disabled>No semesters available</option>}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <div className={styles.checkboxGroup}>
                      <label>
                        <input type="checkbox" checked={isGradCourse} onChange={() => setIsGradCourse(!isGradCourse)}/>
                        <span>Graduate Course</span>
                      </label>
                      <span className={`${styles.optionIndicator} ${isGradCourse ? styles.selected : ''}`}></span>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Instructor(s) <span className={styles.requiredField}>*</span></label>
                    <div className={styles.taInputGroup}>
                      <input type="number" min="1" value={instructorCount} onChange={(e) => setInstructorCount(parseInt(e.target.value))} readOnly={selectedInstructors.length > 0}/>
                      <button type="button" className={`${styles.selectTaBtn} ${!department ? styles.disabled : ''}`} onClick={handleOpenInstructorPopup} disabled={!department}>
                        Select Instructor(s)
                      </button>
                    </div>
                    {selectedInstructors.length > 0 && (
                      <div className={styles.selectedAssistants}>
                        {selectedInstructors.map(instructor => (<div key={instructor.id} className={styles.assistantChip}>{instructor.name}</div>))}
                      </div>
                    )}
                  </div>
                  
                  {/* Teaching Assistant selection REMOVED for 'add' view */}

                  <button type="submit" className={styles.formSubmitBtn} disabled={isLoading}>
                    {isLoading ? 'Adding...' : 'Add Course'}
                  </button>
                </form>
              </>
            )}

            {activeView === 'delete' && (
              <>
                <h2 className={styles.formTitle}>Find Course to Delete</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className={styles.formGroup}>
                    <label>Semester <span className={styles.requiredField}>*</span></label>
                    <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className={styles.selectInput}>
                      <option value="">Select Semester</option>
                      {semesters && semesters.length > 0 ? (
                        semesters.map(semester => (
                          <option key={semester.id} value={semester.id}>
                            {semester.name || `${semester.year} ${semester.semesterType}`}
                            {semester.isActive ? ' (Active)' : ''}
                          </option>
                        ))
                      ) : <option value="" disabled>No semesters available</option>}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Department <span className={styles.requiredField}>*</span></label>
                    <div className={styles.departmentOptions}>
                      {departmentOptions.map((dept) => (
                        <div key={dept.value} className={`${styles.departmentOption} ${department === dept.value ? styles.selected : ''}`} onClick={() => setDepartment(dept.value)}>
                          {dept.label}<span className={styles.optionIndicator}></span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Course Code <span className={styles.requiredField}>*</span></label>
                    <input type="text" placeholder="Enter course code" value={courseCode} onChange={(e) => setCourseCode(e.target.value)}/>
                  </div>
                  <button type="submit" className={styles.formSubmitBtn} disabled={isLoading}>
                    {isLoading ? 'Finding...' : 'Find Course to Delete'}
                  </button>
                </form>
              </>
            )}

            {activeView === 'edit' && !editMode && (
              <>
                <h2 className={styles.formTitle}>Find Course to Edit</h2>
                <form onSubmit={handleFormSubmit}>
                   <div className={styles.formGroup}>
                    <label>Semester <span className={styles.requiredField}>*</span></label>
                    <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className={styles.selectInput}>
                      <option value="">Select Semester</option>
                      {semesters && semesters.length > 0 ? (
                        semesters.map(semester => (
                          <option key={semester.id} value={semester.id}>
                            {semester.name || `${semester.year} ${semester.semesterType}`}
                            {semester.isActive ? ' (Active)' : ''}
                          </option>
                        ))
                      ) : <option value="" disabled>No semesters available</option>}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Department <span className={styles.requiredField}>*</span></label>
                    <div className={styles.departmentOptions}>
                      {departmentOptions.map((dept) => (
                        <div key={dept.value} className={`${styles.departmentOption} ${department === dept.value ? styles.selected : ''}`} onClick={() => setDepartment(dept.value)}>
                          {dept.label}<span className={styles.optionIndicator}></span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Course Code <span className={styles.requiredField}>*</span></label>
                    <input type="text" placeholder="Enter course code" value={courseCode} onChange={(e) => setCourseCode(e.target.value)}/>
                  </div>
                  <button type="submit" className={styles.formSubmitBtn} disabled={isLoading}>
                    {isLoading ? 'Finding...' : 'Find Course to Edit'}
                  </button>
                </form>
              </>
            )}

            {activeView === 'edit' && editMode && (
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
                          onClick={() => {
                            if (department !== dept.value) {
                              setDepartment(dept.value);
                              setSelectedInstructors([]);
                              setSelectedTAs([]);
                              setInstructorCount(1);
                              setTeachingAssistantNumber(1);
                            }
                          }}
                        >
                          {dept.label}<span className={styles.optionIndicator}></span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Course Code <span className={styles.requiredField}>*</span></label>
                    <input type="text" placeholder="Enter course code" value={courseCode} onChange={(e) => setCourseCode(e.target.value)}
                    readOnly={editMode}
                    className={editMode ? styles.readOnlyInput : ''}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Course Name</label>
                    <input type="text" placeholder="Enter course name (optional)" value={courseName} onChange={(e) => setCourseName(e.target.value)}/>
                    <div className={styles.helpText}>If not provided, generated from department and course code.</div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Credit</label>
                    <input type="number" min="1" max="6" value={credit} onChange={(e) => setCredit(parseInt(e.target.value))}/>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Semester <span className={styles.requiredField}>*</span></label>
                    <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className={styles.selectInput}>
                      <option value="">Select Semester</option>
                      {semesters.map(semester => (
                        <option key={semester.id} value={semester.id}>
                          {semester.name || `${semester.year} ${semester.semesterType}`}
                          {semester.isActive ? ' (Active)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <div className={styles.checkboxGroup}>
                      <label>
                        <input type="checkbox" checked={isGradCourse} onChange={() => setIsGradCourse(!isGradCourse)}/>
                        <span>Graduate Course</span>
                      </label>
                      <span className={`${styles.optionIndicator} ${isGradCourse ? styles.selected : ''}`}></span>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Instructor(s) <span className={styles.requiredField}>*</span></label>
                    <div className={styles.taInputGroup}>
                      <input type="number" min="1" value={instructorCount} onChange={(e) => setInstructorCount(parseInt(e.target.value))} readOnly={selectedInstructors.length > 0}/>
                      <button type="button" className={`${styles.selectTaBtn} ${!department ? styles.disabled : ''}`} onClick={handleOpenInstructorPopup} disabled={!department}>
                        Select Instructor(s)
                      </button>
                    </div>
                    {selectedInstructors.length > 0 && (
                      <div className={styles.selectedAssistants}>
                        {selectedInstructors.map(instructor => (<div key={instructor.id} className={styles.assistantChip}>{instructor.name}</div>))}
                      </div>
                    )}
                  </div>
                  {/* TA selection is kept for Edit mode */}
                  <div className={styles.formGroup}>
                    <label>Teaching Assistant(s)</label>
                    <div className={styles.taInputGroup}>
                      <input type="number" min="1" value={teachingAssistantNumber} onChange={(e) => setTeachingAssistantNumber(parseInt(e.target.value))} readOnly={selectedTAs.length > 0}/>
                      <button type="button" className={`${styles.selectTaBtn} ${!department ? styles.disabled : ''}`} onClick={handleOpenTAPopup} disabled={!department}>
                        Select Teaching Assistant(s)
                      </button>
                    </div>
                    {selectedTAs.length > 0 && (
                      <div className={styles.selectedAssistants}>
                        {selectedTAs.map(ta => (<div key={ta.id} className={styles.assistantChip}>{ta.name}</div>))}
                      </div>
                    )}
                  </div>
                  <div className={styles.formButtonGroup}>
                    <button type="button" className={styles.cancelBtn} onClick={handleCancelEdit}>Cancel</button>
                    <button type="submit" className={styles.formSubmitBtn} disabled={isLoading}>
                      {isLoading ? 'Updating...' : 'Update Course'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

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

      {showInstructorPopup && (
        <SelectUserPopup
          title="Select Instructors"
          userType="instructor"
          maxSelections={instructorCount}
          selectedUsers={selectedInstructors}
          onCancel={handleCloseInstructorPopup}
          onConfirm={handleConfirmInstructorSelection}
          department={department}
        />
      )}

      {/* TA Popup is kept for Edit mode */}
      {showTAPopup && (
        <SelectUserPopup
          title="Select Teaching Assistants"
          userType="ta"
          maxSelections={teachingAssistantNumber}
          selectedUsers={selectedTAs}
          onCancel={handleCloseTAPopup}
          onConfirm={handleConfirmTASelection}
          department={department}
        />
      )}

      {showError && (
        <ErrorPopup message={errorMessage} onClose={() => setShowError(false)} />
      )}

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