const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const { getMainPageData } = require('../controllers/Instructor/MainPageController');
const {listPending, approve, reject, totals} = require('../controllers/Instructor/InstructorWorkloadController');
const examController = require('../controllers/Instructor/examController');
const instructorController = require('../controllers/Instructor/instructorController');

// Test route without authentication
router.get(
    '/test',
    (req, res) => {
      res.json({ success: true, message: 'Instructor routes are working properly!' });
    }
);

// Dashboard route
router.get(
    '/dashboard',
    authenticateToken,
    authorizeRole(['instructor']),
    getMainPageData
);

// Workload routes
router.get(
    '/workloads/pending',
    authenticateToken,
    authorizeRole(['instructor']),
    listPending
);

router.post(
    '/workloads/:id/approve',
    authenticateToken,
    authorizeRole(['instructor']),
    approve
);

router.post(
    '/workloads/:id/reject',
    authenticateToken,
    authorizeRole(['instructor']),
    reject
);

router.get(
    '/workloads/totals',
    authenticateToken,
    authorizeRole(['instructor']),
    totals
);

// Course routes
router.get(
    '/courses',
    authenticateToken,
    authorizeRole(['instructor']),
    instructorController.getAllCourses
);

router.get(
    '/my-courses',
    authenticateToken,
    authorizeRole(['instructor']),
    instructorController.getInstructorCourses
);

// Exam routes
router.post(
    '/exams',
    authenticateToken,
    authorizeRole(['instructor']),
    examController.createExam
);

router.get(
    '/exams',
    authenticateToken,
    authorizeRole(['instructor']),
    examController.getInstructorExams
);

router.get(
    '/my-exams',
    authenticateToken,
    authorizeRole(['instructor']),
    examController.getInstructorCourseExams
);

router.get(
    '/exams/:examId',
    authenticateToken,
    authorizeRole(['instructor']),
    examController.getExamById
);

router.put(
    '/exams/:examId',
    authenticateToken,
    authorizeRole(['instructor']),
    examController.updateExam
);

router.delete(
    '/exams/:examId',
    authenticateToken,
    authorizeRole(['instructor']),
    examController.deleteExam
);

module.exports = router;