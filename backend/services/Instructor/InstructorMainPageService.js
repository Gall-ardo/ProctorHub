// services/InstructorMainPageService.js

const { Op } = require('sequelize');
const { Instructor, Course, Exam, Classroom } = require('../../models');

exports.getUpcomingExams = async (instructorId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find exams directly assigned to this instructor
  const directExams = await Exam.findAll({
    where: {
      instructorId: instructorId,
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

  // Also find exams through courses
  const instructor = await Instructor.findByPk(instructorId, {
    include: [{
      model: Course,
      as: 'courses',
      attributes: ['id', 'courseName']
    }]
  });

  const courseIds = instructor?.courses?.map(course => course.id) || [];
  
  const courseExams = await Exam.findAll({
    where: {
      courseId: { [Op.in]: courseIds },
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

  // Combine and deduplicate exams
  const allExams = [...directExams, ...courseExams];
  const uniqueExams = [...new Map(allExams.map(exam => 
    [exam.id, exam])).values()];

  return uniqueExams.map(exam => ({
    course: exam.courseName,
    date: exam.date?.toISOString().split('T')[0] || 'N/A',
    time: `${exam.duration} min`,
    duration: exam.duration,
    classrooms: (exam.examRooms || []).map(room => room.name)
  }));
};

// Add this to services/InstructorMainPageService.js

exports.getLatestSwaps = async (instructorId) => {
  const { Op } = require('sequelize');
  const { Proctoring, TeachingAssistant, User, Exam, SwapRequest } = require('../../models');
  
  // Get exams for this instructor
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const instructorExams = await Exam.findAll({
    where: {
      instructorId: instructorId,
      date: { [Op.gte]: today }
    },
    attributes: ['id', 'courseName', 'date']
  });
  
  const examIds = instructorExams.map(exam => exam.id);
  
  // Fetch instructor-initiated swaps (proctorings with SWAPPED status)
  const instructorSwaps = await Proctoring.findAll({
    where: {
      examId: { [Op.in]: examIds },
      status: 'SWAPPED'
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
    order: [['updatedAt', 'DESC']],
    limit: 5
  });
  
  // Fetch TA-initiated swaps (completed swap requests)
  const taSwaps = await SwapRequest.findAll({
    where: {
      examId: { [Op.in]: examIds },
      status: 'APPROVED'
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
  
  // Combine and format both types of swaps
  const instructorSwapsFormatted = instructorSwaps.map(swap => ({
    id: swap.id,
    type: 'INSTRUCTOR_INITIATED',
    from: swap.teachingAssistant?.taUser?.name || 'Unknown TA',
    to: 'New Proctor (pending)',
    swapInfo: `Instructor removed proctor`,
    date: swap.updatedAt ? new Date(swap.updatedAt).toLocaleDateString() : 'Unknown',
    time: swap.updatedAt ? new Date(swap.updatedAt).toLocaleTimeString() : '',
    examName: swap.exam?.courseName || 'Unknown Exam',
    examDate: swap.exam?.date ? new Date(swap.exam.date).toLocaleDateString() : 'Unknown'
  }));
  
  const taSwapsFormatted = taSwaps.map(swap => ({
    id: swap.id,
    type: 'TA_INITIATED',
    from: swap.requester?.taUser?.name || 'Unknown TA',
    to: swap.targetTa?.taUser?.name || 'Unknown TA',
    swapInfo: `TA swap request accepted`,
    date: swap.requestDate ? new Date(swap.requestDate).toLocaleDateString() : 'Unknown',
    time: swap.requestDate ? new Date(swap.requestDate).toLocaleTimeString() : '',
    examName: swap.exam?.courseName || 'Unknown Exam',
    examDate: swap.exam?.date ? new Date(swap.exam.date).toLocaleDateString() : 'Unknown'
  }));
  
  // Combine, sort by date (newest first), and return top items
  const allSwaps = [...instructorSwapsFormatted, ...taSwapsFormatted]
    .sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time))
    .slice(0, 5);
  
  return allSwaps;
};