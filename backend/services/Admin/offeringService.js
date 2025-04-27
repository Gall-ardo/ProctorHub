// services/Admin/offeringService.js
const Offering = require("../../models/Offering");
const { v4: uuidv4 } = require('uuid'); // Add this line - you'll need to install uuid

exports.createOffering = async (offeringData) => {
  // Make sure all expected fields are present
  const offering = await Offering.create({
    id: uuidv4(), // Generate UUID explicitly
    instructor: offeringData.instructor,
    courseCode: offeringData.courseCode,
    sectionId: offeringData.sectionId,
    semester: offeringData.semester,
    studentCount: offeringData.studentCount || 0
  });
  return offering;
};