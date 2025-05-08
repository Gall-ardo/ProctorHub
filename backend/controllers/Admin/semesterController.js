// controllers/Admin/semesterController.js
const semesterService = require('../../services/Admin/semesterService');
const fs = require('fs');
const csv = require('csv-parser');

class SemesterController {
  async createSemester(req, res) {
    try {
      // Log request data for debugging
      console.log('Create semester request:', JSON.stringify(req.body, null, 2));
      
      // Validate required fields
      if (!req.body.year || !req.body.semesterType) {
        return res.status(400).json({
          success: false,
          message: "Year and semester type are required",
          error: "Missing required fields"
        });
      }
      
      // Create semester
      const semester = await semesterService.createSemester(req.body);
      
      console.log('Semester created successfully:', semester.id);
      res.status(201).json({
        success: true,
        message: 'Semester created successfully',
        data: semester
      });
    } catch (error) {
      console.error("Error creating semester:", error);
      
      // Provide more descriptive error messages based on error type
      let statusCode = 400;
      let errorMessage = error.message;
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        errorMessage = 'This semester already exists';
      } else if (error.name === 'SequelizeValidationError') {
        errorMessage = error.errors.map(e => e.message).join(', ');
      }
      
      res.status(statusCode).json({ 
        success: false,
        message: "Failed to create semester", 
        error: errorMessage
      });
    }
  }

  async getSemester(req, res) {
    try {
      const semester = await semesterService.findSemesterById(req.params.id);
      
      if (!semester) {
        return res.status(404).json({
          success: false,
          message: "Semester not found"
        });
      }
      
      res.status(200).json({
        success: true,
        data: semester
      });
    } catch (error) {
      console.error("Error getting semester:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to get semester", 
        error: error.message 
      });
    }
  }

  async findAllSemesters(req, res) {
    try {
      console.log('Find semesters request, query:', req.query);
      
      const semesters = await semesterService.findAllSemesters(req.query);
      
      res.status(200).json({
        success: true,
        data: semesters
      });
    } catch (error) {
      console.error("Error finding semesters:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to find semesters", 
        error: error.message 
      });
    }
  }

  async uploadOfferings(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      if (!req.params.id) {
        return res.status(400).json({
          success: false,
          message: "Semester ID is required"
        });
      }

      console.log(`Processing uploaded offerings file for semester ${req.params.id}: ${req.file.originalname}`);
      
      const results = [];
      const filePath = req.file.path;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => {
          // Transform column names to match expected format if needed
          const transformedData = {};
          
          // Map CSV columns to offering fields
          Object.keys(data).forEach(key => {
            // Convert column headers to expected property names
            const lowerKey = key.toLowerCase().trim();
            
            if (lowerKey === 'id' || lowerKey === 'courseid' || lowerKey === 'course_id') {
              transformedData.courseId = data[key];
            } else if (lowerKey === 'section' || lowerKey === 'sectionid' || lowerKey === 'section_id') {
              transformedData.section = data[key];
            } else if (lowerKey === 'instructor' || lowerKey === 'instructorid' || lowerKey === 'instructor_id') {
              transformedData.instructorId = data[key];
            } else if (lowerKey === 'day') {
              transformedData.day = data[key];
            } else if (lowerKey === 'starttime' || lowerKey === 'start_time') {
              transformedData.startTime = data[key];
            } else if (lowerKey === 'endtime' || lowerKey === 'end_time') {
              transformedData.endTime = data[key];
            } else if (lowerKey === 'room' || lowerKey === 'roomid' || lowerKey === 'room_id') {
              transformedData.roomId = data[key];
            } else if (lowerKey === 'capacity') {
              transformedData.capacity = data[key];
            }
          });
          
          // Only add non-empty records
          if (Object.keys(transformedData).length > 0 && transformedData.courseId) {
            results.push(transformedData);
          }
        })
        .on("end", async () => {
          // Remove the temporary file
          fs.unlinkSync(filePath);
          
          console.log(`Parsed ${results.length} offerings from CSV`);

          // Process and create offerings
          const uploadResult = await semesterService.createOfferings(req.params.id, results);
          
          res.status(201).json({ 
            success: true,
            message: `${uploadResult.success} offerings created successfully, ${uploadResult.failed} failed.`,
            offeringsCreated: uploadResult.success,
            offeringsFailed: uploadResult.failed,
            totalRecords: results.length,
            errors: uploadResult.errors.length > 0 ? uploadResult.errors : undefined
          });
        })
        .on("error", (error) => {
          console.error("Error parsing CSV:", error);
          res.status(400).json({
            success: false,
            message: "Failed to parse CSV file",
            error: error.message
          });
        });
    } catch (error) {
      console.error("Error uploading offerings:", error);
      res.status(400).json({ 
        success: false,
        message: "Failed to upload offerings", 
        error: error.message 
      });
    }
  }

  async uploadStudents(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      if (!req.params.id) {
        return res.status(400).json({
          success: false,
          message: "Semester ID is required"
        });
      }

      console.log(`Processing uploaded students file for semester ${req.params.id}: ${req.file.originalname}`);
      
      const results = [];
      const filePath = req.file.path;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => {
          // Transform column names to match expected format if needed
          const transformedData = {};
          
          // Map CSV columns to student enrollment fields
          Object.keys(data).forEach(key => {
            // Convert column headers to expected property names
            const lowerKey = key.toLowerCase().trim();
            
            if (lowerKey === 'id' || lowerKey === 'studentid' || lowerKey === 'student_id') {
              transformedData.studentId = data[key];
            } else if (lowerKey === 'name' || lowerKey === 'fullname' || lowerKey === 'student_name') {
              transformedData.name = data[key];
            } else if (lowerKey === 'email') {
              transformedData.email = data[key];
            } else if (lowerKey === 'courseid' || lowerKey === 'course_id') {
              transformedData.courseId = data[key];
            } else if (lowerKey === 'section') {
              transformedData.section = data[key];
            }
          });
          
          // Only add non-empty records
          if (Object.keys(transformedData).length > 0 && transformedData.studentId && transformedData.courseId) {
            results.push(transformedData);
          }
        })
        .on("end", async () => {
          // Remove the temporary file
          fs.unlinkSync(filePath);
          
          console.log(`Parsed ${results.length} student enrollments from CSV`);

          // Process and create student enrollments
          const uploadResult = await semesterService.enrollStudents(req.params.id, results);
          
          res.status(201).json({ 
            success: true,
            message: `${uploadResult.success} student enrollments created successfully, ${uploadResult.failed} failed.`,
            enrollmentsCreated: uploadResult.success,
            enrollmentsFailed: uploadResult.failed,
            totalRecords: results.length,
            errors: uploadResult.errors.length > 0 ? uploadResult.errors : undefined
          });
        })
        .on("error", (error) => {
          console.error("Error parsing CSV:", error);
          res.status(400).json({
            success: false,
            message: "Failed to parse CSV file",
            error: error.message
          });
        });
    } catch (error) {
      console.error("Error uploading student enrollments:", error);
      res.status(400).json({ 
        success: false,
        message: "Failed to upload student enrollments", 
        error: error.message 
      });
    }
  }

  async uploadTeachingAssistants(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      if (!req.params.id) {
        return res.status(400).json({
          success: false,
          message: "Semester ID is required"
        });
      }

      console.log(`Processing uploaded TAs file for semester ${req.params.id}: ${req.file.originalname}`);
      
      const results = [];
      const filePath = req.file.path;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => {
          // Transform column names to match expected format if needed
          const transformedData = {};
          
          // Map CSV columns to TA assignment fields
          Object.keys(data).forEach(key => {
            // Convert column headers to expected property names
            const lowerKey = key.toLowerCase().trim();
            
            if (lowerKey === 'id' || lowerKey === 'taid' || lowerKey === 'ta_id') {
              transformedData.taId = data[key];
            } else if (lowerKey === 'courseid' || lowerKey === 'course_id') {
              transformedData.courseId = data[key];
            } else if (lowerKey === 'section') {
              transformedData.section = data[key];
            } else if (lowerKey === 'workload' || lowerKey === 'hours') {
              transformedData.workload = data[key];
            }
          });
          
          // Only add non-empty records
          if (Object.keys(transformedData).length > 0 && transformedData.taId && transformedData.courseId) {
            results.push(transformedData);
          }
        })
        .on("end", async () => {
          // Remove the temporary file
          fs.unlinkSync(filePath);
          
          console.log(`Parsed ${results.length} TA assignments from CSV`);

          // Process and create TA assignments
          const uploadResult = await semesterService.assignTeachingAssistants(req.params.id, results);
          
          res.status(201).json({ 
            success: true,
            message: `${uploadResult.success} TA assignments created successfully, ${uploadResult.failed} failed.`,
            assignmentsCreated: uploadResult.success,
            assignmentsFailed: uploadResult.failed,
            totalRecords: results.length,
            errors: uploadResult.errors.length > 0 ? uploadResult.errors : undefined
          });
        })
        .on("error", (error) => {
          console.error("Error parsing CSV:", error);
          res.status(400).json({
            success: false,
            message: "Failed to parse CSV file",
            error: error.message
          });
        });
    } catch (error) {
      console.error("Error uploading TA assignments:", error);
      res.status(400).json({ 
        success: false,
        message: "Failed to upload TA assignments", 
        error: error.message 
      });
    }
  }

  async deleteSemester(req, res) {
    try {
      console.log(`Delete semester request for ID ${req.params.id}`);
      
      const result = await semesterService.deleteSemester(req.params.id);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Semester not found"
        });
      }
      
      res.status(200).json({
        success: true,
        message: "Semester deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting semester:", error);
      
      let statusCode = 400;
      let errorMessage = "Failed to delete semester";
      
      if (error.message.includes('in use')) {
        statusCode = 409;
        errorMessage = "Cannot delete semester because it is in use. Please remove all associated data first.";
      }
      
      res.status(statusCode).json({ 
        success: false,
        message: errorMessage, 
        error: error.message
      });
    }
  }
}

module.exports = new SemesterController();