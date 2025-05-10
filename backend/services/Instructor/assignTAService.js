const { assign } = require('nodemailer/lib/shared');
const { User, DepartmentChair, Course, TeachingAssistant, TARequest, Instructor } = require('../../models');
const { Op } = require('sequelize');

/**
 * Service for handling department chair operations
 */
class assignTAService {
    async assignTAsToCourse(courseId, taIds) {
        try {
            console.log(`Assigning TAs to course ${courseId}. TA IDs: ${taIds.join(', ')}`);
            
            const course = await Course.findByPk(courseId, {
                include: [{ model: TeachingAssistant, as: 'TAs' }]
            });
            
            if (!course) {
                throw new Error('Course not found');
            }

            // First get the existing TA assignments to later check what changed
            const existingTAs = await this.getCourseTAs(courseId);
            const existingTAIds = existingTAs.map(ta => ta.id);
            
            console.log(`Existing TAs for course ${courseId}: ${existingTAIds.join(', ') || 'None'}`);
            
            // IMPORTANT: Remove ALL existing TA assignments for this course using Sequelize methods
            console.log(`Removing all existing TA assignments for course ${courseId}`);
            
            // Method 1: If we have the TAs loaded on the course object, remove them specifically
            if (course.TAs && course.TAs.length > 0) {
                console.log(`Found ${course.TAs.length} TAs directly on course object to remove`);
                // Remove each TA individually first to ensure thorough removal
                for (const ta of course.TAs) {
                    console.log(`Removing individual TA ${ta.id} from course ${courseId}`);
                    await course.removeTA(ta);
                }
                
                // Then do a bulk removal as well
                console.log(`Doing bulk removal of all TAs from course ${courseId}`);
                await course.removeTAs(course.TAs);
            }
            
            // Method 2: Use the general removeTAs method with no arguments to remove all
            console.log(`Using general removeTAs() method for course ${courseId}`);
            await course.removeTAs();
            
            // Double-check that TAs were removed
            const courseAfterRemoval = await Course.findByPk(courseId, {
                include: [{ model: TeachingAssistant, as: 'TAs' }]
            });
            
            if (courseAfterRemoval.TAs && courseAfterRemoval.TAs.length > 0) {
                console.log(`WARNING: Still found ${courseAfterRemoval.TAs.length} TAs after removal. Trying individual removal...`);
                
                // Last resort: try removing each one individually again
                for (const ta of courseAfterRemoval.TAs) {
                    console.log(`Final attempt: Removing TA ${ta.id} individually`);
                    await courseAfterRemoval.removeTA(ta);
                }
                
                // Get a fresh course object after all removal attempts
                const finalCheckCourse = await Course.findByPk(courseId, {
                    include: [{ model: TeachingAssistant, as: 'TAs' }]
                });
                
                if (finalCheckCourse.TAs && finalCheckCourse.TAs.length > 0) {
                    console.error(`CRITICAL: Unable to remove all TAs from course ${courseId} after multiple attempts`);
                } else {
                    console.log(`Successfully removed all TAs from course ${courseId} after multiple attempts`);
                }
            } else {
                console.log(`Successfully removed all TAs from course ${courseId}`);
            }
            
            if (taIds.length === 0) {
                console.log(`No new TAs to assign for course ${courseId}`);
                return {
                    courseId: course.id,
                    courseCode: course.courseCode,
                    assignedTAs: 0
                };
            }
            
            // Find all TAs with the given IDs
            const tasToAssign = await TeachingAssistant.findAll({
                where: {
                    id: { [Op.in]: taIds }
                }
            });
            
            console.log(`Found ${tasToAssign.length} TAs to assign to course ${courseId}`);

            // Get a fresh course object before adding new TAs
            const freshCourse = await Course.findByPk(courseId);
            
            // Assign TAs to the course
            if (tasToAssign.length > 0) {
                console.log(`Adding ${tasToAssign.length} TAs to course ${courseId}`);
                await freshCourse.addTAs(tasToAssign);
                console.log(`Successfully assigned ${tasToAssign.length} TAs to course ${courseId}`);
            }

            // Update all related TARequests to 'approved' if they match the assigned TAs
            await TARequest.update(
                { status: 'approved' },
                {
                    where: {
                        courseId,
                        taId: { [Op.in]: taIds },
                        status: { [Op.ne]: 'approved' }
                    }
                }
            );

            // Mark all other requests for this course as 'rejected'
            await TARequest.update(
                { status: 'rejected' },
                {
                    where: {
                        courseId,
                        taId: { [Op.notIn]: taIds },
                        status: { [Op.ne]: 'rejected' }
                    }
                }
            );

            // Final verification
            const finalCourse = await Course.findByPk(courseId, {
                include: [{ model: TeachingAssistant, as: 'TAs' }]
            });
            
            const finalTACount = finalCourse.TAs ? finalCourse.TAs.length : 0;
            console.log(`FINAL verification: Course ${courseId} has ${finalTACount} TAs assigned`);
            
            if (finalTACount !== tasToAssign.length) {
                console.log(`WARNING: Expected ${tasToAssign.length} TAs but found ${finalTACount}`);
            }

            return {
                courseId: course.id,
                courseCode: course.courseCode,
                assignedTAs: tasToAssign.length
            };
        } catch (error) {
            console.error('Error in assignTAsToCourse service:', error);
            throw new Error('Failed to assign TAs to course');
        }
    }


