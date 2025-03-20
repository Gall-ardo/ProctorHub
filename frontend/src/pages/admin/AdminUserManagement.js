import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminUserManagement.css';

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
        console.log('Finding user to delete:', { userId, email });
        // Delete API call here
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
          console.log('Finding user to edit:', { userId, email });
          // Find user API call here
          // This would normally set userToEdit with the response
          // For demo, let's simulate finding a user
          if (userId === '12345678' || email === 'sude.ergun@bilkent.edu.tr') {
            setUserToEdit({
              id: '12345678',
              nameSurname: 'Sude Ergün',
              email: 'sude.ergun@bilkent.edu.tr',
              phoneNumber: '05123456789',
              userType: 'master-part'
            });
            
            // Update form fields with found user data
            setUserId('12345678');
            setNameSurname('Sude Ergün');
            setEmail('sude.ergun@bilkent.edu.tr');
            setPhoneNumber('05123456789');
            setUserType('master-part');
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
      alert('Please select a file first');
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
    </div>
  );
};

export default AdminUserManagement;