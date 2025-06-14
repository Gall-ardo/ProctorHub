import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavBar from '../AdminNavBar';
import ConfirmationPopup from '../ConfirmationPopup';
import ErrorPopup from '../ErrorPopup';
import styles from './AdminUserManagement.module.css';
import axios from 'axios';

// Define API URL with fallback for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const AdminUserManagement = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('add'); // 'add', 'delete', 'edit'
  
  // Form states
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('');
  const [department, setDepartment] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isPhd, setIsPhd] = useState(false);
  const [isPartTime, setIsPartTime] = useState(false);
  const [isTaAssigner, setIsTaAssigner] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [resetPasswordUserId, setResetPasswordUserId] = useState(null);
  const [editMode, setEditMode] = useState(false); // New state to track if we're in edit mode
  const [showForceDeleteConfirmation, setShowForceDeleteConfirmation] = useState(false);
  const [forceDeleteUserId, setForceDeleteUserId] = useState(null);
  const [forceDeleteCSV, setForceDeleteCSV] = useState(false); // For CSV force delete option


  // User type options - Removed chair option
  const userTypeOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'Instructor', value: 'instructor' },
    { label: 'Secretary', value: 'secretary' },
    { label: 'Dean\'s Office', value: 'dean' },
    { label: 'Teaching Assistant', value: 'ta' }
  ];

  // Department options
  const departmentOptions = [
    { label: 'CS', value: 'CS' },
    { label: 'IE', value: 'IE' },
    { label: 'EEE', value: 'EEE' }
  ];

  const clearForm = () => {
    setUserId('');
    setName('');
    setEmail('');
    setUserType('');
    setDepartment('');
    setIsPhd(false);
    setIsPartTime(false);
    setIsTaAssigner(false);
    setSearchResults([]);
    setEditMode(false); // Reset edit mode when clearing form
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

  const handleViewChange = (view) => {
    setActiveView(view);
    clearForm();
    setError(null);
    setSuccess(null);
  };

  const validateForm = () => {
    // Basic validation
    if (activeView === 'add') {
      if (!userId || !name || !email || !userType) {
        setErrorMessage('Please fill all required fields');
        setShowError(true);
        return false;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setErrorMessage('Please enter a valid email address');
        setShowError(true);
        return false;
      }
      
      // Department validation for instructor, secretary and TA
      if ((userType === 'instructor' || userType === 'ta' || userType === "secretary") && !department) {
        setErrorMessage('Department is required for instructors, departments secretary, and teaching assistants');
        setShowError(true);
        return false;
      }
    } else if (activeView === 'delete' || activeView === 'edit') {
      if (!userId && !email) {
        setErrorMessage('Please enter either ID or email to search');
        setShowError(true);
        return false;
      }
    }
    
    return true;
  };

  const handleAddUser = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const userData = {
        id: userId,
        name,
        email,
        userType
      };
      
      // Add department for instructor, secretary, and TA
      if (userType === 'instructor' || userType === 'ta' || userType === "secretary") {
        userData.department = department;
      }

      // Add instructor specific fields
      if (userType === 'instructor') {
        userData.isTaAssigner = isTaAssigner;
      }

      // Add TA specific fields
      if (userType === 'ta') {
        userData.isPHD = isPhd;
        userData.isPartTime = isPartTime;
      }
      
      console.log('Sending user data:', userData);
      
      // Use the defined API_URL constant instead of process.env directly
      const response = await axios.post(`${API_URL}/api/admin/users`, userData);
      
      console.log('Response:', response.data);
      
      setSuccess(response.data.message || 'User added successfully. A welcome email with login credentials has been sent.');
      clearForm();
    } catch (err) {
      console.error('Error adding user:', err);
      
      // Improved error handling
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Status code:', err.response.status);
        setErrorMessage(err.response.data?.message || `Error ${err.response.status}: Failed to add user`);
      } else if (err.request) {
        // Request was made but no response received
        console.error('No response received:', err.request);
        setErrorMessage('Server not responding. Please check your connection.');
      } else {
        // Something else caused the error
        setErrorMessage(`Error: ${err.message}`);
      }
      
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUser = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = {};
      if (userId) params.id = userId;
      if (email) params.email = email;
      
      const response = await axios.get(`${API_URL}/api/admin/users`, { params });
      
      // Filter out student users from the search results
      const filteredResults = response.data.filter(user => user.userType !== 'student');
      
      setSearchResults(filteredResults);
      
      if (filteredResults.length === 0) {
        setErrorMessage('No users found');
        setShowError(true);
      }
    } catch (err) {
      console.error('Error searching users:', err);
      if (err.response) {
        setErrorMessage(err.response.data?.message || `Error ${err.response.status}: Failed to search users`);
      } else if (err.request) {
        setErrorMessage('Server not responding. Please check your connection.');
      } else {
        setErrorMessage(`Error: ${err.message}`);
      }
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirmation = (user) => {
    const userForPopup = {
      id: user.id,
      nameSurname: user.name,  // Assuming 'name' in your backend maps to 'nameSurname' in your UI
      email: user.email,
      phoneNumber: user.phoneNumber || 'N/A'  // Add a default if phoneNumber isn't available
    };
    
    setConfirmationData(userForPopup);
    setShowConfirmation(true);
  };

  const handleResetPasswordConfirmation = (userId) => {
    setResetPasswordUserId(userId);
    setShowResetConfirmation(true);
  };

  const handleResetPassword = async () => {
    setShowResetConfirmation(false);
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/api/admin/users/${resetPasswordUserId}/reset-password`);
      
      setSuccess(response.data.message || 'Password reset successfully. A new password has been sent to the user\'s email.');
    } catch (err) {
      console.error('Error resetting password:', err);
      if (err.response) {
        setErrorMessage(err.response.data?.message || `Error ${err.response.status}: Failed to reset password`);
      } else if (err.request) {
        setErrorMessage('Server not responding. Please check your connection.');
      } else {
        setErrorMessage(`Error: ${err.message}`);
      }
      setShowError(true);
    } finally {
      setLoading(false);
      setResetPasswordUserId(null);
    }
  };

  const handleDeleteUser = async (id) => {
    setShowConfirmation(false);
    setLoading(true);
    
    try {
      // Make sure the URL is correctly constructed
      await axios.delete(`${API_URL}/api/admin/users/${id}`);
      
      setSuccess('User deleted successfully');
      setSearchResults(searchResults.filter(user => user.id !== id));
      
      if (searchResults.length <= 1) {
        clearForm();
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      
      // Add more detailed error handling
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
        
        if (err.response.status === 409) {
          // Foreign key constraint error - offer force delete
          setErrorMessage(
            `Cannot delete user because they have associated data in the system. ` +
            `Would you like to force delete this user and remove all dependencies?`
          );
          
          // Store the user ID for force deletion
          setForceDeleteUserId(id);
          
          // Show force delete confirmation
          setShowForceDeleteConfirmation(true);
        } else {
          setErrorMessage(err.response.data?.message || `Error ${err.response.status}: Failed to delete user`);
          setShowError(true);
        }
      } else if (err.request) {
        console.error('No response received:', err.request);
        setErrorMessage('Server not responding. Please check your connection.');
        setShowError(true);
      } else {
        setErrorMessage(`Error: ${err.message}`);
        setShowError(true);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Add the force delete handler
  const handleForceDelete = async () => {
    setShowForceDeleteConfirmation(false);
    setLoading(true);
    
    try {
      // Call the force delete endpoint
      await axios.delete(`${API_URL}/api/admin/users/${forceDeleteUserId}/force?confirm=true`);
      
      setSuccess('User and all associated data successfully deleted');
      setSearchResults(searchResults.filter(user => user.id !== forceDeleteUserId));
      
      if (searchResults.length <= 1) {
        clearForm();
      }
    } catch (err) {
      console.error('Error force deleting user:', err);
      
      if (err.response) {
        setErrorMessage(err.response.data?.message || `Error ${err.response.status}: Failed to force delete user`);
      } else if (err.request) {
        setErrorMessage('Server not responding. Please check your connection.');
      } else {
        setErrorMessage(`Error: ${err.message}`);
      }
      setShowError(true);
    } finally {
      setLoading(false);
      setForceDeleteUserId(null);
    }
  };


  const handleEditUser = (user) => {
    setUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setUserType(user.userType);
    
    // If user is instructor, secretary, or TA, set department
    if (user.userType === 'instructor' || user.userType === 'ta' || user.userType === "secretary") {
      setDepartment(user.department || '');
    }
    
    // If user is instructor, set TA Assigner status
    if (user.userType === 'instructor') {
      setIsTaAssigner(user.isTaAssigner || false);
    }
    
    if (user.userType === 'ta') {
      setIsPhd(user.isPHD || false);
      setIsPartTime(user.isPartTime || false);
    }
    
    // Turn on edit mode
    setEditMode(true);
    
    // Clear search results
    setSearchResults([]);
  };

  const handleUpdateUser = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const userData = {
        name,
        email,
        userType
      };
      
      // Add department for instructor, secretary, and TA
      if (userType === 'instructor' || userType === 'ta' || userType === "secretary") {
        userData.department = department;
      }

      // Add instructor specific fields
      if (userType === 'instructor') {
        userData.isTaAssigner = isTaAssigner;
      }

      // Add TA specific fields
      if (userType === 'ta') {
        userData.isPHD = isPhd;
        userData.isPartTime = isPartTime;
      }
      
      await axios.put(`${API_URL}/api/admin/users/${userId}`, userData);
      
      setSuccess('User updated successfully');
    } catch (err) {
      console.error('Error updating user:', err);
      if (err.response) {
        setErrorMessage(err.response.data?.message || `Error ${err.response.status}: Failed to update user`);
      } else if (err.request) {
        setErrorMessage('Server not responding. Please check your connection.');
      } else {
        setErrorMessage(`Error: ${err.message}`);
      }
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Clear form and turn off edit mode
    clearForm();
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a file first');
      setShowError(true);
      return;
    }
    
    if (selectedFile.type !== 'text/csv') {
      setErrorMessage('Only CSV files are allowed');
      setShowError(true);
      return;
    }
    
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await axios.post(
        `${API_URL}/api/admin/users/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setSuccess(response.data.message || `File uploaded successfully. ${response.data.usersCreated} users created.`);
      setSelectedFile(null);
    } catch (err) {
      console.error('Error uploading file:', err);
      if (err.response) {
        setErrorMessage(err.response.data?.message || `Error ${err.response.status}: Failed to upload file`);
      } else if (err.request) {
        setErrorMessage('Server not responding. Please check your connection.');
      } else {
        setErrorMessage(`Error: ${err.message}`);
      }
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUsersFromCSV = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a CSV file first');
      setShowError(true);
      return;
    }
    if (selectedFile.type !== 'text/csv') {
      setErrorMessage('Only CSV files are allowed for deletion');
      setShowError(true);
      return;
    }

    // Ask for confirmation before deleting
    const confirmCsvDelete = window.confirm(
      `Are you sure you want to attempt to delete users listed in ${selectedFile.name}? ` +
      (forceDeleteCSV ? "This will be a FORCE DELETE, removing users and their dependencies. " : "") +
      `This action might be irreversible.`
    );

    if (!confirmCsvDelete) {
      setSelectedFile(null); // Clear file if user cancels
      setForceDeleteCSV(false); // Reset the force delete checkbox
      return;
    }

    setLoading(true);
    // setError(null); // You might want to clear general errors if you have a separate 'error' state
    setSuccess(null); // Clear previous success message
    setErrorMessage(''); // Clear specific error message for this operation
    setShowError(false); // Hide error popup

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const endpoint = `${API_URL}/api/admin/users/delete-csv${forceDeleteCSV ? '?force=true' : ''}`;

      const response = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // --- MODIFIED PART ---
      // Directly use the (now shorter) message from the backend
      setSuccess(response.data.message); 
      
      // Log detailed errors to the browser's developer console for admin debugging if they exist
      if (response.data.errors && response.data.errors.length > 0) {
        console.warn("CSV Deletion - Detailed Failures (for admin debugging):", response.data.errors);
      }
      // --- END MODIFIED PART ---
      
      setSelectedFile(null); // Clear the selected file
      setForceDeleteCSV(false); // Reset the force delete checkbox
      // Optionally clear search form if it was used to find users before deciding to bulk delete
      // clearForm(); 
      // setSearchResults([]); 
    } catch (err) {
      console.error('Error deleting users from CSV:', err);
      // Use the error message from the backend if available, otherwise a generic one
      setErrorMessage(
        err.response?.data?.message || 
        err.response?.data?.error || 
        `Error ${err.response?.status || ''}: Failed to process CSV for user deletion.`
      );
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.userManagement}>
      {/* Using the reusable AdminNavBar component */}
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
              <span className={`${styles.buttonLabel} ${activeView === 'add' ? styles.active : ''}`}>Add User</span>
            </div>
            
            <div 
              className={`${styles.actionButton} ${activeView === 'delete' ? styles.active : ''}`} 
              onClick={() => handleViewChange('delete')}
            >
              <div className={`${styles.circleIcon} ${activeView === 'delete' ? styles.active : ''}`}>
                <span>-</span>
              </div>
              <span className={`${styles.buttonLabel} ${activeView === 'delete' ? styles.active : ''}`}>Delete User</span>
            </div>
            
            <div 
              className={`${styles.actionButton} ${activeView === 'edit' ? styles.active : ''}`} 
              onClick={() => handleViewChange('edit')}
            >
              <div className={`${styles.circleIcon} ${activeView === 'edit' ? styles.active : ''}`}>
                <span>✎</span>
              </div>
              <span className={`${styles.buttonLabel} ${activeView === 'edit' ? styles.active : ''}`}>Edit User</span>
            </div>
          </div>

        {(activeView === 'add' || activeView === 'delete') && (
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
              // OLD: onClick={handleFileUpload}
              // REPLACE onClick with this:
              onClick={activeView === 'add' ? handleFileUpload : handleDeleteUsersFromCSV}
              disabled={loading || !selectedFile}
            >
              {/* OLD: {loading ? 'Uploading...' : 'Upload File'} */}
              {/* REPLACE button text with this: */}
              {loading ? (activeView === 'add' ? 'Uploading...' : 'Processing Delete...') 
                      : (activeView === 'add' ? 'Upload (Add Users)' : 'Upload (Delete Users)')}
            </button>
            <div className={styles.uploadNote}>
              {/* OLD text */}
              {/* REPLACE note text with this: */}
              {activeView === 'add' ? (
                <>
                  Note: For adding, CSV should contain columns for ID, Name, Email, UserType, and Department (if applicable).
                  <br />
                  Users will receive emails with auto-generated passwords.
                </>
              ) : ( // activeView === 'delete'
                <>
                  Note: For deleting, CSV should contain User IDs (one ID per line).
                  <br />
                  The first line can be a header (e.g., "ID" or "UserID").
                  <br />
                  Default is standard delete. Use 'Force Delete' checkbox for dependencies.
                </>
              )}
            </div>
          </div>
        )}
        </div>

        {/* Right Panel - Form Section */}
        <div className={styles.rightPanel}>
          <div className={styles.formContainer}>
            {activeView === 'add' && (
              <>
                <h2 className={styles.formTitle}>Enter User Information</h2>
                <form onSubmit={handleAddUser}>
                  <div className={styles.formGroup}>
                    <label>ID <span className={styles.requiredField}>*</span></label>
                    <input 
                      type="text" 
                      placeholder="Enter ID" 
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Name <span className={styles.requiredField}>*</span></label>
                    <input 
                      type="text" 
                      placeholder="Enter name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email <span className={styles.requiredField}>*</span></label>
                    <input 
                      type="email" 
                      placeholder="Enter email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>User Type <span className={styles.requiredField}>*</span></label>
                    <div className={styles.selectionList}>
                      {userTypeOptions.map((type) => (
                        <div 
                          key={type.value} 
                          className={`${styles.selectionItem} ${userType === type.value ? styles.selected : ''}`}
                          onClick={() => setUserType(type.value)}
                        >
                          {type.label}
                          <span className={styles.optionIndicator}></span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Show department for instructor, secretary, and TA */}
                  {(userType === 'instructor' || userType === 'ta' || userType === 'secretary') && (
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
                  )}
                  
                  {/* TA Assigner checkbox for Instructor */}
                  {userType === 'instructor' && (
                    <div className={styles.formGroup}>
                      <label>Instructor Role</label>
                      <div className={styles.checkboxContainer}>
                        <div 
                          className={`${styles.checkboxItem} ${isTaAssigner ? styles.checked : ''}`}
                          onClick={() => setIsTaAssigner(!isTaAssigner)}
                        >
                          <div className={`${styles.checkbox} ${isTaAssigner ? styles.checked : ''}`}>
                            {isTaAssigner && <span className={styles.checkmark}>✓</span>}
                          </div>
                          <span>TA Assigner</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Additional fields for TA */}
                  {userType === 'ta' && (
                    <>
                      <div className={styles.formGroup}>
                        <label>Status</label>
                        <div className={styles.checkboxContainer}>
                          <div 
                            className={`${styles.checkboxItem} ${isPhd ? styles.checked : ''}`}
                            onClick={() => setIsPhd(!isPhd)}
                          >
                            <div className={`${styles.checkbox} ${isPhd ? styles.checked : ''}`}>
                              {isPhd && <span className={styles.checkmark}>✓</span>}
                            </div>
                            <span>PhD Student</span>
                          </div>
                          <div 
                            className={`${styles.checkboxItem} ${isPartTime ? styles.checked : ''}`}
                            onClick={() => setIsPartTime(!isPartTime)}
                          >
                            <div className={`${styles.checkbox} ${isPartTime ? styles.checked : ''}`}>
                              {isPartTime && <span className={styles.checkmark}>✓</span>}
                            </div>
                            <span>Part-time</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className={styles.formNote}>
                    Note: A random password will be generated and sent to the user's email.
                  </div>
                  
                  <button 
                    type="submit" 
                    className={styles.formSubmitBtn}
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add User'}
                  </button>
                </form>
              </>
            )}

            {activeView === 'delete' && (
              <>
                <h2 className={styles.formTitle}>Enter ID to find User</h2>
                <form onSubmit={handleSearchUser}>
                  <div className={styles.formGroup}>
                    <label>ID</label>
                    <input 
                      type="text" 
                      placeholder="Enter ID" 
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className={styles.formSubmitBtn}
                    disabled={loading}
                  >
                    {loading ? 'Searching...' : 'Find User'}
                  </button>
                </form>
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className={styles.searchResults}>
                    <h3>Search Results</h3>
                    <ul className={styles.resultsList}>
                      {searchResults.map(user => (
                        <li key={user.id} className={styles.resultItem}>
                          <div className={styles.resultInfo}>
                            <div><strong>ID:</strong> {user.id}</div>
                            <div><strong>Name:</strong> {user.name}</div>
                            <div><strong>Email:</strong> {user.email}</div>
                            <div><strong>Type:</strong> {user.userType}</div>
                            {(user.userType === 'instructor' || user.userType === 'ta' || userType === 'secretary') && user.department && (
                              <div><strong>Department:</strong> {user.department}</div>
                            )}
                            {user.userType === 'instructor' && user.isTaAssigner !== undefined && (
                              <div><strong>TA Assigner:</strong> {user.isTaAssigner ? 'Yes' : 'No'}</div>
                            )}
                          </div>
                          <button 
                            onClick={() => handleDeleteConfirmation(user)}
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
                {!editMode ? (
                  // Search form - similar to delete view
                  <>
                    <h2 className={styles.formTitle}>Enter ID to find User</h2>
                    <form onSubmit={handleSearchUser}>
                      <div className={styles.formGroup}>
                        <label>ID</label>
                        <input 
                          type="text" 
                          placeholder="Enter ID" 
                          value={userId}
                          onChange={(e) => setUserId(e.target.value)}
                        />
                      </div> 
                      <button 
                        type="submit" 
                        className={styles.formSubmitBtn}
                        disabled={loading}
                      >
                        {loading ? 'Searching...' : 'Find User to Edit'}
                      </button>
                    </form>
                    
                    {/* Search Results */}
                    {searchResults.length > 0 && (
                      <div className={styles.searchResults}>
                        <h3>Search Results</h3>
                        <ul className={styles.resultsList}>
                          {searchResults.map(user => (
                            <li key={user.id} className={styles.resultItem}>
                              <div className={styles.resultInfo}>
                                <div><strong>ID:</strong> {user.id}</div>
                                <div><strong>Name:</strong> {user.name}</div>
                                <div><strong>Email:</strong> {user.email}</div>
                                <div><strong>Type:</strong> {user.userType}</div>
                                {(user.userType === 'instructor' || user.userType === 'ta' || user.userType === 'secretary') && user.department && (
                                  <div><strong>Department:</strong> {user.department}</div>
                                )}
                                {user.userType === 'instructor' && user.isTaAssigner !== undefined && (
                                  <div><strong>TA Assigner:</strong> {user.isTaAssigner ? 'Yes' : 'No'}</div>
                                )}
                              </div>
                              <div className={styles.buttonGroup}>
                                <button 
                                  onClick={() => handleResetPasswordConfirmation(user.id)}
                                  className={styles.resetBtn}
                                >
                                  Reset Password
                                </button>
                                <button 
                                  onClick={() => handleEditUser(user)}
                                  className={styles.editBtn}
                                >
                                  Edit
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  // Edit form
                  <>
                    <h2 className={styles.formTitle}>Edit User Information</h2>
                    <form onSubmit={handleUpdateUser}>
                      <div className={styles.formGroup}>
                        <label>ID</label>
                        <input 
                          type="text" 
                          value={userId}
                          readOnly
                          className={styles.readOnly}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Name</label>
                        <input 
                          type="text" 
                          placeholder="Enter name" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Email</label>
                        <input 
                          type="email" 
                          placeholder="Enter email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>User Type</label>
                        <div className={styles.selectionList}>
                          {userTypeOptions.map((type) => (
                            <div 
                              key={type.value} 
                              className={`${styles.selectionItem} ${userType === type.value ? styles.selected : ''}`}
                              onClick={() => setUserType(type.value)}
                            >
                              {type.label}
                              <span className={styles.optionIndicator}></span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Show department for instructor, secretary, and TA */}
                      {(userType === 'instructor' || userType === 'ta' || userType === 'secretary') && (
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
                      )}

                      {/* TA Assigner checkbox for Instructor */}
                      {userType === 'instructor' && (
                        <div className={styles.formGroup}>
                          <label>Instructor Role</label>
                          <div className={styles.checkboxContainer}>
                            <div 
                              className={`${styles.checkboxItem} ${isTaAssigner ? styles.checked : ''}`}
                              onClick={() => setIsTaAssigner(!isTaAssigner)}
                            >
                              <div className={`${styles.checkbox} ${isTaAssigner ? styles.checked : ''}`}>
                                {isTaAssigner && <span className={styles.checkmark}>✓</span>}
                              </div>
                              <span>TA Assigner</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Additional fields for TA */}
                      {userType === 'ta' && (
                        <>
                          <div className={styles.formGroup}>
                            <label>Status</label>
                            <div className={styles.checkboxContainer}>
                              <div 
                                className={`${styles.checkboxItem} ${isPhd ? styles.checked : ''}`}
                                onClick={() => setIsPhd(!isPhd)}
                              >
                                <div className={`${styles.checkbox} ${isPhd ? styles.checked : ''}`}>
                                  {isPhd && <span className={styles.checkmark}>✓</span>}
                                </div>
                                <span>PhD Student</span>
                              </div>
                              <div 
                                className={`${styles.checkboxItem} ${isPartTime ? styles.checked : ''}`}
                                onClick={() => setIsPartTime(!isPartTime)}
                              >
                                <div className={`${styles.checkbox} ${isPartTime ? styles.checked : ''}`}>
                                  {isPartTime && <span className={styles.checkmark}>✓</span>}
                                </div>
                                <span>Part-time</span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      
                      <div className={styles.formButtonGroup}>
                        <button 
                          type="button" 
                          className={styles.cancelBtn}
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>
                        <button 
                          type="button" 
                          className={styles.resetPasswordBtn}
                          onClick={() => handleResetPasswordConfirmation(userId)}
                        >
                          Reset Password
                        </button>
                        <button 
                          type="submit" 
                          className={styles.formSubmitBtn}
                          disabled={loading}
                        >
                          {loading ? 'Updating...' : 'Update User'}
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
      {showForceDeleteConfirmation && (
        <ConfirmationPopup
          title="Force Delete User"
          message="WARNING: This will delete the user and ALL associated data (schedules, workloads, assignments, etc.). This action cannot be undone and may affect system integrity. Are you sure you want to proceed?"
          confirmText="Force Delete User"
          onCancel={() => {
            setShowForceDeleteConfirmation(false);
            setForceDeleteUserId(null);
          }}
          onConfirm={handleForceDelete}
          confirmButtonClass={styles.dangerButton}
        />
      )}
      {showConfirmation && (
        <ConfirmationPopup
          user={confirmationData}
          title="Confirm User Deletion"
          message="Are you sure you want to delete this user? This action cannot be undone."
          confirmText="Delete User"
          onCancel={() => setShowConfirmation(false)}
          onConfirm={() => handleDeleteUser(confirmationData.id)}
          confirmButtonClass={styles.dangerButton}
        />
      )}

      {/* Confirmation Popup for Password Reset */}
      {showResetConfirmation && (
        <ConfirmationPopup
          title="Confirm Password Reset"
          message="Are you sure you want to reset this user's password? A new password will be generated and sent to their email."
          confirmText="Reset Password"
          onCancel={() => {
            setShowResetConfirmation(false);
            setResetPasswordUserId(null);
          }}
          onConfirm={handleResetPassword}
        />
      )}

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

export default AdminUserManagement;