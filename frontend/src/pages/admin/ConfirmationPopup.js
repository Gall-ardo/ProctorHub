// ConfirmationPopup.jsx
import React from 'react';
import styles from './ConfirmationPopup.module.css';

const ConfirmationPopup = ({
  user,
  title,
  message,
  confirmText,
  onCancel,
  onConfirm,
  confirmButtonClass
}) => {
  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContainer}>
        <div className={styles.popupContent}>
          <h3 className={styles.popupTitle}>{title}</h3>
          
          {user && (
            <div className={styles.userDetails}>
              <div className={styles.detailRow}>
                <label>ID</label>
                <input type="text" value={user.id} readOnly />
              </div>
              <div className={styles.detailRow}>
                <label>Name Surname</label>
                <input type="text" value={user.nameSurname || user.name} readOnly />
              </div>
              <div className={styles.detailRow}>
                <label>Email</label>
                <input type="text" value={user.email} readOnly />
              </div>
              {user.phoneNumber && (
                <div className={styles.detailRow}>
                  <label>Phone Number</label>
                  <input type="text" value={user.phoneNumber} readOnly />
                </div>
              )}
            </div>
          )}
          
          <div className={styles.popupMessage}>
            <p>{message || 'These are information of the user.'}</p>
            {!message && <p>Do you want to continue?</p>}
          </div>
          
          <div className={styles.popupActions}>
            <button className={styles.cancelBtn} onClick={onCancel}>
              <span className={styles.icon}>✕</span> Cancel
            </button>
            <button className={`${styles.confirmBtn} ${confirmButtonClass || ''}`} onClick={onConfirm}>
              {confirmText || 'Confirm'} <span className={styles.icon}>✓</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;