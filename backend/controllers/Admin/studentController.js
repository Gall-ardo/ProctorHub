// controllers/Admin/studentController.js
const studentService = require('../../services/Admin/studentService');
const fs = require('fs');
const csv = require('csv-parser');

class StudentController {
  async createStudent(req, res) {
    try {
      // Log request data for debugging
      console.log('Create student request:', JSON.stringify(req.body, null, 2));
      
      // Validate required fields
      const { studentId, nameSurname, email, department } = req.body;
      if (!studentId || !nameSurname || !email || !department) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
          error: "Please provide studentId, nameSurname, email, and department"
        });
      }
      
      // Create student
      const student = await studentService.createStudent(req.body);
      
      // Format response with courses
      const courseCodes = student.enrolledCourses ? 
        student.enrolledCourses.map(course => course.courseCode) : [];
      
      console.log('Student created successfully:', student.id);
      res.status(201).json({
        success: true,
        message: 'Student created successfully.',
        data: {
          id: student.id,
          studentId: student.studentId,
          nameSurname: student.nameSurname,
          email: student.email,
          department: student.department,
          courses: courseCodes
        }
      });
    } catch (error) {
      console.error("Error creating student:", error);
      
      // Provide more descriptive error messages based on error type
      let statusCode = 400;
      let errorMessage = error.message;
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        errorMessage = 'A student with this ID or email already exists';
      } else if (error.name === 'SequelizeValidationError') {
        errorMessage = error.errors.map(e => e.message).join(', ');
      } else if (error.message.includes('Missing required')) {
        errorMessage = error.message;
      }
      
      res.status(statusCode).json({ 
        success: false,
        message: "Failed to create student", 
        error: errorMessage
      });
    }
  }

  async getStudent(req, res) {
    try {
      const student = await studentService.findStudentById(req.params.id);
      
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found"
        });
      }
      
      // Format courses as an array of course codes
      const courseCodes = student.enrolledCourses ? 
        student.enrolledCourses.map(course => course.courseCode) : [];
      
      res.status(200).json({
        success: true,
        data: {
          id: student.id,
          studentId: student.studentId,
          nameSurname: student.nameSurname,
          email: student.email,
          department: student.department,
          courses: courseCodes
        }
      });
    } catch (error) {
      console.error("Error getting student:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to get student", 
        error: error.message 
      });
    }
  }

  async findStudents(req, res) {
    try {
      console.log('Find students request, query:', req.query);
      
      const students = await studentService.findStudents(req.query);
      
      // Format response to include courses as an array of course codes
      const formattedStudents = students.map(student => {
        const courseCodes = student.enrolledCourses ? 
          student.enrolledCourses.map(course => course.courseCode) : [];
        
        return {
          id: student.id,
          studentId: student.studentId,
          nameSurname: student.nameSurname,
          email: student.email,
          department: student.department,
          courses: courseCodes
        };
      });
      
      res.status(200).json({
        success: true,
        count: formattedStudents.length,
        data: formattedStudents
      });
    } catch (error) {
      console.error("Error finding students:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to find students", 
        error: error.message 
      });
    }
  }

  async updateStudent(req, res) {
    try {
      console.log(`Update student request for ID ${req.params.id}:`, JSON.stringify(req.body, null, 2));
      
      // Check if student exists
      const student = await studentService.findStudentById(req.params.id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
          error: "The requested student does not exist"
        });
      }
      
      const updatedStudent = await studentService.updateStudent(req.params.id, req.body);
      
      // Format courses as an array of course codes
      const courseCodes = updatedStudent.enrolledCourses ? 
        updatedStudent.enrolledCourses.map(course => course.courseCode) : [];
      
      res.status(200).json({
        success: true,
        message: 'Student updated successfully',
        data: {
          id: updatedStudent.id,
          studentId: updatedStudent.studentId,
          nameSurname: updatedStudent.nameSurname,
          email: updatedStudent.email,
          department: updatedStudent.department,
          courses: courseCodes
        }
      });
    } catch (error) {
      console.error("Error updating student:", error);
      
      let statusCode = 400;
      let errorMessage = error.message;
      
      if (error.message.includes('not found')) {
        statusCode = 404;
      } else if (error.name === 'SequelizeUniqueConstraintError') {
        errorMessage = 'A student with this ID or email already exists';
      }
      
      res.status(statusCode).json({ 
        success: false,
        message: "Failed to update student", 
        error: errorMessage 
      });
    }
  }

  // The rest of the controller remains the same
  async deleteStudent(req, res) {
    try {
      console.log(`Delete student request for ID ${req.params.id}`);
      
      // Check if student exists
      const student = await studentService.findStudentById(req.params.id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
          error: "The requested student does not exist"
        });
      }
      
      await studentService.deleteStudent(req.params.id);
      
      res.status(200).json({
        success: true,
        message: "Student deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting student:", error);
      
      let statusCode = 400;
      let errorMessage = "Failed to delete student";
      
      if (error.message.includes('not found')) {
        statusCode = 404;
        errorMessage = "Student not found";
      } else if (error.name === 'SequelizeForeignKeyConstraintError') {
        statusCode = 409; // Conflict
        errorMessage = "Cannot delete student because they are referenced in other tables.";
      }
      
      res.status(statusCode).json({ 
        success: false,
        message: errorMessage, 
        error: error.message
      });
    }
  }

  async uploadStudents(req, res) {
    // This method remains the same
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      console.log(`Processing uploaded file: ${req.file.originalname}`);
      
      const results = [];
      const filePath = req.file.path;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => {
          // Transform column names to match expected format if needed
          const transformedData = {};
          
          // Map CSV columns to student fields
          Object.keys(data).forEach(key => {
            // Convert column headers to expected property names
            const lowerKey = key.toLowerCase().trim();
            
            if (lowerKey === 'id' || lowerKey === 'studentid') {
              transformedData.studentId = data[key];
            } else if (lowerKey === 'name' || lowerKey === 'namesurname' || lowerKey === 'fullname') {
              transformedData.nameSurname = data[key];
            } else if (lowerKey === 'email' || lowerKey === 'mail') {
              transformedData.email = data[key];
            } else if (lowerKey === 'department' || lowerKey === 'dept') {
              transformedData.department = data[key];
            } else if (lowerKey === 'courses') {
              transformedData.courses = data[key].split(',').map(course => course.trim());
            }
          });
          
          // Only add non-empty records
          if (transformedData.studentId && transformedData.nameSurname && transformedData.email) {
            results.push(transformedData);
          }
        })
        .on("end", async () => {
          // Remove the temporary file
          fs.unlinkSync(filePath);
          
          console.log(`Parsed ${results.length} students from CSV`);

          // Process and create students
          const uploadResult = await studentService.bulkCreateStudents(results);
          
          res.status(201).json({ 
            success: true,
            message: `${uploadResult.success} students created successfully, ${uploadResult.failed} failed.`,
            studentsCreated: uploadResult.success,
            studentsFailed: uploadResult.failed,
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
      console.error("Error uploading students:", error);
      res.status(400).json({ 
        success: false,
        message: "Failed to upload students", 
        error: error.message 
      });
    }
  }
}

module.exports = new StudentController();