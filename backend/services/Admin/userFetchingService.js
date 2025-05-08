// services/Admin/userFetchingService.js
const User = require("../../models/User");
const Instructor = require("../../models/Instructor");
const TeachingAssistant = require("../../models/TeachingAssistant");
const { Op } = require("sequelize");

class UserFetchingService {
  
  async getInstructors(params = {}) {
    try {
      console.log("⚙️  getInstructors() called with params:", params);
  
      const instructorWhere = {};
      if (params.department) {
        instructorWhere.department = params.department;
      }
  
      const instructors = await Instructor.findAll({
        where: instructorWhere,
        raw: true
      });
  
      console.log("📦 Instructors from DB:", instructors);
  
      const instructorIds = instructors.map(instructor => instructor.id);
      console.log("🆔 Instructor IDs:", instructorIds);
  
      const userWhere = {
        userType: 'instructor',
        id: { [Op.in]: instructorIds }
      };
  
      if (params.name) {
        userWhere.name = { [Op.like]: `%${params.name}%` };
      }
  
      if (params.id && params.id.trim() !== '') {
        userWhere.id = { [Op.like]: `%${params.id}%` };
      }
  
      if (params.email) {
        userWhere.email = { [Op.like]: `%${params.email}%` };
      }
  
      const users = await User.findAll({
        where: userWhere,
        raw: true
      });
  
      console.log("👤 Matched Users:", users);
  
      // Map department back to each user
      const departmentMap = {};
      instructors.forEach(instructor => {
        departmentMap[instructor.id] = instructor.department;
      });
  
      const result = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        department: departmentMap[user.id] || '❌ NOT FOUND'
      }));
  
      console.log("🧾 Final result sent to frontend:", result);
  
      return result.filter(user => user.department === params.department);
    } catch (error) {
      console.error("❌ Error in getInstructors:", error);
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
      console.log("Getting TAs with params:", JSON.stringify(params));
  
      const taWhere = {};
      if (params.department) {
        taWhere.department = params.department;
      }
  
      console.log("TA WHERE:", JSON.stringify(taWhere));
  
      const tas = await TeachingAssistant.findAll({
        where: taWhere,
        raw: true
      });
  
      console.log(`Found ${tas.length} TAs matching the department filter`);
  
      if (tas.length === 0) {
        return [];
      }
  
      const taIds = tas.map(ta => ta.id);
      console.log("TA IDs:", taIds);
  
      const userWhere = {
        userType: 'ta',
        id: { [Op.in]: taIds }
      };
  
      if (params.name) {
        userWhere.name = { [Op.like]: `%${params.name}%` };
      }
  
      if (params.id && params.id.trim() !== '') {
        userWhere.id = { [Op.like]: `%${params.id}%` };
      }
  
      if (params.email) {
        userWhere.email = { [Op.like]: `%${params.email}%` };
      }
  
      console.log("User WHERE:", JSON.stringify(userWhere));
  
      const users = await User.findAll({
        where: userWhere,
        raw: true
      });
  
      console.log(`Found ${users.length} matching users with TA IDs`);
  
      const departmentMap = {};
      tas.forEach(ta => {
        departmentMap[ta.id] = ta.department;
      });
  
      const result = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        department: departmentMap[user.id] || null
      }));
  
      // ✅ Enforce final filtering by department
      const filteredResult = result.filter(user => user.department === params.department);
      console.log("Returning filtered TAs:", filteredResult);
  
      return filteredResult;
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
      console.log("UserFetchingService.getUsers called with params:", JSON.stringify(params));
      
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