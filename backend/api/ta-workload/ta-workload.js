const express = require('express');
const router = express.Router();

// GET /api/taworkload/entered
router.get('/entered', (req, res) => {
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
    },
    {
      id: 4,
      taName: 'Mehmet Yıldız',
      hours: 10,
      date: '16.03.2025'
    },
    {
      id: 5,
      taName: 'Elif Aksoy',
      hours: 9,
      date: '17.03.2025'
    },
    {
      id: 6,
      taName: 'Kemal Demir',
      hours: 11,
      date: '18.03.2025'
    },
    {
      id: 7,
      taName: 'Ayşe Yıldız',
      hours: 6,
      date: '19.03.2025'
    },
    {
      id: 8,
      taName: 'Ali Veli',
      hours: 10,
      date: '20.03.2025'
    },
    {
      id: 9,
      taName: 'Fatma Kara',
      hours: 8,
      date: '21.03.2025'
    },
    {
      id: 10,
      taName: 'Ahmet Öz',
      hours: 9,
      date: '22.03.2025'
    }
  ];
  res.json(entered);
});



// GET /api/taworkload/total
router.get('/total', (req, res) => {
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
    },
    {
      id: 4,
      taName: 'Mehmet Yıldız',
      approvedHours: 20,
      waitingHours: 4,
      lastUpdate: '16.03.2025'
    },
    {
      id: 5,
      taName: 'Elif Aksoy',
      approvedHours: 25,
      waitingHours: 3,
      lastUpdate: '17.03.2025'
    },
    {
      id: 6,
      taName: 'Kemal Demir',
      approvedHours: 15,
      waitingHours: 3,
      lastUpdate: '18.03.2025'
    },
    {
      id: 7,
      taName: 'Ayşe Yıldız',
      approvedHours: 18,
      waitingHours: 2,
      lastUpdate: '19.03.2025'
    },
    {
      id: 8,
      taName: 'Ali Veli',
      approvedHours: 22,
      waitingHours: 4,
      lastUpdate: '20.03.2025'
    },
    {
      id: 9,
      taName: 'Fatma Kara',
      approvedHours: 19,
      waitingHours: 2,
      lastUpdate: '21.03.2025'
    },
    {
      id: 10,
      taName: 'Ahmet Öz',
      approvedHours: 21,
      waitingHours: 3,
      lastUpdate: '22.03.2025'
    }
  ];
  res.json(total);
});

module.exports = router;