const { getUpcomingExams, getLatestSwaps } = require('../../services/Secretary/SecretaryMainPageService');

exports.getMainPageData = async (req, res) => {
  try {
    // Get the secretaryId from the authenticated user
    const secretaryId = req.user.id; // Assuming auth middleware puts user info in req.user
    
    console.log(`Fetching dashboard data for secretary ID: ${secretaryId}`);
    
    // Fetch the upcoming exams and latest swaps for the secretary
    const upcomingExams = await getUpcomingExams(secretaryId);
    const latestSwaps = await getLatestSwaps(secretaryId);

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