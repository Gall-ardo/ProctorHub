const { Op } = require('sequelize');
const {
  LeaveRequest,
  TeachingAssistant,
  User,
  Exam,
  Proctoring
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
  const r = await LeaveRequest.findByPk(id);
  if (!r) throw new Error('LeaveRequest not found');
  r.status = 'approved';
  await r.save();
  return r;
}

async function reject(id, reason) {
  const r = await LeaveRequest.findByPk(id);
  if (!r) throw new Error('LeaveRequest not found');
  r.status = 'rejected';
  r.rejectionReason = reason;
  await r.save();
  return r;
}

module.exports = { listPending, listCurrent, approve, reject };