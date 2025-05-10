import React, { useState, useEffect } from 'react';
import styles from './TimeslotPopup.module.css';

/**
 * TimeslotPopup Component
 * 
 * A popup modal for selecting timeslots for course offerings.
 * Shows a grid of days and times where users can select multiple slots.
 * 
 * @param {Object} props
 * @param {Function} props.onClose - Function to call when closing the popup
 * @param {Function} props.onChange - Function to call when selected timeslots change
 * @param {Array} props.initialTimeslots - Initial selected timeslots
 */
const TimeslotPopup = ({ onClose, onChange, initialTimeslots = [] }) => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
  // Generate time slots from 8:30 to 5:20 with 50 minute lectures and 10 minute breaks
  const generateTimeSlots = () => {
    const slots = [];
    let hour = 8;
    let minute = 30;
    
    while (hour < 17 || (hour === 17 && minute <= 20)) {
      const startHour = hour;
      const startMinute = minute;
      
      // Calculate end time (50 minutes later)
      let endHour = hour;
      let endMinute = minute + 50;
      
      if (endMinute >= 60) {
        endHour += 1;
        endMinute -= 60;
      }
      
      // Format the times
      const startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
      
      slots.push({
        start: startTime,
        end: endTime,
        display: `${startTime} - ${endTime}`
      });
      
      // Move to next slot (add 10 minutes for break plus 50 minutes for lecture)
      minute += 60;
      if (minute >= 60) {
        hour += 1;
        minute -= 60;
      }
    }
    
    return slots;
  };
  
  const timeSlots = generateTimeSlots();
  
  // Function to ensure time format is consistent (HH:MM:00)
  const formatTimeForAPI = (timeString) => {
    // If time is already in the right format, return as is
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) {
      return timeString;
    }
    
    // Otherwise, format it properly
    if (/^\d{2}:\d{2}$/.test(timeString)) {
      return `${timeString}:00`;
    }
    
    // If in other format, try to parse and format
    const [hours, minutes] = timeString.split(':').map(part => parseInt(part));
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  };
  
  // Convert initialTimeslots to proper format for the component
  const formatInitialTimeslots = (timeslots) => {
    return timeslots.map(slot => {
      // Handle different time formats
      const startTime = slot.startTime.substring(0, 5); // Get HH:MM format
      const endTime = slot.endTime.substring(0, 5); // Get HH:MM format
      
      return `${slot.day}-${startTime}-${endTime}`;
    });
  };
  
  // State to track selected timeslots
  const [selectedTimeslots, setSelectedTimeslots] = useState(
    new Set(formatInitialTimeslots(initialTimeslots))
  );
  
  // Effect to notify parent component when selections change
  useEffect(() => {
    const timeslotArray = Array.from(selectedTimeslots).map(slotString => {
      const [day, startTime, endTime] = slotString.split('-');
      return {
        day,
        startTime: formatTimeForAPI(startTime),
        endTime: formatTimeForAPI(endTime)
      };
    });
    
    onChange(timeslotArray);
  }, [selectedTimeslots, onChange]);
  
  const toggleTimeslot = (day, slot) => {
    const slotId = `${day}-${slot.start}-${slot.end}`;
    const newSelection = new Set(selectedTimeslots);
    
    if (newSelection.has(slotId)) {
      newSelection.delete(slotId);
    } else {
      newSelection.add(slotId);
    }
    
    setSelectedTimeslots(newSelection);
  };
  
  // Select all slots for a specific day
  const selectAllForDay = (day) => {
    const newSelection = new Set(selectedTimeslots);
    
    timeSlots.forEach(slot => {
      newSelection.add(`${day}-${slot.start}-${slot.end}`);
    });
    
    setSelectedTimeslots(newSelection);
  };
  
  // Clear all slots for a specific day
  const clearAllForDay = (day) => {
    const newSelection = new Set(selectedTimeslots);
    
    timeSlots.forEach(slot => {
      newSelection.delete(`${day}-${slot.start}-${slot.end}`);
    });
    
    setSelectedTimeslots(newSelection);
  };
  
  // Select all slots for a specific time across all days
  const selectAllForTime = (timeIndex) => {
    const newSelection = new Set(selectedTimeslots);
    const slot = timeSlots[timeIndex];
    
    days.forEach(day => {
      newSelection.add(`${day}-${slot.start}-${slot.end}`);
    });
    
    setSelectedTimeslots(newSelection);
  };
  
  // Clear all slots for a specific time across all days
  const clearAllForTime = (timeIndex) => {
    const newSelection = new Set(selectedTimeslots);
    const slot = timeSlots[timeIndex];
    
    days.forEach(day => {
      newSelection.delete(`${day}-${slot.start}-${slot.end}`);
    });
    
    setSelectedTimeslots(newSelection);
  };
  
  // Handle save button click
  const handleSave = () => {
    onClose();
  };
  
  // Handle click outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Check if all slots for a day are selected
  const isAllDaySelected = (day) => {
    return timeSlots.every(slot => 
      selectedTimeslots.has(`${day}-${slot.start}-${slot.end}`)
    );
  };
  
  // Check if all slots for a time are selected
  const isAllTimeSelected = (timeIndex) => {
    const slot = timeSlots[timeIndex];
    return days.every(day => 
      selectedTimeslots.has(`${day}-${slot.start}-${slot.end}`)
    );
  };

  return (
    <div className={styles.popupBackdrop} onClick={handleBackdropClick}>
      <div className={styles.popupContent}>
        <div className={styles.popupHeader}>
          <h2>Select Time Slots</h2>
          <button type="button" className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.popupBody}>
          <div className={styles.timeslotTableContainer}>
            <table className={styles.timeslotTable}>
              <thead>
                <tr>
                  <th></th>
                  {days.map(day => (
                    <th key={day} className={styles.dayHeader}>
                      {day}
                      <div className={styles.dayActions}>
                        {isAllDaySelected(day) ? (
                          <button 
                            type="button" 
                            className={styles.clearDayButton}
                            onClick={() => clearAllForDay(day)}
                            title={`Clear all ${day} slots`}
                          >
                            Clear
                          </button>
                        ) : (
                          <button 
                            type="button" 
                            className={styles.selectDayButton}
                            onClick={() => selectAllForDay(day)}
                            title={`Select all ${day} slots`}
                          >
                            Select All
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((slot, index) => (
                  <tr key={`time-${index}`}>
                    <td className={styles.timeCell}>
                      {slot.display}
                      <div className={styles.timeActions}>
                        {isAllTimeSelected(index) ? (
                          <button 
                            type="button" 
                            className={styles.clearTimeButton}
                            onClick={() => clearAllForTime(index)}
                            title={`Clear all ${slot.display} slots`}
                          >
                            Clear
                          </button>
                        ) : (
                          <button 
                            type="button" 
                            className={styles.selectTimeButton}
                            onClick={() => selectAllForTime(index)}
                            title={`Select all ${slot.display} slots`}
                          >
                            Select All
                          </button>
                        )}
                      </div>
                    </td>
                    {days.map(day => {
                      const slotId = `${day}-${slot.start}-${slot.end}`;
                      const isSelected = selectedTimeslots.has(slotId);
                      
                      return (
                        <td 
                          key={`${day}-${index}`} 
                          className={`${styles.timeslotCell} ${isSelected ? styles.selected : ''}`}
                          onClick={() => toggleTimeslot(day, slot)}
                        >
                          {isSelected ? (
                            <div className={styles.selectedIndicator}>✓</div>
                          ) : (
                            <div className={styles.unselectedIndicator}></div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className={styles.selectionSummary}>
            <p>
              <strong>{selectedTimeslots.size}</strong> time slot(s) selected
            </p>
          </div>
        </div>
        
        <div className={styles.popupFooter}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={styles.saveButton} onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeslotPopup;