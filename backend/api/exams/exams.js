const express = require('express');
const router = express.Router();

// Yunus: We should add proctors of the exam and other informations related after the implementation of database. I do not add for now as we will need to change it after database implementation.
router.get('/upcoming', (req, res) => {
  res.json([
    {
      course: 'CS202 Midterm',
      date: '16.03.2025',
      time: '13:00-16:00',
      duration: '2 hours',
      classrooms: ['B201','B202']
    },
  ]);
});

module.exports = router;