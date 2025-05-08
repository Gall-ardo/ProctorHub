// routes/Admin/studentRoutes.js
const express = require('express');
const router = express.Router();
const studentController = require('../../controllers/Admin/studentController');
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
router.post("/", studentController.createStudent);
router.get("/:id", studentController.getStudent);
router.get("/", studentController.findStudents);
router.put("/:id", studentController.updateStudent);
router.delete("/:id", studentController.deleteStudent);

router.post("/upload", upload.single("file"), studentController.uploadStudents);

module.exports = router;