// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateUser } = require('../middlewares/auth');

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Get all notifications for the authenticated user
router.get('/', notificationController.getMyNotifications);

// Mark a notification as read
router.patch('/:notificationId/read', notificationController.markAsRead);

// Mark all notifications as read
router.patch('/read-all', notificationController.markAllAsRead);

module.exports = router;