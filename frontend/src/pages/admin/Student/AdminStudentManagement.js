import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavBar from '../AdminNavBar';
import CourseSelectionPopup from './CourseSelectionPopup';
import axios from 'axios';
import styles from './AdminStudentManagement.module.css';

// Create an axios instance with the correct base URL
const apiClient = axios.create({
  baseURL: 'http://localhost:5001/api' // Point to your backend server port
});

const AdminStudentManagement = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('add'); // 'add', 'delete', 'edit'
  const [isEditMode, setIsEditMode] = useState(false); // New state to track if we're editing
  
  // Form states
  const [studentId, setStudentId] = useState('');
  const [nameSurname, setNameSurname] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  // Course popup state
  const [isCoursePopupOpen, setIsCoursePopupOpen] = useState(false);
  
  // Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [findResults, setFindResults] = useState(null);

  // Success and error message states (for notifications)
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Department options
  const departmentOptions = [
    { label: 'CS', value: 'CS' },
    { label: 'IE', value: 'IE' },
    { label: 'EEE', value: 'EEE' },
    { label: 'ME', value: 'ME' }
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
    setSuccess(null);
    setError(null);
    
    try {
      // Handle different form submissions based on active view
      switch(activeView) {
        case 'add':
          // If there's a findResults.id, it means we're updating
          if (findResults && findResults.id) {
            console.log(`Updating student with ID: ${findResults.id}`);
            const updateResponse = await apiClient.put(`/admin/students/${findResults.id}`, { 
              studentId, 
              nameSurname, 
              email, 
              department,
              courses: selectedCourses 
            });
            
            if (updateResponse.data.success) {
              setSuccess('Student updated successfully!');
              resetForm();
              // Reset edit mode after successful update
              setIsEditMode(false);
            }
          } else {
            // Creating a new student
            console.log("Creating new student with data:", { studentId, nameSurname, email, department, courses: selectedCourses });
            const addResponse = await apiClient.post('/admin/students', { 
              studentId, 
              nameSurname, 
              email, 
              department,
              courses: selectedCourses 
            });
            
            if (addResponse.data.success) {
              setSuccess('Student added successfully!');
              resetForm();
            }
          }
          break;
          
        case 'delete':
          // First find the student
          if (!studentId && !email) {
            setError('Please provide either ID or email to find student');
            setIsLoading(false);
            return;
          }
          
          const findParams = {};
          if (studentId) findParams.studentId = studentId;
          if (email) findParams.email = email;
          
          console.log("Finding students with params:", findParams);
          const findResponse = await apiClient.get('/admin/students', { params: findParams });
          
          if (findResponse.data.success && findResponse.data.data.length > 0) {
            setFindResults(findResponse.data.data);
          } else {
            setError('No students found with the provided information');
          }
          break;
          
        case 'edit':
          // First find the student
          if (!studentId && !email) {
            setError('Please provide either ID or email to find student');
            setIsLoading(false);
            return;
          }
          
          const editFindParams = {};
          if (studentId) editFindParams.studentId = studentId;
          if (email) editFindParams.email = email;
          
          console.log("Finding students for edit with params:", editFindParams);
          const editFindResponse = await apiClient.get('/admin/students', { params: editFindParams });
          
          if (editFindResponse.data.success && editFindResponse.data.data.length > 0) {
            setFindResults(editFindResponse.data.data);
          } else {
            setError('No students found with the provided information');
          }
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error('Error:', error);
      setError(
        error.response?.data?.message || 
        (error.response?.status === 404 ? 'API endpoint not found. Check server connection.' : 'An error occurred')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }
    
    setIsLoading(true);
    setSuccess(null);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    let uploadUrl = '';
    let operationType = ''; // To distinguish messages

    if (activeView === 'add') {
      uploadUrl = '/admin/students/upload';
      operationType = 'upload';
    } else if (activeView === 'delete') {
      uploadUrl = '/admin/students/delete-by-csv'; // New endpoint for CSV deletion
      operationType = 'deletion';
    } else {
      setError('File operation is not supported for the current view.');
      setIsLoading(false);
      return;
    }

    try {
      console.log(`Processing file ${selectedFile.name} for ${operationType} via ${uploadUrl}`);
      const response = await apiClient.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        let successMsg = '';
        if (operationType === 'upload') {
          successMsg = `Uploaded successfully! ${response.data.studentsCreated} students added, ${response.data.studentsFailed} errors.`;
        } else if (operationType === 'deletion') {
          successMsg = `Deletion process finished. ${response.data.studentsDeleted} students deleted, ${response.data.studentsFailed} errors.`;
        }
        setSuccess(successMsg);
        setSelectedFile(null); // Clear the selected file
        resetForm(); // Reset form fields

        if (activeView === 'delete') {
          setFindResults(null); // Clear any manually searched students
        }
      } else {
        // Handle cases where response.data.success is false but HTTP status is 2xx
        setError(response.data.message || `An unknown error occurred during file ${operationType}.`);
      }
    } catch (error) {
      console.error(`Error during file ${operationType}:`, error);
      setError(error.response?.data?.message || `An error occurred during file ${operationType}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }
    
    setIsLoading(true);
    setSuccess(null);
    setError(null);
    
    try {
      console.log(`Deleting student with ID: ${id}`);
      const response = await apiClient.delete(`/admin/students/${id}`);
      
      if (response.data.success) {
        setSuccess('Student deleted successfully!');
        setFindResults(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      setError(error.response?.data?.message || 'An error occurred deleting the student');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStudent = (student) => {
    // Modified to preserve the edit view
    setIsEditMode(true);
    setStudentId(student.studentId);
    setNameSurname(student.nameSurname);
    setEmail(student.email);
    setDepartment(student.department);
    setSelectedCourses(student.courses || []);
    
    // Store the ID for the update operation
    setFindResults({ id: student.id });
  };

  const resetForm = () => {
    setStudentId('');
    setNameSurname('');
    setEmail('');
    setDepartment('');
    setSelectedCourses([]);
    setMessage({ text: '', type: '' });
    setFindResults(null);
    setSelectedFile(null);
    setFileInputKey(Date.now());
    setIsEditMode(false); // Reset edit mode too
  };
  
  // Add this useEffect to initialize component
  useEffect(() => {
    // Component initialization if needed
  }, []);

  return (
    <div className={styles.studentManagement}>
      {/* Using the reusable AdminNavBar component */}
      <AdminNavBar />

      {/* Success Message */}
      {success && (
        <div className={styles.successMessage}>
          {success}
          <button onClick={() => setSuccess(null)} className={styles.closeBtn}>×</button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className={styles.errorMessage}>
          {error}
          <button onClick={() => setError(null)} className={styles.closeBtn}>×</button>
        </div>
      )}

      <div className={styles.mainContent}>
        {/* Status message - keeping this for backward compatibility */}
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
              className={`${styles.actionButton} ${activeView === 'add' && !isEditMode ? styles.active : ''}`} 
              onClick={() => {
                if (!isEditMode) { // Only switch if not in edit mode
                  setActiveView('add');
                  resetForm();
                }
              }}
            >
              <div className={`${styles.circleIcon} ${activeView === 'add' && !isEditMode ? styles.active : ''}`}>
                <span>+</span>
              </div>
              <span className={`${styles.buttonLabel} ${activeView === 'add' && !isEditMode ? styles.active : ''}`}>Add Student</span>
            </div>
            
            <div 
              className={`${styles.actionButton} ${activeView === 'delete' ? styles.active : ''}`} 
              onClick={() => {
                if (!isEditMode) { // Only switch if not in edit mode
                  setActiveView('delete');
                  resetForm();
                }
              }}
            >
              <div className={`${styles.circleIcon} ${activeView === 'delete' ? styles.active : ''}`}>
                <span>-</span>
              </div>
              <span className={`${styles.buttonLabel} ${activeView === 'delete' ? styles.active : ''}`}>Delete Student</span>
            </div>
            
            <div 
              className={`${styles.actionButton} ${activeView === 'edit' || isEditMode ? styles.active : ''}`} 
              onClick={() => {
                if (!isEditMode) { // Only switch if not in edit mode
                  setActiveView('edit');
                  resetForm();
                }
              }}
            >
              <div className={`${styles.circleIcon} ${activeView === 'edit' || isEditMode ? styles.active : ''}`}>
                <span>✎</span>
              </div>
              <span className={`${styles.buttonLabel} ${activeView === 'edit' || isEditMode ? styles.active : ''}`}>Edit Student</span>
            </div>
          </div>

          {(activeView === 'add' || activeView === 'delete') && !isEditMode && (
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
                  key={fileInputKey}
                />
              </label>

              {/* This part displays the name of the selected file */}
              {selectedFile && (
                <div className={styles.selectedFile}>
                  {selectedFile.name}
                </div>
              )}
              
              <button 
                className={styles.uploadFileBtn}
                onClick={handleFileUpload}
                disabled={isLoading || !selectedFile}
              >
                {isLoading ? 
                  (activeView === 'add' ? 'Uploading...' : 'Processing Delete...') :
                  (activeView === 'add' ? 'Upload (Add Students)' : 'Upload (Delete Students)')
                }
              </button>

              {/* Enhanced file format explanation section */}
              <div className={styles.uploadNote}>
                {activeView === 'add' ? (
                  <>
                    Note: For adding, CSV should contain columns for ID, Name, Email, Department, and optional Courses.
                    <br />
                    Required columns: studentId, nameSurname, email, department
                    <br />
                    Optional columns: courses (comma-separated course codes)
                    <br />
                    Students will be added to the system with the specified details.
                  </>
                ) : (
                  <>
                    Note: For deleting, CSV should contain Student IDs (one ID per line).
                    <br />
                    The first line can be a header (e.g., "ID", "StudentID", or "studentId").
                    <br />
                    Students listed in the CSV will be removed from the system.
                  </>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Panel - Form Section */}
        <div className={styles.rightPanel}>
          <div className={styles.formContainer}>
            {/* Add Student or Edit Student Form */}
            {(activeView === 'add' || isEditMode) && (
              <>
                <h2 className={styles.formTitle}>
                  {isEditMode ? 'Edit Student Information' : 'Enter Student Information'}
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
                      disabled={isEditMode} // Disable when editing
                      className={isEditMode ? styles.disabledInput : ''}
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
                  <div className={styles.formActions}>
                    <button 
                      type="submit" 
                      className={styles.formSubmitBtn}
                      disabled={isLoading}
                    >
                      {isEditMode ? 'Update Student' : 'Add Student'}
                    </button>
                    
                    {isEditMode && (
                      <button 
                        type="button"
                        className={styles.cancelButton}
                        onClick={() => {
                          resetForm();
                          setActiveView('edit'); // Go back to edit search view
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}

            {/* Delete Student Search Form */}
            {activeView === 'delete' && !isEditMode && (
              <>
                <h2 className={styles.formTitle}>Enter ID find Student</h2>
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
                      <div key={student.id} className={styles.studentCard}>
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
                          onClick={() => handleDeleteStudent(student.id)}
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

            {/* Edit Student Search Form */}
            {activeView === 'edit' && !isEditMode && (
              <>
                <h2 className={styles.formTitle}>Enter ID to find Student</h2>
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
                      <div key={student.id} className={styles.studentCard}>
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
        onSelectCourses={handleCourseSelection}
        selectedCourses={selectedCourses}
        department={department}
      />
    </div>
  );
};

export default AdminStudentManagement;