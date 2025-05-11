// controllers/Admin/courseController.js
const courseService = require('../../services/Admin/courseService');
const fs = require('fs');
const csv = require('csv-parser');
const Instructor = require('../../models/Instructor');
const TeachingAssistant = require('../../models/TeachingAssistant'); // Still needed for other functionalities like getTAs, updateCourse
const { Op } = require('sequelize');

// MODIFIED: processInstructorsAndTAs will now only process instructors
async function processInstructors(coursesData) { // Renamed for clarity
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
        
        if (instructors.length > 0) {
          processedCourse.instructorIds = instructors.map(instructor => instructor.id);
        } else {
          console.warn(`No instructors found for names: ${JSON.stringify(courseData.instructorNames)} in course ${courseData.courseCode}`);
        }
        delete processedCourse.instructorNames;
      } catch (error) {
        console.error("Error looking up instructors by name:", error);
        delete processedCourse.instructorNames;
      }
    }
    
    // REMOVED: TA processing logic from this function
    // If taIds were directly provided in CSV (not by name), they would still be passed through
    // but the frontend has removed taNames from the CSV note for adding.
    // If taIds are explicitly needed for import *add*, this needs careful consideration.
    // For now, assuming TAs are NOT set during initial CSV import for ADD.

    // Ensure taIds is an empty array if not provided from CSV or processing
    // This makes it explicit that new courses from CSV won't have TAs initially.
    if (!processedCourse.taIds) {
        processedCourse.taIds = [];
    }
    
    processedData.push(processedCourse);
  }
  
  return processedData;
}

