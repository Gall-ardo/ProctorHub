const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const { getMainPageData } = require('../controllers/Instructor/MainPageController');
const {listPending, approve, reject, totals} = require('../controllers/Instructor/InstructorWorkloadController');
const examController = require('../controllers/Instructor/examController');
const instructorController = require('../controllers/Instructor/instructorController');
const taRequestController = require('../controllers/Instructor/InstructorTARequestController');
const assignTAController = require('../controllers/Instructor/assignTAController');
const { Instructor } = require('../models');
const printController = require('../controllers/instructor/printController');


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

// TA Request Routes
router.get(
    '/available-tas',
    authenticateToken,
    authorizeRole(['instructor']),
    taRequestController.getAvailableTAs
);

// New route for exam-specific TA availability including leave status
router.get(
    '/available-tas-for-exam',
    authenticateToken,
    authorizeRole(['instructor']),
    examController.getAvailableTAsForExam
);

router.get(
    '/instructor-courses',
    authenticateToken,
    authorizeRole(['instructor']),
    taRequestController.getInstructorCourses
);

router.get(
    '/ta-requests',
    authenticateToken,
    authorizeRole(['instructor']),
    taRequestController.getInstructorTARequests
);

router.post(
    '/ta-requests/',
    authenticateToken,
    authorizeRole(['instructor']),
    taRequestController.createTARequest
);

router.delete(
    '/ta-requests/:requestId',
    authenticateToken,
    authorizeRole(['instructor']),
    taRequestController.deleteTARequest
);

// Proctor assignment route
router.post(
    '/exams/assign-proctors',
    authenticateToken,
    authorizeRole(['instructor']),
    examController.assignProctors
);

// Leave check route
router.get(
    '/check-ta-leave',
    authenticateToken,
    authorizeRole(['instructor']),
    examController.checkTALeaveStatus
);

// Exam proctor swap routes
router.post(
    '/exams/:examId/swap-proctor',
    authenticateToken,
    authorizeRole(['instructor']),
    examController.swapProctor
);

router.get(
    '/exams/:examId/swap-history',
    authenticateToken,
    authorizeRole(['instructor']),
    examController.getSwapHistory
);

// Get all classrooms
router.get(
    '/classrooms',
    authenticateToken,
    authorizeRole(['instructor']),
    examController.getAllClassrooms
);

// GET /api/instructor/me
router.get(
    '/me',
    authenticateToken,
    authorizeRole(['instructor']),
    async (req, res) => {
      const inst = await Instructor.findByPk(req.user.id);
      if (!inst) {
        return res.status(404).json({ success:false, message:'Instructor not found' });
      }
      return res.json({
        success: true,
        data: { isTaAssigner: inst.isTaAssigner }
      });
    }
  );

router.post(
    '/assign-tas-to-course',
    authenticateToken,
    authorizeRole(['instructor']),
    assignTAController.assignTAsToCourse
);

router.get(
    '/profile',
    authenticateToken,
    authorizeRole(['instructor']),
    assignTAController.getChairProfile
);

// Get courses by department
router.get(
    '/department-courses/:department',
    authenticateToken,
    authorizeRole(['instructor']),
    assignTAController.getDepartmentCourses
);

// Get all available TAs
router.get(
    '/available-tas',
    authenticateToken,
    authorizeRole(['instructor']),
    assignTAController.getAvailableTAs
);

// Get all TA requests
router.get(
    '/ta-requests',
    authenticateToken,
    authorizeRole(['instructor']),
    assignTAController.getTARequests
);

// Get TAs assigned to a course
router.get(
    '/course-tas/:id',
    authenticateToken,
    authorizeRole(['instructor']),
    assignTAController.getCourseTAs
);

router.get(
  '/exams/:examId/print-students-alphabetically',
  authenticateToken,
  authorizeRole(['instructor']),
  printController.printStudentsAlphabetically
);

// Print students randomly
router.get(
  '/exams/:examId/print-students-randomly',
  authenticateToken,
  authorizeRole(['instructor']),
  printController.printStudentsRandomly
);
module.exports = router;