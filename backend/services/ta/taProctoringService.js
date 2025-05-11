// services/ta/taProctoringService.js
const Proctoring = require('../../models/Proctoring');
const Exam = require('../../models/Exam');
const TeachingAssistant = require('../../models/TeachingAssistant');
const Classroom = require('../../models/Classroom');
const Course = require('../../models/Course');
const { v4: uuidv4 } = require('uuid');

// Configure the maximum number of rejections allowed
const MAX_REJECTIONS_ALLOWED = 2;

const taProctoringService = {
    // Get all proctorings for a specific TA
    getAllProctoringsByTaId: async (taId) => {
      try {
        const proctorings = await Proctoring.findAll({
          where: { taId },
          include: [{
            model: Exam,
            as: 'exam',
            attributes: ['examType', 'date', 'duration', 'department'],
            include: [
              {
                model: Course,
                attributes: ['courseCode', 'department']
              },
              {
                model: Classroom,
                as: 'examRooms',
                attributes: ['name']
              }
            ]
          }],
          order: [['assignmentDate', 'DESC']]
        });
        
        return {
          success: true,
          data: proctorings
        };
      } catch (error) {
        console.error('Error fetching TA proctorings:', error);
        return {
          success: false,
          message: 'Failed to fetch proctorings'
        };
      }
    },
  
    // Get pending proctorings for a TA
    getPendingProctoringsByTaId: async (taId) => {
      try {
        const pendingProctorings = await Proctoring.findAll({
          where: { 
            taId,
            status: 'PENDING'
          },
          include: [{
            model: Exam,
            as: 'exam',
            attributes: ['examType', 'date', 'duration', 'department'],
            include: [
              {
                model: Course,
                attributes: ['courseCode', 'department']
              },
              {
                model: Classroom,
                as: 'examRooms',
                attributes: ['name']
              }
            ]
          }],
          order: [['assignmentDate', 'ASC']]
        });
        
        return {
          success: true,
          data: pendingProctorings
        };
      } catch (error) {
        console.error('Error fetching pending TA proctorings:', error);
        return {
          success: false,
          message: 'Failed to fetch pending proctorings'
        };
      }
    },
  
    // Get active proctorings for a TA
    getActiveProctoringsByTaId: async (taId) => {
      try {
        const activeProctorings = await Proctoring.findAll({
          where: { 
            taId,
            status: 'ACCEPTED'
          },
          include: [{
            model: Exam,
            as: 'exam',
            attributes: ['examType', 'date', 'duration', 'department'],
            include: [
              {
                model: Course,
                attributes: ['courseCode', 'department']
              },
              {
                model: Classroom,
                as: 'examRooms',
                attributes: ['name']
              }
            ]
          }],
          order: [['assignmentDate', 'ASC']]
        });
        
        return {
          success: true,
          data: activeProctorings
        };
      } catch (error) {
        console.error('Error fetching active TA proctorings:', error);
        return {
          success: false,
          message: 'Failed to fetch active proctorings'
        };
      }
    },

  // Accept a proctoring assignment - FIXED to properly handle department comparison
  acceptProctoring: async (proctoringId, taId) => {
    try {
      // Fetch the proctoring with exam details including department
      const proctoring = await Proctoring.findOne({
        where: { 
          id: proctoringId,
          taId: taId,
          status: 'PENDING'
        },
        include: [{
          model: Exam,
          as: 'exam',
          attributes: ['examType', 'date', 'duration', 'department']
        }]
      });
      
      if (!proctoring) {
        return {
          success: false,
          message: 'Proctoring assignment not found or already processed'
        };
      }
      
      // Update proctoring status
      await proctoring.update({ status: 'ACCEPTED' });
      
      // Update TA's proctoring count and total workload
      try {
        // First get the TA record to access their department
        const ta = await TeachingAssistant.findByPk(taId);
        if (ta && proctoring.exam) {
          // Get exam duration (in minutes)
          const examDuration = proctoring.exam.duration || 0;
          
          // Convert minutes to hours (rounded to nearest hour)
          const examHours = Math.ceil(examDuration / 60);
          
          // Get departments for comparison
          const taDepartment = ta.department;
          const examDepartment = proctoring.exam.department;
          
          console.log(`TA Department: ${taDepartment}, Exam Department: ${examDepartment}`);
          
          let updatedDepartmentHours = ta.totalProctoringInDepartment || 0;
          let updatedNonDepartmentHours = ta.totalNonDepartmentProctoring || 0;
          
          // Update department-specific proctoring count (FIXED the comparison)
          if (examDepartment && taDepartment && examDepartment === taDepartment) {
            // It's a department proctoring
            updatedDepartmentHours += examHours;
            await ta.update({ 
              totalProctoringInDepartment: updatedDepartmentHours 
            });
            console.log(`Updated department proctoring hours: ${updatedDepartmentHours}`);
          } else {
            // It's a non-department proctoring
            updatedNonDepartmentHours += examHours;
            await ta.update({ 
              totalNonDepartmentProctoring: updatedNonDepartmentHours 
            });
            console.log(`Updated non-department proctoring hours: ${updatedNonDepartmentHours}`);
          }
          
          // Add proctoring hours to total workload as well
          const totalWorkload = (ta.totalWorkload || 0) + examHours;
          await ta.update({ totalWorkload });
          
          console.log(`Updated TA workload with ${examHours} hours from proctoring. New total: ${totalWorkload}`);
        }
      } catch (error) {
        console.error('Error updating TA proctoring and workload stats:', error);
        // Continue with the proctoring update even if updating count fails
      }
      
      return {
        success: true,
        data: proctoring,
        message: 'Proctoring assignment accepted successfully'
      };
    } catch (error) {
      console.error('Error accepting proctoring:', error);
      return {
        success: false,
        message: 'Failed to accept proctoring assignment'
      };
    }
  },

  // Reject a proctoring assignment
  rejectProctoring: async (proctoringId, taId) => {
    try {
      // First check if the TA has already reached max rejections
      const rejectedCount = await Proctoring.count({
        where: {
          taId,
          status: 'REJECTED'
        }
      });
      
      if (rejectedCount >= MAX_REJECTIONS_ALLOWED) {
        return {
          success: false,
          message: `You have reached the maximum number of allowed rejections (${MAX_REJECTIONS_ALLOWED})`,
          maxRejectionsReached: true
        };
      }
      
      const proctoring = await Proctoring.findOne({
        where: { 
          id: proctoringId,
          taId: taId,
          status: 'PENDING'
        }
      });
      
      if (!proctoring) {
        return {
          success: false,
          message: 'Proctoring assignment not found or already processed'
        };
      }
      
      // Update proctoring status
      await proctoring.update({ status: 'REJECTED' });
      
      return {
        success: true,
        data: proctoring,
        message: 'Proctoring assignment rejected successfully',
        rejectionCount: rejectedCount + 1,
        maxRejectionsAllowed: MAX_REJECTIONS_ALLOWED
      };
    } catch (error) {
      console.error('Error rejecting proctoring:', error);
      return {
        success: false,
        message: 'Failed to reject proctoring assignment'
      };
    }
  },

  // Get proctoring statistics for a TA - Returns TA department for comparison
  getProctoringStatsByTaId: async (taId) => {
    try {
      const ta = await TeachingAssistant.findByPk(taId);
      
      if (!ta) {
        return {
          success: false,
          message: 'Teaching Assistant not found'
        };
      }
      
      // Get the count of rejected proctorings
      const rejectedCount = await Proctoring.count({
        where: {
          taId,
          status: 'REJECTED'
        }
      });
      
      // Get total proctoring hours from department and non-department counts
      const departmentProctorings = ta.totalProctoringInDepartment || 0;
      const nonDepartmentProctorings = ta.totalNonDepartmentProctoring || 0;
      const totalProctoringHours = departmentProctorings + nonDepartmentProctorings;
      
      // Get the multidepartment status
      const isMultidepartment = ta.isMultidepartmentExam;
      
      return {
        success: true,
        data: {
          totalProctoringHours: totalProctoringHours,
          departmentProctoringHours: departmentProctorings,
          nonDepartmentProctoringHours: nonDepartmentProctorings,
          totalRejectedProctoring: rejectedCount,
          maxRejectionsAllowed: MAX_REJECTIONS_ALLOWED,
          isRejectionLimitReached: rejectedCount >= MAX_REJECTIONS_ALLOWED,
          isMultidepartment: isMultidepartment,
          department: ta.department  // Return the TA's department for client-side comparison
        }
      };
    } catch (error) {
      console.error('Error fetching TA proctoring stats:', error);
      return {
        success: false,
        message: 'Failed to fetch proctoring statistics'
      };
    }
  },

  // Update isMultidepartmentExam flag for the TA
  updateMultidepartmentStatus: async (taId, isMultidepartmentExam) => {
    try {
      const ta = await TeachingAssistant.findByPk(taId);
      if (!ta) {
        return {
          success: false,
          message: 'Teaching Assistant not found'
        };
      }

      ta.isMultidepartmentExam = isMultidepartmentExam;
      await ta.save();

      return {
        success: true,
        data: { isMultidepartmentExam: ta.isMultidepartmentExam },
        message: 'Multidepartment preference updated successfully'
      };
    } catch (error) {
      console.error('Error updating multidepartment status:', error);
      return {
        success: false,
        message: 'Failed to update multidepartment status'
      };
    }
  }
};

module.exports = taProctoringService;