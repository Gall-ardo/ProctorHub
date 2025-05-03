// services/Admin/userFetchingService.js
const User = require("../../models/User");
const Instructor = require("../../models/Instructor");
const TeachingAssistant = require("../../models/TeachingAssistant");
const { Op } = require("sequelize");

class UserFetchingService {
  /**
   * Get all instructors with optional filtering
   * @param {Object} params - Parameters for filtering
   * @returns {Promise<Array>} List of instructors
   */
  async getInstructors(params = {}) {
    try {
      const whereConditions = {
        userType: 'instructor'
      };
      
      // Add search conditions if provided
      if (params.name) {
        whereConditions.name = { [Op.like]: `%${params.name}%` };
      }
      
      if (params.id) {
        whereConditions.id = { [Op.like]: `%${params.id}%` };
      }
      
      if (params.email) {
        whereConditions.email = { [Op.like]: `%${params.email}%` };
      }
      
      const instructors = await User.findAll({
        include: [{
          model: Instructor,
          as: 'instructorUser',
          required: true
        }],
        where: whereConditions,
        order: [['name', 'ASC']]
      });
      
      return instructors.map(instructor => ({
        id: instructor.id,
        name: instructor.name,
        email: instructor.email,
        department: instructor.instructorUser ? instructor.instructorUser.department : null
      }));
    } catch (error) {
      console.error("Error fetching instructors:", error);
      throw error;
    }
  }
  
  /**
   * Get all teaching assistants with optional filtering
   * @param {Object} params - Parameters for filtering
   * @returns {Promise<Array>} List of TAs
   */
  async getTeachingAssistants(params = {}) {
    try {
      const whereConditions = {
        userType: 'ta'
      };
      
      // Add search conditions if provided
      if (params.name) {
        whereConditions.name = { [Op.like]: `%${params.name}%` };
      }
      
      if (params.id) {
        whereConditions.id = { [Op.like]: `%${params.id}%` };
      }
      
      if (params.email) {
        whereConditions.email = { [Op.like]: `%${params.email}%` };
      }
      
      const teachingAssistants = await User.findAll({
        include: [{
          model: TeachingAssistant,
          as: 'taUser',
          required: true
        }],
        where: whereConditions,
        order: [['name', 'ASC']]
      });
      
      return teachingAssistants.map(ta => ({
        id: ta.id,
        name: ta.name,
        email: ta.email
      }));
    } catch (error) {
      console.error("Error fetching teaching assistants:", error);
      throw error;
    }
  }
  
  /**
   * Generic function to get users by type and search parameters
   * @param {Object} params - Parameters for filtering including userType
   * @returns {Promise<Array>} List of users
   */
  async getUsers(params = {}) {
    try {
      if (params.userType === 'instructor') {
        return await this.getInstructors(params);
      } else if (params.userType === 'ta') {
        return await this.getTeachingAssistants(params);
      } else {
        throw new Error('Invalid userType parameter');
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }
}

module.exports = new UserFetchingService();