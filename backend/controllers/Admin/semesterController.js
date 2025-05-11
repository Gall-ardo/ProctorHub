// controllers/Admin/semesterController.js
const semesterService = require('../../services/Admin/semesterService');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Import models
const Semester = require('../../models/Semester');
const Course = require('../../models/Course');
const Offering = require('../../models/Offering');
const TimeSlot = require('../../models/TimeSlot');
const Instructor = require('../../models/Instructor');
const TeachingAssistant = require('../../models/TeachingAssistant');
const User = require('../../models/User');
const { v4: uuidv4 } = require('uuid');

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

    // Debug log to see the actual CSV content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    console.log("CSV Content:", fileContent);

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        // Debug log to see what data we're getting
        console.log("CSV Row:", data);
        
        // Transform column names to match expected format if needed
        const transformedData = {};
        
        // Map CSV columns to student enrollment fields - case insensitive
        Object.keys(data).forEach(key => {
          // Convert column headers to expected property names
          const lowerKey = key.toLowerCase().trim();
          
          if (lowerKey === 'id' || lowerKey === 'studentid' || lowerKey === 'student_id') {
            transformedData.studentId = data[key];
          } else if (lowerKey === 'offering' || lowerKey === 'offeringid' || lowerKey === 'offering_id') {
            transformedData.offeringId = data[key];
          }
        });
        
        // Special case: If we have data but no mapped fields, try to use the original keys
        if (Object.keys(transformedData).length === 0) {
          Object.keys(data).forEach(key => {
            // Try all possible variations of the key
            if (key.toLowerCase().includes('student') || key.toLowerCase().includes('id') && Object.keys(transformedData).length < 1) {
              transformedData.studentId = data[key];
            } else if (key.toLowerCase().includes('offer') || key.toLowerCase().includes('course')) {
              transformedData.offeringId = data[key];
            }
          });
        }
        
        // Handle case where the CSV might only have two columns
        if (Object.keys(data).length === 2 && Object.keys(transformedData).length === 0) {
          const keys = Object.keys(data);
          transformedData.studentId = data[keys[0]];
          transformedData.offeringId = data[keys[1]];
        }
        
        // Only add non-empty records
        if (transformedData.studentId && transformedData.offeringId) {
          results.push(transformedData);
          console.log(`Mapped Student Enrollment: ${transformedData.studentId} -> ${transformedData.offeringId}`);
        } else {
          console.warn("Skipping invalid student row:", data);
        }
      })
      .on("end", async () => {
        try {
          // Remove the temporary file
          fs.unlinkSync(filePath);
          
          console.log(`Parsed ${results.length} student enrollments from CSV`);

          if (results.length === 0) {
            return res.status(400).json({
              success: false,
              message: "No valid student enrollments found in the CSV file. Please check the column headers (should be studentId,offeringId)"
            });
          }

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
        } catch (error) {
          console.error("Error processing student enrollments:", error);
          res.status(500).json({
            success: false,
            message: "Failed to process student enrollments",
            error: error.message
          });
        }
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


// Fixed uploadTeachingAssistants method for semesterController.js
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

    // Debug log to see the actual CSV content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    console.log("CSV Content:", fileContent);

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        // Debug log to see what data we're getting
        console.log("CSV Row:", data);
        
        // Transform column names to match expected format if needed
        const transformedData = {};
        
        // Map CSV columns to TA assignment fields - case insensitive
        Object.keys(data).forEach(key => {
          // Convert column headers to expected property names
          const lowerKey = key.toLowerCase().trim();
          
          if (lowerKey === 'id' || lowerKey === 'taid' || lowerKey === 'ta_id' || lowerKey === 'ta' || lowerKey === 'taid') {
            transformedData.taId = data[key];
          } else if (lowerKey === 'offering' || lowerKey === 'offeringid' || lowerKey === 'offering_id' || lowerKey === 'offeringid') {
            transformedData.offeringId = data[key];
          }
        });
        
        // Special case: If we have data but no mapped fields, try to use the original keys
        if (Object.keys(transformedData).length === 0) {
          Object.keys(data).forEach(key => {
            // Try all possible variations of the key
            if (key.toLowerCase().includes('ta') || key.toLowerCase().includes('id') && Object.keys(transformedData).length < 1) {
              transformedData.taId = data[key];
            } else if (key.toLowerCase().includes('offer') || key.toLowerCase().includes('course')) {
              transformedData.offeringId = data[key];
            }
          });
        }
        
        // Handle case where the CSV might only have two columns
        if (Object.keys(data).length === 2 && Object.keys(transformedData).length === 0) {
          const keys = Object.keys(data);
          transformedData.taId = data[keys[0]];
          transformedData.offeringId = data[keys[1]];
        }
        
        // Only add non-empty records
        if (transformedData.taId && transformedData.offeringId) {
          results.push(transformedData);
          console.log(`Mapped TA Assignment: ${transformedData.taId} -> ${transformedData.offeringId}`);
        } else {
          console.warn("Skipping invalid TA row:", data);
        }
      })
      .on("end", async () => {
        try {
          // Remove the temporary file
          fs.unlinkSync(filePath);
          
          console.log(`Parsed ${results.length} TA assignments from CSV`);

          if (results.length === 0) {
            return res.status(400).json({
              success: false,
              message: "No valid TA assignments found in the CSV file. Please check the column headers (should be taId,offeringId)"
            });
          }

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
        } catch (error) {
          console.error("Error processing TA assignments:", error);
          res.status(500).json({
            success: false,
            message: "Failed to process TA assignments",
            error: error.message
          });
        }
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

  async uploadCourses(req, res) {
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

      console.log(`Processing uploaded courses file for semester ${req.params.id}: ${req.file.originalname}`);
      
      const results = [];
      const filePath = req.file.path;

      // Read the CSV file
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => {
          // Process each row - direct mapping based on our CSV structure
          // Standardize the data format
          const processedData = {};
          
          Object.keys(data).forEach(key => {
            // Keep the original keys but also map to expected case pattern
            processedData[key] = data[key];
            
            // Map some common variants to our expected format
            const lowerKey = key.toLowerCase().trim();
            if (lowerKey === 'code' || lowerKey === 'course_code') {
              processedData.CourseCode = data[key];
            } else if (lowerKey === 'dept' || lowerKey === 'department') {
              processedData.Department = data[key];
            } else if (lowerKey === 'name' || lowerKey === 'course_name') {
              processedData.CourseName = data[key];
            } else if (lowerKey === 'credit' || lowerKey === 'credits') {
              processedData.Credit = data[key];
            } else if (lowerKey === 'grad' || lowerKey === 'is_grad_course') {
              processedData.IsGradCourse = data[key];
            } else if (lowerKey === 'instructor' || lowerKey === 'instructors') {
              processedData.Instructor = data[key];
            } else if (lowerKey === 'description' || lowerKey === 'desc') {
              processedData.Description = data[key];
            }
          });
          
          // Ensure key fields exist
          if (!processedData.CourseCode && data.CourseCode) {
            processedData.CourseCode = data.CourseCode;
          }
          
          if (!processedData.Department && data.Department) {
            processedData.Department = data.Department;
          }
          
          results.push(processedData);
        })
        .on("end", async () => {
          try {
            // Remove the temporary file
            fs.unlinkSync(filePath);
            
            console.log(`Parsed ${results.length} courses from CSV`);

            // Process and create courses
            const uploadResult = await semesterService.createCourses(req.params.id, results);
            
            res.status(201).json({ 
              success: true,
              message: `${uploadResult.success} courses created successfully, ${uploadResult.failed} failed.`,
              coursesCreated: uploadResult.success,
              coursesFailed: uploadResult.failed,
              totalRecords: results.length,
              instructorAssignments: uploadResult.instructorAssignments,
              errors: uploadResult.errors.length > 0 ? uploadResult.errors : undefined
            });
          } catch (error) {
            console.error("Error processing courses:", error);
            res.status(500).json({
              success: false,
              message: "Failed to process courses",
              error: error.message
            });
          }
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
      console.error("Error uploading courses:", error);
      res.status(400).json({ 
        success: false,
        message: "Failed to upload courses", 
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

      const semesterId = req.params.id;

      // Verify the semester exists
      const semester = await Semester.findByPk(semesterId);
      if (!semester) {
        return res.status(404).json({
          success: false,
          message: `Semester with ID ${semesterId} not found`
        });
      }

      console.log(`Processing uploaded offerings file for semester ${semesterId}: ${req.file.originalname}`);
      
      const results = [];
      const filePath = req.file.path;
      
      // Read the CSV file
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => {
          // Process each row - map column headers to expected format
          const processedData = {};
          
          Object.keys(data).forEach(key => {
            // Keep original keys but also standardize format
            processedData[key] = data[key];
            
            // Map column names to expected properties
            const lowerKey = key.toLowerCase().trim();
            if (lowerKey === 'course' || lowerKey === 'course_id') {
              processedData.courseId = data[key];
            } else if (lowerKey === 'section' || lowerKey === 'sectionnumber') {
              processedData.sectionNumber = data[key];
            } else if (lowerKey === 'day' || lowerKey === 'meeting_day') {
              processedData.day = data[key];
            } else if (lowerKey === 'start' || lowerKey === 'starttime') {
              processedData.startTime = data[key];
            } else if (lowerKey === 'end' || lowerKey === 'endtime') {
              processedData.endTime = data[key];
            } else if (lowerKey === 'instructor' || lowerKey === 'instructor_id') {
              processedData.instructorId = data[key];
            } else if (lowerKey === 'room' || lowerKey === 'room_id') {
              processedData.roomId = data[key];
            } else if (lowerKey === 'capacity') {
              processedData.capacity = data[key];
            }
          });
          
          results.push(processedData);
        })
        .on("end", async () => {
          try {
            // Remove the temporary file
            fs.unlinkSync(filePath);
            
            console.log(`Parsed ${results.length} offering rows from CSV`);
    
            // Check if we have valid data
            if (results.length === 0) {
              return res.status(400).json({
                success: false,
                message: "No valid offerings found in the CSV"
              });
            }
    
            // Process and create offerings
            const uploadResult = await semesterService.createOfferings(semesterId, results);
            
            res.status(201).json({ 
              success: true,
              message: `${uploadResult.success} offerings created successfully, ${uploadResult.failed} failed.`,
              offeringsCreated: uploadResult.success,
              offeringsFailed: uploadResult.failed,
              totalRecords: results.length,
              errors: uploadResult.errors.length > 0 ? uploadResult.errors : undefined
            });
          } catch (processError) {
            console.error("Error processing offerings:", processError);
            res.status(500).json({
              success: false,
              message: "Server error while processing offerings",
              error: processError.message
            });
          }
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
      res.status(500).json({ 
        success: false,
        message: "Failed to upload offerings", 
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

  // Unified method for handling multiple file uploads in one request
  async processSemesterUploads(req, res) {
    const semesterId = req.params.id;
    
    try {
      // Step 1: Verify semester exists
      const semester = await Semester.findByPk(semesterId);
      if (!semester) {
        return res.status(404).json({
          success: false,
          message: `Semester with ID ${semesterId} not found`
        });
      }
      
      const results = {
        courses: { success: 0, failed: 0 },
        offerings: { success: 0, failed: 0 },
        students: { success: 0, failed: 0 },
        tas: { success: 0, failed: 0 }
      };
      
      // Step 2: Process courses file if present
      if (req.files && req.files.coursesFile && req.files.coursesFile.length > 0) {
        const courseFile = req.files.coursesFile[0];
        const courseResults = await this.processCoursesCsv(courseFile, semesterId);
        results.courses = courseResults;
      }
      
      // Step 3: Process offerings file if present (after courses)
      if (req.files && req.files.offeringsFile && req.files.offeringsFile.length > 0) {
        const offeringFile = req.files.offeringsFile[0];
        const offeringResults = await this.processOfferingsCsv(offeringFile, semesterId);
        results.offerings = offeringResults;
      }
      
      // Step 4: Process students file if present
      if (req.files && req.files.studentsFile && req.files.studentsFile.length > 0) {
        const studentFile = req.files.studentsFile[0];
        const studentResults = await this.processStudentsCsv(studentFile, semesterId);
        results.students = studentResults;
      }
      
      // Step 5: Process TAs file if present
      if (req.files && req.files.assistantsFile && req.files.assistantsFile.length > 0) {
        const taFile = req.files.assistantsFile[0];
        const taResults = await this.processTAsCsv(taFile, semesterId);
        results.tas = taResults;
      }
      
      // Return combined results
      return res.status(201).json({
        success: true,
        message: "Semester data processed successfully",
        results: results
      });
    } catch (error) {
      console.error("Error processing semester uploads:", error);
      return res.status(500).json({
        success: false,
        message: "Error processing semester uploads",
        error: error.message
      });
    }
  }

  // Helper function to process courses CSV
  async processCoursesCsv(file, semesterId) {
    return new Promise((resolve, reject) => {
      const results = [];
      const filePath = file.path;
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => {
          const processedData = {};
          
          Object.keys(data).forEach(key => {
            // Keep the original keys but also map to expected case pattern
            processedData[key] = data[key];
            
            // Map some common variants to our expected format
            const lowerKey = key.toLowerCase().trim();
            if (lowerKey === 'code' || lowerKey === 'course_code') {
              processedData.CourseCode = data[key];
            } else if (lowerKey === 'dept' || lowerKey === 'department') {
              processedData.Department = data[key];
            } else if (lowerKey === 'name' || lowerKey === 'course_name') {
              processedData.CourseName = data[key];
            } else if (lowerKey === 'credit' || lowerKey === 'credits') {
              processedData.Credit = data[key];
            } else if (lowerKey === 'grad' || lowerKey === 'is_grad_course') {
              processedData.IsGradCourse = data[key];
            } else if (lowerKey === 'instructor' || lowerKey === 'instructors') {
              processedData.Instructor = data[key];
            } else if (lowerKey === 'description' || lowerKey === 'desc') {
              processedData.Description = data[key];
            }
          });
          
          results.push(processedData);
        })
        .on("end", async () => {
          try {
            // Remove the temporary file
            fs.unlinkSync(filePath);
            console.log(`Parsed ${results.length} courses from CSV`);
            
            // Process and create courses
            const uploadResult = await semesterService.createCourses(semesterId, results);
            resolve({
              success: uploadResult.success,
              failed: uploadResult.failed,
              courseIds: uploadResult.createdCourses ? uploadResult.createdCourses.map(course => course.id) : [],
              instructorAssignments: uploadResult.instructorAssignments || []
            });
          } catch (error) {
            console.error("Error processing courses CSV:", error);
            reject(error);
          }
        })
        .on("error", (error) => {
          console.error("Error parsing courses CSV:", error);
          reject(error);
        });
    });
  }

  // Helper function to process offerings CSV
  async processOfferingsCsv(file, semesterId) {
    return new Promise((resolve, reject) => {
      const results = [];
      const filePath = file.path;
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => {
          const processedData = {};
          
          Object.keys(data).forEach(key => {
            // Keep original keys but also standardize format
            processedData[key] = data[key];
            
            // Map column names to expected properties
            const lowerKey = key.toLowerCase().trim();
            if (lowerKey === 'course' || lowerKey === 'course_id' || lowerKey === 'courseid') {
              processedData.courseId = data[key];
            } else if (lowerKey === 'section' || lowerKey === 'sectionnumber' || lowerKey === 'section_number') {
              processedData.sectionNumber = data[key];
            } else if (lowerKey === 'day' || lowerKey === 'meeting_day') {
              processedData.day = data[key];
            } else if (lowerKey === 'start' || lowerKey === 'starttime' || lowerKey === 'start_time') {
              processedData.startTime = data[key];
            } else if (lowerKey === 'end' || lowerKey === 'endtime' || lowerKey === 'end_time') {
              processedData.endTime = data[key];
            } else if (lowerKey === 'instructor' || lowerKey === 'instructor_id' || lowerKey === 'instructorid') {
              processedData.instructorId = data[key];
            } else if (lowerKey === 'room' || lowerKey === 'room_id' || lowerKey === 'roomid') {
              processedData.roomId = data[key];
            } else if (lowerKey === 'capacity') {
              processedData.capacity = data[key];
            }
          });
          
          results.push(processedData);
        })
        .on("end", async () => {
          try {
            // Remove the temporary file
            fs.unlinkSync(filePath);
            console.log(`Parsed ${results.length} offering rows from CSV`);
            
            if (results.length === 0) {
              resolve({
                success: 0,
                failed: 0,
                message: "No offerings found in CSV"
              });
              return;
            }
            
            // Process and create offerings
            const uploadResult = await semesterService.createOfferings(semesterId, results);
            resolve({
              success: uploadResult.success,
              failed: uploadResult.failed,
              offeringIds: uploadResult.createdOfferings ? uploadResult.createdOfferings.map(offering => offering.id) : []
            });
          } catch (error) {
            console.error("Error processing offerings CSV:", error);
            reject(error);
          }
        })
        .on("error", (error) => {
          console.error("Error parsing offerings CSV:", error);
          reject(error);
        });
    });
  }

// Helper function to process students CSV
async processStudentsCsv(file, semesterId) {
  return new Promise((resolve, reject) => {
    const results = [];
    const filePath = file.path;
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        const transformedData = {};
        
        // Map CSV columns to student enrollment fields
        Object.keys(data).forEach(key => {
          // Convert column headers to expected property names
          const lowerKey = key.toLowerCase().trim();
          
          if (lowerKey === 'id' || lowerKey === 'studentid' || lowerKey === 'student_id') {
            transformedData.studentId = data[key];
          } else if (lowerKey === 'offering' || lowerKey === 'offeringid' || lowerKey === 'offering_id') {
            transformedData.offeringId = data[key];
          }
        });
        
        // Handle case where the CSV might only have two columns
        if (Object.keys(data).length === 2 && Object.keys(transformedData).length === 0) {
          const keys = Object.keys(data);
          transformedData.studentId = data[keys[0]];
          transformedData.offeringId = data[keys[1]];
        }
        
        // Only add non-empty records
        if (transformedData.studentId && transformedData.offeringId) {
          results.push(transformedData);
        }
      })
      .on("end", async () => {
        try {
          // Remove the temporary file
          fs.unlinkSync(filePath);
          console.log(`Parsed ${results.length} student enrollments from CSV`);
          
          if (results.length === 0) {
            resolve({
              success: 0,
              failed: 0,
              message: "No valid student enrollments found in CSV"
            });
            return;
          }
          
          // Process and create student enrollments
          const uploadResult = await semesterService.enrollStudents(semesterId, results);
          resolve({
            success: uploadResult.success,
            failed: uploadResult.failed,
            errors: uploadResult.errors
          });
        } catch (error) {
          console.error("Error processing student enrollments CSV:", error);
          reject(error);
        }
      })
      .on("error", (error) => {
        console.error("Error parsing students CSV:", error);
        reject(error);
      });
  });
}

  // Helper function to process TAs CSV
  async processTAsCsv(file, semesterId) {
    return new Promise((resolve, reject) => {
      const results = [];
      const filePath = file.path;
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => {
          const transformedData = {};
          
          // Map CSV columns to TA assignment fields
          Object.keys(data).forEach(key => {
            // Convert column headers to expected property names
            const lowerKey = key.toLowerCase().trim();
            
            if (lowerKey === 'id' || lowerKey === 'taid' || lowerKey === 'ta_id') {
              transformedData.taId = data[key];
            } else if (lowerKey === 'courseid' || lowerKey === 'course_id' || lowerKey === 'course') {
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
          try {
            // Remove the temporary file
            fs.unlinkSync(filePath);
            console.log(`Parsed ${results.length} TA assignments from CSV`);
            
            // Process and create TA assignments
            const uploadResult = await semesterService.assignTeachingAssistants(semesterId, results);
            resolve({
              success: uploadResult.success,
              failed: uploadResult.failed,
              errors: uploadResult.errors
            });
          } catch (error) {
            console.error("Error processing TA assignments CSV:", error);
            reject(error);
          }
        })
        .on("error", (error) => {
          console.error("Error parsing TAs CSV:", error);
          reject(error);
        });
    });
  }
}

module.exports = new SemesterController();