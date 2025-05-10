// routes/Admin/offeringRoutes.js
const express = require('express');
const router = express.Router();
const { offeringController, uploadMiddleware } = require('../../controllers/Admin/offeringController');

// Create a new offering
router.post('/', offeringController.createOffering);

// Get all offerings
router.get('/', offeringController.getAllOfferings);

// Find offerings by course ID and section number
router.get('/find', offeringController.findOfferings);

// Get offering by ID
router.get('/:id', offeringController.getOfferingById);

// Update an offering
router.put('/:id', offeringController.updateOffering);

// Delete an offering
router.delete('/:id', offeringController.deleteOffering);

// Delete offerings by course ID and section number
router.delete('/', offeringController.deleteOfferingsByCourseAndSection);

// Get courses by semester ID
router.get('/courses/semester/:id', offeringController.getCoursesBySemester);

// Upload offerings from CSV
router.post('/upload', uploadMiddleware.single('file'), offeringController.uploadOfferingsFromCSV);

module.exports = router;