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

exports.getMainPageData = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const today = new Date();

    // 1) Fetch the instructor and their courses
    const inst = await Instructor.findByPk(instructorId, {
      include: [{
        model: Course,
        as: 'courses',
        attributes: ['id']
      }]
    });
    if (!inst) {
      return res.status(404).json({ upcomingExams: [], latestSwaps: [] });
    }
    const courseIds = (inst.courses || []).map(c => c.id);

    // 2) Upcoming Exams
    const exams = await Exam.findAll({
        where: { 
          courseId: { [Op.in]: courseIds },
          date: { [Op.gte]: today },
        },
        include: [
        {
          model: Classroom,
          as: 'examRooms',
          through: { attributes: [] },
          attributes: ['name']
        }
        ],
        order: [
          ['date', 'ASC'],
        ]
      });

    const upcomingExams = exams.map(e => ({
    course:     e.courseName,             // or e.courseId if you prefer
    date:       e.date?.toISOString().split('T')[0] || 'N/A',
    time:       `${e.duration} min`,      // no startTime/endTime here
    duration:   e.duration,
    classrooms: (e.examRooms || []).map(r => r.name)
    }));

    // 3) Latest Swaps
    const swaps = await SwapRequest.findAll({
      where: { examId: { [Op.in]: exams.map(e => e.id) } },
      include: [
        {
          model: TeachingAssistant,
          as: 'requester',
          include: [{ model: User, as: 'taUser', attributes: ['name'] }]
        },
        {
          model: TeachingAssistant,
          as: 'recipient',
          include: [{ model: User, as: 'taUser', attributes: ['name'] }]
        },
        {
          model: Exam,
          include: [{
            model: Classroom,
            as: 'examRooms',
            through: { attributes: [] },
            attributes: ['name']
          }]
        }
      ],
      order: [['createdAt','DESC']],
      limit: 10
    });

    const latestSwaps = swaps.map(s => ({
      from:       s.requester?.taUser?.name    || 'Unknown',
      to:         s.recipient?.taUser?.name    || 'Unknown',
      swapInfo:   s.reason || s.swapInfo || '',
      date:       s.Exam?.date
                    ? s.Exam.date.toISOString().split('T')[0]
                    : 'N/A',
      time:       `${s.Exam?.startTime || ''} – ${s.Exam?.endTime || ''}`,
      duration:   s.Exam?.duration,
      classrooms: (s.Exam?.examRooms || []).map(r => r.name)
    }));

    return res.json({ upcomingExams, latestSwaps });
  } catch (err) {
    console.error('❌ Error in getMainPageData:', err, err.original);
    return res.status(500).json({
      message: 'Error fetching instructor dashboard',
      detail:  err.original?.sqlMessage || err.message
    });
  }
};