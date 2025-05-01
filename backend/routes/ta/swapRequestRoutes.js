// routes/swapRequestRoutes.js
const express = require('express');
const router = express.Router();
const swapRequestController = require('../../controllers/ta/swapRequestController');
const { authenticateUser, authorizeTA } = require('../../middlewares/auth');

// Apply authentication middleware to all routes
router.use(authenticateUser);
// Ensure only Teaching Assistants can access these routes
router.use(authorizeTA);

// Create a personal swap request
router.post('/', swapRequestController.createPersonalSwapRequest);

// Get all swap requests for the authenticated TA
router.get('/my-requests', swapRequestController.getMySwapRequests);

// Get all exams available for swap for the authenticated TA
router.get('/my-exams', swapRequestController.getMyExamsForSwap);

// Respond to a swap request
router.post('/respond', swapRequestController.respondToSwapRequest);

// Cancel a swap request
router.delete('/:swapRequestId', swapRequestController.cancelSwapRequest);

module.exports = router;