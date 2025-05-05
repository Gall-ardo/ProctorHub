// components/CourseSelectionPopup.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './CourseSelectionPopup.module.css';

const CourseSelectionPopup = ({ 
  isOpen, 
  onClose, 
  onSelectCourses, 
  selectedCourses,
  department 
}) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [localSelectedCourses, setLocalSelectedCourses] = useState([]);
  
  useEffect(() => {
    if (isOpen) {
      setLocalSelectedCourses(selectedCourses || []);
      fetchCourses();
    }
  }, [isOpen, selectedCourses]);
  
  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let endpoint = '/api/admin/fetch/courses';
      
      if (department) {
        endpoint = `/api/admin/fetch/courses/department/${department}`;
      }
      
      const response = await axios.get(endpoint);
      
      if (response.data.success) {
        setCourses(response.data.data);
      } else {
        setError('Failed to fetch courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('An error occurred while fetching courses');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchCourses();
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/admin/fetch/courses/search', {
        params: {
          courseCode: searchTerm,
          name: searchTerm
        }
      });
      
      if (response.data.success) {
        setCourses(response.data.data);
      } else {
        setError('Failed to search courses');
      }
    } catch (error) {
      console.error('Error searching courses:', error);
      setError('An error occurred while searching courses');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleCourseSelection = (courseCode) => {
    if (localSelectedCourses.includes(courseCode)) {
      setLocalSelectedCourses(localSelectedCourses.filter(code => code !== courseCode));
    } else {
      setLocalSelectedCourses([...localSelectedCourses, courseCode]);
    }
  };
  
  const handleSave = () => {
    onSelectCourses(localSelectedCourses);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Select Courses</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search by course code or name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            className={styles.searchButton}
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
        
        {loading && <div className={styles.loading}>Loading courses...</div>}
        {error && <div className={styles.error}>{error}</div>}
        
        <div className={styles.courseList}>
          {courses.length === 0 && !loading ? (
            <div className={styles.noCourses}>No courses found</div>
          ) : (
            courses.map(course => (
              <div 
                key={course.courseCode} 
                className={`${styles.courseItem} ${localSelectedCourses.includes(course.courseCode) ? styles.selected : ''}`}
                onClick={() => toggleCourseSelection(course.courseCode)}
              >
                <div className={styles.courseCode}>{course.courseCode}</div>
                <div className={styles.courseName}>{course.name}</div>
                {localSelectedCourses.includes(course.courseCode) && (
                  <div className={styles.checkmark}>✓</div>
                )}
              </div>
            ))
          )}
        </div>
        
        <div className={styles.selectedCount}>
          Selected: {localSelectedCourses.length} courses
        </div>
        
        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>Cancel</button>
          <button className={styles.saveButton} onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default CourseSelectionPopup;