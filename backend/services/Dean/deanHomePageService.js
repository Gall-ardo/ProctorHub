// services/Dean/deanHomePageService.js

const { Op } = require('sequelize');
const { Exam, SwapRequest, Proctoring, TeachingAssistant, User, Classroom } = require('../../models');

/*exports.getAllExams = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch all upcoming exams
  const exams = await Exam.findAll({
    where: {
      date: { [Op.gte]: today }
    },
    order: [['date', 'ASC']],
    include: [
      {
        model: SwapRequest,
        as: 'SwapRequests',
        where: {
          status: 'APPROVED',
        },
        include: [
          {
            model: TeachingAssistant,
            as: 'requester',
            include: [{ model: User, as: 'taUser', attributes: ['id', 'name'] }]
          },
          {
            model: TeachingAssistant,
            as: 'targetTa',
            include: [{ model: User, as: 'taUser', attributes: ['id', 'name'] }]
          }
        ]
      }
    ]
  });

  return exams;
};*/

exports.getAllExams = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all exams
  const exams = await Exam.findAll({
    where: {
      date: { [Op.gte]: today }
    },
    include: [
      {
        model: Classroom,
        as: 'examRooms',
        through: { attributes: [] },
        attributes: ['id']
      }
    ],
    order: [['date', 'ASC']]
  });

  return exams.map(exam => ({
    course: exam.courseName,
    date: exam.date?.toISOString().split('T')[0] || 'N/A',
    time: `${exam.duration} min`,
    duration: exam.duration,
    classrooms: (exam.examRooms || []).map(room => room.id)
  }));
};

exports.getAllSwaps = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch all swap requests and proctoring swaps
  const proctorSwaps = await Proctoring.findAll({
    where: {
      status: 'SWAPPED',
      updatedAt: { [Op.gte]: today }
    },
    include: [
      {
        model: TeachingAssistant,
        as: 'teachingAssistant',
        include: [{ model: User, as: 'taUser', attributes: ['id', 'name'] }]
      },
      {
        model: Exam,
        as: 'exam',
        attributes: ['id', 'courseName', 'date']
      }
    ],
    order: [['updatedAt', 'DESC']]
  });

  const taSwaps = await SwapRequest.findAll({
    where: {
      status: 'APPROVED',
      requestDate: { [Op.gte]: today }
    },
    include: [
      {
        model: TeachingAssistant,
        as: 'requester',
        include: [{ model: User, as: 'taUser', attributes: ['id', 'name'] }]
      },
      {
        model: TeachingAssistant,
        as: 'targetTa',
        include: [{ model: User, as: 'taUser', attributes: ['id', 'name'] }]
      },
      {
        model: Exam,
        as: 'exam',
        attributes: ['id', 'courseName', 'date']
      }
    ],
    order: [['requestDate', 'DESC']]
  });

  return { proctorSwaps, taSwaps };
};

