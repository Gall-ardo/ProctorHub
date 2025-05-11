// services/ta/taSwapService.js
const { v4: uuidv4 } = require('uuid');
const { SwapRequest, TeachingAssistant, Exam, User, Classroom, Notification } = require('../../models');
const Proctoring = require('../../models/Proctoring');
const { Op } = require('sequelize');
const emailService = require('../../services/emailService');

/**
 * Create a personal swap request from one TA to another
 * @param {Object} requestData - the swap request data
 * @param {string} requestData.requesterId - ID of the TA sending the request
 * @param {string} requestData.targetTaEmail - Email of the target TA to swap with
 * @param {string} requestData.examId - ID of the exam to swap
 * @param {Date} requestData.startDate - Start date of availability
 * @param {Date} requestData.endDate - End date of availability
 * @returns {Promise<Object>} - the created swap request
 */
const createPersonalSwapRequest = async (requestData) => {
  const { requesterId, targetTaEmail, examId, startDate, endDate } = requestData;

  // Find target TA by email
  const targetTa = await User.findOne({
    where: {
      email: targetTaEmail
    },
    include: [
      {
        model: TeachingAssistant,
        as: 'taUser',
      }
    ]
  });

  if (!targetTa) {
    throw new Error('Target TA not found');
  }

  if (!targetTa.taUser) {
    throw new Error('Target user is not a teaching assistant');
  }

  // Get exam details
  const exam = await Exam.findByPk(examId);
  if (!exam) {
    throw new Error('Exam not found');
  }

  // Create the swap request
  const swapRequest = await SwapRequest.create({
    id: uuidv4(),
    requesterId: requesterId,
    targetTaId: targetTa.taUser.id,
    examId: examId,
    startDate: startDate,
    endDate: endDate,
    requestDate: new Date(),
    isApproved: false,
    isForumPost: false,
    status: 'PENDING'
  });

  // Send notification to requester TA
  await Notification.create({
    id: uuidv4(),
    recipientId: requesterId, 
    subject: 'Swap Request Created',
    message: `Your swap request has been created successfully.`,
    date: new Date(), 
    isRead: false
  });

  // Send notification to target TA
  await Notification.create({
    id: uuidv4(),
    recipientId: targetTa.taUser.id,
    subject: 'New Swap Request',
    message: `You have received a swap request for an exam proctoring. Please check your swap requests.`,
    date: new Date(),
    isRead: false
  });

  // Send email to target TA
  /*await emailService.sendEmail({
    to: targetTa.email,
    subject: 'New Swap Request',
    text: `You have received a new swap request for the exam ${exam.courseName}. Please check your ProctorHub account for details.`
  });*/

  // Send email to requester TA
  /*await emailService.sendEmail({
    to: targetTa.email,
    subject: 'Swap Request Created',
    text: `Your swap request for the exam ${exam.courseName} has been created successfully.`
  });*/

  return swapRequest;
};

/**
 * Get all swap requests for a specific TA
 * @param {string} taId - ID of the TA
 * @returns {Promise<Array>} - list of swap requests
 */
const getSwapRequestsForTa = async (taId) => {
  const swapRequests = await SwapRequest.findAll({
    where: {
      targetTaId: taId,
      isForumPost: false,
      status: 'PENDING'
    },
    include: [
      {
        model: Exam,
        as: 'exam',
        attributes: ['id', 'courseName', 'date', 'duration'],
        include: [
          {
            model: Classroom,
            as: 'examRooms', // must match alias in association
            attributes: ['name'] // or ['id', 'name'] depending on your model
          }
        ]
      },
      {
        model: TeachingAssistant,
        as: 'requester',
        include: {
          model: User,
          as: 'taUser',
          attributes: ['name', 'email']
        }
      }
    ],
    order: [['requestDate', 'DESC']]
  });

  console.log('Found swap requests:', swapRequests);


  return swapRequests.map(request => {
    const examDate = new Date(request.exam.date);
    return {
      id: request.id,
      course: request.exam.courseName,
      date: examDate.toLocaleDateString(),
      time: `${examDate.toLocaleTimeString()} - ${new Date(examDate.getTime() + request.exam.duration * 60000).toLocaleTimeString()}`,
      classroom: request.exam.examRooms.map(room => room.name).join(', '),
      //requestedBy: request.requester.user.name,
      submitTime: request.requestDate.toLocaleDateString(),
      requesterId: request.requesterId,
      //requesterEmail: request.requester.user.email
      requestedBy: request.requester.taUser?.name ?? "Unknown",
      requesterEmail: request.requester.taUser?.email ?? "Unknown"
    };
  });
};

