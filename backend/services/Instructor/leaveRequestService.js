const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const axios = require('axios');
const {
  LeaveRequest,
  TeachingAssistant,
  User,
  Exam,
  Proctoring,
  Notification
} = require('../../models');
const examService = require('./examService');

/**
 * Lists pending leave requests for TAs
 * @returns {Promise<Array>} Array of leave requests with affected exams
 */
async function listPending() {
  // 1) fetch all waiting leave‐requests + TA→User
  const rows = await LeaveRequest.findAll({
    where: { status: 'waiting' },
    include: [{
      model: TeachingAssistant,
      include: [{ model: User, as: 'taUser', attributes: ['name','email'] }]
    }],
    order: [['startDate','ASC']],
  });

  // 2) for each leave, look up any proctoring assignments in that date‐range
  const results = await Promise.all(rows.map(async r => {
    // fetch all proctoring records for this TA
    const pros = await Proctoring.findAll({
      where: { taId: r.taId },
      include: [{ model: Exam, as: 'exam', attributes: ['id','courseName','date'] }]
    });

    // filter only the exams whose date lies in [startDate,endDate]
    const affectedExams = pros
      .map(p => p.exam)
      .filter(ex => ex.date >= r.startDate && ex.date <= r.endDate)
      .map(ex => ({
        id: ex.id,
        courseName: ex.courseName,
        date: ex.date
      }));

    return {
      id:        r.id,
      startDate: r.startDate,
      endDate:   r.endDate,
      taId:      r.taId,
      taName:    r.TeachingAssistant.taUser.name,
      taEmail:   r.TeachingAssistant.taUser.email,
      reason:    r.reason,
      filePath:  r.filePath,
      affectedExams
    };
  }));

  return results;
}

/**
 * Lists current approved leave requests
 * @returns {Promise<Array>} Array of approved leave requests
 */
async function listCurrent() {
  const rows = await LeaveRequest.findAll({
    where: { status: 'approved' },
    include: [{
      model: TeachingAssistant,
      include: [{ model: User, as: 'taUser', attributes: ['name'] }]
    }],
    order: [['endDate','DESC']],
  });

  return rows.map(r => ({
    id:        r.id,
    startDate: r.startDate,
    endDate:   r.endDate,
    taId:      r.taId,
    taName:    r.TeachingAssistant.taUser.name
  }));
}

/**
 * Approve a leave request and handle affected proctoring assignments
 * @param {string} id - Leave request ID
 * @param {string} instructorId - ID of the instructor approving the request
 * @returns {Promise<Object>} The approved leave request
 */
async function approve(id, instructorId) {
  // Get instructor name for notifications
  const instructor = await User.findByPk(instructorId, {
    attributes: ['name']
  });
  const instructorName = instructor ? instructor.name : 'Instructor';

  // 1) Mark the leave request approved
  const r = await LeaveRequest.findByPk(id);
  if (!r) throw new Error('LeaveRequest not found');
  r.status = 'approved';
  await r.save();

  // 2) Load TA + their User record
  const leave = await LeaveRequest.findByPk(id, {
    include: [{ 
      model: TeachingAssistant,
      include: [{ model: User, as: 'taUser', attributes: ['id','name'] }]
    }]
  });

  // 3) Send notification to TA about approval
  if (leave?.TeachingAssistant?.taUser) {
    const { id: taId, name } = leave.TeachingAssistant.taUser;
    await Notification.create({
      id:          uuidv4(),
      recipientId: taId,
      subject:     'Leave Request Approved',
      message:     `Your leave from `
                 + `${leave.startDate.toISOString().slice(0,10)} to `
                 + `${leave.endDate.toISOString().slice(0,10)} has been approved by '${instructorName}'. `, 
      date:        new Date(),
      isRead:      false
    });
    
    // 4) Handle affected proctoring assignments
    await handleAffectedProctoringAssignments(taId, leave.startDate, leave.endDate);
  }

  return r;
}

/**
 * Reject a leave request
 * @param {string} id - Leave request ID
 * @param {string} reason - Rejection reason
 * @param {string} instructorId - ID of the instructor rejecting the request
 * @returns {Promise<Object>} The rejected leave request
 */
