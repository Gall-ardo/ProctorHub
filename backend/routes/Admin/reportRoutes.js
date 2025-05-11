// routes/admin/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../../controllers/Admin/reportController');

// Get report types
router.get('/types', reportController.getReportTypes);

// Get available years
router.get('/years', reportController.getAvailableYears);

// Get semesters
router.get('/semesters', reportController.getSemesters);

// Get reports with optional filtering
router.get('/', reportController.getReports);

// Generate reports
router.get('/generate/proctoring', reportController.generateProctoringReport);
router.get('/generate/swap', reportController.generateSwapReport);
router.get('/generate/student', reportController.generateStudentListReport);
router.get('/generate/course', reportController.generateCourseListReport);
router.get('/generate/ta', reportController.generateTAReport);
router.get('/generate/workload', reportController.generateWorkloadReport);

// Download a specific report
router.post('/download', reportController.downloadReport);

// Download multiple reports
router.post('/download-multiple', reportController.downloadMultipleReports);

// Get system logs
router.get('/logs', reportController.getSystemLogs);

module.exports = router;
