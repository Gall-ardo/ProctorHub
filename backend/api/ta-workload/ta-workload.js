const express = require('express');
const router = express.Router();

// GET /api/taworkload/entered
router.get('/entered', (req, res) => {
  // Mock data for TA Entered Workloads
  const entered = [
    {
      id: 1,
      taName: 'Sude Ergün',
      hours: 8,
      date: '12.03.2025'
    },
    {
      id: 2,
      taName: 'Rıdvan Yılmaz',
      hours: 7,
      date: '14.03.2025'
    },
    {
      id: 3,
      taName: 'Ziya Özgül',
      hours: 12,
      date: '15.03.2025'
    }
  ];
  res.json(entered);
});

// GET /api/taworkload/total
router.get('/total', (req, res) => {
  // Mock data for TA Total Workloads
  const total = [
    {
      id: 1,
      taName: 'Rıdvan Yılmaz',
      approvedHours: 14,
      waitingHours: 2,
      lastUpdate: '12.03.2025'
    },
    {
      id: 2,
      taName: 'Ziya Özgül',
      approvedHours: 37,
      waitingHours: 5,
      lastUpdate: '13.03.2025'
    },
    {
      id: 3,
      taName: 'Sude Ergün',
      approvedHours: 8,
      waitingHours: 2,
      lastUpdate: '15.03.2025'
    }
  ];
  res.json(total);
});

module.exports = router;