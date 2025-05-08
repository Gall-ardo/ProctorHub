const { Course, TARequest, User, TeachingAssistant, Instructor } = require('../../models');
const { Op } = require('sequelize');
const uuid = require('uuid');

/**
 * Service for handling instructor TA request operations
 */
class InstructorTARequestService {
    /**
     * Get all courses associated with an instructor
     * @param {string|number} instructorId - The ID of the instructor
     * @returns {Promise<Array>} - Array of course objects
     */
    async getInstructorCourses(instructorId) {
        try {
            // Based on your database schema, instructors and courses have a many-to-many relationship
            // through the "InstructorCourses" table
            const instructor = await Instructor.findByPk(instructorId, {
                include: [
                    {
                        model: Course,
                        as: 'courses',
                        // Filtering active courses would go here if Course has a status column
                        attributes: [
                            'id',
                            'courseCode',
                            'courseName',
                            'department',
                            'credit',
                            'isGradCourse',
                            'semesterId',
                            'studentCount'
                        ]
                    }
                ]
            });
            console.log("insss",instructor);
            if (!instructor) {
                throw new Error('Instructor not found');
            }

            // Map the courses to add any needed fields like taNeeded
            const courses = instructor.courses.map(course => {
                // Calculate taNeeded based on studentCount if needed
                const taNeeded = Math.ceil(course.studentCount / 50); // Example calculation

                return {
                    id: course.id,
                    courseCode: course.courseCode,
                    courseName: course.courseName,
                    department: course.department,
                    credit: course.credit,
                    isGradCourse: course.isGradCourse,
                    semesterId: course.semesterId,
                    studentCount: course.studentCount,
                    taNeeded: taNeeded
                };
            });
            console.log("coursess",courses);
            return courses;
        } catch (error) {
            console.error('Error in getInstructorCourses service:', error);
            throw new Error('Failed to retrieve instructor courses');
        }
    }

    /**
     * Get all TA requests submitted by an instructor
     * @param {string|number} instructorId - The ID of the instructor
     * @returns {Promise<Array>} - Array of TA request objects with related data
     */
    async getInstructorTARequests(instructorId) {
        try {
            // Get all TA requests made by this instructor
            const requests = await TARequest.findAll({
                where: {
                    instructorId: instructorId
                },
                include: [
                    {
                        model: TeachingAssistant,
                        foreignKey: 'taId',
                        attributes: ['id'],
                        include: {
                            model: User,
                            as: 'taUser', // Based on your models.js associations
                            attributes: ['id', 'name', 'email']
                        }
                    },
                    {
                        model: Course,
                        foreignKey: 'courseId',
                        attributes: ['id', 'courseCode', 'courseName', 'semesterId']
                    }
                ],
                order: [
                    ['createdAt', 'DESC']
                ]
            });

            // Transform the data to match the format expected by the frontend
            const transformedRequests = requests.map(request => {
                // Check if TA and User exist before accessing their properties
                let taData = {
                    id: request.taId,
                    name: 'Unknown',
                    email: ''
                };

                if (request.TeachingAssistant && request.TeachingAssistant.taUser) {
                    taData = {
                        id: request.TeachingAssistant.id,
                        name: request.TeachingAssistant.taUser.name,
                        email: request.TeachingAssistant.taUser.email
                    };
                }

                return {
                    id: request.id,
                    taId: request.taId,
                    ta: taData,
                    courseId: request.courseId,
                    course: {
                        id: request.Course.id,
                        courseCode: request.Course.courseCode,
                        courseName: request.Course.courseName,
                        semester: request.Course.semesterId ? request.Course.semesterId.split('-')[0] : '',
                        year: request.Course.semesterId ? request.Course.semesterId.split('-')[1] : ''
                    },
                    priority: request.priority,
                    reason: request.reason,
                    status: request.status,
                    createdAt: request.createdAt,
                    updatedAt: request.updatedAt
                };
            });

            return transformedRequests;
        } catch (error) {
            console.error('Error in getInstructorTARequests service:', error);
            throw new Error('Failed to retrieve instructor TA requests');
        }
    }

