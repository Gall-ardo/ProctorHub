const { Op } = require('sequelize');
const { Exam, SwapRequest, Proctoring, TeachingAssistant, User, Classroom } = require('../../models');

exports.getUpcomingExams = async () => {
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
        attributes: ['name']
      }
    ],
    order: [['date', 'ASC']]
  });

  return exams.map(exam => ({
    course: exam.courseName,
    date: exam.date?.toISOString().split('T')[0] || 'N/A',
    time: `${exam.duration} min`,
    duration: exam.duration,
    classrooms: (exam.examRooms || []).map(room => room.name)
  }));
};

exports.getLatestSwaps = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch swap requests from the SwapRequest model
  const swapRequests = await SwapRequest.findAll({
    where: {
      status: 'APPROVED',  // Only approved swap requests
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
    order: [['requestDate', 'DESC']],
    limit: 5
  });

  // Format the swap data
  return swapRequests.map(swap => ({
    id: swap.id,
    type: 'TA Swap Request',
    from: swap.requester?.taUser?.name || 'Unknown TA',
    to: swap.targetTa?.taUser?.name || 'Unknown TA',
    swapInfo: `TA swap request approved`,
    date: swap.requestDate ? new Date(swap.requestDate).toLocaleDateString() : 'Unknown',
    time: swap.requestDate ? new Date(swap.requestDate).toLocaleTimeString() : '',
    examName: swap.exam?.courseName || 'Unknown Exam',
    examDate: swap.exam?.date ? new Date(swap.exam.date).toLocaleDateString() : 'Unknown'
  }));
};
