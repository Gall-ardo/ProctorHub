const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const taWorkloadController = require('../controllers/ta/taWorkloadController');

// Test route without authentication
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'TA routes are working properly!' });
});

// Apply authentication middleware to all protected TA routes
router.use(authenticateToken);
// Apply role-based authorization - only TAs can access these routes
router.use(authorizeRole(['ta']));

// Workload routes
router.get('/workloads', taWorkloadController.getWorkloads);
router.get('/workloads/pending', taWorkloadController.getPendingWorkloads);
router.get('/workloads/approved', taWorkloadController.getApprovedWorkloads);
router.post('/workloads', taWorkloadController.createWorkload);

module.exports = router;