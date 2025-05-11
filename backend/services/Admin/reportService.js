const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const archiver = require('archiver');
const PDFDocument = require('pdfkit');
const sequelize = require('../../config/db');


// Import the models
const {
  Semester,
  Course,
  TeachingAssistant,
  User,
  Exam,
  Proctoring,
  SwapRequest,
  Student,
  Workload,
  Log,
Instructor,
} = require('../../models');

/**
 * Report Service for Admin
 * Handles all report-related business logic
 */
class ReportService {
  constructor() {
    // Create reports directory if it doesn't exist
    this.reportsDir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  /**
   * Get available report types
   * @returns {Array} - List of report types
   */
  async getReportTypes() {
    return [
      { id: 'proctoring', name: 'Proctoring Reports' },
      { id: 'swaps', name: 'Swap Reports' },
      { id: 'students', name: 'Student Lists' },
      { id: 'courses', name: 'Course Lists' },
      { id: 'ta', name: 'Teaching Assistant Reports' },
      { id: 'workload', name: 'Workload Reports' },
    ];
  }

  /**
   * Get available years for reports
   * @returns {Array} - List of years
   */
  async getAvailableYears() {
    // Get distinct years from the Semester model
    const semesters = await Semester.findAll({
      attributes: ['year'],
      group: ['year'],
      order: [['year', 'DESC']]
    });

    // If no semesters exist yet, return the current year
    if (semesters.length === 0) {
      return [new Date().getFullYear()];
    }

    // Map the results to a simple array of years
    return semesters.map(sem => sem.year);
  }

  /**
   * Get available semesters
   * @returns {Array} - List of semesters
   */
  async getSemesters() {
    return [
      { id: 'fall', name: 'Fall Semester' },
      { id: 'spring', name: 'Spring Semester' },
      { id: 'summer', name: 'Summer Semester' }
    ];
  }

  /**
   * Get reports with optional filtering
   * @param {number} year - Filter by year
   * @param {string} type - Filter by report type
   * @param {string} semester - Filter by semester
   * @param {string} search - Search term for report name
   * @returns {Array} - List of reports
   */
  async getReports(year, type, semester, search) {
    // Get the semester IDs that match the filter criteria
    const semesterFilter = {};
    
    if (year) {
      semesterFilter.year = year;
    }
    
    if (semester) {
      // Convert semester string to uppercase enum value
      const semesterTypeMap = {
        'fall': 'FALL',
        'spring': 'SPRING',
        'summer': 'SUMMER'
      };
      semesterFilter.semesterType = semesterTypeMap[semester];
    }
    
    const semesters = await Semester.findAll({
      where: semesterFilter,
      attributes: ['id', 'year', 'semesterType']
    });
    
    const semesterIds = semesters.map(sem => sem.id);
    
    // Build the base reports array based on available data
    let reports = [];
    
    // Helper function to create report objects
    const createReportObject = (id, name, reportType, year, semester, date) => {
      return {
        id,
        name,
        type: reportType,
        year,
        semester,
        date: date.toISOString().split('T')[0]
      };
    };
    
    // Only get reports of requested type or all if no type specified
    if (!type || type === 'proctoring') {
        for (const semester of semesters) {
            const reportId = uuidv4();
            const reportName = `Proctoring Report - ${semester.semesterType} ${semester.year}`;
            
            reports.push({
            id: reportId,
            name: reportName,
            type: 'proctoring',
            year: semester.year,
            semester: semester.semesterType.toLowerCase(),
            date: new Date()
            });
        }
        }

    
    if (!type || type === 'swaps') {
        for (const semester of semesters) {
            const reportId = uuidv4();
            const reportName = `Swap Report - ${semester.semesterType} ${semester.year}`;
            
            reports.push({
            id: reportId,
            name: reportName,
            type: 'swaps',
            year: semester.year,
            semester: semester.semesterType.toLowerCase(),
            date: new Date()
            });
        }
    }

    
    if (!type || type === 'students') {
      // For each semester, create a student list report
      for (const semester of semesters) {
        const reportId = uuidv4();
        const reportName = `Student List - ${semester.semesterType} ${semester.year}`;
        
        reports.push(createReportObject(
          reportId,
          reportName,
          'students',
          semester.year,
          semester.semesterType.toLowerCase(),
          new Date()
        ));
      }
    }
    
    if (!type || type === 'courses') {
      // For each semester, create a course list report
      for (const semester of semesters) {
        const reportId = uuidv4();
        const reportName = `Course List - ${semester.semesterType} ${semester.year}`;
        
        reports.push(createReportObject(
          reportId,
          reportName,
          'courses',
          semester.year,
          semester.semesterType.toLowerCase(),
          new Date()
        ));
      }
    }
    
    if (!type || type === 'ta') {
      // For each semester, create a TA report
      for (const semester of semesters) {
        const reportId = uuidv4();
        const reportName = `TA Report - ${semester.semesterType} ${semester.year}`;
        
        reports.push(createReportObject(
          reportId,
          reportName,
          'ta',
          semester.year,
          semester.semesterType.toLowerCase(),
          new Date()
        ));
      }
    }
    
    if (!type || type === 'workload') {
      // Get workload reports for each semester
      for (const semester of semesters) {
        // Get courses for this semester
        const courses = await Course.findAll({
          where: {
            semesterId: semester.id
          }
        });
        
        // Group workloads by TA and create a report
        const reportId = uuidv4();
        const reportName = `Workload Report - ${semester.semesterType} ${semester.year}`;
        
        reports.push(createReportObject(
          reportId,
          reportName,
          'workload',
          semester.year,
          semester.semesterType.toLowerCase(),
          new Date()
        ));
      }
    }
    
    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      reports = reports.filter(report => 
        report.name.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort reports by date (newest first)
    reports.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return reports;
  }

  /**
   * Generate a proctoring report
   * @param {number} year - Year for the report
   * @param {string} semester - Semester for the report
   * @returns {Object} - Report data and file path
   */
  async generateProctoringReport(year, semester) {
    // Convert semester string to uppercase enum value
    const semesterTypeMap = {
      'fall': 'FALL',
      'spring': 'SPRING',
      'summer': 'SUMMER'
    };
    
    const semesterType = semesterTypeMap[semester];
    
    // Find the semester
    const semesterData = await Semester.findOne({
      where: {
        year,
        semesterType
      }
    });
    
    if (!semesterData) {
      throw new Error(`Semester not found: ${semester} ${year}`);
    }
    
    // Get courses for this semester
    const courses = await Course.findAll({
      where: {
        semesterId: semesterData.id
      }
    });
    
    const courseIds = courses.map(course => course.id);
    
    // Get exams for these courses
    const exams = await Exam.findAll({
      where: {
        courseId: {
          [Op.in]: courseIds
        }
      },
      include: [
        { model: Course }
      ]
    });
    
    // Get proctoring assignments for these exams
    const proctorings = await Proctoring.findAll({
      where: {
        examId: {
          [Op.in]: exams.map(exam => exam.id)
        }
      },
      include: [
        { 
          model: TeachingAssistant,
          as: 'teachingAssistant',
          include: [
            { model: User, as: 'taUser' }
          ]
        },
        { 
          model: Exam,
          as: 'exam'
        }
      ]
    });
    
    // Prepare the report data
    const reportData = {
      semester: `${semesterType} ${year}`,
      generatedDate: new Date().toISOString(),
      totalExams: exams.length,
      totalProctorings: proctorings.length,
      exams: exams.map(exam => ({
        id: exam.id,
        courseName: exam.courseName,
        examType: exam.examType,
        date: exam.date,
        duration: exam.duration,
        proctorNum: exam.proctorNum,
        department: exam.department,
        proctors: proctorings
          .filter(p => p.examId === exam.id)
          .map(p => ({
            id: p.taId,
            name: p.teachingAssistant?.taUser?.name || 'Unknown',
            department: p.teachingAssistant?.department || 'Unknown',
            isManualAssignment: p.isManualAssignment,
            status: p.status
          }))
      }))
    };
    
    // Generate a report ID and filename
    const reportId = uuidv4();
    const reportName = `Proctoring_Report_${semesterType}_${year}`;
    const pdfFilename = `${reportName}_${reportId}.pdf`;
    const pdfPath = path.join(this.reportsDir, pdfFilename);
    
    // Generate PDF report
    await this.generatePDF(pdfPath, 'Proctoring Report', reportData);
    
    return {
      id: reportId,
      name: `Proctoring Report - ${semesterType} ${year}`,
      type: 'proctoring',
      data: reportData,
      filename: pdfFilename,
      filepath: pdfPath
    };
  }

  /**
   * Generate a swap report
   * @param {number} year - Year for the report
   * @param {string} semester - Semester for the report
   * @returns {Object} - Report data and file path
   */
  async generateSwapReport(year, semester) {
    // Convert semester string to uppercase enum value
    const semesterTypeMap = {
      'fall': 'FALL',
      'spring': 'SPRING',
      'summer': 'SUMMER'
    };
    
    const semesterType = semesterTypeMap[semester];
    
    // Find the semester
    const semesterData = await Semester.findOne({
      where: {
        year,
        semesterType
      }
    });
    
    if (!semesterData) {
      throw new Error(`Semester not found: ${semester} ${year}`);
    }
    
    // Get courses for this semester
    const courses = await Course.findAll({
      where: {
        semesterId: semesterData.id
      }
    });
    
    const courseIds = courses.map(course => course.id);
    
    // Get exams for these courses
    const exams = await Exam.findAll({
      where: {
        courseId: {
          [Op.in]: courseIds
        }
      },
      include: [
        { model: Course }
      ]
    });
    
    const examIds = exams.map(exam => exam.id);
    
    // Get swap requests for these exams
    const swapRequests = await SwapRequest.findAll({
      where: {
        [Op.or]: [
          { examId: { [Op.in]: examIds } },
          { respondentExamId: { [Op.in]: examIds } }
        ]
      },
      include: [
        { 
          model: TeachingAssistant,
          as: 'requester',
          include: [
            { model: User, as: 'taUser' }
          ]
        },
        { 
          model: TeachingAssistant,
          as: 'targetTa',
          include: [
            { model: User, as: 'taUser' }
          ]
        },
        { 
          model: Exam,
          as: 'exam'
        }
      ]
    });
    
    // Prepare the report data
    const reportData = {
      semester: `${semesterType} ${year}`,
      generatedDate: new Date().toISOString(),
      totalSwapRequests: swapRequests.length,
      pendingSwaps: swapRequests.filter(sr => sr.status === 'PENDING').length,
      approvedSwaps: swapRequests.filter(sr => sr.status === 'APPROVED').length,
      rejectedSwaps: swapRequests.filter(sr => sr.status === 'REJECTED').length,
      cancelledSwaps: swapRequests.filter(sr => sr.status === 'CANCELLED').length,
      swapRequests: swapRequests.map(sr => ({
        id: sr.id,
        requesterName: sr.requester?.taUser?.name || 'Unknown',
        targetName: sr.targetTa?.taUser?.name || 'Unknown',
        examName: sr.exam?.courseName || 'Unknown',
        examDate: sr.exam?.date || 'Unknown',
        requestDate: sr.requestDate,
        status: sr.status,
        isForumPost: sr.isForumPost
      }))
    };
    
    // Generate a report ID and filename
    const reportId = uuidv4();
    const reportName = `Swap_Report_${semesterType}_${year}`;
    const pdfFilename = `${reportName}_${reportId}.pdf`;
    const pdfPath = path.join(this.reportsDir, pdfFilename);
    
    // Generate PDF report
    await this.generatePDF(pdfPath, 'Swap Request Report', reportData);
    
    return {
      id: reportId,
      name: `Swap Report - ${semesterType} ${year}`,
      type: 'swaps',
      data: reportData,
      filename: pdfFilename,
      filepath: pdfPath
    };
  }

  /**
   * Generate a student list report
   * @param {number} year - Year for the report
   * @param {string} semester - Semester for the report
   * @param {string} department - Optional department filter
   * @returns {Object} - Report data and file path
   */
  async generateStudentListReport(year, semester, department) {
    // Convert semester string to uppercase enum value
    const semesterTypeMap = {
      'fall': 'FALL',
      'spring': 'SPRING',
      'summer': 'SUMMER'
    };
    
    const semesterType = semesterTypeMap[semester];
    
    // Find the semester
    const semesterData = await Semester.findOne({
      where: {
        year,
        semesterType
      }
    });
    
    if (!semesterData) {
      throw new Error(`Semester not found: ${semester} ${year}`);
    }
    
    // Get courses for this semester
    const courseWhere = {
      semesterId: semesterData.id
    };
    
    if (department) {
      courseWhere.department = department;
    }
    
    const courses = await Course.findAll({
      where: courseWhere,
      include: [
        { model: Student, as: 'students' }
      ]
    });
    
    // Collect all unique students
    const allStudents = new Map();
    
    for (const course of courses) {
      for (const student of course.students) {
        if (!allStudents.has(student.id)) {
          allStudents.set(student.id, {
            id: student.id,
            studentId: student.studentId,
            nameSurname: student.nameSurname,
            email: student.email,
            department: student.department,
            courses: []
          });
        }
        
        allStudents.get(student.id).courses.push({
          courseCode: course.courseCode,
          courseName: course.courseName
        });
      }
    }
    
    // Prepare the report data
    const reportData = {
      semester: `${semesterType} ${year}`,
      department: department || 'All Departments',
      generatedDate: new Date().toISOString(),
      totalStudents: allStudents.size,
      students: Array.from(allStudents.values())
    };
    
    // Generate a report ID and filename
    const reportId = uuidv4();
    let reportName = `Student_List_${semesterType}_${year}`;
    if (department) {
      reportName += `_${department.replace(/\s+/g, '_')}`;
    }
    const pdfFilename = `${reportName}_${reportId}.pdf`;
    const pdfPath = path.join(this.reportsDir, pdfFilename);
    
    // Generate PDF report
    await this.generatePDF(pdfPath, 'Student List Report', reportData);
    
    return {
      id: reportId,
      name: `Student List - ${semesterType} ${year}${department ? ` - ${department}` : ''}`,
      type: 'students',
      data: reportData,
      filename: pdfFilename,
      filepath: pdfPath
    };
  }

  /**
   * Generate a course list report
   * @param {number} year - Year for the report
   * @param {string} semester - Semester for the report
   * @param {string} department - Optional department filter
   * @returns {Object} - Report data and file path
   */
  async generateCourseListReport(year, semester, department) {
    // Convert semester string to uppercase enum value
    const semesterTypeMap = {
      'fall': 'FALL',
      'spring': 'SPRING',
      'summer': 'SUMMER'
    };
    
    const semesterType = semesterTypeMap[semester];
    
    // Find the semester
    const semesterData = await Semester.findOne({
      where: {
        year,
        semesterType
      }
    });
    
    if (!semesterData) {
      throw new Error(`Semester not found: ${semester} ${year}`);
    }
    
    // Get courses for this semester
    const courseWhere = {
      semesterId: semesterData.id
    };
    
    if (department) {
      courseWhere.department = department;
    }
    
    const courses = await Course.findAll({
      where: courseWhere,
      include: [
        { model: Instructor, as: 'instructors' },
        { model: TeachingAssistant, as: 'TAs' },
        { model: Student, as: 'students' }
      ]
    });
    
    // Prepare the report data
    const reportData = {
      semester: `${semesterType} ${year}`,
      department: department || 'All Departments',
      generatedDate: new Date().toISOString(),
      totalCourses: courses.length,
      courses: courses.map(course => ({
        id: course.id,
        courseCode: course.courseCode,
        courseName: course.courseName,
        department: course.department,
        credit: course.credit,
        isGradCourse: course.isGradCourse,
        studentCount: course.students.length,
        instructors: course.instructors.map(instructor => ({
          id: instructor.id,
          name: instructor.instructorUser ? instructor.instructorUser.name : 'Unknown'
        })),
        teachingAssistants: course.TAs.map(ta => ({
          id: ta.id,
          name: ta.taUser ? ta.taUser.name : 'Unknown',
          department: ta.department,
          isPHD: ta.isPHD
        }))
      }))
    };
    
    // Generate a report ID and filename
    const reportId = uuidv4();
    let reportName = `Course_List_${semesterType}_${year}`;
    if (department) {
      reportName += `_${department.replace(/\s+/g, '_')}`;
    }
    const pdfFilename = `${reportName}_${reportId}.pdf`;
    const pdfPath = path.join(this.reportsDir, pdfFilename);
    
    // Generate PDF report
    await this.generatePDF(pdfPath, 'Course List Report', reportData);
    
    return {
      id: reportId,
      name: `Course List - ${semesterType} ${year}${department ? ` - ${department}` : ''}`,
      type: 'courses',
      data: reportData,
      filename: pdfFilename,
      filepath: pdfPath
    };
  }

  /**
   * Generate a TA report
   * @param {number} year - Year for the report
   * @param {string} semester - Semester for the report
   * @param {string} department - Optional department filter
   * @returns {Object} - Report data and file path
   */
  async generateTAReport(year, semester, department) {
    // Convert semester string to uppercase enum value
    const semesterTypeMap = {
      'fall': 'FALL',
      'spring': 'SPRING',
      'summer': 'SUMMER'
    };
    
    const semesterType = semesterTypeMap[semester];
    
    // Find the semester
    const semesterData = await Semester.findOne({
      where: {
        year,
        semesterType
      }
    });
    
    if (!semesterData) {
      throw new Error(`Semester not found: ${semester} ${year}`);
    }
    
    // Get all TAs
    const taWhere = {};
    if (department) {
      taWhere.department = department;
    }
    
    const teachingAssistants = await TeachingAssistant.findAll({
      where: taWhere,
      include: [
        { model: User, as: 'taUser' },
        { model: Course, as: 'taCourses' },
        { 
          model: Proctoring, 
          as: 'proctorings',
          include: [
            { 
              model: Exam, 
              as: 'exam',
              include: [
                { 
                  model: Course,
                  where: {
                    semesterId: semesterData.id
                  }
                }
              ]
            }
          ]
        }
      ]
    });
    
    // Prepare the report data
    const reportData = {
      semester: `${semesterType} ${year}`,
      department: department || 'All Departments',
      generatedDate: new Date().toISOString(),
      totalTAs: teachingAssistants.length,
      teachingAssistants: teachingAssistants.map(ta => {
        // Filter proctorings to only those in the selected semester
        const semesterProctorings = ta.proctorings.filter(p => 
          p.exam && p.exam.Course && p.exam.Course.semesterId === semesterData.id
        );
        
        return {
          id: ta.id,
          name: ta.taUser ? ta.taUser.name : 'Unknown',
          department: ta.department,
          isPHD: ta.isPHD,
          isPartTime: ta.isPartTime,
          totalWorkload: ta.totalWorkload,
          totalProctoringInDepartment: ta.totalProctoringInDepartment,
          totalNonDepartmentProctoring: ta.totalNonDepartmentProctoring,
          courses: ta.taCourses.filter(course => course.semesterId === semesterData.id).map(course => ({
            id: course.id,
            courseCode: course.courseCode,
            courseName: course.courseName
          })),
          proctorings: semesterProctorings.map(p => ({
            id: p.id,
            examName: p.exam ? p.exam.courseName : 'Unknown',
            examDate: p.exam ? p.exam.date : 'Unknown',
            status: p.status,
            isManualAssignment: p.isManualAssignment
          }))
        };
      })
    };
    
    // Generate a report ID and filename
    const reportId = uuidv4();
    let reportName = `TA_Report_${semesterType}_${year}`;
    if (department) {
      reportName += `_${department.replace(/\s+/g, '_')}`;
    }
    const pdfFilename = `${reportName}_${reportId}.pdf`;
    const pdfPath = path.join(this.reportsDir, pdfFilename);
    
    // Generate PDF report
    await this.generatePDF(pdfPath, 'Teaching Assistant Report', reportData);
    
    return {
      id: reportId,
      name: `TA Report - ${semesterType} ${year}${department ? ` - ${department}` : ''}`,
      type: 'ta',
      data: reportData,
      filename: pdfFilename,
      filepath: pdfPath
    };
  }

  /**
   * Generate a workload report
   * @param {number} year - Year for the report
   * @param {string} semester - Semester for the report
   * @returns {Object} - Report data and file path
   */
  async generateWorkloadReport(year, semester) {
    // Convert semester string to uppercase enum value
    const semesterTypeMap = {
      'fall': 'FALL',
      'spring': 'SPRING',
      'summer': 'SUMMER'
    };
    
    const semesterType = semesterTypeMap[semester];
    
    // Find the semester
    const semesterData = await Semester.findOne({
      where: {
        year,
        semesterType
      }
    });
    
    if (!semesterData) {
      throw new Error(`Semester not found: ${semester} ${year}`);
    }
    
    // Get courses for this semester
    const courses = await Course.findAll({
      where: {
        semesterId: semesterData.id
      }
    });
    
    const courseIds = courses.map(course => course.id);
    
    // Get workloads for these courses
    const workloads = await Workload.findAll({
      where: {
        courseId: {
          [Op.in]: courseIds
        }
      },
      include: [
        { 
          model: TeachingAssistant,
          include: [
            { model: User, as: 'taUser' }
          ]
        },
        { 
          model: Instructor,
          include: [
            { model: User, as: 'instructorUser' }
          ]
        },
        { model: Course }
      ]
    });
    
    // Group workloads by TA
    const taWorkloads = new Map();
    
    for (const workload of workloads) {
      if (!workload.taId) continue;
      
      if (!taWorkloads.has(workload.taId)) {
        taWorkloads.set(workload.taId, {
          id: workload.taId,
          name: workload.TeachingAssistant?.taUser?.name || 'Unknown',
          department: workload.TeachingAssistant?.department || 'Unknown',
          isPHD: workload.TeachingAssistant?.isPHD || false,
          totalHours: 0,
          workloads: []
        });
      }
      
      const taData = taWorkloads.get(workload.taId);
      
      taData.totalHours += workload.duration;
      taData.workloads.push({
        id: workload.id,
        taskType: workload.taskType,
        date: workload.date,
        duration: workload.duration,
        isApproved: workload.isApproved,
        courseName: workload.Course?.courseName || 'Unknown',
        courseCode: workload.Course?.courseCode || 'Unknown',
        instructor: workload.Instructor?.instructorUser?.name || 'Unknown'
      });
    }
    
    // Prepare the report data
    const reportData = {
      semester: `${semesterType} ${year}`,
      generatedDate: new Date().toISOString(),
      totalTAs: taWorkloads.size,
      totalWorkloadHours: Array.from(taWorkloads.values()).reduce((sum, ta) => sum + ta.totalHours, 0),
      teachingAssistants: Array.from(taWorkloads.values())
    };
    
    // Generate a report ID and filename
    const reportId = uuidv4();
    const reportName = `Workload_Report_${semesterType}_${year}`;
    const pdfFilename = `${reportName}_${reportId}.pdf`;
    const pdfPath = path.join(this.reportsDir, pdfFilename);
    
    // Generate PDF report
    await this.generatePDF(pdfPath, 'Workload Report', reportData);
    
    return {
      id: reportId,
      name: `Workload Report - ${semesterType} ${year}`,
      type: 'workload',
      data: reportData,
      filename: pdfFilename,
      filepath: pdfPath
    };
  }

 /**
 * Download a specific report based on type, year, and semester
 * @param {string} type - Report type (e.g., 'proctoring', 'swaps', etc.)
 * @param {number} year - Academic year
 * @param {string} semester - Semester ('fall', 'spring', 'summer')
 * @returns {Object} - Report file data
 */
async downloadReport(type, year, semester) {
  let report;

  switch (type) {
    case 'proctoring':
      report = await this.generateProctoringReport(year, semester);
      break;
    case 'swaps':
      report = await this.generateSwapReport(year, semester);
      break;
    case 'students':
      report = await this.generateStudentListReport(year, semester);
      break;
    case 'courses':
      report = await this.generateCourseListReport(year, semester);
      break;
    case 'ta':
      report = await this.generateTAReport(year, semester);
      break;
    case 'workload':
      report = await this.generateWorkloadReport(year, semester);
      break;
    default:
      throw new Error(`Unknown report type: ${type}`);
  }

  const fileContent = fs.readFileSync(report.filepath);

  return {
    content: fileContent,
    filename: report.filename
  };
}


  /**
   * Download multiple reports as a zip file
   * @param {Array} ids - Array of report IDs
   * @returns {Object} - Zip file data
   */
  async downloadMultipleReports(ids) {
    const zipFilename = `reports_${new Date().toISOString().replace(/:/g, '-')}.zip`;
    const zipPath = path.join(this.reportsDir, zipFilename);
    
    // Create a file to stream archive data to
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level
    });
    
    // Listen for all archive data to be written
    const closePromise = new Promise((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
    });
    
    // Pipe archive data to the file
    archive.pipe(output);
    
    // Download each report and add to the zip
    for (const id of ids) {
      try {
        const report = await this.downloadReport(id);
        archive.append(report.content, { name: report.filename });
      } catch (error) {
        console.error(`Error adding report ${id} to zip:`, error);
        // Continue with other reports
      }
    }
    
    // Finalize the archive
    await archive.finalize();
    
    // Wait until the zip is fully written
    await closePromise;
    
    // Read the zip file
    const zipContent = fs.readFileSync(zipPath);
    
    // Clean up the temporary zip file
    fs.unlinkSync(zipPath);
    
    return {
      content: zipContent,
      filename: zipFilename
    };
  }

