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
const Course = require("../models/Course");
const DepartmentChair = require("../models/DepartmentChair");
const DeansOffice = require("../models/DeansOffice");
const Admin = require("../models/Admin");

// Utility: Load .txt files from /mockData folder
const loadLines = (filename) => {
  const filePath = path.resolve(__dirname, "mockData", filename);
  return fs.readFileSync(filePath, "utf-8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
};

// Load CSV-style course list
const loadCourses = () => {
  return new Promise((resolve) => {
    const results = [];
    const filePath = path.resolve(__dirname, "mockData", "courses.txt");
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results));
  });
};

// Helper to pick a random element
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("✅ Connected & synced with DB.");

    // Load external data files
    const names = loadLines("names.txt");
    const emails = loadLines("emails.txt");
    const departments = loadLines("departments.txt");
    const buildings = loadLines("buildings.txt");
    const rooms = loadLines("rooms.txt");
    const courses = await loadCourses();

    // Insert Users & Roles
    for (let i = 0; i < names.length; i++) {
        const id = `user${i + 1}`;
        const name = names[i];
        const email = emails[i];
        const userType = i % 5 === 0 ? "ta"
                    : i % 5 === 1 ? "instructor"
                    : i % 5 === 2 ? "student"
                    : i % 5 === 3 ? "admin"
                    : "dean";
    
        const [user, created] = await User.findOrCreate({
        where: { email },
        defaults: {
            id,
            name,
            password: "1234",
            userType
        }
        });
    
        if (!created) {
        console.log(`⚠️ Skipping duplicate: ${email}`);
        continue; // skip role creation too
        }
    
        switch (userType) {
        case "ta":
            await TeachingAssistant.create({
            id,
            department: getRandom(departments),
            totalProctoringInDepartment: Math.floor(Math.random() * 5),
            totalNonDepartmentProctoring: Math.floor(Math.random() * 3),
            totalWorkload: Math.floor(Math.random() * 20),
            isPHD: Math.random() > 0.5,
            approvedAbsence: false,
            waitingAbsenceRequest: false,
            isPartTime: Math.random() > 0.5
            });
            break;
        case "instructor":
            await Instructor.create({ id, department: getRandom(departments) });
            break;
        case "student":
            await Student.create({ id, department: getRandom(departments) });
            break;
        case "admin":
            await Admin.create({ id });
            break;
        case "dean":
            await DeansOffice.create({ id });
            break;
        case "departmentChair":
            await DepartmentChair.create({ id, department: getRandom(departments) });
            break;
        }
    }
  

    // Insert Courses
    for (let course of courses) {
      const id = `${course.Department}${course["Course Code"]}`;
      await Course.create({
        id,
        courseCode: course["Course Code"],
        courseName: course["Course Name"],
        department: course.Department,
        credit: parseInt(course.Credit),
        isGradCourse: !(course["Is Undergrad"].toLowerCase() === "true")
      });
    }

    console.log("✅ All mock data inserted successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error generating mock data:", err);
    process.exit(1);
  }
})();
