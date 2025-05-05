// controllers/Admin/fetchingController.js
const semesterFetchingService = require('../../services/Admin/semesterFetchingService');
const userFetchingService = require('../../services/Admin/userFetchingService');
const courseAssociationService = require('../../services/Admin/courseAssociationService');
const courseFetchingService = require('../../services/Admin/courseFetchingService');


class FetchingController {
    /**
     * Get all semesters
     */
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
  
async getUsers(req, res) {
  try {
    console.log('Find users request, query:', req.query);
    
    // Validate userType
    if (!req.query.userType || !['instructor', 'ta'].includes(req.query.userType)) {
      console.warn('Invalid or missing userType parameter:', req.query.userType);
      return res.status(200).json([]);  // Return empty array for invalid userType
    }
    
    // Validate department - must be present
    if (!req.query.department) {
      console.warn('Missing department parameter');
      return res.status(200).json([]);  // Return empty array if no department specified
    }
    
    const users = await userFetchingService.getUsers(req.query);
    
    // Log the number of users found
    console.log(`Found ${users.length} ${req.query.userType}s in department ${req.query.department}`);
    
    // Return just the array for compatibility with the existing code
    res.status(200).json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    // Return empty array to prevent frontend crashes
    res.status(200).json([]);
  }
}

    /**
     * Get active semester
     */
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
    /**
     * Get instructors for a specific course
     */
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

    /**
     * Add an instructor to a course
     */
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

    /**
     * Get teaching assistants for a specific course
     */
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

    /**
     * Add a teaching assistant to a course
     */
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

    /**
     * Update course associations (both instructors and TAs)
     */
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

    async getAllCourses(req, res) {
        try {
            const courses = await courseFetchingService.getAllCourses();
            
            res.status(200).json({
                success: true,
                count: courses.length,
                data: courses
            });
        } catch (error) {
            console.error('Error fetching all courses:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch courses',
                error: error.message
            });
        }
    }

    /**
     * Get courses by department
     */
    async getCoursesByDepartment(req, res) {
        try {
            const { department } = req.params;
            
            if (!department) {
                return res.status(400).json({
                    success: false,
                    message: 'Department is required'
                });
            }
            
            const courses = await courseFetchingService.getCoursesByDepartment(department);
            
            res.status(200).json({
                success: true,
                count: courses.length,
                data: courses
            });
        } catch (error) {
            console.error(`Error fetching courses for department ${req.params.department}:`, error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch courses by department',
                error: error.message
            });
        }
    }

    /**
     * Search courses
     */
    async searchCourses(req, res) {
        try {
            const courses = await courseFetchingService.searchCourses(req.query);
            
            res.status(200).json({
                success: true,
                count: courses.length,
                data: courses
            });
        } catch (error) {
            console.error('Error searching courses:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to search courses',
                error: error.message
            });
        }
    }
    
}

module.exports = new FetchingController();