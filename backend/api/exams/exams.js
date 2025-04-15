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
      classrooms: ['B201', 'B202']
    },
    {
      course: 'CS342 Final',
      date: '18.03.2025',
      time: '10:00-13:00',
      duration: '2 hours',
      classrooms: ['C101', 'C102']
    },
    {
      course: 'ENG101 Midterm',
      date: '20.03.2025',
      time: '09:00-11:00',
      duration: '1.5 hours',
      classrooms: ['D201']
    },
    {
      course: 'MATH301 Quiz',
      date: '22.03.2025',
      time: '14:00-15:30',
      duration: '1.5 hours',
      classrooms: ['E301']
    },
    {
      course: 'BIO110 Lab Exam',
      date: '24.03.2025',
      time: '12:00-14:00',
      duration: '2 hours',
      classrooms: ['Lab1']
    },
    {
      course: 'PHYS210 Final',
      date: '26.03.2025',
      time: '08:00-10:00',
      duration: '1.5 hours',
      classrooms: ['F101', 'F102']
    },
    {
      course: 'CHEM101 Midterm',
      date: '28.03.2025',
      time: '11:00-13:00',
      duration: '2 hours',
      classrooms: ['G201']
    },
    {
      course: 'HIST220 Final',
      date: '30.03.2025',
      time: '15:00-17:00',
      duration: '2 hours',
      classrooms: ['H101', 'H102']
    },
    {
      course: 'PSY101 Quiz',
      date: '31.03.2025',
      time: '10:00-11:00',
      duration: '1 hour',
      classrooms: ['I101']
    },
    {
      course: 'ECON101 Midterm',
      date: '01.04.2025',
      time: '09:30-11:30',
      duration: '2 hours',
      classrooms: ['J201', 'J202']
    }
  ]);
});


module.exports = router;