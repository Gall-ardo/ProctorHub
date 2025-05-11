// controllers/ta/taSwapController.js
const swapRequestService = require('../../services/ta/taSwapService');

/**
 * Create a personal swap request
 */
const createPersonalSwapRequest = async (req, res, next) => {
  try {
    const { targetTaEmail, examId, startDate, endDate } = req.body;
    
    // Check if user is authenticated as a TA and teachingAssistant data is available
    if (!req.user || req.user.userType !== 'ta') {
      return res.status(403).json({
        success: false,
        message: 'Only teaching assistants can create swap requests'
      });
    }
    
    // Use user id directly if teachingAssistant object is not available
    const requesterId = req.user.teachingAssistant?.id || req.user.id;
    
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
    console.error('Error in createPersonalSwapRequest:', error);
    next(error);
  }
};

/**
 * Get swap requests for the authenticated TA
 */
const getMySwapRequests = async (req, res, next) => {
  const taId = req.user.teachingAssistant?.id || req.user.id;
  console.log('Resolved TA ID:', taId); // ✅ Now it's safe to log

  try {
    // Check if user is authenticated as a TA
    if (!req.user || req.user.userType !== 'ta') {
      return res.status(403).json({
        success: false,
        message: 'Only teaching assistants can view swap requests'
      });
    }
    
    // Use user id directly if teachingAssistant object is not available
    const taId = req.user.teachingAssistant?.id || req.user.id;
    
    const swapRequests = await swapRequestService.getSwapRequestsForTa(taId);
    
    res.status(200).json({
      success: true,
      data: swapRequests
    });
  } catch (error) {
    console.error('Error in getMySwapRequests:', error);
    next(error);
  }
};

/**
 * Respond to a swap request with an exam to swap
 */
const respondToSwapRequest = async (req, res, next) => {
  try {
    const { swapRequestId, examIdToSwap } = req.body;
    
    // Check if user is authenticated as a TA
    if (!req.user || req.user.userType !== 'ta') {
      return res.status(403).json({
        success: false,
        message: 'Only teaching assistants can respond to swap requests'
      });
    }
    
    // Use user id directly if teachingAssistant object is not available
    const respondentId = req.user.teachingAssistant?.id || req.user.id;
    
    const responseData = {
      swapRequestId,
      respondentId,
      examIdToSwap
    };
    
    try {
      const result = await swapRequestService.respondToSwapRequest(responseData);
      
      res.status(200).json({
        success: true,
        message: 'Swap request accepted and processed successfully',
        data: result
      });
    } catch (serviceError) {
      // Return a more specific error message to the client
      return res.status(400).json({
        success: false,
        message: serviceError.message
      });
    }
  } catch (error) {
    console.error('Error in respondToSwapRequest:', error);
    next(error);
  }
};

/**
 * Get user's exams available for swap
 */
const getMyExamsForSwap = async (req, res, next) => {
  try {
    // Check if user is authenticated as a TA
    if (!req.user || req.user.userType !== 'ta') {
      return res.status(403).json({
        success: false,
        message: 'Only teaching assistants can view exams for swap'
      });
    }
    
    console.log('User object in getMyExamsForSwap:', req.user);
    
    // Use user id directly if teachingAssistant object is not available
    const taId = req.user.teachingAssistant?.id || req.user.id;
    console.log('Using TA ID:', taId);
    
    const exams = await swapRequestService.getUserExamsForSwap(taId);
    console.log(`Found ${exams.length} exams for TA`);
    
    res.status(200).json({
      success: true,
      data: exams
    });
  } catch (error) {
    console.error('Error in getMyExamsForSwap:', error);
    next(error);
  }
};

/**
 * Cancel a swap request
 */
