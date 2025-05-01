// services/notificationService.js
const { v4: uuidv4 } = require('uuid');
const { Notification } = require('../models');

/**
 * Create a new notification
 * @param {Object} notificationData - the notification data
 * @param {string} notificationData.userId - user ID to send notification to
 * @param {string} notificationData.title - notification title
 * @param {string} notificationData.message - notification message
 * @param {string} notificationData.type - notification type
 * @param {string} notificationData.referenceId - related entity ID
 * @returns {Promise<Object>} - created notification
 */
const createNotification = async (notificationData) => {
  try {
    const { userId, title, message, type, referenceId } = notificationData;
    
    const notification = await Notification.create({
      id: uuidv4(),
      userId,
      title,
      message,
      type,
      referenceId,
      isRead: false,
      createdAt: new Date()
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Get all notifications for a user
 * @param {string} userId - user ID
 * @param {boolean} unreadOnly - whether to return only unread notifications
 * @returns {Promise<Array>} - list of notifications
 */
const getUserNotifications = async (userId, unreadOnly = false) => {
  try {
    const where = { userId };
    
    if (unreadOnly) {
      where.isRead = false;
    }
    
    const notifications = await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    return notifications;
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - notification ID
 * @param {string} userId - user ID
 * @returns {Promise<Object>} - updated notification
 */
const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        userId
      }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.isRead = true;
    await notification.save();

    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId - user ID
 * @returns {Promise<Object>} - update results
 */
const markAllNotificationsAsRead = async (userId) => {
  try {
    const result = await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );

    return { success: true, count: result[0] };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
};