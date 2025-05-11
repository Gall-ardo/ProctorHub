const { Op } = require('sequelize');
const { Exam, SwapRequest, Secretary, User, TeachingAssistant } = require('../../models');

exports.getUpcomingExams = async (secretaryId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // Find the secretary's department
    const secretary = await Secretary.findByPk(secretaryId);
    
    if (!secretary) {
      throw new Error(`Secretary not found with ID: ${secretaryId}`);
    }

    const departmentId = secretary.department;

    // Fetch exams for courses in the same department as the secretary
    const exams = await Exam.findAll({
      where: {
        date: { [Op.gte]: today },
        department: departmentId,  // Filter by department
      },
      order: [['date', 'ASC']]
    });

    return exams.map(exam => ({
      course: exam.courseName,
      date: exam.date?.toISOString().split('T')[0] || 'N/A',
      time: `${exam.duration} min`,
      duration: exam.duration,
      department: exam.department,
    }));
  } catch (error) {
    console.error('Error in getUpcomingExams:', error);
    throw error;
  }
};

exports.getLatestSwaps = async (secretaryId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // Find the secretary's department
    const secretary = await Secretary.findByPk(secretaryId);
    
    if (!secretary) {
      throw new Error(`Secretary not found with ID: ${secretaryId}`);
    }

    const departmentId = secretary.department;

    // Fetch swap requests from the SwapRequest model
    const swapRequests = await SwapRequest.findAll({
      where: {
        status: 'APPROVED',  // Only approved swap requests
        requestDate: { [Op.gte]: today }
      },
      include: [
        {
          model: Exam,
          as: 'exam',
          where: { department: departmentId },  // Ensure swap is related to the secretary's department
          attributes: ['id', 'courseName', 'date']
        }
      ],
      order: [['requestDate', 'DESC']],
      limit: 5
    });

    fromTA = await TeachingAssistant.findAll({
      where: {
        id: { [Op.in]: swapRequests.map(swap => swap.requesterId) }
      },
      include: [
        {
          model: User,
          as: 'taUser',
          attributes: ['name']
        }
      ]
    });

    toTA = await TeachingAssistant.findAll({
      where: {
        id: { [Op.in]: swapRequests.map(swap => swap.targetTaId) }
      },
      include: [
        {
          model: User,
          as: 'taUser',
          attributes: ['name']
        }
      ]
    });

    return swapRequests.map(swap => ({
      id: swap.id,
      type: 'TA Swap Request',
      from: fromTA.find(ta => ta.id === swap.requesterId)?.taUser.name || 'Unknown',
      to: toTA.find(ta => ta.id === swap.targetTaId)?.taUser.name || 'Unknown',
      swapInfo: `TA swap request approved`,
      date: swap.requestDate ? new Date(swap.requestDate).toLocaleDateString() : 'Unknown',
      time: swap.requestDate ? new Date(swap.requestDate).toLocaleTimeString() : '',
      examName: swap.exam?.courseName || 'Unknown Exam',
      examDate: swap.exam?.date ? new Date(swap.exam.date).toLocaleDateString() : 'Unknown'
    }));
  } catch (error) {
    console.error('Error in getLatestSwaps:', error);
    throw error;
  }
};