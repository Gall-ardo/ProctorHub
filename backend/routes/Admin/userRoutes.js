// routes/Admin/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../../controllers/Admin/userController');
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
router.post("/", userController.createUser);
router.get("/:id", userController.getUser);
router.get("/", userController.findUsers);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.delete("/:id/force", userController.forceDeleteUser); 
router.post("/upload", upload.single("file"), userController.uploadUsers);
router.post("/:id/reset-password", userController.resetPassword);

module.exports = router;