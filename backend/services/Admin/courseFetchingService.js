// services/Admin/courseFetchingService.js
const Course = require('../../models/Course');
const Semester = require('../../models/Semester');
const { Op } = require('sequelize');

class CourseFetchingService {
  /**
   * Get all courses
   * @returns {Promise<Array>} Array of courses
   */
  async getAllCourses() {
    try {
      const courses = await Course.findAll({
        order: [['courseCode', 'ASC']]
      });
      return courses;
    } catch (error) {
      console.error('Error fetching all courses:', error);
      return []; 
    }
  }

  /**
   * Get courses by semester ID
   * @param {string} semesterId - Semester ID
   * @returns {Promise<Array>} Array of courses
   */
  async getCoursesBySemester(semesterId) {
    try {
      if (!semesterId) {
        console.warn('No semester ID provided for getCoursesBySemester');
        return [];
      }
      
      const courses = await Course.findAll({
        where: {
          semesterId: semesterId
        },
        order: [['courseCode', 'ASC']]
      });
      
      console.log(`Found ${courses.length} courses for semester ${semesterId}`);
      return courses;
    } catch (error) {
      console.error(`Error fetching courses for semester ${semesterId}:`, error);
      return []; 
    }
  }

  /**
   * Get courses by department
   * @param {string} department - Department code
   * @returns {Promise<Array>} Array of courses
   */
  async getCoursesByDepartment(department) {
    try {
      if (!department) {
        console.warn('No department provided for getCoursesByDepartment');
        return [];
      }
      
      const courses = await Course.findAll({
        where: {
          department: department
        },
        order: [['courseCode', 'ASC']]
      });
      
      console.log(`Found ${courses.length} courses for department ${department}`);
      return courses;
    } catch (error) {
      console.error(`Error fetching courses for department ${department}:`, error);
      return []; 
    }
  }

  /**
   * Get courses by department and semester
   * @param {string} department - Department code
   * @param {string} semesterId - Semester ID
   * @returns {Promise<Array>} Array of courses
   */
  async getCoursesByDepartmentAndSemester(department, semesterId) {
    try {
      if (!department || !semesterId) {
        console.warn('Missing parameter for getCoursesByDepartmentAndSemester');
        return [];
      }
      
      const courses = await Course.findAll({
        where: {
          department: department,
          semesterId: semesterId
        },
        order: [['courseCode', 'ASC']]
      });
      
      console.log(`Found ${courses.length} courses for department ${department} and semester ${semesterId}`);
      return courses;
    } catch (error) {
      console.error(`Error fetching courses for department ${department} and semester ${semesterId}:`, error);
      return []; 
    }
  }

  /**
   * Search courses based on query parameters
   * @param {Object} query - Query parameters
   * @returns {Promise<Array>} Array of courses
   */
  async searchCourses(query) {
    try {
      const whereClause = {};
      
      if (query.courseCode) {
        whereClause.courseCode = {
          [Op.iLike]: `%${query.courseCode}%`
        };
      }
      
      if (query.courseName) {
        whereClause.courseName = {
          [Op.iLike]: `%${query.courseName}%`
        };
      }
      
      if (query.department) {
        whereClause.department = query.department;
      }
      
      // Optional filter for graduate courses
      if (query.isGradCourse !== undefined) {
        whereClause.isGradCourse = query.isGradCourse === 'true';
      }
      
      // Optional filter for semester
      if (query.semesterId) {
        whereClause.semesterId = query.semesterId;
      }
      
      const courses = await Course.findAll({
        where: whereClause,
        order: [['courseCode', 'ASC']]
      });
      
      console.log(`Found ${courses.length} courses matching query:`, query);
      return courses;
    } catch (error) {
      console.error('Error searching courses:', error);
      return []; 
    }
  }
  
  /**
   * Get course by ID
   * @param {string} courseId - Course ID
   * @returns {Promise<Object|null>} Course object or null
   */
  async getCourseById(courseId) {
    try {
      if (!courseId) {
        console.warn('No course ID provided for getCourseById');
        return null;
      }
      
      const course = await Course.findByPk(courseId);
      return course;
    } catch (error) {
      console.error(`Error fetching course with ID ${courseId}:`, error);
      return null;
    }
  }
  
  /**
   * Get courses by multiple IDs
   * @param {Array} courseIds - Array of course IDs
   * @returns {Promise<Array>} Array of courses
   */
  async getCoursesByIds(courseIds) {
    try {
      if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
        console.warn('Invalid course IDs provided for getCoursesByIds');
        return [];
      }
      
      const courses = await Course.findAll({
        where: {
          id: {
            [Op.in]: courseIds
          }
        },
        order: [['courseCode', 'ASC']]
      });
      
      console.log(`Found ${courses.length} courses by IDs`);
      return courses;
    } catch (error) {
      console.error('Error fetching courses by IDs:', error);
      return [];
    }
  }
}

module.exports = new CourseFetchingService();