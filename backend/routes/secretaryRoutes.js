const express = require('express');
const router = express.Router();
const path = require('path');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const { getMainPageData } = require('../controllers/Secretary/SecretaryMainPageController');
const workloadController = require('../controllers/Secretary/workloadApproveController');
const leaveRequestController = require('../controllers/Secretary/leaveRequestController');
const { Secretary, LeaveRequest } = require('../models');

// Test route without authentication
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Secretary routes are working properly!' });
});

// Add this route for getting secretary profile
router.get(
  '/me',
  authenticateToken,
  authorizeRole(['secretary']),
  async (req, res) => {
    try {
      const secretary = await Secretary.findByPk(req.user.id);
      if (!secretary) {
        return res.status(404).json({ message: 'Secretary profile not found' });
      }
      return res.json({ 
        status: "success", 
        data: secretary 
      });
    } catch (err) {
      console.error('Error fetching secretary profile:', err);
      return res.status(500).json({
        message: 'Error fetching secretary profile',
        detail: err.message
      });
    }
  }
);

// Dashboard route for secretary
router.get(
  '/dashboard',
  authenticateToken,
  authorizeRole(['secretary']),
  getMainPageData
);

// Workload routes
router.get(
  '/workloads/pending',
  authenticateToken,
  authorizeRole(['secretary']),
  workloadController.listPending
);

router.post(
  '/workloads/:id/approve',
  authenticateToken,
  authorizeRole(['secretary']),
  workloadController.approve
);

router.post(
  '/workloads/:id/reject',
  authenticateToken,
  authorizeRole(['secretary']),
  workloadController.reject
);

router.get(
  '/workloads/totals',
  authenticateToken,
  authorizeRole(['secretary']),
  workloadController.totals
);

router.get(
  '/leave-requests/pending',
  authenticateToken,
  authorizeRole(['secretary']),
  leaveRequestController.getPending
);

router.get(
  '/leave-requests/current',
  authenticateToken,
  authorizeRole(['secretary']),
  leaveRequestController.getCurrent
);

router.post(
  '/leave-requests/:id/approve',
  authenticateToken,
  authorizeRole(['secretary']),
  leaveRequestController.approve
);

router.post(
  '/leave-requests/:id/reject',
  authenticateToken,
  authorizeRole(['secretary']),
  leaveRequestController.reject
);

router.get(
  '/leave-requests/:id/file',
  authenticateToken,
  authorizeRole(['secretary']),
  async (req, res) => {
    const lr = await LeaveRequest.findByPk(req.params.id);
    if (!lr) {
      return res.status(404).json({ message: 'No attachment found.' });
    }
    const fullPath = path.resolve(__dirname, '../uploads', lr.filePath);
    return res.download(fullPath, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        return res.status(500).json({ message: 'Error downloading file.' });
      }
    });
  }
);

module.exports = router;