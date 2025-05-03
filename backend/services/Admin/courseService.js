// services/Admin/courseService.js
const Course = require("../../models/Course");
const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");
const sequelize = require("../../config/db");

class CourseService {
  /**
   * Create a new course
   * @param {Object} courseData - The course data
   * @returns {Promise<Object>} The created course
   */
  async createCourse(courseData) {
    const t = await sequelize.transaction();
    
    try {
      // Check if course with the same course code already exists
      const existingCourse = await Course.findOne({
        where: {
          courseCode: courseData.courseCode
        },
        transaction: t
      });

      if (existingCourse) {
        throw new Error(`Course with code: ${courseData.courseCode} already exists`);
      }

      // Validate required fields
      if (!courseData.courseCode || !courseData.department || !courseData.semesterId) {
        throw new Error("Missing required fields: course code, department, and semester ID");
      }

      // Generate a unique ID for the course
      const courseId = courseData.id || uuidv4();
      
      // Create default course name if not provided
      if (!courseData.courseName) {
        courseData.courseName = `${courseData.department}${courseData.courseCode}`;
      }
      
      // Create the course with the generated ID
      const course = await Course.create({
        id: courseId,
        courseCode: courseData.courseCode,
        courseName: courseData.courseName,
        department: courseData.department,
        credit: courseData.credit || 3,
        isGradCourse: courseData.isGradCourse || false,
        semesterId: courseData.semesterId,
        studentCount: courseData.studentCount || 0
      }, { transaction: t });
      
      await t.commit();
      return course;
    } catch (error) {
      console.error("Transaction error in createCourse:", error);
      await t.rollback();
      throw error;
    }
  }

  /**
   * Get a course by ID
   * @param {String} id - The course ID to fetch
   * @returns {Promise<Object>} The course
   */
  async getCourseById(id) {
    try {
      const course = await Course.findByPk(id);
      
      if (!course) {
        throw new Error("Course not found");
      }
      
      return course;
    } catch (error) {
      console.error(`Error getting course by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a course by course code
   * @param {String} courseCode - The course code to search for
   * @returns {Promise<Object>} The course
   */
  async getCourseByCode(courseCode) {
    try {
      const course = await Course.findOne({
        where: {
          courseCode: courseCode
        }
      });
      
      if (!course) {
        throw new Error("Course not found");
      }
      
      return course;
    } catch (error) {
      console.error(`Error getting course by code ${courseCode}:`, error);
      throw error;
    }
  }

  /**
   * Get all courses with optional filters
   * @param {Object} filters - Optional filters for courses
   * @returns {Promise<Array>} List of courses
   */
  async getAllCourses(filters = {}) {
    try {
      const whereClause = {};
      
      if (filters.department) {
        whereClause.department = filters.department;
      }
      
      if (filters.isGradCourse !== undefined) {
        whereClause.isGradCourse = filters.isGradCourse;
      }
      
      if (filters.semesterId) {
        whereClause.semesterId = filters.semesterId;
      }
      
      return await Course.findAll({
        where: whereClause,
        order: [['courseCode', 'ASC']]
      });
    } catch (error) {
      console.error("Error finding courses:", error);
      throw error;
    }
  }

  /**
   * Update an existing course
   * @param {String} id - The course ID to update
   * @param {Object} courseData - The updated course data
   * @returns {Promise<Object>} The updated course
   */
  async updateCourse(id, courseData) {
    const t = await sequelize.transaction();
    
    try {
      const course = await Course.findByPk(id, { transaction: t });
      
      if (!course) {
        throw new Error("Course not found");
      }
      
      // Check if courseCode is being updated and if it's already in use by another course
      if (courseData.courseCode && courseData.courseCode !== course.courseCode) {
        const existingCourse = await Course.findOne({
          where: {
            courseCode: courseData.courseCode,
            id: { [Op.ne]: id } // Exclude current course
          },
          transaction: t
        });
        
        if (existingCourse) {
          throw new Error(`Course code ${courseData.courseCode} is already in use by another course`);
        }
      }
      
      // Create default course name if not provided but department and courseCode are changed
      if (!courseData.courseName && courseData.department && courseData.courseCode) {
        courseData.courseName = `${courseData.department}${courseData.courseCode}`;
      }
      
      // Update the course
      await course.update(courseData, { transaction: t });
      
      await t.commit();
      return course;
    } catch (error) {
      console.error(`Transaction error in updateCourse for ID ${id}:`, error);
      await t.rollback();
      throw error;
    }
  }

  /**
   * Delete a course by ID
   * @param {String} id - The course ID to delete
   * @returns {Promise<Boolean>} Success status
   */
  async deleteCourse(id) {
    const t = await sequelize.transaction();
    
    try {
      const course = await Course.findByPk(id, { transaction: t });
      
      if (!course) {
        throw new Error("Course not found");
      }
      
      await course.destroy({ transaction: t });
      
      await t.commit();
      return true;
    } catch (error) {
      console.error(`Transaction error in deleteCourse for ID ${id}:`, error);
      await t.rollback();
      throw error;
    }
  }

  /**
   * Import courses from CSV data
   * @param {Array} coursesData - Array of course data objects
   * @returns {Promise<Object>} Result with success count and errors
   */
  async importCoursesFromCSV(coursesData) {
    const createdCourses = [];
    const errors = [];
    
    for (const courseData of coursesData) {
      try {
        // Skip empty rows
        if (!courseData.courseCode && !courseData.department) {
          continue;
        }
        
        // Validate required fields
        if (!courseData.courseCode || !courseData.department || !courseData.semesterId) {
          errors.push({
            data: courseData,
            error: "Missing required fields: course code, department, and semester ID"
          });
          continue;
        }
        
        // Create course without sending individual emails
        const course = await this.createCourse(courseData);
        createdCourses.push(course);
      } catch (error) {
        errors.push({
          data: courseData,
          error: error.message
        });
        console.error(`Failed to create course ${courseData.courseCode || 'unknown code'}: ${error.message}`);
      }
    }

    return {
      createdCourses,
      errors,
      success: createdCourses.length
    };
  }

  /**
   * Search courses by query string
   * @param {String} query - Search query
   * @returns {Promise<Array>} Matching courses
   */
  async searchCourses(query) {
    try {
      return await Course.findAll({
        where: {
          [Op.or]: [
            { courseCode: { [Op.like]: `%${query}%` } },
            { courseName: { [Op.like]: `%${query}%` } },
            { department: { [Op.like]: `%${query}%` } }
          ]
        },
        limit: 20
      });
    } catch (error) {
      console.error("Error searching courses:", error);
      throw error;
    }
  }
}

module.exports = new CourseService();