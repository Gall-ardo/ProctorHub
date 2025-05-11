const taOfferingScheduleService = require('./taOfferingScheduleService');
const taProctoringScheduleService = require('./taProctoringScheduleService');

const getCombinedScheduleByTaId = async (taId) => {
  try {
    const offeringResult = await taOfferingScheduleService.getOfferingScheduleForTA(taId);
    const proctoringResult = await taProctoringScheduleService.getProctoringScheduleByTaId(taId);

    if (!offeringResult.success || !proctoringResult.success) {
      return {
        success: false,
        message: 'Failed to fetch one or more schedule components'
      };
    }

    // Combine both sets of events
    const combined = [
      ...offeringResult.data.map(item => ({ ...item, isOffering: true })),
      ...proctoringResult.data.map(item => ({ ...item, isExam: true }))
    ];

    return {
      success: true,
      data: combined
    };

  } catch (error) {
    console.error('Error in getCombinedScheduleByTaId:', error);
    return {
      success: false,
      message: 'Internal server error'
    };
  }
};

module.exports = {
  getCombinedScheduleByTaId
};
