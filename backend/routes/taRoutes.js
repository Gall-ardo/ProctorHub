const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const taWorkloadController = require('../controllers/ta/taWorkloadController');
const taLeaveController = require('../controllers/ta/taLeaveController');
const upload = require('../middleware/upload');


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

// Leave of Absence routes
router.get('/leave-requests', taLeaveController.getLeaveRequests);
router.get('/leave-requests/pending', taLeaveController.getPendingLeaveRequests);
router.get('/leave-requests/approved', taLeaveController.getApprovedLeaveRequests);
router.post('/leave-requests', upload.single('file'), taLeaveController.createLeaveRequest); 
router.delete('/leave-requests/:leaveRequestId', taLeaveController.deleteLeaveRequest);


module.exports = router;