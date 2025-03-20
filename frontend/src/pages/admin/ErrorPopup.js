import React from 'react';
import './ErrorPopup.css';

const ErrorPopup = ({ message, onClose }) => {
  return (
    <div className="error-popup-overlay">
      <div className="error-popup-container">
        <div className="error-popup-content">
          <div className="error-icon">
            <span>!</span>
          </div>
          <div className="error-message">
            <p>{message}</p>
          </div>
          <button className="error-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPopup;