const { Op } = require('sequelize');
const { Workload, Instructor, Course, TeachingAssistant, User } = require('../../models');

/**
 * List all pending workload requests for courses taught by a given instructor
 * @param {string} instructorId
 * @returns {Promise<Array<Workload>>}
 */
async function getPendingWorkloads(instructorId) {
  // Return all workloads for those courses where isApproved = false
  return Workload.findAll({
    where: {
      instructorId,
      isApproved: false,
    },
    include: [
      { 
        model: User, 
        as: 'ta', 
        attributes: ['name', 'email'] 
      },
      { 
        model: Course, 
        attributes: ['courseName'] 
      }
    ],
    order: [['date', 'ASC']]
  }).then(workloads => {
    // Transform data to match frontend expectations
    return workloads.map(wl => ({
      id: wl.id,
      date: wl.date,
      duration: wl.duration,
      taskType: wl.taskType,
      teachingAssistant: {
        ta: {
          name: wl.ta.name,
          email: wl.ta.email
        }
      },
      course: wl.Course ? wl.Course.courseName : null
    }));
  });
}

/**
 * Approve a workload request
 * @param {string} workloadId
 * @returns {Promise<Workload>}
 */
async function approveWorkload(workloadId) {
  const wl = await Workload.findByPk(workloadId);
  if (!wl) throw new Error('Workload not found');
  wl.isApproved = true;
  await wl.save();
  return wl;
}

/**
 * Reject a workload request with a reason
 * @param {string} workloadId
 * @param {string} reason
 * @returns {Promise<Workload>}
 */
async function rejectWorkload(workloadId, reason) {
  const wl = await Workload.findByPk(workloadId);
  if (!wl) throw new Error('Workload not found');
  wl.isApproved = false;
  wl.rejectionReason = reason;
  await wl.save();
  return wl;
}

/**
 * Get summary totals for each TA under this instructor
 * @param {string} instructorId
 * @returns {Promise<Array<Object>>}
 */
async function getWorkloadTotals(instructorId) {
  // Fetch all workloads with their associated TA users
  const workloads = await Workload.findAll({
    where: { instructorId },
    include: [{ model: User, as: 'ta', attributes: ['id', 'name'] }]
  });

  // Process workloads into summary data structure
  const summary = {};
  workloads.forEach(wl => {
    const taId = wl.taId;
    const taName = wl.ta ? wl.ta.name : 'Unknown TA';
    
    if (!summary[taId]) {
      summary[taId] = {
        id: taId, // Added id field to match frontend expectation
        taId,
        taName,
        approvedHours: 0,
        waitingHours: 0,
        lastUpdate: wl.updatedAt
      };
    }
    
    // Convert duration from minutes to hours for the summary
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