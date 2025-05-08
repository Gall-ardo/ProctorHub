const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const { getMainPageData } = require('../controllers/Instructor/MainPageController');
const {listPending, approve, reject, totals} = require('../controllers/Instructor/InstructorWorkloadController');

router.get(
  '/dashboard',
  authenticateToken,
  authorizeRole(['instructor']),
  getMainPageData
);

router.get(
    '/workloads/pending',
    authenticateToken,
    authorizeRole(['instructor']),
    listPending
  );
  
  router.post(
    '/workloads/:id/approve',
    authenticateToken,
    authorizeRole(['instructor']),
    approve
  );
  
  router.post(
    '/workloads/:id/reject',
    authenticateToken,
    authorizeRole(['instructor']),
    reject
  );

  router.get(
    '/workloads/totals',
    authenticateToken,
    authorizeRole(['instructor']),
    totals
  );

module.exports = router;