    /**
     * Create a new TA request or update an existing one
     * @param {string|number} instructorId - The ID of the instructor
     * @param {string|number} taId - The ID of the TA
     * @param {string|number} courseId - The ID of the course
     * @param {string} priority - The priority level (High, Medium, Low)
     * @param {string} reason - The reason for the request
     * @returns {Promise<Object>} - The created or updated TA request
     */
    async createTARequest(instructorId, taId, courseId, priority, reason) {
        try {
            // Input validation
            if (!instructorId || !taId || !courseId) {
                throw new Error('InstructorId, taId, and courseId are required');
            }
            
            if (!['High', 'Medium', 'Low'].includes(priority)) {
                throw new Error('Priority must be High, Medium, or Low');
            }

            // Check if a request already exists for this TA and course
            const existingRequest = await TARequest.findOne({
                where: {
                    instructorId: instructorId,
                    taId: taId,
                    courseId: courseId
                }
            });

            if (existingRequest) {
                // Update the existing request instead of creating a new one
                await existingRequest.update({
                    priority: priority,
                    reason: reason,
                    status: 'updated' // Mark as updated
                });

                // Fetch the updated request with associations
                const updatedRequest = await TARequest.findByPk(existingRequest.id, {
                    include: [
                        {
                            model: TeachingAssistant,
                            include: {
                                model: User,
                                as: 'taUser',
                                attributes: ['id', 'name', 'email']
                            }
                        },
                        {
                            model: Course,
                            attributes: ['id', 'courseCode', 'courseName']
                        }
                    ]
                });

                // Transform response format
                let taData = {
                    id: updatedRequest.taId,
                    name: 'Unknown',
                    email: ''
                };

                if (updatedRequest.TeachingAssistant && updatedRequest.TeachingAssistant.taUser) {
                    taData = {
                        id: updatedRequest.TeachingAssistant.id,
                        name: updatedRequest.TeachingAssistant.taUser.name,
                        email: updatedRequest.TeachingAssistant.taUser.email
                    };
                }

                return {
                    id: updatedRequest.id,
                    taId: updatedRequest.taId,
                    ta: taData,
                    courseId: updatedRequest.courseId,
                    course: {
                        id: updatedRequest.Course.id,
                        courseCode: updatedRequest.Course.courseCode,
                        courseName: updatedRequest.Course.courseName
                    },
                    priority: updatedRequest.priority,
                    reason: updatedRequest.reason,
                    status: updatedRequest.status,
                    createdAt: updatedRequest.createdAt,
                    updatedAt: updatedRequest.updatedAt
                };
            }

            // Generate a unique ID for the new request
            const requestId = uuid.v4();

            // Create a new TA request
            const newRequest = await TARequest.create({
                id: requestId,
                instructorId: instructorId,
                taId: taId,
                courseId: courseId,
                priority: priority,
                reason: reason,
                status: 'pending' // Initial status
            });

            // Fetch the created request with associations
            const createdRequest = await TARequest.findByPk(newRequest.id, {
                include: [
                    {
                        model: TeachingAssistant,
                        include: {
                            model: User,
                            as: 'taUser',
                            attributes: ['id', 'name', 'email']
                        }
                    },
                    {
                        model: Course,
                        attributes: ['id', 'courseCode', 'courseName']
                    }
                ]
            });

            // Transform response format
            let taData = {
                id: createdRequest.taId,
                name: 'Unknown',
                email: ''
            };

            if (createdRequest.TeachingAssistant && createdRequest.TeachingAssistant.taUser) {
                taData = {
                    id: createdRequest.TeachingAssistant.id,
                    name: createdRequest.TeachingAssistant.taUser.name,
                    email: createdRequest.TeachingAssistant.taUser.email
                };
            }

            return {
                id: createdRequest.id,
                taId: createdRequest.taId,
                ta: taData,
                courseId: createdRequest.courseId,
                course: {
                    id: createdRequest.Course.id,
                    courseCode: createdRequest.Course.courseCode,
                    courseName: createdRequest.Course.courseName
                },
                priority: createdRequest.priority,
                reason: createdRequest.reason,
                status: createdRequest.status,
                createdAt: createdRequest.createdAt,
                updatedAt: createdRequest.updatedAt
            };
        } catch (error) {
            console.error('Error in createTARequest service:', error);
            throw error; // Rethrow to allow controller to handle specific error messages
        }
    }

    /**
     * Delete a TA request
     * @param {string|number} instructorId - The ID of the instructor
     * @param {string|number} requestId - The ID of the TA request
     * @returns {Promise<void>}
     */
    async deleteTARequest(instructorId, requestId) {
        try {
            // Find the request and ensure it belongs to the instructor
            const request = await TARequest.findOne({
                where: {
                    id: requestId,
                    instructorId: instructorId
                }
            });

            if (!request) {
                throw new Error('TA request not found or you are not authorized to delete it');
            }

            // Check if the request can be deleted (not already submitted/approved)
            if (request.status === 'submitted' || request.status === 'approved') {
                throw new Error('TA request cannot be deleted because it has already been submitted or approved');
            }

            // Delete the request
            await request.destroy();
        } catch (error) {
            console.error('Error in deleteTARequest service:', error);
            throw error; // Rethrow to allow controller to handle specific error messages
        }
    }

    /**
     * Get all available TAs that can be assigned to courses
     * @returns {Promise<Array>} - Array of TA objects with user data
     */
    async getAvailableTAs() {
        try {
            // Get all TAs with their user information
            const tas = await TeachingAssistant.findAll({
                include: {
                    model: User,
                    as: 'taUser',
                    attributes: ['id', 'name', 'email']
                }
            });
            console.log("tasss", tas);

            // Transform the data to match the format expected by the frontend
            const transformedTAs = tas.map(ta => {
                return {
                    id: ta.id,
                    name: ta.taUser ? ta.taUser.name : 'Unknown',
                    email: ta.taUser ? ta.taUser.email : '',
                    department: ta.department,
                }
            });
            console.log("rfdscx", transformedTAs);
            return transformedTAs;
        } catch (error) {
            console.error('Error in getAvailableTAs service:', error);
            throw new Error('Failed to retrieve available TAs');
        }
    }
    /**
     * Submit multiple TA requests to change their status to 'submitted'
     * @param {string|number} instructorId - The ID of the instructor
     * @param {Array<string|number>} requestIds - Array of request IDs to submit
     * @returns {Promise<void>}
     */
    async submitTARequests(instructorId, requestIds) {
        try {
            // Update the status of all specified requests to 'submitted'
            const updateCount = await TARequest.update(
                { status: 'submitted' },
                {
                    where: {
                        id: { [Op.in]: requestIds },
                        instructorId: instructorId,
                        status: { [Op.in]: ['pending', 'updated'] } // Only update requests that haven't been submitted yet
                    }
                }
            );

            if (updateCount[0] === 0) {
                throw new Error('No eligible TA requests found for submission');
            }

            // Could potentially trigger a notification to the department chair here
        } catch (error) {
            console.error('Error in submitTARequests service:', error);
            throw error;
        }
    }
}

module.exports = new InstructorTARequestService();