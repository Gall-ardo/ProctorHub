// services/Admin/offeringService.js
const sequelize = require('../../config/db');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Access models through the sequelize instance
const Offering = sequelize.models.Offering;
const Course = sequelize.models.Course;
const Semester = sequelize.models.Semester;
const TimeSlot = sequelize.models.TimeSlot;

const offeringService = {
  /**
   * Create a new offering
   * @param {Object} offeringData - The offering data
   * @returns {Promise<Object>} - The created offering
   */
  createOffering: async (offeringData) => {
    const { courseId, sectionNumber, semesterId } = offeringData;
    
    // Create a transaction
    let transaction;
    
    try {
      // Start the transaction
      transaction = await sequelize.transaction();
      
      console.log(`Creating offering with courseId=${courseId}, sectionNumber=${sectionNumber}, semesterId=${semesterId}`);
      
      // Verify the course exists
      const course = await Course.findByPk(courseId, { transaction });
      if (!course) {
        throw new Error(`Course with ID ${courseId} not found`);
      }
      
      // Verify the semester exists
      const semester = await Semester.findByPk(semesterId, { transaction });
      if (!semester) {
        throw new Error(`Semester with ID ${semesterId} not found`);
      }
      
      // Check if an offering with the same course, section, and semester already exists
      const existingOffering = await Offering.findOne({
        where: {
          courseId,
          sectionNumber,
          semesterId
        },
        transaction
      });
      
      if (existingOffering) {
        throw new Error(`An offering for this course with section number ${sectionNumber} already exists for the selected semester`);
      }
      
      const formattedSectionNumber = String(sectionNumber).padStart(3, '0');
      const offeringId = `${courseId}_${formattedSectionNumber}`;

      
      // Create the offering
      const offering = await Offering.create({
        id: offeringId,
        courseId,
        sectionNumber,
        semesterId,
        studentCount: 0 // Initialize with zero students
      }, { transaction });
      
      // Commit the transaction
      await transaction.commit();
      transaction = null; // Clear the transaction reference after commit
      
      // Now that we've committed, fetch the full offering with associations
      const result = await Offering.findByPk(offeringId, {
        include: [
          { model: Course },
          { model: Semester },
          { model: TimeSlot, as: 'TimeSlot' }
        ]
      });
      
      return result;
    } catch (error) {
      // Rollback the transaction if it exists and hasn't been committed yet
      if (transaction) {
        try {
          await transaction.rollback();
        } catch (rollbackError) {
          console.error('Error rolling back transaction:', rollbackError);
        }
      }
      
      console.error('Error creating offering:', error);
      throw error;
    }
  },
  
  /**
   * Get all offerings
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} - Array of offerings
   */
  getAllOfferings: async (filters = {}) => {
    try {
      const { semesterId, courseId } = filters;
      const whereConditions = {};
      
      if (semesterId) {
        whereConditions.semesterId = semesterId;
      }
      
      if (courseId) {
        whereConditions.courseId = courseId;
      }
      
      const offerings = await Offering.findAll({
        where: whereConditions,
        include: [
          { model: Course },
          { model: Semester },
          { model: TimeSlot, as: 'TimeSlot' }
        ],
        order: [
          ['sectionNumber', 'ASC']
        ]
      });
      
      return offerings;
    } catch (error) {
      console.error('Error getting all offerings:', error);
      throw error;
    }
  },
  
  /**
   * Get offering by ID
   * @param {string} id - The offering ID
   * @returns {Promise<Object|null>} - The offering or null if not found
   */
  getOfferingById: async (id) => {
    try {
      const offering = await Offering.findByPk(id, {
        include: [
          { model: Course },
          { model: Semester },
          { model: TimeSlot, as: 'TimeSlot' }
        ]
      });
      
      return offering;
    } catch (error) {
      console.error(`Error getting offering by ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get offerings by course ID and section number
   * @param {string} courseId - The course ID
   * @param {number} sectionNumber - The section number
   * @returns {Promise<Array>} - Array of offerings
   */
  getOfferingByCourseAndSection: async (courseId, sectionNumber) => {
    try {
      const offerings = await Offering.findAll({
        where: { 
          courseId,
          sectionNumber
        },
        include: [
          { model: Course },
          { model: Semester },
          { model: TimeSlot, as: 'TimeSlot' }
        ]
      });
      
      return offerings;
    } catch (error) {
      console.error(`Error getting offerings by course ID ${courseId} and section ${sectionNumber}:`, error);
      throw error;
    }
  },
  
  /**
   * Update an offering
   * @param {string} id - The offering ID
   * @param {Object} offeringData - The updated offering data
   * @returns {Promise<Object|null>} - The updated offering or null if not found
   */
  updateOffering: async (id, offeringData) => {
    const { courseId, sectionNumber, semesterId } = offeringData;
    
    // Use a transaction to ensure data integrity
    const transaction = await sequelize.transaction();
    
    try {
      // Find the offering
      const offering = await Offering.findByPk(id, { transaction });
      if (!offering) {
        await transaction.rollback();
        return null;
      }
      
      // Update offering fields
      if (courseId) {
        // Verify course exists
        const course = await Course.findByPk(courseId, { transaction });
        if (!course) {
          await transaction.rollback();
          throw new Error(`Course with ID ${courseId} not found`);
        }
        offering.courseId = courseId;
      }
      
      if (sectionNumber !== undefined) {
        offering.sectionNumber = sectionNumber;
      }
      
      if (semesterId) {
        // Verify semester exists
        const semester = await Semester.findByPk(semesterId, { transaction });
        if (!semester) {
          await transaction.rollback();
          throw new Error(`Semester with ID ${semesterId} not found`);
        }
        offering.semesterId = semesterId;
      }
      
      // Check for duplicate offering
      if (courseId || sectionNumber !== undefined || semesterId) {
        const duplicateQuery = {
          courseId: courseId || offering.courseId,
          sectionNumber: sectionNumber !== undefined ? sectionNumber : offering.sectionNumber,
          semesterId: semesterId || offering.semesterId,
          id: { [Op.ne]: id } // Exclude current offering
        };
        
        const existingOffering = await Offering.findOne({
          where: duplicateQuery,
          transaction
        });
        
        if (existingOffering) {
          await transaction.rollback();
          throw new Error(`An offering with the same course, section, and semester already exists`);
        }
      }
      
      await offering.save({ transaction });
      
      // Commit the transaction
      await transaction.commit();
      
      // Fetch the updated offering with its relations
      const result = await Offering.findByPk(id, {
        include: [
          { model: Course },
          { model: Semester },
          { model: TimeSlot, as: 'TimeSlot' }
        ]
      });
      
      return result;
    } catch (error) {
      // Rollback the transaction in case of an error
      await transaction.rollback();
      throw error;
    }
  },
  
  /**
   * Delete an offering
   * @param {string} id - The offering ID
   * @returns {Promise<boolean>} - True if deleted, false if not found
   */
  deleteOffering: async (id) => {
    // Use a transaction to ensure data integrity
    const transaction = await sequelize.transaction();
    
    try {
      const offering = await Offering.findByPk(id, { transaction });
      if (!offering) {
        await transaction.rollback();
        return false;
      }
      
      // Delete associated timeslots first (cascade delete)
      await TimeSlot.destroy({
        where: { offeringId: id },
        transaction
      });
      
      // Delete the offering
      await offering.destroy({ transaction });
      
      // Commit the transaction
      await transaction.commit();
      
      return true;
    } catch (error) {
      // Rollback the transaction in case of an error
      await transaction.rollback();
      console.error(`Error deleting offering ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete offerings by course ID and section number
   * @param {string} courseId - The course ID
   * @param {number} sectionNumber - The section number
   * @returns {Promise<number>} - Number of deleted offerings
   */
  deleteOfferingByCourseAndSection: async (courseId, sectionNumber) => {
    const transaction = await sequelize.transaction();
    
    try {
      // Find offerings
      const offerings = await Offering.findAll({
        where: {
          courseId,
          sectionNumber
        },
        transaction
      });
      
      if (offerings.length === 0) {
        await transaction.rollback();
        return 0;
      }
      
      // Delete offerings and their timeslots
      let deletedCount = 0;
      for (const offering of offerings) {
        // Delete associated timeslots first (cascade delete)
        await TimeSlot.destroy({
          where: { offeringId: offering.id },
          transaction
        });
        
        // Delete the offering
        await offering.destroy({ transaction });
        deletedCount++;
      }
      
      // Commit the transaction
      await transaction.commit();
      
      return deletedCount;
    } catch (error) {
      // Rollback the transaction in case of an error
      await transaction.rollback();
      console.error(`Error deleting offerings for course ${courseId} and section ${sectionNumber}:`, error);
      throw error;
    }
  }
};

module.exports = offeringService;