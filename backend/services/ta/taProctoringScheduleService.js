// services/ta/taProctoringScheduleService.js
const Proctoring = require('../../models/Proctoring');
const Exam = require('../../models/Exam');
const Course = require('../../models/Course');
const Classroom = require('../../models/Classroom');

const taProctoringScheduleService = {
  getProctoringScheduleByTaId: async (taId) => {
    try {
      // Get all accepted proctorings for this TA
      const proctorings = await Proctoring.findAll({
        where: { 
          taId,
          status: 'ACCEPTED' 
        },
        include: [{
          model: Exam,
          as: 'exam',
          attributes: ['id', 'examType', 'date', 'duration'],
          include: [
            {
              model: Course,
              attributes: ['courseCode', 'courseName']
            },
            {
              model: Classroom,
              as: 'examRooms',
              attributes: ['name']
            }
          ]
        }],
        order: [['assignmentDate', 'DESC']]
      });
      
      // Format the proctorings for the weekly schedule
      const scheduleEvents = proctorings.map(proctoring => {
    const exam = proctoring.exam;
    
    // Calculate start and end times (in hours) from the exam date and duration
    const examDate = new Date(exam.date);
    const startHour = examDate.getHours() + (examDate.getMinutes() / 60);
    const endHour = startHour + (exam.duration / 60); // duration is in minutes, convert to hours
    
    // Format date as DD/MM/YYYY for the frontend
    const day = String(examDate.getDate()).padStart(2, '0');
    const month = String(examDate.getMonth() + 1).padStart(2, '0');
    const year = examDate.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    
    // Create rooms string
    const roomNames = exam.examRooms ? exam.examRooms.map(room => room.name).join(', ') : '';
    
    return {
        id: proctoring.id,
        title: `${exam.Course ? exam.Course.courseCode : 'Unknown'} - Proctoring`,
        description: `${exam.examType} - ${roomNames}`,
        examDate: formattedDate,
        startTime: startHour,
        endTime: endHour,
        color: 'red', // Use red for proctoring events
        isExam: true
    };
    });
    
    return {
    success: true,
    data: scheduleEvents
    };
    } catch (error) {
      console.error('Error fetching TA proctoring schedule:', error);
      return {
        success: false,
        message: 'Failed to fetch proctoring schedule'
      };
    }
  },
  
  // Future method for getting TA course schedule
  getTACourseSchedule: async (taId) => {
    // This will be implemented later to get the TA's course hours
    // For now, returning an empty array
    return {
      success: true,
      data: []
    };
  },
  
  // Get combined schedule (both proctorings and courses)
  getCombinedScheduleByTaId: async (taId) => {
    try {
      // Get proctoring schedule
      const proctoringResult = await taProctoringScheduleService.getProctoringScheduleByTaId(taId);
      
      if (!proctoringResult.success) {
        return proctoringResult;
      }
      
      // Get course schedule (to be implemented later)
      const courseResult = await taProctoringScheduleService.getTACourseSchedule(taId);
      
      if (!courseResult.success) {
        return courseResult;
      }
      
      // Combine both schedules
      const combinedSchedule = [
        ...proctoringResult.data,
        ...courseResult.data
      ];
      
      return {
        success: true,
        data: combinedSchedule
      };
    } catch (error) {
      console.error('Error fetching combined TA schedule:', error);
      return {
        success: false,
        message: 'Failed to fetch combined schedule'
      };
    }
  }
};

module.exports = taProctoringScheduleService;