/**
 * Respond to a swap request with an exam to swap
 * @param {Object} responseData - the response data
 * @param {string} responseData.swapRequestId - ID of the swap request
 * @param {string} responseData.respondentId - ID of the TA responding to the request
 * @param {string} responseData.examIdToSwap - ID of the exam offered in return
 * @returns {Promise<Object>} - the updated swap request
 */
const respondToSwapRequest = async (responseData) => {
  const { swapRequestId, respondentId, examIdToSwap } = responseData;

  // Find the swap request
  const swapRequest = await SwapRequest.findByPk(swapRequestId, {
    include: [
      {
        model: TeachingAssistant,
        as: 'requester',
        include: {
          model: User,
          as: 'taUser',
          attributes: ['id', 'name', 'email']
        }
      },
      {
        model: Exam,
        as: 'exam'
      }
    ]
  });

  if (!swapRequest) {
    throw new Error('Swap request not found');
  }

  if (swapRequest.status !== 'PENDING') {
    throw new Error('This swap request has already been processed');
  }

  // Find the exam to swap
  const examToSwap = await Exam.findByPk(examIdToSwap);
  if (!examToSwap) {
    throw new Error('Exam not found');
  }

  // Update swap request status
  swapRequest.status = 'APPROVED';
  swapRequest.respondentExamId = examIdToSwap;
  swapRequest.isApproved = true;
  await swapRequest.save();

  // Perform the actual swap in the database
  // Find the original exam's TA assignment
  const originalExamAssignment = await Proctoring.findOne({
    where: {
      examId: swapRequest.examId,
      taId: swapRequest.requesterId
    }
  });

  // Find the swap exam's TA assignment
  const swapExamAssignment = await Proctoring.findOne({
    where: {
      examId: examIdToSwap,
      taId: respondentId
    }
  });

  if (!originalExamAssignment || !swapExamAssignment) {
    throw new Error('Exam assignments not found');
  }

  // Check if both proctorings are accepted
  if (originalExamAssignment.status !== 'ACCEPTED' || swapExamAssignment.status !== 'ACCEPTED') {
    throw new Error('Both proctorings must be accepted before swapping. Please check your proctoring status.');
  }

  console.log('Swapping proctorings:', {
    original: {
      id: originalExamAssignment.id,
      examId: originalExamAssignment.examId,
      taId: originalExamAssignment.taId,
      status: originalExamAssignment.status
    },
    swap: {
      id: swapExamAssignment.id,
      examId: swapExamAssignment.examId,
      taId: swapExamAssignment.taId,
      status: swapExamAssignment.status
    }
  });

  // Swap the assignments
  originalExamAssignment.taId = respondentId;
  swapExamAssignment.taId = swapRequest.requesterId;

  await originalExamAssignment.save();
  await swapExamAssignment.save();


  const respondent = await TeachingAssistant.findByPk(respondentId, {
    include: {
      model: User,
      as: 'taUser',
      attributes: ['id', 'name', 'email']
    }
  });
  if (!respondent) {
    throw new Error('Respondent TA not found');
  }

  await Notification.create({
    id: uuidv4(),
    recipientId: swapRequest.requester.taUser.id,
    subject: 'Swap Request Accepted',
    message: `${respondent.taUser.name} has been accepted your swap request.`,
    date: new Date(),
    isRead: false
  });

  
  await Notification.create({
    id: uuidv4(),
    recipientId: swapRequest.exam.instructorId,
    subject: 'Exam is Swapped',
    message: `The exam ${swapRequest.exam.courseName} has been swapped between ${swapRequest.requester.taUser.name} and ${respondent.taUser.name}.`,
    date: new Date(),
    isRead: false
  });

  // Send email to the requester TA
  /*await emailService.sendEmail({
    to: swapRequest.requester.taUser.email,
    subject: 'Swap Request Accepted',
    text: `${respondent.taUser.name} has accepted your swap request for the exam ${swapRequest.exam.courseName}.`
  });*/

  // Send email to the respondent TA
  /*await emailService.sendEmail({
    to: respondent.taUser.email,
    subject: 'Swap Request Accepted',
    text: `You have accepted the swap request for the exam ${swapRequest.exam.courseName} from ${swapRequest.requester.taUser.name}.`
  });*/

  // Send email to the instructor
  /*await emailService.sendEmail({
    to: swapRequest.exam.instructorEmail,
    subject: 'Exam Swapped',
    text: `The exam ${swapRequest.exam.courseName} has been swapped between ${swapRequest.requester.taUser.name} and ${respondent.taUser.name}.`
  });*/

  return {
    success: true,
    message: 'Swap successfully completed. Both proctoring assignments have been updated.'
  };
};

