const InstructorTARequestService = require('../../services/Instructor/InstructorTARequestService');

/**
 * Controller for handling instructor TA request operations
 */
class InstructorTARequestController {
    /**
     * Get all courses associated with the authenticated instructor
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getInstructorCourses(req, res) {
        try {
            const instructorId = req.user.id;
            const courses = await InstructorTARequestService.getInstructorCourses(instructorId);

            return res.json({
                success: true,
                message: 'Instructor courses retrieved successfully',
                data: courses
            });
        } catch (error) {
            console.error('Error in getInstructorCourses:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve instructor courses'
            });
        }
    }

    /**
     * Get all TA requests submitted by the instructor
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getInstructorTARequests(req, res) {
        try {
            const instructorId = req.user.id;
            const requests = await InstructorTARequestService.getInstructorTARequests(instructorId);

            return res.json({
                success: true,
                message: 'TA requests retrieved successfully',
                data: requests
            });
        } catch (error) {
            console.error('Error in getInstructorTARequests:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve TA requests'
            });
        }
    }

    /**
     * Create a new TA request
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async createTARequest(req, res) {
        try {
            const instructorId = req.user.id;
            const { taId, courseId, priority, reason } = req.body;

            // Validate request data
            if (!taId || !courseId || !priority || !reason) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: taId, courseId, priority, and reason are required'
                });
            }

            const newRequest = await InstructorTARequestService.createTARequest(
                instructorId,
                taId,
                courseId,
                priority,
                reason
            );

            return res.status(201).json({
                success: true,
                message: 'TA request created successfully',
                data: newRequest
            });
        } catch (error) {
            console.error('Error in createTARequest:', error);

            // Handle specific errors
            if (error.message.includes('already exists')) {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message.includes('not found')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to create TA request'
            });
        }
    }

    /**
     * Delete a TA request
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async deleteTARequest(req, res) {
        try {
            const instructorId = req.user.id;
            const { requestId } = req.params;

            if (!requestId) {
                return res.status(400).json({
                    success: false,
                    message: 'Request ID is required'
                });
            }

            await InstructorTARequestService.deleteTARequest(instructorId, requestId);

            return res.json({
                success: true,
                message: 'TA request deleted successfully'
            });
        } catch (error) {
            console.error('Error in deleteTARequest:', error);

            if (error.message.includes('not found')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message.includes('unauthorized')) {
                return res.status(403).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to delete TA request'
            });
        }
    }

    /**
     * Get all available TAs that can be assigned to courses
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getAvailableTAs(req, res) {
        try {
            const tas = await InstructorTARequestService.getAvailableTAs();

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
     * Submit all pending TA requests
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async submitTARequests(req, res) {
        try {
            const instructorId = req.user.id;
            const { requestIds } = req.body;

            if (!requestIds || !Array.isArray(requestIds)) {
                return res.status(400).json({
                    success: false,
                    message: 'Request IDs array is required'
                });
            }

            await InstructorTARequestService.submitTARequests(instructorId, requestIds);

            return res.json({
                success: true,
                message: 'TA requests submitted successfully'
            });
        } catch (error) {
            console.error('Error in submitTARequests:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to submit TA requests'
            });
        }
    }
}

module.exports = new InstructorTARequestController();