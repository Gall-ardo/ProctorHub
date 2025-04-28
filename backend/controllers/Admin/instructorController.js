// controllers/Admin/instructorController.js
const instructorService = require('../../services/Admin/instructorService');

const instructorController = {
  /**
   * Get all instructors
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllInstructors: async (req, res) => {
    try {
      const instructors = await instructorService.getAllInstructors();
      
      res.status(200).json({
        success: true,
        data: instructors
      });
    } catch (error) {
      console.error('Error fetching instructors:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch instructors'
      });
    }
  },
  
  /**
   * Get instructors by department
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getInstructorsByDepartment: async (req, res) => {
    try {
      const { department } = req.params;
      
      if (!department) {
        return res.status(400).json({
          success: false,
          message: 'Department is required'
        });
      }
      
      const instructors = await instructorService.getInstructorsByDepartment(department);
      
      res.status(200).json({
        success: true,
        data: instructors
      });
    } catch (error) {
      console.error('Error fetching instructors by department:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch instructors'
      });
    }
  },
  
  /**
   * Get instructor by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getInstructorById: async (req, res) => {
    try {
      const { id } = req.params;
      const instructor = await instructorService.getInstructorById(id);
      
      if (!instructor) {
        return res.status(404).json({
          success: false,
          message: 'Instructor not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: instructor
      });
    } catch (error) {
      console.error('Error fetching instructor:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch instructor'
      });
    }
  },
  
  /**
   * Search instructors
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  searchInstructors: async (req, res) => {
    try {
      const { query, department } = req.query;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }
      
      const instructors = await instructorService.searchInstructors(query, department);
      
      res.status(200).json({
        success: true,
        data: instructors
      });
    } catch (error) {
      console.error('Error searching instructors:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to search instructors'
      });
    }
  }
};

module.exports = instructorController;