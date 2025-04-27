// controllers/Admin/offeringController.js
const offeringService = require("../../services/Admin/offeringService");

exports.createOffering = async (req, res) => {
  try {
    const { instructor, courseCode, sectionId, semester } = req.body;
    
    // Validate required fields
    if (!instructor || !courseCode || !sectionId || !semester) {
      return res.status(400).json({ 
        message: "Missing required fields",
        required: ["instructor", "courseCode", "sectionId", "semester"],
        received: req.body
      });
    }
    
    const offering = await offeringService.createOffering(req.body);
    res.status(201).json(offering);
  } catch (err) {
    console.error("Offering creation error:", err);
    res.status(500).json({ 
      message: "Error creating offering", 
      error: err.message 
    });
  }
};