import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavBar from '../AdminNavBar';
import ErrorPopup from '../ErrorPopup';
import ConfirmationPopup from '../ConfirmationPopup';
import styles from './AdminSemesterManagement.module.css';
import axios from 'axios';

// Define API URL with fallback for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const AdminSemesterManagement = () => {
  const navigate = useNavigate();
  
  // Active action state
  const [activeAction, setActiveAction] = useState('add'); // 'add', 'delete', 'edit'
  
  // Form states
  const [semesterYear, setSemesterYear] = useState('');
  const [term, setTerm] = useState('');
  
  // Upload states - now with 4 files
  const [offeringsFile, setOfferingsFile] = useState(null);
  const [studentsFile, setStudentsFile] = useState(null);
  const [assistantsFile, setAssistantsFile] = useState(null);
  const [coursesFile, setCoursesFile] = useState(null);

  // Status states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Confirmation states
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);

  // Upload order tracking - to ensure courses are uploaded before offerings
  const [uploadStage, setUploadStage] = useState(null); // null, 'courses', 'offerings', 'students', 'tas', 'complete'
  const [uploadResults, setUploadResults] = useState([]);
  const [semesterId, setSemesterId] = useState(null);

  // Term options
  const termOptions = [
    { label: 'Fall', value: 'FALL' },
    { label: 'Spring', value: 'SPRING' },
    { label: 'Summer', value: 'SUMMER' }
  ];

  // For Edit and Delete - store the semester ID
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);

  useEffect(() => {
    // Reset form when action changes
    resetForm();
  }, [activeAction]);
  
  // Auto-close success notification
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [success]);

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
        case 'courses':
          setCoursesFile(file);
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
        case 'courses':
          setCoursesFile(file);
          break;
        default:
          break;
      }
    }
  };

  const validateForm = () => {
    if (!semesterYear || !term) {
      setErrorMessage('Please enter both year and term');
      setShowError(true);
      return false;
    }

    // Validate year is a 4-digit number
    if (!/^\d{4}$/.test(semesterYear)) {
      setErrorMessage('Year must be a 4-digit number');
      setShowError(true);
      return false;
    }

    return true;
  };

  // Sequential upload function to handle files in the correct order
  const processUploadsSequentially = async (semId) => {
    try {
      setUploadStage('courses');
      setUploadResults([]);
      const sid = semId || selectedSemesterId;
      
      if (!sid) {
        throw new Error('No semester ID available');
      }
      
      // Step 1: Process courses first (if available)
      if (coursesFile) {
        const coursesResult = await uploadFile(sid, 'courses', coursesFile);
        setUploadResults(prev => [...prev, `Courses: ${coursesResult.coursesCreated} created, ${coursesResult.coursesFailed} failed`]);
        
        // Log instructor assignments if available
        if (coursesResult.instructorAssignments && coursesResult.instructorAssignments.length > 0) {
          setUploadResults(prev => [...prev, `Instructor assignments: ${coursesResult.instructorAssignments.length} created`]);
        }
      }
      
      // Step 2: Process offerings after courses
      setUploadStage('offerings');
      if (offeringsFile) {
        const offeringsResult = await uploadFile(sid, 'offerings', offeringsFile);
        setUploadResults(prev => [...prev, `Offerings: ${offeringsResult.offeringsCreated} created, ${offeringsResult.offeringsFailed} failed`]);
      }
      
      // Step 3: Process students
      setUploadStage('students');
      if (studentsFile) {
        const studentsResult = await uploadFile(sid, 'students', studentsFile);
        setUploadResults(prev => [...prev, `Students: ${studentsResult.enrollmentsCreated} enrolled, ${studentsResult.enrollmentsFailed} failed`]);
      }
      
      // Step 4: Process TAs
      setUploadStage('tas');
      if (assistantsFile) {
        const tasResult = await uploadFile(sid, 'assistants', assistantsFile);
        setUploadResults(prev => [...prev, `Teaching Assistants: ${tasResult.assignmentsCreated} assigned, ${tasResult.assignmentsFailed} failed`]);
      }
      
      setUploadStage('complete');
      return true;
    } catch (error) {
      console.error('Error in sequential upload:', error);
      setErrorMessage(`Upload failed: ${error.message || 'Unknown error'}`);
      setShowError(true);
      setUploadStage(null);
      return false;
    }
  };

  const uploadFile = async (semesterId, fileType, file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);

    try {
      let endpoint;
      switch(fileType) {
        case 'offerings':
          endpoint = `${API_URL}/api/admin/semesters/${semesterId}/offerings/upload`;
          break;
        case 'students':
          endpoint = `${API_URL}/api/admin/semesters/${semesterId}/students/upload`;
          break;
        case 'assistants':
          endpoint = `${API_URL}/api/admin/semesters/${semesterId}/tas/upload`;
          break;
        case 'courses':
          endpoint = `${API_URL}/api/admin/semesters/${semesterId}/courses/upload`;
          break;
        default:
          throw new Error(`Unknown file type: ${fileType}`);
      }

      console.log(`Uploading ${fileType} file to ${endpoint}`);
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log(`${fileType} upload response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error uploading ${fileType} file:`, error);
      const errorMsg = error.response?.data?.message || error.message || `Error uploading ${fileType}`;
      throw new Error(errorMsg);
    }
  };

  const handleAddSemester = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Create the semester
      const semesterData = {
        year: semesterYear,
        semesterType: term
      };
      
      const semesterResponse = await axios.post(`${API_URL}/api/admin/semesters`, semesterData);
      const newSemesterId = semesterResponse.data.data.id;
      
      setSemesterId(newSemesterId);
      
      // Process uploads in sequence
      await processUploadsSequentially(newSemesterId);
      
      // Set success message
      const termLabel = termOptions.find(t => t.value === term)?.label || term;
      let successMessage = `Semester ${semesterYear} ${termLabel} created successfully.`;
      
      if (uploadResults.length > 0) {
        successMessage += ' ' + uploadResults.join('. ');
      }
      
      setSuccess(successMessage);
      
      // Reset form after successful creation
      resetForm();
      
    } catch (error) {
      console.error('Error creating semester:', error);
      
      if (error.response) {
        setErrorMessage(error.response.data?.message || `Error ${error.response.status}: Failed to create semester`);
      } else if (error.request) {
        setErrorMessage('Server not responding. Please check your connection.');
      } else {
        setErrorMessage(`Error: ${error.message}`);
      }
      
      setShowError(true);
    } finally {
      setLoading(false);
      setUploadStage(null);
    }
  };

  const handleFindSemester = async () => {
    if (!semesterYear || !term) {
      setErrorMessage('Please enter both year and term to find a semester');
      setShowError(true);
      return;
    }
    
    setLoading(true);
    
    try {
      // Generate semester ID from year and term
      const semesterId = `${semesterYear}${term}`;
      
      // Fetch semester data
      const response = await axios.get(`${API_URL}/api/admin/semesters/${semesterId}`);
      
      if (response.data && response.data.success) {
        setSelectedSemesterId(semesterId);
        
        // If in delete mode, prepare confirmation data
        if (activeAction === 'delete') {
          setConfirmationData({
            id: semesterId,
            year: semesterYear,
            term: termOptions.find(t => t.value === term)?.label || term
          });
        }
        
        // Show success notification
        setSuccess(`Found semester ${semesterYear} ${termOptions.find(t => t.value === term)?.label || term}`);
      } else {
        throw new Error('Semester not found');
      }
    } catch (error) {
      console.error('Error finding semester:', error);
      
      let errorMsg = 'Failed to find semester';
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMsg = `Semester ${semesterYear} ${termOptions.find(t => t.value === term)?.label || term} not found`;
        } else {
          errorMsg = error.response.data?.message || `Error ${error.response.status}: ${errorMsg}`;
        }
      } else if (error.request) {
        errorMsg = 'Server not responding. Please check your connection.';
      } else {
        errorMsg = error.message || errorMsg;
      }
      
      setErrorMessage(errorMsg);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirmation = () => {
    if (!selectedSemesterId) {
      setErrorMessage('No semester selected for deletion');
      setShowError(true);
      return;
    }
    
    setShowConfirmation(true);
  };

  const handleDeleteSemester = async () => {
    if (!selectedSemesterId) {
      setErrorMessage('No semester selected for deletion');
      setShowError(true);
      return;
    }
    
    setLoading(true);
    setShowConfirmation(false);
    
    try {
      const response = await axios.delete(`${API_URL}/api/admin/semesters/${selectedSemesterId}`);
      
      if (response.data && response.data.success) {
        // Show success notification
        setSuccess(`Semester ${semesterYear} ${termOptions.find(t => t.value === term)?.label || term} deleted successfully`);
        
        // Reset form
        resetForm();
      } else {
        throw new Error('Failed to delete semester');
      }
    } catch (error) {
      console.error('Error deleting semester:', error);
      
      let errorMsg = 'Failed to delete semester';
      
      if (error.response) {
        errorMsg = error.response.data?.message || `Error ${error.response.status}: ${errorMsg}`;
      } else if (error.request) {
        errorMsg = 'Server not responding. Please check your connection.';
      } else {
        errorMsg = error.message || errorMsg;
      }
      
      setErrorMessage(errorMsg);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSemester = async () => {
    if (!selectedSemesterId) {
      setErrorMessage('Please find a semester first');
      setShowError(true);
      return;
    }
    
    setLoading(true);
    
    try {
      // Process uploads in sequence
      await processUploadsSequentially();
      
      // Set success message
      let successMessage = `Semester ${semesterYear} ${termOptions.find(t => t.value === term)?.label || term} updated successfully.`;
      
      if (uploadResults.length > 0) {
        successMessage += ' ' + uploadResults.join('. ');
      }
      
      setSuccess(successMessage);
      
      // Reset form
      resetForm();
      
    } catch (error) {
      console.error('Error updating semester:', error);
      
      let errorMsg = 'Failed to update semester';
      
      if (error.response) {
        errorMsg = error.response.data?.message || `Error ${error.response.status}: ${errorMsg}`;
      } else if (error.request) {
        errorMsg = 'Server not responding. Please check your connection.';
      } else {
        errorMsg = error.message || errorMsg;
      }
      
      setErrorMessage(errorMsg);
      setShowError(true);
    } finally {
      setLoading(false);
      setUploadStage(null);
    }
  };

  const resetForm = () => {
    setSemesterYear('');
    setTerm('');
    setOfferingsFile(null);
    setStudentsFile(null);
    setAssistantsFile(null);
    setCoursesFile(null);
    setSelectedSemesterId(null);
    setSuccess(null);
    setUploadResults([]);
    setUploadStage(null);
  };

  // Get the form title based on active action
  const getFormTitle = () => {
    switch (activeAction) {
      case 'add':
        return 'Enter Semester Information';
      case 'delete':
        return 'Find Semester to Delete';
      case 'edit':
        return 'Find Semester to Edit';
      default:
        return '';
    }
  };

  // Get action button text
  const getActionButtonText = () => {
    if (loading) {
      if (uploadStage) {
        return `Processing ${uploadStage}...`;
      }
      return 'Processing...';
    }
    
    switch (activeAction) {
      case 'add':
        return 'Add Semester';
      case 'delete':
        return selectedSemesterId ? 'Delete Semester' : 'Find Semester';
      case 'edit':
        return selectedSemesterId ? 'Update Semester' : 'Find Semester';
      default:
        return '';
    }
  };

  // Handle action button click
  const handleActionButtonClick = () => {
    switch (activeAction) {
      case 'add':
        handleAddSemester();
        break;
      case 'delete':
        if (selectedSemesterId) {
          handleDeleteConfirmation();
        } else {
          handleFindSemester();
        }
        break;
      case 'edit':
        if (selectedSemesterId) {
          handleEditSemester();
        } else {
          handleFindSemester();
        }
        break;
      default:
        break;
    }
  };

// Render upload section
  const renderUploadBox = (fileType, file, title, note) => {
    return (
      <div className={styles.uploadBox}>
        <h3 className={styles.uploadTitle}>{title}</h3>
        <div 
          className={styles.uploadArea}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(fileType, e)}
        >
          <img src="/upload-icon.png" alt="Upload" className={styles.uploadIcon} />
          <div className={styles.uploadText}>Drag and Drop here</div>
          <div className={styles.uploadDivider}>or</div>
          <label className={styles.selectFileBtn}>
            Select file
            <input 
              type="file" 
              accept=".csv" 
              hidden 
              onChange={(e) => handleFileSelect(fileType, e)}
            />
          </label>
          {file && <div className={styles.selectedFile}>{file.name}</div>}
        </div>
        <div className={styles.uploadNote}>
          {note}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.semesterManagement}>
      <AdminNavBar />

      <div className={styles.semesterContent}>
        <div className={styles.twoColumnLayout}>
          {/* Left Column - Action Buttons and Form */}
          <div className={styles.leftColumn}>
            {/* Action Buttons */}
            <div className={styles.actionButtons}>
              <div 
                className={`${styles.actionBtn} ${activeAction === 'add' ? styles.active : ''}`}
                onClick={() => setActiveAction('add')}
              >
                <div className={styles.iconCircle}>
                  <span className={styles.icon}>+</span>
                </div>
                <span className={styles.actionLabel}>Add Semester</span>
              </div>
              
              <div 
                className={`${styles.actionBtn} ${activeAction === 'delete' ? styles.active : ''}`}
                onClick={() => setActiveAction('delete')}
              >
                <div className={styles.iconCircle}>
                  <span className={styles.icon}>-</span>
                </div>
                <span className={styles.actionLabel}>Delete Semester</span>
              </div>
              
              <div 
                className={`${styles.actionBtn} ${activeAction === 'edit' ? styles.active : ''}`}
                onClick={() => setActiveAction('edit')}
              >
                <div className={styles.iconCircle}>
                  <span className={styles.icon}>✎</span>
                </div>
                <span className={styles.actionLabel}>Edit Semester</span>
              </div>
            </div>

            {/* Form Card */}
            <div className={styles.formCard}>
              <h2 className={styles.formTitle}>{getFormTitle()}</h2>
              
              {/* Year and Term Selection */}
              <div className={styles.formFields}>
                <div className={styles.formGroup}>
                  <label>Year</label>
                  <input 
                    type="text" 
                    placeholder="Enter semester year (e.g. 2025)" 
                    value={semesterYear}
                    onChange={(e) => setSemesterYear(e.target.value)}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Term</label>
                  <div className={styles.termOptions}>
                    {termOptions.map((termOption) => (
                      <div 
                        key={termOption.value} 
                        className={styles.termOption}
                        onClick={() => setTerm(termOption.value)}
                      >
                        {termOption.label}
                        <span className={`${styles.radioIndicator} ${term === termOption.value ? styles.selected : ''}`}></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Upload Progress Indicator */}
              {uploadStage && (
                <div className={styles.uploadProgress}>
                  <div className={styles.progressTitle}>Upload Progress:</div>
                  <div className={styles.progressSteps}>
                    <div className={`${styles.progressStep} ${uploadStage === 'courses' || uploadStage === 'offerings' || uploadStage === 'students' || uploadStage === 'tas' || uploadStage === 'complete' ? styles.active : ''}`}>
                      Courses
                    </div>
                    <div className={`${styles.progressStep} ${uploadStage === 'offerings' || uploadStage === 'students' || uploadStage === 'tas' || uploadStage === 'complete' ? styles.active : ''}`}>
                      Offerings
                    </div>
                    <div className={`${styles.progressStep} ${uploadStage === 'students' || uploadStage === 'tas' || uploadStage === 'complete' ? styles.active : ''}`}>
                      Students
                    </div>
                    <div className={`${styles.progressStep} ${uploadStage === 'tas' || uploadStage === 'complete' ? styles.active : ''}`}>
                      TAs
                    </div>
                    <div className={`${styles.progressStep} ${uploadStage === 'complete' ? styles.active : ''}`}>
                      Complete
                    </div>
                  </div>
                </div>
              )}
              
              {/* Action Buttons - Consistently placed under the form for all modes */}
              <div className={styles.formActions}>
                <button 
                  className={activeAction === 'delete' && selectedSemesterId ? styles.deleteButton : styles.actionButton}
                  onClick={handleActionButtonClick}
                  disabled={loading}
                >
                  {getActionButtonText()}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Upload Areas in 2x2 grid - Only shown for Add or Edit mode */}
          {activeAction !== 'delete' && (
            <div className={styles.rightColumn}>
              <h2 className={styles.uploadSectionTitle}>Upload Files</h2>
              
              {/* Display warning if offerings file is selected but no courses file */}
              {offeringsFile && !coursesFile && activeAction === 'add' && (
                <div className={styles.warningBox}>
                  <b>Warning:</b> It's recommended to upload course catalog first before offerings.
                  Offerings reference courses by ID and will fail if the courses don't exist.
                </div>
              )}
              
              <div className={styles.uploadGrid}>
                {renderUploadBox(
                  'courses', 
                  coursesFile, 
                  'Course Catalog',
                  'CSV should contain: CourseCode, Department, CourseName, Credit, IsGradCourse, Instructor (Required: CourseCode & Department)'
                )}
                {renderUploadBox(
                  'offerings', 
                  offeringsFile, 
                  'Course Offerings',
                  'CSV should contain: courseId, sectionNumber, day, startTime, endTime (Required: courseId & sectionNumber)'
                )}
                {renderUploadBox(
                  'assistants', 
                  assistantsFile, 
                  'Teaching Assistants',
                  'CSV should contain: TAId, OffferingId'
                )}
                {renderUploadBox(
                  'students', 
                  studentsFile, 
                  'Student Enrollments',
                  'CSV should contain: StudentId, Name, Email, CourseId, Section'
                )}

              </div>
            </div>
          )}
        </div>

        {/* Confirmation Popup for Delete */}
        {showConfirmation && (
          <ConfirmationPopup
            semester={confirmationData}
            title="Confirm Semester Deletion"
            message="Are you sure you want to delete this semester? This will remove all associated offerings, enrollments, and TA assignments. This action cannot be undone."
            confirmText="Delete Semester"
            onCancel={() => setShowConfirmation(false)}
            onConfirm={handleDeleteSemester}
            confirmButtonClass={styles.dangerButton}
          />
        )}

        {/* Error Popup */}
        {showError && (
          <ErrorPopup
            message={errorMessage}
            onClose={() => setShowError(false)}
          />
        )}

        {/* Banner Success Notification */}
        {success && (
          <div className={styles.bannerNotification}>
            <div>{success}</div>
            <button className={styles.closeNotificationBtn} onClick={() => setSuccess(null)}>×</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSemesterManagement;