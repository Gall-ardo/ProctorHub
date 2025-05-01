const taWorkloadService = require('../../services/ta/taWorkloadService');

const taWorkloadController = {
  // Get all workloads for the logged-in TA
  getWorkloads: async (req, res) => {
    try {
      console.log("req.user =", req.user); // Add this line
      const taId = req.user.id;
      
      const result = await taWorkloadService.getWorkloadsByTaId(taId);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getWorkloads controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },
  
  // Get pending workloads for the logged-in TA
  getPendingWorkloads: async (req, res) => {
    try {
      // The user is attached to req by the auth middleware
      const taId = req.user.id;
      
      const result = await taWorkloadService.getPendingWorkloadsByTaId(taId);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getPendingWorkloads controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },
  
  // Get approved workloads for the logged-in TA
  getApprovedWorkloads: async (req, res) => {
    try {
      // The user is attached to req by the auth middleware
      const taId = req.user.id;
      
      const result = await taWorkloadService.getApprovedWorkloadsByTaId(taId);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getApprovedWorkloads controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },
  
  createWorkload: async (req, res) => {
    try {
      const { instructorEmail, courseCode, date, hours, workloadType } = req.body;
  
      if (!instructorEmail || !courseCode || !date || !workloadType || !hours) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }
  
      const taId = req.user.id;
  
      const result = await taWorkloadService.createWorkload(
        { instructorEmail, courseCode, date, workloadType, hours },
        taId
      );
  
      if (!result.success) {
        return res.status(400).json(result);
      }
  
      // ✅ You need this to respond to the frontend
      return res.status(201).json(result);
    } catch (error) {
      console.error('Error in createWorkload controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
};

module.exports = taWorkloadController;