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