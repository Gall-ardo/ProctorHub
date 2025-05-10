const PDFDocument = require('pdfkit');
const { Readable } = require('stream');
const { Exam, Course, Student, Classroom } = require('../../models');
const { Op } = require('sequelize');

/**
 * Generate a PDF for exam seating arrangement
 * @param {Object} exam - The exam object
 * @param {Array} students - List of students
 * @param {Array} classrooms - List of classrooms
 * @param {Object} options - Options for generating PDF (shuffle)
 * @returns {Readable} - A readable stream containing the PDF
 */
const generateStudentPDF = (exam, students, classrooms, { shuffle = false }) => {
  const doc = new PDFDocument({ autoFirstPage: false });
  
  // Sort or shuffle students
  const studentList = shuffle 
    ? [...students].sort(() => Math.random() - 0.5) 
    : [...students].sort((a, b) => a.nameSurname.localeCompare(b.nameSurname));
  
  const totalCapacity = classrooms.reduce((sum, c) => sum + (c.examSeatingCapacity || c.capacity || 0), 0);
  const overCapacity = studentList.length > totalCapacity;
  
  let studentIndex = 0;
  
  for (const classroom of classrooms) {
    const roomCapacity = classroom.examSeatingCapacity || classroom.capacity;
    const assignedStudents = studentList.slice(studentIndex, studentIndex + roomCapacity);
    studentIndex += assignedStudents.length;
    
    doc.addPage();
    doc.fontSize(14).text(`Exam: ${exam.courseName} - ${exam.examType}`);
    doc.text(`Date: ${new Date(exam.date).toLocaleDateString()}`);
    doc.text(`Classroom: ${classroom.building} - ${classroom.name}`);
    doc.text(`Capacity: ${roomCapacity}`);
    doc.moveDown();
    
    if (overCapacity) {
      doc.fontSize(12).fillColor('red').text('⚠ Total student count exceeds available seating!');
      doc.fillColor('black');
      doc.moveDown();
    }
    
    doc.fontSize(12).text('Index | Student ID | Student Name');
    doc.moveDown();
    
    for (let i = 0; i < assignedStudents.length; i++) {
      const s = assignedStudents[i];
      doc.text(`${i} | ${s.id} | ${s.nameSurname}`);
    }
    
    // Leave remaining slots blank if overCapacity is true
    /*if (!overCapacity) {
      for (let i = assignedStudents.length; i < roomCapacity; i++) {
        doc.text(`${i} | _________ | ___________________`);
      }
    }*/
  }
  
  // Finalize PDF and return as stream
  doc.end();
  return doc;
};

/**
 * Get all data needed for generating the PDF
 * @param {String} examId - The ID of the exam
 * @param {Boolean} shuffle - Whether to shuffle students or sort alphabetically
 * @returns {Promise<Object>} - PDF stream and filename
 */
const generateExamSeatingPDF = async (examId, shuffle = false) => {
  try {
    console.log(`Generating PDF for exam ID: ${examId}, shuffle: ${shuffle}`);
    
    // First, get the exam with basic info
    const exam = await Exam.findByPk(examId);
    
    if (!exam) {
      throw new Error('Exam not found');
    }
    
    console.log(`Found exam: ${exam.id} - ${exam.courseName}`);
    
    // Get the associated course
    const course = await Course.findByPk(exam.courseName);
    
    if (!course) {
      throw new Error('Course not found for this exam');
    }
    
    console.log(`Found course: ${course.id} - ${course.courseName}`);
    
    // Get students enrolled in the course
    const students = await Student.findAll({
      include: [
        {
          model: Course,
          as: 'enrolledCourses',
          where: { id: course.id },
          attributes: []
        }
      ]
    });
    
    console.log(`Found ${students.length} students enrolled in the course`);
    
    // Get classrooms assigned for the exam
    const classrooms = await Classroom.findAll({
      include: [
        {
          model: Exam,
          as: 'exams',
          where: { id: examId },
          attributes: []
        }
      ]
    });
    
    console.log(`Found ${classrooms.length} classrooms assigned to the exam`);

    if (students.length === 0) {
      throw new Error('No students found for this exam');
    }

    if (classrooms.length === 0) {
      throw new Error('No classrooms assigned for this exam');
    }

    // Generate the PDF
    const pdfStream = generateStudentPDF(exam, students, classrooms, { shuffle });
    
    // Generate a filename based on exam details
    const date = new Date(exam.date).toISOString().split('T')[0];
    const arrangementType = shuffle ? 'random' : 'alphabetical';
    const filename = `${exam.courseName}_${exam.examType}_${date}_${arrangementType}.pdf`;

    return {
      stream: pdfStream,
      filename
    };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

module.exports = {
  generateExamSeatingPDF
};