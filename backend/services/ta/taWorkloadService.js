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
  
  // Create a new workload request - FIXED to not update totalWorkload immediately
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
      
      // Create a new workload - status starts as unapproved
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
      
      // FIXED: Don't update totalWorkload here - it will be updated when approved
      // Only log the creation of the workload request
      console.log(`Created workload request for TA ${taId}: ${durationHours} hours for ${workloadType}`);
      
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
  },
  
  // NEW: Method to approve a workload (this would be called by an instructor)
  approveWorkload: async (workloadId) => {
    try {
      const workload = await Workload.findByPk(workloadId);
      
      if (!workload) {
        return {
          success: false,
          message: 'Workload not found'
        };
      }
      
      if (workload.isApproved) {
        return {
          success: false,
          message: 'Workload is already approved'
        };
      }
      
      // Update workload status
      await workload.update({ isApproved: true });
      
      // NOW update the TA's total workload
      try {
        const ta = await TeachingAssistant.findByPk(workload.taId);
        if (ta) {
          const additionalHours = workload.duration;
          const totalWorkload = (ta.totalWorkload || 0) + additionalHours;
          await ta.update({ totalWorkload });
          console.log(`Updated TA totalWorkload: ${totalWorkload} (added ${additionalHours} hours)`);
        }
      } catch (error) {
        console.error('Error updating TA total workload:', error);
      }
      
      return {
        success: true,
        data: workload,
        message: 'Workload approved successfully'
      };
    } catch (error) {
      console.error('Error approving workload:', error);
      return {
        success: false,
        message: 'Failed to approve workload'
      };
    }
  },
  
  // NEW: Method to reject a workload (this would be called by an instructor)
  rejectWorkload: async (workloadId, rejectionReason) => {
    try {
      const workload = await Workload.findByPk(workloadId);
      
      if (!workload) {
        return {
          success: false,
          message: 'Workload not found'
        };
      }
      
      if (workload.isApproved) {
        return {
          success: false,
          message: 'Cannot reject an already approved workload'
        };
      }
      
      // Update workload status with rejection reason
      await workload.update({ 
        rejectionReason: rejectionReason || 'Rejected by instructor' 
      });
      
      return {
        success: true,
        data: workload,
        message: 'Workload rejected successfully'
      };
    } catch (error) {
      console.error('Error rejecting workload:', error);
      return {
        success: false,
        message: 'Failed to reject workload'
      };
    }
  }
};

module.exports = taWorkloadService;