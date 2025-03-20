import React from 'react';
import './AdminUserDeleteConfirmation.css';

const AdminUserDeleteConfirmation = ({ user, onCancel, onConfirm }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <div className="popup-content">
          <div className="user-details">
            <div className="detail-row">
              <label>ID</label>
              <input type="text" value={user.id} readOnly />
            </div>
            <div className="detail-row">
              <label>Name Surname</label>
              <input type="text" value={user.nameSurname} readOnly />
            </div>
            <div className="detail-row">
              <label>Mail</label>
              <input type="text" value={user.email} readOnly />
            </div>
            <div className="detail-row">
              <label>Phone Number</label>
              <input type="text" value={user.phoneNumber} readOnly />
            </div>
          </div>
          
          <div className="popup-message">
            <p>These are information of the user.</p>
            <p>Do you want to continue?</p>
          </div>
          
          <div className="popup-actions">
            <button className="cancel-btn" onClick={onCancel}>
              <span className="icon">✕</span> Cancel
            </button>
            <button className="confirm-btn" onClick={onConfirm}>
              Confirm <span className="icon">✓</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDeleteConfirmation;