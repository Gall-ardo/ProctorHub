import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminNavBar from '../AdminNavBar';
import InstructorSelectionPopup from './InstructorSelectionPopup';
import styles from './AdminOfferingManagement.module.css';

// API URL - can be stored in an environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const AdminOfferingManagement = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('add');
  
  // Form states
  const [department, setDepartment] = useState('');
  const [instructorCount, setInstructorCount] = useState(1);
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [courseCode, setCourseCode] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [semester, setSemester] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showInstructorPopup, setShowInstructorPopup] = useState(false);
  
  // API operation states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Department options
  const departmentOptions = [
    { label: 'CS', value: 'CS' }, // Match case with database
    { label: 'EEE', value: 'EEE' },
    { label: 'IE', value: 'IE' },
    { label: 'ME', value: 'ME' }
  ];

  // Semester options - updated to match the year/isFall model
  const semesterOptions = [
    { label: '2025 Spring', value: '2025_spring' },
    { label: '2024 Fall', value: '2024_fall' }
  ];

  const handleDepartmentChange = (deptValue) => {
    setDepartment(deptValue);
    setSelectedInstructors([]); // Reset instructors when department changes
  };

  const openInstructorPopup = () => {
    setShowInstructorPopup(true);
  };

  const closeInstructorPopup = () => {
    setShowInstructorPopup(false);
  };

  const handleInstructorsSelected = (instructors) => {
    setSelectedInstructors(instructors);
    setShowInstructorPopup(false);
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

  // Clear form 
  const clearForm = () => {
    setDepartment('');
    setSelectedInstructors([]);
    setCourseCode('');
    setSectionId('');
    setSemester('');
  };

  // API function to create offering
  const createOffering = async (offeringData) => {
    try {
      const response = await axios.post(`${API_URL}/admin/offerings`, offeringData);
      return response.data;
    } catch (error) {
      console.error('API error details:', error.response?.data);
      throw error;
    }
  };

  // API function to find offerings
  const findOfferings = async (courseCode, sectionId) => {
    try {
      const response = await axios.get(`${API_URL}/admin/offerings/find`, {
        params: { courseCode, sectionId }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // API function to delete offerings
  const deleteOfferingsByCourseAndSection = async (courseCode, sectionId) => {
    try {
      const response = await axios.delete(`${API_URL}/admin/offerings`, {
        data: { courseCode, sectionId }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    
    // Reset states
    setError(null);
    setSuccess(null);
    
    // Handle different form submissions based on active view
    switch(activeView) {
      case 'add':
        try {
          setLoading(true);
          
          // Validate form
          if (!department) {
            setError('Please select a department');
            setLoading(false);
            return;
          }
          
          if (selectedInstructors.length === 0) {
            setError('Please select at least one instructor');
            setLoading(false);
            return;
          }
          
          if (!courseCode) {
            setError('Please enter a course code');
            setLoading(false);
            return;
          }
          
          if (!sectionId) {
            setError('Please enter a section ID');
            setLoading(false);
            return;
          }
          
          if (!semester) {
            setError('Please select a semester');
            setLoading(false);
            return;
          }
          
          // Prepare data
          const offeringData = {
            department,
            instructors: selectedInstructors,
            courseCode,
            sectionId,
            semester
          };
          
          console.log('Sending offering data:', offeringData);
          
          // Call API
          const result = await createOffering(offeringData);
          
          if (result.success) {
            setSuccess('Offering created successfully');
            
            // Reset form
            clearForm();
          } else {
            setError(result.message || 'Failed to create offering');
          }
          
          setLoading(false);
        } catch (err) {
          console.error('Error creating offering:', err);
          setError(err.response?.data?.message || 'Failed to create offering');
          setLoading(false);
        }
        break;
        
      case 'delete':
        try {
          setLoading(true);
          
          // Validate form
          if (!courseCode) {
            setError('Please enter a course code');
            setLoading(false);
            return;
          }
          
          if (!sectionId) {
            setError('Please enter a section ID');
            setLoading(false);
            return;
          }
          
          // Find offerings
          const findResult = await findOfferings(courseCode, sectionId);
          
          if (findResult.success && findResult.data.length > 0) {
            // Show confirmation
            const confirmDelete = window.confirm(`Are you sure you want to delete ${findResult.data.length} offering(s)?`);
            
            if (confirmDelete) {
              // Delete offerings
              const deleteResult = await deleteOfferingsByCourseAndSection(courseCode, sectionId);
              
              if (deleteResult.success) {
                setSuccess('Offerings deleted successfully');
                
                // Reset form
                setCourseCode('');
                setSectionId('');
              } else {
                setError(deleteResult.message || 'Failed to delete offerings');
              }
            }
          } else {
            setError('No offerings found with the provided details');
          }
          
          setLoading(false);
        } catch (err) {
          console.error('Error deleting offerings:', err);
          setError(err.response?.data?.message || 'Failed to delete offerings');
          setLoading(false);
        }
        break;
        
      case 'edit':
        try {
          setLoading(true);
          
          // Validate form
          if (!courseCode) {
            setError('Please enter a course code');
            setLoading(false);
            return;
          }
          
          if (!sectionId) {
            setError('Please enter a section ID');
            setLoading(false);
            return;
          }
          
          // Find offerings
          const result = await findOfferings(courseCode, sectionId);
          
          if (result.success && result.data.length > 0) {
            // Navigate to edit page with the offering details
            navigate(`/admin/offering/edit/${result.data[0].id}`);
          } else {
            setError('No offerings found with the provided details');
          }
          
          setLoading(false);
        } catch (err) {
          console.error('Error finding offerings:', err);
          setError(err.response?.data?.message || 'Failed to find offerings');
          setLoading(false);
        }
        break;
        
      default:
        break;
    }
  };
  

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }
    
    if (selectedFile.type !== 'text/csv' && selectedFile.type !== 'application/vnd.ms-excel') {
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
        `${API_URL}/admin/offerings/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        setSuccess(`File uploaded successfully. ${response.data.offeringsCreated || 0} offerings created.`);
        setSelectedFile(null);
      } else {
        setError(response.data.message || 'File upload failed');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    clearForm();
    setError(null);
    setSuccess(null);
  };

  return (
    <div className={styles.offeringManagement}>
      <AdminNavBar />

      <div className={styles.mainContent}>
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
              <span className={`${styles.buttonLabel} ${activeView === 'add' ? styles.active : ''}`}>Add Offering</span>
            </div>
            
            <div 
              className={`${styles.actionButton} ${activeView === 'delete' ? styles.active : ''}`} 
              onClick={() => handleViewChange('delete')}
            >
              <div className={`${styles.circleIcon} ${activeView === 'delete' ? styles.active : ''}`}>
                <span>-</span>
              </div>
              <span className={`${styles.buttonLabel} ${activeView === 'delete' ? styles.active : ''}`}>Delete Offering</span>
            </div>
            
            <div 
              className={`${styles.actionButton} ${activeView === 'edit' ? styles.active : ''}`} 
              onClick={() => handleViewChange('edit')}
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
              Note: CSV file should contain columns for: department, instructorIds, courseCode, sectionId, semester (format: YYYY_season)
            </div>
          </div>
        </div>

        {/* Right Panel - Form Section */}
        <div className={styles.rightPanel}>
          <div className={styles.formContainer}>
            {/* Show loading indicator */}
            {loading && (
              <div className={styles.loadingIndicator}>
                <div className={styles.spinner}></div>
                <p>Processing...</p>
              </div>
            )}
            
            {/* Show error message */}
            {error && (
              <div className={styles.errorMessage}>
                <span className={styles.errorIcon}>!</span>
                <p>{error}</p>
                <button onClick={() => setError(null)}>×</button>
              </div>
            )}
            
            {/* Show success message */}
            {success && (
              <div className={styles.successMessage}>
                <span className={styles.successIcon}>✓</span>
                <p>{success}</p>
                <button onClick={() => setSuccess(null)}>×</button>
              </div>
            )}
          
            {activeView === 'add' && (
              <>
                <h2 className={styles.formTitle}>Enter Offering Information</h2>
                <form onSubmit={handleFormSubmit}>
                  {/* Department Selection */}
                  <div className={styles.formGroup}>
                    <label>Department <span className={styles.requiredIndicator}>*</span></label>
                    <div className={styles.departmentSelect}>
                      {departmentOptions.map((dept) => (
                        <div 
                          key={dept.value} 
                          className={`${styles.departmentOption} ${department === dept.value ? styles.selected : ''}`}
                          onClick={() => handleDepartmentChange(dept.value)}
                        >
                          {dept.label}
                          {department === dept.value && (
                            <span className={styles.radioIndicator}></span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructor Selection */}
                  <div className={styles.formGroup}>
                    <label>Instructor(s) <span className={styles.requiredIndicator}>*</span></label>
                    <div className={styles.instructorSelection}>
                      <div className={styles.instructorCountWrapper}>
                        <input 
                          type="number" 
                          min="1" 
                          max="5"
                          value={instructorCount}
                          onChange={(e) => setInstructorCount(parseInt(e.target.value) || 1)}
                          className={styles.instructorCountInput}
                        />
                        <button 
                          type="button" 
                          className={styles.selectInstructorsBtn}
                          onClick={openInstructorPopup}
                          disabled={!department || loading}
                        >
                          Select Instructor(s)
                        </button>
                      </div>
                      {selectedInstructors.length > 0 && (
                        <div className={styles.selectedInstructorsList}>
                          {selectedInstructors.map((instructor) => (
                            <div key={instructor.id} className={styles.selectedInstructorItem}>
                              {instructor.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Course Code <span className={styles.requiredIndicator}>*</span></label>
                    <input 
                      type="text" 
                      placeholder="Enter course code (e.g., CS101)" 
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Section ID <span className={styles.requiredIndicator}>*</span></label>
                    <input 
                      type="text" 
                      placeholder="Enter section ID (e.g., 001)" 
                      value={sectionId}
                      onChange={(e) => setSectionId(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Semester <span className={styles.requiredIndicator}>*</span></label>
                    <div className={styles.semesterOptions}>
                      {semesterOptions.map((sem) => (
                        <div 
                          key={sem.value} 
                          className={`${styles.semesterOption} ${semester === sem.value ? styles.selected : ''}`}
                          onClick={() => setSemester(sem.value)}
                        >
                          {sem.label}
                          {semester === sem.value && (
                            <span className={styles.radioIndicator}></span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    className={styles.formSubmitBtn}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Add Offering'}
                  </button>
                </form>
              </>
            )}

            {activeView === 'delete' && (
              <>
                <h2 className={styles.formTitle}>Enter Course Code and Section ID to Delete</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className={styles.formGroup}>
                    <label>Course Code <span className={styles.requiredIndicator}>*</span></label>
                    <input 
                      type="text" 
                      placeholder="Enter course code (e.g., CS101)" 
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Section ID <span className={styles.requiredIndicator}>*</span></label>
                    <input 
                      type="text" 
                      placeholder="Enter section ID (e.g., 001)" 
                      value={sectionId}
                      onChange={(e) => setSectionId(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className={styles.formSubmitBtn}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Find Offerings To Delete'}
                  </button>
                </form>
              </>
            )}

            {activeView === 'edit' && (
              <>
                <h2 className={styles.formTitle}>Enter Course Code and Section ID to Edit</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className={styles.formGroup}>
                    <label>Course Code <span className={styles.requiredIndicator}>*</span></label>
                    <input 
                      type="text" 
                      placeholder="Enter course code (e.g., CS101)" 
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Section ID <span className={styles.requiredIndicator}>*</span></label>
                    <input 
                      type="text" 
                      placeholder="Enter section ID (e.g., 001)" 
                      value={sectionId}
                      onChange={(e) => setSectionId(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className={styles.formSubmitBtn}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Find Offerings To Edit'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Instructor Selection Popup */}
      {showInstructorPopup && (
        <InstructorSelectionPopup 
          department={department}
          count={instructorCount}
          selectedInstructors={selectedInstructors}
          onConfirm={handleInstructorsSelected}
          onCancel={closeInstructorPopup}
          apiUrl={API_URL}
        />
      )}
    </div>
  );
};

export default AdminOfferingManagement;