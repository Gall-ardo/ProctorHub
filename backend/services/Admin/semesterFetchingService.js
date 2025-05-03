// services/Admin/semesterFetchingService.js
const Semester = require("../../models/Semester");

class SemesterFetchingService {
  /**
   * Get all semesters
   * @returns {Promise<Array>} List of semesters
   */
  async getAllSemesters() {
    try {
      // Remove the isActive field from the ordering since it doesn't exist
      return await Semester.findAll({
        order: [
          ['createdAt', 'DESC'] // Sort by creation date (newest first)
        ]
      });
    } catch (error) {
      console.error("Error finding semesters:", error);
      throw error;
    }
  }

  /**
   * Get active semester - using a different approach
   * This will need to be adjusted based on how you determine the "active" semester
   * For now, we'll assume the most recently created semester is the active one
   * @returns {Promise<Object>} The active semester
   */
  async getActiveSemester() {
    try {
      // Find the most recent semester instead of using isActive field
      return await Semester.findOne({
        order: [['createdAt', 'DESC']]
      });
    } catch (error) {
      console.error("Error finding active semester:", error);
      throw error;
    }
  }
}

module.exports = new SemesterFetchingService();