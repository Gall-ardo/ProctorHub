// services/Admin/semesterService.js
const Semester = require("../../models/Semester");
const Course = require("../../models/Course");
const Offering = require("../../models/Offering");
const TimeSlot = require("../../models/TimeSlot");
const Instructor = require("../../models/Instructor");
const User = require("../../models/User");
const Student = require("../../models/Student");
const { Op } = require("sequelize");
const sequelize = require("../../config/db");
const { v4: uuidv4 } = require('uuid');

class SemesterService {
  // Generate ID from year and term (e.g. 2023FALL)
  generateSemesterId(year, semesterType) {
    return `${year}${semesterType}`;
  }

  async createSemester(semesterData) {
    const t = await sequelize.transaction();
    
    try {
      // Validate required fields
      if (!semesterData.year || !semesterData.semesterType) {
        throw new Error("Year and semester type are required");
      }
      
      // Generate semester ID from year and term
      const semesterId = this.generateSemesterId(
        semesterData.year, 
        semesterData.semesterType
      );
      
      // Check if semester already exists
      const existingSemester = await Semester.findByPk(semesterId, { transaction: t });
      if (existingSemester) {
        throw new Error(`Semester with ID ${semesterId} already exists`);
      }
      
      // Validate semester type
      const validTypes = ['FALL', 'SPRING', 'SUMMER'];
      if (!validTypes.includes(semesterData.semesterType)) {
        throw new Error(`Invalid semester type. Must be one of: ${validTypes.join(', ')}`);
      }
      
      // Create semester
      const semester = await Semester.create({
        id: semesterId,
        year: semesterData.year,
        semesterType: semesterData.semesterType,
        startDate: semesterData.startDate || null,
        endDate: semesterData.endDate || null
      }, { transaction: t });
      
      await t.commit();
      return semester;
    } catch (error) {
      console.error("Transaction error in createSemester:", error);
      await t.rollback();
      throw error;
    }
  }

  async findSemesterById(id) {
    try {
      const semester = await Semester.findByPk(id, {
        include: [
          {
            model: Offering,
            as: 'offerings',
            include: [
              {
                model: Course,
                as: 'course'
              },
              {
                model: TimeSlot,
                as: 'TimeSlot'
              },
              {
                model: Instructor,
                as: 'offerings',
                through: { attributes: [] }
              }
            ]
          },
          {
            model: Course,
            include: [
              {
                model: Instructor,
                as: 'instructors',
                through: { attributes: [] },
                include: [
                  {
                    model: User,
                    as: 'instructorUser',
                    attributes: ['id', 'name', 'email']
                  }
                ]
              }
            ]
          }
        ]
      });
      
      return semester;
    } catch (error) {
      console.error(`Error finding semester by ID ${id}:`, error);
      throw error;
    }
  }

  async findAllSemesters(query) {
    try {
      const whereClause = {};
      
      if (query.year) {
        whereClause.year = query.year;
      }
      
      if (query.semesterType) {
        whereClause.semesterType = query.semesterType;
      }
      
      const semesters = await Semester.findAll({
        where: whereClause,
        order: [['year', 'DESC'], ['semesterType', 'ASC']]
      });
      
      return semesters;
    } catch (error) {
      console.error("Error in findAllSemesters:", error);
      throw error;
    }
  }

