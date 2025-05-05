// services/Admin/semesterService.js
const Semester = require("../../models/Semester");
const Course = require("../../models/Course");
const User = require("../../models/User");
const Student = require("../../models/Student");
const TeachingAssistant = require("../../models/TeachingAssistant");
const Offering = require("../../models/Offering");
const { Op } = require("sequelize");
const sequelize = require("../../config/db");

class SemesterService {
  // Generate ID from year and term (e.g. 2023FALL)
  generateSemesterId(year, semesterType) {
    return `${year}${semesterType}`;
  }

  async createSemester(semesterData) {
    const t = await sequelize.transaction();
    
    try {
      // Validate required fields
      if (!semesterData.year || !semesterData.semesterType) {
        throw new Error("Year and semester type are required");
      }
      
      // Generate semester ID from year and term
      const semesterId = this.generateSemesterId(
        semesterData.year, 
        semesterData.semesterType
      );
      
      // Check if semester already exists
      const existingSemester = await Semester.findByPk(semesterId, { transaction: t });
      if (existingSemester) {
        throw new Error(`Semester with ID ${semesterId} already exists`);
      }
      
      // Validate semester type
      const validTypes = ['FALL', 'SPRING', 'SUMMER'];
      if (!validTypes.includes(semesterData.semesterType)) {
        throw new Error(`Invalid semester type. Must be one of: ${validTypes.join(', ')}`);
      }
      
      // Create semester
      const semester = await Semester.create({
        id: semesterId,
        year: semesterData.year,
        semesterType: semesterData.semesterType,
        startDate: semesterData.startDate || null,
        endDate: semesterData.endDate || null
      }, { transaction: t });
      
      await t.commit();
      return semester;
    } catch (error) {
      console.error("Transaction error in createSemester:", error);
      await t.rollback();
      throw error;
    }
  }

  async findSemesterById(id) {
    try {
      const semester = await Semester.findByPk(id, {
        include: [
          {
            model: Offering,
            as: 'offerings',
            include: [
              {
                model: Course,
                as: 'course'
              }
            ]
          }
        ]
      });
      
      return semester;
    } catch (error) {
      console.error(`Error finding semester by ID ${id}:`, error);
      throw error;
    }
  }

  async findAllSemesters(query) {
    try {
      const whereClause = {};
      
      if (query.year) {
        whereClause.year = query.year;
      }
      
      if (query.semesterType) {
        whereClause.semesterType = query.semesterType;
      }
      
      const semesters = await Semester.findAll({
        where: whereClause,
        order: [['year', 'DESC'], ['semesterType', 'ASC']]
      });
      
      return semesters;
    } catch (error) {
      console.error("Error in findAllSemesters:", error);
      throw error;
    }
  }

  async createOfferings(semesterId, offeringsData) {
    const t = await sequelize.transaction();
    
    try {
      // Validate semester exists
      const semester = await Semester.findByPk(semesterId, { transaction: t });
      if (!semester) {
        throw new Error(`Semester with ID ${semesterId} not found`);
      }
      
      const createdOfferings = [];
      const errors = [];
      
      // Create offerings
      for (const offeringData of offeringsData) {
        try {
          // Skip empty rows
          if (!offeringData.courseId) {
            continue;
          }
          
          // Validate course exists
          const course = await Course.findByPk(offeringData.courseId, { transaction: t });
          if (!course) {
            throw new Error(`Course with ID ${offeringData.courseId} not found`);
          }
          
          // Create unique offering ID
          const offeringId = `${semesterId}-${offeringData.courseId}-${offeringData.section || '001'}`;
          
          // Check if offering already exists
          const existingOffering = await Offering.findByPk(offeringId, { transaction: t });
          if (existingOffering) {
            throw new Error(`Offering with ID ${offeringId} already exists`);
          }
          
          // Validate instructor if provided
          if (offeringData.instructorId) {
            const instructor = await User.findOne({
              where: { 
                id: offeringData.instructorId,
                userType: 'instructor'
              },
              transaction: t
            });
            
            if (!instructor) {
              throw new Error(`Instructor with ID ${offeringData.instructorId} not found`);
            }
          }
          
          // Create offering
          const offering = await Offering.create({
            id: offeringId,
            semesterId: semesterId,
            courseId: offeringData.courseId,
            section: offeringData.section || '001',
            instructorId: offeringData.instructorId || null,
            day: offeringData.day || null,
            startTime: offeringData.startTime || null,
            endTime: offeringData.endTime || null,
            roomId: offeringData.roomId || null,
            capacity: offeringData.capacity || null
          }, { transaction: t });
          
          createdOfferings.push(offering);
        } catch (error) {
          errors.push({
            data: offeringData,
            error: error.message
          });
          console.error(`Failed to create offering for course ${offeringData.courseId}: ${error.message}`);
        }
      }
      
      await t.commit();
      
      return {
        createdOfferings,
        errors,
        success: createdOfferings.length,
        failed: errors.length
      };
    } catch (error) {
      console.error("Transaction error in createOfferings:", error);
      await t.rollback();
      throw error;
    }
  }

