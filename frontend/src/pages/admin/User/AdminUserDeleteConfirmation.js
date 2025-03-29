import React from 'react';
import styles from './AdminUserDeleteConfirmation.module.css';

const AdminUserDeleteConfirmation = ({ user, onCancel, onConfirm }) => {
  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContainer}>
        <div className={styles.popupContent}>
          <div className={styles.userDetails}>
            <div className={styles.detailRow}>
              <label>ID</label>
              <input type="text" value={user.id} readOnly />
            </div>
            <div className={styles.detailRow}>
              <label>Name Surname</label>
              <input type="text" value={user.nameSurname} readOnly />
            </div>
            <div className={styles.detailRow}>
              <label>Mail</label>
              <input type="text" value={user.email} readOnly />
            </div>
            <div className={styles.detailRow}>
              <label>Phone Number</label>
              <input type="text" value={user.phoneNumber} readOnly />
            </div>
          </div>
          
          <div className={styles.popupMessage}>
            <p>These are information of the user.</p>
            <p>Do you want to continue?</p>
          </div>
          
          <div className={styles.popupActions}>
            <button className={styles.cancelBtn} onClick={onCancel}>
              <span className={styles.icon}>✕</span> Cancel
            </button>
            <button className={styles.confirmBtn} onClick={onConfirm}>
              Confirm <span className={styles.icon}>✓</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDeleteConfirmation;