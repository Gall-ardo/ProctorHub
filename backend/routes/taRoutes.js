// backend/routes/taRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const taWorkloadController = require('../controllers/ta/taWorkloadController');
const taLeaveController = require('../controllers/ta/taLeaveController');
const upload = require('../middleware/upload');
const swapRequestController = require('../controllers/ta/taSwapController');
const taProctoringController = require('../controllers/ta/taProctoringController');
const taProctoringScheduleController = require('../controllers/ta/taProctoringScheduleController');
const taOfferingScheduleController = require('../controllers/ta/taOfferingScheduleController');
const taCombinedScheduleController = require('../controllers/ta/taCombinedScheduleController');

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
router.get('/courses/assigned', taWorkloadController.getTAAssignedCourses);
router.get('/courses/:courseId/instructors', taWorkloadController.getCourseInstructors);

// Leave of Absence routes
router.get('/leave-requests', taLeaveController.getLeaveRequests);
router.get('/leave-requests/pending', taLeaveController.getPendingLeaveRequests);
router.get('/leave-requests/approved', taLeaveController.getApprovedLeaveRequests);
router.post('/leave-requests', upload.single('file'), taLeaveController.createLeaveRequest); 
router.delete('/leave-requests/:leaveRequestId', taLeaveController.deleteLeaveRequest);

// Swap routes
router.post('/swaps', swapRequestController.createPersonalSwapRequest);                   // POST /api/ta/swaps
router.get('/swaps/mine', swapRequestController.getMySwapRequests);                       // GET /api/ta/swaps/mine
router.get('/swaps/my-exams', swapRequestController.getMyExamsForSwap);                  // GET /api/ta/swaps/my-exams
router.post('/swaps/respond', swapRequestController.respondToSwapRequest);               // POST /api/ta/swaps/respond
router.delete('/swaps/:swapRequestId', swapRequestController.cancelSwapRequest);         // DELETE /api/ta/swaps/:swapRequestId
router.get('/swaps/forum-items', swapRequestController.getForumSwapRequests);            // GET /api/ta/swaps/forum-items
router.post('/swaps/forum', swapRequestController.createForumSwapRequest); // POST /api/ta/swaps/forum
router.get('/swaps/submitted', swapRequestController.getMySubmittedSwapRequests);        // GET /api/ta/swaps/submitted (new route)
router.get('/swaps/department-tas', swapRequestController.getSameDepartmentTAs);  // GET /api/ta/swaps/department-tas
router.post('/swaps/:swapRequestId/reject', swapRequestController.rejectSwapRequest); 

router.get('/proctorings', taProctoringController.getAllProctorings);
router.get('/proctorings/pending', taProctoringController.getPendingProctorings);
router.get('/proctorings/active', taProctoringController.getActiveProctorings);
router.put('/proctorings/:proctoringId/accept', taProctoringController.acceptProctoring);
router.put('/proctorings/:proctoringId/reject', taProctoringController.rejectProctoring);
router.get('/proctorings/stats', taProctoringController.getProctoringStats);
router.put('/profile/multidepartment', taProctoringController.updateMultidepartmentPreference);


// Get TA's proctoring schedule
router.get('/proctoring', taProctoringScheduleController.getProctoringSchedule);
// Get TA's offering schedule
router.get('/offerings', taOfferingScheduleController.getOfferingSchedule);
// Get TA's combined schedule (both proctoring and offerings)
router.get('/schedule/combined', taCombinedScheduleController.getCombinedSchedule);
module.exports = router;