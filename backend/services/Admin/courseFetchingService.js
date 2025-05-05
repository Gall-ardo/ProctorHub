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
      throw error;
    }
  }

  async getCoursesByDepartment(department) {
    try {
      if (!department) {
        throw new Error('Department is required');
      }
      
      // Get courses that match the department prefix
      const courses = await Course.findAll({
        where: {
          courseCode: {
            [Op.startsWith]: department
          }
        },
        order: [['courseCode', 'ASC']]
      });
      
      return courses;
    } catch (error) {
      console.error(`Error fetching courses for department ${department}:`, error);
      throw error;
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
      
      if (query.name) {
        whereClause.name = {
          [Op.iLike]: `%${query.name}%`
        };
      }
      
      if (query.department) {
        whereClause.courseCode = {
          [Op.startsWith]: query.department
        };
      }
      
      const courses = await Course.findAll({
        where: whereClause,
        order: [['courseCode', 'ASC']]
      });
      
      return courses;
    } catch (error) {
      console.error('Error searching courses:', error);
      throw error;
    }
  }
}

module.exports = new CourseFetchingService();