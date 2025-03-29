import React, { useState, useEffect, useRef } from 'react';
import styles from './AdminUserSelectUserPopup.module.css';

const AdminUserSelectUserPopup = ({ onCancel, onConfirm, selectedAssistants = [], setSelectedAssistants }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredAssistants, setFilteredAssistants] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [tempSelectedAssistants, setTempSelectedAssistants] = useState([...selectedAssistants]);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Mock teaching assistant data - using names from your screenshot
  const mockAssistants = [
    { id: 1, name: 'M. Utku Aydoğdu' },
    { id: 2, name: 'Ahmet Yılmaz' },
    { id: 3, name: 'Ayşe Demir' },
    { id: 4, name: 'Kemal Sunal' },
    { id: 5, name: 'Tarkan Tevetoğlu' },
    { id: 6, name: 'Sezen Aksu' },
    { id: 7, name: 'Barış Manço' },
    { id: 8, name: 'Cem Yılmaz' },
    { id: 9, name: 'Hülya Avşar' },
    { id: 10, name: 'İbrahim Tatlıses' }
  ];

  // Filter assistants based on search text
  useEffect(() => {
    if (searchText.trim()) {
      const filtered = mockAssistants.filter(
        assistant => 
          assistant.name.toLowerCase().includes(searchText.toLowerCase()) &&
          !tempSelectedAssistants.some(selected => selected.id === assistant.id)
      );
      setFilteredAssistants(filtered);
      setShowDropdown(true);
    } else {
      setFilteredAssistants([]);
      setShowDropdown(false);
    }
  }, [searchText, tempSelectedAssistants]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddAssistant = () => {
    if (filteredAssistants.length > 0) {
      handleSelectAssistant(filteredAssistants[0]);
    }
  };

  const handleSelectAssistant = (assistant) => {
    setTempSelectedAssistants([...tempSelectedAssistants, assistant]);
    setSearchText('');
    setShowDropdown(false);
  };

  const handleRemoveAssistant = (assistantId) => {
    setTempSelectedAssistants(tempSelectedAssistants.filter(ta => ta.id !== assistantId));
  };

  const handleConfirm = () => {
    onConfirm(tempSelectedAssistants);
  };

  return (
    <div className={styles.assistantPopupOverlay}>
      <div className={styles.assistantPopupContainer}>
        <h2 className={styles.assistantPopupTitle}>Select Asistant(s)</h2>
        
        <div className={styles.assistantSearchSection}>
          <label>Asistant</label>
          <div className={styles.assistantSearchInputGroup}>
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Enter TA name" 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onFocus={() => setShowDropdown(filteredAssistants.length > 0)}
              className={styles.assistantSearchInput}
            />
            <button 
              className={styles.assistantAddBtn}
              onClick={handleAddAssistant}
              disabled={filteredAssistants.length === 0}
            >
              Add
            </button>
            
            {showDropdown && (
              <div className={styles.assistantDropdown} ref={dropdownRef}>
                {filteredAssistants.map(assistant => (
                  <div 
                    key={assistant.id} 
                    className={styles.assistantDropdownItem}
                    onClick={() => handleSelectAssistant(assistant)}
                  >
                    {assistant.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.assistantSelectedList}>
          {tempSelectedAssistants.map(assistant => (
            <div key={assistant.id} className={styles.assistantChip}>
              {assistant.name}
              <button 
                className={styles.assistantRemoveBtn}
                onClick={() => handleRemoveAssistant(assistant.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        <div className={styles.assistantPopupActions}>
          <button className={styles.assistantCancelBtn} onClick={onCancel}>
            <span className={styles.assistantCancelIcon}>×</span> 
            <span className={styles.assistantActionText}>Cancel</span>
          </button>
          <button className={styles.assistantConfirmBtn} onClick={handleConfirm}>
            <span className={styles.assistantActionText}>Confirm</span>
            <span className={styles.assistantConfirmIcon}>✓</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUserSelectUserPopup;