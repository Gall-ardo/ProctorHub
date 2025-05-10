// routes/Admin/timeslotRoutes.js
const express = require('express');
const router = express.Router();
const timeslotController = require('../../controllers/Admin/timeslotController');

// Create timeslots for an offering
router.post('/', timeslotController.createTimeslots);

// Get timeslots by offering ID
router.get('/', timeslotController.getTimeslotsByOffering);

// Update timeslots for an offering
router.put('/', timeslotController.updateTimeslots);

// Delete timeslots by offering ID
router.delete('/', timeslotController.deleteTimeslotsByOffering);

// Get all timeslots
router.get('/all', timeslotController.getAllTimeslots);

module.exports = router;