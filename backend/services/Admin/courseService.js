// services/Admin/courseService.js
const Course = require("../../models/Course");
const Instructor = require("../../models/Instructor");
const TeachingAssistant = require("../../models/TeachingAssistant");
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
          courseCode: courseData.courseCode,
          department: courseData.department,
          semesterId: courseData.semesterId
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

      const courseId = `${courseData.department}${courseData.courseCode}${courseData.semesterId}`.replace(/\s+/g, '');
      
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
      
      // Log for debugging
      console.log(`Created course: ${course.id}, checking for instructors and TAs`);
      
      // Associate instructors if provided
      if (courseData.instructorIds && Array.isArray(courseData.instructorIds) && courseData.instructorIds.length > 0) {
        console.log(`Course ${course.id} has instructorIds: ${JSON.stringify(courseData.instructorIds)}`);
        
        const instructors = await Instructor.findAll({
          where: { id: courseData.instructorIds },
          transaction: t
        });
        
        console.log(`Found ${instructors.length} instructors for association`);
        
        if (instructors.length > 0) {
          await course.addInstructors(instructors, { transaction: t });
          console.log(`Associated ${instructors.length} instructors with course ${course.id}`);
        } else {
          console.log(`Warning: No instructors found for IDs: ${JSON.stringify(courseData.instructorIds)}`);
        }
      }
      
      // Associate teaching assistants if provided
      if (courseData.taIds && Array.isArray(courseData.taIds) && courseData.taIds.length > 0) {
        console.log(`Course ${course.id} has taIds: ${JSON.stringify(courseData.taIds)}`);
        
        const teachingAssistants = await TeachingAssistant.findAll({
          where: { id: courseData.taIds },
          transaction: t
        });
        
        console.log(`Found ${teachingAssistants.length} TAs for association`);
        
        if (teachingAssistants.length > 0) {
          // Use the 'TAs' alias to properly associate teaching assistants
          await course.addTAs(teachingAssistants, { transaction: t });
          console.log(`Associated ${teachingAssistants.length} TAs with course ${course.id}`);
        } else {
          console.log(`Warning: No TAs found for IDs: ${JSON.stringify(courseData.taIds)}`);
        }
      }
      
      await t.commit();
      console.log(`Successfully created course ${course.id} with all associations`);
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
      const course = await Course.findByPk(id, {
        include: [
          { model: Instructor, as: 'instructors', through: { attributes: [] } },
          { model: TeachingAssistant, as: 'TAs', through: { attributes: [] } }
        ]
      });
      
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
        },
        include: [
          { model: Instructor, as: 'instructors', through: { attributes: [] } },
          { model: TeachingAssistant, as: 'TAs', through: { attributes: [] } }
        ]
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
        include: [
          { model: Instructor, as: 'instructors', through: { attributes: [] } },
          { model: TeachingAssistant, as: 'TAs', through: { attributes: [] } }
        ],
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
      
      // Handle instructor associations if provided
      if (courseData.instructorIds && Array.isArray(courseData.instructorIds)) {
        console.log(`Updating course ${course.id} with instructorIds: ${JSON.stringify(courseData.instructorIds)}`);
        
        // Find all instructors that match the provided IDs
        const instructors = await Instructor.findAll({
          where: { id: courseData.instructorIds },
          transaction: t
        });
        
        console.log(`Found ${instructors.length} instructors for association`);
        
        // Replace existing instructors with the new set
        if (instructors.length > 0 || courseData.instructorIds.length === 0) {
          await course.setInstructors(instructors, { transaction: t });
          console.log(`Updated instructors for course ${course.id}`);
        }
      }
      
      // Handle teaching assistant associations if provided
      if (courseData.taIds && Array.isArray(courseData.taIds)) {
        console.log(`Updating course ${course.id} with taIds: ${JSON.stringify(courseData.taIds)}`);
        
        // Find all teaching assistants that match the provided IDs
        const teachingAssistants = await TeachingAssistant.findAll({
          where: { id: courseData.taIds },
          transaction: t
        });
        
        console.log(`Found ${teachingAssistants.length} TAs for association`);
        
        // Replace existing teaching assistants with the new set
        // Use the 'TAs' alias to properly associate teaching assistants
        if (teachingAssistants.length > 0 || courseData.taIds.length === 0) {
          await course.setTAs(teachingAssistants, { transaction: t });
          console.log(`Updated TAs for course ${course.id}`);
        }
      }
      
      await t.commit();
      
      // Reload the course with associations to return
      return await this.getCourseById(id);
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
   * Add teaching assistants to a course
   * @param {String} courseId - The course ID
   * @param {Array} taIds - Array of teaching assistant IDs
   * @returns {Promise<Object>} The updated course
   */
  async addTeachingAssistantsToCourse(courseId, taIds) {
    const t = await sequelize.transaction();
    
    try {
      const course = await Course.findByPk(courseId, { transaction: t });
      
      if (!course) {
        throw new Error("Course not found");
      }
      
      // Find all teaching assistants that match the provided IDs
      const teachingAssistants = await TeachingAssistant.findAll({
        where: { id: taIds },
        transaction: t
      });
      
      if (teachingAssistants.length === 0) {
        throw new Error("No valid teaching assistants found with the provided IDs");
      }
      
      // Add the teaching assistants to the course
      // Use the 'TAs' alias to properly associate teaching assistants
      await course.addTAs(teachingAssistants, { transaction: t });
      
      await t.commit();
      
      // Reload the course with associations
      return await this.getCourseById(courseId);
    } catch (error) {
      console.error(`Transaction error in addTeachingAssistantsToCourse for ID ${courseId}:`, error);
      await t.rollback();
      throw error;
    }
  }

  /**
   * Remove a teaching assistant from a course
   * @param {String} courseId - The course ID
   * @param {String} taId - The teaching assistant ID
   * @returns {Promise<Boolean>} Success status
   */
  async removeTeachingAssistantFromCourse(courseId, taId) {
    const t = await sequelize.transaction();
    
    try {
      const course = await Course.findByPk(courseId, { transaction: t });
      
      if (!course) {
        throw new Error("Course not found");
      }
      
      // Find the teaching assistant
      const teachingAssistant = await TeachingAssistant.findByPk(taId, { transaction: t });
      
      if (!teachingAssistant) {
        throw new Error("Teaching assistant not found");
      }
      
      // Check if the teaching assistant is associated with the course
      // Use the 'TAs' alias to properly check association
      const association = await course.hasTAs(teachingAssistant, { transaction: t });
      
      if (!association) {
        throw new Error("Teaching assistant is not assigned to this course");
      }
      
      // Remove the teaching assistant from the course
      // Use the 'TAs' alias to properly remove association
      await course.removeTA(teachingAssistant, { transaction: t });
      
      await t.commit();
      return true;
    } catch (error) {
      console.error(`Transaction error in removeTeachingAssistantFromCourse for course ID ${courseId} and TA ID ${taId}:`, error);
      await t.rollback();
      throw error;
    }
  }

  /**
   * Get all teaching assistants for a course
   * @param {String} courseId - The course ID
   * @returns {Promise<Array>} List of teaching assistants
   */
  async getTeachingAssistantsForCourse(courseId) {
    try {
      const course = await Course.findByPk(courseId, {
        include: [
          { model: TeachingAssistant, as: 'TAs', through: { attributes: [] } }
        ]
      });
      
      if (!course) {
        throw new Error("Course not found");
      }
      
      return course.TAs;
    } catch (error) {
      console.error(`Error getting teaching assistants for course ID ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Get all instructors for a course
   * @param {String} courseId - The course ID
   * @returns {Promise<Array>} List of instructors
   */
  async getInstructorsForCourse(courseId) {
    try {
      const course = await Course.findByPk(courseId, {
        include: [
          { model: Instructor, as: 'instructors', through: { attributes: [] } }
        ]
      });
      
      if (!course) {
        throw new Error("Course not found");
      }
      
      return course.instructors;
    } catch (error) {
      console.error(`Error getting instructors for course ID ${courseId}:`, error);
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
        
        console.log(`Importing course from CSV: ${courseData.courseCode}`);
        if (courseData.instructorIds) {
          console.log(`With instructor IDs: ${JSON.stringify(courseData.instructorIds)}`);
        }
        if (courseData.taIds) {
          console.log(`With TA IDs: ${JSON.stringify(courseData.taIds)}`);
        }
        
        // Create course
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
        include: [
          { model: Instructor, as: 'instructors', through: { attributes: [] } },
          { model: TeachingAssistant, as: 'TAs', through: { attributes: [] } }
        ],
        limit: 20
      });
    } catch (error) {
      console.error("Error searching courses:", error);
      throw error;
    }
  }
}

module.exports = new CourseService();