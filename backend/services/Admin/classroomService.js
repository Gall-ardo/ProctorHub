const Classroom = require("../../models/Classroom");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");

class ClassroomService {
  async createClassroom(classroomData) {
    const compositeId = `${classroomData.building}_${classroomData.classroomId}`;
    const existing = await Classroom.findByPk(compositeId);
    if (existing) {
      throw new Error('Classroom already exists with this building and ID combination');
    }

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
    console.log(`Attempting to delete classroom with ID: ${id}`);
    const classroom = await Classroom.findByPk(id);
    if (!classroom) {
      console.log(`Classroom not found: ${id}`);
      return false;
    }
    await classroom.destroy();
    console.log(`Deleted classroom: ${id}`);
    return true;
  }

// classroomService.js - A more robust (but potentially slower if many rows) approach for processClassroomFile
async processClassroomFile(file) {
  const filePath = file.path;
  const rows = []; // Read all rows first

  // Step 1: Read all data from CSV into an array
  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => rows.push(data))
      .on("end", resolve)
      .on("error", reject);
  });

  // Step 2: Process each row
  const results = [];
  const errors = [];
  let successfulCount = 0;
  let failedCount = 0;

  console.log(`ADD CSV: Read ${rows.length} rows from file.`);

  for (const row of rows) {
    const building = row.Building || row.building;
    const classroomId = row.ClassroomId || row.classroomId;
    const cap = row.Capacity || row.capacity;
    const examCap = row.ExamCapacity || row.examCapacity;

    if (!building || !classroomId || !cap || !examCap) {
      const errMsg = `Missing fields in row: ${JSON.stringify(row)}`;
      errors.push(errMsg);
      failedCount++;
      console.warn(`ADD CSV: ${errMsg}`);
      continue;
    }

    try {
      const classroomData = {
        building: building.trim(),
        classroomId: classroomId.trim(),
        capacity: parseInt(cap, 10),
        examCapacity: parseInt(examCap, 10),
      };
      const classroom = await this.createClassroom(classroomData);
      results.push(classroom); // 'results' array might not be strictly needed if only counts are returned
      successfulCount++;
      console.log(`ADD CSV: Added ${classroomData.classroomId}, successful: ${successfulCount}`);
    } catch (err) {
      const errMsg = `Error processing row ${JSON.stringify(row)}: ${err.message}`;
      errors.push(errMsg);
      failedCount++;
      console.error(`ADD CSV: ${errMsg}`);
    }
  }

  try { fs.unlinkSync(filePath); } catch (e) { console.error("Error unlinking file:", e); }

  console.log(`ADD CSV Processed: successful: ${successfulCount}, failed: ${failedCount}, total: ${rows.length}`);
  return { // This is what the controller gets
    successful: successfulCount,
    failed: failedCount,
    total: rows.length, // Or successfulCount + failedCount if you want to be precise about processed vs. total read
    errors,
  };
}

async processDeleteClassroomFile(file) {
  const filePath = file.path;
  const errors = [];
  const rows = [];

  // Step 1: Read all rows synchronously
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        rows.push(row);
      })
      .on("end", async () => {
        let successful = 0;
        const total = rows.length;

        console.log(`📄 CSV contains ${total} rows`);

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const building = (row.Building || row.building || '').trim();
          const classroomId = (row.ClassroomId || row.classroomId || '').trim();

          console.log(`➡️ Processing row ${i + 1}: building="${building}", classroomId="${classroomId}"`);

          if (!building || !classroomId) {
            const err = `❌ Row ${i + 1}: Missing building or classroomId`;
            console.warn(err);
            errors.push(err);
            continue;
          }

          const compositeId = `${building}_${classroomId}`;
          console.log(`🧩 Built composite ID: ${compositeId}`);

          try {
            const deleted = await this.deleteClassroom(compositeId);
            if (deleted) {
              console.log(`✅ Deleted: ${compositeId}`);
              successful++;
            } else {
              const msg = `⚠️ Row ${i + 1}: Classroom not found (${compositeId})`;
              console.warn(msg);
              errors.push(msg);
            }
          } catch (err) {
            const msg = `❌ Row ${i + 1}: Error deleting ${compositeId}: ${err.message}`;
            console.error(msg);
            errors.push(msg);
          }
        }

        try { fs.unlinkSync(filePath); } catch {}
        console.log(`🧾 Done: total=${total}, successful=${successful}, failed=${total - successful}`);
        resolve({
          total,
          successful,
          failed: total - successful,
          errors
        });
      })
      .on("error", (err) => {
        try { fs.unlinkSync(filePath); } catch {}
        console.error("Stream error:", err);
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
