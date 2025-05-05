const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const { getMainPageData } = require('../controllers/Instructor/MainPageController');

router.get(
  '/dashboard',
  authenticateToken,
  authorizeRole(['instructor']),
  getMainPageData
);

module.exports = router;