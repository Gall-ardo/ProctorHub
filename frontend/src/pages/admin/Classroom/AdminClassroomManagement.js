import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavBar from '../AdminNavBar';
import ConfirmationPopup from '../ConfirmationPopup';
import ErrorPopup from '../ErrorPopup';
import styles from './AdminClassroomManagement.module.css';
import axios from 'axios';

// Define API URL with fallback for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const AdminClassroomManagement = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('add'); // 'add', 'delete', 'edit'
  
  // Form states
  const [buildingId, setBuildingId] = useState('');
  const [classroomId, setClassroomId] = useState('');
  const [capacity, setCapacity] = useState('');
  const [examCapacity, setExamCapacity] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  // State for found classroom (for edit/delete)
  const [foundClassroom, setFoundClassroom] = useState(null);
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const resetForm = () => {
    setBuildingId('');
    setClassroomId('');
    setCapacity('');
    setExamCapacity('');
    setFoundClassroom(null);
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
    resetForm();
    setSuccess(null);
  };

  const validateForm = () => {
    if (activeView === 'add') {
      if (!buildingId || !classroomId || !capacity || !examCapacity) {
        setErrorMessage('Please fill in all fields');
        setShowError(true);
        return false;
      }
      
      // Add additional validation if needed
    } else if (activeView === 'delete' || activeView === 'edit') {
      if (!buildingId || !classroomId) {
        setErrorMessage('Please enter both Building ID and Classroom ID');
        setShowError(true);
        return false;
      }
    }
    
    return true;
  };

  const findClassroom = async () => {
    if (!validateForm()) return null;
    
    setLoading(true);
    
    try {
      const compositeId = `${buildingId}_${classroomId}`;
      const response = await axios.get(`${API_URL}/api/admin/classrooms/${compositeId}`);
      
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error finding classroom:', error);
      
      // Improved error handling
      if (error.response) {
        setErrorMessage(error.response.data?.message || `Error ${error.response.status}: Failed to find classroom`);
      } else if (error.request) {
        setErrorMessage('Server not responding. Please check your connection.');
      } else {
        setErrorMessage(`Error: ${error.message}`);
      }
      
      setShowError(true);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleAddClassroom = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setSuccess(null);
    
    try {
      const response = await axios.post(`${API_URL}/api/admin/classrooms`, {
        building: buildingId,
        classroomId: classroomId,
        capacity: parseInt(capacity),
        examCapacity: parseInt(examCapacity)
      });
      
      if (response.data.success) {
        setSuccess(response.data.message || 'Classroom added successfully!');
        resetForm();
      }
    } catch (error) {
      console.error('Error adding classroom:', error);
      
      // Improved error handling
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Status code:', error.response.status);
        setErrorMessage(error.response.data?.message || `Error ${error.response.status}: Failed to add classroom`);
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request);
        setErrorMessage('Server not responding. Please check your connection.');
      } else {
        // Something else caused the error
        setErrorMessage(`Error: ${error.message}`);
      }
      
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirmation = async (event) => {
    event.preventDefault();

    const classroomData = await findClassroom(); // This is the classroom object fetched from the API
    if (classroomData) {
      // You can still set foundClassroom if it's used elsewhere for UI,
      // but the delete logic will now use the explicitly passed classroomData.
      setFoundClassroom(classroomData);

      setConfirmationMessage(`Are you sure you want to delete classroom ${classroomData.name} (ID: ${classroomData.id}) in building ${classroomData.building}?`); // Added ID for clarity

      // Create a function that, when called, will execute handleDeleteClassroom
      // with the classroomData captured in its closure.
      const action = () => handleDeleteClassroom(classroomData);
      setConfirmationAction(() => action); // <--- MODIFIED: Store this specific action

      setShowConfirmation(true);
    }
  };


  const handleDeleteClassroom = async (classroomToDelete) => { // <--- MODIFIED: Added parameter
    setShowConfirmation(false);
    setLoading(true);
    setSuccess(null);

    // Add a guard check for the passed parameter
    if (!classroomToDelete || !classroomToDelete.id) {
      console.error("handleDeleteClassroom: classroomToDelete argument is invalid or missing ID.", classroomToDelete);
      setErrorMessage("Failed to delete: Essential classroom information is missing.");
      setShowError(true);
      setLoading(false); // Reset loading state
      return; // Prevent further execution
    }

    try {
      // Use the id from the passed classroomToDelete object
      const response = await axios.delete(`${API_URL}/api/admin/classrooms/${classroomToDelete.id}`); // <--- MODIFIED

      if (response.data.success) {
        setSuccess('Classroom deleted successfully!');
        resetForm(); // This will set the component's foundClassroom state to null, which is fine.
      }
    } catch (error) {
      console.error('Error deleting classroom:', error);
      if (error.response) {
        setErrorMessage(error.response.data?.message || `Error ${error.response.status}: Failed to delete classroom`);
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


  const handleFindClassroomToEdit = async (event) => {
    event.preventDefault();
    
    const classroomToEdit = await findClassroom();
    if (classroomToEdit) {
      setFoundClassroom(classroomToEdit);
      setBuildingId(classroomToEdit.building);
      setClassroomId(classroomToEdit.name);
      setCapacity(classroomToEdit.capacity);
      setExamCapacity(classroomToEdit.examSeatingCapacity);
    }
  };

  const handleUpdateClassroom = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setSuccess(null);
    
    try {
      const response = await axios.put(`${API_URL}/api/admin/classrooms/${foundClassroom.id}`, {
        classroomId: classroomId,
        capacity: parseInt(capacity),
        examCapacity: parseInt(examCapacity)
      });
      
      if (response.data.success) {
        setSuccess('Classroom updated successfully!');
        resetForm();
        setFoundClassroom(null);
      }
    } catch (error) {
      console.error('Error updating classroom:', error);
      
      // Improved error handling
      if (error.response) {
        setErrorMessage(error.response.data?.message || `Error ${error.response.status}: Failed to update classroom`);
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

  const handleCancelEdit = () => {
    resetForm();
    setFoundClassroom(null);
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
    setSuccess(null);
    setShowError(false); // Reset error before new attempt
    setErrorMessage('');

    let uploadUrl = '';
    let isDeleteOperation = false;

    if (activeView === 'add') {
      uploadUrl = `${API_URL}/api/admin/classrooms/upload`;
    } else if (activeView === 'delete') {
      uploadUrl = `${API_URL}/api/admin/classrooms/delete-upload`;
      isDeleteOperation = true;
    } else {
      // This case should ideally not be reached if UI restricts file upload
      // to 'add' and 'delete' views.
      setErrorMessage('File upload is not configured for the current action.');
      setShowError(true);
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post(uploadUrl, formData);

      if (response.data.success) {
        const stats = response.data.data; // { successful, failed, total, errors }
        let successMessage = '';

        if (isDeleteOperation) {
          successMessage = `Processed ${stats.total} classrooms for DELETE: ${stats.successful} successful, ${stats.failed} failed.`;
          // Log errors to console for debugging, but don't append to UI message by default
          if (stats.errors && stats.errors.length > 0 && stats.failed > 0) {
            console.warn("Deletion - CSV Processing Errors:", stats.errors);
            // If you want to add a brief summary of errors to the UI message for delete:
            // successMessage += ` (See console for ${stats.failed} error details)`;
          }
        } else { // Add operation
          successMessage = `Processed ${stats.total} classrooms for ADD: ${stats.successful} successful, ${stats.failed} failed.`;
          // Log errors to console for debugging, but don't append to UI message
          if (stats.errors && stats.errors.length > 0 && stats.failed > 0) {
            console.warn("Addition - CSV Processing Errors:", stats.errors);
          }
        }
        setSuccess(successMessage);
        setSelectedFile(null); // Clear the selected file from state

      } else {

        setErrorMessage(response.data.message || 'File processing failed on the server.');
        setShowError(true);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      if (error.response) {
        setErrorMessage(error.response.data?.message || `Error ${error.response.status}: Failed to upload file`);
      } else if (error.request) {
        // The request was made but no response was received
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
    <div className={styles.classroomManagement}>
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
              <span className={`${styles.buttonLabel} ${activeView === 'add' ? styles.active : ''}`}>Add Classroom</span>
            </div>
            
            <div 
              className={`${styles.actionButton} ${activeView === 'delete' ? styles.active : ''}`} 
              onClick={() => handleViewChange('delete')}
            >
              <div className={`${styles.circleIcon} ${activeView === 'delete' ? styles.active : ''}`}>
                <span>-</span>
              </div>
              <span className={`${styles.buttonLabel} ${activeView === 'delete' ? styles.active : ''}`}>Delete Classroom</span>
            </div>
            
            <div 
              className={`${styles.actionButton} ${activeView === 'edit' ? styles.active : ''}`} 
              onClick={() => handleViewChange('edit')}
            >
              <div className={`${styles.circleIcon} ${activeView === 'edit' ? styles.active : ''}`}>
                <span>✎</span>
              </div>
              <span className={`${styles.buttonLabel} ${activeView === 'edit' ? styles.active : ''}`}>Edit Classroom</span>
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
                // To ensure onChange fires even if the same file is selected again after clearing:
                // you might need to reset the input's value.
                // A common trick is to set event.target.value = null inside handleFileSelect
                // if you are not using a key to re-render.
                // However, since `setSelectedFile` is updated, React might handle this.
                // If not, you'd do:
                onChange={(e) => {
                  handleFileSelect(e);
                  // e.target.value = null; // Add this if re-selecting the same file doesn't work after an upload
                }}
                // Or, give the input a key that changes when you want to reset it
                // key={selectedFile ? selectedFile.name : 'file-input'}
              />
            </label>
            {selectedFile && <div className={styles.selectedFile}>{selectedFile.name}</div>}
            <button
              className={styles.uploadFileBtn}
              onClick={handleFileUpload}
              disabled={loading || !selectedFile} // Also disable if no file selected
            >
              {loading ? 'Uploading...' : 'Upload File'}
            </button>
            <div className={styles.uploadNote}>
              {activeView === 'add' && 'Note: CSV for adding should contain columns: Building, ClassroomId, Capacity, and ExamCapacity.'}
              {activeView === 'delete' && 'Note: CSV for deleting should contain columns: Building and ClassroomId.'}
            </div>
          </div>
          )}
        </div>

        {/* Right Panel - Form Section */}
        <div className={styles.rightPanel}>
          <div className={styles.formContainer}>
            {activeView === 'add' && (
              <>
                <h2 className={styles.formTitle}>Enter Classroom Information</h2>
                <form onSubmit={handleAddClassroom}>
                  <div className={styles.formGroup}>
                    <label>Building <span className={styles.requiredField}>*</span></label>
                    <input 
                      type="text" 
                      placeholder="Enter building ID" 
                      value={buildingId}
                      onChange={(e) => setBuildingId(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Classroom ID <span className={styles.requiredField}>*</span></label>
                    <input 
                      type="text" 
                      placeholder="Enter classroom ID" 
                      value={classroomId}
                      onChange={(e) => setClassroomId(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Capacity <span className={styles.requiredField}>*</span></label>
                    <input 
                      type="number" 
                      placeholder="Enter capacity" 
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Exam Capacity <span className={styles.requiredField}>*</span></label>
                    <input 
                      type="number" 
                      placeholder="Enter exam capacity" 
                      value={examCapacity}
                      onChange={(e) => setExamCapacity(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className={styles.formSubmitBtn}
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add Classroom'}
                  </button>
                </form>
              </>
            )}

            {activeView === 'delete' && (
              <>
                <h2 className={styles.formTitle}>Enter building ID and classroom ID to Find Classroom</h2>
                <form onSubmit={handleDeleteConfirmation}>
                  <div className={styles.formGroup}>
                    <label>Building <span className={styles.requiredField}>*</span></label>
                    <input 
                      type="text" 
                      placeholder="Enter building ID" 
                      value={buildingId}
                      onChange={(e) => setBuildingId(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Classroom ID <span className={styles.requiredField}>*</span></label>
                    <input 
                      type="text" 
                      placeholder="Enter classroom ID" 
                      value={classroomId}
                      onChange={(e) => setClassroomId(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className={styles.formSubmitBtn}
                    disabled={loading}
                  >
                    {loading ? 'Finding...' : 'Find Classroom to Delete'}
                  </button>
                </form>
              </>
            )}

            {activeView === 'edit' && !foundClassroom && (
              <>
                <h2 className={styles.formTitle}>Enter building ID and classroom ID to Find Classroom</h2>
                <form onSubmit={handleFindClassroomToEdit}>
                  <div className={styles.formGroup}>
                    <label>Building <span className={styles.requiredField}>*</span></label>
                    <input 
                      type="text" 
                      placeholder="Enter building ID" 
                      value={buildingId}
                      onChange={(e) => setBuildingId(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Classroom ID <span className={styles.requiredField}>*</span></label>
                    <input 
                      type="text" 
                      placeholder="Enter classroom ID" 
                      value={classroomId}
                      onChange={(e) => setClassroomId(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className={styles.formSubmitBtn}
                    disabled={loading}
                  >
                    {loading ? 'Finding...' : 'Find Classroom to Edit'}
                  </button>
                </form>
              </>
            )}

            {activeView === 'edit' && foundClassroom && (
              <>
                <h2 className={styles.formTitle}>Edit Classroom Information</h2>
                <form onSubmit={handleUpdateClassroom}>
                  <div className={styles.formGroup}>
                    <label>Building (non-editable)</label>
                    <input 
                      type="text" 
                      value={buildingId}
                      disabled
                      className={styles.readOnly}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Classroom ID <span className={styles.requiredField}>*</span></label>
                    <input 
                      type="text" 
                      value={classroomId}
                      disabled
                      className={styles.readOnly}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Capacity <span className={styles.requiredField}>*</span></label>
                    <input 
                      type="number" 
                      placeholder="Enter capacity" 
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Exam Capacity <span className={styles.requiredField}>*</span></label>
                    <input 
                      type="number" 
                      placeholder="Enter exam capacity" 
                      value={examCapacity}
                      onChange={(e) => setExamCapacity(e.target.value)}
                    />
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
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Classroom'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Popup */}
      {showConfirmation && (
        <ConfirmationPopup
          title="Confirm Action"
          message={confirmationMessage}
          onConfirm={() => {
            if (confirmationAction) { // confirmationAction is now: () => handleDeleteClassroom(classroomData)
              confirmationAction();   // This executes the function with the captured classroomData
            } else {
              // Fallback if confirmationAction is not set (should not happen if popup is shown correctly)
              setShowConfirmation(false);
            }
          }}
          onCancel={() => setShowConfirmation(false)}
          showCancelButton={true}
          confirmText="Confirm"
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

export default AdminClassroomManagement;