const cancelSwapRequest = async (req, res, next) => {
  try {
    const { swapRequestId } = req.params;
    
    // Check if user is authenticated as a TA
    if (!req.user || req.user.userType !== 'ta') {
      return res.status(403).json({
        success: false,
        message: 'Only teaching assistants can cancel swap requests'
      });
    }
    
    // Use user id directly if teachingAssistant object is not available
    const userId = req.user.teachingAssistant?.id || req.user.id;
    
    const result = await swapRequestService.cancelSwapRequest(swapRequestId, userId);
    
    res.status(200).json({
      success: true,
      message: 'Swap request cancelled successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in cancelSwapRequest:', error);
    next(error);
  }
};

/**
 * Get forum swap requests
 */
/*const getForumSwapRequests = async (req, res, next) => {
  try {
    const forumItems = await swapRequestService.getForumSwapRequests();
    
    res.status(200).json({
      success: true,
      data: forumItems
    });
  } catch (error) {
    console.error('Error in getForumSwapRequests:', error);
    next(error);
  }
};*/

const getForumSwapRequests = async (req, res, next) => {
  try {
    const currentTaId = req.user.teachingAssistant?.id || req.user.id;
    const forumItems = await swapRequestService.getForumSwapRequests(currentTaId); // pass current TA's ID

    res.status(200).json({
      success: true,
      data: forumItems
    });
  } catch (error) {
    console.error('Error in getForumSwapRequests:', error);
    next(error);
  }
};


/**
 * Create a forum swap request
 */
const createForumSwapRequest = async (req, res, next) => {
  try {
    const { examId, startDate, endDate } = req.body;

    if (!req.user || req.user.userType !== 'ta') {
      return res.status(403).json({
        success: false,
        message: 'Only teaching assistants can submit forum swap requests',
      });
    }

    const requesterId = req.user.teachingAssistant?.id || req.user.id;

    const requestData = {
      requesterId,
      examId,
      startDate,
      endDate
    };

    const forumRequest = await swapRequestService.createForumSwapRequest(requestData);

    res.status(201).json({
      success: true,
      message: 'Forum swap request created successfully',
      data: forumRequest
    });
  } catch (error) {
    console.error('Error in createForumSwapRequest:', error);
    next(error);
  }
};


/**
 * Get submitted swap requests for the authenticated TA
 */
const getMySubmittedSwapRequests = async (req, res, next) => {
  try {
    // Check if user is authenticated as a TA
    if (!req.user || req.user.userType !== 'ta') {
      return res.status(403).json({
        success: false,
        message: 'Only teaching assistants can view submitted swap requests'
      });
    }
    
    // Use user id directly if teachingAssistant object is not available
    const taId = req.user.teachingAssistant?.id || req.user.id;
    
    const swapRequests = await swapRequestService.getSubmittedSwapRequests(taId);
    
    res.status(200).json({
      success: true,
      data: swapRequests
    });
  } catch (error) {
    console.error('Error in getMySubmittedSwapRequests:', error);
    next(error);
  }
};

/**
 * Get teaching assistants from the same department as the authenticated TA
 */
const getSameDepartmentTAs = async (req, res, next) => {
  try {
    // Check if user is authenticated as a TA
    if (!req.user || req.user.userType !== 'ta') {
      return res.status(403).json({
        success: false,
        message: 'Only teaching assistants can access this resource'
      });
    }
    
    // Use user id directly if teachingAssistant object is not available
    const taId = req.user.teachingAssistant?.id || req.user.id;
    
    const departmentTAs = await swapRequestService.getSameDepartmentTAs(taId);
    
    res.status(200).json({
      success: true,
      data: departmentTAs
    });
  } catch (error) {
    console.error('Error in getSameDepartmentTAs:', error);
    next(error);
  }
};

/**
 * Reject a swap request
 */
const rejectSwapRequest = async (req, res, next) => {
  try {
    const { swapRequestId } = req.params;
    
    // Check if user is authenticated as a TA
    if (!req.user || req.user.userType !== 'ta') {
      return res.status(403).json({
        success: false,
        message: 'Only teaching assistants can reject swap requests'
      });
    }
    
    // Use user id directly if teachingAssistant object is not available
    const respondentId = req.user.teachingAssistant?.id || req.user.id;
    
    const result = await swapRequestService.rejectSwapRequest(swapRequestId, respondentId);
    
    res.status(200).json({
      success: true,
      message: 'Swap request rejected successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in rejectSwapRequest:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Add the new function to the exports
module.exports = {
  createPersonalSwapRequest,
  createForumSwapRequest,
  getMySwapRequests,
  respondToSwapRequest,
  getMyExamsForSwap,
  cancelSwapRequest,
  rejectSwapRequest, // Add this line
  getForumSwapRequests,
  getMySubmittedSwapRequests,
  getSameDepartmentTAs 
};