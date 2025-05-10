// services/Admin/timeslotService.js
const sequelize = require('../../config/db');
const { v4: uuidv4 } = require('uuid');

// Access models through the sequelize instance
const TimeSlot = sequelize.models.TimeSlot;
const Offering = sequelize.models.Offering;

const timeslotService = {
  /**
   * Create timeslots for an offering
   * @param {string} offeringId - The offering ID
   * @param {Array} timeslots - Array of timeslot data
   * @returns {Promise<Array>} - Array of created timeslots
   */
  createTimeslotsForOffering: async (offeringId, timeslots) => {
    // Use a transaction to ensure data integrity
    const transaction = await sequelize.transaction();
    
    try {
      // Verify the offering exists
      const offering = await Offering.findByPk(offeringId, { transaction });
      if (!offering) {
        await transaction.rollback();
        throw new Error(`Offering with ID ${offeringId} not found`);
      }
      
      const createdTimeslots = [];
      
      // Create each timeslot
      for (const timeslotData of timeslots) {
        const timeslotId = uuidv4();
        
        // Format times to ensure proper format (HH:MM:00)
        let startTime = timeslotData.startTime;
        let endTime = timeslotData.endTime;
        
        // Ensure times are in HH:MM format
        if (startTime.length === 5) startTime = `${startTime}:00`;
        if (endTime.length === 5) endTime = `${endTime}:00`;
        
        const timeslot = await TimeSlot.create({
          id: timeslotId,
          day: timeslotData.day,
          startTime: startTime,
          endTime: endTime,
          offeringId: offeringId
        }, { transaction });
        
        createdTimeslots.push(timeslot);
      }
      
      // Commit the transaction
      await transaction.commit();
      
      return createdTimeslots;
    } catch (error) {
      // Rollback the transaction in case of an error
      await transaction.rollback();
      console.error('Error creating timeslots:', error);
      throw error;
    }
  },
  
  /**
   * Get timeslots by offering ID
   * @param {string} offeringId - The offering ID
   * @returns {Promise<Array>} - Array of timeslots
   */
  getTimeslotsByOffering: async (offeringId) => {
    try {
      const timeslots = await TimeSlot.findAll({
        where: { offeringId },
        order: [
          ['day', 'ASC'],
          ['startTime', 'ASC']
        ]
      });
      
      return timeslots;
    } catch (error) {
      console.error(`Error getting timeslots for offering ${offeringId}:`, error);
      throw error;
    }
  },
  
  /**
   * Update timeslots for an offering
   * @param {string} offeringId - The offering ID
   * @param {Array} timeslots - Array of timeslot data
   * @returns {Promise<Array>} - Array of updated timeslots
   */
  updateTimeslotsForOffering: async (offeringId, timeslots) => {
    // Use a transaction to ensure data integrity
    const transaction = await sequelize.transaction();
    
    try {
      // Verify the offering exists
      const offering = await Offering.findByPk(offeringId, { transaction });
      if (!offering) {
        await transaction.rollback();
        throw new Error(`Offering with ID ${offeringId} not found`);
      }
      
      // Delete existing timeslots for this offering
      await TimeSlot.destroy({
        where: { offeringId },
        transaction
      });
      
      // If no new timeslots provided, just return empty array
      if (timeslots.length === 0) {
        await transaction.commit();
        return [];
      }
      
      const updatedTimeslots = [];
      
      // Create new timeslots
      for (const timeslotData of timeslots) {
        const timeslotId = uuidv4();
        
        // Format times to ensure proper format (HH:MM:00)
        let startTime = timeslotData.startTime;
        let endTime = timeslotData.endTime;
        
        // Ensure times are in HH:MM format
        if (startTime.length === 5) startTime = `${startTime}:00`;
        if (endTime.length === 5) endTime = `${endTime}:00`;
        
        const timeslot = await TimeSlot.create({
          id: timeslotId,
          day: timeslotData.day,
          startTime: startTime,
          endTime: endTime,
          offeringId: offeringId
        }, { transaction });
        
        updatedTimeslots.push(timeslot);
      }
      
      // Commit the transaction
      await transaction.commit();
      
      return updatedTimeslots;
    } catch (error) {
      // Rollback the transaction in case of an error
      await transaction.rollback();
      console.error('Error updating timeslots:', error);
      throw error;
    }
  },
  
  /**
   * Delete timeslots by offering ID
   * @param {string} offeringId - The offering ID
   * @returns {Promise<number>} - Number of deleted timeslots
   */
  deleteTimeslotsByOffering: async (offeringId) => {
    try {
      const deletedCount = await TimeSlot.destroy({
        where: { offeringId }
      });
      
      return deletedCount;
    } catch (error) {
      console.error(`Error deleting timeslots for offering ${offeringId}:`, error);
      throw error;
    }
  },
  
  /**
   * Get all timeslots
   * @returns {Promise<Array>} - Array of all timeslots
   */
  getAllTimeslots: async () => {
    try {
      const timeslots = await TimeSlot.findAll({
        order: [
          ['day', 'ASC'],
          ['startTime', 'ASC']
        ],
        include: [{ model: Offering }]
      });
      
      return timeslots;
    } catch (error) {
      console.error('Error getting all timeslots:', error);
      throw error;
    }
  }
};

module.exports = timeslotService;