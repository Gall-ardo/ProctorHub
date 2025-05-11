const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const {
  LeaveRequest,
  TeachingAssistant,
  User,
  Exam,
  Proctoring,
  Notification,
  Secretary
} = require('../../models');

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

async function approve(id) {
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

  // 3) Send notification
  if (leave?.TeachingAssistant?.taUser) {
    const { id: taId, name } = leave.TeachingAssistant.taUser;
    await Notification.create({
      id:          uuidv4(),
      recipientId: taId,
      subject:     'Leave Request Approved',
      message:     `Your leave from `
                 + `${leave.startDate.toISOString().slice(0,10)} to `
                 + `${leave.endDate.toISOString().slice(0,10)} has been approved.`, 
      date:        new Date(),
      isRead:      false
    });
  }

  return r;
}

async function reject(id, reason) {
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
                 + `${leave.endDate.toISOString().slice(0,10)} has been rejected. `,
      date:        new Date(),
      isRead:      false
    });
  }

  return r;
}

module.exports = { listPending, listCurrent, approve, reject };