    /**
     * Get a department chair's profile
     * @param {string|number} chairId - The ID of the department chair
     * @returns {Promise<Object>} - Department chair profile data
     */
    async getChairProfile(instructorId) {
        try {
            console.log('Fetching profile for chair ID:', instructorId);
            
            // Find the chair without joins first
            const instructor = await Instructor.findByPk(instructorId);

            if (!instructor) {
                console.log(`No instructor found with ID: ${instructorId}`);
                // For development, return a mock profile
                return {
                    id: instructorId,
                    name: 'Department Chair',
                    email: 'chair@example.com',
                    department: 'Computer Science'
                };
            }

            console.log(`Found instructor with department: ${instructor.department}`);
            
            // Try to get the user info if available
            try {
                const user = await User.findByPk(instructorId);
                return {
                    id: instructorId,
                    name: user ? user.name : 'Department Chair',
                    email: user ? user.email : 'chair@example.com',
                    department: instructor.department
                };
            } catch (userError) {
                console.error('Error fetching user data for chair:', userError);
                // Return what we have without the user data
                return {
                    id: instructorId,
                    name: 'Department Chair',
                    email: 'chair@example.com',
                    department: instructor.department
                };
            }
        } catch (error) {
            console.error('Error in getChairProfile service:', error);
            // For development, return a mock profile
            return {
                id: instructor,
                name: 'Department Chair',
                email: 'chair@example.com',
                department: 'Computer Science'
            };
        }
    }

    /**
     * Get a department chair's department
     * @param {string|number} chairId - The ID of the department chair
     * @returns {Promise<string>} - Department name
     */
    async getChairDepartment(instructorId) {
        try {
            console.log('Fetching department for chair ID:', instructorId);
            
            const instructor = await Instructor.findByPk(instructorId);

            if (!instructor) {
                console.log(`No instructor found with ID: ${instructorId}, returning default department`);
                return 'Computer Science'; // Default department for development
            }

            console.log(`Found department: ${instructor.department}`);
            return instructor.department;
        } catch (error) {
            console.error('Error in getChairDepartment service:', error);
            return 'Computer Science'; // Default department for development
        }
    }

    /**
     * Get all courses for a department
     * @param {string} department - The department name
     * @returns {Promise<Array>} - Array of course objects
     */
    async getDepartmentCourses(department) {
        try {
            console.log('Fetching courses for department:', department);
            
            // First, simply get all courses for the department without complex joins
            const courses = await Course.findAll({
                where: { department }
            });
            
            console.log(`Found ${courses.length} courses for department ${department}`);
            
            // Map courses to simpler objects with calculated TA needs
            return courses.map(course => {
                const taNeeded = Math.ceil(course.studentCount / 50) || 1; // Default 1 if studentCount not set
                return {
                    id: course.id,
                    courseCode: course.courseCode,
                    courseName: course.courseName,
                    department: course.department,
                    credit: course.credit,
                    isGradCourse: course.isGradCourse,
                    semesterId: course.semesterId,
                    studentCount: course.studentCount,
                    taNeeded: taNeeded,
                    // We'll load TA counts and instructor info in separate queries if needed
                    assignedTAs: 0,
                    instructors: []
                };
            });
        } catch (error) {
            console.error('Error in getDepartmentCourses service:', error);
            throw new Error(`Failed to retrieve department courses: ${error.message}`);
        }
    }

    /**
     * Get all available TAs for a department
     * @param {string} department - The department name
     * @returns {Promise<Array>} - Array of TA objects with user data
     */
    async getAvailableTAs(department) {
        try {
            console.log('Fetching TAs for department:', department);
            
            // First get just the teaching assistants
            const tas = await TeachingAssistant.findAll({
                where: { department }
            });
            
            console.log(`Found ${tas.length} TAs for department ${department}`);
            
            // Map to simplified objects
            return tas.map(ta => ({
                id: ta.id,
                name: 'TA ' + ta.id, // Default name if User data not available
                department: ta.department,
                isPHD: ta.isPHD,
                isPartTime: ta.isPartTime
            }));
        } catch (error) {
            console.error('Error in getAvailableTAs service:', error);
            throw new Error(`Failed to retrieve available TAs: ${error.message}`);
        }
    }

