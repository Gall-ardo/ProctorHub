// backend/controllers/notifyController.js
const { Notification } = require('../models');

exports.getMine = async (req, res) => {
  try {
    const userId = req.user.id;              // set by your auth middleware
    const notes  = await Notification.findAll({
      where: { recipientId: userId },
      order: [['date','DESC']]
    });
    res.json({ success: true, data: notes });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    const userId = req.user.id;
    // update all unread → read
    await Notification.update(
      { isRead: true },
      { where: { recipientId: userId, isRead: false } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error marking notifications read:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};