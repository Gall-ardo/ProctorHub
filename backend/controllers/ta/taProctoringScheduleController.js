// controllers/ta/taProctoringScheduleController.js
const taProctoringScheduleService = require('../../services/ta/taProctoringScheduleService');

const taProctoringScheduleController = {
  // Get proctoring schedule for the logged-in TA
  getProctoringSchedule: async (req, res) => {
    try {
      // Get TA ID from authenticated user
      const taId = req.user.id;
      
      const result = await taProctoringScheduleService.getProctoringScheduleByTaId(taId);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getProctoringSchedule controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },
  
  // Get combined schedule (proctorings + courses) for the logged-in TA
  getCombinedSchedule: async (req, res) => {
    try {
      // Get TA ID from authenticated user
      const taId = req.user.id;
      
      const result = await taProctoringScheduleService.getCombinedScheduleByTaId(taId);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getCombinedSchedule controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = taProctoringScheduleController;