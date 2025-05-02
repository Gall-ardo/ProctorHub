// services/ta/taProctoringService.js
const Proctoring = require('../../models/Proctoring');
const Exam = require('../../models/Exam');
const TeachingAssistant = require('../../models/TeachingAssistant');
const Classroom = require('../../models/Classroom');
const Course = require('../../models/Course');
const { v4: uuidv4 } = require('uuid');

const taProctoringService = {
    // Get all proctorings for a specific TA
    getAllProctoringsByTaId: async (taId) => {
      try {
        const proctorings = await Proctoring.findAll({
          where: { taId },
          include: [{
            model: Exam,
            as: 'exam',
            attributes: ['examType', 'date', 'duration'],
            include: [
              {
                model: Course,
                attributes: ['courseCode']
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
            attributes: ['examType', 'date', 'duration'],
            include: [
              {
                model: Course,
                attributes: ['courseCode']
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
            attributes: ['examType', 'date', 'duration'],
            include: [
              {
                model: Course,
                attributes: ['courseCode']
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

  // Accept a proctoring assignment
  acceptProctoring: async (proctoringId, taId) => {
    try {
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
      await proctoring.update({ status: 'ACCEPTED' });
      
      // Update TA's proctoring count
      try {
        const ta = await TeachingAssistant.findByPk(taId);
        if (ta) {
          // Determine if the proctoring is for the TA's department or not
          const exam = await Exam.findByPk(proctoring.examId);
          
          if (exam) {
            if (exam.department === ta.department) {
              const totalProctoringInDepartment = (ta.totalProctoringInDepartment || 0) + 1;
              await ta.update({ totalProctoringInDepartment });
            } else {
              const totalNonDepartmentProctoring = (ta.totalNonDepartmentProctoring || 0) + 1;
              await ta.update({ totalNonDepartmentProctoring });
            }
          }
        }
      } catch (error) {
        console.error('Error updating TA proctoring count:', error);
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
        message: 'Proctoring assignment rejected successfully'
      };
    } catch (error) {
      console.error('Error rejecting proctoring:', error);
      return {
        success: false,
        message: 'Failed to reject proctoring assignment'
      };
    }
  },

  // Get proctoring statistics for a TA
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
      
      // Calculate total proctoring hours
      // Assumes each accepted proctoring is for the duration specified in the exam
      const acceptedProctorings = await Proctoring.findAll({
        where: {
          taId,
          status: 'ACCEPTED'
        },
        include: [{
          model: Exam,
          as: 'exam',
          attributes: ['duration']
        }]
      });
      
      let totalHours = 0;
      
      for (const proctoring of acceptedProctorings) {
        if (proctoring.exam && proctoring.exam.duration) {
          // Convert minutes to hours
          totalHours += proctoring.exam.duration / 60;
        }
      }
      
      // Get the multidepartment status
      const isMultidepartment = ta.isMultidepartmentExam;
      
      return {
        success: true,
        data: {
          totalProctoringHours: Math.round(totalHours),
          totalRejectedProctoring: rejectedCount,
          isMultidepartment: isMultidepartment
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