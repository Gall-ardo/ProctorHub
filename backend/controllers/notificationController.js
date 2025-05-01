// controllers/notificationController.js
const notificationService = require('../services/notificationService');

/**
 * Get authenticated user's notifications
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const unreadOnly = req.query.unread === 'true';
    
    const notifications = await notificationService.getUserNotifications(userId, unreadOnly);
    
    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a notification as read
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    const notification = await notificationService.markNotificationAsRead(notificationId, userId);
    
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const result = await notificationService.markAllNotificationsAsRead(userId);
    
    res.status(200).json({
      success: true,
      message: `${result.count} notifications marked as read`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead
};