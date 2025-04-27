// backend/scripts/mockDataGenerator.js

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const sequelize = require("../config/db");
require("../models");
// Import models
const Admin = require("../models/Admin");
const Classroom = require("../models/Classroom");
const Course = require("../models/Course");
const DeansOffice = require("../models/DeansOffice");
const DepartmentChair = require("../models/DepartmentChair");
const Exam = require("../models/Exam");
const Instructor = require("../models/Instructor");
const LeaveRequest = require("../models/LeaveRequest");
const Log = require("../models/Log");
const Notification = require("../models/Notification");
const Offering = require("../models/Offering");
const Report = require("../models/Report");
const Schedule = require("../models/Schedule");
const Semester = require("../models/Semester");
const Student = require("../models/Student");
const SwapRequest = require("../models/SwapRequest");
const TeachingAssistant = require("../models/TeachingAssistant");
const TimeSlot = require("../models/TimeSlot");
const User = require("../models/User");
const Workload = require("../models/Workload");
const { start } = require("repl");

// Helper: load any CSV from mockData folder
const loadCsv = (filename) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const filePath = path.resolve(__dirname, "mockData", filename);
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
};

// Utility: parse strings to correct types
const parseValue = (val) => {
  if (typeof val === 'string') {
    const trimmed = val.trim();
    const lower = trimmed.toLowerCase();
    if (lower === 'true') return true;
    if (lower === 'false') return false;
    if (!isNaN(trimmed) && trimmed !== '') return Number(trimmed);
  }
  return val;
};

