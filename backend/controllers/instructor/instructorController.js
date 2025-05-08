const instructorService = require('../../services/Instructor/instructorService');

class InstructorController {
    /**
     * Get all courses (admin view)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getAllCourses(req, res) {
        try {
            const { department, semesterId } = req.query;

            const courses = await instructorService.getAllCourses({
                department,
                semesterId
            });

            return res.status(200).json({
                success: true,
                data: courses
            });
        } catch (error) {
            console.error('Error getting all courses:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to get courses'
            });
        }
    }

    /**
     * Get courses for the authenticated instructor
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getInstructorCourses(req, res) {
        console.log("trigggggggng");
        try {
            const instructorId = req.user.id;
            console.log("frdsc", instructorId);
            // Get courses for the instructor
            const courses = await instructorService.getCoursesForInstructor(
                instructorId
            );

            return res.status(200).json({
                success: true,
                data: courses
            });
        } catch (error) {
            console.error('Error getting instructor courses:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to get instructor courses'
            });
        }
    }

}

module.exports = new InstructorController();