  async createCourses(semesterId, coursesData) {
    const t = await sequelize.transaction();
    
    try {
      // Validate semester exists
      const semester = await Semester.findByPk(semesterId, { transaction: t });
      if (!semester) {
        throw new Error(`Semester with ID ${semesterId} not found`);
      }
      
      const createdCourses = [];
      const errors = [];
      const instructorAssignments = [];
      
      // Create courses
      for (const courseData of coursesData) {
        try {
          // Skip empty rows
          if (!courseData.CourseCode || !courseData.Department) {
            continue;
          }
          
          console.log(`Processing course ${courseData.Department}${courseData.CourseCode} from CSV`);
          
          // Generate the course ID as used in your system: [Department][CourseCode][SemesterId]
          const courseId = `${courseData.Department}${courseData.CourseCode}${semesterId}`;
          
          // Check if course already exists
          const existingCourse = await Course.findOne({
            where: {
              id: courseId
            },
            transaction: t
          });
          
          let course;
          
          if (existingCourse) {
            // Update existing course if it exists
            await existingCourse.update({
              courseCode: courseData.CourseCode,
              courseName: courseData.CourseName || `${courseData.Department}${courseData.CourseCode}`,
              department: courseData.Department,
              credit: parseInt(courseData.Credit) || 3,
              isGradCourse: courseData.IsGradCourse === 'True' || courseData.IsGradCourse === 'true' || false,
              semesterId: semesterId,
              description: courseData.Description || null
            }, { transaction: t });
            
            course = existingCourse;
            createdCourses.push(existingCourse);
            console.log(`Updated existing course: ${existingCourse.id}`);
          } else {
            // Create a new course
            const newCourse = await Course.create({
              id: courseId,
              courseCode: courseData.CourseCode,
              courseName: courseData.CourseName || `${courseData.Department}${courseData.CourseCode}`,
              department: courseData.Department,
              credit: parseInt(courseData.Credit) || 3,
              isGradCourse: courseData.IsGradCourse === 'True' || courseData.IsGradCourse === 'true' || false,
              semesterId: semesterId,
              description: courseData.Description || null
            }, { transaction: t });
            
            course = newCourse;
            createdCourses.push(newCourse);
            console.log(`Created new course: ${newCourse.id}`);
          }
          
          // Handle multiple instructors if provided (comma or 'and' separated)
          if (courseData.Instructor) {
            // Split by both 'and' and commas to handle different formats
            const instructorNames = courseData.Instructor.split(/\s+and\s+|,\s*/);
            
            // Remove existing instructor associations for this course
            if (existingCourse) {
              await course.setInstructors([], { transaction: t });
            }
            
            for (const instructorName of instructorNames) {
              const trimmedName = instructorName.trim();
              if (!trimmedName) continue;
              
              try {
                // Find the user by name with instructor role
                const user = await User.findOne({
                  where: {
                    name: trimmedName,
                    userType: 'instructor'
                  },
                  transaction: t
                });
                
                if (user) {
                  // Find associated instructor
                  const instructor = await Instructor.findOne({
                    where: { id: user.id },
                    transaction: t
                  });
                  
                  if (instructor) {
                    // Associate instructor with course
                    await course.addInstructor(instructor, { transaction: t });
                    instructorAssignments.push({
                      course: courseId,
                      instructor: trimmedName
                    });
                    console.log(`Associated instructor "${trimmedName}" with course ${courseId}`);
                  } else {
                    console.log(`Found user "${trimmedName}" but no matching instructor record`);
                    errors.push({
                      data: { course: courseId, instructor: trimmedName },
                      error: 'Instructor record not found for user'
                    });
                  }
                } else {
                  console.log(`Instructor "${trimmedName}" not found in the system`);
                  errors.push({
                    data: { course: courseId, instructor: trimmedName },
                    error: 'Instructor user not found'
                  });
                }
              } catch (instructorError) {
                console.error(`Error associating instructor "${trimmedName}" with course ${courseId}:`, instructorError);
                errors.push({
                  data: { course: courseId, instructor: trimmedName },
                  error: instructorError.message
                });
              }
            }
          }
        } catch (error) {
          errors.push({
            data: courseData,
            error: error.message
          });
          console.error(`Failed to create course ${courseData.Department}${courseData.CourseCode}: ${error.message}`);
        }
      }
      
      await t.commit();
      
      return {
        createdCourses,
        instructorAssignments,
        errors,
        success: createdCourses.length,
        failed: errors.length
      };
    } catch (error) {
      console.error("Transaction error in createCourses:", error);
      await t.rollback();
      throw error;
    }
  }

