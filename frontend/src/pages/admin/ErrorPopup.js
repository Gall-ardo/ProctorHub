import React from 'react';
import styles from './ErrorPopup.module.css';

const ErrorPopup = ({ message, onClose }) => {
  return (
    <div className={styles.errorPopupOverlay}>
      <div className={styles.errorPopupContainer}>
        <div className={styles.errorPopupContent}>
          <div className={styles.errorIcon}>
            <span>!</span>
          </div>
          <div className={styles.errorMessage}>
            <p>{message}</p>
          </div>
          <button className={styles.errorCloseBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPopup;