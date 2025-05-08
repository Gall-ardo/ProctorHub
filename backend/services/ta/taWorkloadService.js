const Workload = require('../../models/Workload');
const User = require('../../models/User');
const TeachingAssistant = require('../../models/TeachingAssistant');
const Course = require('../../models/Course');
const Instructor = require('../../models/Instructor');
const { v4: uuidv4 } = require('uuid');

// Service for TA workload operations
const taWorkloadService = {
  // Get all workloads for a specific TA
  getWorkloadsByTaId: async (taId) => {
    try {
      const workloads = await Workload.findAll({
        where: { taId },
        include: [{ model: Course, attributes: ['courseId'] }, {
          model: User,
          as: 'instructor',
          attributes: ['name', 'email']
        }],
        order: [['date', 'DESC']] // Sort by date descending
      });
      
      return {
        success: true,
        data: workloads
      };
    } catch (error) {
      console.error('Error fetching TA workloads:', error);
      return {
        success: false,
        message: 'Failed to fetch workloads'
      };
    }
  },

  // Get all waiting/pending workloads for a TA
  getPendingWorkloadsByTaId: async (taId) => {
    try {
      const pendingWorkloads = await Workload.findAll({
        where: { 
          taId,
          isApproved: false,
          rejectionReason: null // Null rejection reason means it's pending
        },
        include: [{ model: Course, attributes: ['courseCode'] }, {
          model: User,
          as: 'instructor',
          attributes: ['email']
        }],
        order: [['date', 'ASC']] // Most immediate dates first
      });
      
      return {
        success: true,
        data: pendingWorkloads
      };
    } catch (error) {
      console.error('Error fetching pending TA workloads:', error);
      return {
        success: false,
        message: 'Failed to fetch pending workloads'
      };
    }
  },

  // Get all approved workloads for a TA
  getApprovedWorkloadsByTaId: async (taId) => {
    try {
      const approvedWorkloads = await Workload.findAll({
        where: { 
          taId,
          isApproved: true
        },
        order: [['date', 'ASC']], // Sort by upcoming dates
        include: [{ model: Course, attributes: ['courseCode'] },
        {
          model: User,
          as: 'instructor',
          attributes: ['email']
        }],
      });
      
      return {
        success: true,
        data: approvedWorkloads
      };
    } catch (error) {
      console.error('Error fetching approved TA workloads:', error);
      return {
        success: false,
        message: 'Failed to fetch approved workloads'
      };
    }
  },
  
  // Get TA's assigned courses (from GivenCourseTAs)
  getTAAssignedCourses: async (taId) => {
    try {
      const ta = await TeachingAssistant.findByPk(taId, {
        include: [
          {
            model: Course,
            as: 'taCourses', // This is the alias defined in the association for GivenCourseTAs
            attributes: ['id', 'courseCode', 'courseName'],
          }
        ]
      });
      
      if (!ta) {
        return {
          success: false,
          message: 'Teaching Assistant not found'
        };
      }
      
      return {
        success: true,
        data: ta.taCourses || []
      };
    } catch (error) {
      console.error('Error fetching TA assigned courses:', error);
      return {
        success: false,
        message: 'Failed to fetch assigned courses'
      };
    }
  },

  // Get instructors for a specific course (from InstructorCourses)
  getCourseInstructors: async (courseId) => {
    try {
      const course = await Course.findByPk(courseId, {
        include: [
          {
            model: Instructor,
            as: 'instructors', // This is the alias defined in the association for InstructorCourses
            include: [
              {
                model: User,
                as: 'instructorUser',
                attributes: ['id', 'name', 'email']
              }
            ]
          }
        ]
      });
      
      if (!course) {
        return {
          success: false,
          message: 'Course not found'
        };
      }
      
      // Format the instructor data to include the user information
      const instructors = course.instructors.map(instructor => ({
        id: instructor.id,
        name: instructor.name,
        email: instructor.instructorUser.email
      }));
      
      return {
        success: true,
        data: instructors
      };
    } catch (error) {
      console.error('Error fetching course instructors:', error);
      return {
        success: false,
        message: 'Failed to fetch course instructors'
      };
    }
  },
  
  // Create a new workload request (modified to use courseId and instructorId directly)
  createWorkload: async (workloadData, taId) => {
    try {
      const { instructorId, courseId, date, hours, workloadType } = workloadData;
      
      // Validate the instructor exists
      const instructor = await User.findOne({
        where: {
          id: instructorId,
          userType: 'instructor'
        }
      });
      
      if (!instructor) {
        return {
          success: false,
          message: 'Instructor not found'
        };
      }
      
      // Validate the course exists
      const course = await Course.findByPk(courseId);
      
      if (!course) {
        return {
          success: false,
          message: 'Course not found'
        };
      }
      
      // Parse hours to ensure it's a number
      const durationHours = parseInt(hours || '0');
      if (!durationHours || durationHours <= 0) {
        return {
          success: false,
          message: 'Workload duration must be a positive number'
        };
      }
      
      // Create a new workload
      const newWorkload = await Workload.create({
        id: uuidv4(),
        courseId: courseId,
        taskType: workloadType,
        date: new Date(date),
        duration: durationHours,
        isApproved: false,
        taId: taId,
        instructorId: instructorId
      });
      
      // Try to update total workload hours for the TA if that data exists
      try {
        const ta = await TeachingAssistant.findByPk(taId);
        if (ta) {
          const additionalHours = durationHours;
          const totalWorkload = (ta.totalWorkload || 0) + additionalHours;
          await ta.update({ totalWorkload });
        }
      } catch (error) {
        console.error('Error updating TA total workload:', error);
        // Continue with the workload creation even if updating total fails
      }
      
      return {
        success: true,
        data: newWorkload,
        message: 'Workload request created successfully'
      };
    } catch (error) {
      console.error('Error creating workload:', error);
      return {
        success: false,
        message: 'Failed to create workload request'
      };
    }
  }
};

module.exports = taWorkloadService;