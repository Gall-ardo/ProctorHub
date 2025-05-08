const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Controllers
const examController = require('../controllers/instructor/examController');
const instructorController = require('../controllers/instructor/instructorController');
const { getMainPageData } = require('../controllers/Instructor/MainPageController');
const { listPending, approve, reject, totals } = require('../controllers/Instructor/InstructorWorkloadController');

// Test route without authentication
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Instructor routes are working properly!' });
});

// Apply authentication middleware to all protected instructor routes
router.use(authenticateToken);

// Apply role-based authorization - only instructors can access these routes
router.use(authorizeRole(['instructor']));

/* --- Course Routes --- */
router.get('/courses', instructorController.getAllCourses);
router.get('/my-courses', instructorController.getInstructorCourses);

/* --- Exam Routes --- */
router.post('/exams', examController.createExam);
router.get('/exams', examController.getInstructorExams);
router.get('/my-exams', examController.getInstructorCourseExams);
router.get('/exams/:examId', examController.getExamById);
router.put('/exams/:examId', examController.updateExam);
router.delete('/exams/:examId', examController.deleteExam);

/* --- Dashboard and Workload Routes --- */
router.get('/dashboard', getMainPageData);

router.get('/workloads/pending', listPending);
router.post('/workloads/:id/approve', approve);
router.post('/workloads/:id/reject', reject);
router.get('/workloads/totals', totals);

module.exports = router;