  async enrollStudents(semesterId, enrollmentsData) {
    const t = await sequelize.transaction();
    
    try {
      // Validate semester exists
      const semester = await Semester.findByPk(semesterId, { transaction: t });
      if (!semester) {
        throw new Error(`Semester with ID ${semesterId} not found`);
      }
      
      const createdEnrollments = [];
      const errors = [];
      
      // Create enrollments
      for (const enrollmentData of enrollmentsData) {
        try {
          // Skip empty rows
          if (!enrollmentData.studentId || !enrollmentData.courseId) {
            continue;
          }
          
          // Validate student exists
          let student = await Student.findByPk(enrollmentData.studentId, { transaction: t });
          if (!student) {
            // Create student if doesn't exist
            if (enrollmentData.name && enrollmentData.email) {
              // Create user first
              const user = await User.create({
                id: enrollmentData.studentId,
                name: enrollmentData.name,
                email: enrollmentData.email,
                userType: 'student',
                password: 'defaultPassword' // Should be hashed in real implementation
              }, { transaction: t });
              
              // Create student
              student = await Student.create({
                id: enrollmentData.studentId
              }, { transaction: t });
            } else {
              throw new Error(`Student with ID ${enrollmentData.studentId} not found and cannot be created without name and email`);
            }
          }
          
          // Find offering
          const offering = await Offering.findOne({
            where: {
              semesterId: semesterId,
              courseId: enrollmentData.courseId,
              section: enrollmentData.section || { [Op.ne]: null }
            },
            transaction: t
          });
          
          if (!offering) {
            throw new Error(`Offering for course ${enrollmentData.courseId} section ${enrollmentData.section || 'any'} not found in semester ${semesterId}`);
          }
          
          // Check if already enrolled
          const existingEnrollment = await sequelize.query(
            `SELECT * FROM StudentOfferings WHERE StudentId = ? AND OfferingId = ?`,
            { 
              replacements: [enrollmentData.studentId, offering.id], 
              type: sequelize.QueryTypes.SELECT,
              transaction: t
            }
          );
          
          if (existingEnrollment.length > 0) {
            throw new Error(`Student ${enrollmentData.studentId} is already enrolled in offering ${offering.id}`);
          }
          
          // Create enrollment
          await sequelize.query(
            `INSERT INTO StudentOfferings (StudentId, OfferingId, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())`,
            { 
              replacements: [enrollmentData.studentId, offering.id], 
              type: sequelize.QueryTypes.INSERT,
              transaction: t
            }
          );
          
          createdEnrollments.push({
            studentId: enrollmentData.studentId,
            offeringId: offering.id
          });
        } catch (error) {
          errors.push({
            data: enrollmentData,
            error: error.message
          });
          console.error(`Failed to enroll student ${enrollmentData.studentId} in course ${enrollmentData.courseId}: ${error.message}`);
        }
      }
      
      await t.commit();
      
      return {
        createdEnrollments,
        errors,
        success: createdEnrollments.length,
        failed: errors.length
      };
    } catch (error) {
      console.error("Transaction error in enrollStudents:", error);
      await t.rollback();
      throw error;
    }
  }

