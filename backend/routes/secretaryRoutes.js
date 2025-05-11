const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const secretaryController = require('../controllers/Secretary/workloadApproveController');

// Get all pending workload requests (for secretary)
router.get(
  '/workloads/pending',
  authenticateToken,
  authorizeRole(['secretary']),
  secretaryController.listPending
);

// Approve a specific workload request
router.post(
  '/workloads/:id/approve',
  authenticateToken,
  authorizeRole(['secretary']),
  secretaryController.approve
);

// Reject a specific workload request (must include { reason })
router.post(
  '/workloads/:id/reject',
  authenticateToken,
  authorizeRole(['secretary']),
  secretaryController.reject
);

// Get summary totals for TAs
router.get(
  '/workloads/totals',
  authenticateToken,
  authorizeRole(['secretary']),
  secretaryController.totals
);

module.exports = router;