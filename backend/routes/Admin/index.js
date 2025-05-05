// routes/Admin/index.js
const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./userRoutes');
const instructorRoutes = require('./instructorRoutes');
const courseRoutes = require('./courseRoutes');
const classroomRoutes = require('./classroomRoutes');
const offeringRoutes = require('./offeringRoutes');
const fetchingRoutes = require('./fetchingRoutes');
const studentRoutes = require('./studentRoutes');

// Apply routes
router.use('/users', userRoutes);
router.use('/instructors', instructorRoutes);
router.use('/courses', courseRoutes);
router.use('/classrooms', classroomRoutes);
router.use('/offerings', offeringRoutes);
router.use('/fetch', fetchingRoutes);
router.use('/students', studentRoutes);

module.exports = router;