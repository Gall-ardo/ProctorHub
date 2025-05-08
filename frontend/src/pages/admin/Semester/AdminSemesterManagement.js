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
  
  // Upload states
  const [offeringsFile, setOfferingsFile] = useState(null);
  const [studentsFile, setStudentsFile] = useState(null);
  const [assistantsFile, setAssistantsFile] = useState(null);

  // Status states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Confirmation states
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);

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
        default:
          throw new Error(`Unknown file type: ${fileType}`);
      }

      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      console.error(`Error uploading ${fileType} file:`, error);
      throw error;
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
      
      console.log('Creating semester:', semesterData);
      
      const semesterResponse = await axios.post(`${API_URL}/api/admin/semesters`, semesterData);
      
      const semesterId = semesterResponse.data.data.id;
      console.log('Semester created with ID:', semesterId);
      
      // Now upload files if they exist
      const uploadResults = [];
      
      if (offeringsFile) {
        try {
          const offeringsResult = await uploadFile(semesterId, 'offerings', offeringsFile);
          uploadResults.push(`Offerings: ${offeringsResult.offeringsCreated} created, ${offeringsResult.offeringsFailed} failed`);
        } catch (error) {
          uploadResults.push(`Offerings upload error: ${error.response?.data?.message || error.message}`);
        }
      }
      
      if (studentsFile) {
        try {
          const studentsResult = await uploadFile(semesterId, 'students', studentsFile);
          uploadResults.push(`Students: ${studentsResult.enrollmentsCreated} enrolled, ${studentsResult.enrollmentsFailed} failed`);
        } catch (error) {
          uploadResults.push(`Students upload error: ${error.response?.data?.message || error.message}`);
        }
      }
      
      if (assistantsFile) {
        try {
          const tasResult = await uploadFile(semesterId, 'assistants', assistantsFile);
          uploadResults.push(`Teaching Assistants: ${tasResult.assignmentsCreated} assigned, ${tasResult.assignmentsFailed} failed`);
        } catch (error) {
          uploadResults.push(`Teaching Assistants upload error: ${error.response?.data?.message || error.message}`);
        }
      }
      
      // Set success message
      let successMessage = `Semester ${semesterYear} ${termOptions.find(t => t.value === term)?.label} created successfully.`;
      if (uploadResults.length > 0) {
        successMessage += ' ' + uploadResults.join('. ');
      }
      
      setSuccess(successMessage);
      
      // Reset form
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
    }
  };

  const handleFindSemester = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Find semester by year and term
      const response = await axios.get(`${API_URL}/api/admin/semesters`, {
        params: {
          year: semesterYear,
          semesterType: term
        }
      });
      
      if (response.data.data.length === 0) {
        setErrorMessage('No semester found with the specified year and term');
        setShowError(true);
        return;
      }
      
      // Set the semester ID for deletion
      setSelectedSemesterId(response.data.data[0].id);
      
      if (activeAction === 'edit') {
        setSuccess(`Semester ${semesterYear} ${termOptions.find(t => t.value === term)?.label} found. You can now upload new files.`);
      } else {
        setSuccess(`Semester ${semesterYear} ${termOptions.find(t => t.value === term)?.label} found. Click the button below to delete.`);
      }
      
    } catch (error) {
      console.error('Error finding semester:', error);
      
      if (error.response) {
        setErrorMessage(error.response.data?.message || `Error ${error.response.status}: Failed to find semester`);
      } else if (error.request) {
        setErrorMessage('Server not responding. Please check your connection.');
      } else {
        setErrorMessage(`Error: ${error.message}`);
      }
      
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirmation = () => {
    if (!selectedSemesterId) {
      setErrorMessage('Please find a semester first');
      setShowError(true);
      return;
    }
    
    const semesterForPopup = {
      id: selectedSemesterId,
      year: semesterYear,
      semesterType: termOptions.find(t => t.value === term)?.label || term
    };
    
    setConfirmationData(semesterForPopup);
    setShowConfirmation(true);
  };

  const handleDeleteSemester = async () => {
    setShowConfirmation(false);
    setLoading(true);
    
    try {
      await axios.delete(`${API_URL}/api/admin/semesters/${selectedSemesterId}`);
      
      setSuccess(`Semester ${semesterYear} ${termOptions.find(t => t.value === term)?.label} deleted successfully`);
      
      // Reset form
      resetForm();
      
    } catch (error) {
      console.error('Error deleting semester:', error);
      
      if (error.response) {
        setErrorMessage(error.response.data?.message || `Error ${error.response.status}: Failed to delete semester`);
      } else if (error.request) {
        setErrorMessage('Server not responding. Please check your connection.');
      } else {
        setErrorMessage(`Error: ${error.message}`);
      }
      
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
      // Upload files for the existing semester
      const uploadResults = [];
      
      if (offeringsFile) {
        try {
          const offeringsResult = await uploadFile(selectedSemesterId, 'offerings', offeringsFile);
          uploadResults.push(`Offerings: ${offeringsResult.offeringsCreated} created, ${offeringsResult.offeringsFailed} failed`);
        } catch (error) {
          uploadResults.push(`Offerings upload error: ${error.response?.data?.message || error.message}`);
        }
      }
      
      if (studentsFile) {
        try {
          const studentsResult = await uploadFile(selectedSemesterId, 'students', studentsFile);
          uploadResults.push(`Students: ${studentsResult.enrollmentsCreated} enrolled, ${studentsResult.enrollmentsFailed} failed`);
        } catch (error) {
          uploadResults.push(`Students upload error: ${error.response?.data?.message || error.message}`);
        }
      }
      
      if (assistantsFile) {
        try {
          const tasResult = await uploadFile(selectedSemesterId, 'assistants', assistantsFile);
          uploadResults.push(`Teaching Assistants: ${tasResult.assignmentsCreated} assigned, ${tasResult.assignmentsFailed} failed`);
        } catch (error) {
          uploadResults.push(`Teaching Assistants upload error: ${error.response?.data?.message || error.message}`);
        }
      }
      
      // Set success message
      let successMessage = `Semester ${semesterYear} ${termOptions.find(t => t.value === term)?.label} updated successfully.`;
      if (uploadResults.length > 0) {
        successMessage += ' ' + uploadResults.join('. ');
      }
      
      setSuccess(successMessage);
      
      // Reset form
      resetForm();
      
    } catch (error) {
      console.error('Error updating semester:', error);
      
      if (error.response) {
        setErrorMessage(error.response.data?.message || `Error ${error.response.status}: Failed to update semester`);
      } else if (error.request) {
        setErrorMessage('Server not responding. Please check your connection.');
      } else {
        setErrorMessage(`Error: ${error.message}`);
      }
      
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSemesterYear('');
    setTerm('');
    setOfferingsFile(null);
    setStudentsFile(null);
    setAssistantsFile(null);
    setSelectedSemesterId(null);
    setSuccess(null);
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
      return 'Processing...';
    }
    
    switch (activeAction) {
      case 'add':
        return 'Add Semester';
      case 'delete':
        return selectedSemesterId ? 'Delete Semester' : 'Find Semester to Delete';
      case 'edit':
        return selectedSemesterId ? 'Upload Files' : 'Find Semester to Edit';
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
          handleDeleteSemester();
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

  return (
    <div className={styles.semesterManagement}>
      {/* Using the shared AdminNavBar component */}
      <AdminNavBar />

      <div className={styles.semesterContent}>
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

        <div className={styles.contentLayout}>
          {/* Left side - Upload area for Add mode or after finding for Edit */}
          <div className={styles.uploadSection}>
            {(activeAction === 'add' || (activeAction === 'edit' && selectedSemesterId)) && (
              <div className={styles.uploadContainer}>
                <div className={styles.uploadBox}>
                  <h3 className={styles.uploadTitle}>Upload Offerings List</h3>
                  <div 
                    className={styles.uploadArea}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop('offerings', e)}
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
                        onChange={(e) => handleFileSelect('offerings', e)}
                      />
                    </label>
                    {offeringsFile && <div className={styles.selectedFile}>{offeringsFile.name}</div>}
                  </div>
                  <div className={styles.uploadNote}>
                    CSV should contain: CourseId, Section, InstructorId, Day, StartTime, EndTime, RoomId, Capacity
                  </div>
                </div>

                <div className={styles.uploadBox}>
                  <h3 className={styles.uploadTitle}>Upload Students List</h3>
                  <div 
                    className={styles.uploadArea}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop('students', e)}
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
                        onChange={(e) => handleFileSelect('students', e)}
                      />
                    </label>
                    {studentsFile && <div className={styles.selectedFile}>{studentsFile.name}</div>}
                  </div>
                  <div className={styles.uploadNote}>
                    CSV should contain: StudentId, Name, Email, CourseId, Section
                  </div>
                </div>

                <div className={styles.uploadBox}>
                  <h3 className={styles.uploadTitle}>Upload Teaching Assistants List</h3>
                  <div 
                    className={styles.uploadArea}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop('assistants', e)}
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
                        onChange={(e) => handleFileSelect('assistants', e)}
                      />
                    </label>
                    {assistantsFile && <div className={styles.selectedFile}>{assistantsFile.name}</div>}
                  </div>
                  <div className={styles.uploadNote}>
                    CSV should contain: TAId, CourseId, Section, Workload
                  </div>
                </div>

                <div className={styles.uploadButtonContainer}>
                  <button 
                    className={styles.uploadButton}
                    onClick={handleActionButtonClick}
                    disabled={loading}
                  >
                    {activeAction === 'add' ? 'Add Semester' : 'Update Semester'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right side - Form */}
          <div className={styles.formSection}>
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
              
              {/* Action Button */}
              {(!selectedSemesterId || activeAction === 'delete') && (
                <div className={styles.formActions}>
                  <button 
                    className={styles.actionButton}
                    onClick={handleActionButtonClick}
                    disabled={loading}
                  >
                    {getActionButtonText()}
                  </button>
                </div>
              )}
            </div>
          </div>
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