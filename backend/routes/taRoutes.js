const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const taWorkloadController = require('../controllers/ta/taWorkloadController');
const taLeaveController = require('../controllers/ta/taLeaveController');
const upload = require('../middleware/upload');
const swapRequestController = require('../controllers/ta/taSwapController');
const taProctoringController = require('../controllers/ta/taProctoringController');

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

router.post('/swaps', swapRequestController.createPersonalSwapRequest);                   // POST /swaps
router.get('/swaps/mine', swapRequestController.getMySwapRequests);                      // GET /swaps/mine
router.get('/swaps/my-exams', swapRequestController.getMyExamsForSwap);                  // GET /swaps/my-exams
router.post('/swaps/respond', swapRequestController.respondToSwapRequest);               // POST /swaps/respond
router.delete('/swaps/:swapRequestId', swapRequestController.cancelSwapRequest);         // DELETE /swaps/:swapRequestId

router.get('/proctorings', taProctoringController.getAllProctorings);
router.get('/proctorings/pending', taProctoringController.getPendingProctorings);
router.get('/proctorings/active', taProctoringController.getActiveProctorings);
router.put('/proctorings/:proctoringId/accept', taProctoringController.acceptProctoring);
router.put('/proctorings/:proctoringId/reject', taProctoringController.rejectProctoring);
router.get('/proctorings/stats', taProctoringController.getProctoringStats);
router.put('/profile/multidepartment', taProctoringController.updateMultidepartmentPreference);


module.exports = router;