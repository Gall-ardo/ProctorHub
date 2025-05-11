const taOfferingScheduleService = require('../../services/ta/taOfferingScheduleService');
const { validationResult } = require('express-validator');

/**
 * Get offerings schedule for a TA
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getOfferingSchedule = async (req, res) => {
  try {
    // Get TA ID from authenticated user
    const taId = req.user.id;
    
    // Get offerings schedule
    const schedule = await taOfferingScheduleService.getOfferingScheduleForTA(taId);
    
    return res.status(200).json({
      success: true,
      data: schedule,
      message: 'Retrieved TA offering schedule successfully'
    });
  } catch (error) {
    console.error('Error in getOfferingSchedule controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve offering schedule'
    });
  }
};

module.exports = {
  getOfferingSchedule
};