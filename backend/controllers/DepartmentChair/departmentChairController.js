const departmentChairService = require('../../services/DepartmentChair/departmentChairService');

/**
 * Controller for handling department chair operations
 */
class DepartmentChairController {
    /**
     * Get department chair profile
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getChairProfile(req, res) {
        try {
            const chairId = req.user.id;
            const profile = await departmentChairService.getChairProfile(chairId);

            return res.json({
                success: true,
                message: 'Department chair profile retrieved successfully',
                data: profile
            });
        } catch (error) {
            console.error('Error in getChairProfile:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve profile'
            });
        }
    }

    /**
     * Get courses for a specific department
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getDepartmentCourses(req, res) {
        try {
            console.log('Getting courses for department:', req.params.department);
            const { department } = req.params;
            
            if (!department) {
                return res.status(400).json({
                    success: false,
                    message: 'Department parameter is required'
                });
            }
            
            const courses = await departmentChairService.getDepartmentCourses(department);

            return res.json({
                success: true,
                message: 'Department courses retrieved successfully',
                data: courses
            });
        } catch (error) {
            console.error('Error in getDepartmentCourses controller:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve department courses'
            });
        }
    }

    /**
     * Get all available TAs
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getAvailableTAs(req, res) {
        try {
            const chairId = req.user.id;
            const chairDepartment = await departmentChairService.getChairDepartment(chairId);
            const tas = await departmentChairService.getAvailableTAs(chairDepartment);

            return res.json({
                success: true,
                message: 'Available TAs retrieved successfully',
                data: tas
            });
        } catch (error) {
            console.error('Error in getAvailableTAs:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve available TAs'
            });
        }
    }

    /**
     * Get all TA requests
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getTARequests(req, res) {
        try {
            const chairId = req.user.id;
            const chairDepartment = await departmentChairService.getChairDepartment(chairId);
            const requests = await departmentChairService.getTARequests(chairDepartment);

            return res.json({
                success: true,
                message: 'TA requests retrieved successfully',
                data: requests
            });
        } catch (error) {
            console.error('Error in getTARequests:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve TA requests'
            });
        }
    }

    /**
     * Assign TAs to a course
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async assignTAsToCourse(req, res) {
        try {
            const { courseId, taIds } = req.body;
            console.log(`Received request to assign TAs to course ${courseId}`);
            console.log(`TA IDs to assign: ${taIds ? JSON.stringify(taIds) : 'none'}`);

            if (!courseId || !taIds || !Array.isArray(taIds)) {
                console.log('Invalid request: Missing courseId or taIds array');
                return res.status(400).json({
                    success: false,
                    message: 'Course ID and TA IDs array are required'
                });
            }

            const chairId = req.user.id;
            const chairDepartment = await departmentChairService.getChairDepartment(chairId);
            console.log(`Department chair ID: ${chairId}, Department: ${chairDepartment}`);
            
            // Verify that the course belongs to the chair's department
            const courseExists = await departmentChairService.verifyCourseInDepartment(courseId, chairDepartment);
            
            if (!courseExists) {
                console.log(`Course ${courseId} does not belong to department ${chairDepartment}`);
                return res.status(403).json({
                    success: false,
                    message: 'Course does not belong to your department'
                });
            }

            // Assign TAs to the course
            console.log(`Calling service to assign ${taIds.length} TAs to course ${courseId}`);
            const result = await departmentChairService.assignTAsToCourse(courseId, taIds);
            console.log(`TA assignment successful for course ${courseId}`);

            return res.json({
                success: true,
                message: 'TAs assigned to course successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in assignTAsToCourse:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to assign TAs to course'
            });
        }
    }

    /**
     * Get TAs assigned to a specific course
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getCourseTAs(req, res) {
        try {
            const courseId = req.params.id;
            
            if (!courseId) {
                return res.status(400).json({
                    success: false,
                    message: 'Course ID is required'
                });
            }
            
            const chairId = req.user.id;
            const chairDepartment = await departmentChairService.getChairDepartment(chairId);
            
            // Verify that the course belongs to the chair's department
            const courseExists = await departmentChairService.verifyCourseInDepartment(courseId, chairDepartment);
            
            if (!courseExists) {
                return res.status(403).json({
                    success: false,
                    message: 'Course does not belong to your department'
                });
            }
            
            // Get TAs assigned to the course
            const assignedTAs = await departmentChairService.getCourseTAs(courseId);
            
            return res.json({
                success: true,
                message: 'TAs assigned to course retrieved successfully',
                data: assignedTAs
            });
        } catch (error) {
            console.error('Error in getCourseTAs:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve TAs assigned to course'
            });
        }
    }
}

module.exports = new DepartmentChairController(); 