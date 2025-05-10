// controllers/Admin/timeslotController.js
const timeslotService = require('../../services/Admin/timeslotService');
const { v4: uuidv4 } = require('uuid');

const timeslotController = {
  /**
   * Create timeslots for an offering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createTimeslots: async (req, res) => {
    try {
      const { offeringId, timeslots } = req.body;
      
      // Validate required fields
      if (!offeringId || !timeslots || !Array.isArray(timeslots) || timeslots.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: offeringId and timeslots array are required'
        });
      }
      
      // Validate timeslot format
      for (const timeslot of timeslots) {
        if (!timeslot.day || !timeslot.startTime || !timeslot.endTime) {
          return res.status(400).json({
            success: false,
            message: 'Each timeslot must have day, startTime, and endTime'
          });
        }
      }
      
      // Create timeslots
      const createdTimeslots = await timeslotService.createTimeslotsForOffering(offeringId, timeslots);
      
      res.status(201).json({
        success: true,
        message: `${createdTimeslots.length} timeslots created successfully`,
        data: createdTimeslots
      });
    } catch (error) {
      console.error('Error creating timeslots:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create timeslots'
      });
    }
  },
  
  /**
   * Get timeslots by offering ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getTimeslotsByOffering: async (req, res) => {
    try {
      const { offeringId } = req.query;
      
      if (!offeringId) {
        return res.status(400).json({
          success: false,
          message: 'Offering ID is required'
        });
      }
      
      const timeslots = await timeslotService.getTimeslotsByOffering(offeringId);
      
      res.status(200).json({
        success: true,
        data: timeslots
      });
    } catch (error) {
      console.error('Error fetching timeslots:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch timeslots'
      });
    }
  },
  
  /**
   * Update timeslots for an offering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateTimeslots: async (req, res) => {
    try {
      const { offeringId, timeslots } = req.body;
      
      // Validate required fields
      if (!offeringId || !timeslots || !Array.isArray(timeslots)) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: offeringId and timeslots array are required'
        });
      }
      
      // Update timeslots
      const updatedTimeslots = await timeslotService.updateTimeslotsForOffering(offeringId, timeslots);
      
      res.status(200).json({
        success: true,
        message: `Timeslots updated successfully`,
        data: updatedTimeslots
      });
    } catch (error) {
      console.error('Error updating timeslots:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update timeslots'
      });
    }
  },
  
  /**
   * Delete timeslots by offering ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteTimeslotsByOffering: async (req, res) => {
    try {
      const { offeringId } = req.body;
      
      if (!offeringId) {
        return res.status(400).json({
          success: false,
          message: 'Offering ID is required'
        });
      }
      
      const deletedCount = await timeslotService.deleteTimeslotsByOffering(offeringId);
      
      res.status(200).json({
        success: true,
        message: `${deletedCount} timeslots deleted successfully`
      });
    } catch (error) {
      console.error('Error deleting timeslots:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete timeslots'
      });
    }
  },
  
  /**
   * Get all timeslots
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllTimeslots: async (req, res) => {
    try {
      const timeslots = await timeslotService.getAllTimeslots();
      
      res.status(200).json({
        success: true,
        data: timeslots
      });
    } catch (error) {
      console.error('Error fetching all timeslots:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch timeslots'
      });
    }
  }
};

module.exports = timeslotController;