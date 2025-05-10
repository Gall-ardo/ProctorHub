// routes/Admin/classroomRoutes.js
const express = require('express');
const router = express.Router();
const classroomController = require('../../controllers/Admin/classroomController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Ensure uploads folder exists ---
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// --- Configure Multer for CSV upload ---
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

// --- Classroom Routes ---
router.post('/', classroomController.createClassroom);
router.get('/', classroomController.getAllClassrooms);
router.get('/search', classroomController.findClassrooms);
router.get('/:id', classroomController.getClassroomById);
router.put('/:id', classroomController.updateClassroom);
router.delete('/:id', classroomController.deleteClassroom);
router.post('/upload', upload.single('file'), classroomController.uploadClassrooms);

module.exports = router;
