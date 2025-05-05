import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavBar from '../AdminNavBar';
import ErrorPopup from '../ErrorPopup';
import styles from './AdminSemesterManagement.module.css';
import axios from 'axios';

// Define API URL with fallback for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const AdminSemesterManagement = () => {
  const navigate = useNavigate();
  
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

  // Term options
  const termOptions = [
    { label: 'Fall', value: 'FALL' },
    { label: 'Spring', value: 'SPRING' },
    { label: 'Summer', value: 'SUMMER' }
  ];

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

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Create the semester first
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
      let successMessage = `Semester ${semesterId} created successfully.`;
      if (uploadResults.length > 0) {
        successMessage += ' ' + uploadResults.join('. ');
      }
      
      setSuccess(successMessage);
      
      // Reset form
      setSemesterYear('');
      setTerm('');
      setOfferingsFile(null);
      setStudentsFile(null);
      setAssistantsFile(null);
      
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

  return (
    <div className={styles.semesterManagement}>
      {/* Using the shared AdminNavBar component */}
      <AdminNavBar />

      <div className={styles.semesterContent}>
        {/* Semester Information Form */}
        <div className={styles.semesterInfoCard}>
          <h2 className={styles.cardTitle}>Enter Semester Information</h2>
          <form>
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
                    className={`${styles.termOption} ${term === termOption.value ? styles.selected : ''}`}
                    onClick={() => setTerm(termOption.value)}
                  >
                    {termOption.label}
                    <span className={styles.radioIndicator}></span>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
        
        {/* Upload Cards */}
        <div className={styles.uploadCardsContainer}>
          {/* Offerings Upload Card */}
          <div className={styles.uploadCard}>
            <h3 className={styles.uploadTitle}>Upload Offerings List</h3>
            <div 
              className={styles.uploadArea}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop('offerings', e)}
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
                  onChange={(e) => handleFileSelect('offerings', e)}
                />
              </label>
              {offeringsFile && <div className={styles.selectedFile}>{offeringsFile.name}</div>}
            </div>
            <div className={styles.uploadNote}>
              CSV should contain: CourseId, Section, InstructorId, Day, StartTime, EndTime, RoomId, Capacity
            </div>
          </div>
          
          {/* Students Upload Card */}
          <div className={styles.uploadCard}>
            <h3 className={styles.uploadTitle}>Upload Students List</h3>
            <div 
              className={styles.uploadArea}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop('students', e)}
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
                  onChange={(e) => handleFileSelect('students', e)}
                />
              </label>
              {studentsFile && <div className={styles.selectedFile}>{studentsFile.name}</div>}
            </div>
            <div className={styles.uploadNote}>
              CSV should contain: StudentId, Name, Email, CourseId, Section
            </div>
          </div>
          
          {/* Teaching Assistants Upload Card */}
          <div className={styles.uploadCard}>
            <h3 className={styles.uploadTitle}>Upload Teaching Assistants List</h3>
            <div 
              className={styles.uploadArea}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop('assistants', e)}
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
                  onChange={(e) => handleFileSelect('assistants', e)}
                />
              </label>
              {assistantsFile && <div className={styles.selectedFile}>{assistantsFile.name}</div>}
            </div>
            <div className={styles.uploadNote}>
              CSV should contain: TAId, CourseId, Section, Workload
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className={styles.semesterSubmit}>
          <button 
            className={styles.addSemesterBtn}
            onClick={handleFormSubmit}
            disabled={loading}
          >
            {loading ? 'Adding Semester...' : 'Add Semester'}
          </button>
        </div>

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
    </div>
  );
};

export default AdminSemesterManagement;