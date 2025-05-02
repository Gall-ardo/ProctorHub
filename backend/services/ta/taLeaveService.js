const LeaveRequest = require('../../models/LeaveRequest');
const TeachingAssistant = require('../../models/TeachingAssistant');
const { v4: uuidv4 } = require('uuid');

// Service for TA leave of absence operations
const taLeaveService = {
  // Get all leave requests for a specific TA
  getLeaveRequestsByTaId: async (taId) => {
    try {
      const leaveRequests = await LeaveRequest.findAll({
        where: { taId },
        order: [['startDate', 'DESC']] // Sort by date descending
      });
      
      return {
        success: true,
        data: leaveRequests
      };
    } catch (error) {
      console.error('Error fetching TA leave requests:', error);
      return {
        success: false,
        message: 'Failed to fetch leave requests'
      };
    }
  },

  // Get all pending leave requests for a TA
  getPendingLeaveRequestsByTaId: async (taId) => {
    try {
      const pendingLeaveRequests = await LeaveRequest.findAll({
        where: { 
          taId,
          isApproved: false,
          rejectionReason: null // Null rejection reason means it's pending
        },
        order: [['startDate', 'ASC']] // Most immediate dates first
      });
      
      return {
        success: true,
        data: pendingLeaveRequests
      };
    } catch (error) {
      console.error('Error fetching pending TA leave requests:', error);
      return {
        success: false,
        message: 'Failed to fetch pending leave requests'
      };
    }
  },

  // Get all approved leave requests for a TA
  getApprovedLeaveRequestsByTaId: async (taId) => {
    try {
      const approvedLeaveRequests = await LeaveRequest.findAll({
        where: { 
          taId,
          isApproved: true
        },
        order: [['startDate', 'ASC']] // Sort by upcoming dates
      });
      
      return {
        success: true,
        data: approvedLeaveRequests
      };
    } catch (error) {
      console.error('Error fetching approved TA leave requests:', error);
      return {
        success: false,
        message: 'Failed to fetch approved leave requests'
      };
    }
  },

  createLeaveRequest: async (leaveData, taId) => {
    try {
      const startDate = new Date(leaveData.startDate);
      const endDate = new Date(leaveData.endDate);
  
      if (startDate > endDate) {
        return {
          success: false,
          message: 'Start date must be before or equal to end date'
        };
      }
  
      const newLeaveRequest = await LeaveRequest.create({
        id: uuidv4(),
        reason: leaveData.reason,
        startDate,
        endDate,
        type: leaveData.type,
        status: 'waiting', // updated
        filePath: leaveData.filePath || null,
        taId
      });
  
      try {
        const ta = await TeachingAssistant.findByPk(taId);
        if (ta) {
          await ta.update({ waitingAbsenceRequest: true });
        }
      } catch (error) {
        console.error('Error updating TA status:', error);
      }
  
      return {
        success: true,
        data: newLeaveRequest,
        message: 'Leave request created successfully'
      };
    } catch (error) {
      console.error('Error creating leave request:', error);
      return {
        success: false,
        message: 'Failed to create leave request'
      };
    }
  },
  
  
  // Delete a leave request
  deleteLeaveRequest: async (leaveRequestId, taId) => {
    try {
      // Find the leave request and make sure it belongs to this TA
      const leaveRequest = await LeaveRequest.findOne({
        where: {
          id: leaveRequestId,
          taId: taId
        }
      });
      
      if (!leaveRequest) {
        return {
          success: false,
          message: 'Leave request not found or not authorized to delete'
        };
      }
      
      // Delete the leave request
      await leaveRequest.destroy();
      
      // Check if there are any remaining pending leave requests
      const pendingRequests = await LeaveRequest.findOne({
        where: {
          taId: taId,
          isApproved: false,
          rejectionReason: null
        }
      });
      
      // If no pending requests, update the TA's status
      if (!pendingRequests) {
        try {
          const ta = await TeachingAssistant.findByPk(taId);
          if (ta) {
            await ta.update({ waitingAbsenceRequest: false });
          }
        } catch (error) {
          console.error('Error updating TA status:', error);
          // Continue even if updating status fails
        }
      }
      
      return {
        success: true,
        message: 'Leave request deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting leave request:', error);
      return {
        success: false,
        message: 'Failed to delete leave request'
      };
    }
  }
};

module.exports = taLeaveService;