/**
 * Get all user's exams for swap - Only show ACCEPTED proctorings
 * @param {string} taId - ID of the TA
 * @returns {Promise<Array>} - list of exams
 */
const getUserExamsForSwap = async (taId) => {
  const examAssignments = await Proctoring.findAll({
    where: {
      taId: taId,
      status: 'ACCEPTED' // Only include accepted proctorings
    },
    include: [
      {
        model: Exam,
        as: 'exam',
        where: {
          // Only include future exams
          date: {
            [Op.gt]: new Date()
          },
          isOutdated: false
        },
        attributes: ['id', 'courseName', 'date', 'duration'],
        include: [
          {
            model: Classroom,
            as: 'examRooms', // must match alias in association
            attributes: ['name'] // or ['id', 'name'] depending on your model
          }
        ]
      }
    ]
  });

  console.log(`Found ${examAssignments.length} accepted exam assignments for TA ID ${taId}`);
  
  return examAssignments.map(assignment => {
    const examDate = new Date(assignment.exam.date);
    return {
      id: assignment.exam.id,
      course: assignment.exam.courseName,
      date: examDate.toLocaleDateString(),
      time: `${examDate.getHours().toString().padStart(2, '0')}.${examDate.getMinutes().toString().padStart(2, '0')}-${new Date(examDate.getTime() + assignment.exam.duration * 60000).getHours().toString().padStart(2, '0')}.${new Date(examDate.getTime() + assignment.exam.duration * 60000).getMinutes().toString().padStart(2, '0')}`,
      classrooms: assignment.exam.classrooms,
      proctoringId: assignment.id, // Include the proctoring ID for reference
      proctoringStatus: assignment.status // Include status for logging/debugging
    };
  });
};

/**
 * Cancel a swap request
 * @param {string} swapRequestId - ID of the swap request
 * @param {string} userId - ID of the user cancelling the request
 * @returns {Promise<Object>} - status of the cancellation
 */
