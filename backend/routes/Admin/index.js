// routes/Admin/index.js
const express = require('express');
const router = express.Router();

// Import all admin routes
const userRoutes = require('./userRoutes');
const classroomRoutes = require('./classroomRoutes');
const instructorRoutes = require('./instructorRoutes');
const offeringRoutes = require('./offeringRoutes');
const courseRoutes = require('./courseRoutes'); // Add the new course routes

// Register routes
router.use('/users', userRoutes);
router.use('/classrooms', classroomRoutes);
router.use('/instructors', instructorRoutes);
router.use('/offerings', offeringRoutes);
router.use('/courses', courseRoutes); // Register the course routes

module.exports = router;