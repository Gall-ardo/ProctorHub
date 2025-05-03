// services/Admin/courseAssociationService.js
const Course = require("../../models/Course");
const Instructor = require("../../models/Instructor");
const TeachingAssistant = require("../../models/TeachingAssistant");
const User = require("../../models/User");
const sequelize = require("../../config/db");

class CourseAssociationService {
  /**
   * Get instructors associated with a course
   * @param {String} courseId - The course ID
   * @returns {Promise<Array>} List of instructors
   */
  async getCourseInstructors(courseId) {
    try {
      const course = await Course.findByPk(courseId, {
        include: [
          {
            model: Instructor,
            as: "courses",
            include: [
              {
                model: User,
                as: "instructorUser",
                attributes: ["id", "name", "email"]
              }
            ]
          }
        ]
      });
      
      if (!course) {
        throw new Error("Course not found");
      }
      
      return course.courses.map(instructor => ({
        id: instructor.id,
        name: instructor.instructorUser.name,
        email: instructor.instructorUser.email,
        department: instructor.department
      }));
    } catch (error) {
      console.error(`Error getting instructors for course ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Add an instructor to a course
   * @param {String} courseId - The course ID
   * @param {String} instructorId - The instructor ID
   * @returns {Promise<Boolean>} Success status
   */
  async addInstructorToCourse(courseId, instructorId) {
    const t = await sequelize.transaction();
    
    try {
      const course = await Course.findByPk(courseId, { transaction: t });
      if (!course) {
        throw new Error("Course not found");
      }
      
      const instructor = await Instructor.findByPk(instructorId, { transaction: t });
      if (!instructor) {
        throw new Error("Instructor not found");
      }
      
      await course.addCourse(instructor, { transaction: t });
      
      await t.commit();
      return true;
    } catch (error) {
      console.error(`Error adding instructor ${instructorId} to course ${courseId}:`, error);
      await t.rollback();
      throw error;
    }
  }

  /**
   * Get teaching assistants associated with a course
   * @param {String} courseId - The course ID
   * @returns {Promise<Array>} List of teaching assistants
   */
  async getCourseTeachingAssistants(courseId) {
    try {
      const course = await Course.findByPk(courseId, {
        include: [
          {
            model: TeachingAssistant,
            as: "TAs",
            include: [
              {
                model: User,
                as: "taUser",
                attributes: ["id", "name", "email"]
              }
            ]
          }
        ]
      });
      
      if (!course) {
        throw new Error("Course not found");
      }
      
      return course.TAs.map(ta => ({
        id: ta.id,
        name: ta.taUser.name,
        email: ta.taUser.email
      }));
    } catch (error) {
      console.error(`Error getting TAs for course ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Add a teaching assistant to a course
   * @param {String} courseId - The course ID
   * @param {String} taId - The teaching assistant ID
   * @returns {Promise<Boolean>} Success status
   */
  async addTeachingAssistantToCourse(courseId, taId) {
    const t = await sequelize.transaction();
    
    try {
      const course = await Course.findByPk(courseId, { transaction: t });
      if (!course) {
        throw new Error("Course not found");
      }
      
      const ta = await TeachingAssistant.findByPk(taId, { transaction: t });
      if (!ta) {
        throw new Error("Teaching Assistant not found");
      }
      
      await course.addTA(ta, { transaction: t });
      
      await t.commit();
      return true;
    } catch (error) {
      console.error(`Error adding TA ${taId} to course ${courseId}:`, error);
      await t.rollback();
      throw error;
    }
  }

  /**
   * Update course associations with multiple instructors and TAs
   * @param {String} courseId - The course ID
   * @param {Array} instructorIds - List of instructor IDs
   * @param {Array} taIds - List of TA IDs
   * @returns {Promise<Boolean>} Success status
   */
  async updateCourseAssociations(courseId, instructorIds = [], taIds = []) {
    const t = await sequelize.transaction();
    
    try {
      const course = await Course.findByPk(courseId, { transaction: t });
      if (!course) {
        throw new Error("Course not found");
      }
      
      // Update instructor associations
      if (instructorIds.length > 0) {
        // Clear existing associations
        await course.setCourses([], { transaction: t });
        
        // Add new associations
        const instructors = await Instructor.findAll({
          where: { id: instructorIds },
          transaction: t
        });
        
        if (instructors.length > 0) {
          await course.setCourses(instructors, { transaction: t });
        }
      }
      
      // Update TA associations
      if (taIds.length > 0) {
        // Clear existing associations
        await course.setTAs([], { transaction: t });
        
        // Add new associations
        const tas = await TeachingAssistant.findAll({
          where: { id: taIds },
          transaction: t
        });
        
        if (tas.length > 0) {
          await course.setTAs(tas, { transaction: t });
        }
      }
      
      await t.commit();
      return true;
    } catch (error) {
      console.error(`Error updating associations for course ${courseId}:`, error);
      await t.rollback();
      throw error;
    }
  }
}

module.exports = new CourseAssociationService();