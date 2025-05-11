const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const workloadController = require('../controllers/Secretary/workloadApproveController');
const leaveRequestController = require('../controllers/Secretary/leaveRequestController');

// Get all pending workload requests (for secretary)
router.get(
  '/workloads/pending',
  authenticateToken,
  authorizeRole(['secretary']),
  workloadController.listPending
);

// Approve a specific workload request
router.post(
  '/workloads/:id/approve',
  authenticateToken,
  authorizeRole(['secretary']),
  workloadController.approve
);

// Reject a specific workload request (must include { reason })
router.post(
  '/workloads/:id/reject',
  authenticateToken,
  authorizeRole(['secretary']),
  workloadController.reject
);

// Get summary totals for TAs
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