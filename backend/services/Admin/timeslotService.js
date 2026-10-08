// timeslotService.js
// Add this file to your services/Admin directory if it doesn't exist

const sequelize = require('../../config/db');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Access models through the sequelize instance
const TimeSlot = sequelize.models.TimeSlot;
const Offering = sequelize.models.Offering;

/**
 * Roll back a transaction, logging (rather than throwing) any rollback failure
 * so the original error is the one propagated to the caller.
 * @param {Transaction} transaction - The Sequelize transaction
 */
const safeRollback = async (transaction) => {
  try {
    await transaction.rollback();
  } catch (rollbackError) {
    console.error('Error rolling back transaction:', rollbackError);
  }
};

/**
 * Create timeslot records for an offering within a transaction
 * @param {string} offeringId - The offering ID
 * @param {Array} timeslots - Array of timeslot objects with day, startTime, and endTime
 * @param {Transaction} transaction - The Sequelize transaction
 * @returns {Promise<Array>} - The created timeslots
 */
const insertTimeslots = async (offeringId, timeslots, transaction) => {
  const createdTimeslots = [];
  for (const slot of timeslots) {
    const timeslot = await TimeSlot.create({
      id: uuidv4(),
      offeringId,
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime
    }, { transaction });
    
    createdTimeslots.push(timeslot);
  }
  return createdTimeslots;
};

const timeslotService = {
  /**
   * Create timeslots for an offering
   * @param {string} offeringId - The offering ID
   * @param {Array} timeslots - Array of timeslot objects with day, startTime, and endTime
   * @returns {Promise<Array>} - The created timeslots
   */
  createTimeslotsForOffering: async (offeringId, timeslots) => {
    // Use a transaction to ensure data integrity
    const transaction = await sequelize.transaction();
    
    try {
      // Verify the offering exists
      const offering = await Offering.findByPk(offeringId, { transaction });
      if (!offering) {
        throw new Error(`Offering with ID ${offeringId} not found`);
      }
      
      // Validate timeslots format
      if (!Array.isArray(timeslots) || timeslots.length === 0) {
        throw new Error('Timeslots must be a non-empty array');
      }
      
      // Validate each timeslot
      for (const slot of timeslots) {
        if (!slot.day || !slot.startTime || !slot.endTime) {
          throw new Error('Each timeslot must have day, startTime, and endTime');
        }
      }
      
      // Create timeslots
      const createdTimeslots = await insertTimeslots(offeringId, timeslots, transaction);
      
      // Commit the transaction
      await transaction.commit();
      
      return createdTimeslots;
    } catch (error) {
      // Rollback the transaction in case of an error
      await safeRollback(transaction);
      
      console.error('Error creating timeslots:', error);
      throw error;
    }
  },
  
  /**
   * Get timeslots for an offering
   * @param {string} offeringId - The offering ID
   * @returns {Promise<Array>} - Array of timeslots
   */
  getTimeslotsByOfferingId: async (offeringId) => {
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
   * Delete timeslots for an offering
   * @param {string} offeringId - The offering ID
   * @returns {Promise<number>} - Number of deleted timeslots
   */
  deleteTimeslotsByOfferingId: async (offeringId) => {
    try {
      const deleted = await TimeSlot.destroy({
        where: { offeringId }
      });
      
      return deleted;
    } catch (error) {
      console.error(`Error deleting timeslots for offering ${offeringId}:`, error);
      throw error;
    }
  },
  
  /**
   * Update timeslots for an offering
   * @param {string} offeringId - The offering ID
   * @param {Array} timeslots - Array of timeslot objects with day, startTime, and endTime
   * @returns {Promise<Array>} - The updated timeslots
   */
  updateTimeslotsForOffering: async (offeringId, timeslots) => {
    // Use a transaction to ensure data integrity
    const transaction = await sequelize.transaction();
    
    try {
      // Verify the offering exists
      const offering = await Offering.findByPk(offeringId, { transaction });
      if (!offering) {
        throw new Error(`Offering with ID ${offeringId} not found`);
      }
      
      // Delete existing timeslots
      await TimeSlot.destroy({
        where: { offeringId },
        transaction
      });
      
      // Create new timeslots
      const createdTimeslots = await insertTimeslots(offeringId, timeslots, transaction);
      
      // Commit the transaction
      await transaction.commit();
      
      return createdTimeslots;
    } catch (error) {
      // Rollback the transaction in case of an error
      await safeRollback(transaction);
      
      console.error('Error updating timeslots:', error);
      throw error;
    }
  }
};

module.exports = timeslotService;