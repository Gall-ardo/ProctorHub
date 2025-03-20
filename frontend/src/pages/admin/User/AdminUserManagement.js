import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminUserManagement.css';
import ErrorPopup from '../ErrorPopup';
import AdminUserDeleteConfirmation from './AdminUserDeleteConfirmation';

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
    <div className="user-management">
      {/* Top Navigation Bar */}
      <div className="top-navbar">
        <div className="logo">
          <img src="/logo.png" alt="Logo" />
        </div>
        <div className="nav-links">
          <a href="#">Logs and Reports</a>
          <a href="#" className="active">User</a>
          <a href="#">Student</a>
          <a href="#">Course</a>
          <a href="#">Classrooms</a>
          <a href="#">Offering</a>
          <a href="#">Semester</a>
        </div>
        <div className="nav-icons">
          <div className="notification-icon">
            <img src="/notification.png" alt="Notifications" />
          </div>
          <div className="profile-icon">
            <img src="/profile.png" alt="Profile" />
          </div>
        </div>
      </div>

      <div className="main-content">
        {/* Left Panel */}
        <div className="left-panel">
          <div className="action-buttons">
            <div 
              className={`action-button ${activeView === 'add' ? 'active' : ''}`} 
              onClick={() => {
                setActiveView('add');
                resetForm();
              }}
            >
              <div className={`circle-icon ${activeView === 'add' ? 'active' : ''}`}>
                <span>+</span>
              </div>
              <span className={`button-label ${activeView === 'add' ? 'active' : ''}`}>Add User</span>
            </div>
            
            <div 
              className={`action-button ${activeView === 'delete' ? 'active' : ''}`} 
              onClick={() => {
                setActiveView('delete');
                resetForm();
              }}
            >
              <div className={`circle-icon ${activeView === 'delete' ? 'active' : ''}`}>
                <span>-</span>
              </div>
              <span className={`button-label ${activeView === 'delete' ? 'active' : ''}`}>Delete User</span>
            </div>
            
            <div 
              className={`action-button ${activeView === 'edit' ? 'active' : ''}`} 
              onClick={() => {
                setActiveView('edit');
                resetForm();
              }}
            >
              <div className={`circle-icon ${activeView === 'edit' ? 'active' : ''}`}>
                <span>✎</span>
              </div>
              <span className={`button-label ${activeView === 'edit' ? 'active' : ''}`}>Edit User</span>
            </div>
          </div>

          <div 
            className="file-upload-area"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="upload-icon">
              <img src="/upload-icon.png" alt="Upload" />
            </div>
            <div className="upload-text">Drag and Drop here</div>
            <div className="upload-divider">or</div>
            <label className="select-file-btn">
              Select file
              <input 
                type="file" 
                hidden 
                onChange={handleFileSelect}
              />
            </label>
            {selectedFile && <div className="selected-file">{selectedFile.name}</div>}
            <button 
              className="upload-file-btn"
              onClick={handleFileUpload}
            >
              Upload File
            </button>
          </div>
        </div>

        {/* Right Panel - Form Section */}
        <div className="right-panel">
          <div className="form-container">
            {activeView === 'add' && (
              <>
                <h2 className="form-title">Enter User Information</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label>ID</label>
                    <input 
                      type="text" 
                      placeholder="Enter ID" 
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Name Surname</label>
                    <input 
                      type="text" 
                      placeholder="Enter name surname" 
                      value={nameSurname}
                      onChange={(e) => setNameSurname(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mail</label>
                    <input 
                      type="email" 
                      placeholder="Enter mail" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                      type="text" 
                      placeholder="Enter phone number" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <div className="selection-list">
                      {userTypeOptions.map((type) => (
                        <div 
                          key={type.value} 
                          className={`selection-item ${userType === type.value ? 'selected' : ''}`}
                          onClick={() => setUserType(type.value)}
                        >
                          {type.label}
                          <span className="option-indicator"></span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="form-submit-btn">Add User</button>
                </form>
              </>
            )}

            {activeView === 'delete' && (
              <>
                <h2 className="form-title">Enter ID or mail to find User</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label>ID</label>
                    <input 
                      type="text" 
                      placeholder="Enter ID" 
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mail</label>
                    <input 
                      type="email" 
                      placeholder="Enter mail" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="form-submit-btn">Find User to Delete</button>
                </form>
              </>
            )}

            {activeView === 'edit' && (
              <>
                {!userToEdit ? (
                  <>
                    <h2 className="form-title">Enter ID or mail to find User</h2>
                    <form onSubmit={handleFormSubmit}>
                      <div className="form-group">
                        <label>ID</label>
                        <input 
                          type="text" 
                          placeholder="Enter ID" 
                          value={userId}
                          onChange={(e) => setUserId(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Mail</label>
                        <input 
                          type="email" 
                          placeholder="Enter mail" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="form-submit-btn">Find User to Edit</button>
                    </form>
                  </>
                ) : (
                  <>
                    <h2 className="form-title">Edit User Information</h2>
                    <form onSubmit={handleFormSubmit}>
                      <div className="form-group">
                        <label>ID</label>
                        <input 
                          type="text" 
                          value={userId}
                          readOnly
                        />
                      </div>
                      <div className="form-group">
                        <label>Name Surname</label>
                        <input 
                          type="text" 
                          value={nameSurname}
                          onChange={(e) => setNameSurname(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Mail</label>
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone Number</label>
                        <input 
                          type="text" 
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Type</label>
                        <div className="selection-list">
                          {userTypeOptions.map((type) => (
                            <div 
                              key={type.value} 
                              className={`selection-item ${userType === type.value ? 'selected' : ''}`}
                              onClick={() => setUserType(type.value)}
                            >
                              {type.label}
                              <span className="option-indicator"></span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button type="submit" className="form-submit-btn">Edit User</button>
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