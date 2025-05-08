const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const sequelize = require('../../config/db');
const Instructor = require('../../models/Instructor');
const User = require('../../models/User');
const Exam = require('../../models/Exam');
const Course = require('../../models/Course');


class ExamService {
    /**
     * Create a new exam
     * @param {Object} examData - The exam data
     * @returns {Promise<Object>} The created exam
     */
    async createExam(examData) {
        const t = await sequelize.transaction();

        try {
            // Generate a unique ID for the exam if not provided
            const examId = examData.id || uuidv4();

            // Process classrooms array into comma-separated string if it exists
            if (examData.classrooms && Array.isArray(examData.classrooms)) {
                examData.classrooms = examData.classrooms.join(',');
            }

            // Debug log
            console.log("courseeid",examData.courseName);
            const course = await Course.findByPk(examData.courseName);

            console.log('Creating exam with data:', examData);

            // Create the exam with the generated ID
            const exam = await Exam.create({
                id: examId,
                courseName: examData.courseName,
                courseId: examData.courseId,
                instructorId: examData.instructorId,
                date: examData.date,
                duration: examData.duration,
                examType: examData.examType,
                classrooms: examData.classrooms || '',
                proctorNum: examData.proctorNum,
                department: examData.department,
                manualAssignedTAs: examData.manualAssignedTAs || 0,
                autoAssignedTAs: examData.autoAssignedTAs || 0
            }, { transaction: t });

            await t.commit();
            return exam;
        } catch (error) {
            await t.rollback();
            throw new Error(`Failed to create exam: ${error.message}`);
        }
    }

