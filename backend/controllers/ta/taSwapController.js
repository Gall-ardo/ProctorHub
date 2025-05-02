// controllers/swapRequestController.js
const swapRequestService = require('../../services/ta/taSwapService');

/**
 * Create a personal swap request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createPersonalSwapRequest = async (req, res, next) => {
  try {
    const { targetTaEmail, examId, startDate, endDate } = req.body;
    
    // Get requesting TA's ID from the authenticated user
    const requesterId = req.user.teachingAssistant.id;
    
    const requestData = {
      requesterId,
      targetTaEmail,
      examId,
      startDate,
      endDate
    };
    
    const swapRequest = await swapRequestService.createPersonalSwapRequest(requestData);
    
    res.status(201).json({
      success: true,
      message: 'Swap request created successfully',
      data: swapRequest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get swap requests for the authenticated TA
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getMySwapRequests = async (req, res, next) => {
  try {
    const taId = req.user.teachingAssistant.id;
    
    const swapRequests = await swapRequestService.getSwapRequestsForTa(taId);
    
    res.status(200).json({
      success: true,
      data: swapRequests
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Respond to a swap request with an exam to swap
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const respondToSwapRequest = async (req, res, next) => {
  try {
    const { swapRequestId, examIdToSwap } = req.body;
    const respondentId = req.user.teachingAssistant.id;
    
    const responseData = {
      swapRequestId,
      respondentId,
      examIdToSwap
    };
    
    const result = await swapRequestService.respondToSwapRequest(responseData);
    
    res.status(200).json({
      success: true,
      message: 'Swap request accepted and processed successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's exams available for swap
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getMyExamsForSwap = async (req, res, next) => {
  try {
    const taId = req.user.teachingAssistant.id;
    
    const exams = await swapRequestService.getUserExamsForSwap(taId);
    
    res.status(200).json({
      success: true,
      data: exams
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a swap request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const cancelSwapRequest = async (req, res, next) => {
  try {
    const { swapRequestId } = req.params;
    const userId = req.user.teachingAssistant.id;
    
    const result = await swapRequestService.cancelSwapRequest(swapRequestId, userId);
    
    res.status(200).json({
      success: true,
      message: 'Swap request cancelled successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPersonalSwapRequest,
  getMySwapRequests,
  respondToSwapRequest,
  getMyExamsForSwap,
  cancelSwapRequest
};