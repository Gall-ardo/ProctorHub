// backend/services/Dean/leaveRequestService.js
const { Op } = require('sequelize');
const { LeaveRequest, TeachingAssistant, User } = require('../../models');

async function listPending() {
    const rows = await LeaveRequest.findAll({
        where: { status: 'waiting' },
        include: [{
        model: TeachingAssistant,
        // no alias here means the default is "TeachingAssistant"
        include: [
            { model: User, as: 'taUser', attributes: ['name','email'] }
        ]
        }],
        order: [['startDate','ASC']],
    });

    return rows.map(r => ({
        id:        r.id,
        startDate: r.startDate,
        endDate:   r.endDate,
        taId:      r.taId,
        taName:    r.TeachingAssistant.taUser.name,
        taEmail:   r.TeachingAssistant.taUser.email,
        reason:    r.reason,
        filePath:  r.filePath,
    }));
    }

    async function listCurrent() {
    const rows = await LeaveRequest.findAll({
        where: { status: 'approved' },
        include: [{
        model: TeachingAssistant,
        include: [
            { model: User, as: 'taUser', attributes: ['name'] }
        ]
        }],
        order: [['endDate','DESC']],
    });

    return rows.map(r => ({
        id:        r.id,
        startDate: r.startDate,
        endDate:   r.endDate,
        taId:      r.taId,
        taName:    r.TeachingAssistant.taUser.name,
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