  async createOfferings(semesterId, offeringsData) {
    const t = await sequelize.transaction();
    
    try {
      // Validate semester exists
      const semester = await Semester.findByPk(semesterId, { transaction: t });
      if (!semester) {
        throw new Error(`Semester with ID ${semesterId} not found`);
      }
      
      const createdOfferings = [];
      const errors = [];
      
      // Group offerings by courseId and sectionNumber
      const offeringsMap = new Map();
      
      // First, group all offerings by their ID (courseId + sectionNumber)
      for (const offeringData of offeringsData) {
        // Skip rows without required fields
        if (!offeringData.courseId || !offeringData.sectionNumber) {
          errors.push({
            data: offeringData,
            error: "Missing required fields: courseId or sectionNumber"
          });
          continue;
        }
        
        const offeringKey = `${offeringData.courseId}-${offeringData.sectionNumber}`;
        
        if (!offeringsMap.has(offeringKey)) {
          offeringsMap.set(offeringKey, {
            courseId: offeringData.courseId,
            sectionNumber: parseInt(offeringData.sectionNumber, 10),
            semesterId: semesterId,
            timeslots: [],
            instructorId: offeringData.instructorId, // Include instructorId if present
            roomId: offeringData.roomId, // Include roomId if present
            capacity: offeringData.capacity ? parseInt(offeringData.capacity, 10) : null
          });
        }
        
        // Add timeslot if day, startTime, and endTime are present
        if (offeringData.day && offeringData.startTime && offeringData.endTime) {
          offeringsMap.get(offeringKey).timeslots.push({
            day: offeringData.day,
            startTime: offeringData.startTime,
            endTime: offeringData.endTime
          });
        }
      }
      
      console.log(`Processing ${offeringsMap.size} unique offerings with their timeslots`);
      
      // Verify all courses exist before creating offerings
      const courseIds = [...new Set([...offeringsMap.values()].map(offering => offering.courseId))];
      const courses = await Course.findAll({
        where: { 
          id: courseIds
        },
        include: [
          {
            model: Instructor, 
            as: 'instructors',
            through: { attributes: [] }
          }
        ],
        transaction: t
      });
      
      const foundCourseIds = new Set(courses.map(course => course.id));
      
      // Check if all courses exist
      const missingCourses = courseIds.filter(courseId => !foundCourseIds.has(courseId));
      
      if (missingCourses.length > 0) {
        throw new Error(`The following courses do not exist: ${missingCourses.join(', ')}. Please create the courses first.`);
      }
      
      // Create a map of courses for easy lookup
      const courseMap = new Map(courses.map(course => [course.id, course]));
      
      // Now process each unique offering
      for (const [offeringKey, offeringData] of offeringsMap.entries()) {
        try {
          console.log(`Processing offering ${offeringKey}`);
          
          // Format the section number to 3 digits with leading zeros
          const formattedSectionNumber = String(offeringData.sectionNumber).padStart(3, '0');
          
          // Generate offering ID: courseId_sectionNumber (padded to 3 digits)
          const offeringId = `${offeringData.courseId}_${formattedSectionNumber}`;
          
          // Check if offering already exists
          const existingOffering = await Offering.findByPk(offeringId, { 
            include: [{ model: TimeSlot, as: 'TimeSlot' }],
            transaction: t 
          });
          
          let offering;
          
          if (existingOffering) {
            console.log(`Offering ${offeringId} already exists. Updating timeslots.`);
            
            // Update the existing offering if needed
            await existingOffering.update({
              capacity: offeringData.capacity || existingOffering.capacity
            }, { transaction: t });
            
            offering = existingOffering;
            
            // Delete existing timeslots
            if (existingOffering.TimeSlot && existingOffering.TimeSlot.length > 0) {
              for (const timeSlot of existingOffering.TimeSlot) {
                await timeSlot.destroy({ transaction: t });
              }
            }
            
          } else {
            // Create the offering
            offering = await Offering.create({
              id: offeringId,
              courseId: offeringData.courseId,
              sectionNumber: offeringData.sectionNumber,
              semesterId: offeringData.semesterId || semesterId,
              studentCount: 0, // Initialize with zero students
              capacity: offeringData.capacity || null
            }, { transaction: t });
            
            console.log(`Created new offering: ${offeringId}`);
          }
          
          // Create timeslots for the offering
          const createdTimeSlots = [];
          for (const timeslot of offeringData.timeslots) {
            const newTimeSlot = await TimeSlot.create({
              id: uuidv4(), // Generate a UUID for the timeslot
              offeringId: offeringId,
              day: timeslot.day,
              startTime: timeslot.startTime,
              endTime: timeslot.endTime
            }, { transaction: t });
            
            createdTimeSlots.push(newTimeSlot);
          }
          
          // If instructor is provided for this offering, associate them
          if (offeringData.instructorId) {
            const instructor = await Instructor.findByPk(offeringData.instructorId, { transaction: t });
            if (instructor) {
              await offering.addInstructor(instructor, { transaction: t });
              console.log(`Associated instructor ${offeringData.instructorId} with offering ${offeringId}`);
            }
          } else {
            // If no specific instructor for offering, inherit from course
            const course = courseMap.get(offeringData.courseId);
            
            if (course && course.instructors && course.instructors.length > 0) {
              for (const instructor of course.instructors) {
                await offering.addInstructor(instructor, { transaction: t });
                console.log(`Inherited instructor ${instructor.id} from course to offering ${offeringId}`);
              }
            }
          }
          
          offering.timeslotsCreated = createdTimeSlots.length;
          createdOfferings.push({
            ...offering.toJSON(),
            timeslots: createdTimeSlots
          });
          
          console.log(`Created offering ${offeringId} with ${createdTimeSlots.length} timeslots`);
        } catch (error) {
          errors.push({
            data: offeringData,
            error: error.message
          });
          console.error(`Failed to create offering ${offeringKey}:`, error.message);
        }
      }
      
      await t.commit();
      
      return {
        createdOfferings,
        errors,
        success: createdOfferings.length,
        failed: errors.length
      };
    } catch (error) {
      console.error("Transaction error in createOfferings:", error);
      await t.rollback();
      throw error;
    }
  }

