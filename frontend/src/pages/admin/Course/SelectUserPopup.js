import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './SelectUserPopup.module.css';

// Define API URL with fallback for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const SelectUserPopup = ({ 
  title, 
  userType, 
  maxSelections, 
  selectedUsers, 
  onCancel, 
  onConfirm,
  department  // This is the department of the course being created/edited
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selections, setSelections] = useState([...selectedUsers]);

  // Load initial users on component mount and when department changes
  useEffect(() => {
    console.log("Department changed to:", department);
    
    if (department) {
      fetchUsers();
    } else {
      setUsers([]);
    }
  }, [department]);

  useEffect(() => {
    if (department) {
      fetchUsers();
    }
  }, [searchQuery]);
  

  const fetchUsers = async () => {
    
    if (!department) {
      setUsers([]);
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      const params = {
        userType,
        department
      };
  
      // Always search — no need to wait for 2+ characters
      if (searchQuery) {
        if (searchQuery.includes('@')) {
          params.email = searchQuery;
        } else if (!isNaN(searchQuery)) {
          params.id = searchQuery;
        } else {
          params.name = searchQuery;
        }
      }
  
      const response = await axios.get(`${API_URL}/api/admin/fetch/users`, { params }); // Changed /users to /fetch/users
  
      let userData = [];
      if (Array.isArray(response.data)) {
        userData = response.data;
      } else if (response.data?.success && Array.isArray(response.data.data)) {
        userData = response.data.data;
      }
  
      setUsers(userData);
    } catch (err) {
      setError(`Failed to fetch ${userType}s. Please try again.`);
    } finally {
      setLoading(false);
    }
  };
  

  const toggleUserSelection = (user) => {
    // Check if user is already selected
    const isSelected = selections.some(selected => selected.id === user.id);
    
    if (isSelected) {
      // Remove user from selections
      setSelections(selections.filter(selected => selected.id !== user.id));
    } else {
      // Check if maximum selections reached
      if (maxSelections && selections.length >= maxSelections) {
        // Remove the oldest selection if at max
        const newSelections = [...selections];
        newSelections.shift();
        setSelections([...newSelections, user]);
      } else {
        // Add user to selections
        setSelections([...selections, user]);
      }
    }
  };

  const handleConfirm = () => {
    const usersWithDepartment = selections.map(user => ({
      ...user,
      department: department // ensure department is attached
    }));
    onConfirm(usersWithDepartment);
    
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.header}>
          <h2>{title} ({selections.length}/{maxSelections || '∞'})</h2>
          <div className={styles.departmentFilter}>
            <span>Department: <strong>{department}</strong></span>
          </div>
          <button className={styles.closeButton} onClick={onCancel}>×</button>
        </div>
        
        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={!department}
          />
          {!department && (
            <div className={styles.warningMessage}>Please select a department first</div>
          )}
        </div>
        
        <div className={styles.resultsContainer}>
          {!department ? (
            <div className={styles.warningMessage}>Department must be selected to view users</div>
          ) : loading ? (
            <div className={styles.loadingMessage}>Loading...</div>
          ) : error ? (
            <div className={styles.errorMessage}>{error}</div>
          ) : users.length > 0 ? (
            <ul className={styles.userList}>
              {users.map(user => (
                <li 
                  key={user.id} 
                  className={`${styles.userItem} ${
                    selections.some(selected => selected.id === user.id) ? styles.selected : ''
                  }`}
                  onClick={() => toggleUserSelection(user)}
                >
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{user.name}</span>
                    <span className={styles.userId}>{user.id}</span>
                    {user.department && <span className={styles.userDepartment}>{user.department}</span>}
                  </div>
                  <div className={styles.checkbox}>
                    {selections.some(selected => selected.id === user.id) && (
                      <span className={styles.checkmark}>✓</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.noResultsMessage}>
              {searchQuery.length > 0 ? 
                `No ${userType === 'instructor' ? 'instructors' : 'teaching assistants'} found in ${department} department matching "${searchQuery}".` : 
                `No ${userType === 'instructor' ? 'instructors' : 'teaching assistants'} found in ${department} department.`}
            </div>
          )}
        </div>
        
        <div className={styles.selectionsContainer}>
          <h3>Selected {userType === 'instructor' ? 'Instructors' : 'Teaching Assistants'}:</h3>
          {selections.length > 0 ? (
            <ul className={styles.selectionsList}>
              {selections.map(user => (
                <li key={user.id} className={styles.selectedItem}>
                  <span>{user.name}</span>
                  <button 
                    className={styles.removeButton}
                    onClick={() => toggleUserSelection(user)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.noSelectionsMessage}>
              No {userType === 'instructor' ? 'instructors' : 'teaching assistants'} selected
            </div>
          )}
        </div>
        
        <div className={styles.actionsContainer}>
          <button 
            className={styles.cancelButton}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className={styles.confirmButton}
            onClick={handleConfirm}
            disabled={selections.length === 0}
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectUserPopup;