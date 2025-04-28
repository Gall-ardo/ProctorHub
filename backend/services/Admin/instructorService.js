const sequelize = require('../../config/db');
const { Op } = require('sequelize');

// Import models directly
const Instructor = require('../../models/Instructor');
const User = require('../../models/User');

const instructorService = {
  /**
   * Get all instructors
   * @returns {Promise<Array>} - Array of instructors
   */
  getAllInstructors: async () => {
    try {
      const instructors = await Instructor.findAll({
        include: [{ model: User, as: 'instructorUser' }],
        order: [[{ model: User, as: 'instructorUser' }, 'name', 'ASC']]
      });
      
      // Transform the result to a more friendly format
      const formattedInstructors = instructors.map(instructor => ({
        id: instructor.id,
        name: instructor.instructorUser ? instructor.instructorUser.name : 'Unknown',
        email: instructor.instructorUser ? instructor.instructorUser.email : '',
        department: instructor.department
      }));
      
      return formattedInstructors;
    } catch (error) {
      console.error('Error in getAllInstructors:', error);
      throw error;
    }
  },
  
  /**
   * Get instructors by department
   * @param {string} department - The department
   * @returns {Promise<Array>} - Array of instructors
   */
  getInstructorsByDepartment: async (department) => {
    try {
      console.log(`Fetching instructors for department: ${department}`);
      
      const instructors = await Instructor.findAll({
        where: { department },
        include: [{ model: User, as: 'instructorUser' }],
        order: [[{ model: User, as: 'instructorUser' }, 'name', 'ASC']]
      });
      
      console.log(`Found ${instructors.length} instructors`);
      
      // Transform the result to a more friendly format
      const formattedInstructors = instructors.map(instructor => {
        const result = {
          id: instructor.id,
          name: instructor.instructorUser ? instructor.instructorUser.name : 'Unknown',
          email: instructor.instructorUser ? instructor.instructorUser.email : '',
          department: instructor.department
        };
        
        console.log('Formatted instructor:', result);
        return result;
      });
      
      return formattedInstructors;
    } catch (error) {
      console.error('Error in getInstructorsByDepartment:', error);
      throw error;
    }
  },
  
  /**
   * Get instructor by ID
   * @param {string} id - The instructor ID
   * @returns {Promise<Object|null>} - The instructor or null if not found
   */
  getInstructorById: async (id) => {
    try {
      const instructor = await Instructor.findByPk(id, {
        include: [{ model: User, as: 'instructorUser' }]
      });
      
      if (!instructor) {
        return null;
      }
      
      // Format the result
      return {
        id: instructor.id,
        name: instructor.instructorUser ? instructor.instructorUser.name : 'Unknown',
        email: instructor.instructorUser ? instructor.instructorUser.email : '',
        department: instructor.department
      };
    } catch (error) {
      console.error('Error in getInstructorById:', error);
      throw error;
    }
  },
  
  /**
   * Search instructors
   * @param {string} query - The search query
   * @param {string} department - Optional department filter
   * @returns {Promise<Array>} - Array of instructors
   */
  searchInstructors: async (query, department = null) => {
    try {
      const whereCondition = {};
      
      if (department) {
        whereCondition.department = department;
      }
      
      const instructors = await Instructor.findAll({
        where: whereCondition,
        include: [{
          model: User,
          as: 'instructorUser',
          where: {
            name: {
              [Op.iLike]: `%${query}%`
            }
          }
        }],
        order: [[{ model: User, as: 'instructorUser' }, 'name', 'ASC']]
      });
      
      // Transform the result
      const formattedInstructors = instructors.map(instructor => ({
        id: instructor.id,
        name: instructor.instructorUser ? instructor.instructorUser.name : 'Unknown',
        email: instructor.instructorUser ? instructor.instructorUser.email : '',
        department: instructor.department
      }));
      
      return formattedInstructors;
    } catch (error) {
      console.error('Error in searchInstructors:', error);
      throw error;
    }
  }
};

module.exports = instructorService;