  async enrollStudents(semesterId, studentsData) {
    const t = await sequelize.transaction();
    
    try {
      // Validate semester exists
      const semester = await Semester.findByPk(semesterId, { transaction: t });
      if (!semester) {
        throw new Error(`Semester with ID ${semesterId} not found`);
      }
      
      let successCount = 0;
      let failedCount = 0;
      const errors = [];
      
      // Process each student enrollment
      for (const studentData of studentsData) {
        try {
          // Verify required fields
          if (!studentData.studentId || !studentData.courseId) {
            throw new Error("Student ID and Course ID are required");
          }
          
          // Determine section number (default to 1 if not provided)
          const sectionNumber = studentData.section ? parseInt(studentData.section, 10) : 1;
          const formattedSectionNumber = String(sectionNumber).padStart(3, '0');
          
          // Generate the offering ID based on courseId and sectionNumber
          const offeringId = `${studentData.courseId}_${formattedSectionNumber}`;
          
          // Verify offering exists
          const offering = await Offering.findByPk(offeringId, { transaction: t });
          if (!offering) {
            throw new Error(`Offering ${offeringId} not found`);
          }
          
          // Find or create student record
          let student = await Student.findByPk(studentData.studentId, { transaction: t });
          
          if (!student) {
            // Create a new student if not found
            student = await Student.create({
              id: studentData.studentId,
              name: studentData.name || `Student ${studentData.studentId}`,
              email: studentData.email || `${studentData.studentId}@university.edu`
            }, { transaction: t });
          }
          
          // Enroll student in the course
          const course = await Course.findByPk(studentData.courseId, { transaction: t });
          if (!course) {
            throw new Error(`Course ${studentData.courseId} not found`);
          }
          
          // Add the student to the course
          await course.addStudent(student, { transaction: t });
          
          // Increment student count in the offering
          await offering.increment('studentCount', { transaction: t });
          
          successCount++;
        } catch (error) {
          failedCount++;
          errors.push({
            data: studentData,
            error: error.message
          });
          console.error(`Failed to enroll student ${studentData.studentId} in course:`, error.message);
        }
      }
      
      await t.commit();
      
      return {
        success: successCount,
        failed: failedCount,
        errors
      };
    } catch (error) {
      console.error("Transaction error in enrollStudents:", error);
      await t.rollback();
      throw error;
    }
  }

