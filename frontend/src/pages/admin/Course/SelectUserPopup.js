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
  onConfirm 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selections, setSelections] = useState([...selectedUsers]);

  // Fetch users based on search query
  useEffect(() => {
    if (searchQuery.length > 1) {
      fetchUsers();
    } else if (searchQuery.length === 0) {
      // When search is cleared, load some initial users
      fetchInitialUsers();
    }
  }, [searchQuery]);

  // Load initial users on component mount
  useEffect(() => {
    fetchInitialUsers();
  }, []);

  const fetchInitialUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Make API call to get all users of the specified type
      let response;
      
      if (userType === 'instructor') {
        response = await axios.get(`${API_URL}/api/admin/users`, { 
          params: { userType: 'instructor' } 
        });
      } else {
        response = await axios.get(`${API_URL}/api/admin/users`, { 
          params: { userType: 'ta' } 
        });
      }
      
      // Handle both potential response formats
      let userData = [];
      if (response.data.success && Array.isArray(response.data.data)) {
        userData = response.data.data;
      } else if (Array.isArray(response.data)) {
        userData = response.data;
      }
      
      setUsers(userData);
    } catch (err) {
      console.error('Error fetching initial users:', err);
      setError('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Construct query parameters
      const params = { 
        userType: userType === 'instructor' ? 'instructor' : 'ta'
      };
      
      if (searchQuery) {
        if (searchQuery.includes('@')) {
          params.email = searchQuery;
        } else if (!isNaN(searchQuery)) {
          params.id = searchQuery;
        } else {
          params.name = searchQuery;
        }
      }
      
      // Make API call
      const response = await axios.get(`${API_URL}/api/admin/users`, { params });
      
      // Handle different response formats
      let userData = [];
      if (response.data.success && Array.isArray(response.data.data)) {
        userData = response.data.data;
      } else if (Array.isArray(response.data)) {
        userData = response.data;
      }
      
      // Filter results client-side if needed
      const filteredUsers = userData.filter(user => {
        const searchLower = searchQuery.toLowerCase();
        return (
          user.name.toLowerCase().includes(searchLower) ||
          (user.id && user.id.toLowerCase().includes(searchLower)) ||
          (user.email && user.email.toLowerCase().includes(searchLower))
        );
      });
      
      setUsers(filteredUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. Please try again.');
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
    onConfirm(selections);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.header}>
          <h2>{title} ({selections.length}/{maxSelections || '∞'})</h2>
          <button className={styles.closeButton} onClick={onCancel}>×</button>
        </div>
        
        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className={styles.resultsContainer}>
          {loading ? (
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
              {searchQuery.length > 1 ? 'No users found.' : 'Enter at least 2 characters to search.'}
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