const express     = require('express');
const router      = express.Router();
const { authenticateToken} = require('../middleware/authMiddleware');
const notifCtrl   = require('../controllers/notifyController');

router.get('/', authenticateToken, notifCtrl.getMine);
router.put('/mark-read-all', authenticateToken, notifCtrl.markAllRead);

module.exports = router;