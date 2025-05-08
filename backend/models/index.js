const sequelize = require("../config/db");

// Import all models
const User = require("./User");
const Admin = require("./Admin");
const TeachingAssistant = require("./TeachingAssistant");
const Instructor = require("./Instructor");
const DepartmentChair = require("./DepartmentChair");
const DeansOffice = require("./DeansOffice");
const Student = require("./Student");
const Course = require("./Course");
const Offering = require("./Offering");
const Exam = require("./Exam");
const Classroom = require("./Classroom");
const Semester = require("./Semester");
const TimeSlot = require("./TimeSlot");
const Schedule = require("./Schedule");
const Workload = require("./Workload");
const LeaveRequest = require("./LeaveRequest");
const SwapRequest = require("./SwapRequest");
const Notification = require("./Notification");
const Log = require("./Log");
const Report = require("./Report");
const PasswordResetToken = require("./passwordResetToken");
const Proctoring = require("./Proctoring");
const TARequest = require('./TARequest');


// Inheritance (1-to-1 via shared ID)
Admin.belongsTo(User, { foreignKey: "id", as: "adminUser" });
TeachingAssistant.belongsTo(User, { foreignKey: "id", as: "taUser" });
Instructor.belongsTo(User, { foreignKey: "id", as: "instructorUser" });
DepartmentChair.belongsTo(User, { foreignKey: "id", as: "chairUser" });
DeansOffice.belongsTo(User, { foreignKey: "id", as: "deanUser" });
Student.belongsTo(User, { foreignKey: "id", as: "studentUser" });

// Notifications
Notification.belongsTo(User, { as: "recipient", foreignKey: "recipientId" });
User.hasMany(Notification, { as: "notifications", foreignKey: "recipientId" });

// Course & Exam
Exam.belongsTo(Course, { foreignKey: "courseId" });
Course.hasMany(Exam, { foreignKey: "courseId" });

// Course & Semester
Course.belongsTo(Semester, { foreignKey: "semesterId" });
Semester.hasMany(Course, { foreignKey: "semesterId" });


// Course ↔ TeachingAssistant (student TAs)
Course.belongsToMany(TeachingAssistant, { through: "CourseTAs", as: "studentTAs" });
TeachingAssistant.belongsToMany(Course, { through: "CourseTAs", as: "courses" });

// Course ↔ TA (assistants)
Course.belongsToMany(TeachingAssistant, { through: "CourseTAs", as: "TAs" });
TeachingAssistant.belongsToMany(Course, { through: "CourseTAs", as: "taCourses" });

// Course ↔ Student
Course.belongsToMany(Student, { through: "CourseStudents", as: "students" });
Student.belongsToMany(Course, { through: "CourseStudents", as: "enrolledCourses" });

// Exam ↔ TA (proctors)
Exam.belongsToMany(TeachingAssistant, { through: "ExamProctors", as: "proctors" });
TeachingAssistant.belongsToMany(Exam, { through: "ExamProctors", as: "proctoring" });

// Exam ↔ Classroom
Exam.belongsToMany(Classroom, { through: "ExamClassrooms", as: "examRooms" });
Classroom.belongsToMany(Exam, { through: "ExamClassrooms", as: "exams" });

// TA ↔ Schedule
TeachingAssistant.hasOne(Schedule, { foreignKey: "taId" });
Schedule.belongsTo(TeachingAssistant, { foreignKey: "taId" });

// Schedule ↔ TimeSlot
Schedule.hasMany(TimeSlot, { foreignKey: "scheduleId", as: "timeSlots" });
TimeSlot.belongsTo(Schedule, { foreignKey: "scheduleId" });

// TA ↔ Workload
TeachingAssistant.hasMany(Workload, { foreignKey: "taId" });
Workload.belongsTo(TeachingAssistant, { foreignKey: "taId" });

// Instructor ↔ Workload
Instructor.hasMany(Workload, { foreignKey: "instructorId" });
Workload.belongsTo(Instructor, { foreignKey: "instructorId" });

// Workload ↔ Course
Course.hasMany(Workload, { foreignKey: "courseId" });
Workload.belongsTo(Course, { foreignKey: "courseId" });


Workload.belongsTo(User, { as: 'instructor', foreignKey: 'instructorId' });
User.hasMany(Workload, { foreignKey: 'instructorId' });

Workload.belongsTo(User, { as: 'ta', foreignKey: 'taId' });
User.hasMany(Workload, { foreignKey: 'taId' });


// TA ↔ LeaveRequest
TeachingAssistant.hasMany(LeaveRequest, { foreignKey: "taId" });
LeaveRequest.belongsTo(TeachingAssistant, { foreignKey: "taId" });

// TA ↔ SwapRequest
SwapRequest.belongsTo(TeachingAssistant, { as: "requester", foreignKey: "requesterId" });
SwapRequest.belongsTo(TeachingAssistant, { as: "recipient", foreignKey: "recipientId" });

TeachingAssistant.hasMany(SwapRequest, { as: "requestsSent", foreignKey: "requesterId" });
TeachingAssistant.hasMany(SwapRequest, { as: "requestsReceived", foreignKey: "recipientId" });

// SwapRequest ↔ Exam
SwapRequest.belongsTo(Exam, { foreignKey: "examId" });
Exam.hasMany(SwapRequest, { foreignKey: "examId" });

// TARequest ↔ Instructor
TARequest.belongsTo(Instructor, {foreignKey: "instructorId"});
Instructor.hasMany(TARequest, {foreignKey: "instructorId"});

// TARequest ↔ Course
TARequest.belongsTo(Course, {foreignKey: "courseId"});
Course.hasMany(TARequest, {foreignKey: "courseId"});

// TARequest ↔ TA
TARequest.belongsTo(TeachingAssistant, {foreignKey: "taId"});
TeachingAssistant.hasMany(TARequest, {foreignKey: "taId"});

// Report ↔ TimeSlot
Report.belongsTo(TimeSlot, { foreignKey: "timeSlotId" });
TimeSlot.hasMany(Report, { foreignKey: "timeSlotId" });

// Offering ↔ TimeSlot
Offering.hasMany(TimeSlot, { foreignKey: "timeSlotId" });
TimeSlot.belongsTo(Offering, { foreignKey: "timeSlotId" });

// Log ↔ User
Log.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Log, { foreignKey: "userId" });

// Course ↔ Instructor
Course.belongsToMany(Instructor, { through: "InstructorCourses", as: "instructors" });
Instructor.belongsToMany(Course, { through: "InstructorCourses", as: "courses" });

Offering.belongsToMany(Instructor, { through: "InstructorOfferings", as: "offerings" });
Instructor.belongsToMany(Offering, { through: "InstructorOfferings", as: "offerings" });

// Proctoring relationships
Proctoring.belongsTo(Exam, { as: 'exam', foreignKey: 'examId' });
Exam.hasMany(Proctoring, { as: 'proctorings', foreignKey: 'examId' });

Proctoring.belongsTo(TeachingAssistant, { as: 'teachingAssistant', foreignKey: 'taId' });
TeachingAssistant.hasMany(Proctoring, { as: 'proctorings', foreignKey: 'taId' });

// User ↔ TeachingAssistant association
User.hasOne(TeachingAssistant, { foreignKey: 'userId' });
TeachingAssistant.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
    sequelize,
    User,
    Instructor,
    Course,
    Exam,
    Classroom,
    SwapRequest,
    TeachingAssistant,
    DepartmentChair,
    DeansOffice,
    LeaveRequest,
    Workload,
    Offering,
    TARequest
  };