    /**
     * Get all TA requests for a department
     * @param {string} department - The department name
     * @returns {Promise<Array>} - Array of TA request objects
     */
    async getTARequests(department) {
        try {
            console.log('Fetching TA requests for department:', department);
            
            // Find all course IDs that belong to this department
            const courses = await Course.findAll({
                where: { department },
                attributes: ['id', 'courseCode', 'courseName']
            });

            console.log(`Found ${courses.length} courses for department ${department}`);
            
            if (courses.length === 0) {
                return []; // No courses, so no requests
            }

            const courseIds = courses.map(course => course.id);
            const courseMap = {};
            
            // Create a map of course ID to course info for quick lookup
            courses.forEach(course => {
                courseMap[course.id] = {
                    id: course.id,
                    courseCode: course.courseCode,
                    courseName: course.courseName
                };
            });

            // Get all TA requests for these courses with minimal joins
            const requests = await TARequest.findAll({
                where: {
                    courseId: { [Op.in]: courseIds }
                },
                attributes: ['id', 'taId', 'courseId', 'instructorId', 'priority', 'reason', 'status', 'createdAt']
            });

            console.log(`Found ${requests.length} TA requests for department ${department}`);

            // Return simplified request data
            return requests.map(request => {
                return {
                    id: request.id,
                    taId: request.taId,
                    ta: {
                        id: request.taId,
                        name: 'TA ' + request.taId
                    },
                    courseId: request.courseId,
                    course: courseMap[request.courseId] || { id: request.courseId, courseCode: 'Unknown', courseName: 'Unknown Course' },
                    instructorId: request.instructorId,
                    instructor: {
                        id: request.instructorId,
                        name: 'Instructor ' + request.instructorId
                    },
                    priority: request.priority,
                    reason: request.reason,
                    status: request.status,
                    createdAt: request.createdAt
                };
            });
        } catch (error) {
            console.error('Error in getTARequests service:', error);
            throw new Error(`Failed to retrieve TA requests: ${error.message}`);
        }
    }

    /**
     * Verify that a course belongs to a department
     * @param {string|number} courseId - The ID of the course
     * @param {string} department - The department name
     * @returns {Promise<boolean>} - True if course belongs to department
     */
    async verifyCourseInDepartment(courseId, department) {
        try {
            const course = await Course.findOne({
                where: {
                    id: courseId,
                    department
                }
            });

            return !!course; // Return true if course exists, false otherwise
        } catch (error) {
            console.error('Error in verifyCourseInDepartment service:', error);
            throw new Error('Failed to verify course department');
        }
    }

    /**
     * Get TAs assigned to a specific course
     * @param {string|number} courseId - The ID of the course
     * @returns {Promise<Array>} - Array of assigned TA objects
     */
    async getCourseTAs(courseId) {
        try {
            console.log(`Fetching assigned TAs for course ID: ${courseId}`);
            
            const course = await Course.findByPk(courseId);
            if (!course) {
                console.log(`Course not found with ID ${courseId}`);
                throw new Error('Course not found');
            }
            
            console.log(`Found course: ${course.courseCode} (${course.courseName})`);
            
            // Get TAs with their user data
            const courseWithTAs = await Course.findByPk(courseId, {
                include: [
                    { 
                        model: TeachingAssistant, 
                        as: 'TAs',
                        include: [
                            {
                                model: User,
                                as: 'taUser',
                                attributes: ['id', 'name', 'email']
                            }
                        ] 
                    }
                ]
            });
            
            if (!courseWithTAs || !courseWithTAs.TAs) {
                console.log(`No TAs found for course ${courseId}`);
                return [];
            }
            
            console.log(`Found ${courseWithTAs.TAs.length} TAs assigned to course ${courseId}`);
            
            // Map the TAs to a simpler object format
            const assignedTAs = courseWithTAs.TAs.map(ta => {
                const taObject = {
                    id: ta.id,
                    name: ta.taUser ? ta.taUser.name : `TA ${ta.id}`,
                    email: ta.taUser ? ta.taUser.email : 'unknown',
                    department: ta.department,
                    isPHD: ta.isPHD,
                    isPartTime: ta.isPartTime
                };
                
                console.log(`TA ${ta.id}: ${taObject.name}, ${taObject.email}`);
                return taObject;
            });
            
            console.log(`Returning ${assignedTAs.length} mapped TA objects`);
            return assignedTAs;
        } catch (error) {
            console.error(`Error in getCourseTAs service for course ${courseId}:`, error);
            throw new Error('Failed to retrieve TAs assigned to course');
        }
    }
}

module.exports = new assignTAService();