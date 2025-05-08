const taWorkloadService = require('../../services/ta/taWorkloadService');

const taWorkloadController = {
  // Get all workloads for the logged-in TA
  getWorkloads: async (req, res) => {
    try {
      console.log("req.user =", req.user);
      const taId = req.user.id;
      const result = await taWorkloadService.getWorkloadsByTaId(taId);
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getWorkloads controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },
  
  // Get pending workloads for the logged-in TA
  getPendingWorkloads: async (req, res) => {
    try {
      const taId = req.user.id;
      const result = await taWorkloadService.getPendingWorkloadsByTaId(taId);
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getPendingWorkloads controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },
  
  // Get approved workloads for the logged-in TA
  getApprovedWorkloads: async (req, res) => {
    try {
      const taId = req.user.id;
      const result = await taWorkloadService.getApprovedWorkloadsByTaId(taId);
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getApprovedWorkloads controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },
  
  // Get TA's assigned courses (new endpoint)
  getTAAssignedCourses: async (req, res) => {
    try {
      const taId = req.user.id;
      const result = await taWorkloadService.getTAAssignedCourses(taId);
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getTAAssignedCourses controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },
  
  // Get instructors for a specific course (new endpoint)
  getCourseInstructors: async (req, res) => {
    try {
      const { courseId } = req.params;
      if (!courseId) {
        return res.status(400).json({
          success: false,
          message: 'Course ID is required'
        });
      }
      
      const result = await taWorkloadService.getCourseInstructors(courseId);
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getCourseInstructors controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },
  
  // Create a new workload (modified to use instructorId and courseId)
  createWorkload: async (req, res) => {
    try {
      const { instructorId, courseId, date, hours, workloadType } = req.body;
      
      if (!instructorId || !courseId || !date || !workloadType || !hours) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }
      
      const taId = req.user.id;
      const result = await taWorkloadService.createWorkload(
        { instructorId, courseId, date, workloadType, hours },
        taId
      );
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      return res.status(201).json(result);
    } catch (error) {
      console.error('Error in createWorkload controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = taWorkloadController;