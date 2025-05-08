const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const departmentChairController = require('../controllers/DepartmentChair/departmentChairController');

// Test route without authentication
router.get(
    '/test',
    (req, res) => {
        res.json({ 
            success: true, 
            message: 'Department Chair routes are working properly!',
            timestamp: new Date().toISOString(),
            routes: [
                '/profile',
                '/department-courses/:department',
                '/available-tas',
                '/ta-requests',
                '/assign-tas-to-course'
            ]
        });
    }
);

// Profile route to get department chair info
router.get(
    '/profile',
    authenticateToken,
    authorizeRole(['chair']),
    departmentChairController.getChairProfile
);

// Get courses by department
router.get(
    '/department-courses/:department',
    authenticateToken,
    authorizeRole(['chair']),
    departmentChairController.getDepartmentCourses
);

// Get all available TAs
router.get(
    '/available-tas',
    authenticateToken,
    authorizeRole(['chair']),
    departmentChairController.getAvailableTAs
);

// Get all TA requests
router.get(
    '/ta-requests',
    authenticateToken,
    authorizeRole(['chair']),
    departmentChairController.getTARequests
);

// Assign TAs to course
router.post(
    '/assign-tas-to-course',
    authenticateToken,
    authorizeRole(['chair']),
    departmentChairController.assignTAsToCourse
);

// Get TAs assigned to a course
router.get(
    '/course-tas/:id',
    authenticateToken,
    authorizeRole(['chair']),
    departmentChairController.getCourseTAs
);

module.exports = router; 