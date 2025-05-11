// backend/services/Secretary/workloadApproveService.js
const { v4: uuidv4 } = require('uuid');
const {
  Workload,
  Course,
  TeachingAssistant,
  User,
  Secretary,
  Notification,
} = require('../../models');

/**
 * List all pending workloads for this secretary’s department
 */
async function getPendingWorkloads(secretaryId) {
  // 1) find the secretary’s department
  const sec = await Secretary.findByPk(secretaryId);
  if (!sec) throw new Error('Secretary not found');
  const department = sec.department;

  // 2) only select Workloads whose Course.department matches
  const workloads = await Workload.findAll({
    where: { isApproved: false, rejectionReason: null },
    include: [
      {
        model: Course,
        where: { department },
        attributes: ['courseName']
      },
      { model: User, as: 'ta', attributes: ['id','name','email'] },
      { model: User, as: 'instructor', attributes: ['id','name'] }
    ],
    order: [['date','ASC']]
  });

  return workloads.map(wl => ({
    id: wl.id,
    date: wl.date,
    duration: wl.duration,
    taskType: wl.taskType,
    course: wl.Course.courseName,
    teachingAssistant: {
      id: wl.ta.id,
      name: wl.ta.name,
      email: wl.ta.email
    }
  }));
}


async function approveWorkload(workloadId, secretaryId) {
    const wl = await Workload.findByPk(workloadId, {
      include: [{ model: User, as: 'ta', attributes: ['id','name'] }]
    });
    if (!wl) throw new Error('Workload not found');
    if (wl.isApproved) return wl;
  
    // mark approved
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

  const sec = await Secretary.findByPk(secretaryId, { include: [User] });
  const approverName = sec.User.name;

  // notify TA
  await Notification.create({
    id: uuidv4(),
    subject: 'Workload Request Approved',
    message: `Your workload request for ${wl.taskType} on ${wl.date.toLocaleDateString()} was approved by ${approverName}.`,
    date: new Date(),
    recipientId: wl.ta.id,
    isRead: false
  });

  return wl;
}

async function rejectWorkload(workloadId, reason, secretaryId) {
    const wl = await Workload.findByPk(workloadId, {
      include: [{ model: User, as: 'ta', attributes: ['id','name'] }]
    });
    if (!wl) throw new Error('Workload not found');
  
    wl.isApproved = false;
    wl.rejectionReason = reason;
    await wl.save();
  
    const sec = await Secretary.findByPk(secretaryId, { include: [User] });
    const rejectorName = sec.User.name;
  
    await Notification.create({
      id: uuidv4(),
      subject: 'Workload Request Rejected',
      message: `Your workload request for ${wl.taskType} on ${wl.date.toLocaleDateString()} was rejected by ${rejectorName}. Reason: ${reason}`,
      date: new Date(),
      recipientId: wl.ta.id,
      isRead: false
    });
  
    return wl;
  }
  
  
  /**
   * Return summary totals for this secretary’s department
   */
  async function getWorkloadTotals(secretaryId) {
    const sec = await Secretary.findByPk(secretaryId);
    if (!sec) throw new Error('Secretary not found');
    const department = sec.department;
  
    const workloads = await Workload.findAll({
      include: [
        {
          model: Course,
          where: { department },
          attributes: []
        },
        {
          model: User,
          as: 'ta',
          attributes: ['id','name']
        }
      ]
    });
  
    const summary = {};
    workloads.forEach(wl => {
      const taId   = wl.taId;
      const taName = wl.ta.name || 'Unknown TA';
      summary[taId] ??= {
        id: taId,
        taName,
        approvedHours: 0,
        waitingHours: 0,
        lastUpdate: wl.updatedAt
      };
      if (wl.isApproved) summary[taId].approvedHours += wl.duration;
      else if (!wl.rejectionReason) summary[taId].waitingHours += wl.duration;
      if (wl.updatedAt > summary[taId].lastUpdate)
        summary[taId].lastUpdate = wl.updatedAt;
    });
  
    return Object.values(summary);
  }
  
  
  module.exports = {
    getPendingWorkloads,
    approveWorkload,
    rejectWorkload,
    getWorkloadTotals
  };