  /**
   * Get system log entries with optional filtering
   * @param {string} startDate - Start date for logs
   * @param {string} endDate - End date for logs
   * @param {string} userType - Filter by user type
   * @param {string} action - Filter by action
   * @returns {Array} - List of log entries
   */
  async getSystemLogs(startDate, endDate, userType, action) {
    const where = {};
    
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      where.createdAt = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      where.createdAt = {
        [Op.lte]: new Date(endDate)
      };
    }
    
    // Get logs from the Log model
    const logs = await Log.findAll({
      where,
      include: [
        { model: User }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Filter by user type if needed
    let filteredLogs = logs;
    if (userType) {
      filteredLogs = filteredLogs.filter(log => log.User && log.User.userType === userType);
    }
    
    // Filter by action if needed
    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action && log.action.includes(action));
    }
    
    return filteredLogs.map(log => ({
      id: log.id,
      userId: log.userId,
      userName: log.User ? log.User.name : 'Unknown',
      userType: log.User ? log.User.userType : 'Unknown',
      action: log.action,
      details: log.details,
      createdAt: log.createdAt
    }));
  }

  /**
   * Helper method to generate PDF report
   * @param {string} filePath - Path to save the PDF
   * @param {string} title - Report title
   * @param {Object} data - Report data
   */
  async generatePDF(filePath, title, data) {
    return new Promise((resolve, reject) => {
      try {
        // Create a document
        const doc = new PDFDocument({ margin: 50 });
        
        // Pipe its output to the file
        doc.pipe(fs.createWriteStream(filePath));
        
        // Add the report title
        doc.fontSize(25).text(title, { align: 'center' });
        doc.moveDown();
        
        // Add report generation info
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
        doc.moveDown();
        
        // Add semester info
        doc.fontSize(14).text(`Semester: ${data.semester}`, { align: 'left' });
        doc.moveDown();
        
        // Different content based on report type
        if (title.includes('Proctoring')) {
          this.generateProctoringPDF(doc, data);
        } else if (title.includes('Swap')) {
          this.generateSwapPDF(doc, data);
        } else if (title.includes('Student')) {
          this.generateStudentPDF(doc, data);
        } else if (title.includes('Course')) {
          this.generateCoursePDF(doc, data);
        } else if (title.includes('Teaching Assistant')) {
          this.generateTAPDF(doc, data);
        } else if (title.includes('Workload')) {
          this.generateWorkloadPDF(doc, data);
        }
        
        // Finalize PDF file
        doc.end();
        
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Helper method to generate proctoring PDF content
   * @param {PDFDocument} doc - PDF document
   * @param {Object} data - Report data
   */
  generateProctoringPDF(doc, data) {
    // Add summary section
    doc.fontSize(12).text('Summary', { underline: true });
    doc.fontSize(10).text(`Total Exams: ${data.totalExams}`);
    doc.fontSize(10).text(`Total Proctoring Assignments: ${data.totalProctorings}`);
    doc.moveDown();
    
    // Add exams section
    doc.fontSize(12).text('Exams', { underline: true });
    doc.moveDown();
    
    // Loop through each exam
    data.exams.forEach((exam, index) => {
      // Add exam details
      doc.fontSize(11).text(`${index + 1}. ${exam.courseName} (${exam.examType})`, { underline: true });
      doc.fontSize(10).text(`Date: ${new Date(exam.date).toLocaleDateString()}`);
      doc.fontSize(10).text(`Duration: ${exam.duration} minutes`);
      doc.fontSize(10).text(`Department: ${exam.department}`);
      doc.fontSize(10).text(`Required Proctors: ${exam.proctorNum}`);
      doc.moveDown();
      
      // Add proctors section if any
      if (exam.proctors && exam.proctors.length > 0) {
        doc.fontSize(10).text('Assigned Proctors:', { underline: true });
        
        // Loop through each proctor
        exam.proctors.forEach((proctor, pIndex) => {
          doc.fontSize(9).text(`${pIndex + 1}. ${proctor.name} (${proctor.department}) - Status: ${proctor.status}`);
        });
      } else {
        doc.fontSize(10).text('No proctors assigned');
      }
      
      doc.moveDown();
      
      // Add a page break if not the last exam
      if (index < data.exams.length - 1) {
        doc.addPage();
      }
    });
  }

  /**
   * Helper method to generate swap PDF content
   * @param {PDFDocument} doc - PDF document
   * @param {Object} data - Report data
   */
  generateSwapPDF(doc, data) {
    // Add summary section
    doc.fontSize(12).text('Summary', { underline: true });
    doc.fontSize(10).text(`Total Swap Requests: ${data.totalSwapRequests}`);
    doc.fontSize(10).text(`Pending Requests: ${data.pendingSwaps}`);
    doc.fontSize(10).text(`Approved Requests: ${data.approvedSwaps}`);
    doc.fontSize(10).text(`Rejected Requests: ${data.rejectedSwaps}`);
    doc.fontSize(10).text(`Cancelled Requests: ${data.cancelledSwaps}`);
    doc.moveDown();
    
    // Add swap requests section
    doc.fontSize(12).text('Swap Requests', { underline: true });
    doc.moveDown();
    
    // Create a simple table header
    const startX = 50;
    const columnWidth = 80;
    
    doc.fontSize(9);
    doc.text('Requester', startX, doc.y);
    doc.text('Target TA', startX + columnWidth, doc.y - doc.currentLineHeight());
    doc.text('Exam', startX + columnWidth * 2, doc.y - doc.currentLineHeight());
    doc.text('Request Date', startX + columnWidth * 3, doc.y - doc.currentLineHeight());
    doc.text('Status', startX + columnWidth * 4, doc.y - doc.currentLineHeight());
    
    doc.moveDown();
    
    // Add a line below the header
    doc.moveTo(startX, doc.y)
      .lineTo(startX + columnWidth * 5, doc.y)
      .stroke();
    
    doc.moveDown();
    
    // Loop through each swap request
    data.swapRequests.forEach((swap, index) => {
      // Check if we need a new page
      if (doc.y > 700) {
        doc.addPage();
      }
      
      doc.fontSize(8);
      doc.text(swap.requesterName, startX, doc.y);
      doc.text(swap.targetName, startX + columnWidth, doc.y - doc.currentLineHeight());
      doc.text(swap.examName, startX + columnWidth * 2, doc.y - doc.currentLineHeight(), { width: 80 });
      doc.text(new Date(swap.requestDate).toLocaleDateString(), startX + columnWidth * 3, doc.y - doc.currentLineHeight());
      doc.text(swap.status, startX + columnWidth * 4, doc.y - doc.currentLineHeight());
      
      doc.moveDown();
    });
  }

  /**
   * Helper method to generate student list PDF content
   * @param {PDFDocument} doc - PDF document
   * @param {Object} data - Report data
   */
  generateStudentPDF(doc, data) {
    // Add summary section
    doc.fontSize(12).text('Summary', { underline: true });
    doc.fontSize(10).text(`Department: ${data.department}`);
    doc.fontSize(10).text(`Total Students: ${data.totalStudents}`);
    doc.moveDown();
    
    // Add students section
    doc.fontSize(12).text('Students', { underline: true });
    doc.moveDown();
    
    // Loop through each student
    data.students.forEach((student, index) => {
      // Check if we need a new page
      if (doc.y > 700) {
        doc.addPage();
      }
      
      // Add student details
      doc.fontSize(10).text(`${index + 1}. ${student.nameSurname} (${student.studentId})`, { underline: true });
      doc.fontSize(9).text(`Email: ${student.email}`);
      doc.fontSize(9).text(`Department: ${student.department}`);
      
      // Add courses if any
      if (student.courses && student.courses.length > 0) {
        doc.fontSize(9).text('Enrolled Courses:', { underline: true });
        
        // Loop through each course
        student.courses.forEach((course, cIndex) => {
          doc.fontSize(8).text(`${cIndex + 1}. ${course.courseCode} - ${course.courseName}`);
        });
      } else {
        doc.fontSize(9).text('No courses enrolled');
      }
      
      doc.moveDown();
    });
  }

  /**
   * Helper method to generate course list PDF content
   * @param {PDFDocument} doc - PDF document
   * @param {Object} data - Report data
   */
  generateCoursePDF(doc, data) {
    // Add summary section
    doc.fontSize(12).text('Summary', { underline: true });
    doc.fontSize(10).text(`Department: ${data.department}`);
    doc.fontSize(10).text(`Total Courses: ${data.totalCourses}`);
    doc.moveDown();
    
    // Add courses section
    doc.fontSize(12).text('Courses', { underline: true });
    doc.moveDown();
    
    // Loop through each course
    data.courses.forEach((course, index) => {
      // Check if we need a new page
      if (doc.y > 650) {
        doc.addPage();
      }
      
      // Add course details
      doc.fontSize(11).text(`${index + 1}. ${course.courseCode} - ${course.courseName}`, { underline: true });
      doc.fontSize(9).text(`Department: ${course.department}`);
      doc.fontSize(9).text(`Credit: ${course.credit}`);
      doc.fontSize(9).text(`Graduate Course: ${course.isGradCourse ? 'Yes' : 'No'}`);
      doc.fontSize(9).text(`Student Count: ${course.studentCount}`);
      doc.moveDown();
      
      // Add instructors if any
      if (course.instructors && course.instructors.length > 0) {
        doc.fontSize(9).text('Instructors:', { underline: true });
        
        // Loop through each instructor
        course.instructors.forEach((instructor, iIndex) => {
          doc.fontSize(8).text(`${iIndex + 1}. ${instructor.name}`);
        });
        
        doc.moveDown();
      }
      
      // Add TAs if any
      if (course.teachingAssistants && course.teachingAssistants.length > 0) {
        doc.fontSize(9).text('Teaching Assistants:', { underline: true });
        
        // Loop through each TA
        course.teachingAssistants.forEach((ta, tIndex) => {
          doc.fontSize(8).text(`${tIndex + 1}. ${ta.name} (${ta.department}) - PhD: ${ta.isPHD ? 'Yes' : 'No'}`);
        });
      }
      
      doc.moveDown();
    });
  }

  /**
   * Helper method to generate TA PDF content
   * @param {PDFDocument} doc - PDF document
   * @param {Object} data - Report data
   */
  generateTAPDF(doc, data) {
    // Add summary section
    doc.fontSize(12).text('Summary', { underline: true });
    doc.fontSize(10).text(`Department: ${data.department}`);
    doc.fontSize(10).text(`Total Teaching Assistants: ${data.totalTAs}`);
    doc.moveDown();
    
    // Add TAs section
    doc.fontSize(12).text('Teaching Assistants', { underline: true });
    doc.moveDown();
    
    // Loop through each TA
    data.teachingAssistants.forEach((ta, index) => {
      // Check if we need a new page
      if (doc.y > 650) {
        doc.addPage();
      }
      
      // Add TA details
      doc.fontSize(11).text(`${index + 1}. ${ta.name}`, { underline: true });
      doc.fontSize(9).text(`Department: ${ta.department}`);
      doc.fontSize(9).text(`PhD Student: ${ta.isPHD ? 'Yes' : 'No'}`);
      doc.fontSize(9).text(`Part Time: ${ta.isPartTime ? 'Yes' : 'No'}`);
      doc.fontSize(9).text(`Total Workload: ${ta.totalWorkload || 0} hours`);
      doc.fontSize(9).text(`Proctoring (In Department): ${ta.totalProctoringInDepartment || 0}`);
      doc.fontSize(9).text(`Proctoring (Other Departments): ${ta.totalNonDepartmentProctoring || 0}`);
      doc.moveDown();
      
      // Add courses if any
      if (ta.courses && ta.courses.length > 0) {
        doc.fontSize(9).text('Assigned Courses:', { underline: true });
        
        // Loop through each course
        ta.courses.forEach((course, cIndex) => {
          doc.fontSize(8).text(`${cIndex + 1}. ${course.courseCode} - ${course.courseName}`);
        });
        
        doc.moveDown();
      }
      
      // Add proctorings if any
      if (ta.proctorings && ta.proctorings.length > 0) {
        doc.fontSize(9).text('Proctoring Assignments:', { underline: true });
        
        // Loop through each proctoring
        ta.proctorings.forEach((proc, pIndex) => {
          doc.fontSize(8).text(`${pIndex + 1}. ${proc.examName} (${new Date(proc.examDate).toLocaleDateString()}) - Status: ${proc.status}`);
        });
      }
      
      doc.moveDown();
      
      // Add page break if not the last TA
      if (index < data.teachingAssistants.length - 1) {
        doc.addPage();
      }
    });
  }

  /**
   * Helper method to generate workload PDF content
   * @param {PDFDocument} doc - PDF document
   * @param {Object} data - Report data
   */
  generateWorkloadPDF(doc, data) {
    console.log("Generating Workload PDF..."); // 👈 Add this
    console.log("TA count:", data.teachingAssistants?.length);
    console.log("Sample TA:", data.teachingAssistants?.[0]);

    // Add summary section
    doc.fontSize(12).text('Summary', { underline: true });
    doc.fontSize(10).text(`Total Teaching Assistants: ${data.totalTAs}`);
    doc.fontSize(10).text(`Total Workload Hours: ${data.totalWorkloadHours}`);
    doc.moveDown();
    
    // Add TAs section
    doc.fontSize(12).text('Teaching Assistant Workloads', { underline: true });
    doc.moveDown();
    
    // Loop through each TA
    data.teachingAssistants.forEach((ta, index) => {
      // Check if we need a new page
      if (doc.y > 650) {
        doc.addPage();
      }
      
      // Add TA details
      doc.fontSize(11).text(`${index + 1}. ${ta.name}`, { underline: true });
      doc.fontSize(9).text(`Department: ${ta.department}`);
      doc.fontSize(9).text(`PhD Student: ${ta.isPHD ? 'Yes' : 'No'}`);
      doc.fontSize(9).text(`Total Hours: ${ta.totalHours}`);
      doc.moveDown();
      
      // Add workloads if any
      if (ta.workloads && ta.workloads.length > 0) {
        doc.fontSize(9).text('Workload Entries:', { underline: true });
        
        // Create a simple table header
        const startX = 50;
        const columnWidth = 85;
        
        doc.fontSize(8);
        doc.text('Course', startX, doc.y);
        doc.text('Task Type', startX + columnWidth, doc.y - doc.currentLineHeight());
        doc.text('Date', startX + columnWidth * 2, doc.y - doc.currentLineHeight());
        doc.text('Hours', startX + columnWidth * 3, doc.y - doc.currentLineHeight());
        doc.text('Status', startX + columnWidth * 4, doc.y - doc.currentLineHeight());
        
        doc.moveDown();
        
        // Add a line below the header
        doc.moveTo(startX, doc.y)
          .lineTo(startX + columnWidth * 5, doc.y)
          .stroke();
        
        doc.moveDown();
        
        // Loop through each workload entry
        ta.workloads.forEach((wl, wIndex) => {
          // Check if we need a new page
          if (doc.y > 750) {
            doc.addPage();
          }
          
          doc.fontSize(7);
          doc.text(wl.courseCode, startX, doc.y, { width: 80 });
          doc.text(wl.taskType, startX + columnWidth, doc.y - doc.currentLineHeight());
          doc.text(new Date(wl.date).toLocaleDateString(), startX + columnWidth * 2, doc.y - doc.currentLineHeight());
          doc.text(`${wl.duration}`, startX + columnWidth * 3, doc.y - doc.currentLineHeight());
          doc.text(wl.isApproved ? 'Approved' : 'Pending', startX + columnWidth * 4, doc.y - doc.currentLineHeight());
          
          doc.moveDown();
        });
      } else {
        doc.fontSize(9).text('No workload entries');
      }
      
      doc.moveDown();
      
      // Add page break if not the last TA
      if (index < data.teachingAssistants.length - 1) {
        doc.addPage();
      }
    });
  }
}

module.exports = new ReportService();