const cancelSwapRequest = async (swapRequestId, userId) => {
  const swapRequest = await SwapRequest.findByPk(swapRequestId, {
    include: [
      {
        model: TeachingAssistant,
        as: 'requester',
        include: {
          model: User,
          as: 'user'
        }
      },
      {
        model: TeachingAssistant,
        as: 'targetTa',
        include: {
          model: User,
          as: 'user'
        }
      }
    ]
  });

  if (!swapRequest) {
    throw new Error('Swap request not found');
  }

  // Check if the user is the requester
  if (swapRequest.requesterId !== userId) {
    throw new Error('Unauthorized to cancel this request');
  }

  if (swapRequest.status !== 'PENDING') {
    throw new Error('This swap request cannot be cancelled');
  }

  // Update status to cancelled
  swapRequest.status = 'CANCELLED';
  await swapRequest.save();

  await Notification.create({
    id: uuidv4(),
    recipientId: swapRequest.targetTa.user.id,
    subject: 'Swap Request Cancelled',
    message: `The swap request has been cancelled by ${swapRequest.requester.user.name}.`,
    date: new Date(),
    isRead: false
  });

  // Send email to the target TA
  /*await emailService.sendEmail({
    to: swapRequest.targetTa.user.email,
    subject: 'Swap Request Cancelled',
    text: `The swap request has been cancelled by ${swapRequest.requester.user.name}.`
  });*/

  

  return {
    success: true,
    message: 'Swap request cancelled successfully'
  };
};


const getForumSwapRequests = async (currentTaId) => {
  const forumRequests = await SwapRequest.findAll({
    where: {
      isForumPost: true,
      status: 'PENDING',
      requesterId: {
        [Op.ne]: currentTaId  // filter out own requests
      }
    },
    include: [
      {
        model: Exam,
        as: 'exam',
        attributes: ['id', 'courseName', 'date', 'duration'],
        include: [
          {
            model: Classroom,
            as: 'examRooms',
            attributes: ['name']
          }
        ]
      },
      {
        model: TeachingAssistant,
        as: 'requester',
        include: {
          model: User,
          as: 'taUser',
          attributes: ['id', 'name', 'email']
        }
      }
    ],
    order: [['requestDate', 'DESC']]
  });

  return forumRequests.map(request => {
    const examDate = new Date(request.exam.date);
    return {
      id: request.id,
      course: request.exam.courseName,
      date: examDate.toLocaleDateString(),
      time: `${examDate.toLocaleTimeString()} - ${new Date(examDate.getTime() + request.exam.duration * 60000).toLocaleTimeString()}`,
      classroom: request.exam.examRooms.map(room => room.name).join(', '),
      submitter: request.requester.taUser.name,
      submitTime: request.requestDate.toLocaleDateString(),
      requesterId: request.requesterId
    };
  });
};


/**
 * Create a forum swap request (no specific target TA)
 * @param {Object} requestData
 * @returns {Promise<Object>}
 */
const createForumSwapRequest = async (requestData) => {
  const { requesterId, examId, startDate, endDate } = requestData;

  const exam = await Exam.findByPk(examId);
  if (!exam) {
    throw new Error('Exam not found');
  }

  const forumRequest = await SwapRequest.create({
    id: uuidv4(),
    requesterId,
    examId,
    startDate,
    endDate,
    requestDate: new Date(),
    isApproved: false,
    isForumPost: true,
    status: 'PENDING'
  });

  return forumRequest;
};


/**
 * Get submitted swap requests for a specific TA
 * @param {string} taId - ID of the TA
 * @returns {Promise<Array>} - list of swap requests
 */
const getSubmittedSwapRequests = async (taId) => {
  const swapRequests = await SwapRequest.findAll({
    where: {
      requesterId: taId,
      status: ['PENDING', 'APPROVED', 'CANCELLED'] // Get all statuses
    },
    include: [
      {
        model: Exam,
        as: 'exam',
        attributes: ['id', 'courseName', 'date', 'duration'],
        include: [
          {
            model: Classroom,
            as: 'examRooms',
            attributes: ['name']
          }
        ]
      },
      {
        model: TeachingAssistant,
        as: 'targetTa',
        include: {
          model: User,
          as: 'taUser',
          attributes: ['name', 'email']
        }
      }
    ],
    order: [['requestDate', 'DESC']]
  });

  return swapRequests.map(request => {
    const examDate = new Date(request.exam.date);
    return {
      id: request.id,
      course: request.exam.courseName,
      date: examDate.toLocaleDateString(),
      time: `${examDate.toLocaleTimeString()} - ${new Date(examDate.getTime() + request.exam.duration * 60000).toLocaleTimeString()}`,
      classroom: request.exam.examRooms.map(room => room.name).join(', '),
      targetTaName: request.targetTa?.taUser?.name || "Forum Post",
      targetTaEmail: request.targetTa?.taUser?.email || "N/A",
      submitTime: request.requestDate.toLocaleDateString(),
      isForumPost: request.isForumPost,
      status: request.status
    };
  });
};

