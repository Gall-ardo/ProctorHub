import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './TALeaveOfAbsence.css';
import TANavBar from './TANavBar';

const TALeaveOfAbsence = () => {
  // State to control which view is shown (list or form)
  const [showForm, setShowForm] = useState(false);
  
  // State for the list of leave requests
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 1,
      type: 'Surgery',
      startDate: '17.04.2025',
      endDate: '17.05.2025',
      reason: 'Surgery',
      status: 'pending',
    },
    {
      id: 2,
      type: 'Research in Abroad',
      startDate: '03.02.2025',
      endDate: '17.02.2025',
      reason: 'Research in Abroad',
      status: 'accepted',
      remainingDays: 10,
    },
    {
      id: 3,
      type: 'Holiday',
      startDate: '12.01.2025',
      endDate: '17.01.2025',
      reason: 'Holiday',
      status: 'rejected',
    },
    {
      id: 4,
      type: 'Surgery',
      startDate: '17.04.2025',
      endDate: '17.05.2025',
      reason: 'Surgery',
      status: 'pending',
    },
  ]);
  
  // Form state
  const [formData, setFormData] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: '',
    selectedFile: null
  });

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        selectedFile: e.target.files[0]
      }));
    }
  };

  // File drop handler
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFormData(prev => ({
        ...prev,
        selectedFile: e.dataTransfer.files[0]
      }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create a new request
    const newRequest = {
      id: Date.now(), // Use timestamp as unique ID
      type: formData.type,
      startDate: formatDateForDisplay(formData.startDate),
      endDate: formatDateForDisplay(formData.endDate),
      reason: formData.reason,
      status: 'pending',
    };
    
    // Add to the list
    setLeaveRequests(prev => [newRequest, ...prev]);
    
    // Reset form and go back to list view
    setFormData({
      type: '',
      startDate: '',
      endDate: '',
      reason: '',
      selectedFile: null
    });
    
    setShowForm(false);
  };

  // Helper to format date
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '.');
  };

  // Delete request
  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  // Confirm deletion
  const confirmDelete = () => {
    setLeaveRequests(prev => prev.filter(request => request.id !== deleteId));
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  // Cancel deletion
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  // Render the list view
  const renderListView = () => (
    <div className="ta-leave-of-absence-list-container">
      <h1 className="ta-leave-of-absence-list-title">List of Leave of Absences</h1>
      
      {leaveRequests.map((request) => (
        <div key={request.id} className="ta-leave-of-absence-list-item">
          <div className="ta-leave-of-absence-request-details">
            <h3>Leave of Absence for {request.type}</h3>
            <p>Start date: {request.startDate} End date: {request.endDate}</p>
            <p>Reason: {request.reason}</p>
          </div>
          
          <div className="ta-leave-of-absence-request-status">
            {request.status === 'pending' && (
              <span className="ta-leave-of-absence-status-pending">Waiting to be accepted</span>
            )}
            {request.status === 'accepted' && (
              <>
                <span className="ta-leave-of-absence-status-accepted">Accepted</span>
                <p className="ta-leave-of-absence-days-remaining">Remaining days: {request.remainingDays} days</p>
              </>
            )}
            {request.status === 'rejected' && (
              <span className="ta-leave-of-absence-status-rejected">Rejected</span>
            )}
            
            <button 
              className="ta-leave-of-absence-delete-btn"
              onClick={() => handleDelete(request.id)}
            >
              <span className="ta-leave-of-absence-trash-icon">🗑️</span> Delete
            </button>
          </div>
        </div>
      ))}
      
      <div className="ta-leave-of-absence-add-request">
        <button 
          className="ta-leave-of-absence-add-btn"
          onClick={() => setShowForm(true)}
        >
          <span className="ta-leave-of-absence-plus-icon">+</span>
          Submit Leave of Absence Request
        </button>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="ta-leave-of-absence-delete-modal">
          <div className="ta-leave-of-absence-delete-modal-content">
            <h3>Delete Confirmation</h3>
            <p>Are you sure you want to delete this leave request?</p>
            <div className="ta-leave-of-absence-delete-modal-buttons">
              <button onClick={confirmDelete} className="ta-leave-of-absence-confirm-btn">Yes, Delete</button>
              <button onClick={cancelDelete} className="ta-leave-of-absence-cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render the form view
  const renderFormView = () => (
    <div className="ta-leave-of-absence-leave-container">
      <h1 className="ta-leave-of-absence-leave-title">Submit Leave of Absence Request</h1>
      
      <form onSubmit={handleSubmit} className="ta-leave-of-absence-leave-form">
        <div className="ta-leave-of-absence-form-row">
          <div className="ta-leave-of-absence-type-container">
            <label>Leave Type</label>
            <input 
              type="text" 
              name="type"
              value={formData.type} 
              onChange={handleInputChange} 
              placeholder="e.g. Surgery, Holiday, Research"
              required
            />
          </div>
        </div>

        <div className="ta-leave-of-absence-form-row">
          <div className="ta-leave-of-absence-date-selector">
            <label>Select date</label>
            <div className="ta-leave-of-absence-date-inputs">
              <div className="ta-leave-of-absence-date-field">
                <label>Start Date</label>
                <input 
                  type="date" 
                  name="startDate"
                  value={formData.startDate} 
                  onChange={handleInputChange} 
                  required
                />
              </div>
              <div className="ta-leave-of-absence-date-field">
                <label>End Date</label>
                <input 
                  type="date" 
                  name="endDate"
                  value={formData.endDate} 
                  onChange={handleInputChange} 
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="ta-leave-of-absence-file-upload"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="ta-leave-of-absence-file-upload-content">
              <div className="ta-leave-of-absence-upload-icon">⬆️</div>
              <p>Drag and Drop here</p>
              <p>or</p>
              <label className="ta-leave-of-absence-select-file-btn">
                Select file
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                />
              </label>
              {formData.selectedFile && (
                <p className="ta-leave-of-absence-selected-file">
                  Selected: {formData.selectedFile.name}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="ta-leave-of-absence-reason-container">
          <label>Enter Your Reason</label>
          <textarea 
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            placeholder="Reason"
            required
          />
        </div>

        <div className="ta-leave-of-absence-form-actions">
          <button type="submit" className="ta-leave-of-absence-submit-btn">
            Submit Leave of Absence Request
          </button>
          <button 
            type="button" 
            className="ta-leave-of-absence-cancel-btn"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="ta-leave-of-absence-main-page">
      <TANavBar />
      <main className="ta-leave-of-absence-main-content">
        {showForm ? renderFormView() : renderListView()}
      </main>
    </div>
  );
};

export default TALeaveOfAbsence;