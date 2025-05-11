const express = require('express');
const router = express.Router();
const studentController = require('../../controllers/Admin/studentController');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Ensure fs is required if not already

// Set up multer for file uploads (ensure this section is present and configured)
const UPLOADS_DIR = 'uploads/';
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
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

// Routes
router.post("/", studentController.createStudent);
router.get("/:id", studentController.getStudent);
router.get("/", studentController.findStudents);
router.put("/:id", studentController.updateStudent);
router.delete("/:id", studentController.deleteStudent);
router.post("/upload", upload.single("file"), studentController.uploadStudents);

router.post("/delete-by-csv", upload.single("file"), studentController.deleteStudentsByCSV);

module.exports = router;