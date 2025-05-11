// controllers/Dean/deanHomePageController.js
const { getAllExams, getAllSwaps } = require('../../services/Dean/deanHomePageService');

// controllers/Dean/deanHomePageController.js
exports.getHomePageData = async (req, res) => {
  try {
    // Fetch all exams
    const exams = await getAllExams();
    // Fetch all swaps
    const swaps = await getAllSwaps();

    return res.json({
      exams,
      swaps: {
        proctorSwaps: swaps.proctorSwaps,
        taSwaps: swaps.taSwaps
      }
    });
  } catch (err) {
    console.error('Error fetching Dean homepage data:', err);
    // Log the full error for debugging purposes
    console.error(err.stack);
    return res.status(500).json({
      message: 'Error fetching dean homepage data',
      detail: err.message || err.original?.sqlMessage || 'Unknown error'
    });
  }
};

