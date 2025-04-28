// routes/Admin/instructorRoutes.js
const express = require('express');
const router = express.Router();
const instructorController = require('../../controllers/Admin/instructorController');

// Get all instructors
router.get('/', instructorController.getAllInstructors);

// Search instructors
router.get('/search', instructorController.searchInstructors);

// Get instructors by department
router.get('/department/:department', instructorController.getInstructorsByDepartment);

// Get instructor by ID
router.get('/:id', instructorController.getInstructorById);

module.exports = router;