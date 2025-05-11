const taCombinedScheduleService = require('../../services/ta/taCombinedScheduleService');

/**
 * Get combined schedule (proctoring and offerings) for a TA
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCombinedSchedule = async (req, res) => {
  try {
    // Get TA ID from authenticated user
    const taId = req.user.id;
    
    // Get combined schedule
    const schedule = await taCombinedScheduleService.getCombinedScheduleByTaId(taId);
    
    // Check if schedule operation was successful
    if (!schedule.success) {
      return res.status(400).json({
        success: false,
        message: schedule.message || 'Failed to retrieve combined schedule'
      });
    }
    
    // Return the data directly without nesting
    return res.status(200).json({
      success: true,
      data: schedule.data, // Just send the inner data array
      message: 'Retrieved combined schedule successfully'
    });
  } catch (error) {
    console.error('Error in getCombinedSchedule controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve combined schedule'
    });
  }
};

module.exports = {
  getCombinedSchedule
};