const taLeaveService = require('../../services/ta/taLeaveService');

const taLeaveController = {
  // Get all leave requests for the logged-in TA
  getLeaveRequests: async (req, res) => {
    try {
      const taId = req.user.id;
      const result = await taLeaveService.getLeaveRequestsByTaId(taId);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getLeaveRequests controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },
  
  // Get pending leave requests for the logged-in TA
  getPendingLeaveRequests: async (req, res) => {
    try {
      const taId = req.user.id;
      const result = await taLeaveService.getPendingLeaveRequestsByTaId(taId);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getPendingLeaveRequests controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },
  
  // Get approved leave requests for the logged-in TA
  getApprovedLeaveRequests: async (req, res) => {
    try {
      const taId = req.user.id;
      const result = await taLeaveService.getApprovedLeaveRequestsByTaId(taId);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getApprovedLeaveRequests controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },
  
  // Create a new leave request
  createLeaveRequest: async (req, res) => {
    try {
      const { type, startDate, endDate, reason } = req.body;
      
      // Validate required fields
      if (!type || !startDate || !endDate || !reason) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }
      
      const taId = req.user.id;
      const result = await taLeaveService.createLeaveRequest(
        { type, startDate, endDate, reason },
        taId
      );
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      return res.status(201).json(result);
    } catch (error) {
      console.error('Error in createLeaveRequest controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },
  
  // Delete a leave request
  deleteLeaveRequest: async (req, res) => {
    try {
      const { leaveRequestId } = req.params;
      
      if (!leaveRequestId) {
        return res.status(400).json({
          success: false,
          message: 'Leave request ID is required'
        });
      }
      
      const taId = req.user.id;
      const result = await taLeaveService.deleteLeaveRequest(leaveRequestId, taId);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in deleteLeaveRequest controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = taLeaveController;