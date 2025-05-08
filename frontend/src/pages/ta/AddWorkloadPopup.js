import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddWorkloadPopup.css';

const AddWorkloadPopup = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    instructorId: '',
    courseId: '',
    date: '',
    hours: '04',
    minutes: '00',
    workloadType: 'Lab Work'
  });
  
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [courseInstructors, setCourseInstructors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = 'http://localhost:5001/api';

  // Fetch TA's assigned courses when popup opens
  useEffect(() => {
    if (isOpen) {
      fetchAssignedCourses();
      
      // Reset form data
      setFormData({
        instructorId: '',
        courseId: '',
        date: '',
        hours: '04',
        minutes: '00',
        workloadType: 'Lab Work'
      });
      setCourseInstructors([]);
      setValidationError('');
    }
  }, [isOpen]);

  // Fetch instructors when course selection changes
  useEffect(() => {
    if (formData.courseId) {
      fetchCourseInstructors(formData.courseId);
    } else {
      setCourseInstructors([]);
    }
  }, [formData.courseId]);

  // Fetch TA's assigned courses
  const fetchAssignedCourses = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await axios.get(`${API_URL}/ta/courses/assigned`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setAssignedCourses(response.data.data);
      } else {
        setValidationError('Failed to fetch assigned courses');
      }
    } catch (error) {
      console.error('Error fetching assigned courses:', error);
      setValidationError(error.message || 'Failed to fetch assigned courses');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch instructors for selected course
  const fetchCourseInstructors = async (courseId) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await axios.get(`${API_URL}/ta/courses/${courseId}/instructors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setCourseInstructors(response.data.data);
        
        // If there's only one instructor, automatically select it
        if (response.data.data.length === 1) {
          setFormData(prev => ({
            ...prev,
            instructorId: response.data.data[0].id
          }));
        } else {
          // Reset instructor selection if multiple instructors
          setFormData(prev => ({
            ...prev,
            instructorId: ''
          }));
        }
      } else {
        setValidationError('Failed to fetch course instructors');
      }
    } catch (error) {
      console.error('Error fetching course instructors:', error);
      setValidationError(error.message || 'Failed to fetch course instructors');
    } finally {
      setIsLoading(false);
    }
  };

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
    // Check if course is selected
    if (!formData.courseId) {
      setValidationError('Please select a course');
      return false;
    }
    
    // Check if instructor is selected
    if (!formData.instructorId) {
      setValidationError('Please select an instructor');
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
      // Calculate total hours (including minutes portion)
      const totalHours = parseInt(formData.hours) + (parseInt(formData.minutes) / 60);
      
      const submitData = {
        instructorId: formData.instructorId,
        courseId: formData.courseId,
        date: formData.date,
        hours: totalHours.toFixed(2), // Format with 2 decimal places
        workloadType: formData.workloadType
      };
      
      console.log('Submitting workload from popup:', submitData);
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting workload from popup:', error);
      setValidationError(error.message || 'Failed to submit workload. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  // Find the selected course for display
  const selectedCourse = assignedCourses.find(course => course.id === formData.courseId);
  const selectedInstructor = courseInstructors.find(instructor => instructor.id === formData.instructorId);

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
            <label>Course</label>
            {isLoading && !formData.courseId ? (
              <div className="ta-add-workload-popup-loading">Loading courses...</div>
            ) : (
              <div className="ta-add-workload-popup-custom-select">
                <div className="ta-add-workload-popup-selected-option" onClick={() => {
                  // Toggle dropdown here if needed
                }}>
                  {selectedCourse ? 
                    `${selectedCourse.courseCode} - ${selectedCourse.courseName || ''}` : 
                    'Select a course'
                  }
                  <span className="ta-add-workload-popup-dropdown-arrow">▼</span>
                </div>
                <select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleChange}
                  required
                  className="ta-add-workload-popup-hidden-select"
                >
                  <option value="">Select a course</option>
                  {assignedCourses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.courseCode} - {course.courseName || ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="ta-add-workload-popup-form-group">
            <label>Instructor</label>
            {!formData.courseId ? (
              <div className="ta-add-workload-popup-disabled-select">
                Please select a course first
              </div>
            ) : isLoading ? (
              <div className="ta-add-workload-popup-loading">Loading instructors...</div>
            ) : courseInstructors.length === 0 ? (
              <div className="ta-add-workload-popup-no-data">No instructors found for this course</div>
            ) : (
              <div className="ta-add-workload-popup-custom-select">
                <div className="ta-add-workload-popup-selected-option" onClick={() => {
                  // Toggle dropdown here if needed
                }}>
                  {selectedInstructor ? 
                    `${selectedInstructor.name || selectedInstructor.email}` : 
                    'Select an instructor'
                  }
                  <span className="ta-add-workload-popup-dropdown-arrow">▼</span>
                </div>
                <select
                  name="instructorId"
                  value={formData.instructorId}
                  onChange={handleChange}
                  required
                  className="ta-add-workload-popup-hidden-select"
                >
                  <option value="">Select an instructor</option>
                  {courseInstructors.map(instructor => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.name || instructor.email}
                    </option>
                  ))}
                </select>
              </div>
            )}
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