import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './InstructorSelectionPopup.module.css';

const InstructorSelectionPopup = ({ 
  department, 
  count, 
  selectedInstructors, 
  onConfirm, 
  onCancel, 
  apiUrl 
}) => {
  const [instructors, setInstructors] = useState([]);
  const [selected, setSelected] = useState([...selectedInstructors]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await axios.get(`${apiUrl}/admin/instructors`, {
          params: { department }
        });
        
        if (response.data && response.data.data) {
          setInstructors(response.data.data);
        } else {
          setInstructors([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching instructors:', err);
        setError('Failed to load instructors. Please try again.');
        setLoading(false);
      }
    };
    
    fetchInstructors();
  }, [department, apiUrl]);

  const handleInstructorSelect = (instructor) => {
    // Check if already selected
    const isSelected = selected.some(i => i.id === instructor.id);
    
    if (isSelected) {
      // If already selected, remove from selection
      setSelected(selected.filter(i => i.id !== instructor.id));
    } else {
      // If not selected and not at limit, add to selection
      if (selected.length < count) {
        setSelected([...selected, instructor]);
      } else {
        // Replace the last selected instructor
        const newSelected = [...selected];
        newSelected[count - 1] = instructor;
        setSelected(newSelected);
      }
    }
  };

  const handleConfirm = () => {
    onConfirm(selected);
  };

  const filteredInstructors = instructors.filter(instructor => 
    instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContainer}>
        <div className={styles.popupHeader}>
          <h2>Select Instructors ({selected.length}/{count})</h2>
          <button className={styles.closeButton} onClick={onCancel}>×</button>
        </div>
        
        <div className={styles.searchContainer}>
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading instructors...</p>
          </div>
        ) : error ? (
          <div className={styles.errorMessage}>
            <p>{error}</p>
            <button onClick={onCancel}>Close</button>
          </div>
        ) : (
          <>
            <div className={styles.instructorsList}>
              {filteredInstructors.length > 0 ? (
                filteredInstructors.map(instructor => (
                  <div 
                    key={instructor.id} 
                    className={`${styles.instructorItem} ${selected.some(i => i.id === instructor.id) ? styles.selected : ''}`}
                    onClick={() => handleInstructorSelect(instructor)}
                  >
                    <div className={styles.instructorInfo}>
                      <div className={styles.instructorName}>{instructor.name}</div>
                      <div className={styles.instructorDetails}>{instructor.id} - {instructor.email}</div>
                    </div>
                    <div className={styles.selectIndicator}>
                      {selected.some(i => i.id === instructor.id) && <span>✓</span>}
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noResults}>
                  <p>No instructors found. {searchTerm && 'Try a different search term.'}</p>
                </div>
              )}
            </div>
            
            <div className={styles.selectedSection}>
              <h3>Selected Instructors:</h3>
              <div className={styles.selectedList}>
                {selected.length > 0 ? (
                  selected.map(instructor => (
                    <div key={instructor.id} className={styles.selectedItem}>
                      <span>{instructor.name}</span>
                      <button onClick={() => handleInstructorSelect(instructor)}>×</button>
                    </div>
                  ))
                ) : (
                  <p className={styles.noSelected}>No instructors selected</p>
                )}
              </div>
            </div>
            
            <div className={styles.buttonContainer}>
              <button 
                className={styles.cancelButton} 
                onClick={onCancel}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmButton} 
                onClick={handleConfirm}
                disabled={selected.length === 0}
              >
                Confirm Selection
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InstructorSelectionPopup;