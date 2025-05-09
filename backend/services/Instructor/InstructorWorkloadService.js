// backend/services/Instructor/workloadService.js
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const {
  Workload,
  Instructor,
  Course,
  TeachingAssistant,
  User,
  Notification
} = require('../../models');

/**
 * List all pending workload requests for courses taught by a given instructor
 * @param {string} instructorId
 * @returns {Promise<Array>}
 */
async function getPendingWorkloads(instructorId) {
  const workloads = await Workload.findAll({
    where: { instructorId, isApproved: false, rejectionReason: null },
    include: [
      { model: User, as: 'ta', attributes: ['id', 'name', 'email'] },
      { model: Course, attributes: ['courseName'] }
    ],
    order: [['date', 'ASC']]
  });

  return workloads.map(wl => ({
    id: wl.id,
    date: wl.date,
    duration: wl.duration,
    taskType: wl.taskType,
    teachingAssistant: {
      name: wl.ta.name,
      email: wl.ta.email,
      id: wl.ta.id
    },
    course: wl.Course ? wl.Course.courseName : null
  }));
}

/**
 * Approve a workload request, update TA's totalWorkload, then notify the TA
 * @param {string} workloadId
 * @returns {Promise<Workload>}
 */
async function approveWorkload(workloadId) {
  const wl = await Workload.findByPk(workloadId, {
    include: [
      { model: User, as: 'ta', attributes: ['id', 'name'] },
      { model: User, as: 'instructor', attributes: ['name'] }
    ]
  });
  if (!wl) throw new Error('Workload not found');
  
  // Check if already approved to prevent double-counting
  if (wl.isApproved) {
    return wl;
  }

  // Update the workload status
  wl.isApproved = true;
  await wl.save();

  // Update the TA's totalWorkload in TeachingAssistant table
  try {
    const taId = wl.taId;
    const ta = await TeachingAssistant.findOne({
      where: { id: taId }
    });
    
    if (ta) {
      // Add the duration to the TA's total workload
      const additionalHours = wl.duration;
      const totalWorkload = (ta.totalWorkload || 0) + additionalHours;
      
      await ta.update({ totalWorkload });
      console.log(`Updated TA ${taId} totalWorkload to ${totalWorkload} (added ${additionalHours} hours)`);
    } else {
      console.error(`TA record not found for ID: ${taId}`);
    }
  } catch (error) {
    console.error('Error updating TA total workload:', error);
    // We continue even if updating totalWorkload fails, to prevent blocking the workflow
  }

  const instrName = wl.instructor?.name || 'your instructor';

  // Create notification for the TA
  await Notification.create({
    id: uuidv4(),
    subject: 'Workload Request Approved',
    message: `Your workload request for ${wl.taskType} on ${wl.date.toLocaleDateString()} has been approved by ${instrName}. ${wl.duration} hours have been added to your total workload.`,
    date: new Date(),
    recipientId: wl.ta.id,
    isRead: false
  });

  return wl;
}

/**
 * Reject a workload request and notify the TA
 * @param {string} workloadId
 * @param {string} reason
 * @returns {Promise<Workload>}
 */
async function rejectWorkload(workloadId, reason) {
  const wl = await Workload.findByPk(workloadId, {
    include: [
      { model: User, as: 'ta', attributes: ['id', 'name'] },
      { model: User, as: 'instructor', attributes: ['name'] }
    ]
  });
  if (!wl) throw new Error('Workload not found');

  wl.isApproved = false;
  wl.rejectionReason = reason;
  await wl.save();

  const instrName = wl.instructor?.name || 'your instructor';

  await Notification.create({
    id: uuidv4(),
    subject: 'Workload Request Rejected',
    message: `Your workload request for ${wl.taskType} on ${wl.date.toLocaleDateString()} was rejected by ${instrName}. Reason: ${reason}`,
    date: new Date(),
    recipientId: wl.ta.id,
    isRead: false
  });

  return wl;
}

/**
 * Get summary totals for each TA under this instructor
 * @param {string} instructorId
 * @returns {Promise<Array<Object>>}
 */
async function getWorkloadTotals(instructorId) {
  // First, get all workloads for the instructor
  const workloads = await Workload.findAll({
    where: { instructorId },
    include: [
      { 
        model: User, 
        as: 'ta', 
        attributes: ['id', 'name'] 
      }
    ]
  });

  // Initialize summary object
  const summary = {};
  
  // Process workloads to get basic workload data
  workloads.forEach(wl => {
    const taId = wl.taId;
    const taName = wl.ta ? wl.ta.name : 'Unknown TA';

    if (!summary[taId]) {
      summary[taId] = {
        id: taId,
        taId,
        taName,
        approvedHours: 0,
        waitingHours: 0,
        totalWorkload: 0,
        proctoringHours: {
          departmental: 0,
          nonDepartmental: 0,
          total: 0
        },
        lastUpdate: wl.updatedAt
      };
    }

    const durationInHours = wl.duration;

    if (wl.isApproved) {
      summary[taId].approvedHours += durationInHours;
    } else if (!wl.rejectionReason) {
      summary[taId].waitingHours += durationInHours;
    }

    if (wl.updatedAt > summary[taId].lastUpdate) {
      summary[taId].lastUpdate = wl.updatedAt;
    }
  });

  // Now fetch the additional TA data separately for each TA
  const taIds = Object.keys(summary);
  
  // If there are any TAs to process
  if (taIds.length > 0) {
    // Get all TA records in one query
    const teachingAssistants = await TeachingAssistant.findAll({
      where: { id: taIds }
    });
    
    // Add TA specific data to the summary
    teachingAssistants.forEach(ta => {
      if (summary[ta.id]) {
        summary[ta.id].totalWorkload = ta.totalWorkload || 0;
        summary[ta.id].proctoringHours = {
          departmental: ta.totalProctoringInDepartment || 0,
          nonDepartmental: ta.totalNonDepartmentProctoring || 0,
          total: (ta.totalProctoringInDepartment || 0) + (ta.totalNonDepartmentProctoring || 0)
        };
      }
    });
  }

  return Object.values(summary);
}

module.exports = {
  getPendingWorkloads,
  approveWorkload,
  rejectWorkload,
  getWorkloadTotals
};