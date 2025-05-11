const semesterFetchingService = require('../../services/Admin/semesterFetchingService');
const userFetchingService = require('../../services/Admin/userFetchingService');
const courseAssociationService = require('../../services/Admin/courseAssociationService');
const courseFetchingService = require('../../services/Admin/courseFetchingService');

class FetchingController {

    async getAllSemesters(req, res) {
        try {
            const semesters = await semesterFetchingService.getAllSemesters();
            res.status(200).json({
                success: true,
                data: semesters
            });
        } catch (error) {
            console.error("CONTROLLER (getAllSemesters): Error getting semesters:", error); // KEPT
            res.status(200).json({
                success: true,
                data: [],
                message: "Failed to get semesters, using empty list"
            });
        }
    }

    async getUsers(req, res) {
        try {

            const { userType, department, name, id, email } = req.query;

            if (!userType || !['instructor', 'ta'].includes(userType)) {
                console.warn('CONTROLLER (getUsers): Invalid or missing userType parameter:', userType); // KEPT
                return res.status(200).json([]);
            }

            if (!department) {
                console.warn('CONTROLLER (getUsers): Missing department parameter.'); // KEPT
                return res.status(200).json([]);
            }


            const users = await userFetchingService.getUsers(req.query);

            res.status(200).json(users);
        } catch (error) {
            console.error("CONTROLLER (getUsers): Error:", error.message); // KEPT
            console.error("CONTROLLER (getUsers): Stack:", error.stack); // KEPT
            // console.log('--- CONTROLLER: getUsers END (with error) ---\n'); // REMOVED
            res.status(200).json([]);
        }
    }

    async getActiveSemester(req, res) {
        try {
            const semester = await semesterFetchingService.getActiveSemester();
            if (!semester) {
                return res.status(404).json({ success: false, message: "No active semester found" });
            }
            res.status(200).json({ success: true, data: semester });
        } catch (error) {
            console.error("Error getting active semester:", error); // KEPT
            res.status(500).json({ success: false, message: "Failed to get active semester", error: error.message });
        }
    }

    async getCourseInstructors(req, res) {
        try {
            const courseId = req.params.id;
            const instructors = await courseAssociationService.getCourseInstructors(courseId);
            res.status(200).json({ success: true, data: instructors });
        } catch (error) {
            console.error("Error getting course instructors:", error); // KEPT
            res.status(500).json({ success: false, message: "Failed to get course instructors", error: error.message });
        }
    }

    async addInstructorToCourse(req, res) {
        try {
            const courseId = req.params.id;
            const { instructorId } = req.body;
            if (!instructorId) {
                return res.status(400).json({ success: false, message: "Instructor ID is required" });
            }
            await courseAssociationService.addInstructorToCourse(courseId, instructorId);
            res.status(200).json({ success: true, message: "Instructor added to course successfully" });
        } catch (error) {
            console.error("Error adding instructor to course:", error); // KEPT
            res.status(500).json({ success: false, message: "Failed to add instructor to course", error: error.message });
        }
    }

    async getCourseTeachingAssistants(req, res) {
        try {
            const courseId = req.params.id;
            const tas = await courseAssociationService.getCourseTeachingAssistants(courseId);
            res.status(200).json({ success: true, data: tas });
        } catch (error) {
            console.error("Error getting course teaching assistants:", error); // KEPT
            res.status(500).json({ success: false, message: "Failed to get course teaching assistants", error: error.message });
        }
    }

    async addTeachingAssistantToCourse(req, res) {
        try {
            const courseId = req.params.id;
            const { taId } = req.body;
            if (!taId) {
                return res.status(400).json({ success: false, message: "Teaching Assistant ID is required" });
            }
            await courseAssociationService.addTeachingAssistantToCourse(courseId, taId);
            res.status(200).json({ success: true, message: "Teaching Assistant added to course successfully" });
        } catch (error) {
            console.error("Error adding teaching assistant to course:", error); // KEPT
            res.status(500).json({ success: false, message: "Failed to add teaching assistant to course", error: error.message });
        }
    }

    async updateCourseAssociations(req, res) {
        try {
            const courseId = req.params.id;
            const { instructorIds, taIds } = req.body;
            await courseAssociationService.updateCourseAssociations(courseId, instructorIds, taIds);
            res.status(200).json({ success: true, message: "Course associations updated successfully" });
        } catch (error) {
            console.error("Error updating course associations:", error); // KEPT
            res.status(500).json({ success: false, message: "Failed to update course associations", error: error.message });
        }
    }

    async getAllCourses(req, res) {
        try {
            const courses = await courseFetchingService.getAllCourses();
            res.status(200).json({ success: true, count: courses.length, data: courses });
        } catch (error) {
            console.error('Error fetching all courses:', error); // KEPT
            res.status(500).json({ success: false, message: 'Failed to fetch courses', error: error.message });
        }
    }

    async getCoursesByDepartment(req, res) {
        try {
            const { department } = req.params;
            if (!department) {
                return res.status(400).json({ success: false, message: 'Department is required' });
            }
            const courses = await courseFetchingService.getCoursesByDepartment(department);
            res.status(200).json({ success: true, count: courses.length, data: courses });
        } catch (error) {
            console.error(`Error fetching courses for department ${req.params.department}:`, error); // KEPT
            res.status(500).json({ success: false, message: 'Failed to fetch courses by department', error: error.message });
        }
    }

    async searchCourses(req, res) {
        try {
            const courses = await courseFetchingService.searchCourses(req.query);
            res.status(200).json({ success: true, count: courses.length, data: courses });
        } catch (error) {
            console.error('Error searching courses:', error); // KEPT
            res.status(500).json({ success: false, message: 'Failed to search courses', error: error.message });
        }
    }
}

module.exports = new FetchingController();