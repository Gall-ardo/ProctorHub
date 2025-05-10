// controllers/Admin/courseController.js
const courseService = require('../../services/Admin/courseService');
const fs = require('fs');
const csv = require('csv-parser');
const Instructor = require('../../models/Instructor');
const TeachingAssistant = require('../../models/TeachingAssistant');
const { Op } = require('sequelize');

async function processInstructorsAndTAs(coursesData) {
  const processedData = [];
  
  for (const courseData of coursesData) {
    const processedCourse = { ...courseData };
    
    // Look up instructor IDs by name if names are provided
    if (courseData.instructorNames && courseData.instructorNames.length > 0) {
      try {
        const instructors = await Instructor.findAll({
          include: {
            model: require('../../models/User'),
            as: 'instructorUser',
            where: {
              name: {
                [Op.in]: courseData.instructorNames
              }
            }
          }
        });

        
        console.log(`Found ${instructors.length} instructors for ${courseData.instructorNames.length} instructor names`);
        
        if (instructors.length > 0) {
          processedCourse.instructorIds = instructors.map(instructor => instructor.id);
          console.log(`Mapped instructor names to IDs: ${JSON.stringify(processedCourse.instructorIds)}`);
        } else {
          console.warn(`No instructors found for names: ${JSON.stringify(courseData.instructorNames)}`);
        }
        
        // Remove the instructorNames property since we've processed it
        delete processedCourse.instructorNames;
      } catch (error) {
        console.error("Error looking up instructors by name:", error);
        // Keep the original data without IDs
        delete processedCourse.instructorNames;
      }
    }
    
    // Look up TA IDs by name if names are provided
    if (courseData.taNames && courseData.taNames.length > 0) {
      try {
        const teachingAssistants = await TeachingAssistant.findAll({
          include: {
            model: require('../../models/User'),
            as: 'taUser',
            where: {
              name: {
                [Op.in]: courseData.taNames
              }
            }
          }
        });

        
        console.log(`Found ${teachingAssistants.length} TAs for ${courseData.taNames.length} TA names`);
        
        if (teachingAssistants.length > 0) {
          processedCourse.taIds = teachingAssistants.map(ta => ta.id);
          console.log(`Mapped TA names to IDs: ${JSON.stringify(processedCourse.taIds)}`);
        } else {
          console.warn(`No TAs found for names: ${JSON.stringify(courseData.taNames)}`);
        }
        
        // Remove the taNames property since we've processed it
        delete processedCourse.taNames;
      } catch (error) {
        console.error("Error looking up TAs by name:", error);
        // Keep the original data without IDs
        delete processedCourse.taNames;
      }
    }
    
    processedData.push(processedCourse);
  }
  
  return processedData;
}

