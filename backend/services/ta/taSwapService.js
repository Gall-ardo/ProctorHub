// services/ta/taSwapService.js
const { v4: uuidv4 } = require('uuid');
const { SwapRequest, TeachingAssistant, Exam, User, Classroom, Notification } = require('../../models');
const Proctoring = require('../../models/Proctoring');
const { Op } = require('sequelize');
const emailService = require('../../services/emailService');
const sequelize = require('../../config/db');


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
/**
 * Respond to a swap request with an exam to swap
 * @param {Object} responseData
 * @param {string} responseData.swapRequestId
 * @param {string} responseData.respondentId
 * @param {string} responseData.examIdToSwap
 */
async function respondToSwapRequest(responseData) {
  const { swapRequestId, respondentId, examIdToSwap } = responseData;
  const t = await sequelize.transaction();
  try {
    // 1) Load swapRequest + its original requester (with user) + exam info
    const swapRequest = await SwapRequest.findByPk(swapRequestId, {
      include: [
        {
          model: TeachingAssistant,
          as: 'requester',
          include: [{ model: User, as: 'taUser', attributes: ['id','name','email'] }]
        },
        {
          model: Exam,
          as: 'exam',
          attributes: ['id','courseName','instructorId']
        }
      ],
      transaction: t
    });
    if (!swapRequest) throw new Error('Swap request not found');
    if (swapRequest.status !== 'PENDING') throw new Error('This swap request has already been processed');

    // 2) Load the two Proctoring assignments, including their Exam.duration & department
    const originalProctor = await Proctoring.findOne({
      where: { examId: swapRequest.examId, taId: swapRequest.requesterId },
      include: [{ model: Exam, as: 'exam', attributes: ['duration','department'] }],
      transaction: t
    });
    const swapProctor = await Proctoring.findOne({
      where: { examId: examIdToSwap, taId: respondentId },
      include: [{ model: Exam, as: 'exam', attributes: ['duration','department'] }],
      transaction: t
    });
    if (!originalProctor || !swapProctor) throw new Error('Exam assignments not found');
    if (originalProctor.status !== 'ACCEPTED' || swapProctor.status !== 'ACCEPTED') {
      throw new Error('Both proctorings must be ACCEPTED before swapping.');
    }

    // 3) Load both TA records *with* their User for notifications
    const requesterTA  = await TeachingAssistant.findByPk(swapRequest.requesterId, {
      include: [{ model: User, as: 'taUser', attributes: ['id','name','email'] }],
      transaction: t
    });
    const respondentTA = await TeachingAssistant.findByPk(respondentId, {
      include: [{ model: User, as: 'taUser', attributes: ['id','name','email'] }],
      transaction: t
    });
    if (!requesterTA || !respondentTA) throw new Error('TA records not found');

    // 4) Compute raw minutes & rounded hours
    const origMin = originalProctor.exam.duration;
    const swapMin = swapProctor.exam.duration;
    const origH   = Math.ceil(origMin / 60);
    const swapH   = Math.ceil(swapMin / 60);

    // 5) Determine department‐match flags
    const origDeptReq  = originalProctor.exam.department === requesterTA.department;
    const swapDeptReq  = swapProctor.exam.department   === requesterTA.department;
    const origDeptResp = originalProctor.exam.department === respondentTA.department;
    const swapDeptResp = swapProctor.exam.department   === respondentTA.department;

    // 6) Update requesterTA’s counters & workload
    requesterTA.totalProctoringInDepartment    =
      (requesterTA.totalProctoringInDepartment    || 0)
      - (origDeptReq ? origH : 0)
      + (swapDeptReq ? swapH : 0);
    requesterTA.totalNonDepartmentProctoring =
      (requesterTA.totalNonDepartmentProctoring || 0)
      - (!origDeptReq ? origH : 0)
      + (!swapDeptReq ? swapH : 0);
    requesterTA.totalWorkload                =
      (requesterTA.totalWorkload                || 0)
      - origMin
      + swapMin;

    // 7) Update respondentTA’s counters & workload
    respondentTA.totalProctoringInDepartment =
    (respondentTA.totalProctoringInDepartment || 0)
    - (swapDeptResp ? swapH : 0)     // subtract swap‐exam hours if it was in‐dept
    + (origDeptResp ? origH : 0);    // add original‐exam hours if it’s in‐dept
    
    respondentTA.totalNonDepartmentProctoring =
      (respondentTA.totalNonDepartmentProctoring || 0)
      - (!swapDeptResp ? swapH : 0)    // subtract swap‐exam hours if it was out‐dept
      + (!origDeptResp ? origH : 0);   // add original‐exam hours if it’s out‐dept
    
    respondentTA.totalWorkload =
      (respondentTA.totalWorkload || 0)
      - swapMin                        // lose their own exam’s minutes
      + origMin;                       // gain the requester’s exam’s minutes

    // 8) Swap the assignments
    originalProctor.taId = respondentId;
    swapProctor.taId     = swapRequest.requesterId;
    await originalProctor.save({ transaction: t });
    await swapProctor.save({ transaction: t });

    // 9) Persist TA changes
    await requesterTA.save({ transaction: t });
    await respondentTA.save({ transaction: t });

    // 10) Mark swapRequest approved + notifications
    swapRequest.status           = 'APPROVED';
    swapRequest.respondentExamId = examIdToSwap;
    swapRequest.isApproved       = true;
    if (swapRequest.isForumPost) {
      swapRequest.targetTaId = respondentId;
    }
    await swapRequest.save({ transaction: t });


    // Notify original requester
    await Notification.create({
      id:          uuidv4(),
      recipientId: requesterTA.id,
      subject:     'Swap Request Accepted',
      message:     `${respondentTA.taUser.name} has accepted your swap request for ${swapRequest.exam.courseName}.`,
      date:        new Date(),
      isRead:      false
    }, { transaction: t });

    // Notify instructor
    await Notification.create({
      id:          uuidv4(),
      recipientId: swapRequest.exam.instructorId,
      subject:     'Exam Swapped',
      message:     `The exam ${swapRequest.exam.courseName} has been swapped between ${requesterTA.taUser.name} and ${respondentTA.taUser.name}.`,
      date:        new Date(),
      isRead:      false
    }, { transaction: t });

    await t.commit();
    return { success: true, message: 'Swap completed and workloads updated' };
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

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