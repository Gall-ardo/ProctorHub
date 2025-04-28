// routes/index.js
const express = require('express');
const router = express.Router();
const adminRoutes = require('./Admin');

// Use admin routes
router.use('/admin', adminRoutes);

// Add more route categories here as needed

module.exports = router;