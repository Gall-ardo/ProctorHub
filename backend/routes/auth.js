// backend/routes/auth.js
const express     = require('express');
const { login, forgotPassword, doResetPassword, changePassword }   = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware').authenticateToken;
const router      = express.Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', doResetPassword);
router.post('/change-password', authenticateToken, changePassword);

module.exports = router;