class CourseController {
  async createCourse(req, res) {
    try {
      // Log request data for debugging
      console.log('Create course request:', JSON.stringify(req.body, null, 2));
      
      // Validate required fields
      if (!req.body.courseCode || !req.body.department || !req.body.semesterId) {
        return res.status(400).json({
          success: false,
          message: "Course code, department, and semester ID are required",
          error: "Missing required fields"
        });
      }
      
      // Create course
      const course = await courseService.createCourse(req.body);
      
      console.log('Course created successfully:', course.id);
      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: course
      });
    } catch (error) {
      console.error("Error creating course:", error);
      
      // Provide more descriptive error messages based on error type
      let statusCode = 400;
      let errorMessage = error.message;
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        errorMessage = 'A course with this ID or course code already exists';
      } else if (error.name === 'SequelizeValidationError') {
        errorMessage = error.errors.map(e => e.message).join(', ');
      } else if (error.message.includes('Missing required')) {
        errorMessage = error.message;
      }
      
      res.status(statusCode).json({ 
        success: false,
        message: "Failed to create course", 
        error: errorMessage
      });
    }
  }

  async getCourse(req, res) {
    try {
      const course = await courseService.getCourseById(req.params.id);
      
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found"
        });
      }
      
      res.status(200).json({
        success: true,
        data: course
      });
    } catch (error) {
      console.error("Error getting course:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to get course", 
        error: error.message 
      });
    }
  }

  async getCourseByCode(req, res) {
    try {
      const course = await courseService.getCourseByCode(req.params.courseCode);
      
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found"
        });
      }
      
      res.status(200).json({
        success: true,
        data: course
      });
    } catch (error) {
      console.error("Error getting course by code:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to get course", 
        error: error.message 
      });
    }
  }

  async getAllCourses(req, res) {
    try {
      console.log('Get all courses request, query:', req.query);
      
      const filters = {
        department: req.query.department,
        isGradCourse: req.query.isGradCourse === 'true',
        semesterId: req.query.semesterId
      };
      
      // Remove undefined filters
      Object.keys(filters).forEach(key => 
        filters[key] === undefined && delete filters[key]
      );
      
      const courses = await courseService.getAllCourses(filters);
      
      res.status(200).json({
        success: true,
        data: courses
      });
    } catch (error) {
      console.error("Error finding courses:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to find courses", 
        error: error.message 
      });
    }
  }

  async updateCourse(req, res) {
    try {
      console.log(`Update course request for ID ${req.params.id}:`, JSON.stringify(req.body, null, 2));
      
      // First check if the course exists
      const course = await courseService.getCourseById(req.params.id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
          error: "Course not found with the provided ID"
        });
      }
      
      const updatedCourse = await courseService.updateCourse(req.params.id, req.body);
      
      res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        data: updatedCourse
      });
    } catch (error) {
      console.error("Error updating course:", error);
      
      let statusCode = 400;
      if (error.message.includes('not found')) {
        statusCode = 404;
      }
      
      res.status(statusCode).json({ 
        success: false,
        message: "Failed to update course", 
        error: error.message 
      });
    }
  }

  async deleteCourse(req, res) {
    try {
      console.log(`Delete course request for ID ${req.params.id}`);
      
      // First check if the course exists
      const course = await courseService.getCourseById(req.params.id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
          error: "Course not found with the provided ID"
        });
      }
      
      await courseService.deleteCourse(req.params.id);
      
      res.status(200).json({
        success: true,
        message: "Course deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting course:", error);
      
      let statusCode = 400;
      let errorMessage = "Failed to delete course";
      
      if (error.message.includes('not found')) {
        statusCode = 404;
        errorMessage = "Course not found";
      } else if (error.name === 'SequelizeForeignKeyConstraintError') {
        statusCode = 409; // Conflict
        errorMessage = "Cannot delete course because it is referenced in other tables";
      }
      
      res.status(statusCode).json({ 
        success: false,
        message: errorMessage, 
        error: error.message,
        constraint: error.original?.constraint, // Include constraint info for debugging
        code: error.original?.code
      });
    }
  }

  async addTeachingAssistant(req, res) {
    try {
      console.log(`Add TA request for course ID ${req.params.id}:`, JSON.stringify(req.body, null, 2));
      
      if (!req.body.taIds || !Array.isArray(req.body.taIds) || req.body.taIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Teaching assistant IDs are required",
          error: "Missing required fields"
        });
      }
      
      // First check if the course exists
      const course = await courseService.getCourseById(req.params.id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
          error: "Course not found with the provided ID"
        });
      }
      
      const result = await courseService.addTeachingAssistantsToCourse(req.params.id, req.body.taIds);
      
      res.status(200).json({
        success: true,
        message: 'Teaching assistants added successfully',
        data: result
      });
    } catch (error) {
      console.error("Error adding teaching assistants:", error);
      
      let statusCode = 400;
      if (error.message.includes('not found')) {
        statusCode = 404;
      }
      
      res.status(statusCode).json({ 
        success: false,
        message: "Failed to add teaching assistants", 
        error: error.message 
      });
    }
  }

  async removeTeachingAssistant(req, res) {
    try {
      console.log(`Remove TA request for course ID ${req.params.courseId} and TA ID ${req.params.taId}`);
      
      // First check if the course exists
      const course = await courseService.getCourseById(req.params.courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
          error: "Course not found with the provided ID"
        });
      }
      
      await courseService.removeTeachingAssistantFromCourse(req.params.courseId, req.params.taId);
      
      res.status(200).json({
        success: true,
        message: "Teaching assistant removed successfully"
      });
    } catch (error) {
      console.error("Error removing teaching assistant:", error);
      
      let statusCode = 400;
      let errorMessage = "Failed to remove teaching assistant";
      
      if (error.message.includes('not found')) {
        statusCode = 404;
        errorMessage = error.message;
      }
      
      res.status(statusCode).json({ 
        success: false,
        message: errorMessage, 
        error: error.message
      });
    }
  }

  async getTeachingAssistants(req, res) {
    try {
      console.log(`Get TAs request for course ID ${req.params.id}`);
      
      // First check if the course exists
      const course = await courseService.getCourseById(req.params.id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
          error: "Course not found with the provided ID"
        });
      }
      
      const tas = await courseService.getTeachingAssistantsForCourse(req.params.id);
      
      res.status(200).json({
        success: true,
        data: tas
      });
    } catch (error) {
      console.error("Error getting teaching assistants:", error);
      
      let statusCode = 500;
      if (error.message.includes('not found')) {
        statusCode = 404;
      }
      
      res.status(statusCode).json({ 
        success: false,
        message: "Failed to get teaching assistants", 
        error: error.message 
      });
    }
  }

  async getInstructors(req, res) {
    try {
      console.log(`Get instructors request for course ID ${req.params.id}`);
      
      // First check if the course exists
      const course = await courseService.getCourseById(req.params.id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
          error: "Course not found with the provided ID"
        });
      }
      
      const instructors = await courseService.getInstructorsForCourse(req.params.id);
      
      res.status(200).json({
        success: true,
        data: instructors
      });
    } catch (error) {
      console.error("Error getting instructors:", error);
      
      let statusCode = 500;
      if (error.message.includes('not found')) {
        statusCode = 404;
      }
      
      res.status(statusCode).json({ 
        success: false,
        message: "Failed to get instructors", 
        error: error.message 
      });
    }
  }

  async importCoursesFromCSV(req, res) {
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
          
          // Map CSV columns to course fields
          Object.keys(data).forEach(key => {
            // Convert column headers to expected property names
            const lowerKey = key.toLowerCase().trim();
            
            if (lowerKey === 'coursecode' || lowerKey === 'code') {
              transformedData.courseCode = data[key];
            } else if (lowerKey === 'coursename' || lowerKey === 'name') {
              transformedData.courseName = data[key];
            } else if (lowerKey === 'department' || lowerKey === 'dept') {
              transformedData.department = data[key];
            } else if (lowerKey === 'credit' || lowerKey === 'credits') {
              transformedData.credit = parseInt(data[key], 10);
            } else if (lowerKey === 'isgrad' || lowerKey === 'isgraduatecourse' || lowerKey === 'gradcourse') {
              transformedData.isGradCourse = data[key].toLowerCase() === 'true' || data[key] === '1' || data[key].toLowerCase() === 'yes';
            } else if (lowerKey === 'semesterid' || lowerKey === 'semester') {
              transformedData.semesterId = data[key];
            } else if (lowerKey === 'studentcount' || lowerKey === 'students') {
              transformedData.studentCount = parseInt(data[key], 10);
            } 
            // Handle either instructor IDs or instructor names
            else if (lowerKey === 'instructorids') {
              if (data[key] && data[key].trim() !== '') {
                transformedData.instructorIds = data[key].split(',').map(id => id.trim());
                console.log(`Parsed instructor IDs for ${transformedData.courseCode}: ${JSON.stringify(transformedData.instructorIds)}`);
              }
            }
            else if (lowerKey === 'instructor' || lowerKey === 'instructors') {
              if (data[key] && data[key].trim() !== '') {
                // Store instructor names to look up IDs later
                transformedData.instructorNames = data[key].split(',').map(name => name.trim());
                console.log(`Parsed instructor names for ${transformedData.courseCode}: ${JSON.stringify(transformedData.instructorNames)}`);
              }
            }
            // Handle either TA IDs or TA names
            else if (lowerKey === 'taids') {
              if (data[key] && data[key].trim() !== '') {
                transformedData.taIds = data[key].split(',').map(id => id.trim());
                console.log(`Parsed TA IDs for ${transformedData.courseCode}: ${JSON.stringify(transformedData.taIds)}`);
              }
            }
            else if (lowerKey === 'teachingassistant' || lowerKey === 'ta' || lowerKey === 'tas' || lowerKey === 'teachingassistants') {
              if (data[key] && data[key].trim() !== '') {
                // Store TA names to look up IDs later
                transformedData.taNames = data[key].split(',').map(name => name.trim());
                console.log(`Parsed TA names for ${transformedData.courseCode}: ${JSON.stringify(transformedData.taNames)}`);
              }
            }
          });
          
          // Only add non-empty records
          if (Object.keys(transformedData).length > 0) {
            results.push(transformedData);
          }
        })
        .on("end", async () => {
          try {
            // Remove the temporary file
            fs.unlinkSync(filePath);
            
            console.log(`Parsed ${results.length} courses from CSV`);

            // Use the standalone function instead of a class method
            const processedResults = await processInstructorsAndTAs(results);
            const uploadResult = await courseService.importCoursesFromCSV(processedResults);
            
            res.status(201).json({ 
              success: true,
              message: `${uploadResult.success} courses created successfully, ${uploadResult.errors.length} failed.`,
              coursesCreated: uploadResult.success,
              coursesFailed: uploadResult.errors.length,
              totalRecords: results.length,
              errors: uploadResult.errors.length > 0 ? uploadResult.errors : undefined
            });
          } catch (error) {
            console.error("Error processing course data:", error);
            res.status(500).json({
              success: false,
              message: "Failed to process course data",
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

  async searchCourses(req, res) {
    try {
      const { query } = req.query;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          message: "Search query is required"
        });
      }
      
      const courses = await courseService.searchCourses(query);
      
      res.status(200).json({
        success: true,
        data: courses
      });
    } catch (error) {
      console.error("Error searching courses:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to search courses", 
        error: error.message 
      });
    }
  }
}

module.exports = new CourseController();