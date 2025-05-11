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
  async deleteStudentsByCSV(req, res) {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const filePath = req.file.path;
    console.log(`Processing CSV for deletion: ${req.file.originalname}`);
    
    const studentIdsToDelete = [];
    const errors = [];
    let deletedCount = 0;
    let failedCount = 0;
    let recordsInCSV = 0;

    try {
      const stream = fs.createReadStream(filePath)
        .pipe(csv({
          mapHeaders: ({ header }) => header.trim().toLowerCase(), // Normalize headers
          skipEmptyLines: true,
        }))
        .on("data", (data) => {
          recordsInCSV++;
          // Try to find studentId, ID, or the first column if no header matches
          let studentId = null;
          if (data['studentid']) {
            studentId = data['studentid'];
          } else if (data['id']) {
            studentId = data['id'];
          } else {
            const firstColumnKey = Object.keys(data)[0];
            if (firstColumnKey) {
              studentId = data[firstColumnKey];
            }
          }

          if (studentId && studentId.trim() !== '') {
            studentIdsToDelete.push(studentId.trim());
          } else {
            console.warn("Skipping row with no discernible student ID:", data);
            // Optionally count this as a "failed" or "skipped" record for reporting
          }
        })
        .on("end", async () => {
          try { // New try-block for async operations post-stream
            fs.unlinkSync(filePath); // Remove the temporary file
            
            console.log(`Parsed ${studentIdsToDelete.length} student IDs from CSV for deletion out of ${recordsInCSV} records.`);

            if (studentIdsToDelete.length === 0 && recordsInCSV > 0) {
               return res.status(200).json({ // Or 400 if no valid IDs is an error
                success: true, // Or false, depending on desired behavior
                message: "No valid student IDs found in the uploaded CSV file to process for deletion.",
                studentsDeleted: 0,
                studentsFailed: recordsInCSV, // All records failed to provide an ID
                totalRecordsInCSV: recordsInCSV,
                errors: [{ record: 'all', error: 'No valid student IDs found in CSV columns (expected header: studentid or id, or data in the first column).'}]
              });
            }
             if (studentIdsToDelete.length === 0 && recordsInCSV === 0) {
               return res.status(400).json({
                success: false,
                message: "The uploaded CSV file is empty or contains no processable data.",
              });
            }


            for (const studentIdValue of studentIdsToDelete) {
              try {
                const student = await studentService.findStudentByStudentId(studentIdValue);
                if (student) {
                  await studentService.deleteStudent(student.id); // student.id is the primary key
                  deletedCount++;
                } else {
                  errors.push({ studentId: studentIdValue, error: "Student not found" });
                  failedCount++;
                }
              } catch (error) {
                errors.push({ studentId: studentIdValue, error: error.message });
                failedCount++;
                console.error(`Error deleting student with ID ${studentIdValue}:`, error);
              }
            }
            
            res.status(200).json({ 
              success: true,
              message: `Deletion process finished. ${deletedCount} students deleted, ${failedCount} failed.`,
              studentsDeleted: deletedCount,
              studentsFailed: failedCount,
              totalRecordsProcessed: studentIdsToDelete.length, // Number of IDs attempted
              errors: errors.length > 0 ? errors : undefined
            });
          } catch (processingError) {
            console.error("Error during post-stream processing in deleteStudentsByCSV:", processingError);
            // filePath might have been deleted, or might not.
            // The outer catch will handle generic server errors if headers not sent.
            if (!res.headersSent) {
                 res.status(500).json({
                    success: false,
                    message: "An error occurred after reading the CSV file.",
                    error: processingError.message
                });
            }
          }
        })
        .on("error", (streamError) => { // Stream parsing error
          console.error("Error parsing CSV for deletion:", streamError);
          fs.unlink(filePath, (unlinkErr) => { // Attempt to clean up
            if (unlinkErr) console.error("Error unlinking file on stream error:", unlinkErr);
          });
          if (!res.headersSent) {
            res.status(400).json({
              success: false,
              message: "Failed to parse CSV file for deletion",
              error: streamError.message
            });
          }
        });
    } catch (error) { // Outer catch for errors before stream processing starts or unhandled by stream
      console.error("Error in deleteStudentsByCSV controller:", error);
      if (req.file && req.file.path) {
        // Ensure temp file is deleted if an error occurs early
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error("Error unlinking file on outer catch:", unlinkErr);
        });
      }
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false,
          message: "Failed to process student deletion by CSV", 
          error: error.message 
        });
      }
    }
  }
}

module.exports = new StudentController();