async function reject(id, reason, instructorId) {
  // Get instructor name for notifications
  const instructor = await User.findByPk(instructorId, {
    attributes: ['name']
  });
  const instructorName = instructor ? instructor.name : 'Instructor';

  // 1) Mark the leave request rejected
  const r = await LeaveRequest.findByPk(id);
  if (!r) throw new Error('LeaveRequest not found');
  r.status = 'rejected';
  r.rejectionReason = reason;
  await r.save();

  // 2) Load TA + their User record
  const leave = await LeaveRequest.findByPk(id, {
    include: [{ 
      model: TeachingAssistant,
      include: [{ model: User, as: 'taUser', attributes: ['id','name'] }]
    }]
  });

  // 3) Send notification
  if (leave?.TeachingAssistant?.taUser) {
    const { id: taId, name } = leave.TeachingAssistant.taUser;
    await Notification.create({
      id:          uuidv4(),
      recipientId: taId,
      subject:     'Leave Request Rejected',
      message:     `Your leave from `
                 + `${leave.startDate.toISOString().slice(0,10)} to `
                 + `${leave.endDate.toISOString().slice(0,10)} has been rejected by '${instructorName}'. `
                 + (reason ? `Reason: ${reason}` : ''), 
      date:        new Date(),
      isRead:      false
    });
  }

  return r;
}

/**
 * Handle proctoring assignments affected by an approved leave request
 * @param {string} taId - The TA's ID
 * @param {Date} startDate - Leave start date
 * @param {Date} endDate - Leave end date
 */
async function handleAffectedProctoringAssignments(taId, startDate, endDate) {
  try {
    // 1) Find all proctoring assignments for this TA that overlap with the leave period
    const affectedProctoringAssignments = await Proctoring.findAll({
      where: { 
        taId,
        // Only consider PENDING or ACCEPTED proctorings (not REJECTED or already SWAPPED)
        status: { [Op.in]: ['PENDING', 'ACCEPTED'] }
      },
      include: [{
        model: Exam, 
        as: 'exam',
        where: {
          date: { 
            [Op.between]: [startDate, endDate] 
          }
        }
      }]
    });
    
    console.log(`Found ${affectedProctoringAssignments.length} affected proctoring assignments for TA ${taId}`);
    
    // 2) For each affected proctoring, mark as SWAPPED and find a replacement
    for (const proctoring of affectedProctoringAssignments) {
      const exam = proctoring.exam;
      console.log(`Processing exam ${exam.id} (${exam.courseName}) on ${exam.date}`);
      
      // Mark the current proctoring as SWAPPED
      await proctoring.update({ status: 'SWAPPED' });
      
      // If the proctoring was ACCEPTED, reduce the TA's workload
      if (proctoring.status === 'ACCEPTED') {
        try {
          // Get the TA record to determine if they're in the same department as the exam
          const ta = await TeachingAssistant.findByPk(taId);
          
          // Reduce the TA's workload
          await axios.post(
            `${process.env.API_URL || 'http://localhost:5001'}/api/instructor/update-ta-workload`,
            {
              taId: taId,
              examId: exam.id,
              action: 'SWAP', // This action tells the backend to reduce the workload
              examDepartment: exam.department,
              isOldProctorSameDepartment: ta ? ta.department === exam.department : false
            },
            {
              headers: {
                'Authorization': `Bearer ${process.env.SYSTEM_TOKEN}` // Use a system token for internal API calls
              }
            }
          );
          
          console.log(`Updated workload for swapped proctor ${taId}`);
        } catch (workloadError) {
          console.error('Error updating proctor workload:', workloadError);
          // Continue with other tasks even if workload update fails
        }
      }
      
      // Notify the TA that their proctoring assignment has been removed
      await Notification.create({
        id: uuidv4(),
        recipientId: taId,
        subject: 'Proctoring Assignment Removed',
        message: `Due to your approved leave request, your proctoring assignment for ${exam.courseName} exam on ${new Date(exam.date).toISOString().slice(0,10)} has been removed.`,
        date: new Date(),
        isRead: false
      });
      
      // Use the findReplacementProctor from examService to find and request a new proctor
      try {
        const replacementFound = await examService.findReplacementProctor(exam.id, taId);
        
        if (replacementFound) {
          console.log(`Replacement found for exam ${exam.id}`);
        } else {
          console.log(`No suitable replacement found for exam ${exam.id}. Manual intervention required.`);
          
          // Notify the instructor that a manual replacement is needed
          const instructors = await User.findAll({
            include: [{
              model: Exam,
              where: { id: exam.id }
            }],
            attributes: ['id']
          });
          
          for (const instructor of instructors) {
            await Notification.create({
              id: uuidv4(),
              recipientId: instructor.id,
              subject: 'TA Replacement Needed',
              message: `A replacement TA is needed for ${exam.courseName} exam on ${new Date(exam.date).toISOString().slice(0,10)}. The assigned TA has an approved leave request for this date.`,
              date: new Date(),
              isRead: false
            });
          }
        }
      } catch (error) {
        console.error(`Error finding replacement proctor for exam ${exam.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error handling affected proctoring assignments:', error);
    throw error;
  }
}

module.exports = { listPending, listCurrent, approve, reject }; 