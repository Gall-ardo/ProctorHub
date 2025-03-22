const express = require('express');
const router = express.Router();

router.get('/latest', (req, res) => {
  // Fetch latest swaps
  res.json([
    { from: 'Y. Elnouby', to: 'S. Ergun', swapInfo: 'CS202 Midterm', date: '16.03.2025', time: '13:00–16:00' }
  ]);
});

module.exports = router;