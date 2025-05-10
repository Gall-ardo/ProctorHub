const Classroom = require("../../models/Classroom");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");

class ClassroomService {
  async createClassroom(classroomData) {
    // Create a composite ID using building and classroom ID
    const compositeId = `${classroomData.building}_${classroomData.classroomId}`;
    
    // Check if classroom already exists
    const existing = await Classroom.findByPk(compositeId);
    if (existing) {
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

  async updateClassroom(id, classroomData) {
    const classroom = await Classroom.findByPk(id);
    if (!classroom) return null;
    return await classroom.update({
      name: classroomData.classroomId || classroom.name,
      capacity: classroomData.capacity || classroom.capacity,
      examSeatingCapacity: classroomData.examCapacity || classroom.examSeatingCapacity
    });
  }

  async deleteClassroom(id) {
    const classroom = await Classroom.findByPk(id);
    if (!classroom) return null;
    await classroom.destroy();
    return true;
  }

async processClassroomFile(file) {
  // Multer stores upload on disk: file.path
  const filePath = file.path;
  const results = [];
  const errors = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", async (row) => {
        const building = row.Building || row.building;
        const classroomId = row.ClassroomId || row.classroomId;
        const cap = row.Capacity || row.capacity;
        const examCap = row.ExamCapacity || row.examCapacity;

        if (!building || !classroomId || !cap || !examCap) {
          errors.push(`Missing fields in row: ${JSON.stringify(row)}`);
          return;
        }

        try {
          const classroomData = {
            building: building.trim(),
            classroomId: classroomId.trim(),
            capacity: parseInt(cap, 10),
            examCapacity: parseInt(examCap, 10)
          };
          const classroom = await this.createClassroom(classroomData);
          results.push(classroom);
        } catch (err) {
          errors.push(`Error processing row ${JSON.stringify(row)}: ${err.message}`);
        }
      })
      .on("end", async () => {
        try { fs.unlinkSync(filePath); } catch {}
        resolve({
          successful: results.length,
          failed: errors.length,
          total: results.length + errors.length,
          errors
        });
      })
      .on("error", (err) => {
        try { fs.unlinkSync(filePath); } catch {}
        reject(err);
      });
  });
}


  async findClassrooms(query) {
    const where = {};
    if (query.building) where.building = { [Op.like]: `%${query.building}%` };
    if (query.id) where.id = { [Op.like]: `%${query.id}%` };
    if (query.name) where.name = { [Op.like]: `%${query.name}%` };
    if (query.capacity) where.capacity = { [Op.gte]: parseInt(query.capacity, 10) };
    if (query.examCapacity) where.examSeatingCapacity = { [Op.gte]: parseInt(query.examCapacity, 10) };

    return await Classroom.findAll({ where });
  }
}

module.exports = new ClassroomService();
