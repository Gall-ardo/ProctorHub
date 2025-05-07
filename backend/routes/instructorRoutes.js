const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const examController = require('../controllers/instructor/examController');
const instructorController = require('../controllers/instructor/instructorController');

// Test route without authentication
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Instructor routes are working properly!' });
});

// Apply authentication middleware to all protected instructor routes
router.use(authenticateToken);

// Apply role-based authorization - only instructors can access these routes
router.use(authorizeRole(['instructor']));

// Course routes
router.get('/courses', instructorController.getAllCourses);
router.get('/my-courses', instructorController.getInstructorCourses);

// Exam routes
router.post('/exams', examController.createExam);
router.get('/exams', examController.getInstructorExams);
router.get('/my-exams', examController.getInstructorCourseExams);
router.get('/exams/:examId', examController.getExamById);
router.put('/exams/:examId', examController.updateExam);
router.delete('/exams/:examId', examController.deleteExam);

module.exports = router;