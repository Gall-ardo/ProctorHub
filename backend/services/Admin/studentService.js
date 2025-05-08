// services/Admin/studentService.js
const Student = require('../../models/Student');
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

      // Prepare courses array if it exists
      if (studentData.courses && !Array.isArray(studentData.courses)) {
        if (typeof studentData.courses === 'string') {
          studentData.courses = studentData.courses.split(',').map(course => course.trim());
        } else {
          studentData.courses = [];
        }
      }

      // Create the student
      const student = await Student.create({
        studentId: studentData.studentId,
        nameSurname: studentData.nameSurname,
        email: studentData.email,
        department: studentData.department,
        courses: studentData.courses || []
      }, { transaction: t });
      
      await t.commit();
      return student;
    } catch (error) {
      console.error("Transaction error in createStudent:", error);
      await t.rollback();
      throw error;
    }
  }

  async findStudentById(id) {
    try {
      return await Student.findByPk(id);
    } catch (error) {
      console.error(`Error finding student by ID ${id}:`, error);
      throw error;
    }
  }

  async findStudentByStudentId(studentId) {
    try {
      return await Student.findOne({ where: { studentId } });
    } catch (error) {
      console.error(`Error finding student by studentId ${studentId}:`, error);
      throw error;
    }
  }

  async findStudentByEmail(email) {
    try {
      return await Student.findOne({ where: { email } });
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
      const student = await Student.findByPk(id, { transaction: t });
      
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
      
      // Prepare courses array if it exists
      if (studentData.courses) {
        if (!Array.isArray(studentData.courses)) {
          if (typeof studentData.courses === 'string') {
            studentData.courses = studentData.courses.split(',').map(course => course.trim());
          }
        }
      }
      
      // Update the student
      await student.update(studentData, { transaction: t });
      
      await t.commit();
      return student;
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
      
      // Delete the student
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