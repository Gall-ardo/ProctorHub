const { Notification } = require('../models');
const { v4: uuidv4 } = require('uuid');

async function notifyTA(recipientId, subject, message) {
  return Notification.create({
    id:         uuidv4(),
    recipientId,
    subject,
    message,
    date:       new Date(),
    isRead:     false
  });
}

module.exports = { notifyTA };