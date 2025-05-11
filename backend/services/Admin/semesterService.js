// services/Admin/semesterService.js
const Semester = require("../../models/Semester");
const Course = require("../../models/Course");
const Offering = require("../../models/Offering");
const TimeSlot = require("../../models/TimeSlot");
const Instructor = require("../../models/Instructor");
const TeachingAssistant = require("../../models/TeachingAssistant");
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
          as: 'Offerings',  // Changed from 'offerings' to 'Offerings'
          include: [
            {
              model: Course,  // No alias needed or use as: 'Course'
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
            try {
              const instructor = await Instructor.findByPk(offeringData.instructorId, { transaction: t });
              if (instructor) {
                // Use direct query approach instead of relying on the association method
                await sequelize.query(
                  `INSERT INTO "InstructorOfferings" ("InstructorId", "OfferingId", "createdAt", "updatedAt") 
                  VALUES (?, ?, ?, ?)`,
                  {
                    replacements: [offeringData.instructorId, offeringId, new Date(), new Date()],
                    type: sequelize.QueryTypes.INSERT,
                    transaction: t
                  }
                );
                console.log(`Associated instructor ${offeringData.instructorId} with offering ${offeringId}`);
              }
            } catch (instructorError) {
              console.error(`Error associating instructor with offering ${offeringId}:`, instructorError);
              // Continue processing - don't fail the whole offering just because instructor association failed
            }
          } else {
            // If no specific instructor for offering, inherit from course
            try {
              const course = await Course.findByPk(offeringData.courseId, {
                include: [{ model: Instructor, as: 'instructors' }],
                transaction: t
              });
              
              if (course && course.instructors && course.instructors.length > 0) {
                for (const instructor of course.instructors) {
                  // Use direct query approach
                  await sequelize.query(
                    `INSERT INTO "InstructorOfferings" ("InstructorId", "OfferingId", "createdAt", "updatedAt") 
                    VALUES (?, ?, ?, ?)`,
                    {
                      replacements: [instructor.id, offeringId, new Date(), new Date()],
                      type: sequelize.QueryTypes.INSERT,
                      transaction: t
                    }
                  );
                  console.log(`Inherited instructor ${instructor.id} from course to offering ${offeringId}`);
                }
              }
            } catch (instructorError) {
              console.error(`Error inheriting instructors for offering ${offeringId}:`, instructorError);
              // Continue processing - don't fail the whole offering just because instructor association failed
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

// services/Admin/semesterService.js
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
    const enrollments = [];

    for (const studentData of studentsData) {
      try {
        // 1) Required fields
        if (!studentData.studentId || !studentData.offeringId) {
          throw new Error("Student ID and Offering ID are required");
        }

        // 2) Ensure student record exists (create if needed)
        let student = await Student.findByPk(studentData.studentId, { transaction: t });
        if (!student) {
          const user = await User.findByPk(studentData.studentId, { transaction: t });
          if (user) {
            student = await Student.create({ id: user.id, name: user.name, email: user.email }, { transaction: t });
          } else {
            await User.create({ id: studentData.studentId, name: `Student ${studentData.studentId}`, email: `${studentData.studentId}@university.edu`, userType: 'student' }, { transaction: t });
            student = await Student.create({ id: studentData.studentId, name: `Student ${studentData.studentId}`, email: `${studentData.studentId}@university.edu` }, { transaction: t });
          }
        }

        // 3) Enroll in CourseStudents
        const [courseExists] = await sequelize.query(
          `SELECT 1 FROM CourseStudents WHERE CourseId = ? AND StudentId = ? LIMIT 1`,
          { replacements: [studentData.courseId || offering.courseId, student.id], type: sequelize.QueryTypes.SELECT, transaction: t }
        );
        if (!courseExists) {
          await sequelize.query(
            `INSERT INTO CourseStudents (CourseId, StudentId, createdAt, updatedAt) VALUES (?, ?, ?, ?)`,
            { replacements: [studentData.courseId, student.id, new Date(), new Date()], type: sequelize.QueryTypes.INSERT, transaction: t }
          );
        }

        // 4) Enroll in EnrolledStudents for the offering
        const offering = await Offering.findByPk(studentData.offeringId, { transaction: t });
        if (!offering) throw new Error(`Offering ${studentData.offeringId} not found`);

        const [offExists] = await sequelize.query(
          `SELECT 1 FROM EnrolledStudents WHERE OfferingId = ? AND StudentId = ? LIMIT 1`,
          { replacements: [offering.id, student.id], type: sequelize.QueryTypes.SELECT, transaction: t }
        );
        if (!offExists) {
          await sequelize.query(
            `INSERT INTO EnrolledStudents (OfferingId, StudentId, createdAt, updatedAt) VALUES (?, ?, ?, ?)`,
            { replacements: [offering.id, student.id, new Date(), new Date()], type: sequelize.QueryTypes.INSERT, transaction: t }
          );
          await offering.increment('studentCount', { transaction: t });
        }

        // Track success
        enrollments.push({ studentId: student.id, courseId: studentData.courseId, offeringId: offering.id });
        successCount++;
      } catch (err) {
        failedCount++;
        errors.push({ data: studentData, error: err.message });
      }
    }

    await t.commit();
    return { success: successCount, failed: failedCount, errors, enrollments };
  } catch (error) {
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
    const assignments = [];
    
    // Process each TA assignment
    for (const taData of tasData) {
      try {
        // Verify required fields
        if (!taData.taId || !taData.offeringId) {
          throw new Error("TA ID and Offering ID are required");
        }
        
        console.log(`Processing TA assignment: ${taData.taId} to ${taData.offeringId}`);
        
        // Verify offering exists
        const offering = await Offering.findByPk(taData.offeringId, { transaction: t });
        
        if (!offering) {
          throw new Error(`Offering ${taData.offeringId} not found`);
        }
        
        // Verify TA exists - using the model directly
        const ta = await TeachingAssistant.findByPk(taData.taId, { transaction: t });
        
        if (!ta) {
          // Try to see if the User exists with this ID
          const user = await User.findOne({
            where: { id: taData.taId, userType: 'ta' },
            transaction: t
          });
          
          if (user) {
            // Create a TA record if the user exists but no TA record
            console.log(`User ${taData.taId} exists but no TA record. Creating TA record.`);
            const newTa = await TeachingAssistant.create({
              id: taData.taId,
              department: "Unknown",  // Default value
              totalWorkload: 0,
              createdAt: new Date(),
              updatedAt: new Date()
            }, { transaction: t });
            
            // Now use this newly created TA record
            await offering.addStudentTA(newTa, { transaction: t });
            console.log(`Created TA record and added TA ${taData.taId} to offering ${taData.offeringId}`);
          } else {
            throw new Error(`Teaching Assistant with ID ${taData.taId} not found. Please ensure the TA exists in the system.`);
          }
        } else {
          // Add TA to offering using the through table
          // Try direct approach with the through table
          try {
            // Check if the assignment already exists using raw SQL to avoid potential ORM issues
            const [existingAssignments] = await sequelize.query(
              `SELECT * FROM "TakenOfferingTAs" WHERE "TeachingAssistantId" = ? AND "OfferingId" = ?`,
              { 
                replacements: [taData.taId, taData.offeringId],
                type: sequelize.QueryTypes.SELECT,
                transaction: t
              }
            );
            
            if (existingAssignments && existingAssignments.length > 0) {
              console.log(`Assignment already exists for TA ${taData.taId} to offering ${taData.offeringId}`);
            } else {
              // Insert directly into the through table
              await sequelize.query(
                `INSERT INTO "TakenOfferingTAs" ("TeachingAssistantId", "OfferingId", "createdAt", "updatedAt") 
                 VALUES (?, ?, ?, ?)`,
                {
                  replacements: [taData.taId, taData.offeringId, new Date(), new Date()],
                  type: sequelize.QueryTypes.INSERT,
                  transaction: t
                }
              );
              
              console.log(`Added TA ${taData.taId} to offering ${taData.offeringId}`);
            }
          } catch (error) {
            // Fallback to using Sequelize method if the direct approach fails
            await offering.addStudentTA(ta, { transaction: t });
            console.log(`Added TA ${taData.taId} to offering ${taData.offeringId} using Sequelize method`);
          }
        }
        
        // Track assignment for return value
        assignments.push({
          taId: taData.taId,
          offeringId: taData.offeringId
        });
        
        successCount++;
      } catch (error) {
        failedCount++;
        errors.push({
          data: taData,
          error: error.message
        });
        console.error(`Failed to assign TA ${taData.taId} to offering:`, error.message);
      }
    }
    
    await t.commit();
    
    return {
      success: successCount,
      failed: failedCount,
      errors,
      assignments
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
          as: 'Offerings',
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
    if (semester.Offerings && semester.Offerings.length > 0) {
      for (const offering of semester.Offerings) {
        if (offering.TimeSlot && offering.TimeSlot.length > 0) {
          for (const timeSlot of offering.TimeSlot) {
            await timeSlot.destroy({ transaction: t });
          }
        }
        
        // Remove instructor associations - using proper MySQL syntax with backticks
        await sequelize.query(
          "DELETE FROM `InstructorOfferings` WHERE `OfferingId` = ?",
          {
            replacements: [offering.id],
            type: sequelize.QueryTypes.DELETE,
            transaction: t
          }
        );
        
        // Remove TA associations - using proper MySQL syntax with backticks
        await sequelize.query(
          "DELETE FROM `TakenOfferingTAs` WHERE `OfferingId` = ?",
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
        // Remove instructor associations - using proper MySQL syntax with backticks
        await sequelize.query(
          "DELETE FROM `InstructorCourses` WHERE `CourseId` = ?",
          {
            replacements: [course.id],
            type: sequelize.QueryTypes.DELETE,
            transaction: t
          }
        );
        
        // Remove student enrollments - using proper MySQL syntax with backticks
        await sequelize.query(
          "DELETE FROM `CourseStudents` WHERE `CourseId` = ?",
          {
            replacements: [course.id],
            type: sequelize.QueryTypes.DELETE,
            transaction: t
          }
        );
        
        // Remove TA associations - using proper MySQL syntax with backticks
        await sequelize.query(
          "DELETE FROM `GivenCourseTAs` WHERE `CourseId` = ?",
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

async resetTeachingAssistantsForSemester(semesterId) {
  const t = await sequelize.transaction();
  
  try {
    // Validate semester exists
    const semester = await Semester.findByPk(semesterId, { transaction: t });
    if (!semester) {
      throw new Error(`Semester with ID ${semesterId} not found`);
    }
    
    // Find all offerings for this semester
    const offerings = await Offering.findAll({
      where: { semesterId: semesterId },
      transaction: t
    });
    
    const offeringIds = offerings.map(offering => offering.id);
    
    if (offeringIds.length === 0) {
      // No offerings found for this semester
      await t.commit();
      return { deletedCount: 0 };
    }
    
    // Safety check for offeringIds to make sure it's not empty
    if (!offeringIds || offeringIds.length === 0) {
      console.log(`No offerings found for semester ${semesterId}, skipping TA reset`);
      await t.commit();
      return { deletedCount: 0 };
    }

    let deleteCount = 0;
    
    // For each offering, delete its TA assignments individually to avoid SQL IN clause length issues
    for (const offeringId of offeringIds) {
      try {
        const result = await sequelize.query(
          `DELETE FROM TakenOfferingTAs WHERE OfferingId = ?`,
          {
            replacements: [offeringId],
            type: sequelize.QueryTypes.DELETE,
            transaction: t
          }
        );
        
        // Safely access result - different database drivers may return results differently
        if (result && Array.isArray(result) && result.length > 0) {
          deleteCount += (typeof result[0] === 'number') ? result[0] : 0;
        }
      } catch (err) {
        console.error(`Error deleting TAs for offering ${offeringId}:`, err);
        // Continue with other offerings even if one fails
      }
    }
    
    console.log(`Deleted ${deleteCount} TA assignments for semester ${semesterId}`);
    
    await t.commit();
    return { deletedCount: deleteCount };
  } catch (error) {
    console.error(`Error resetting TAs for semester ${semesterId}:`, error);
    try {
      // Only rollback if transaction is still active
      if (t && !t.finished) {
        await t.rollback();
      }
    } catch (rollbackErr) {
      console.error('Error during rollback:', rollbackErr);
    }
    throw error;
  }
}

}

module.exports = new SemesterService();