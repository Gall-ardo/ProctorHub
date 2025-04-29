// backend/routes/auth.js
const express     = require('express');
const { login, forgotPassword, doResetPassword }   = require('../controllers/authController');
const router      = express.Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', doResetPassword);

module.exports = router;