// Safe create helper
async function safeFindOrCreate(model, options, description) {
  try {
    await model.findOrCreate(options);
  } catch (err) {
    console.error(`⚠️ Duplicate or error inserting ${description}:`, err.message);
  }
}

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("✅ Connected & synced with DB.");

    // Load all CSV data
    const adminRows      = await loadCsv("admin.csv");
    const classroomRows  = await loadCsv("classrooms.csv");
    const courseRows     = await loadCsv("courses.csv");
    const deanRows       = await loadCsv("dean.csv");
    const examRows       = await loadCsv("exams.csv");
    const instructorRows = await loadCsv("instructor.csv");
    const LeaveRequestRows = await loadCsv("leave_request.csv");
    const logRows        = await loadCsv("log.csv");
    const notificationRows = await loadCsv("notifications.csv");
    const offeringRows   = await loadCsv("offerings.csv");
    const studentRows    = await loadCsv("student.csv");
    const taRows         = await loadCsv("ta.csv");
    const timeslotRows   = await loadCsv("timeslots.csv");

    // Seed Admins
    for (const row of adminRows) {
      await safeFindOrCreate(User, {
        where: { id: row.id },
        defaults: {
          id:       row.id,
          name:     row.name,
          email:    row.email,
          password: row.password,
          userType: "admin"
        }
      }, `User ${row.id}`);
      await safeFindOrCreate(Admin, { where: { id: row.id } }, `Admin ${row.id}`);
    }

    // Seed Classrooms
    for (const row of classroomRows) {
      await safeFindOrCreate(Classroom, {
        where: { id: row.id },
        defaults: {
          name:                 row.name,
          building:             row.building,
          capacity:             parseInt(row.capacity, 10),
          examSeatingCapacity:  parseInt(row.examSeatingCapacity, 10)
        }
      }, `Classroom ${row.id}`);
    }

    // Seed Courses
    for (const course of courseRows) {
      const id = `${course.Department}${course["Course Code"]}`;
      await safeFindOrCreate(Course, {
        where: { id },
        defaults: {
          id,
          courseCode:  course["Course Code"],
          courseName:  course["Course Name"],
          department:  course.Department,
          credit:      parseValue(course.Credit),
          isGradCourse: course["Is Undergrad"].toLowerCase() !== "true"
        }
      }, `Course ${id}`);
    }

    // Seed Deans
    for (const row of deanRows) {
      await safeFindOrCreate(User, {
        where: { id: row.id },
        defaults: {
          id:       row.id,
          name:     row.name,
          email:    row.email,
          password: row.password,
          userType: "dean"
        }
      }, `User ${row.id}`);
      await safeFindOrCreate(DeansOffice, {
        where: { id: row.id },
        defaults: { department: row.department }
      }, `DeansOffice ${row.id}`);
    }

    // Seed Exams
    for (const row of examRows) {
      await safeFindOrCreate(Exam, {
        where: { id: row.id },
        defaults: {
          isOutdated:        parseValue(row.isOutdated),
          date:              row.date,
          duration:          parseValue(row.duration),
          examType:          row.examType,
          proctorNum:        parseValue(row.proctorNum),
          manualAssignedTAs: parseValue(row.manualAssignedTAs),
          autoAssignedTAs:   parseValue(row.autoAssignedTAs)
        }
      }, `Exam ${row.id}`);
    }

    // Seed Instructors
    for (const row of instructorRows) {
      await safeFindOrCreate(User, {
        where: { id: row.id },
        defaults: {
          id:       row.id,
          name:     row.name,
          email:    row.email,
          password: row.password,
          userType: "instructor"
        }
      }, `User ${row.id}`);
      await safeFindOrCreate(Instructor, {
        where: { id: row.id },
        defaults: { department: row.department }
      }, `Instructor ${row.id}`);

      const [instructorInstance, created] = await Instructor.findOrCreate({
        where: { id: row.id },
        defaults: { department: row.department }
      });
      
      const courseIds = row.courses
        .split(",")
        .map(courseCode => courseCode.trim())
        .filter(courseCode => courseCode !== ""); // ⬅️ this filters EMPTY CourseIds

      if (courseIds.length > 0) {  // ⬅️ only try to add if non-empty
        await instructorInstance.addCourses(courseIds);
      }

      const offeringIds = row.offerings
        .split(",")
        .map(offeringId => offeringId.trim())
        .filter(offeringId => offeringId !== ""); // ⬅️ this filters EMPTY OfferingIds
      if (offeringIds.length > 0) {  // ⬅️ only try to add if non-empty
        await instructorInstance.addOfferings(offeringIds);
      }
    }

    // Seed Leave Requests
    for (const row of LeaveRequestRows) {
      await safeFindOrCreate(LeaveRequest, {
        where: { id: row.id },
        defaults: {
          reason:           row.reason,
          startDate:        row.startDate,
          endDate:          row.endDate,
          isApproved:       parseValue(row.isApproved),
          rejectionReason:  row.rejectionReason
        }
      }, `LeaveRequest ${row.id}`);
    }

    // Seed Logs
    for (const row of logRows) {
      await safeFindOrCreate(Log, {
        where: { id: row.id },
        defaults: {
          timestamp: row.timestamp,
          action:    row.action,
          details:   row.details
        }
      }, `Log ${row.id}`);
    }

    // Seed Notifications
    for (const row of notificationRows) {
      await safeFindOrCreate(Notification, {
        where: { id: row.id },
        defaults: {
          subject: row.subject,
          message: row.message,
          date:    row.date,
          isRead:  parseValue(row.isRead),
          recipientId: row.recipientId
        }
      }, `Notification ${row.id}`);
    }

    // Seed Offerings
    for (const row of offeringRows) {
      await safeFindOrCreate(Offering, {
        where: { id: row.id },
        defaults: {
          sectionNumber: row.sectionNumber,
          studentCount:  parseValue(row.studentCount),
        }
      }, `Offering ${row.id}`);
    }

    // Seed Students
    for (const row of studentRows) {
      await safeFindOrCreate(User, {
        where: { id: row.id },
        defaults: {
          id:       row.id,
          name:     row.name,
          email:    row.email,
          password: row.password,
          userType: "student"
        }
      }, `User ${row.id}`);
      await safeFindOrCreate(Student, {
        where: { id: row.id },
        defaults: { department: row.department }
      }, `Student ${row.id}`);
    }

    // Seed Teaching Assistants
    for (const row of taRows) {
      await safeFindOrCreate(User, {
        where: { id: row.id },
        defaults: {
          id:       row.id,
          name:     row.name,
          email:    row.email,
          password: row.password,
          userType: "ta"
        }
      }, `User ${row.id}`);
      await safeFindOrCreate(TeachingAssistant, {
        where: { id: row.id },
        defaults: {
          department:                   row.department,
          totalProctoringInDepartment: parseValue(row.totalProctoringInDepartment),
          totalNonDepartmentProctoring: parseValue(row.totalNonDepartmentProctoring),
          totalWorkload:                parseValue(row.totalWorkload),
          isPHD:                        parseValue(row.isPHD),
          approvedAbsence:              parseValue(row.approvedAbsence),
          waitingAbsenceRequest:        parseValue(row.waitingAbsenceRequest),
          isPartTime:                   parseValue(row.isPartTime)
        }
      }, `TeachingAssistant ${row.id}`);
    }

    // Seed TimeSlots
    for (const row of timeslotRows) {
      await safeFindOrCreate(TimeSlot, {
        where: { id: row.id },
        defaults: {
          day:       row.day.trim(),
          startTime: row.startTime.trim(),
          endTime:   row.endTime.trim()
        }
      }, `TimeSlot ${row.id}`);
    }

    console.log("✅ All mock data inserted successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error generating mock data:", err);
    process.exit(1);
  }
})();