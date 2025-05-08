import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './CourseSelectionPopup.module.css';

const CourseSelectionPopup = ({ 
  isOpen, 
  onClose, 
  onSelectCourses, 
  selectedCourses = [],
  department  // Still accepting department but not using it to filter courses
}) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  
  useEffect(() => {
    if (isOpen) {
      fetchAllCourses();
    }
  }, [isOpen]);
  
  useEffect(() => {
    // Filter courses based on search term
    if (searchTerm.trim()) {
      const filtered = courses.filter(course => 
        `${course.department} ${course.courseCode}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (course.courseName && course.courseName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  }, [searchTerm, courses]);
  
  // Modified to fetch ALL courses, regardless of department
  const fetchAllCourses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Always use the endpoint that fetches all courses
      const baseUrl = 'http://localhost:5001';
      const endpoint = `${baseUrl}/api/admin/fetch/courses`;
      
      console.log(`Fetching all courses from endpoint: ${endpoint}`);
      
      const response = await axios.get(endpoint);
      
      console.log('API Response:', response.data);
      
      if (response.data && response.data.success) {
        if (response.data.data && response.data.data.length > 0) {
          console.log(`Found ${response.data.data.length} courses from API`);
          setCourses(response.data.data);
          setFilteredCourses(response.data.data);
          setError(null);
        } else {
          console.warn('API returned success but no courses');
          setError('No courses found in database');
          setCourses([]);
          setFilteredCourses([]);
        }
      } else {
        console.warn('API response not successful', response.data);
        setError('Failed to fetch courses');
        setCourses([]);
        setFilteredCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      
      setError('Failed to fetch courses');
      setCourses([]);
      setFilteredCourses([]);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleCourseSelection = (course) => {
    const formattedCourseCode = `${course.department} ${course.courseCode}`;
    onSelectCourses(
      selectedCourses.includes(formattedCourseCode) 
        ? selectedCourses.filter(code => code !== formattedCourseCode)
        : [...selectedCourses, formattedCourseCode]
    );
  };
  
  if (!isOpen) return null;
  
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Select Courses</h2>
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
                  key={course.id || `${course.department}-${course.courseCode}`} 
                  className={`${styles.courseItem} ${selectedCourses.includes(`${course.department} ${course.courseCode}`) ? styles.selected : ''}`}
                  onClick={() => toggleCourseSelection(course)}
                >
                  <div className={styles.courseInfo}>
                    <div className={styles.courseCode}>{course.department} {course.courseCode}</div>
                    <div className={styles.courseName}>{course.courseName}</div>
                  </div>
                  <div className={styles.selectionIndicator}>
                    {selectedCourses.includes(`${course.department} ${course.courseCode}`) && <span>✓</span>}
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