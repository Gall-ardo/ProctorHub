import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminUserManagement.module.css';
import ErrorPopup from '../ErrorPopup';
import AdminUserDeleteConfirmation from './AdminUserDeleteConfirmation';
import AdminNavBar from '../AdminNavBar'; // Import the AdminNavBar component

const AdminUserManagement = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('add'); // 'add', 'delete', 'edit'
  
  // Form states
  const [userId, setUserId] = useState('');
  const [nameSurname, setNameSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userType, setUserType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  
  // Popup states
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Mock user database for demonstration
  const mockUsers = [
    {
      id: '12345678',
      nameSurname: 'Sude Ergün',
      email: 'sude.ergun@bilkent.edu.tr',
      phoneNumber: '05123456789',
      userType: 'master-part'
    },
    {
      id: '87654321',
      nameSurname: 'Ahmet Yılmaz',
      email: 'ahmet.yilmaz@bilkent.edu.tr',
      phoneNumber: '05556667788',
      userType: 'phd-full'
    }
  ];

  // User type options
  const userTypeOptions = [
    { label: 'PhD - part time', value: 'phd-part' },
    { label: 'PhD - full time', value: 'phd-full' },
    { label: 'Master - part time', value: 'master-part' },
    { label: 'Master - full time', value: 'master-full' }
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

  const findUser = (id, emailToFind) => {
    // In a real app, this would be an API call
    return mockUsers.find(user => 
      (id && user.id === id) || 
      (emailToFind && user.email === emailToFind)
    );
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    
    // Handle different form submissions based on active view
    switch(activeView) {
      case 'add':
        console.log('Adding user:', { 
          userId, 
          nameSurname, 
          email, 
          phoneNumber,
          userType 
        });
        // Add API call here
        break;
      case 'delete':
        const userFound = findUser(userId, email);
        if (userFound) {
          setUserToDelete(userFound);
          setShowConfirmation(true);
        } else {
          setErrorMessage("This user doesn't exist.");
          setShowError(true);
        }
        break;
      case 'edit':
        if (userToEdit) {
          console.log('Editing user:', {
            userId,
            nameSurname,
            email,
            phoneNumber,
            userType
          });
          // Update API call here
        } else {
          const userFound = findUser(userId, email);
          if (userFound) {
            setUserToEdit(userFound);
            
            // Update form fields with found user data
            setUserId(userFound.id);
            setNameSurname(userFound.nameSurname);
            setEmail(userFound.email);
            setPhoneNumber(userFound.phoneNumber);
            setUserType(userFound.userType);
          } else {
            setErrorMessage("This user doesn't exist.");
            setShowError(true);
          }
        }
        break;
      default:
        break;
    }
  };

  const handleFileUpload = () => {
    if (selectedFile) {
      console.log('Uploading file:', selectedFile);
      // File upload API call here
    } else {
      setErrorMessage("Please select a file first.");
      setShowError(true);
    }
  };

  const resetForm = () => {
    setUserId('');
    setNameSurname('');
    setEmail('');
    setPhoneNumber('');
    setUserType('');
    setUserToEdit(null);
  };

  const handleDeleteConfirm = () => {
    console.log('Deleting user:', userToDelete);
    // API call to delete user
    setShowConfirmation(false);
    setUserToDelete(null);
    resetForm();
    // Show success message or redirect
  };

  const handleDeleteCancel = () => {
    setShowConfirmation(false);
    setUserToDelete(null);
  };

  const handleErrorClose = () => {
    setShowError(false);
    setErrorMessage('');
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
              onClick={() => {
                setActiveView('add');
                resetForm();
              }}
            >
              <div className={`${styles.circleIcon} ${activeView === 'add' ? styles.active : ''}`}>
                <span>+</span>
              </div>
              <span className={`${styles.buttonLabel} ${activeView === 'add' ? styles.active : ''}`}>Add User</span>
            </div>
            
            <div 
              className={`${styles.actionButton} ${activeView === 'delete' ? styles.active : ''}`} 
              onClick={() => {
                setActiveView('delete');
                resetForm();
              }}
            >
              <div className={`${styles.circleIcon} ${activeView === 'delete' ? styles.active : ''}`}>
                <span>-</span>
              </div>
              <span className={`${styles.buttonLabel} ${activeView === 'delete' ? styles.active : ''}`}>Delete User</span>
            </div>
            
            <div 
              className={`${styles.actionButton} ${activeView === 'edit' ? styles.active : ''}`} 
              onClick={() => {
                setActiveView('edit');
                resetForm();
              }}
            >
              <div className={`${styles.circleIcon} ${activeView === 'edit' ? styles.active : ''}`}>
                <span>✎</span>
              </div>
              <span className={`${styles.buttonLabel} ${activeView === 'edit' ? styles.active : ''}`}>Edit User</span>
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
                hidden 
                onChange={handleFileSelect}
              />
            </label>
            {selectedFile && <div className={styles.selectedFile}>{selectedFile.name}</div>}
            <button 
              className={styles.uploadFileBtn}
              onClick={handleFileUpload}
            >
              Upload File
            </button>
          </div>
        </div>

        {/* Right Panel - Form Section */}
        <div className={styles.rightPanel}>
          <div className={styles.formContainer}>
            {activeView === 'add' && (
              <>
                <h2 className={styles.formTitle}>Enter User Information</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className={styles.formGroup}>
                    <label>ID</label>
                    <input 
                      type="text" 
                      placeholder="Enter ID" 
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Name Surname</label>
                    <input 
                      type="text" 
                      placeholder="Enter name surname" 
                      value={nameSurname}
                      onChange={(e) => setNameSurname(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Mail</label>
                    <input 
                      type="email" 
                      placeholder="Enter mail" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phone Number</label>
                    <input 
                      type="text" 
                      placeholder="Enter phone number" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Type</label>
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
                  <button type="submit" className={styles.formSubmitBtn}>Add User</button>
                </form>
              </>
            )}

            {activeView === 'delete' && (
              <>
                <h2 className={styles.formTitle}>Enter ID or mail to find User</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className={styles.formGroup}>
                    <label>ID</label>
                    <input 
                      type="text" 
                      placeholder="Enter ID" 
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Mail</label>
                    <input 
                      type="email" 
                      placeholder="Enter mail" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <button type="submit" className={styles.formSubmitBtn}>Find User to Delete</button>
                </form>
              </>
            )}

            {activeView === 'edit' && (
              <>
                {!userToEdit ? (
                  <>
                    <h2 className={styles.formTitle}>Enter ID or mail to find User</h2>
                    <form onSubmit={handleFormSubmit}>
                      <div className={styles.formGroup}>
                        <label>ID</label>
                        <input 
                          type="text" 
                          placeholder="Enter ID" 
                          value={userId}
                          onChange={(e) => setUserId(e.target.value)}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Mail</label>
                        <input 
                          type="email" 
                          placeholder="Enter mail" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <button type="submit" className={styles.formSubmitBtn}>Find User to Edit</button>
                    </form>
                  </>
                ) : (
                  <>
                    <h2 className={styles.formTitle}>Edit User Information</h2>
                    <form onSubmit={handleFormSubmit}>
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
                        <label>Name Surname</label>
                        <input 
                          type="text" 
                          value={nameSurname}
                          onChange={(e) => setNameSurname(e.target.value)}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Mail</label>
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Phone Number</label>
                        <input 
                          type="text" 
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Type</label>
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
                      <button type="submit" className={styles.formSubmitBtn}>Edit User</button>
                    </form>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Popup */}
      {showConfirmation && userToDelete && (
        <AdminUserDeleteConfirmation
          user={userToDelete}
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* Error Popup */}
      {showError && (
        <ErrorPopup 
          message={errorMessage}
          onClose={handleErrorClose}
        />
      )}
    </div>
  );
};

export default AdminUserManagement;