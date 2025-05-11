// backend/routes/deanRoutes.js
const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/Dean/leaveRequestController');
const deanHomePageController = require('../controllers/Dean/deanHomePageController');
const examController = require('../controllers/Dean/examController');

// Fetch data for the Dean's homepage (all exams and swaps)
router.get(
  '/home',
  authenticateToken,
  authorizeRole(['dean']),
  deanHomePageController.getHomePageData
);

router.get(
  '/leave-requests/pending',
  authenticateToken,
  authorizeRole(['dean']),
  ctrl.getPending
);

router.get(
  '/leave-requests/current',
  authenticateToken,
  authorizeRole(['dean']),
  ctrl.getCurrent
);

router.post(
  '/leave-requests/:id/approve',
  authenticateToken,
  authorizeRole(['dean']),
  ctrl.approve
);

router.post(
  '/leave-requests/:id/reject',
  authenticateToken,
  authorizeRole(['dean']),
  ctrl.reject
);

router.get(
  '/leave-requests/:id/file',
    authenticateToken,
    authorizeRole(['dean']),
    async (req, res) => {
        const lr = await LeaveRequest.findByPk(req.params.id);
        if (!lr) {
            return res.status(404).json({ message: 'No attachment found.' });
        }
        const fullPath = path.resolve(__dirname, '../uploads', lr.filePath);
        return res.download(fullPath, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                return res.status(500).json({ message: 'Error downloading file.' });
            }
        });
    }
);

router.post(
    '/exams',
    authenticateToken,
    authorizeRole(['dean']),
    examController.createExam
);

router.get(
    '/exams',
    authenticateToken,
    authorizeRole(['dean']),
    examController.getInstructorExams
);

router.get(
    '/exams/:examId',
    authenticateToken,
    authorizeRole(['dean']),
    examController.getExamById
);

router.put(
    '/exams/:examId',
    authenticateToken,
    authorizeRole(['dean']),
    examController.updateExam
);

router.delete(
    '/exams/:examId',
    authenticateToken,
    authorizeRole(['dean']),
    examController.deleteExam
);

// New route for exam-specific TA availability including leave status
router.get(
    '/available-tas-for-exam',
    authenticateToken,
    authorizeRole(['dean']),
    examController.getAvailableTAsForExam
);

// Proctor assignment route
router.post(
    '/exams/assign-proctors',
    authenticateToken,
    authorizeRole(['dean']),
    examController.assignProctors
);

// Leave check route
router.get(
    '/check-ta-leave',
    authenticateToken,
    authorizeRole(['dean']),
    examController.checkTALeaveStatus
);

// Exam proctor swap routes
router.post(
    '/exams/:examId/swap-proctor',
    authenticateToken,
    authorizeRole(['dean']),
    examController.swapProctor
);

router.get(
    '/exams/:examId/swap-history',
    authenticateToken,
    authorizeRole(['dean']),
    examController.getSwapHistory
);

// Exam proctor swap request route
router.post(
    '/exams/:examId/request-swap-proctor',
    authenticateToken,
    authorizeRole(['dean']),
    examController.requestSwapProctor
);

// Update TA workload when swapped
router.post(
    '/update-ta-workload',
    authenticateToken,
    authorizeRole(['dean']),
    examController.updateTAWorkload
);

// Get all classrooms
router.get(
    '/classrooms',
    authenticateToken,
    authorizeRole(['dean']),
    examController.getAllClassrooms
);

router.get(
  '/courses',
  authenticateToken,
  authorizeRole(['dean']),   // adjust roles if needed
  examController.getCourses
);

module.exports = router;