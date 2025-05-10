import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminNavBar from '../AdminNavBar';
import TimeslotPopup from './TimeslotPopup'; // Import the popup component
import styles from './AdminOfferingManagement.module.css';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const AdminOfferingManagement = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('add');
  
  // Form states
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [sectionId, setSectionId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  // New state for timeslots and popup
  const [selectedTimeslots, setSelectedTimeslots] = useState([]);
  const [showTimeslotPopup, setShowTimeslotPopup] = useState(false);
  
  // API operation states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch semesters when component mounts
  useEffect(() => {
    fetchSemesters();
  }, []);

  // Filter courses when search term changes
  useEffect(() => {
    if (courses.length > 0) {
      const filtered = courses.filter(course => 
        course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.courseName && course.courseName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCourses(filtered);
    }
  }, [searchTerm, courses]);

  // Fetch courses when semester changes
  useEffect(() => {
    if (selectedSemester) {
      fetchCoursesBySemester(selectedSemester.id);
    } else {
      setCourses([]);
      setFilteredCourses([]);
    }
  }, [selectedSemester]);

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      // Using the fetch endpoint that returns all semesters
      const response = await axios.get(`${API_URL}/admin/fetch/semesters`);
      
      if (response.data.success) {
        setSemesters(response.data.data);
        
        // Find the active semester or most recent
        if (response.data.data.length > 0) {
          // Sort by year and semesterType for most recent
          const sortedSemesters = [...response.data.data].sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            // If years are same, fall is more recent than spring
            return a.isFall ? -1 : 1;
          });
          
          // Find active semester first, then fall back to most recent
          const activeSemester = sortedSemesters.find(sem => sem.isActive) || sortedSemesters[0];
          
          setSelectedSemester(activeSemester);
        }
      } else {
        setError('Failed to fetch semesters');
      }
    } catch (err) {
      console.error('Error fetching semesters:', err);
      setError('Failed to fetch semesters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursesBySemester = async (semesterId) => {
    try {
      setLoading(true);
      setCourses([]);
      setFilteredCourses([]);
      setSelectedCourse(null);
      
      // Using the search endpoint to find courses by semester
      const response = await axios.get(`${API_URL}/admin/fetch/courses/search`, {
        params: { semesterId }
      });
      
      if (response.data.success) {
        setCourses(response.data.data);
        setFilteredCourses(response.data.data);
      } else {
        setError('Failed to fetch courses');
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to fetch courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionIdChange = (e) => {
    setSectionId(e.target.value);
  };

  const incrementSectionId = () => {
    const currentValue = parseInt(sectionId) || 0;
    setSectionId(String(currentValue + 1).padStart(3, '0'));
  };

  const decrementSectionId = () => {
    const currentValue = parseInt(sectionId) || 0;
    if (currentValue > 0) {
      setSectionId(String(currentValue - 1).padStart(3, '0'));
    }
  };

  const handleCourseSelection = (course) => {
    setSelectedCourse(course);
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

  // Handle timeslot popup open/close
  const openTimeslotPopup = () => {
    setShowTimeslotPopup(true);
  };

  const closeTimeslotPopup = () => {
    setShowTimeslotPopup(false);
  };

  // Handle timeslot changes from popup
  const handleTimeslotChange = (timeslots) => {
    setSelectedTimeslots(timeslots);
  };

  // Clear form 
  const clearForm = () => {
    setSelectedCourse(null);
    setSectionId('');
    setSearchTerm('');
    setSelectedTimeslots([]);
  };

  // Handle file upload
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

  // API function to create offering
  const createOffering = async (offeringData) => {
    try {
      // Add validation before sending to the server
      if (!offeringData.courseId || 
          offeringData.sectionNumber === undefined || 
          !offeringData.semesterId) {
        throw new Error('Missing required fields');
      }
      
      // Log what we're sending
      console.log('Sending data to API:', JSON.stringify(offeringData));
      
      const response = await axios.post(`${API_URL}/admin/offerings`, offeringData);
      
      // Log response for debugging
      console.log('Server response:', response.status, response.data);
      
      return response.data;
    } catch (error) {
      console.error('API error:', error);
      
      // Enhanced error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      
      throw error;
    }
  };

  // API function to create timeslots for an offering
  const createTimeslots = async (offeringId, timeslots) => {
    try {
      if (!offeringId || !timeslots || timeslots.length === 0) {
        throw new Error('Offering ID and timeslots are required');
      }

      console.log(`Creating ${timeslots.length} timeslots for offering ${offeringId}`);
      
      const response = await axios.post(`${API_URL}/admin/timeslots`, {
        offeringId,
        timeslots
      });
      
      console.log('Create timeslots response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error creating timeslots:', error);
      
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      
      throw error;
    }
  };

  // API function to find offerings
  const findOfferings = async (courseId, sectionNumber) => {
    try {
      if (!courseId || sectionNumber === undefined) {
        throw new Error('Course ID and section number are required');
      }

      console.log(`Finding offerings for course ${courseId}, section ${sectionNumber}`);
      
      const response = await axios.get(`${API_URL}/admin/offerings/find`, {
        params: { courseId, sectionNumber }
      });
      
      console.log('Find offerings response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error finding offerings:', error);
      
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      
      throw error;
    }
  };

  // API function to delete offerings
  const deleteOfferingsByCourseAndSection = async (courseId, sectionNumber) => {
    try {
      if (!courseId || sectionNumber === undefined) {
        throw new Error('Course ID and section number are required');
      }

      console.log(`Deleting offerings for course ${courseId}, section ${sectionNumber}`);
      
      const response = await axios.delete(`${API_URL}/admin/offerings`, {
        data: { courseId, sectionNumber }
      });
      
      console.log('Delete offerings response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error deleting offerings:', error);
      
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      
      throw error;
    }
  };

  // API function to get timeslots for an offering
  const getTimeslotsByOfferingId = async (offeringId) => {
    try {
      if (!offeringId) {
        throw new Error('Offering ID is required');
      }

      console.log(`Getting timeslots for offering ${offeringId}`);
      
      const response = await axios.get(`${API_URL}/admin/timeslots`, {
        params: { offeringId }
      });
      
      console.log('Get timeslots response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error getting timeslots:', error);
      
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      
      throw error;
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    
    // Reset states
    setError(null);
    setSuccess(null);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Handle different form submissions based on active view
    switch(activeView) {
      case 'add':
        try {
          setLoading(true);
          
          // Ensure sectionNumber is a proper integer
          const sectionNum = parseInt(sectionId);
          if (isNaN(sectionNum)) {
            setError('Section ID must be a valid number');
            setLoading(false);
            return;
          }
          
          // Prepare data with careful validation
          if (!selectedCourse || !selectedCourse.id) {
            setError('Please select a valid course');
            setLoading(false);
            return;
          }
          
          if (!selectedSemester || !selectedSemester.id) {
            setError('Please select a valid semester');
            setLoading(false);
            return;
          }
          
          const offeringData = {
            courseId: selectedCourse.id,
            sectionNumber: sectionNum, 
            semesterId: selectedSemester.id
          };
          
          console.log('Sending offering data:', offeringData);
          
          // Call API to create offering
          const result = await createOffering(offeringData);
          
          if (result && result.success) {
            // Create timeslots for the offering if any are selected
            if (selectedTimeslots.length > 0) {
              try {
                const timeslotResult = await createTimeslots(
                  result.data.id, 
                  selectedTimeslots
                );
                
                if (timeslotResult && timeslotResult.success) {
                  setSuccess(`Offering created successfully with ${selectedTimeslots.length} timeslots`);
                } else {
                  setSuccess(`Offering created, but timeslots could not be added: ${timeslotResult?.message || 'Unknown error'}`);
                }
              } catch (timeslotErr) {
                console.error('Error creating timeslots:', timeslotErr);
                setSuccess(`Offering created, but timeslots could not be added: ${timeslotErr.message}`);
              }
            } else {
              setSuccess(result.message || 'Offering created successfully');
            }
            
            // Reset form
            clearForm();
          } else {
            setError((result && result.message) || 'Failed to create offering');
          }
        } catch (err) {
          console.error('Error creating offering:', err);
          setError(err.response?.data?.message || 'Failed to create offering');
        } finally {
          setLoading(false);
        }
        break;
        
      case 'delete':
        try {
          setLoading(true);
          
          if (!selectedCourse || !selectedCourse.id) {
            setError('Please select a course');
            setLoading(false);
            return;
          }
          
          if (!sectionId) {
            setError('Please enter a section ID');
            setLoading(false);
            return;
          }
          
          // Ensure sectionNumber is a proper integer
          const sectionNum = parseInt(sectionId);
          if (isNaN(sectionNum)) {
            setError('Section ID must be a valid number');
            setLoading(false);
            return;
          }
          
          // Find offerings
          const findResult = await findOfferings(selectedCourse.id, sectionNum);
          
          if (findResult && findResult.success && findResult.data && findResult.data.length > 0) {
            // Show confirmation
            const confirmDelete = window.confirm(`Are you sure you want to delete ${findResult.data.length} offering(s) and their timeslots?`);
            
            if (confirmDelete) {
              // Delete offerings will cascade delete timeslots as well
              const deleteResult = await deleteOfferingsByCourseAndSection(selectedCourse.id, sectionNum);
              
              if (deleteResult && deleteResult.success) {
                setSuccess(deleteResult.message || 'Offerings and associated timeslots deleted successfully');
                
                // Reset form
                clearForm();
              } else {
                setError((deleteResult && deleteResult.message) || 'Failed to delete offerings');
              }
            }
          } else {
            setError('No offerings found with the provided details');
          }
        } catch (err) {
          console.error('Error deleting offerings:', err);
          setError(err.response?.data?.message || 'Failed to delete offerings');
        } finally {
          setLoading(false);
        }
        break;
        
      case 'edit':
        try {
          setLoading(true);
          
          if (!selectedCourse || !selectedCourse.id) {
            setError('Please select a course');
            setLoading(false);
            return;
          }
          
          if (!sectionId) {
            setError('Please enter a section ID');
            setLoading(false);
            return;
          }
          
          // Ensure sectionNumber is a proper integer
          const sectionNum = parseInt(sectionId);
          if (isNaN(sectionNum)) {
            setError('Section ID must be a valid number');
            setLoading(false);
            return;
          }
          
          // Find offerings
          const result = await findOfferings(selectedCourse.id, sectionNum);
          
          if (result && result.success && result.data && result.data.length > 0) {
            // Get timeslots for the offering
            try {
              const timeslotsResult = await getTimeslotsByOfferingId(result.data[0].id);
              
              if (timeslotsResult && timeslotsResult.success) {
                // Set timeslots for editing
                setSelectedTimeslots(timeslotsResult.data || []);
              }
            } catch (timeslotErr) {
              console.error('Error getting timeslots:', timeslotErr);
              // Continue with empty timeslots
            }
            
            // Navigate to edit page with the offering details
            navigate(`/admin/offering/edit/${result.data[0].id}`);
          } else {
            setError('No offerings found with the provided details');
          }
        } catch (err) {
          console.error('Error finding offerings:', err);
          setError(err.response?.data?.message || 'Failed to find offerings');
        } finally {
          setLoading(false);
        }
        break;
        
      default:
        break;
    }
  };

  const validateForm = () => {
    if (!selectedSemester) {
      setError('Please select a semester');
      return false;
    }
    
    if (!selectedCourse) {
      setError('Please select a course');
      return false;
    }
    
    if (!sectionId) {
      setError('Please enter a section ID');
      return false;
    }
    
    if (activeView === 'add' && selectedTimeslots.length === 0) {
      setError('Please select at least one time slot');
      return false;
    }
    
    return true;
  };

  // Render summary of selected timeslots
  const renderTimeslotsSummary = () => {
    if (selectedTimeslots.length === 0) {
      return <span className={styles.noTimeslotsText}>No time slots selected</span>;
    }
    
    // Group timeslots by day
    const groupedByDay = selectedTimeslots.reduce((acc, slot) => {
      if (!acc[slot.day]) {
        acc[slot.day] = [];
      }
      acc[slot.day].push(slot);
      return acc;
    }, {});
    
    return (
      <div className={styles.timeslotsSummary}>
        {Object.entries(groupedByDay).map(([day, slots]) => (
          <div key={day} className={styles.timeslotDayGroup}>
            <span className={styles.timeslotDay}>{day}:</span>
            <span className={styles.timeslotTimes}>
              {slots
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map(slot => `${slot.startTime.substring(0, 5)}-${slot.endTime.substring(0, 5)}`)
                .join(', ')}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.offeringManagement}>
      <AdminNavBar />

      {/* Timeslot Popup */}
      {showTimeslotPopup && (
        <TimeslotPopup 
          onClose={closeTimeslotPopup}
          onChange={handleTimeslotChange}
          initialTimeslots={selectedTimeslots}
        />
      )}

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
              Note: CSV file should contain columns for: courseId, sectionNumber, semesterId, and optional timeslots data (day, startTime, endTime)
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
          
            {/* Form for all views */}
            <h2 className={styles.formTitle}>
              {activeView === 'add' ? 'Enter Offering Information' : 
               activeView === 'delete' ? 'Enter Course and Section ID to Delete' :
               'Enter Course and Section ID to Edit'}
            </h2>
            <form onSubmit={handleFormSubmit}>
              {/* Semester Selection */}
              <div className={styles.formGroup}>
                <label>Semester <span className={styles.requiredIndicator}>*</span></label>
                <div className={styles.semesterOptions}>
                  {semesters.map((sem) => (
                    <div 
                      key={sem.id} 
                      className={`${styles.semesterOption} ${selectedSemester && selectedSemester.id === sem.id ? styles.selected : ''}`}
                      onClick={() => setSelectedSemester(sem)}
                    >
                      {sem.name || `${sem.year} ${sem.isFall ? 'Fall' : 'Spring'}`}
                      {sem.isActive && ' (Active)'}
                      {selectedSemester && selectedSemester.id === sem.id && (
                        <span className={styles.radioIndicator}></span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Search and Selection */}
              {selectedSemester && (
                <div className={styles.formGroup}>
                  <label>Course <span className={styles.requiredIndicator}>*</span></label>
                  <div className={styles.courseSelectionContainer}>
                    <div className={styles.courseSearchBar}>
                      <input 
                        type="text"
                        placeholder="Search by course code or name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.courseSearchInput}
                      />
                    </div>
                    <div className={styles.courseList}>
                      {filteredCourses.length > 0 ? (
                        filteredCourses.map(course => (
                          <div 
                            key={course.id}
                            className={`${styles.courseItem} ${selectedCourse?.id === course.id ? styles.selected : ''}`}
                            onClick={() => handleCourseSelection(course)}
                          >
                            <div className={styles.courseCode}>{course.courseCode}</div>
                            <div className={styles.courseName}>{course.courseName}</div>
                            {selectedCourse?.id === course.id && (
                              <span className={styles.courseSelectedIcon}>✓</span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className={styles.noCourses}>
                          {loading ? 'Loading courses...' : 'No courses found for this semester'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Section ID Input */}
              <div className={styles.formGroup}>
                <label>Section ID <span className={styles.requiredIndicator}>*</span></label>
                <div className={styles.sectionIdContainer}>
                  <input 
                    type="text" 
                    placeholder="Enter section ID (e.g., 001)" 
                    value={sectionId}
                    onChange={handleSectionIdChange}
                    disabled={loading}
                    className={styles.sectionIdInput}
                  />
                  <div className={styles.sectionIdControls}>
                    <button 
                      type="button" 
                      className={styles.sectionIdButton}
                      onClick={incrementSectionId}
                      disabled={loading}
                    >
                      ▲
                    </button>
                    <button 
                      type="button" 
                      className={styles.sectionIdButton}
                      onClick={decrementSectionId}
                      disabled={loading}
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>

              {/* Time Slot Selection Button - only shown for add and edit */}
              {activeView !== 'delete' && (
                <div className={styles.formGroup}>
                  <label>
                    Time Slots 
                    {activeView === 'add' && <span className={styles.requiredIndicator}>*</span>}
                  </label>
                  <div className={styles.timeslotButtonContainer}>
                    <button 
                      type="button"
                      className={styles.timeslotButton}
                      onClick={openTimeslotPopup}
                    >
                      Select Time Slots
                    </button>
                    <span className={styles.timeslotCount}>
                      {selectedTimeslots.length} time slot(s) selected
                    </span>
                  </div>
                  {renderTimeslotsSummary()}
                </div>
              )}

              {/* Selected Course Display */}
              {selectedCourse && (
                <div className={styles.selectedCourseContainer}>
                  <h3>Selected Course</h3>
                  <div className={styles.selectedCourseDetails}>
                    <p><strong>Course Code:</strong> {selectedCourse.courseCode}</p>
                    <p><strong>Course Name:</strong> {selectedCourse.courseName}</p>
                    <p><strong>Department:</strong> {selectedCourse.department}</p>
                    <p><strong>Credit:</strong> {selectedCourse.credit}</p>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className={styles.formSubmitBtn}
                disabled={loading}
              >
                {loading ? 'Processing...' : 
                 activeView === 'add' ? 'Add Offering' :
                 activeView === 'delete' ? 'Find Offerings To Delete' :
                 'Find Offerings To Edit'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOfferingManagement;