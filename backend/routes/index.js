// routes/index.js
const express = require('express');
const router = express.Router();
const adminRoutes = require('./Admin');
const taRoutes = require('./taRoutes');

// Use admin routes
router.use('/admin', adminRoutes);
router.use('/ta', taRoutes);
// Add more route categories here as needed

module.exports = router;