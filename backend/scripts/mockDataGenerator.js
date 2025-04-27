// backend/scripts/mockDataGenerator.js

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const sequelize = require("../config/db");
// Import models
const User = require("../models/User");
const TeachingAssistant = require("../models/TeachingAssistant");
const Instructor = require("../models/Instructor");
const Student = require("../models/Student");
const Admin = require("../models/Admin");
const DepartmentChair = require("../models/DepartmentChair");
const DeansOffice = require("../models/DeansOffice");
const Course = require("../models/Course");
const Exam = require("../models/Exam");
const TimeSlot = require("../models/TimeSlot");
const Classroom = require("../models/Classroom");
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
    const taRows         = await loadCsv("ta.csv");
    const instructorRows = await loadCsv("instructor.csv");
    const studentRows    = await loadCsv("student.csv");
    const adminRows      = await loadCsv("admin.csv");
    const deanRows       = await loadCsv("dean.csv");
    const courseRows     = await loadCsv("courses.csv");
    const examRows       = await loadCsv("exams.csv");
    const timeslotRows   = await loadCsv("timeslots.csv");
    const classroomRows  = await loadCsv("classrooms.csv");

    // Seed Teaching Assistants
    for (const row of taRows) {
      await safeFindOrCreate(User, {
        where: { id: row.id },
        defaults: { id: row.id, name: row.name, email: row.email, password: row.password, userType: "ta" }
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

    // Seed Instructors
    for (const row of instructorRows) {
      await safeFindOrCreate(User, {
        where: { id: row.id },
        defaults: { id: row.id, name: row.name, email: row.email, password: row.password, userType: "instructor" }
      }, `User ${row.id}`);
      await safeFindOrCreate(Instructor, { where: { id: row.id }, defaults: { department: row.department } }, `Instructor ${row.id}`);
    }

    // Seed Students
    for (const row of studentRows) {
      await safeFindOrCreate(User, {
        where: { id: row.id },
        defaults: { id: row.id, name: row.name, email: row.email, password: row.password, userType: "student" }
      }, `User ${row.id}`);
      await safeFindOrCreate(Student, { where: { id: row.id }, defaults: { department: row.department } }, `Student ${row.id}`);
    }

    // Seed Admins
    for (const row of adminRows) {
      await safeFindOrCreate(User, {
        where: { id: row.id },
        defaults: { id: row.id, name: row.name, email: row.email, password: row.password, userType: "admin" }
      }, `User ${row.id}`);
      await safeFindOrCreate(Admin, { where: { id: row.id } }, `Admin ${row.id}`);
    }

    // Seed Deans
    for (const row of deanRows) {
      await safeFindOrCreate(User, {
        where: { id: row.id },
        defaults: { id: row.id, name: row.name, email: row.email, password: row.password, userType: "dean" }
      }, `User ${row.id}`);
      await safeFindOrCreate(DeansOffice, { where: { id: row.id }, defaults: { department: row.department } }, `DeansOffice ${row.id}`);
    }

    // Seed Courses
    for (const course of courseRows) {
      const id = `${course.Department}${course["Course Code"]}`;
      await safeFindOrCreate(Course, {
        where: { id },
        defaults: {
          id,
          courseCode: course["Course Code"],
          courseName: course["Course Name"],
          department: course.Department,
          credit:     parseValue(course.Credit),
          isGradCourse: course["Is Undergrad"].toLowerCase() !== "true"
        }
      }, `Course ${id}`);
    }

    // Seed Exams
    for (const row of examRows) {
      await safeFindOrCreate(Exam, {
        where: { id: row.id },
        defaults: {
          isOutdated:       parseValue(row.isOutdated),
          date:             row.date,
          duration:         parseValue(row.duration),
          examType:         row.examType,
          proctorNum:       parseValue(row.proctorNum),
          manualAssignedTAs: parseValue(row.manualAssignedTAs),
          autoAssignedTAs:   parseValue(row.autoAssignedTAs)
        }
      }, `Exam ${row.id}`);
    }

    // Seed Timeslots
    for (const row of timeslotRows) {
      await safeFindOrCreate(TimeSlot, {
        where: { id: row.id },
        defaults: {
          startTime: row.startTime.trim(),
          endTime:   row.endTime.trim(),
          day:       row.day.trim(),
        }
      }, `TimeSlot ${row.id}`);
    }

    for (const row of classroomRows) {
      await safeFindOrCreate(Classroom, {
        where: { id: row.id },
        defaults: {
          id:                   row.id,
          name:                 row.name,                  // ⬅️ include this
          building:             row.building,
          capacity:             parseInt(row.capacity,10),
          examSeatingCapacity:  parseInt(row.examSeatingCapacity,10)  // ⬅️ and this
        }
      }, `Classroom ${row.id}`);
    }

    console.log("✅ All mock data inserted successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error generating mock data:", err);
    process.exit(1);
  }
})();