// backend/routes/deanRoutes.js
const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/Dean/leaveRequestController');

router.get(
  '/leave-requests/pending',
  authenticateToken,
  authorizeRole(['dean']),
  ctrl.getPending
);

router.get(
  '/leave-requests/current',
  authenticateToken,
  authorizeRole(['dean']),
  ctrl.getCurrent
);

router.post(
  '/leave-requests/:id/approve',
  authenticateToken,
  authorizeRole(['dean']),
  ctrl.approve
);

router.post(
  '/leave-requests/:id/reject',
  authenticateToken,
  authorizeRole(['dean']),
  ctrl.reject
);

router.get(
  '/leave-requests/:id/file',
    authenticateToken,
    authorizeRole(['dean']),
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