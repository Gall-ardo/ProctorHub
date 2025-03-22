const express = require('express');
const router = express.Router();

router.get('/upcoming', (req, res) => {
  // Fetch upcoming exams from DB
  res.json([
    { course: 'CS202 Midterm', date: '16.03.2025', time: '13:00–16:00' }
  ]);
});

module.exports = router;