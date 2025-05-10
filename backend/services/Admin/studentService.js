// services/Admin/studentService.js
const Student = require('../../models/Student');
const Course = require('../../models/Course');
const { Op } = require('sequelize');
const sequelize = require('../../config/db');

class StudentService {
  async createStudent(studentData) {
  const t = await sequelize.transaction();
  
  try {
    // Check if student with the same ID or email already exists
    const existingStudent = await Student.findOne({
      where: {
        [Op.or]: [
          { studentId: studentData.studentId },
          { email: studentData.email }
        ]
      },
      transaction: t
    });

    if (existingStudent) {
      throw new Error(`Student with ID: ${studentData.studentId} or email: ${studentData.email} already exists`);
    }

    // Validate required fields
    if (!studentData.studentId || !studentData.nameSurname || !studentData.email || !studentData.department) {
      throw new Error("Missing required fields: studentId, nameSurname, email, and department are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentData.email)) {
      throw new Error("Invalid email format");
    }

    // Create the student without courses initially
    const student = await Student.create({
      studentId: studentData.studentId,
      nameSurname: studentData.nameSurname,
      email: studentData.email,
      department: studentData.department
    }, { transaction: t });
    
    console.log(`Student created with ID: ${student.id}`);
    
    // Add courses if they exist
    if (studentData.courses && Array.isArray(studentData.courses) && studentData.courses.length > 0) {
      // Parse course codes to extract department and number
      const courseMatches = studentData.courses.map(course => {
        const match = course.match(/^([A-Z]+)\s*(\d+)$/);
        return match ? { dept: match[1], code: match[2] } : null;
      }).filter(Boolean);

      console.log(`Parsed course codes:`, courseMatches);
      
      if (courseMatches.length > 0) {
        // Use Sequelize's complex OR query to find courses
        const courseWhere = {
          [Op.or]: courseMatches.map(match => {
            return sequelize.literal(`CONCAT(department, courseCode) = '${match.dept}${match.code}'`);
          })
        };
        
        console.log('Looking for courses with query:', JSON.stringify(courseWhere, null, 2));
        
        const courses = await Course.findAll({
          where: courseWhere,
          transaction: t
        });
        
        console.log(`Found ${courses.length} courses:`, courses.map(c => `${c.department}${c.courseCode}`).join(', '));
        
        // Associate student with courses
        if (courses.length > 0) {
          await student.addEnrolledCourses(courses, { transaction: t });
          console.log(`Associated student with ${courses.length} courses`);
        } else {
          console.log('No matching courses found to associate with student');
        }
      }
    }
    
    await t.commit();
    console.log('Transaction committed successfully');
    
    // Refresh student with courses
    const refreshedStudent = await Student.findByPk(student.id, {
      include: [{
        model: Course,
        as: 'enrolledCourses',
        through: { attributes: [] }
      }]
    });
    
    console.log(`Student refreshed, has ${refreshedStudent.enrolledCourses ? refreshedStudent.enrolledCourses.length : 0} courses`);
    return refreshedStudent;
  } catch (error) {
    console.error("Transaction error in createStudent:", error);
    await t.rollback();
    throw error;
  }
}

  async findStudentById(id) {
    try {
      return await Student.findByPk(id, {
        include: [{
          model: Course,
          as: 'enrolledCourses',
          through: { attributes: [] } // Exclude junction table attributes
        }]
      });
    } catch (error) {
      console.error(`Error finding student by ID ${id}:`, error);
      throw error;
    }
  }

  async findStudentByStudentId(studentId) {
    try {
      return await Student.findOne({ 
        where: { studentId },
        include: [{
          model: Course,
          as: 'enrolledCourses',
          through: { attributes: [] }
        }]
      });
    } catch (error) {
      console.error(`Error finding student by studentId ${studentId}:`, error);
      throw error;
    }
  }

  async findStudentByEmail(email) {
    try {
      return await Student.findOne({ 
        where: { email },
        include: [{
          model: Course,
          as: 'enrolledCourses',
          through: { attributes: [] }
        }]
      });
    } catch (error) {
      console.error(`Error finding student by email ${email}:`, error);
      throw error;
    }
  }

  async findStudents(query) {
    try {
      const whereClause = {};
      
      if (query.id) {
        whereClause.id = query.id;
      }
      
      if (query.studentId) {
        whereClause.studentId = query.studentId;
      }
      
      if (query.email) {
        whereClause.email = { [Op.iLike]: `%${query.email}%` };
      }
      
      if (query.department) {
        whereClause.department = query.department;
      }
      
      if (query.nameSurname) {
        whereClause.nameSurname = { [Op.iLike]: `%${query.nameSurname}%` };
      }

      return await Student.findAll({ 
        where: whereClause,
        include: [{
          model: Course,
          as: 'enrolledCourses',
          through: { attributes: [] }
        }],
        order: [['nameSurname', 'ASC']] 
      });
    } catch (error) {
      console.error("Error in findStudents:", error);
      throw error;
    }
  }

  async updateStudent(id, studentData) {
    const t = await sequelize.transaction();
    
    try {
      // Find the student
      const student = await Student.findByPk(id, { 
        include: [{
          model: Course,
          as: 'enrolledCourses',
          through: { attributes: [] }
        }],
        transaction: t 
      });
      
      if (!student) {
        throw new Error("Student not found");
      }
      
      // Check if email is being updated and if it's already in use by another student
      if (studentData.email && studentData.email !== student.email) {
        const existingStudent = await Student.findOne({
          where: {
            email: studentData.email,
            id: { [Op.ne]: id } // Exclude current student
          },
          transaction: t
        });
        
        if (existingStudent) {
          throw new Error(`Email ${studentData.email} is already in use by another student`);
        }
      }
      
      // Check if studentId is being updated and if it's already in use by another student
      if (studentData.studentId && studentData.studentId !== student.studentId) {
        const existingStudent = await Student.findOne({
          where: {
            studentId: studentData.studentId,
            id: { [Op.ne]: id } // Exclude current student
          },
          transaction: t
        });
        
        if (existingStudent) {
          throw new Error(`Student ID ${studentData.studentId} is already in use by another student`);
        }
      }
      
      // Update basic student data (excluding courses)
      const { courses, ...studentBasicData } = studentData;
      await student.update(studentBasicData, { transaction: t });
      
      // Update courses if they are provided
      if (courses !== undefined) {
        let courseCodes = [];
        
        // Convert courses to array if it's a string
        if (!Array.isArray(courses)) {
          if (typeof courses === 'string') {
            courseCodes = courses.split(',').map(code => code.trim());
          }
        } else {
          courseCodes = courses;
        }
        
        // Find courses by their courseCode
        const coursesToAssociate = await Course.findAll({
          where: {
            courseCode: { [Op.in]: courseCodes }
          },
          transaction: t
        });
        
        // Remove existing associations and add new ones
        await student.setEnrolledCourses(coursesToAssociate, { transaction: t });
      }
      
      await t.commit();
      
      // Refresh the student with updated courses
      return await Student.findByPk(id, {
        include: [{
          model: Course,
          as: 'enrolledCourses',
          through: { attributes: [] }
        }]
      });
    } catch (error) {
      console.error(`Transaction error in updateStudent for ID ${id}:`, error);
      await t.rollback();
      throw error;
    }
  }

  async deleteStudent(id) {
    const t = await sequelize.transaction();
    
    try {
      const student = await Student.findByPk(id, { transaction: t });
      
      if (!student) {
        throw new Error("Student not found");
      }
      
      // Delete the student (associations will be automatically removed from junction table)
      await Student.destroy({ where: { id }, transaction: t });
      
      await t.commit();
      return true;
    } catch (error) {
      console.error(`Transaction error in deleteStudent for ID ${id}:`, error);
      await t.rollback();
      throw error;
    }
  }

  async bulkCreateStudents(studentsData) {
    const createdStudents = [];
    const errors = [];
    
    for (const studentData of studentsData) {
      try {
        // Skip empty rows
        if (!studentData.studentId && !studentData.email && !studentData.nameSurname) {
          continue;
        }
        
        // Create student
        const student = await this.createStudent(studentData);
        createdStudents.push(student);
      } catch (error) {
        errors.push({
          data: studentData,
          error: error.message
        });
        console.error(`Failed to create student ${studentData.email || 'unknown email'}: ${error.message}`);
      }
    }

    return {
      createdStudents,
      errors,
      success: createdStudents.length,
      failed: errors.length
    };
  }
}

module.exports = new StudentService();