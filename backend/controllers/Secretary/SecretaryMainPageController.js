const { getUpcomingExams, getLatestSwaps } = require('../../services/Secretary/SecretaryMainPageService');

exports.getMainPageData = async (req, res) => {
  try {
    // Fetch the upcoming exams and latest swaps for the secretary
    const upcomingExams = await getUpcomingExams();
    const latestSwaps = await getLatestSwaps();

    // Send the response with the required data
    return res.json({ upcomingExams, latestSwaps });
  } catch (err) {
    console.error('❌ Error in getMainPageData:', err, err.original);
    return res.status(500).json({
      message: 'Error fetching secretary dashboard',
      detail: err.original?.sqlMessage || err.message
    });
  }
};
