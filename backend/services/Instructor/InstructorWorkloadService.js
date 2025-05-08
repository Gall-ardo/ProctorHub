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
    where: { instructorId, isApproved: false },
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
 * Approve a workload request, then notify the TA
 * @param {string} workloadId
 * @returns {Promise<Workload>}
 */
async function approveWorkload(workloadId) {
  const wl = await Workload.findByPk(workloadId, {
    include: [
      { model: User, as: 'ta',         attributes: ['id','name'] },
      { model: User, as: 'instructor', attributes: ['name'] }
    ]
  });
  if (!wl) throw new Error('Workload not found');

  wl.isApproved = true;
  await wl.save();

  const instrName = wl.instructor?.name || 'your instructor';

  // 🔥 wrap this in backticks so the interpolation actually runs
  await Notification.create({
    id:          uuidv4(),
    subject:     'Workload Request Approved',
    message:     `Your workload request for ${wl.taskType} on ${wl.date.toLocaleDateString()} has been approved by ${instrName}.`,
    date:        new Date(),
    recipientId: wl.ta.id
  });

  return wl;
}

async function rejectWorkload(workloadId, reason) {
  const wl = await Workload.findByPk(workloadId, {
    include: [
      { model: User, as: 'ta',         attributes: ['id','name'] },
      { model: User, as: 'instructor', attributes: ['name'] }
    ]
  });
  if (!wl) throw new Error('Workload not found');

  wl.isApproved      = false;
  wl.rejectionReason = reason;
  await wl.save();

  const instrName = wl.instructor?.name || 'your instructor';

  await Notification.create({
    id:          uuidv4(),
    subject:     'Workload Request Rejected',
    message:     `Your workload request for ${wl.taskType} on ${wl.date.toLocaleDateString()} was rejected by ${instrName}. Reason: ${reason}`,
    date:        new Date(),
    recipientId: wl.ta.id
  });

  return wl;
}


/**
 * Get summary totals for each TA under this instructor
 * @param {string} instructorId
 * @returns {Promise<Array<Object>>}
 */
async function getWorkloadTotals(instructorId) {
  const workloads = await Workload.findAll({
    where: { instructorId },
    include: [{ model: User, as: 'ta', attributes: ['id', 'name'] }]
  });

  const summary = {};
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
        lastUpdate: wl.updatedAt
      };
    }

    const durationInHours = wl.duration;

    if (wl.isApproved) {
      summary[taId].approvedHours += durationInHours;
    } else {
      summary[taId].waitingHours += durationInHours;
    }

    if (wl.updatedAt > summary[taId].lastUpdate) {
      summary[taId].lastUpdate = wl.updatedAt;
    }
  });

  return Object.values(summary);
}

module.exports = {
  getPendingWorkloads,
  approveWorkload,
  rejectWorkload,
  getWorkloadTotals
};