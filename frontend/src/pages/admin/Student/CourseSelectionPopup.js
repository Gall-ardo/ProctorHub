// CourseSelectionPopup.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './CourseSelectionPopup.module.css';

const CourseSelectionPopup = ({ 
  isOpen, 
  onClose, 
  onSelectCourses, 
  selectedCourses = [],
  department 
}) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  
  useEffect(() => {
    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen, department]);
  
  useEffect(() => {
    // Filter courses based on search term
    if (searchTerm.trim()) {
      const filtered = courses.filter(course => 
        course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (course.name && course.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  }, [searchTerm, courses]);
  
  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First try to get courses by department if a department is selected
      let response;
      if (department) {
        response = await axios.get(`/api/admin/fetch/courses/department/${department}`);
      } else {
        response = await axios.get('/api/admin/fetch/courses');
      }
      
      if (response.data.success) {
        setCourses(response.data.data || []);
        setFilteredCourses(response.data.data || []);
      } else {
        // Fallback to mock data if API fails
        const mockCourses = [
          { courseCode: 'CS-101', name: 'Introduction to Computer Science' },
          { courseCode: 'CS-102', name: 'Data Structures' },
          { courseCode: 'EEE-101', name: 'Introduction to Electrical Engineering' },
          { courseCode: 'IE-101', name: 'Introduction to Industrial Engineering' }
        ];
        setCourses(mockCourses);
        setFilteredCourses(mockCourses);
        console.warn('Using mock data due to API failure', response);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Fallback to mock data
      const mockCourses = [
        { courseCode: 'CS-101', name: 'Introduction to Computer Science' },
        { courseCode: 'CS-102', name: 'Data Structures' },
        { courseCode: 'EEE-101', name: 'Introduction to Electrical Engineering' },
        { courseCode: 'IE-101', name: 'Introduction to Industrial Engineering' }
      ];
      setCourses(mockCourses);
      setFilteredCourses(mockCourses);
      setError('Failed to fetch courses. Using default courses.');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleCourseSelection = (courseCode) => {
    onSelectCourses(
      selectedCourses.includes(courseCode) 
        ? selectedCourses.filter(code => code !== courseCode)
        : [...selectedCourses, courseCode]
    );
  };
  
  if (!isOpen) return null;
  
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Select Course{selectedCourses.length !== 1 ? 's' : ''}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search by course code or name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          {loading && <div className={styles.loading}>Loading courses...</div>}
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.courseList}>
            {filteredCourses.length === 0 && !loading ? (
              <div className={styles.emptyMessage}>No courses found</div>
            ) : (
              filteredCourses.map(course => (
                <div 
                  key={course.courseCode} 
                  className={`${styles.courseItem} ${selectedCourses.includes(course.courseCode) ? styles.selected : ''}`}
                  onClick={() => toggleCourseSelection(course.courseCode)}
                >
                  <div className={styles.courseInfo}>
                    <div className={styles.courseCode}>{course.courseCode}</div>
                    <div className={styles.courseName}>{course.name}</div>
                  </div>
                  <div className={styles.selectionIndicator}>
                    {selectedCourses.includes(course.courseCode) && <span>✓</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default CourseSelectionPopup;