  async assignTeachingAssistants(semesterId, tasData) {
    const t = await sequelize.transaction();
    
    try {
      // Validate semester exists
      const semester = await Semester.findByPk(semesterId, { transaction: t });
      if (!semester) {
        throw new Error(`Semester with ID ${semesterId} not found`);
      }
      
      let successCount = 0;
      let failedCount = 0;
      const errors = [];
      
      // Process each TA assignment
      for (const taData of tasData) {
        try {
          // Verify required fields
          if (!taData.taId || !taData.courseId) {
            throw new Error("TA ID and Course ID are required");
          }
          
          // Default section to 1 if not specified
          const sectionNumber = taData.section ? parseInt(taData.section, 10) : 1;
          const formattedSectionNumber = String(sectionNumber).padStart(3, '0');
          
          // Generate the offering ID
          const offeringId = `${taData.courseId}_${formattedSectionNumber}`;
          
          // Verify offering exists
          const offering = await Offering.findByPk(offeringId, { transaction: t });
          if (!offering) {
            throw new Error(`Offering ${offeringId} not found`);
          }
          
          // Verify TA exists
          const ta = await User.findOne({ 
            where: { 
              id: taData.taId, 
              userType: 'ta' 
            }, 
            transaction: t 
          });
          
          if (!ta) {
            throw new Error(`TA with ID ${taData.taId} not found`);
          }
          
          // Find TA record
          const teachingAssistant = await Instructor.findByPk(taData.taId, { transaction: t });
          
          if (!teachingAssistant) {
            throw new Error(`TA record for user ${taData.taId} not found`);
          }
          
          // Assign TA to offering
          await offering.addStudentTA(teachingAssistant, { 
            through: { 
              workload: taData.workload ? parseInt(taData.workload, 10) : 10 
            },
            transaction: t 
          });
          
          // Also assign to course (if needed by your application)
          const course = await Course.findByPk(taData.courseId, { transaction: t });
          if (!course) {
            throw new Error(`Course ${taData.courseId} not found`);
          }
          
          await course.addTA(teachingAssistant, { transaction: t });
          
          successCount++;
          console.log(`Assigned TA ${taData.taId} to offering ${offeringId}`);
        } catch (error) {
          failedCount++;
          errors.push({
            data: taData,
            error: error.message
          });
          console.error(`Failed to assign TA ${taData.taId} to course:`, error.message);
        }
      }
      
      await t.commit();
      
      return {
        success: successCount,
        failed: failedCount,
        errors
      };
    } catch (error) {
      console.error("Transaction error in assignTeachingAssistants:", error);
      await t.rollback();
      throw error;
    }
  }

  async deleteSemester(id) {
    const t = await sequelize.transaction();
    
    try {
      // Find semester
      const semester = await Semester.findByPk(id, { 
        include: [
          {
            model: Offering,
            as: 'offerings',
            include: [
              { model: TimeSlot, as: 'TimeSlot' }
            ]
          },
          {
            model: Course
          }
        ],
        transaction: t 
      });
      
      if (!semester) {
        await t.rollback();
        return false;
      }
      
      // First, delete all timeslots associated with offerings
      if (semester.offerings && semester.offerings.length > 0) {
        for (const offering of semester.offerings) {
          if (offering.TimeSlot && offering.TimeSlot.length > 0) {
            for (const timeSlot of offering.TimeSlot) {
              await timeSlot.destroy({ transaction: t });
            }
          }
          
          // Remove instructor associations
          await sequelize.query(
            `DELETE FROM "InstructorOfferings" WHERE "offeringId" = ?`,
            {
              replacements: [offering.id],
              type: sequelize.QueryTypes.DELETE,
              transaction: t
            }
          );
          
          // Remove TA associations
          await sequelize.query(
            `DELETE FROM "TakenOfferingTAs" WHERE "OfferingId" = ?`,
            {
              replacements: [offering.id],
              type: sequelize.QueryTypes.DELETE,
              transaction: t
            }
          );
          
          // Delete the offering
          await offering.destroy({ transaction: t });
        }
      }
      
      // Next, delete all courses and their associations
      if (semester.Courses && semester.Courses.length > 0) {
        for (const course of semester.Courses) {
          // Remove instructor associations
          await sequelize.query(
            `DELETE FROM "InstructorCourses" WHERE "CourseId" = ?`,
            {
              replacements: [course.id],
              type: sequelize.QueryTypes.DELETE,
              transaction: t
            }
          );
          
          // Remove student enrollments
          await sequelize.query(
            `DELETE FROM "CourseStudents" WHERE "CourseId" = ?`,
            {
              replacements: [course.id],
              type: sequelize.QueryTypes.DELETE,
              transaction: t
            }
          );
          
          // Remove TA associations
          await sequelize.query(
            `DELETE FROM "GivenCourseTAs" WHERE "CourseId" = ?`,
            {
              replacements: [course.id],
              type: sequelize.QueryTypes.DELETE,
              transaction: t
            }
          );
          
          // Delete course
          await course.destroy({ transaction: t });
        }
      }
      
      // Finally, delete the semester
      await semester.destroy({ transaction: t });
      
      await t.commit();
      return true;
    } catch (error) {
      console.error(`Transaction error in deleteSemester for ID ${id}:`, error);
      await t.rollback();
      throw error;
    }
  }
}

module.exports = new SemesterService();