// routes/Admin/courseRoutes.js
const express = require('express');
const router = express.Router();
const courseController = require('../../controllers/Admin/courseController');
const authMiddleware = require('../../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// CSV file filter
const csvFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || 
      file.originalname.endsWith('.csv') || 
      file.mimetype === 'application/vnd.ms-excel') { // Added for broader CSV compatibility
    cb(null, true);
  } else {
    cb(new Error('Please upload only CSV files.'), false);
  }
};

// Configure upload
const upload = multer({
  storage: storage,
  fileFilter: csvFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Apply authentication middleware to all routes
// The issue is here - check how authMiddleware is exported
// Fix: Check the structure of your authMiddleware
if (typeof authMiddleware === 'function') {
  router.use(authMiddleware);
} else if (authMiddleware && typeof authMiddleware.authMiddleware === 'function') {
  router.use(authMiddleware.authMiddleware);
  
  // If isAdmin is a function in the authMiddleware object
  if (typeof authMiddleware.isAdmin === 'function') {
    // Apply isAdmin only to routes that require admin privileges,
    // or if all routes under /admin/courses require admin, apply it here.
    // For now, assuming all these course routes are admin-protected.
    router.use(authMiddleware.isAdmin); 
  }
} else {
  console.warn("Warning: authMiddleware is not properly configured for course routes. Access might be unrestricted.");
  // Continue without auth middleware for debugging or if auth is handled differently
}

// Create a new course
router.post('/', courseController.createCourse);

// Import courses from CSV
// Verify that courseController.importCoursesFromCSV is defined
if (courseController.importCoursesFromCSV) {
  router.post('/import', upload.single('file'), courseController.importCoursesFromCSV);
} else {
  console.error("Error: courseController.importCoursesFromCSV is undefined. CSV import for adding courses will not work.");
  // Provide a fallback route that returns an error message
  router.post('/import', upload.single('file'), (req, res) => {
    res.status(500).json({
      success: false,
      message: "CSV import function (for adding) is not available. Please check server implementation."
    });
  });
}

if (courseController.deleteCoursesFromCSV) {
  router.post('/delete-by-csv', upload.single('file'), courseController.deleteCoursesFromCSV);
} else {
  console.error("Error: courseController.deleteCoursesFromCSV is undefined. CSV deletion will not work.");
  // Provide a fallback route that returns an error message
  router.post('/delete-by-csv', upload.single('file'), (req, res) => {
    res.status(500).json({
      success: false,
      message: "CSV deletion function is not available. Please check server implementation."
    });
  });
}
// === END OF NEW ROUTE ===

// Get all courses with optional filters
router.get('/', courseController.getAllCourses);

// Search courses
router.get('/search', courseController.searchCourses);

// Get a course by course code
// This should come before the generic /:id GET route if courseCode can be numeric
// or indistinguishable from an ID, though typically course codes are alphanumeric.
router.get('/code/:courseCode', courseController.getCourseByCode);

// Get a course by ID
// This route is more generic, so specific GET routes like /search or /code/:courseCode should be defined before it.
router.get('/:id', courseController.getCourse);

// Update a course
router.put('/:id', courseController.updateCourse);

// Delete a course
router.delete('/:id', courseController.deleteCourse);

router.get('/:id/instructors', courseController.getInstructors);

// Get teaching assistants for a course
router.get('/:id/teaching-assistants', courseController.getTeachingAssistants);

module.exports = router;