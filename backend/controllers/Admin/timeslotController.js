// controllers/Admin/timeslotController.js
const timeslotService = require('../../services/Admin/timeslotService');

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
      if (!offeringId || !Array.isArray(timeslots) || timeslots.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: offeringId and timeslots (array) are required'
        });
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
  getTimeslotsByOfferingId: async (req, res) => {
    try {
      const { offeringId } = req.query;
      
      if (!offeringId) {
        return res.status(400).json({
          success: false,
          message: 'Offering ID is required'
        });
      }
      
      const timeslots = await timeslotService.getTimeslotsByOfferingId(offeringId);
      
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
   * Delete timeslots by offering ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteTimeslotsByOfferingId: async (req, res) => {
    try {
      const { offeringId } = req.query;
      
      if (!offeringId) {
        return res.status(400).json({
          success: false,
          message: 'Offering ID is required'
        });
      }
      
      const deletedCount = await timeslotService.deleteTimeslotsByOfferingId(offeringId);
      
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
   * Update timeslots for an offering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateTimeslots: async (req, res) => {
    try {
      const { offeringId, timeslots } = req.body;
      
      // Validate required fields
      if (!offeringId || !Array.isArray(timeslots)) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: offeringId and timeslots (array) are required'
        });
      }
      
      // Update timeslots
      const updatedTimeslots = await timeslotService.updateTimeslotsForOffering(offeringId, timeslots);
      
      res.status(200).json({
        success: true,
        message: `${updatedTimeslots.length} timeslots updated successfully`,
        data: updatedTimeslots
      });
    } catch (error) {
      console.error('Error updating timeslots:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update timeslots'
      });
    }
  }
};

module.exports = timeslotController;