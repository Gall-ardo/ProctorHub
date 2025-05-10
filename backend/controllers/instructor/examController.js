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

    /**
     * Assign proctors to an exam
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async assignProctors(req, res) {
        try {
            const instructorId = req.user.id;
            const { 
                examId, 
                courseName, 
                manuallySelectedTAs, 
                proctorNum, 
                prioritizeCourseAssistants, 
                autoAssignRemainingTAs,
                department,
                examDate,
                checkLeaveRequests,
                strictLeaveCheck
            } = req.body;

            // Validation checks
            if (!examId && !courseName) {
                return res.status(400).json({
                    success: false,
                    message: 'Either examId or courseName must be provided'
                });
            }

            // If examId is provided, validate ownership/access
            if (examId) {
                const existingExam = await examService.getExamById(examId);
                
                // Check if the exam belongs to the authenticated instructor
                if (existingExam.instructorId !== instructorId) {
                    // Check if the exam is for a course taught by this instructor
                    const isCourseInstructor = await examService.isInstructorForExamCourse(
                        instructorId,
                        existingExam.courseName
                    );

                    if (!isCourseInstructor) {
                        return res.status(403).json({
                            success: false,
                            message: 'Not authorized to assign proctors to this exam'
                        });
                    }
                }
            }

            // Call the service to assign proctors
            const result = await examService.assignProctors({
                examId,
                courseName,
                instructorId,
                manuallySelectedTAs: manuallySelectedTAs || [],
                proctorNum: proctorNum || 1,
                prioritizeCourseAssistants: prioritizeCourseAssistants || false,
                autoAssignRemainingTAs: autoAssignRemainingTAs || false,
                department: department || req.user.department,
                examDate: examDate,
                checkLeaveRequests: checkLeaveRequests !== false,
                strictLeaveCheck: strictLeaveCheck === true
            });

            return res.status(200).json({
                success: true,
                data: result,
                message: 'Proctors assigned successfully'
            });
        } catch (error) {
            console.error('Error assigning proctors:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to assign proctors'
            });
        }
    }

    /**
     * Swap a proctor for an exam
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async swapProctor(req, res) {
        try {
            const { examId } = req.params;
            const { oldProctorId, newProctorId } = req.body;
            const instructorId = req.user.id;

            // Validate input
            if (!oldProctorId || !newProctorId) {
                return res.status(400).json({
                    success: false,
                    message: 'Both oldProctorId and newProctorId are required'
                });
            }

            // Get the exam to check ownership/access
            const existingExam = await examService.getExamById(examId);
            
            // Check if the exam belongs to the authenticated instructor
            if (existingExam.instructorId !== instructorId) {
                // Check if the exam is for a course taught by this instructor
                const isCourseInstructor = await examService.isInstructorForExamCourse(
                    instructorId,
                    existingExam.courseName
                );

                if (!isCourseInstructor) {
                    return res.status(403).json({
                        success: false,
                        message: 'Not authorized to swap proctors for this exam'
                    });
                }
            }

            // Call the service to swap proctors
            const result = await examService.swapProctor(examId, oldProctorId, newProctorId, instructorId);

            return res.status(200).json({
                success: true,
                data: result,
                message: 'Proctor swapped successfully'
            });
        } catch (error) {
            console.error('Error swapping proctor:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to swap proctor'
            });
        }
    }

    /**
     * Get swap history for an exam
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getSwapHistory(req, res) {
        try {
            const { examId } = req.params;
            const instructorId = req.user.id;

            // Get the exam to check ownership/access
            const existingExam = await examService.getExamById(examId);
            
            // Check if the exam belongs to the authenticated instructor
            if (existingExam.instructorId !== instructorId) {
                // Check if the exam is for a course taught by this instructor
                const isCourseInstructor = await examService.isInstructorForExamCourse(
                    instructorId,
                    existingExam.courseName
                );

                if (!isCourseInstructor) {
                    return res.status(403).json({
                        success: false,
                        message: 'Not authorized to view swap history for this exam'
                    });
                }
            }

            // Call the service to get swap history
            const swapHistory = await examService.getSwapHistory(examId);

            return res.status(200).json({
                success: true,
                data: swapHistory
            });
        } catch (error) {
            console.error('Error getting swap history:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to get swap history'
            });
        }
    }

    /**
     * Check for TAs with approved leave on a specific date
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async checkTALeaveStatus(req, res) {
        try {
            const { examDate } = req.query;
            
            if (!examDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Exam date is required'
                });
            }
            
            // Get all TAs with approved leave on the specified date
            const tasWithLeave = await examService.getTAsWithLeaveOnDate(examDate);
            
            return res.status(200).json({
                success: true,
                data: tasWithLeave,
                message: `Found ${tasWithLeave.length} TAs with approved leave on ${examDate}`
            });
        } catch (error) {
            console.error('Error checking TA leave status:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to check TA leave status'
            });
        }
    }

    /**
     * Get available TAs for exam proctoring with leave status check
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getAvailableTAsForExam(req, res) {
        try {
            const { department, courseId, examDate, checkLeaveRequests } = req.query;
            
            // Default to instructor's department if not specified
            const deptFilter = department || req.user.department;
            
            // Convert checkLeaveRequests to boolean
            const shouldCheckLeave = checkLeaveRequests !== 'false';
            
            // Pass query parameters to the service
            const tas = await examService.getAvailableTAsForExam({
                department: deptFilter,
                courseId,
                examDate,
                checkLeaveRequests: shouldCheckLeave
            });

            return res.status(200).json({
                success: true,
                data: tas,
                message: `Found ${tas.length} available TAs${shouldCheckLeave ? ' (with leave check)' : ''}`
            });
        } catch (error) {
            console.error('Error getting available TAs for exam:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to get available TAs for exam'
            });
        }
    }

    /**
     * Get all classrooms
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getAllClassrooms(req, res) {
        try {
            const classrooms = await examService.getAllClassrooms();
            
            return res.status(200).json({
                success: true,
                data: classrooms
            });
        } catch (error) {
            console.error('Error getting classrooms:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to get classrooms'
            });
        }
    }

    /**
     * Request a proctor swap for an exam
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async requestSwapProctor(req, res) {
        try {
            const { examId } = req.params;
            const { oldProctorId, newProctorId } = req.body;
            const instructorId = req.user.id;

            // Validate input
            if (!oldProctorId || !newProctorId) {
                return res.status(400).json({
                    success: false,
                    message: 'Both oldProctorId and newProctorId are required'
                });
            }

            // Get the exam to check ownership/access
            const existingExam = await examService.getExamById(examId);
            
            // Check if the exam belongs to the authenticated instructor
            if (existingExam.instructorId !== instructorId) {
                // Check if the exam is for a course taught by this instructor
                const isCourseInstructor = await examService.isInstructorForExamCourse(
                    instructorId,
                    existingExam.courseName
                );

                if (!isCourseInstructor) {
                    return res.status(403).json({
                        success: false,
                        message: 'Not authorized to request proctor swaps for this exam'
                    });
                }
            }

            // Call the service to request a proctor swap
            const result = await examService.requestSwapProctor(examId, oldProctorId, newProctorId, instructorId);

            return res.status(200).json({
                success: true,
                data: result,
                message: 'Proctor swap request sent successfully'
            });
        } catch (error) {
            console.error('Error requesting proctor swap:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to request proctor swap'
            });
        }
    }
}

module.exports = new ExamController();