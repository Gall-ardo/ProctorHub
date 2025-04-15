const express = require('express');
const router = express.Router();

// backend/api/swaps/swaps.js
router.get('/latest', (req, res) => {
  res.json([
    {
      from: 'Y. Elnouby',
      to: 'S. Ergun',
      swapInfo: 'CS202 Midterm',
      date: '16.03.2025',
      time: '13:00–16:00',
      duration: '2 hours',
      classrooms: ['B201','B202'],
    },
  ]);
});

module.exports = router;