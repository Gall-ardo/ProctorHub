import React, { useState, useEffect } from 'react';
import './AddWorkloadPopup.css';

const AddWorkloadPopup = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    instructorEmail: '',
    courseCode: '',
    date: '',
    hours: '04',
    minutes: '00',
    workloadType: 'Lab Work'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Reset form data when the popup is opened
  useEffect(() => {
    if (isOpen) {
      setFormData({
        instructorEmail: '',
        courseCode: '',
        date: '',
        hours: '04',
        minutes: '00',
        workloadType: 'Lab Work'
      });
      setValidationError('');
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Reset validation error when user makes changes
    if (validationError) {
      setValidationError('');
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    // Check if email is in valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.instructorEmail)) {
      setValidationError('Please enter a valid email address');
      return false;
    }
    
    // Check course code format (simple validation)
    if (formData.courseCode.trim().length < 2) {
      setValidationError('Please enter a valid course code');
      return false;
    }
    
    // Check if date is selected
    if (!formData.date) {
      setValidationError('Please select a date');
      return false;
    }
    
    // Validate hours and minutes
    const hours = parseInt(formData.hours);
    const minutes = parseInt(formData.minutes);
    
    if (isNaN(hours) || hours < 0 || hours > 23) {
      setValidationError('Hours must be between 0 and 23');
      return false;
    }
    
    if (isNaN(minutes) || minutes < 0 || minutes > 59) {
      setValidationError('Minutes must be between 0 and 59');
      return false;
    }
    
    // Ensure total time is not zero
    if (hours === 0 && minutes === 0) {
      setValidationError('Total duration must be greater than zero');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Submitting workload from popup:', formData);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting workload from popup:', error);
      setValidationError(error.message || 'Failed to submit workload. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose(); // This will close the popup when the "X" is clicked
  };

  if (!isOpen) return null;

  return (
    <div className="ta-add-workload-popup-popup-overlay">
      <div className="ta-add-workload-popup-popup-container">
        {/* Close Button */}
        <button className="ta-add-workload-popup-close-btn" onClick={handleClose}>
          ×
        </button>
        <h2>Add Workload</h2>
        
        {validationError && (
          <div className="ta-add-workload-popup-error-message">
            {validationError}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="ta-add-workload-popup-form-group">
            <label>Instructor Email</label>
            <input
              type="email"
              name="instructorEmail"
              placeholder="Enter instructor e-mail"
              value={formData.instructorEmail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="ta-add-workload-popup-form-group">
            <label>Course Code</label>
            <input
              type="text"
              name="courseCode"
              placeholder="Enter course code"
              value={formData.courseCode}
              onChange={handleChange}
              required
            />
          </div>

          <div className="ta-add-workload-popup-form-group">
            <label>Enter date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="ta-add-workload-popup-form-group">
            <label>Enter time</label>
            <div className="ta-add-workload-popup-time-input">
              <input
                type="text"
                name="hours"
                value={formData.hours}
                onChange={handleChange}
                required
              />
              <span>:</span>
              <input
                type="text"
                name="minutes"
                value={formData.minutes}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="ta-add-workload-popup-form-group">
            <label>Select the workload type: </label>
            <div className="ta-add-workload-popup-workload-type-options">
              <label className="ta-add-workload-popup-radio-option">
                <input
                  type="radio"
                  name="workloadType"
                  value="Lab Work"
                  checked={formData.workloadType === 'Lab Work'}
                  onChange={handleChange}
                />
                <span className="ta-add-workload-popup-radio-circle"></span>
                <span className="ta-add-workload-popup-radio-label">Lab Work</span>
              </label>
              <label className="ta-add-workload-popup-radio-option">
                <input
                  type="radio"
                  name="workloadType"
                  value="Grading"
                  checked={formData.workloadType === 'Grading'}
                  onChange={handleChange}
                />
                <span className="ta-add-workload-popup-radio-circle"></span>
                <span className="ta-add-workload-popup-radio-label">Grading</span>
              </label>
              <label className="ta-add-workload-popup-radio-option">
                <input
                  type="radio"
                  name="workloadType"
                  value="Recitation"
                  checked={formData.workloadType === 'Recitation'}
                  onChange={handleChange}
                />
                <span className="ta-add-workload-popup-radio-circle"></span>
                <span className="ta-add-workload-popup-radio-label">Recitation</span>
              </label>
              <label className="ta-add-workload-popup-radio-option">
                <input
                  type="radio"
                  name="workloadType"
                  value="Office Hour"
                  checked={formData.workloadType === 'Office Hour'}
                  onChange={handleChange}
                />
                <span className="ta-add-workload-popup-radio-circle"></span>
                <span className="ta-add-workload-popup-radio-label">Office Hour</span>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className="ta-add-workload-popup-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Workload Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddWorkloadPopup;