const Workload = require('../../models/Workload');
const User = require('../../models/User');
const TeachingAssistant = require('../../models/TeachingAssistant');
const Course = require('../../models/Course');

const { v4: uuidv4 } = require('uuid');

// Service for TA workload operations
const taWorkloadService = {
  // Get all workloads for a specific TA
  getWorkloadsByTaId: async (taId) => {
    try {
      const workloads = await Workload.findAll({
        where: { taId },
        order: [['date', 'DESC']] // Sort by date descending
      });
      
      return {
        success: true,
        data: workloads
      };
    } catch (error) {
      console.error('Error fetching TA workloads:', error);
      return {
        success: false,
        message: 'Failed to fetch workloads'
      };
    }
  },

  // Get all waiting/pending workloads for a TA
  getPendingWorkloadsByTaId: async (taId) => {
    try {
      const pendingWorkloads = await Workload.findAll({
        where: { 
          taId,
          isApproved: false,
          rejectionReason: null // Null rejection reason means it's pending
        },
        order: [['date', 'ASC']] // Most immediate dates first
      });
      
      return {
        success: true,
        data: pendingWorkloads
      };
    } catch (error) {
      console.error('Error fetching pending TA workloads:', error);
      return {
        success: false,
        message: 'Failed to fetch pending workloads'
      };
    }
  },

  // Get all approved workloads for a TA
  getApprovedWorkloadsByTaId: async (taId) => {
    try {
      const approvedWorkloads = await Workload.findAll({
        where: { 
          taId,
          isApproved: true
        },
        order: [['date', 'ASC']] // Sort by upcoming dates
      });
      
      return {
        success: true,
        data: approvedWorkloads
      };
    } catch (error) {
      console.error('Error fetching approved TA workloads:', error);
      return {
        success: false,
        message: 'Failed to fetch approved workloads'
      };
    }
  },
  
  // Create a new workload request
  createWorkload: async (workloadData, taId) => {
    try {
      // Find instructor's ID by email
      const instructor = await User.findOne({
        where: {
          email: workloadData.instructorEmail,
          userType: 'instructor'
        }
      });
      
      if (!instructor) {
        return {
          success: false,
          message: 'Instructor not found with the provided email'
        };
      }
      
      // Check if the course exists
      const course = await Course.findOne({
        where: {
          courseCode: workloadData.courseCode
        }
      });
      
      if (!course) {
        return {
          success: false,
          message: 'Course not found with the provided course code'
        };
      }
      
      const hours = parseInt(workloadData.hours || '0');
      if (!hours || hours <= 0) {
        return {
          success: false,
          message: 'Workload duration (hours) must be a positive number'
        };
      }
      
      // Create a new workload
      const newWorkload = await Workload.create({
        id: uuidv4(),
        courseCode: workloadData.courseCode,
        taskType: workloadData.workloadType,
        date: new Date(workloadData.date),
        duration: hours,
        isApproved: false,
        taId: taId,
        instructorId: instructor.id
      });
      
      // Try to update total workload hours for the TA if that data exists
      try {
        const ta = await TeachingAssistant.findByPk(taId);
        if (ta) {
          const additionalHours = hours;
          const totalWorkload = (ta.totalWorkload || 0) + additionalHours;
          await ta.update({ totalWorkload });
        }
      } catch (error) {
        console.error('Error updating TA total workload:', error);
        // Continue with the workload creation even if updating total fails
      }
      
      return {
        success: true,
        data: newWorkload,
        message: 'Workload request created successfully'
      };
    } catch (error) {
      console.error('Error creating workload:', error);
      return {
        success: false,
        message: 'Failed to create workload request'
      };
    }
  }
};

module.exports = taWorkloadService;