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
      time: '13:00-16:00',
      duration: '2 hours',
      classrooms: ['B201', 'B202']
    },
    {
      from: 'A. Kuzgun',
      to: 'M. Demir',
      swapInfo: 'CS342 Final',
      date: '18.03.2025',
      time: '10:00-13:00',
      duration: '2 hours',
      classrooms: ['C101', 'C102']
    },
    {
      from: 'S. Yılmaz',
      to: 'P. Koc',
      swapInfo: 'ENG101 Midterm',
      date: '20.03.2025',
      time: '09:00-11:00',
      duration: '1.5 hours',
      classrooms: ['D201']
    },
    {
      from: 'Z. Özgül',
      to: 'C. Demir',
      swapInfo: 'MATH301 Quiz',
      date: '22.03.2025',
      time: '14:00-15:30',
      duration: '1.5 hours',
      classrooms: ['E301']
    },
    {
      from: 'M. Yılmaz',
      to: 'H. Aksoy',
      swapInfo: 'BIO110 Lab Exam',
      date: '24.03.2025',
      time: '12:00-14:00',
      duration: '2 hours',
      classrooms: ['Lab1']
    },
    {
      from: 'P. Koc',
      to: 'S. Yılmaz',
      swapInfo: 'PHYS210 Final',
      date: '26.03.2025',
      time: '08:00-10:00',
      duration: '1.5 hours',
      classrooms: ['F101', 'F102']
    },
    {
      from: 'K. Demir',
      to: 'N. Yıldız',
      swapInfo: 'CHEM101 Midterm',
      date: '28.03.2025',
      time: '11:00-13:00',
      duration: '2 hours',
      classrooms: ['G201']
    },
    {
      from: 'L. Özgül',
      to: 'R. Kara',
      swapInfo: 'HIST220 Final',
      date: '30.03.2025',
      time: '15:00-17:00',
      duration: '2 hours',
      classrooms: ['H101', 'H102']
    },
    {
      from: 'F. Kara',
      to: 'Y. Elnouby',
      swapInfo: 'PSY101 Quiz',
      date: '31.03.2025',
      time: '10:00-11:00',
      duration: '1 hour',
      classrooms: ['I101']
    },
    {
      from: 'T. Öz',
      to: 'R. Yılmaz',
      swapInfo: 'ECON101 Midterm',
      date: '01.04.2025',
      time: '09:30-11:30',
      duration: '2 hours',
      classrooms: ['J201', 'J202']
    }
  ]);
});

module.exports = router;