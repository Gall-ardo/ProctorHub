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

            // Delete related proctoring assignments first
            const Proctoring = require('../../models/Proctoring');
            await Proctoring.destroy({
                where: { examId },
                transaction: t
            });

            // Delete related swap history records if they exist
            try {
                const SwapHistory = require('../../models/SwapHistory');
                await SwapHistory.destroy({
                    where: { examId },
                    transaction: t
                });
            } catch (error) {
                console.log('No swap history found or error deleting swap history:', error.message);
                // Continue with exam deletion even if swap history deletion fails
            }

            // Finally delete the exam
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
            const Proctoring = require('../../models/Proctoring');
            const TeachingAssistant = require('../../models/TeachingAssistant');
            const User = require('../../models/User');

            // Get all proctoring assignments for this exam with the correct relationship
            const proctorings = await Proctoring.findAll({
                where: { examId },
                include: [{ 
                    model: TeachingAssistant, 
                    as: 'teachingAssistant',
                    include: [{ 
                        model: User, 
                        as: 'taUser' 
                    }] 
                }]
            });

            // Format the proctor data
            const proctors = proctorings.map(proctoring => {
                return {
                    id: proctoring.taId,
                    name: proctoring.teachingAssistant?.taUser?.name || 'Unknown TA',
                    department: proctoring.teachingAssistant?.department || 'Unknown',
                    isManualAssignment: proctoring.isManualAssignment,
                    status: proctoring.status
                };
            });

            return proctors;
        } catch (error) {
            console.error('Error in getProctorsForExam:', error);
            // Fallback to mock data if there's an error
            return [
                { id: '1', name: 'Sude Ergün', department: 'CS', isManualAssignment: true, status: 'PENDING' },
                { id: '2', name: 'Rıdvan Yılmaz', department: 'CS', isManualAssignment: false, status: 'PENDING' }
            ];
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

    /**
     * Assign proctors to an exam
     * @param {Object} options - Assignment options
     * @returns {Promise<Object>} Result of the assignment process
     */
    async assignProctors(options) {
        const { 
            examId, 
            courseName, 
            instructorId, 
            manuallySelectedTAs = [], 
            proctorNum = 1, 
            prioritizeCourseAssistants = false, 
            autoAssignRemainingTAs = false,
            department,
            examDate,
            checkLeaveRequests = false,
            strictLeaveCheck = false
        } = options;

        const t = await sequelize.transaction();

        try {
            // Step 1: Get or validate the exam
            let exam;
            if (examId) {
                exam = await Exam.findByPk(examId, { transaction: t });
                if (!exam) {
                    throw new Error('Exam not found');
                }
            } else if (courseName) {
                // This is for a new exam being created
                exam = { 
                    courseName, 
                    instructorId, 
                    department 
                };
            } else {
                throw new Error('Either examId or courseName must be provided');
            }

            // Step 2: Get TAs from the database based on department, workload and leave status
            const { v4: uuidv4 } = require('uuid');
            const Proctoring = require('../../models/Proctoring');
            
            // Step 2.1: Use the new method to get eligible TAs considering leave requests
            let availableTAs = [];
            let tasWithLeave = [];
            
            if (checkLeaveRequests && examDate) {
                // Get TAs with their leave status
                availableTAs = await this.getAvailableTAsForExam({
                    department,
                    courseId: courseName,
                    examDate,
                    checkLeaveRequests: true
                });
                
                // Extract TAs with leave for warning message
                tasWithLeave = availableTAs
                    .filter(ta => ta.onLeave)
                    .map(ta => ta.id);
                
                // If strictLeaveCheck is true, filter out TAs with leave
                if (strictLeaveCheck) {
                    availableTAs = availableTAs.filter(ta => !ta.onLeave);
                }
            } else {
                // If no leave checks needed, just get all TAs
                availableTAs = await this.getAvailableTAsForExam({
                    department,
                    courseId: courseName,
                    checkLeaveRequests: false
                });
            }
            
            // Step 2.2: Filter out TAs with approved leave from manually selected TAs
            let filteredManualTAs = manuallySelectedTAs;
            if (checkLeaveRequests && tasWithLeave.length > 0 && strictLeaveCheck) {
                const originalLength = filteredManualTAs.length;
                filteredManualTAs = filteredManualTAs.filter(taId => !tasWithLeave.includes(taId));
                
                if (filteredManualTAs.length < originalLength) {
                    console.log(`Filtered out ${originalLength - filteredManualTAs.length} manually selected TAs with approved leave`);
                }
            }

            // Step 3: If there are already proctors assigned to this exam, remove them
            if (examId) {
                await Proctoring.destroy({
                    where: { examId },
                    transaction: t
                });
            }

            // Step 4: Handle manual assignments first
            const assignedProctors = [];
            
            // Process manually selected TAs
            for (const taId of filteredManualTAs) {
                // Additional check for leave requests to be extra safe
                if (checkLeaveRequests && examDate && strictLeaveCheck) {
                    const taWithLeave = availableTAs.find(ta => ta.id === taId && ta.onLeave);
                    if (taWithLeave) {
                        console.log(`Skipping TA ${taId} - has approved leave on ${examDate}`);
                        continue; // Skip this TA
                    }
                }
                
                const ta = availableTAs.find(t => t.id === taId);
                
                if (ta) {
                    // Create a proctoring record for manual assignments
                    if (examId) {
                        await Proctoring.create({
                            id: uuidv4(),
                            examId,
                            taId: ta.id,
                            assignmentDate: new Date(),
                            isManualAssignment: true,
                            assignedBy: instructorId,
                            status: 'PENDING'
                        }, { transaction: t });
                    }
                    
                    // Add to assigned proctors list for the response
                    assignedProctors.push({
                        id: ta.id,
                        name: ta.name,
                        department: ta.department || 'Unknown',
                        isManualAssignment: true
                    });
                }
            }

            // Step 5: Handle automatic assignments if needed
            const remainingProctorsNeeded = proctorNum - assignedProctors.filter(p => !p.isManualAssignment).length;
            
            if (autoAssignRemainingTAs && remainingProctorsNeeded > 0) {
                // Get already assigned TAs to exclude them
                const assignedTAIds = assignedProctors.map(p => p.id);
                
                // Filter already assigned TAs and those with leave if strictLeaveCheck is true
                let eligibleTAs = availableTAs.filter(ta => 
                    !assignedTAIds.includes(ta.id) && 
                    (!strictLeaveCheck || !ta.onLeave)
                );
                
                // Get weekend flag for exam date
                const isWeekend = examDate ? new Date(examDate).getDay() === 0 || new Date(examDate).getDay() === 6 : false;
                
                // Get course details
                const isGradCourse = eligibleTAs[0]?.isGradCourse || false;
                
                // Filter and sort TAs based on multiple criteria
                // 1. Department TAs first
                const departmentMatchTAs = eligibleTAs.filter(ta => ta.isSameDepartment);
                const otherTAs = eligibleTAs.filter(ta => !ta.isSameDepartment);
                
                // Sort department TAs
                departmentMatchTAs.sort((a, b) => {
                    // For weekend exams, prioritize part-time TAs
                    if (isWeekend) {
                        if (a.isPartTime && !b.isPartTime) return -1;
                        if (!a.isPartTime && b.isPartTime) return 1;
                    }
                    
                    // Then prioritize course TAs if option enabled
                    if (prioritizeCourseAssistants) {
                        if (a.isCourseTa && !b.isCourseTa) return -1;
                        if (!a.isCourseTa && b.isCourseTa) return 1;
                    }
                    
                    // Then prioritize PhD status for grad courses
                    if (isGradCourse) {
                        if (a.isPHD && !b.isPHD) return -1;
                        if (!a.isPHD && b.isPHD) return 1;
                    }
                    
                    // Finally sort by workload
                    return (a.totalWorkload || 0) - (b.totalWorkload || 0);
                });
                
                // Sort other TAs
                otherTAs.sort((a, b) => {
                    // For weekend exams, prioritize part-time TAs
                    if (isWeekend) {
                        if (a.isPartTime && !b.isPartTime) return -1;
                        if (!a.isPartTime && b.isPartTime) return 1;
                    }
                    
                    // Then prioritize course TAs if option enabled
                    if (prioritizeCourseAssistants) {
                        if (a.isCourseTa && !b.isCourseTa) return -1;
                        if (!a.isCourseTa && b.isCourseTa) return 1;
                    }
                    
                    // Then prioritize PhD status for grad courses
                    if (isGradCourse) {
                        if (a.isPHD && !b.isPHD) return -1;
                        if (!a.isPHD && b.isPHD) return 1;
                    }
                    
                    // Finally sort by workload
                    return (a.totalWorkload || 0) - (b.totalWorkload || 0);
                });
                
                // Combine the sorted lists: department TAs first, then others
                eligibleTAs = [...departmentMatchTAs, ...otherTAs];
                
                // Assign up to the remaining number needed
                for (let i = 0; i < Math.min(remainingProctorsNeeded, eligibleTAs.length); i++) {
                    const ta = eligibleTAs[i];
                    
                    // Double-check leave status to be extra safe
                    if (checkLeaveRequests && examDate && strictLeaveCheck && ta.onLeave) {
                        console.log(`Skipping TA ${ta.id} (${ta.name}) - has approved leave on ${examDate}`);
                        continue; // Skip this TA
                    }
                    
                    // Create a proctoring record for automatic assignments
                    if (examId) {
                        await Proctoring.create({
                            id: uuidv4(),
                            examId,
                            taId: ta.id,
                            assignmentDate: new Date(),
                            isManualAssignment: false,
                            assignedBy: instructorId,
                            status: 'PENDING'
                        }, { transaction: t });
                    }
                    
                    // Add to assigned proctors list for the response
                    assignedProctors.push({
                        id: ta.id,
                        name: ta.name,
                        department: ta.department || 'Unknown',
                        isManualAssignment: false
                    });
                }
            }
            
            // Step 6: Update the exam with the new counts
            if (examId) {
                const manualCount = assignedProctors.filter(p => p.isManualAssignment).length;
                const autoCount = assignedProctors.filter(p => !p.isManualAssignment).length;
                
                await exam.update({
                    manualAssignedTAs: manualCount,
                    autoAssignedTAs: autoCount
                }, { transaction: t });
            }
            
            await t.commit();
            
            // Return the result
            return {
                proctors: assignedProctors,
                manualAssignedTAs: assignedProctors.filter(p => p.isManualAssignment).length,
                autoAssignedTAs: assignedProctors.filter(p => !p.isManualAssignment).length,
                totalAssigned: assignedProctors.length,
                requiredProctors: proctorNum,
                warnings: checkLeaveRequests && tasWithLeave.length > 0 ? 
                    [`${tasWithLeave.length} TAs were excluded due to approved leave requests on ${examDate}`] : []
            };
        } catch (error) {
            await t.rollback();
            throw new Error(`Failed to assign proctors: ${error.message}`);
        }
    }

    /**
     * Swap a proctor for an exam
     * @param {string} examId - The exam ID
     * @param {string} oldProctorId - The current proctor's ID
     * @param {string} newProctorId - The new proctor's ID
     * @param {string} instructorId - The instructor's ID making the change
     * @returns {Promise<Object>} Result of the swap operation
     */
    async swapProctor(examId, oldProctorId, newProctorId, instructorId) {
        const t = await sequelize.transaction();

        try {
            const { v4: uuidv4 } = require('uuid');
            const Proctoring = require('../../models/Proctoring');
            const TeachingAssistant = require('../../models/TeachingAssistant');
            const User = require('../../models/User');
            const SwapHistory = require('../../models/SwapHistory');

            // Check if the exam exists
            const exam = await Exam.findByPk(examId, { transaction: t });
            if (!exam) {
                throw new Error('Exam not found');
            }

            // Check if old proctor is assigned to the exam
            const oldProctoring = await Proctoring.findOne({
                where: { 
                    examId, 
                    taId: oldProctorId 
                },
                transaction: t
            });

            if (!oldProctoring) {
                throw new Error('The specified proctor is not assigned to this exam');
            }

            // Check if new proctor exists
            const newTA = await TeachingAssistant.findByPk(newProctorId, {
                include: [{ model: User, as: 'taUser' }],
                transaction: t
            });

            if (!newTA) {
                throw new Error('The new proctor does not exist');
            }

            // Get old proctor details for history
            const oldTA = await TeachingAssistant.findByPk(oldProctorId, {
                include: [{ model: User, as: 'taUser' }],
                transaction: t
            });

            // Mark the old proctor as swapped
            await oldProctoring.update({ 
                status: 'SWAPPED' 
            }, { transaction: t });

            // Create a new proctoring record for the new proctor
            const newProctoring = await Proctoring.create({
                id: uuidv4(),
                examId,
                taId: newProctorId,
                assignmentDate: new Date(),
                isManualAssignment: true,
                assignedBy: instructorId,
                status: 'PENDING'
            }, { transaction: t });

            // Create a swap history record
            await SwapHistory.create({
                id: uuidv4(),
                examId,
                oldProctorId,
                newProctorId,
                swapDate: new Date(),
                swappedBy: instructorId,
                oldProctorName: oldTA?.taUser?.name || 'Unknown TA',
                newProctorName: newTA?.taUser?.name || 'Unknown TA'
            }, { transaction: t });

            // Update the swap count on the exam
            await exam.update({
                swapCount: (exam.swapCount || 0) + 1
            }, { transaction: t });

            await t.commit();

            // Return the result
            return {
                oldProctor: {
                    id: oldProctorId,
                    name: oldTA?.taUser?.name || 'Unknown TA'
                },
                newProctor: {
                    id: newProctorId,
                    name: newTA?.taUser?.name || 'Unknown TA'
                },
                exam: {
                    id: examId,
                    swapCount: (exam.swapCount || 0) + 1
                }
            };
        } catch (error) {
            await t.rollback();
            throw new Error(`Failed to swap proctor: ${error.message}`);
        }
    }

    /**
     * Get swap history for an exam
     * @param {string} examId - The exam ID
     * @returns {Promise<Array>} List of swap history entries
     */
    async getSwapHistory(examId) {
        try {
            const SwapHistory = require('../../models/SwapHistory');

            // Check if the exam exists
            const exam = await Exam.findByPk(examId);
            if (!exam) {
                throw new Error('Exam not found');
            }

            // Get swap history
            const swapHistory = await SwapHistory.findAll({
                where: { examId },
                order: [['swapDate', 'DESC']]
            });

            // Format the data for the frontend
            return swapHistory.map(swap => {
                const swapDate = new Date(swap.swapDate);
                
                return {
                    id: swap.id,
                    oldProctor: swap.oldProctorName,
                    newProctor: swap.newProctorName,
                    date: swapDate.toLocaleDateString('tr-TR'),
                    time: swapDate.toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                };
            });
        } catch (error) {
            throw new Error(`Failed to get swap history: ${error.message}`);
        }
    }

    /**
     * Check if TA has approved leave request for the given date
     * @param {string} taId - The TA ID
     * @param {Date} examDate - The exam date to check
     * @param {Object} transaction - Optional Sequelize transaction
     * @returns {Promise<boolean>} True if the TA has an approved leave on the exam date
     */
    async checkTALeaveStatus(taId, examDate, transaction = null) {
        try {
            const { Op } = require('sequelize');
            const LeaveRequest = require('../../models/LeaveRequest');
            
            // Convert the examDate to a Date object if it's a string
            const checkDate = typeof examDate === 'string' ? new Date(examDate) : examDate;
            
            // Find approved leave requests that overlap with the exam date
            const leaveRequests = await LeaveRequest.findOne({
                where: {
                    taId: taId,
                    status: 'approved',
                    startDate: { [Op.lte]: checkDate }, // Start date is before or on the exam date
                    endDate: { [Op.gte]: checkDate }    // End date is after or on the exam date
                },
                transaction
            });
            
            return !!leaveRequests; // Return true if leave request found, false otherwise
        } catch (error) {
            console.error(`Error checking TA leave status: ${error.message}`);
            return false; // Default to false on error
        }
    }
    
    /**
     * Get all TAs with approved leave on the given date
     * @param {Date} examDate - The date to check
     * @returns {Promise<Array>} List of TA IDs with approved leave
     */
    async getTAsWithLeaveOnDate(examDate) {
        try {
            const { Op } = require('sequelize');
            const LeaveRequest = require('../../models/LeaveRequest');
            
            // Convert the examDate to a Date object if it's a string
            const checkDate = typeof examDate === 'string' ? new Date(examDate) : examDate;
            
            // Find all approved leave requests that overlap with the exam date
            const leaveRequests = await LeaveRequest.findAll({
                where: {
                    status: 'approved',
                    startDate: { [Op.lte]: checkDate }, // Start date is before or on the exam date
                    endDate: { [Op.gte]: checkDate }    // End date is after or on the exam date
                },
                attributes: ['taId']
            });
            
            // Return list of TA IDs
            return leaveRequests.map(request => request.taId);
        } catch (error) {
            console.error(`Error getting TAs with leave: ${error.message}`);
            return []; // Default to empty array on error
        }
    }

    /**
     * Get available TAs for exam proctoring with leave status checks
     * @param {Object} options - Options for filtering TAs
     * @returns {Promise<Array>} - Array of TA objects with user data and leave status
     */
    async getAvailableTAsForExam(options = {}) {
        try {
            const { department, courseId, examDate, checkLeaveRequests = true } = options;
            const { Op } = require('sequelize');
            const TeachingAssistant = require('../../models/TeachingAssistant');
            const User = require('../../models/User');
            const Course = require('../../models/Course');
            const db = require('../../config/db'); // Use db.js instead of sequelize.js
            
            // Get all TAs with their user information
            const tas = await TeachingAssistant.findAll({
                include: {
                    model: User,
                    as: 'taUser',
                    attributes: ['id', 'name', 'email']
                }
            });
            
            // Transform the data to match the format expected by the frontend
            let transformedTAs = tas.map(ta => {
                return {
                    id: ta.id,
                    name: ta.taUser ? ta.taUser.name : 'Unknown',
                    email: ta.taUser ? ta.taUser.email : '',
                    department: ta.department,
                    isPHD: ta.isPHD || false,
                    isPartTime: ta.isPartTime || false,
                    totalWorkload: ta.totalWorkload || 0,
                    // Default leave status
                    onLeave: false,
                    leaveStatus: null,
                    isSameDepartment: ta.department === department
                }
            });
            
            // Filter by department if provided
            if (department) {
                // We'll keep all TAs but mark department match status
                transformedTAs = transformedTAs.map(ta => ({
                    ...ta,
                    isSameDepartment: ta.department === department
                }));
            }
            
            // Check for course TAs if courseId is provided
            if (courseId) {
                // Get the course details to check if it's a graduate course
                const course = await Course.findByPk(courseId);
                
                // Get the course TA relationships
                const courseTAs = await db.models.GivenCourseTAs.findAll({
                    where: { CourseId: courseId }
                });
                
                const courseTAIds = courseTAs.map(cta => cta.TeachingAssistantId);
                
                // Mark TAs that are assigned to this course and grad course status
                transformedTAs = transformedTAs.map(ta => ({
                    ...ta,
                    isCourseTa: courseTAIds.includes(ta.id),
                    isGradCourse: course?.isGradCourse || false
                }));
            }
            
            // Check leave status if examDate is provided and checkLeaveRequests is true
            if (examDate && checkLeaveRequests) {
                // Get all TAs with approved leave on the specified date
                const tasWithLeave = await this.getTAsWithLeaveOnDate(examDate);
                
                // Mark TAs with leave status
                transformedTAs = transformedTAs.map(ta => {
                    const hasLeave = tasWithLeave.includes(ta.id);
                    return {
                        ...ta,
                        onLeave: hasLeave,
                        leaveStatus: hasLeave ? 'APPROVED' : null
                    };
                });
            }
            
            return transformedTAs;
        } catch (error) {
            console.error('Error in getAvailableTAsForExam service:', error);
            throw new Error(`Failed to retrieve available TAs: ${error.message}`);
        }
    }
}

module.exports = new ExamService();