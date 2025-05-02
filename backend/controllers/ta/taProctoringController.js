// controllers/ta/taProctoringController.js
const taProctoringService = require('../../services/ta/taProctoringService');

const taProctoringController = {
  // Get all proctorings for the logged-in TA
  getAllProctorings: async (req, res) => {
    try {
      // Get TA ID from authenticated user
      const taId = req.user.id;
      
      const result = await taProctoringService.getAllProctoringsByTaId(taId);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getAllProctorings controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },
  
  // Get pending proctorings for the logged-in TA
  getPendingProctorings: async (req, res) => {
    try {
      // Get TA ID from authenticated user
      const taId = req.user.id;
      console.log('TA ID:', taId); // Debugging line to check TA ID
      const result = await taProctoringService.getPendingProctoringsByTaId(taId);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getPendingProctorings controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },
  
  // Get active (accepted) proctorings for the logged-in TA
  getActiveProctorings: async (req, res) => {
    try {
      // Get TA ID from authenticated user
      const taId = req.user.id;
      
      const result = await taProctoringService.getActiveProctoringsByTaId(taId);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getActiveProctorings controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },
  
  // Accept a proctoring assignment
  acceptProctoring: async (req, res) => {
    try {
      const proctoringId = req.params.proctoringId;
      const taId = req.user.id;
      
      if (!proctoringId) {
        return res.status(400).json({
          success: false,
          message: 'Proctoring ID is required'
        });
      }
      
      const result = await taProctoringService.acceptProctoring(proctoringId, taId);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in acceptProctoring controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },
  
  // Reject a proctoring assignment
  rejectProctoring: async (req, res) => {
    try {
      const proctoringId = req.params.proctoringId;
      const taId = req.user.id;
      
      if (!proctoringId) {
        return res.status(400).json({
          success: false,
          message: 'Proctoring ID is required'
        });
      }
      
      const result = await taProctoringService.rejectProctoring(proctoringId, taId);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in rejectProctoring controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },
  
  // Get proctoring statistics for the logged-in TA
  getProctoringStats: async (req, res) => {
    try {
      const taId = req.user.id;
      
      const result = await taProctoringService.getProctoringStatsByTaId(taId);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getProctoringStats controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

    // Update multidepartment preference
    updateMultidepartmentPreference: async (req, res) => {
        try {
          const taId = req.user.id;
          const { isMultidepartmentExam } = req.body;
    
          if (typeof isMultidepartmentExam !== 'boolean') {
            return res.status(400).json({
              success: false,
              message: 'isMultidepartmentExam must be a boolean value'
            });
          }
    
          const result = await taProctoringService.updateMultidepartmentStatus(taId, isMultidepartmentExam);
    
          if (!result.success) {
            return res.status(400).json(result);
          }
    
          return res.status(200).json(result);
        } catch (error) {
          console.error('Error in updateMultidepartmentPreference controller:', error);
          return res.status(500).json({
            success: false,
            message: 'Internal server error'
          });
        }
      }
    
};

module.exports = taProctoringController;