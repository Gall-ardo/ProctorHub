const Instructor = require('../../models/Instructor');
const User = require('../../models/User');
const Semester = require('../../models/Semester');
const Course = require('../../models/Course');

const { Op } = require('sequelize');

class InstructorService {
    /**
     * Get all courses with optional filters
     * @param {Object} filters - Optional filters for courses
     * @returns {Promise<Array>} List of courses
     */
    async getAllCourses(filters = {}) {
        try {
            const whereClause = {};

            if (filters.department) {
                whereClause.department = filters.department;
            }

            if (filters.semesterId) {
                whereClause.semesterId = filters.semesterId;
            }

            const courses = await Course.findAll({
                where: whereClause,
                order: [['courseCode', 'ASC']],
                include: [
                    {
                        model: Semester,
                        as: 'semester',
                        attributes: ['id', 'name', 'startDate', 'endDate', 'isActive']
                    }
                ]
            });

            return courses;
        } catch (error) {
            throw new Error(`Failed to get courses: ${error.message}`);
        }
    }

    /**
     * Get courses for a specific instructor
     * @param {string} instructorId - The instructor ID
     * @returns {Promise<Array>} List of instructor's courses
     */
    async getCoursesForInstructor(instructorId) {
        try {
            // Check if Instructor model is properly loaded
            if (!Instructor) {
                throw new Error('Instructor model is not defined');
            }

            const options = {
                include: [
                    {
                        model: Course,
                        as: 'courses',
                        through: { attributes: [] } // Don't include junction table attributes
                    }
                ]
            };

            const instructor = await Instructor.findByPk(instructorId, options);

            if (!instructor) {
                throw new Error('Instructor not found');
            }

            return instructor.courses || [];
        } catch (error) {
            throw new Error(`Failed to get courses for instructor: ${error.message}`);
        }
    }
    /**
     * Assign a course to an instructor
     * @param {string} courseId - The course ID
     * @param {string} instructorId - The instructor ID
     * @returns {Promise<boolean>} Success status
     */
    async assignCourseToInstructor(courseId, instructorId) {
        try {
            const instructor = await Instructor.findByPk(instructorId);
            const course = await Course.findByPk(courseId);

            if (!instructor || !course) {
                throw new Error('Instructor or Course not found');
            }

            await instructor.addCourse(course);

            return true;
        } catch (error) {
            throw new Error(`Failed to assign course to instructor: ${error.message}`);
        }
    }

    /**
     * Remove a course from an instructor
     * @param {string} courseId - The course ID
     * @param {string} instructorId - The instructor ID
     * @returns {Promise<boolean>} Success status
     */
    async removeCourseFromInstructor(courseId, instructorId) {
        try {
            const instructor = await Instructor.findByPk(instructorId);
            const course = await Course.findByPk(courseId);

            if (!instructor || !course) {
                throw new Error('Instructor or Course not found');
            }

            await instructor.removeCourse(course);

            return true;
        } catch (error) {
            throw new Error(`Failed to remove course from instructor: ${error.message}`);
        }
    }

    /**
     * Check if an instructor teaches a course
     * @param {string} instructorId - The instructor ID
     * @param {string} courseId - The course ID
     * @returns {Promise<boolean>} Whether the instructor teaches the course
     */
    async isInstructorForCourse(instructorId, courseId) {
        try {
            const instructor = await Instructor.findByPk(instructorId, {
                include: [
                    {
                        model: Course,
                        as: 'courses',
                        where: { id: courseId },
                        through: { attributes: [] }
                    }
                ]
            });

            return !!instructor && instructor.courses.length > 0;
        } catch (error) {
            throw new Error(`Failed to check instructor for course: ${error.message}`);
        }
    }
}

module.exports = new InstructorService();