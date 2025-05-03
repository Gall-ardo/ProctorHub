// controllers/Admin/fetchingController.js
const semesterFetchingService = require('../../services/Admin/semesterFetchingService');
const userFetchingService = require('../../services/Admin/userFetchingService');
const courseAssociationService = require('../../services/Admin/courseAssociationService');

class FetchingController {


    async getAllSemesters(req, res) {
        try {
        const semesters = await semesterFetchingService.getAllSemesters();
        
        res.status(200).json({
            success: true,
            data: semesters
        });
        } catch (error) {
        console.error("Error getting semesters:", error);
        // Return an empty array instead of an error to prevent frontend crashes
        res.status(200).json({ 
            success: true,
            data: [],
            message: "Failed to get semesters, using empty list" 
        });
        }
    }
  
  // Update the getUsers function
  async getUsers(req, res) {
    try {
      const users = await userFetchingService.getUsers(req.query);
      
      // Ensure we always return an array
      res.status(200).json(users || []);
    } catch (error) {
      console.error("Error getting users:", error);
      // Return empty array to prevent frontend crashes
      res.status(200).json([]);
    }
  }

  async getActiveSemester(req, res) {
    try {
      const semester = await semesterFetchingService.getActiveSemester();
      
      if (!semester) {
        return res.status(404).json({
          success: false,
          message: "No active semester found"
        });
      }
      
      res.status(200).json({
        success: true,
        data: semester
      });
    } catch (error) {
      console.error("Error getting active semester:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to get active semester", 
        error: error.message 
      });
    }
  }

  // Course association controllers
  async getCourseInstructors(req, res) {
    try {
      const courseId = req.params.id;
      const instructors = await courseAssociationService.getCourseInstructors(courseId);
      
      res.status(200).json({
        success: true,
        data: instructors
      });
    } catch (error) {
      console.error("Error getting course instructors:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to get course instructors", 
        error: error.message 
      });
    }
  }

  async addInstructorToCourse(req, res) {
    try {
      const courseId = req.params.id;
      const { instructorId } = req.body;
      
      if (!instructorId) {
        return res.status(400).json({
          success: false,
          message: "Instructor ID is required"
        });
      }
      
      await courseAssociationService.addInstructorToCourse(courseId, instructorId);
      
      res.status(200).json({
        success: true,
        message: "Instructor added to course successfully"
      });
    } catch (error) {
      console.error("Error adding instructor to course:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to add instructor to course", 
        error: error.message 
      });
    }
  }

  async getCourseTeachingAssistants(req, res) {
    try {
      const courseId = req.params.id;
      const tas = await courseAssociationService.getCourseTeachingAssistants(courseId);
      
      res.status(200).json({
        success: true,
        data: tas
      });
    } catch (error) {
      console.error("Error getting course teaching assistants:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to get course teaching assistants", 
        error: error.message 
      });
    }
  }

  async addTeachingAssistantToCourse(req, res) {
    try {
      const courseId = req.params.id;
      const { taId } = req.body;
      
      if (!taId) {
        return res.status(400).json({
          success: false,
          message: "Teaching Assistant ID is required"
        });
      }
      
      await courseAssociationService.addTeachingAssistantToCourse(courseId, taId);
      
      res.status(200).json({
        success: true,
        message: "Teaching Assistant added to course successfully"
      });
    } catch (error) {
      console.error("Error adding teaching assistant to course:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to add teaching assistant to course", 
        error: error.message 
      });
    }
  }

  async updateCourseAssociations(req, res) {
    try {
      const courseId = req.params.id;
      const { instructorIds, taIds } = req.body;
      
      await courseAssociationService.updateCourseAssociations(courseId, instructorIds, taIds);
      
      res.status(200).json({
        success: true,
        message: "Course associations updated successfully"
      });
    } catch (error) {
      console.error("Error updating course associations:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to update course associations", 
        error: error.message 
      });
    }
  }
}

module.exports = new FetchingController();