  async assignTeachingAssistants(semesterId, assignmentsData) {
    const t = await sequelize.transaction();
    
    try {
      // Validate semester exists
      const semester = await Semester.findByPk(semesterId, { transaction: t });
      if (!semester) {
        throw new Error(`Semester with ID ${semesterId} not found`);
      }
      
      const createdAssignments = [];
      const errors = [];
      
      // Create TA assignments
      for (const assignmentData of assignmentsData) {
        try {
          // Skip empty rows
          if (!assignmentData.taId || !assignmentData.courseId) {
            continue;
          }
          
          // Validate TA exists
          const ta = await TeachingAssistant.findByPk(assignmentData.taId, { transaction: t });
          if (!ta) {
            throw new Error(`Teaching Assistant with ID ${assignmentData.taId} not found`);
          }
          
          // Find offering
          const offering = await Offering.findOne({
            where: {
              semesterId: semesterId,
              courseId: assignmentData.courseId,
              section: assignmentData.section || { [Op.ne]: null }
            },
            transaction: t
          });
          
          if (!offering) {
            throw new Error(`Offering for course ${assignmentData.courseId} section ${assignmentData.section || 'any'} not found in semester ${semesterId}`);
          }
          
          // Check if already assigned
          const existingAssignment = await sequelize.query(
            `SELECT * FROM OfferingTAs WHERE TeachingAssistantId = ? AND OfferingId = ?`,
            { 
              replacements: [assignmentData.taId, offering.id], 
              type: sequelize.QueryTypes.SELECT,
              transaction: t
            }
          );
          
          if (existingAssignment.length > 0) {
            throw new Error(`TA ${assignmentData.taId} is already assigned to offering ${offering.id}`);
          }
          
          // Create assignment with workload
          await sequelize.query(
            `INSERT INTO OfferingTAs (TeachingAssistantId, OfferingId, workload, createdAt, updatedAt) 
             VALUES (?, ?, ?, NOW(), NOW())`,
            { 
              replacements: [
                assignmentData.taId, 
                offering.id, 
                assignmentData.workload || 10
              ], 
              type: sequelize.QueryTypes.INSERT,
              transaction: t
            }
          );
          
          // Update TA's total workload
          await ta.increment('totalWorkload', { 
            by: parseInt(assignmentData.workload || 10), 
            transaction: t 
          });
          
          createdAssignments.push({
            taId: assignmentData.taId,
            offeringId: offering.id,
            workload: assignmentData.workload || 10
          });
        } catch (error) {
          errors.push({
            data: assignmentData,
            error: error.message
          });
          console.error(`Failed to assign TA ${assignmentData.taId} to course ${assignmentData.courseId}: ${error.message}`);
        }
      }
      
      await t.commit();
      
      return {
        createdAssignments,
        errors,
        success: createdAssignments.length,
        failed: errors.length
      };
    } catch (error) {
      console.error("Transaction error in assignTeachingAssistants:", error);
      await t.rollback();
      throw error;
    }
  }

  async deleteSemester(id) {
    const t = await sequelize.transaction();
    
    try {
      // Find semester
      const semester = await Semester.findByPk(id, { transaction: t });
      if (!semester) {
        return false;
      }
      
      // Check if semester has offerings
      const offerings = await Offering.findAll({
        where: { semesterId: id },
        transaction: t
      });
      
      if (offerings.length > 0) {
        throw new Error('Semester is in use and has offerings. Delete all offerings first.');
      }
      
      // Delete semester
      await semester.destroy({ transaction: t });
      
      await t.commit();
      return true;
    } catch (error) {
      console.error(`Transaction error in deleteSemester for ID ${id}:`, error);
      await t.rollback();
      throw error;
    }
  }
}

module.exports = new SemesterService();