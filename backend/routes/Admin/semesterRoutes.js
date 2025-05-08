// routes/Admin/semesterRoutes.js
const express = require('express');
const router = express.Router();
const semesterController = require('../../controllers/Admin/semesterController');
const multer = require('multer');
const path = require('path');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (path.extname(file.originalname).toLowerCase() !== '.csv') {
      return cb(new Error('Only CSV files are allowed'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Make sure uploads directory exists
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Routes
router.post("/", semesterController.createSemester);
router.get("/:id", semesterController.getSemester);
router.get("/", semesterController.findAllSemesters);
router.delete("/:id", semesterController.deleteSemester);

// File upload routes
router.post("/:id/offerings/upload", upload.single("file"), semesterController.uploadOfferings);
router.post("/:id/students/upload", upload.single("file"), semesterController.uploadStudents);
router.post("/:id/tas/upload", upload.single("file"), semesterController.uploadTeachingAssistants);

module.exports = router;