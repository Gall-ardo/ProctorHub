// services/Admin/courseFetchingService.js
const Course = require('../../models/Course');
const { Op } = require('sequelize');

class CourseFetchingService {
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

  async getCoursesByDepartment(department) {
    try {
      if (!department) {
        return [];
      }
      
      const courses = await Course.findAll({
        where: {
          department: department
        },
        order: [['courseCode', 'ASC']]
      });
      
      return courses;
    } catch (error) {
      console.error(`Error fetching courses for department ${department}:`, error);
      return []; 
    }
  }

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
      
      return courses;
    } catch (error) {
      console.error('Error searching courses:', error);
      return []; 
    }
  }
  
  // Additional helper method to get course by ID
  async getCourseById(courseId) {
    try {
      const course = await Course.findByPk(courseId);
      return course;
    } catch (error) {
      console.error(`Error fetching course with ID ${courseId}:`, error);
      return null;
    }
  }
  
  // Get courses by multiple IDs (useful for batch operations)
  async getCoursesByIds(courseIds) {
    try {
      if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
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
      
      return courses;
    } catch (error) {
      console.error('Error fetching courses by IDs:', error);
      return [];
    }
  }
}

module.exports = new CourseFetchingService();