    /**
     * Get all exams for an instructor
     * @param {string} instructorId - The instructor's ID
     * @returns {Promise<Array>} List of exams
     */
    async getExamsByInstructorId(instructorId) {
        try {
            const exams = await Exam.findAll({
                where: {
                    instructorId,
                    isOutdated: false
                },
                order: [['date', 'ASC']]
            });

            // Process the exams to convert classrooms back to arrays and format dates
            return exams.map(exam => {
                const examData = exam.get({ plain: true });
                examData.classrooms = examData.classrooms.split(',');

                // Format date and calculate start/end times
                const examDate = new Date(examData.date);
                examData.formattedDate = examDate.toLocaleDateString('tr-TR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

                // Calculate start time
                const startTime = examDate.toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });

                // Calculate end time by adding duration
                const endDate = new Date(examDate.getTime() + examData.duration * 60000);
                const endTime = endDate.toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });

                examData.startTime = startTime;
                examData.endTime = endTime;

                return examData;
            });
        } catch (error) {
            throw new Error(`Failed to get instructor exams: ${error.message}`);
        }
    }

    /**
     * Get a single exam by ID
     * @param {string} examId - The exam ID
     * @returns {Promise<Object>} The exam
     */
    async getExamById(examId) {
        try {
            const exam = await Exam.findByPk(examId);

            if (!exam) {
                throw new Error('Exam not found');
            }

            const examData = exam.get({ plain: true });
            console.log("examData",examData);
            return examData;
        } catch (error) {
            throw new Error(`Failed to get exam: ${error.message}`);
        }
    }

    /**
     * Update an existing exam
     * @param {string} examId - The exam ID to update
     * @param {Object} examData - The updated exam data
     * @returns {Promise<Object>} The updated exam
     */
    async updateExam(examId, examData) {
        const t = await sequelize.transaction();

        try {
            const exam = await Exam.findByPk(examId, { transaction: t });

            if (!exam) {
                throw new Error('Exam not found');
            }

            // Process classrooms array into comma-separated string
            if (Array.isArray(examData.classrooms)) {
                examData.classrooms = examData.classrooms.join(',');
            }

            // Update the exam
            await exam.update(examData, { transaction: t });

            await t.commit();
            return this.getExamById(examId);
        } catch (error) {
            await t.rollback();
            throw new Error(`Failed to update exam: ${error.message}`);
        }
    }

    /**
     * Delete an exam
     * @param {string} examId - The exam ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteExam(examId) {
        const t = await sequelize.transaction();

        try {
            const exam = await Exam.findByPk(examId, { transaction: t });

            if (!exam) {
                throw new Error('Exam not found');
            }

            // Hard delete the exam
            await exam.destroy({ transaction: t });

            await t.commit();
            return true;
        } catch (error) {
            await t.rollback();
            throw new Error(`Failed to delete exam: ${error.message}`);
        }
    }

    /**
     * Get exams with assigned proctors
     * @param {string} instructorId - The instructor's ID
     * @returns {Promise<Array>} List of exams with proctors
     */
    async getExamsWithProctors(instructorId) {
        try {
            // Get exams for this instructor
            const exams = await this.getExamsByInstructorId(instructorId);

            // For each exam, fetch the assigned proctors
            for (const exam of exams) {
                exam.proctors = await this.getProctorsForExam(exam.id);

                // Add a swap count property if not present
                exam.swapCount = exam.swapCount || 0;
            }

            return exams;
        } catch (error) {
            throw new Error(`Failed to get exams with proctors: ${error.message}`);
        }
    }

    /**
     * Get exams for courses taught by an instructor
     * @param {string} instructorId - The instructor's ID
     * @returns {Promise<Array>} List of exams
     */
    async getExamsForInstructorCourses(instructorId) {
        try {
            // Debug logging to check if models are defined
            console.log('Instructor model:', !!Instructor);
            console.log('Course model:', !!Course);
            console.log('Exam model:', !!Exam);

            // First, get all courses for this instructor
            const instructor = await Instructor.findByPk(instructorId, {
                include: [
                    {
                        model: Course,
                        as: 'courses',
                        through: { attributes: [] } // Don't include junction table attributes
                    }
                ]
            });

            if (!instructor || !instructor.courses || instructor.courses.length === 0) {
                return [];
            }

            // Get course IDs
            const courseIds = instructor.courses.map(course => course.id);


            // Find all exams for these courses
            const exams = await Exam.findAll({
                where: {
                    courseName: {
                        [Op.in]: courseIds
                    },
                    isOutdated: false
                },
                order: [['date', 'ASC']]
            });
            console.log("examsss",exams);

            // Process exams to include formatted dates and times
            const formattedExams = exams.map(exam => {
                const examData = exam.get({ plain: true });
                console.log('Raw exam data:', examData);
                console.log('Raw date from database:', examData.date);
                
                // Ensure classrooms is always an array
                examData.classrooms = examData.classrooms ? examData.classrooms.split(',') : [];

                // Format date and calculate start/end times
                const examDate = new Date(examData.date);
                console.log('Parsed date:', examDate);
                
                // Check if date is valid
                if (isNaN(examDate.getTime())) {
                    console.error('Invalid date:', examData.date);
                    examData.formattedDate = 'Invalid date';
                    examData.startTime = 'Invalid time';
                    examData.endTime = 'Invalid time';
                    return examData;
                }

                // Format date as DD/MM/YYYY
                examData.formattedDate = examDate.toLocaleDateString('tr-TR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

                // Format start time
                examData.startTime = examDate.toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });

                // Calculate end time by adding duration
                const endDate = new Date(examDate.getTime() + examData.duration * 60000);
                examData.endTime = endDate.toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });

                return examData;
            });

            // For each exam, fetch the assigned proctors
            for (const exam of formattedExams) {
                exam.proctors = await this.getProctorsForExam(exam.id);

                // Add a swap count property if not present
                exam.swapCount = exam.swapCount || 0;
            }

            return formattedExams;
        } catch (error) {
            console.error('Error in getExamsForInstructorCourses:', error);
            throw new Error(`Failed to get exams for instructor courses: ${error.message}`);
        }
    }

    /**
     * Get proctors for an exam
     * @param {string} examId - The exam ID
     * @returns {Promise<Array>} List of proctors
     */
    async getProctorsForExam(examId) {
        try {
            // This would be implemented based on your database structure
            // For example, if you have an ExamProctor table relating exams to TAs

            // Mock implementation for now
            return [
                { id: '1', name: 'Sude Ergün' },
                { id: '2', name: 'Rıdvan Yılmaz' }
            ];
        } catch (error) {
            throw new Error(`Failed to get proctors for exam: ${error.message}`);
        }
    }

    /**
     * Check if an instructor teaches the course associated with an exam
     * @param {string} instructorId - The instructor ID
     * @param {string} courseId - The course ID
     * @returns {Promise<boolean>} Whether the instructor teaches the course
     */
    async isInstructorForExamCourse(instructorId, courseId) {
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
            // If there's an error, it's likely because the instructor doesn't teach the course
            return false;
        }
    }

    /**
     * Get all courses
     * @param {Object} filters - Optional filters
     * @returns {Promise<Array>} List of courses
     */
    async getCourses(department = null, semesterId = null) {
        try {
            const whereClause = {};

            if (department) {
                whereClause.department = department;
            }

            if (semesterId) {
                whereClause.semesterId = semesterId;
            }

            const courses = await Course.findAll({
                where: whereClause,
                order: [['courseCode', 'ASC']]
            });

            return courses;
        } catch (error) {
            throw new Error(`Failed to get courses: ${error.message}`);
        }
    }
}

module.exports = new ExamService();