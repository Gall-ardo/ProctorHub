// routes/index.js
const express = require('express');
const router = express.Router();
const adminRoutes = require('./Admin');
const taRoutes = require('./taRoutes');
const instructorRoutes = require('./instructorRoutes');
const deanRoutes = require('./deanRoutes');

// Use admin routes
router.use('/admin', adminRoutes);
router.use('/ta', taRoutes);
router.use('/instructor', instructorRoutes);
router.use('/dean', deanRoutes);
// Add more route categories here as needed

module.exports = router;
