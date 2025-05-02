// services/Admin/classroomService.js
const Classroom = require("../../models/Classroom");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const sequelize = require("../../config/db");

class ClassroomService {
  async createClassroom(classroomData) {
    // Create a composite ID using building and classroom ID
    const compositeId = `${classroomData.building}_${classroomData.classroomId}`;
    
    // Check if classroom already exists
    const existingClassroom = await Classroom.findByPk(compositeId);
    if (existingClassroom) {
      throw new Error('Classroom already exists with this building and ID combination');
    }
    
    // Create the new classroom
    return await Classroom.create({
      id: compositeId,
      name: classroomData.classroomId,
      building: classroomData.building,
      capacity: classroomData.capacity,
      examSeatingCapacity: classroomData.examCapacity
    });
  }

  async getAllClassrooms() {
    return await Classroom.findAll();
  }

  async getClassroomById(id) {
    return await Classroom.findByPk(id);
  }

  async getClassroomByBuildingAndId(building, classroomId) {
    const compositeId = `${building}_${classroomId}`;
    return await Classroom.findByPk(compositeId);
  }

  async updateClassroom(id, classroomData) {
    const classroom = await Classroom.findByPk(id);
    if (!classroom) {
      return null;
    }
    
    return await classroom.update({
      name: classroomData.classroomId || classroom.name,
      capacity: classroomData.capacity || classroom.capacity,
      examSeatingCapacity: classroomData.examCapacity || classroom.examSeatingCapacity
    });
  }

  async deleteClassroom(id) {
    const classroom = await Classroom.findByPk(id);
    if (!classroom) {
      return null;
    }
    
    await classroom.destroy();
    return true;
  }

  async processClassroomFile(file) {
    // Create a temporary path to save the uploaded file
    const tempPath = path.join(__dirname, '../../uploads', `classrooms_${Date.now()}.csv`);
    
    // Save the file
    await file.mv(tempPath);
    
    const results = [];
    const errors = [];
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(tempPath)
        .pipe(csv())
        .on('data', async (row) => {
          try {
            // Check if we have all the required fields
            if (!row.building || !row.classroomId || !row.capacity || !row.examCapacity) {
              errors.push(`Missing fields in row: ${JSON.stringify(row)}`);
              return;
            }
            
            // Create classroom
            const classroomData = {
              building: row.building,
              classroomId: row.classroomId,
              capacity: parseInt(row.capacity),
              examCapacity: parseInt(row.examCapacity)
            };
            
            // Create the classroom
            const classroom = await this.createClassroom(classroomData);
            results.push(classroom);
          } catch (error) {
            errors.push(`Error processing row ${JSON.stringify(row)}: ${error.message}`);
          }
        })
        .on('end', () => {
          // Delete the temporary file
          fs.unlinkSync(tempPath);
          
          resolve({
            processed: results.length,
            successful: results.length,
            errors: errors
          });
        })
        .on('error', (error) => {
          // Delete the temporary file if it exists
          if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
          }
          
          reject(error);
        });
    });
  }

  async findClassrooms(query) {
    try {
      const whereClause = {};
      
      if (query.building) {
        whereClause.building = { [Op.like]: `%${query.building}%` };
      }
      
      if (query.id) {
        whereClause.id = { [Op.like]: `%${query.id}%` };
      }
      
      if (query.name) {
        whereClause.name = { [Op.like]: `%${query.name}%` };
      }
      
      if (query.capacity) {
        whereClause.capacity = { [Op.gte]: parseInt(query.capacity) };
      }
      
      if (query.examCapacity) {
        whereClause.examSeatingCapacity = { [Op.gte]: parseInt(query.examCapacity) };
      }

      return await Classroom.findAll({ where: whereClause });
    } catch (error) {
      console.error("Error in findClassrooms:", error);
      throw error;
    }
  }
}

module.exports = new ClassroomService();