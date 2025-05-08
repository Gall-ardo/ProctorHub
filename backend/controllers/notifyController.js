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