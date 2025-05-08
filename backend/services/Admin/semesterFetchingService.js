// services/Admin/semesterFetchingService.js
const Semester = require("../../models/Semester");

class SemesterFetchingService {
  /**
   * Get all semesters
   * @returns {Promise<Array>} List of semesters
   */
  async getAllSemesters() {
    try {
      const semesters = await Semester.findAll({
        order: [
          ['createdAt', 'DESC'] // Sort by creation date (newest first)
        ]
      });
      
      // Add a virtual 'name' property to each semester
      return semesters.map(semester => {
        const semesterData = semester.toJSON();
        
        // Create a formatted name combining year and semester type
        semesterData.name = `${semesterData.year} ${semesterData.semesterType}`;
        
        return semesterData;
      });
    } catch (error) {
      console.error("Error finding semesters:", error);
      throw error;
    }
  }

  /**
   * Get active semester
   * @returns {Promise<Object>} The active semester
   */
  async getActiveSemester() {
    try {
      // Find the most recent semester
      const semester = await Semester.findOne({
        order: [['createdAt', 'DESC']]
      });
      
      if (semester) {
        const semesterData = semester.toJSON();
        // Add a virtual name property
        semesterData.name = `${semesterData.year} ${semesterData.semesterType}`;
        return semesterData;
      }
      
      return null;
    } catch (error) {
      console.error("Error finding active semester:", error);
      throw error;
    }
  }
}

module.exports = new SemesterFetchingService();