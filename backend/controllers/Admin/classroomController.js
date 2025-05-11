const classroomService = require('../../services/Admin/classroomService');

class ClassroomController {
  async createClassroom(req, res) {
    try {
      const classroom = await classroomService.createClassroom(req.body);
      res.status(201).json({
        success: true,
        message: 'Classroom created successfully',
        data: classroom
      });
    } catch (error) {
      console.error("Error creating classroom:", error);
      res.status(400).json({
        success: false,
        message: 'Error creating classroom',
        error: error.message
      });
    }
  }

  async getAllClassrooms(req, res) {
    try {
      const classrooms = await classroomService.getAllClassrooms();
      res.status(200).json({
        success: true,
        data: classrooms
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error fetching classrooms',
        error: error.message
      });
    }
  }

  async getClassroomById(req, res) {
    try {
      const classroom = await classroomService.getClassroomById(req.params.id);
      if (!classroom) {
        return res.status(404).json({
          success: false,
          message: 'Classroom not found'
        });
      }
      res.status(200).json({
        success: true,
        data: classroom
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error fetching classroom',
        error: error.message
      });
    }
  }

  async updateClassroom(req, res) {
    try {
      const classroom = await classroomService.updateClassroom(req.params.id, req.body);
      if (!classroom) {
        return res.status(404).json({
          success: false,
          message: 'Classroom not found'
        });
      }
      res.status(200).json({
        success: true,
        message: 'Classroom updated successfully',
        data: classroom
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error updating classroom',
        error: error.message
      });
    }
  }

  async deleteClassroom(req, res) {
    try {
      const result = await classroomService.deleteClassroom(req.params.id);
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Classroom not found'
        });
      }
      res.status(200).json({
        success: true,
        message: 'Classroom deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error deleting classroom',
        error: error.message
      });
    }
  }

  async uploadClassrooms(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Delegate file processing to service
      const result = await classroomService.processClassroomFile(req.file);

      res.status(200).json({
        success: true,
        message: 'Classrooms imported successfully',
        data: result
      });
    } catch (error) {
      console.error("Error processing classroom file:", error);
      res.status(400).json({
        success: false,
        message: 'Error processing classroom file',
        error: error.message
      });
    }
  }

  /**
   * POST /admin/classrooms/delete-upload
   * Body: multipart/form-data with field "file" = CSV
   */
  async uploadDeleteClassrooms(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const result = await classroomService.processDeleteClassroomFile(req.file);

      res.status(200).json({
        success: true,
        message: 'Bulk delete completed',
        data: result
      });
    } catch (error) {
      console.error("Error processing delete CSV:", error);
      res.status(400).json({
        success: false,
        message: 'Error processing delete CSV',
        error: error.message
      });
    }
  }


  async findClassrooms(req, res) {
    try {
      const classrooms = await classroomService.findClassrooms(req.query);
      res.status(200).json({
        success: true,
        data: classrooms
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to find classrooms',
        error: error.message
      });
    }
  }
}

module.exports = new ClassroomController();