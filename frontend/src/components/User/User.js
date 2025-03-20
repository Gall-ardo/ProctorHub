import React, { useState } from 'react';
import './User.css';

const User = () => {
  const [activeView, setActiveView] = useState('add'); // 'add', 'delete', 'edit'
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
    <div className="user-container">
      <div className="header">
        <h1>User Management</h1>
      </div>

      <div className="user-content">
        {/* Left Side Buttons */}
        <div className="left-side">
          <div className="buttons">
            <button 
              className={`button add ${activeView === 'add' ? 'active' : ''}`}
              onClick={() => {
                setActiveView('add');
                resetForm();
              }}
            >
              Add User
            </button>
            <button 
              className={`button delete ${activeView === 'delete' ? 'active' : ''}`}
              onClick={() => {
                setActiveView('delete');
                resetForm();
              }}
            >
              Delete User
            </button>
            <button 
              className={`button edit ${activeView === 'edit' ? 'active' : ''}`}
              onClick={() => {
                setActiveView('edit');
                resetForm();
              }}
            >
              Edit User
            </button>
          </div>

          {/* File Upload Section */}
          <div className="upload-section">
            <div 
              className="upload-box"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <p>Drag and Drop here</p>
              <label className="file-input-label">
                <span className="button">Select file</span>
                <input 
                  type="file" 
                  hidden 
                  onChange={handleFileSelect}
                />
              </label>
              {selectedFile && <p className="selected-file">{selectedFile.name}</p>}
            </div>
            <button 
              className="button upload-btn"
              onClick={handleFileUpload}
            >
              Upload File
            </button>
          </div>
        </div>

        {/* Right Side Form Section */}
        <div className="form-section">
          {activeView === 'add' && (
            <>
              <h2>Enter User Information</h2>
              <form onSubmit={handleFormSubmit}>
                <div className="input-field">
                  <label>ID</label>
                  <input
                    type="text"
                    placeholder="Enter ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>
                <div className="input-field">
                  <label>Name Surname</label>
                  <input
                    type="text"
                    placeholder="Enter name surname"
                    value={nameSurname}
                    onChange={(e) => setNameSurname(e.target.value)}
                  />
                </div>
                <div className="input-field">
                  <label>Mail</label>
                  <input
                    type="email"
                    placeholder="Enter mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="input-field">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <div className="input-field">
                  <label>Type</label>
                  <div className="selection-list">
                    {userTypeOptions.map((type) => (
                      <div 
                        key={type.value} 
                        className={`selection-option ${userType === type.value ? 'selected' : ''}`}
                        onClick={() => setUserType(type.value)}
                      >
                        {type.label}
                        <span className="radio-indicator"></span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-buttons">
                  <button className="add-user" type="submit">
                    Add User
                  </button>
                </div>
              </form>
            </>
          )}

          {activeView === 'delete' && (
            <>
              <h2>Enter ID or mail to find User</h2>
              <form onSubmit={handleFormSubmit}>
                <div className="input-field">
                  <label>ID</label>
                  <input
                    type="text"
                    placeholder="Enter ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>
                <div className="input-field">
                  <label>Mail</label>
                  <input
                    type="email"
                    placeholder="Enter mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-buttons">
                  <button className="find-user" type="submit">
                    Find User to Delete
                  </button>
                </div>
              </form>
            </>
          )}

          {activeView === 'edit' && (
            <>
              {!userToEdit ? (
                <>
                  <h2>Enter ID or mail to find User</h2>
                  <form onSubmit={handleFormSubmit}>
                    <div className="input-field">
                      <label>ID</label>
                      <input
                        type="text"
                        placeholder="Enter ID"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                      />
                    </div>
                    <div className="input-field">
                      <label>Mail</label>
                      <input
                        type="email"
                        placeholder="Enter mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="form-buttons">
                      <button className="find-user" type="submit">
                        Find User to Edit
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <h2>Edit User Information</h2>
                  <form onSubmit={handleFormSubmit}>
                    <div className="input-field">
                      <label>ID</label>
                      <input
                        type="text"
                        value={userId}
                        readOnly
                      />
                    </div>
                    <div className="input-field">
                      <label>Name Surname</label>
                      <input
                        type="text"
                        value={nameSurname}
                        onChange={(e) => setNameSurname(e.target.value)}
                      />
                    </div>
                    <div className="input-field">
                      <label>Mail</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="input-field">
                      <label>Phone Number</label>
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                    <div className="input-field">
                      <label>Type</label>
                      <div className="selection-list">
                        {userTypeOptions.map((type) => (
                          <div 
                            key={type.value} 
                            className={`selection-option ${userType === type.value ? 'selected' : ''}`}
                            onClick={() => setUserType(type.value)}
                          >
                            {type.label}
                            <span className="radio-indicator"></span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="form-buttons">
                      <button className="edit-user-btn" type="submit">
                        Edit User
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
  );
};

export default User;