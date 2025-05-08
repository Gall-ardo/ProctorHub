// routes/index.js
const express = require('express');
const router = express.Router();
const adminRoutes = require('./Admin');
const taRoutes = require('./taRoutes');
const instructorRoutes = require('./instructorRoutes');
const deanRoutes = require('./deanRoutes');
const notifyRoutes = require('./notifyRoutes'); // Import notification routes
const departmentChairRoutes = require('./departmentChairRoutes'); // Import department chair routes

// Use admin routes
router.use('/admin', adminRoutes);
router.use('/ta', taRoutes);
router.use('/instructor', instructorRoutes);
router.use('/dean', deanRoutes);
router.use('/notifications', notifyRoutes); // Use notification routes
router.use('/chair', departmentChairRoutes); // Use department chair routes
// Add more route categories here as needed

module.exports = router;
