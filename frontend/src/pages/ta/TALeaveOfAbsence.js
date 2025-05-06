import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TALeaveOfAbsence.css';
import TANavBar from './TANavBar';
import axios from 'axios';
// get current date in Date format
const TALeaveOfAbsence = () => {
  // State to control which view is shown (list or form)
  const [showForm, setShowForm] = useState(false);
  
  // State for the list of leave requests
  const [leaveRequests, setLeaveRequests] = useState([]);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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

  // Fetch leave requests on component mount
  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const API_URL = 'http://localhost:5001/api';

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      console.log('Fetching leave requests...');
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get(`${API_URL}/ta/leave-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Leave requests fetched:', response.data);
      if (response.data.success) {
        setLeaveRequests(response.data.data);
      } else {
        setError('Failed to fetch leave requests: ' + response.data.message);
      }
    } catch (err) {
      setError('Error fetching leave requests: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };


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

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
      const form = new FormData();
      form.append('type', formData.type);
      form.append('startDate', formData.startDate);
      form.append('endDate', formData.endDate);
      form.append('reason', formData.reason);
      if (formData.selectedFile) {
        form.append('file', formData.selectedFile); // 🔥 must match backend field name
      }
  
      const response = await axios.post(`${API_URL}/ta/leave-requests`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set 'Content-Type': multipart is set automatically by browser
        },
      });
  
      if (response.data.success) {
        setFormData({
          type: '',
          startDate: '',
          endDate: '',
          reason: '',
          selectedFile: null
        });
  
        await fetchLeaveRequests();
        setShowForm(false);
      } else {
        setError('Failed to submit leave request: ' + response.data.message);
      }
    } catch (err) {
      setError('Error submitting leave request: ' + (err.response?.data?.message || err.message));
    }
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
  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/ta/leave-requests/${deleteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        // Remove the deleted request from state
        setLeaveRequests(prev => prev.filter(request => request.id !== deleteId));
        setShowDeleteConfirm(false);
        setDeleteId(null);
      } else {
        setError('Failed to delete leave request: ' + response.data.message);
      }
    } catch (err) {
      setError('Error deleting leave request: ' + (err.response?.data?.message || err.message));
    }
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
      
      {loading ? (
        <p>Loading leave requests...</p>
      ) : error ? (
        <p className="ta-leave-of-absence-error">{error}</p>
      ) : leaveRequests.length === 0 ? (
        <p>No leave requests found. Create your first request!</p>
      ) : (
        leaveRequests.map((request) => (
          <div key={request.id} className="ta-leave-of-absence-list-item">
            <div className="ta-leave-of-absence-request-details">
              <h3>Leave of Absence for {request.type}</h3>
              <p>Start date: {formatDateForDisplay(request.startDate)} End date: {formatDateForDisplay(request.endDate)}</p>
              <p>Reason: {request.reason}</p>

              {request.filePath && (
                <p>
                  <a 
                    href={`http://localhost:5001/uploads/leave-documents/${request.filePath}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    View Uploaded Document
                  </a>
                </p>
              )}
            </div>
            
            <div className="ta-leave-of-absence-request-status">
              {request.status === 'waiting' && (
                <span className="ta-leave-of-absence-status-pending">Waiting to be accepted</span>
              )}
              {request.status === 'approved' && (
                <>
                  <span className="ta-leave-of-absence-status-accepted">Accepted</span>
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
        ))
      )}
      
      <div className="ta-leave-of-absence-add-request">
        <button 
          className="ta-leave-of-absence-add-btn"
          onClick={() => {
            setError(null); // ✅ clear any previous error
            setShowForm(true);
          }}
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
      {error && (
        <p className="ta-leave-of-absence-error">
          {error}
        </p>
      )}

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

  const renderErrorModal = () => (
    error && (
      <div className="ta-error-modal-backdrop">
        <div className="ta-error-modal">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="ta-error-close-btn">Close</button>
        </div>
      </div>
    )
  );

  
  return (
    <div className="ta-leave-of-absence-main-page">
      <TANavBar />
      {renderErrorModal()}
      <main className="ta-leave-of-absence-main-content">
        {showForm ? renderFormView() : renderListView()}
      </main>

    </div>
  );
};

export default TALeaveOfAbsence;