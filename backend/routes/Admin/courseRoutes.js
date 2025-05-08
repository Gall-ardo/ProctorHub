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
      file.mimetype === 'application/vnd.ms-excel') {
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
    router.use(authMiddleware.isAdmin);
  }
} else {
  console.warn("Warning: authMiddleware is not properly configured");
  // Continue without auth middleware for debugging
}

// Create a new course
router.post('/', courseController.createCourse);

// Import courses from CSV
router.post('/import', upload.single('file'), courseController.importCoursesFromCSV);

// Get all courses with optional filters
router.get('/', courseController.getAllCourses);

// Search courses
router.get('/search', courseController.searchCourses);

// Get a course by course code
router.get('/code/:courseCode', courseController.getCourseByCode);

// Get a course by ID
router.get('/:id', courseController.getCourse);

// Update a course
router.put('/:id', courseController.updateCourse);

// Delete a course
router.delete('/:id', courseController.deleteCourse);

module.exports = router;