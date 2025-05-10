const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const sequelize = require('../../config/db');
const Instructor = require('../../models/Instructor');
const User = require('../../models/User');
const Exam = require('../../models/Exam');
const Course = require('../../models/Course');
const Notification = require('../../models/Notification');


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

            for (const taId of examData.teachingAssistants) {
                await Notification.create({
                    id: uuidv4(),
                    recipientId: taId,
                    subject: 'Exam Updated',
                    message: `The exam for ${examData.courseName} on ${examData.date} has been updated.`,
                    date: new Date(),
                    isRead: false
                });
            }

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

            // Get teaching assistants assigned to this exam through Proctoring
            const Proctoring = require('../../models/Proctoring');
            const proctorAssignments = await Proctoring.findAll({
                where: { examId },
                transaction: t
            });
            
            // Extract TA IDs from proctor assignments
            const taIds = proctorAssignments.map(assignment => assignment.taId);

            // Delete related proctoring assignments first
            await Proctoring.destroy({
                where: { examId },
                transaction: t
            });

            // Delete related swap history records if they exist
            try {
                const SwapHistory = require('../../models/SwapHistory');
                // Check if table exists before trying to delete from it
                try {
                    await SwapHistory.findAll({ where: { examId }, limit: 1, transaction: t });
                    // If the above call succeeds, table exists, so delete from it
                    await SwapHistory.destroy({
                        where: { examId },
                        transaction: t
                    });
                } catch (tableError) {
                    // If table doesn't exist, just log and continue
                    console.log('SwapHistory table does not exist:', tableError.message);
                }
            } catch (error) {
                console.log('Error handling swap history deletion:', error.message);
                // Continue with exam deletion even if swap history deletion fails
            }

            // Finally delete the exam
            await exam.destroy({ transaction: t });

            // Send notifications to TAs who were assigned to this exam
            const Notification = require('../../models/Notification');
            const { v4: uuidv4 } = require('uuid');
            
            for (const taId of taIds) {
                await Notification.create({
                    id: uuidv4(),
                    recipientId: taId,
                    subject: 'Exam Deleted',
                    message: `The exam for ${exam.courseName} on ${exam.date} has been deleted.`,
                    date: new Date(),
                    isRead: false
                }, { transaction: t });
            }

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
            //console.log("examsss",exams);

            // Process exams to include formatted dates and times
            const formattedExams = exams.map(exam => {
                const examData = exam.get({ plain: true });
                //console.log('Raw exam data:', examData);
                //console.log('Raw date from database:', examData.date);
                
                // Ensure classrooms is always an array
                examData.classrooms = examData.classrooms ? examData.classrooms.split(',') : [];

                // Format date and calculate start/end times
                const examDate = new Date(examData.date);
                //console.log('Parsed date:', examDate);
                
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
            
            // Step 2.1: Use the new method to get eligible TAs considering leave requests and offering conflicts
            let availableTAs = [];
            let tasWithLeave = [];
            let tasWithProctoringConflict = [];
            let tasWithOfferingConflict = [];
            let tasWithOfferingCourseExamConflict = [];
            
            // ALWAYS check for conflicts regardless of checkLeaveRequests flag
            availableTAs = await this.getAvailableTAsForExam({
                department,
                courseId: courseName,
                examDate,
                checkLeaveRequests: checkLeaveRequests
            });
            
            console.log(`Found ${availableTAs.length} TAs before filtering conflicts`);
            
            // Extract TAs with various conflicts
            tasWithOfferingConflict = availableTAs
                .filter(ta => ta.hasOfferingConflict)
                .map(ta => ta.id);
            
            tasWithOfferingCourseExamConflict = availableTAs
                .filter(ta => ta.hasOfferingCourseExamConflict)
                .map(ta => ta.id);
            
            tasWithProctoringConflict = availableTAs
                .filter(ta => ta.hasProctoringConflict)
                .map(ta => ta.id);
            
            // Always filter out TAs with offering conflicts and offering course exam conflicts
            availableTAs = availableTAs.filter(ta => 
                !ta.hasOfferingConflict &&
                !ta.hasOfferingCourseExamConflict &&
                !ta.hasProctoringConflict
            );
            
            console.log(`Found ${availableTAs.length} TAs after filtering conflicts`);
            
            if (checkLeaveRequests) {
                tasWithLeave = availableTAs
                    .filter(ta => ta.onLeave)
                    .map(ta => ta.id);
                
                // If strictLeaveCheck is true, also filter out TAs with leave
                if (strictLeaveCheck) {
                    availableTAs = availableTAs.filter(ta => !ta.onLeave);
                    console.log(`Found ${availableTAs.length} TAs after filtering leave conflicts`);
                }
            }
            
            // Step 2.2: Filter out TAs with conflicts from manually selected TAs
            let filteredManualTAs = [...manuallySelectedTAs]; // Create a copy to avoid modifying the original
            
            // Always filter out TAs with offering conflicts, offering course exam conflicts, and proctoring conflicts
            const originalLength = filteredManualTAs.length;
            
            // Log the manual selections before filtering
            console.log(`Manually selected TAs before filtering: ${filteredManualTAs.join(', ')}`);
            
            // Apply the filters one by one to better track which TAs are filtered out
            if (tasWithOfferingConflict.length > 0) {
                const beforeFilter = [...filteredManualTAs];
                filteredManualTAs = filteredManualTAs.filter(taId => !tasWithOfferingConflict.includes(taId));
                const filteredOut = beforeFilter.filter(taId => !filteredManualTAs.includes(taId));
                if (filteredOut.length > 0) {
                    console.log(`Filtered out TAs with offering conflicts: ${filteredOut.join(', ')}`);
                }
            }
            
            if (tasWithOfferingCourseExamConflict.length > 0) {
                const beforeFilter = [...filteredManualTAs];
                filteredManualTAs = filteredManualTAs.filter(taId => !tasWithOfferingCourseExamConflict.includes(taId));
                const filteredOut = beforeFilter.filter(taId => !filteredManualTAs.includes(taId));
                if (filteredOut.length > 0) {
                    console.log(`Filtered out TAs with offering course exam conflicts: ${filteredOut.join(', ')}`);
                }
            }
            
            if (tasWithProctoringConflict.length > 0) {
                const beforeFilter = [...filteredManualTAs];
                filteredManualTAs = filteredManualTAs.filter(taId => !tasWithProctoringConflict.includes(taId));
                const filteredOut = beforeFilter.filter(taId => !filteredManualTAs.includes(taId));
                if (filteredOut.length > 0) {
                    console.log(`Filtered out TAs with proctoring conflicts: ${filteredOut.join(', ')}`);
                }
            }
            
            // Only filter leave if strictLeaveCheck is true
            if (checkLeaveRequests && strictLeaveCheck && tasWithLeave.length > 0) {
                const beforeFilter = [...filteredManualTAs];
                filteredManualTAs = filteredManualTAs.filter(taId => !tasWithLeave.includes(taId));
                const filteredOut = beforeFilter.filter(taId => !filteredManualTAs.includes(taId));
                if (filteredOut.length > 0) {
                    console.log(`Filtered out TAs with leave: ${filteredOut.join(', ')}`);
                }
            }
            
            // Log the manual selections after filtering
            console.log(`Manually selected TAs after filtering: ${filteredManualTAs.join(', ')}`);
            
            if (filteredManualTAs.length < originalLength) {
                console.log(`Filtered out ${originalLength - filteredManualTAs.length} manually selected TAs with conflicts`);
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

                        // Notify the TA about the assignment
                        await Notification.create({
                            id: uuidv4(),
                            recipientId: ta.id,
                            subject: 'Proctoring Assignment',
                            message: `You have been assigned as a proctor for the exam on ${exam.date}.`,
                            date: new Date(),
                            isRead: false
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

                        // Notify the TA about the assignment
                        await Notification.create({
                            id: uuidv4(),
                            recipientId: ta.id,
                            subject: 'Proctoring Assignment',
                            message: `You have been automatically assigned as a proctor for ${exam.courseName} on ${exam.date}.`,
                            date: new Date(),
                            isRead: false
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
                warnings: [
                    ...(checkLeaveRequests && tasWithLeave.length > 0 ? 
                        [`${tasWithLeave.length} TAs were excluded due to approved leave requests on ${examDate}`] : []),
                    ...(tasWithProctoringConflict.length > 0 ? 
                        [`${tasWithProctoringConflict.length} TAs were excluded due to existing proctoring assignments on ${examDate}`] : []),
                    ...(tasWithOfferingConflict.length > 0 ? 
                        [`${tasWithOfferingConflict.length} TAs were excluded because they have offerings for this course`] : []),
                    ...(tasWithOfferingCourseExamConflict.length > 0 ? 
                        [`${tasWithOfferingCourseExamConflict.length} TAs were excluded because they have offerings for courses with exams on the same date`] : [])
                ]
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

            await Notification.create({
                id: uuidv4(),
                recipientId: oldProctorId,
                subject: 'Proctoring Assignment Removed',
                message: `You have been removed from proctoring the exam for ${exam.courseName} on ${exam.date}.`,
                date: new Date(),
                isRead: false
            });
            await Notification.create({
                id: uuidv4(),
                recipientId: newProctorId,
                subject: 'New Proctoring Assignment',
                message: `You have been assigned to proctor an exam for ${exam.courseName} on ${exam.date}.`,
                date: new Date(),
                isRead: false
            });

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
            const db = require('../../config/db');
            const Proctoring = require('../../models/Proctoring');
            const Exam = require('../../models/Exam');
            const Offering = require('../../models/Offering');
            
            // Get all TAs with their user information and offerings
            const tas = await TeachingAssistant.findAll({
                include: [
                    {
                        model: User,
                        as: 'taUser',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: Offering,
                        as: 'offerings',
                        attributes: ['id', 'courseId']
                    }
                ]
            });
            
            // Find exams on the same date if examDate is provided
            let examsOnDate = [];
            if (examDate) {
                //console.log("abcd::", examDate);

                // Normalize the examDate to YYYY-MM-DD format
                let formattedDate;
                if (typeof examDate === 'string') {
                    // If input is already a string, extract just the date part (works for both formats)
                    formattedDate = examDate.split('T')[0];
                } else {
                    // If it's a Date object
                    formattedDate = examDate.toISOString().split('T')[0];
                }
                //console.log("ggrvdfef", formattedDate);

                // Find all exams on the same date
                examsOnDate = await Exam.findAll({
                    where: db.literal(`DATE(date) = '${formattedDate}'`), // Using SQL DATE function for consistent comparison
                    attributes: ['id', 'courseName', 'date']
                });

                console.log(`Found ${examsOnDate.length} exams on date ${formattedDate}`);
                examsOnDate.forEach(exam => {
                    console.log(`- Exam ${exam.id} for course ${exam.courseName} on ${exam.date}`);
                });
            }
            
            // Transform the data to match the format expected by the frontend
            let transformedTAs = tas.map(ta => {
                // Get the courseIds of the TA's offerings
                const offeringCourseIds = ta.offerings ? ta.offerings.map(offering => offering.courseId) : [];
                
                // Check if TA has an offering for the exam course
                const hasOfferingForCourse = courseId ? offeringCourseIds.includes(courseId) : false;
                
                // Check if any of the TA's offering courses have exams on the same date
                let hasOfferingCourseExamConflict = false;
                let offeringCourseExamConflictReason = null;
                
                if (examDate && offeringCourseIds.length > 0) {
                    // Find exams for the TA's offering courses that are on the same date
                    console.log(`Checking TA ${ta.id} with offerings for courses: ${offeringCourseIds.join(', ')}`);
                    
                    const conflictingExams = examsOnDate.filter(exam => {
                        const match = offeringCourseIds.includes(exam.courseName);
                        if (match) {
                            console.log(`Match found: TA ${ta.id} has offering for course ${exam.courseName} with exam on same date`);
                        }
                        return match;
                    });
                    
                    if (conflictingExams.length > 0) {
                        hasOfferingCourseExamConflict = true;
                        const conflictingCourses = conflictingExams.map(exam => exam.courseName).join(', ');
                        offeringCourseExamConflictReason = `TA has offerings for courses with exams on the same date: ${conflictingCourses}`;
                        console.log(`Conflict detected for TA ${ta.id}: ${offeringCourseExamConflictReason}`);
                    }
                }
                
                return {
                    id: ta.id,
                    name: ta.taUser ? ta.taUser.name : 'Unknown',
                    email: ta.taUser ? ta.taUser.email : '',
                    department: ta.department,
                    isPHD: ta.isPHD || false,
                    isPartTime: ta.isPartTime || false,
                    totalWorkload: ta.totalWorkload || 0,
                    // Default statuses
                    onLeave: false,
                    leaveStatus: null,
                    hasProctoringConflict: false,
                    proctoringConflictReason: null,
                    hasOfferingConflict: hasOfferingForCourse,
                    offeringConflictReason: hasOfferingForCourse ? `TA has an offering for course ${courseId}` : null,
                    hasOfferingCourseExamConflict,
                    offeringCourseExamConflictReason,
                    isSameDepartment: ta.department === department,
                    // Include the offering course IDs for reference
                    offeringCourseIds: offeringCourseIds
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
            
            // Check for proctoring conflicts if examDate is provided
            if (examDate) {
                // Convert examDate to Date object if it's a string
                const checkDate = typeof examDate === 'string' ? new Date(examDate) : examDate;
                
                // Format date to YYYY-MM-DD for database comparison
                const formattedDate = checkDate.toISOString().split('T')[0];
                
                // Get all proctoring assignments with their associated exams
                const proctoringAssignments = await Proctoring.findAll({
                    where: {
                        status: {
                            [Op.in]: ['PENDING', 'ACCEPTED'] // Only check active assignments
                        }
                    },
                    include: [
                        {
                            model: Exam,
                            as: 'exam', 
                            attributes: ['date']
                        }
                    ]
                });
                
                // Group proctoring assignments by TA
                const taProctoringMap = {};
                proctoringAssignments.forEach(assignment => {
                    if (!taProctoringMap[assignment.taId]) {
                        taProctoringMap[assignment.taId] = [];
                    }
                    taProctoringMap[assignment.taId].push(assignment);
                });
                
                // Check each TA for conflicts
                transformedTAs = transformedTAs.map(ta => {
                    const assignments = taProctoringMap[ta.id] || [];
                    
                    if (assignments.length > 0) {
                        // Check if any assignment's exam is on the same date
                        const hasConflict = assignments.some(assignment => {
                            const examDate = new Date(assignment.exam.date);
                            const examDateStr = examDate.toISOString().split('T')[0];
                            return examDateStr === formattedDate;
                        });
                        
                        if (hasConflict) {
                            return {
                                ...ta,
                                hasProctoringConflict: true,
                                proctoringConflictReason: 'Already assigned to another exam on the same date'
                            };
                        }
                    }
                    
                    return ta;
                });
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