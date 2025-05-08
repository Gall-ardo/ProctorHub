const examService  = require('../../services/Instructor/examService');
class ExamController {
    /**
     * Create a new exam
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async createExam(req, res) {
        try {
            const { body } = req;

            // Add instructor ID from authenticated user
            body.instructorId = req.user.id;

            // Format the date properly if it comes in a different format
            if (body.date && typeof body.date === 'string' && body.date.includes('/')) {
                // Convert from DD/MM/YYYY to YYYY-MM-DD for database
                const [day, month, year] = body.date.split('/');
                body.date = `${year}-${month}-${day}`;
            }

            // Add department and semester if not provided
            body.department = body.department || req.user.department;

            // Calculate duration if start and end times are provided instead
            if (body.startTime && body.endTime && !body.duration) {
                const [startHours, startMinutes] = body.startTime.split(':').map(Number);
                const [endHours, endMinutes] = body.endTime.split(':').map(Number);

                let durationMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
                // Handle cases where exam goes past midnight
                if (durationMinutes < 0) {
                    durationMinutes += 24 * 60;
                }

                body.duration = durationMinutes;
            }

            const exam = await examService.createExam(body);

            return res.status(201).json({
                success: true,
                data: exam
            });
        } catch (error) {
            console.error('Error creating exam:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to create exam'
            });
        }
    }

    /**
     * Get all exams for the authenticated instructor
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getInstructorExams(req, res) {
        try {
            const instructorId = req.user.id;

            const exams = await examService.getExamsWithProctors(instructorId);

            return res.status(200).json({
                success: true,
                data: exams
            });
        } catch (error) {
            console.error('Error getting instructor exams:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to get exams'
            });
        }
    }

    /**
     * Get exams for courses taught by the authenticated instructor
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getInstructorCourseExams(req, res) {
        try {
            const instructorId = req.user.id;
            console.log("instructorId",instructorId);
            // Get exams for courses taught by the instructor
            const exams = await examService.getExamsForInstructorCourses(instructorId);

            return res.status(200).json({
                success: true,
                data: exams
            });
        } catch (error) {
            console.error('Error getting instructor course exams:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to get exams for instructor courses'
            });
        }
    }

    /**
     * Get a single exam by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getExamById(req, res) {
        try {
            const { examId } = req.params;

            const exam = await examService.getExamById(examId);

            // Check if the exam belongs to the authenticated instructor
            if (exam.instructorId !== req.user.id) {
                // Check if the exam is for a course taught by this instructor
                const isCourseInstructor = await examService.isInstructorForExamCourse(
                    req.user.id,
                    exam.courseName
                );

                if (!isCourseInstructor) {
                    return res.status(403).json({
                        success: false,
                        message: 'Not authorized to access this exam'
                    });
                }
            }

            return res.status(200).json({
                success: true,
                data: exam
            });
        } catch (error) {
            console.error('Error getting exam:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to get exam'
            });
        }
    }

    /**
     * Update an exam
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async updateExam(req, res) {
        try {
            const { examId } = req.params;
            const { body } = req;

            // Get the exam to check ownership
            const existingExam = await examService.getExamById(examId);

            // Check if the exam belongs to the authenticated instructor
            if (existingExam.instructorId !== req.user.id) {
                // Check if the exam is for a course taught by this instructor
                const isCourseInstructor = await examService.isInstructorForExamCourse(
                    req.user.id,
                    existingExam.courseName
                );

                if (!isCourseInstructor) {
                    return res.status(403).json({
                        success: false,
                        message: 'Not authorized to update this exam'
                    });
                }
            }

            const updatedExam = await examService.updateExam(examId, body);

            return res.status(200).json({
                success: true,
                data: updatedExam
            });
        } catch (error) {
            console.error('Error updating exam:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to update exam'
            });
        }
    }

    /**
     * Delete an exam
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async deleteExam(req, res) {
        try {
            const { examId } = req.params;

            // Get the exam to check ownership
            const existingExam = await examService.getExamById(examId);

            // Check if the exam belongs to the authenticated instructor
            if (existingExam.instructorId !== req.user.id) {
                // Check if the exam is for a course taught by this instructor
                const isCourseInstructor = await examService.isInstructorForExamCourse(
                    req.user.id,
                    existingExam.courseName
                );

                if (!isCourseInstructor) {
                    return res.status(403).json({
                        success: false,
                        message: 'Not authorized to delete this exam'
                    });
                }
            }

            await examService.deleteExam(examId);

            return res.status(200).json({
                success: true,
                message: 'Exam deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting exam:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to delete exam'
            });
        }
    }
}

module.exports = new ExamController();