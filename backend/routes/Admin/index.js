// routes/Admin/index.js (updated)
const express = require('express');
const router = express.Router();
const offeringRoutes = require('./offeringRoutes');
const instructorRoutes = require('./instructorRoutes');
const userRoutes = require('./userRoutes');
const classroomRoutes = require('./classroomRoutes');

// Use offering routes
router.use('/offerings', offeringRoutes);

// Use instructor routes
router.use('/instructors', instructorRoutes);

// Use user routes
router.use('/users', userRoutes);

// Use classroom routes
router.use('/classrooms', classroomRoutes);

module.exports = router;