/**
 * Get teaching assistants from the same department as the requesting TA
 * @param {string} taId - ID of the requesting TA
 * @returns {Promise<Array>} - list of TAs from the same department
 */
const getSameDepartmentTAs = async (taId) => {
  try {
    // Get the current TA's department info
    const currentTA = await TeachingAssistant.findByPk(taId, {
      include: [
        {
          model: User,
          as: 'taUser',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!currentTA) {
      throw new Error('Current TA information not found');
    }

    // Get department directly from TeachingAssistant model
    const department = currentTA.department;
    console.log(`Current TA department: ${department}`);
    
    // If no department is set, return an empty array
    if (!department) {
      console.log('No department found for current TA');
      return [];
    }

    // Find all TAs from the same department, except the current TA
    const departmentTAs = await TeachingAssistant.findAll({
      where: {
        department: department,
        id: { [Op.ne]: taId } // Exclude the current TA
      },
      include: [
        {
          model: User,
          as: 'taUser',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    console.log(`Found ${departmentTAs.length} TAs in department ${department}`);

    // Format the results for easier consumption by the frontend
    return departmentTAs.map(ta => ({
      id: ta.id,
      name: ta.taUser?.name || 'Unknown',
      email: ta.taUser?.email || 'No email'
    }));
  } catch (error) {
    console.error('Error fetching TAs from the same department:', error);
    // Instead of propagating the error, return an empty array
    return [];
  }
};

/**
 * Reject a swap request
 * @param {string} swapRequestId - ID of the swap request
 * @param {string} respondentId - ID of the TA rejecting the request
 * @returns {Promise<Object>} - status of the rejection
 */
const rejectSwapRequest = async (swapRequestId, respondentId) => {
  const swapRequest = await SwapRequest.findByPk(swapRequestId, {
    include: [
      {
        model: TeachingAssistant,
        as: 'requester',
        include: {
          model: User,
          as: 'taUser',
          attributes: ['id', 'name', 'email']
        }
      },
      {
        model: Exam,
        as: 'exam'
      }
    ]
  });

  if (!swapRequest) {
    throw new Error('Swap request not found');
  }

  if (swapRequest.status !== 'PENDING') {
    throw new Error('This swap request has already been processed');
  }

  // Update status to rejected
  swapRequest.status = 'REJECTED';
  await swapRequest.save();
  
  // Send notification to the requester
  await Notification.create({
    id: uuidv4(),
    recipientId: swapRequest.requester.taUser.id,
    subject: 'Swap Request Rejected',
    message: `Your swap request for ${swapRequest.exam.courseName} has been rejected.`,
    date: new Date(),
    isRead: false
  });

  // Optionally send email to the requester
  /*await emailService.sendEmail({
    to: swapRequest.requester.taUser.email,
    subject: 'Swap Request Rejected',
    text: `Your swap request for the exam ${swapRequest.exam.courseName} has been rejected.`
  });*/

  return {
    success: true,
    message: 'Swap request rejected successfully'
  };
};

// Don't forget to export the new function
module.exports = {
  createPersonalSwapRequest,
  createForumSwapRequest,
  getSwapRequestsForTa,
  respondToSwapRequest,
  getUserExamsForSwap,
  cancelSwapRequest,
  getForumSwapRequests,
  getSubmittedSwapRequests,
  getSameDepartmentTAs,
  rejectSwapRequest,  
};