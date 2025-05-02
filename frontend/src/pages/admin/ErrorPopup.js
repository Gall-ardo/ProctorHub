import React from 'react';
import styles from './ErrorPopup.module.css';

const ErrorPopup = ({ message, onClose }) => {
  return (
    <div className={styles.errorOverlay}>
      <div className={styles.errorContent}>
        <div className={styles.errorIcon}>
          <span>!</span>
        </div>
        
        <h3 className={styles.errorTitle}>Error</h3>
        
        <p className={styles.errorMessage}>{message}</p>
        
        <button className={styles.closeButton} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ErrorPopup;