// routes/Admin/index.js
const express = require('express');
const router = express.Router();
const offeringRoutes = require('./offeringRoutes');
const instructorRoutes = require('./instructorRoutes');
const userRoutes = require('./userRoutes');

// Use offering routes
router.use('/offerings', offeringRoutes);

// Use instructor routes
router.use('/instructors', instructorRoutes);

// Use user routes
router.use('/users', userRoutes);

module.exports = router;