class CourseController {
  async createCourse(req, res) {
    try {
      console.log('Create course request (form):', JSON.stringify(req.body, null, 2));
      
      if (!req.body.courseCode || !req.body.department || !req.body.semesterId) {
        return res.status(400).json({
          success: false,
          message: "Course code, department, and semester ID are required",
          error: "Missing required fields"
        });
      }
      
      // Frontend now sends an empty array for taIds in the addCourse -> updateCourseAssociations call,
      // which then calls the PUT /api/admin/courses/:id endpoint.
      // The actual creation via POST /api/admin/courses doesn't include taIds in its immediate body.
      // The association happens in a subsequent PUT if updateCourseAssociations is called.
      // For direct creation without TA assignment, we ensure req.body doesn't have taIds or it's empty.
      const courseDataForCreation = { ...req.body };
      // delete courseDataForCreation.taIds; // Or ensure it's empty if sent by mistake for POST

      const course = await courseService.createCourse(courseDataForCreation); // This passes instructorIds if present
      
      // The frontend's addCourse function calls updateCourseAssociations separately
      // and passes an empty array for TAs. So the main createCourse here doesn't need to handle TAs.
      // If instructors are passed directly in req.body (not through separate association step),
      // they will be handled by courseService.createCourse.

      console.log('Course created successfully via POST:', course.id);
      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: course // This is the base course object
      });
    } catch (error) {
      console.error("Error creating course:", error);
      let statusCode = 400;
      let errorMessage = error.message;
      if (error.name === 'SequelizeUniqueConstraintError') {
        errorMessage = 'A course with this ID or course code already exists';
      } else if (error.name === 'SequelizeValidationError') {
        errorMessage = error.errors.map(e => e.message).join(', ');
      }
      res.status(statusCode).json({ 
        success: false,
        message: "Failed to create course", 
        error: errorMessage
      });
    }
  }

  // ... getCourse, getCourseByCode, getAllCourses ... (NO CHANGES NEEDED HERE)
  async getCourse(req, res) {
    try {
      const course = await courseService.getCourseById(req.params.id);
      if (!course) {
        return res.status(404).json({ success: false, message: "Course not found" });
      }
      res.status(200).json({ success: true, data: course });
    } catch (error) {
      console.error("Error getting course:", error);
      res.status(500).json({ success: false, message: "Failed to get course", error: error.message });
    }
  }

  async getCourseByCode(req, res) {
    try {
      const course = await courseService.getCourseByCode(req.params.courseCode);
      if (!course) {
        return res.status(404).json({ success: false, message: "Course not found" });
      }
      res.status(200).json({ success: true, data: course });
    } catch (error) {
      console.error("Error getting course by code:", error);
      res.status(500).json({ success: false, message: "Failed to get course", error: error.message });
    }
  }

  async getAllCourses(req, res) {
    try {
      const filters = {
        department: req.query.department,
        isGradCourse: req.query.isGradCourse === 'true' || req.query.isGradCourse === true, // handle boolean properly
        semesterId: req.query.semesterId
      };
      Object.keys(filters).forEach(key => (filters[key] === undefined || filters[key] === '') && delete filters[key]);
      
      const courses = await courseService.getAllCourses(filters);
      res.status(200).json({ success: true, data: courses });
    } catch (error) {
      console.error("Error finding courses:", error);
      res.status(500).json({ success: false, message: "Failed to find courses", error: error.message });
    }
  }
  
  // updateCourse is used for "Edit Course" and for associating instructors/TAs after creation.
  // It should continue to handle taIds for editing.
  async updateCourse(req, res) {
    try {
      console.log(`Update course request for ID ${req.params.id}:`, JSON.stringify(req.body, null, 2));
      const course = await courseService.getCourseById(req.params.id); // Check existence
      if (!course) {
        return res.status(404).json({ success: false, message: "Course not found" });
      }
      
      // req.body can contain instructorIds and taIds (for edit mode or if frontend sends empty taIds for add)
      const updatedCourse = await courseService.updateCourse(req.params.id, req.body);
      
      res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        data: updatedCourse
      });
    } catch (error)
     {
      console.error("Error updating course:", error);
      let statusCode = 400;
      if (error.message.includes('not found')) statusCode = 404;
      res.status(statusCode).json({ success: false, message: "Failed to update course", error: error.message });
    }
  }

  // ... deleteCourse, deleteCoursesFromCSV ... (NO CHANGES NEEDED HERE)
  async deleteCourse(req, res) {
    try {
      const course = await courseService.getCourseById(req.params.id);
      if (!course) {
        return res.status(404).json({ success: false, message: "Course not found" });
      }
      await courseService.deleteCourse(req.params.id);
      res.status(200).json({ success: true, message: "Course deleted successfully" });
    } catch (error) {
      console.error("Error deleting course:", error);
      let statusCode = 400;
      let errorMessage = "Failed to delete course";
      if (error.message.includes('not found')) {
        statusCode = 404; errorMessage = "Course not found";
      } else if (error.name === 'SequelizeForeignKeyConstraintError') {
        statusCode = 409; errorMessage = "Cannot delete course due to existing references.";
      }
      res.status(statusCode).json({ success: false, message: errorMessage, error: error.message });
    }
  }

  async deleteCoursesFromCSV(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }
      const results = [];
      const filePath = req.file.path;
      fs.createReadStream(filePath).pipe(csv())
        .on("data", (data) => {
          const transformedData = {};
          Object.keys(data).forEach(key => {
            const lowerKey = key.toLowerCase().trim();
            if (lowerKey === 'coursecode' || lowerKey === 'code') transformedData.courseCode = data[key];
            else if (lowerKey === 'department' || lowerKey === 'dept') transformedData.department = data[key];
            else if (lowerKey === 'semesterid' || lowerKey === 'semester') transformedData.semesterId = String(data[key]);
          });
          if (transformedData.courseCode && transformedData.department && transformedData.semesterId) {
            results.push(transformedData);
          } else {
            console.warn('Skipping row for deletion (CSV) due to missing fields:', data);
          }
        })
        .on("end", async () => {
          try {
            fs.unlinkSync(filePath);
            if (results.length === 0) {
              return res.status(400).json({ success: false, message: "No valid course identifiers in CSV for deletion." });
            }
            const deletionResult = await courseService.deleteCoursesByCsvData(results);
            res.status(200).json({ 
              success: true,
              message: `${deletionResult.deletedCount} courses deleted, ${deletionResult.errors.length} failed.`,
              coursesDeleted: deletionResult.deletedCount,
              coursesFailed: deletionResult.errors.length,
              errors: deletionResult.errors.length > 0 ? deletionResult.errors : undefined
            });
          } catch (error) {
            console.error("Error processing course deletion CSV data:", error);
            res.status(500).json({ success: false, message: "Failed to process course deletion CSV", error: error.message });
          }
        })
        .on("error", (error) => {
          console.error("Error parsing CSV for deletion:", error);
          res.status(400).json({ success: false, message: "Failed to parse CSV for deletion", error: error.message });
        });
    } catch (error) {
      console.error("Error with CSV deletion upload:", error);
      res.status(400).json({ success: false, message: "Failed to upload CSV for deletion", error: error.message });
    }
  }


  // ... addTeachingAssistant, removeTeachingAssistant, getTeachingAssistants, getInstructors ...
  // (NO CHANGES NEEDED HERE, these are for managing TAs/Instructors on *existing* courses, which is retained)
  async addTeachingAssistant(req, res) { // This is for manually adding TAs to an existing course via API
    try {
      if (!req.body.taIds || !Array.isArray(req.body.taIds) || req.body.taIds.length === 0) {
        return res.status(400).json({ success: false, message: "Teaching assistant IDs are required" });
      }
      const course = await courseService.getCourseById(req.params.id);
      if (!course) {
        return res.status(404).json({ success: false, message: "Course not found" });
      }
      const result = await courseService.addTeachingAssistantsToCourse(req.params.id, req.body.taIds);
      res.status(200).json({ success: true, message: 'Teaching assistants added successfully', data: result });
    } catch (error) {
      console.error("Error adding teaching assistants:", error);
      res.status(error.message.includes('not found') ? 404 : 400).json({ success: false, message: "Failed to add TAs", error: error.message });
    }
  }

  async removeTeachingAssistant(req, res) { // For manually removing TAs from an existing course
    try {
      const course = await courseService.getCourseById(req.params.courseId);
      if (!course) {
        return res.status(404).json({ success: false, message: "Course not found" });
      }
      await courseService.removeTeachingAssistantFromCourse(req.params.courseId, req.params.taId);
      res.status(200).json({ success: true, message: "Teaching assistant removed successfully" });
    } catch (error) {
      console.error("Error removing teaching assistant:", error);
      res.status(error.message.includes('not found') ? 404 : 400).json({ success: false, message: "Failed to remove TA", error: error.message });
    }
  }

  async getTeachingAssistants(req, res) { // For fetching TAs of an existing course
    try {
      const course = await courseService.getCourseById(req.params.id);
      if (!course) {
        return res.status(404).json({ success: false, message: "Course not found" });
      }
      const tas = await courseService.getTeachingAssistantsForCourse(req.params.id);
      res.status(200).json({ success: true, data: tas });
    } catch (error) {
      console.error("Error getting teaching assistants:", error);
      res.status(error.message.includes('not found') ? 404 : 500).json({ success: false, message: "Failed to get TAs", error: error.message });
    }
  }

  async getInstructors(req, res) { // For fetching instructors of an existing course
    try {
      const course = await courseService.getCourseById(req.params.id);
      if (!course) {
        return res.status(404).json({ success: false, message: "Course not found" });
      }
      const instructors = await courseService.getInstructorsForCourse(req.params.id);
      res.status(200).json({ success: true, data: instructors });
    } catch (error) {
      console.error("Error getting instructors:", error);
      res.status(error.message.includes('not found') ? 404 : 500).json({ success: false, message: "Failed to get instructors", error: error.message });
    }
  }

  async importCoursesFromCSV(req, res) { // This is for ADDING courses via CSV
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }
      const results = [];
      const filePath = req.file.path;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => {
          const transformedData = {};
          Object.keys(data).forEach(key => {
            const lowerKey = key.toLowerCase().trim();
            if (lowerKey === 'coursecode' || lowerKey === 'code') transformedData.courseCode = data[key];
            else if (lowerKey === 'coursename' || lowerKey === 'name') transformedData.courseName = data[key];
            else if (lowerKey === 'department' || lowerKey === 'dept') transformedData.department = data[key];
            else if (lowerKey === 'credit' || lowerKey === 'credits') transformedData.credit = parseInt(data[key], 10) || undefined; // Handle non-numeric gracefully
            else if (lowerKey === 'isgrad' || lowerKey === 'isgraduatecourse' || lowerKey === 'gradcourse') transformedData.isGradCourse = data[key]?.toLowerCase() === 'true' || data[key] === '1' || data[key]?.toLowerCase() === 'yes';
            else if (lowerKey === 'semesterid' || lowerKey === 'semester') transformedData.semesterId = data[key];
            else if (lowerKey === 'studentcount' || lowerKey === 'students') transformedData.studentCount = parseInt(data[key], 10) || undefined; // Handle non-numeric gracefully
            else if (lowerKey === 'instructorids') { // Direct Instructor IDs
              if (data[key] && data[key].trim() !== '') transformedData.instructorIds = data[key].split(',').map(id => id.trim());
            }
            else if (lowerKey === 'instructor' || lowerKey === 'instructors') { // Instructor Names
              if (data[key] && data[key].trim() !== '') transformedData.instructorNames = data[key].split(',').map(name => name.trim());
            }
            // REMOVED: Parsing for 'taids', 'teachingassistant', 'ta', 'tas', 'teachingassistants'
            // Because TAs are not assigned during initial CSV import for adding courses.
          });
          if (transformedData.courseCode && transformedData.department && transformedData.semesterId) { // Basic validation
            results.push(transformedData);
          } else {
            console.warn("Skipping row from ADD CSV due to missing core fields (CourseCode, Department, SemesterId):", data);
          }
        })
        .on("end", async () => {
          try {
            fs.unlinkSync(filePath);
            console.log(`Parsed ${results.length} courses from ADD CSV`);
            if (results.length === 0) {
              return res.status(400).json({ success: false, message: "No valid course data found in CSV for adding." });
            }

            // Use the modified processInstructors function (which no longer processes TAs)
            const processedResults = await processInstructors(results); // was processInstructorsAndTAs
            
            // For each processedResult, ensure taIds is explicitly empty if not present,
            // though processInstructors now adds `taIds = []` if missing.
            const finalResultsForImport = processedResults.map(item => ({
                ...item,
                taIds: item.taIds || [] // Ensure taIds is an empty array for new courses
            }));

            const uploadResult = await courseService.importCoursesFromCSV(finalResultsForImport);
            
            res.status(201).json({ 
              success: true,
              message: `${uploadResult.success} courses created, ${uploadResult.errors.length} failed.`,
              coursesCreated: uploadResult.success,
              coursesFailed: uploadResult.errors.length,
              errors: uploadResult.errors.length > 0 ? uploadResult.errors : undefined
            });
          } catch (error) {
            console.error("Error processing ADD course data from CSV:", error);
            res.status(500).json({ success: false, message: "Failed to process ADD course data from CSV", error: error.message });
          }
        })
        .on("error", (error) => {
          console.error("Error parsing CSV for ADDING courses:", error);
          res.status(400).json({ success: false, message: "Failed to parse CSV for ADDING courses", error: error.message });
        });
    } catch (error) {
      console.error("Error uploading CSV for ADDING courses:", error);
      res.status(400).json({ success: false, message: "Failed to upload CSV for ADDING courses", error: error.message });
    }
  }

  // ... searchCourses ... (NO CHANGES NEEDED HERE)
  async searchCourses(req, res) {
    try {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ success: false, message: "Search query is required" });
      }
      const courses = await courseService.searchCourses(query);
      res.status(200).json({ success: true, data: courses });
    } catch (error) {
      console.error("Error searching courses:", error);
      res.status(500).json({ success: false, message: "Failed to search courses", error: error.message });
    }
  }
}

module.exports = new CourseController();