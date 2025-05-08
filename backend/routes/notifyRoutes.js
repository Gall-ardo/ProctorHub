const express     = require('express');
const router      = express.Router();
const { authenticateToken} = require('../middleware/authMiddleware');
const notifCtrl   = require('../controllers/notifyController');

router.get('/', authenticateToken, notifCtrl.getMine);

module.exports = router;