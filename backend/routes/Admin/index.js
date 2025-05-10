// routes/Admin/index.js
const express = require('express');
const router = express.Router();

// Import all admin routes
const userRoutes = require('./userRoutes');
const classroomRoutes = require('./classroomRoutes');
const courseRoutes = require('./courseRoutes');
const instructorRoutes = require('./instructorRoutes');
const offeringRoutes = require('./offeringRoutes');
const studentRoutes = require('./studentRoutes');
const fetchingRoutes = require('./fetchingRoutes');
const semesterRoutes = require('./semesterRoutes'); // Add semester routes
const timeslotRoutes = require('./timeslotRoutes'); // Add timeslot routes

// Register routes
router.use('/users', userRoutes);
router.use('/classrooms', classroomRoutes);
router.use('/courses', courseRoutes);
router.use('/instructors', instructorRoutes);
router.use('/offerings', offeringRoutes);
router.use('/students', studentRoutes);
router.use('/fetch', fetchingRoutes);
router.use('/semesters', semesterRoutes); // Register semester routes
router.use('/timeslots', timeslotRoutes); // Register timeslot routes

module.exports = router;