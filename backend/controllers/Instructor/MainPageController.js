// controllers/InstructorMainPageController.js

const { Op } = require('sequelize');
// adjust this path depending on where this file lives; 
// if controllers/ is a sibling to models/, use '../models'
const {
  Instructor,
  Course,
  Exam,
  Classroom,
  SwapRequest,
  TeachingAssistant,
  User
} = require('../../models');

// controllers/InstructorMainPageController.js
const { getUpcomingExams, getLatestSwaps } = require('../../services/Instructor/InstructorMainPageService');

exports.getMainPageData = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const upcomingExams = await getUpcomingExams(instructorId);
    const latestSwaps = await getLatestSwaps(instructorId);

    return res.json({ upcomingExams, latestSwaps });

  } catch (err) {
    console.error('❌ Error in getMainPageData:', err, err.original);
    return res.status(500).json({
      message: 'Error fetching instructor dashboard',
      detail: err.original?.sqlMessage || err.message
    });
  }
};