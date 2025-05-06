// services/ta/taSwapService.js
const { v4: uuidv4 } = require('uuid');
const { SwapRequest, TeachingAssistant, Exam, User, Classroom } = require('../../models');
const Proctoring = require('../../models/Proctoring');
const { Op } = require('sequelize');
//const emailService = require('./../emailService');
//const notificationService = require('./../notificationService');

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

  // Send notification to target TA
  /*await notificationService.createNotification({
    userId: targetTa.id,
    title: 'New Swap Request',
    message: `You have received a swap request for an exam proctoring. Please check your swap requests.`,
    type: 'SWAP_REQUEST',
    referenceId: swapRequest.id
  });

  // Send email to target TA
  await emailService.sendEmail({
    to: targetTaEmail,
    subject: 'New Proctoring Swap Request',
    text: `You have received a swap request for an exam proctoring. Please log in to the system to check the details.`,
    html: `
      <h1>New Proctoring Swap Request</h1>
      <p>You have received a swap request for an exam proctoring.</p>
      <p>Details:</p>
      <ul>
        <li>Exam: ${exam.courseCode}</li>
        <li>Date: ${new Date(exam.date).toLocaleDateString()}</li>
        <li>Time: ${new Date(exam.date).toLocaleTimeString()} - ${new Date(exam.date).getTime() + exam.duration * 60000}</li>
      </ul>
      <p>Please log in to the system to respond to this request.</p>
    `
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
  // This would involve updating the exam assignments
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

  // Swap the assignments
  originalExamAssignment.taId = respondentId;
  swapExamAssignment.taId = swapRequest.requesterId;

  await originalExamAssignment.save();
  await swapExamAssignment.save();

  // Send notification to the original requester
  /*await notificationService.createNotification({
    userId: swapRequest.requester.user.id,
    title: 'Swap Request Accepted',
    message: `Your swap request has been accepted. The swap has been completed.`,
    type: 'SWAP_ACCEPTED',
    referenceId: swapRequest.id
  });

  // Send email to the original requester
  await emailService.sendEmail({
    to: swapRequest.requester.user.email,
    subject: 'Proctoring Swap Request Accepted',
    text: `Your swap request has been accepted and the swap has been completed.`,
    html: `
      <h1>Proctoring Swap Request Accepted</h1>
      <p>Your swap request has been accepted and the swap has been completed.</p>
      <p>You are now assigned to proctor:</p>
      <ul>
        <li>Exam: ${examToSwap.courseCode}</li>
        <li>Date: ${new Date(examToSwap.date).toLocaleDateString()}</li>
        <li>Time: ${new Date(examToSwap.date).toLocaleTimeString()} - ${new Date(examToSwap.date).getTime() + examToSwap.duration * 60000}</li>
      </ul>
      <p>Please log in to the system to see your updated assignments.</p>
    `
  });*/

  return {
    success: true,
    message: 'Swap successfully completed'
  };
};

/**
 * Get all user's exams for swap
 * @param {string} taId - ID of the TA
 * @returns {Promise<Array>} - list of exams
 */
const getUserExamsForSwap = async (taId) => {
  const examAssignments = await Proctoring.findAll({
    where: {
      taId: taId
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

  return examAssignments.map(assignment => {
    const examDate = new Date(assignment.exam.date);
    return {
      id: assignment.exam.id,
      course: assignment.exam.courseName,
      date: examDate.toLocaleDateString(),
      time: `${examDate.getHours().toString().padStart(2, '0')}.${examDate.getMinutes().toString().padStart(2, '0')}-${new Date(examDate.getTime() + assignment.exam.duration * 60000).getHours().toString().padStart(2, '0')}.${new Date(examDate.getTime() + assignment.exam.duration * 60000).getMinutes().toString().padStart(2, '0')}`,
      classrooms: assignment.exam.classrooms
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

  // Send notification to target TA
  /*await notificationService.createNotification({
    userId: swapRequest.targetTa.user.id,
    title: 'Swap Request Cancelled',
    message: `A swap request has been cancelled by the requester.`,
    type: 'SWAP_CANCELLED',
    referenceId: swapRequest.id
  });*/

  return {
    success: true,
    message: 'Swap request cancelled successfully'
  };
};

/**
 * Get forum swap requests
 * @returns {Promise<Array>} - list of forum swap requests
 */
const getForumSwapRequests = async () => {
  const forumRequests = await SwapRequest.findAll({
    where: {
      isForumPost: true,
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
      submitter: request.requester.user.name,
      submitTime: request.requestDate.toLocaleDateString(),
      requesterId: request.requesterId
    };
  });
};

module.exports = {
  createPersonalSwapRequest,
  getSwapRequestsForTa,
  respondToSwapRequest,
  getUserExamsForSwap,
  cancelSwapRequest,
  getForumSwapRequests
};