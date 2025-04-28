// services/Admin/offeringService.js
const sequelize = require('../../config/db');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Access models through the sequelize instance
const Offering = sequelize.models.Offering;
const Course = sequelize.models.Course;
const Instructor = sequelize.models.Instructor;
const User = sequelize.models.User;
const Semester = sequelize.models.Semester;

// Helper function to parse semester string into year and isFall
const parseSemester = (semesterStr) => {
  // Example: "2025_spring" or "2024_fall"
  const parts = semesterStr.split('_');
  if (parts.length !== 2) {
    throw new Error(`Invalid semester format: ${semesterStr}. Expected format: YYYY_season`);
  }
  
  const year = parseInt(parts[0], 10);
  const isFall = parts[1].toLowerCase() === 'fall';
  
  return { year, isFall };
};

// Helper function to format semester to string
const formatSemester = (year, isFall) => {
  return `${year}_${isFall ? 'fall' : 'spring'}`;
};

const offeringService = {
  /**
   * Create a new offering
   * @param {Object} offeringData - The offering data
   * @returns {Promise<Object>} - The created offering
   */
  createOffering: async (offeringData) => {
    const { department, instructors, courseCode, sectionId, semester } = offeringData;
    
    // Use a transaction to ensure data integrity
    const transaction = await sequelize.transaction();
    
    try {
      // Find or create the course
      const [course] = await Course.findOrCreate({
        where: { courseCode },  // Using courseCode
        defaults: {
          id: uuidv4(),
          courseCode,
          courseName: courseCode, // Default name to code if not provided
          department
        },
        transaction
      });
      
      // Parse semester string and find or create
      const { year, isFall } = parseSemester(semester);
      
      // Find or create the semester
      const [semesterRecord] = await Semester.findOrCreate({
        where: { 
          year,
          isFall
        },
        defaults: {
          id: uuidv4(),
          year,
          isFall
        },
        transaction
      });
      
      // Create the offering
      const offering = await Offering.create({
        id: uuidv4(),
        courseId: course.id,
        semesterId: semesterRecord.id,
        sectionId,
        studentCount: 0 // Initialize with zero students
      }, { transaction });
      
      // Associate instructors with the offering
      if (instructors && instructors.length > 0) {
        for (const instructor of instructors) {
          // Find the instructor
          const instructorRecord = await Instructor.findByPk(instructor.id, {
            include: [{ model: User, as: 'instructorUser' }],
            transaction
          });
          
          if (instructorRecord) {
            // Add the association
            await offering.addInstructor(instructorRecord, { transaction });
          }
        }
      }
      
      // Commit the transaction
      await transaction.commit();
      
      // Fetch the offering with its relations
      const result = await Offering.findByPk(offering.id, {
        include: [
          { model: Course },
          { model: Semester },
          { 
            model: Instructor, 
            as: 'instructors',
            include: [{ model: User, as: 'instructorUser' }]
          }
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
   * Get all offerings
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} - Array of offerings
   */
  getAllOfferings: async (filters = {}) => {
    try {
      const { department, semester } = filters;
      
      // Build the where conditions for courses if department is provided
      const courseInclude = department ? {
        model: Course,
        where: { department }
      } : { model: Course };
      
      // Build the where conditions for semester if provided
      let semesterInclude = { model: Semester };
      
      if (semester) {
        const { year, isFall } = parseSemester(semester);
        semesterInclude = {
          model: Semester,
          where: { year, isFall }
        };
      }
      
      const offerings = await Offering.findAll({
        include: [
          courseInclude,
          semesterInclude,
          { 
            model: Instructor, 
            as: 'instructors',
            include: [{ model: User, as: 'instructorUser' }]
          }
        ]
      });
      
      return offerings;
    } catch (error) {
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
          { 
            model: Instructor, 
            as: 'instructors',
            include: [{ model: User, as: 'instructorUser' }]
          }
        ]
      });
      
      return offering;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get offerings by course code and section ID
   * @param {string} courseCode - The course code
   * @param {string} sectionId - The section ID
   * @returns {Promise<Array>} - Array of offerings
   */
  getOfferingByCourseAndSection: async (courseCode, sectionId) => {
    try {
      const offerings = await Offering.findAll({
        where: { sectionId },
        include: [
          { 
            model: Course,
            where: { courseCode }  // Using courseCode
          },
          { model: Semester },
          { 
            model: Instructor, 
            as: 'instructors',
            include: [{ model: User, as: 'instructorUser' }]
          }
        ]
      });
      
      return offerings;
    } catch (error) {
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
    const { department, instructors, courseCode, sectionId, semester } = offeringData;
    
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
      if (sectionId) {
        offering.sectionId = sectionId;
      }
      
      // Update course if course code provided
      if (courseCode) {
        const course = await Course.findOne({ 
          where: { courseCode },  // Using courseCode
          transaction 
        });
        
        if (course) {
          offering.courseId = course.id;
        } else {
          // Create new course if it doesn't exist
          const newCourse = await Course.create({
            id: uuidv4(),
            courseCode,
            courseName: courseCode, // Default name to code
            department: department || 'Unknown'
          }, { transaction });
          
          offering.courseId = newCourse.id;
        }
      }
      
      // Update semester if provided
      if (semester) {
        const { year, isFall } = parseSemester(semester);
        
        const semesterRecord = await Semester.findOne({ 
          where: { year, isFall },
          transaction 
        });
        
        if (semesterRecord) {
          offering.semesterId = semesterRecord.id;
        } else {
          // Create new semester if it doesn't exist
          const newSemester = await Semester.create({
            id: uuidv4(),
            year,
            isFall
          }, { transaction });
          
          offering.semesterId = newSemester.id;
        }
      }
      
      await offering.save({ transaction });
      
      // If instructors are provided, update the associations
      if (instructors) {
        // Remove existing associations
        await offering.setInstructors([], { transaction });
        
        // Create new associations
        for (const instructor of instructors) {
          const instructorRecord = await Instructor.findByPk(instructor.id, { transaction });
          if (instructorRecord) {
            await offering.addInstructor(instructorRecord, { transaction });
          }
        }
      }
      
      // Commit the transaction
      await transaction.commit();
      
      // Fetch the updated offering with its relations
      const result = await Offering.findByPk(id, {
        include: [
          { model: Course },
          { model: Semester },
          { 
            model: Instructor, 
            as: 'instructors',
            include: [{ model: User, as: 'instructorUser' }]
          }
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
    try {
      const offering = await Offering.findByPk(id);
      if (!offering) {
        return false;
      }
      
      // Remove associations with instructors
      await offering.setInstructors([]);
      
      // Delete the offering
      await offering.destroy();
      
      return true;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete offerings by course code and section ID
   * @param {string} courseCode - The course code
   * @param {string} sectionId - The section ID
   * @returns {Promise<number>} - Number of deleted offerings
   */
  deleteOfferingByCourseAndSection: async (courseCode, sectionId) => {
    const transaction = await sequelize.transaction();
    
    try {
      // Find course ID
      const course = await Course.findOne({
        where: { courseCode }  // Using courseCode instead of code
      });
      
      if (!course) {
        await transaction.rollback();
        return 0;
      }
      
      // Find offerings
      const offerings = await Offering.findAll({
        where: {
          courseId: course.id,
          sectionId
        }
      });
      
      if (offerings.length === 0) {
        await transaction.rollback();
        return 0;
      }
      
      // Remove associations and delete offerings
      let deletedCount = 0;
      for (const offering of offerings) {
        // Remove associations with instructors
        await offering.setInstructors([], { transaction });
        
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
      throw error;
    }
  },
  
  /**
   * Format semester for display
   * @param {Object} semester - The semester object
   * @returns {string} - Formatted semester string
   */
  formatSemester: (semester) => {
    if (!semester) return '';
    return formatSemester(semester.year, semester.isFall);
  }
};

module.exports = offeringService;