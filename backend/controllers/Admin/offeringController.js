// controllers/Admin/offeringController.js
const offeringService = require('../../services/Admin/offeringService');
const timeslotService = require('../../services/Admin/timeslotService');
const courseService = require('../../services/Admin/courseService');
const fs = require('fs');
const csv = require('csv-parser');
const multer = require('multer');
const path = require('path');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (path.extname(file.originalname).toLowerCase() !== '.csv') {
      return cb(new Error('Only CSV files are allowed'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Make sure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const offeringController = {
  /**
   * Create a new offering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createOffering: async (req, res) => {
    try {
      const { courseId, sectionNumber, semesterId } = req.body;
      
      // Validate required fields
      if (!courseId || sectionNumber === undefined || !semesterId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: courseId, sectionNumber, and semesterId are required'
        });
      }
      
      // Create offering
      const offering = await offeringService.createOffering({
        courseId,
        sectionNumber,
        semesterId
      });
      
      res.status(201).json({
        success: true,
        message: 'Offering created successfully',
        data: offering
      });
    } catch (error) {
      console.error('Error creating offering:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create offering'
      });
    }
  },
  
  /**
   * Get all offerings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllOfferings: async (req, res) => {
    try {
      const { semesterId, courseId } = req.query;
      const offerings = await offeringService.getAllOfferings({ semesterId, courseId });
      
      res.status(200).json({
        success: true,
        data: offerings
      });
    } catch (error) {
      console.error('Error fetching offerings:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch offerings'
      });
    }
  },
  
  /**
   * Get offering by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getOfferingById: async (req, res) => {
    try {
      const { id } = req.params;
      const offering = await offeringService.getOfferingById(id);
      
      if (!offering) {
        return res.status(404).json({
          success: false,
          message: 'Offering not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: offering
      });
    } catch (error) {
      console.error('Error fetching offering:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch offering'
      });
    }
  },
  
  /**
   * Find offerings by course ID and section number
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  findOfferings: async (req, res) => {
    try {
      const { courseId, sectionNumber } = req.query;
      
      if (!courseId || sectionNumber === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Course ID and section number are required'
        });
      }
      
      const offerings = await offeringService.getOfferingByCourseAndSection(courseId, parseInt(sectionNumber));
      
      res.status(200).json({
        success: true,
        data: offerings
      });
    } catch (error) {
      console.error('Error finding offerings:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to find offerings'
      });
    }
  },
  
  /**
   * Update an offering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateOffering: async (req, res) => {
    try {
      const { id } = req.params;
      const { courseId, sectionNumber, semesterId } = req.body;
      
      // Update offering
      const offering = await offeringService.updateOffering(id, {
        courseId,
        sectionNumber,
        semesterId
      });
      
      if (!offering) {
        return res.status(404).json({
          success: false,
          message: 'Offering not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Offering updated successfully',
        data: offering
      });
    } catch (error) {
      console.error('Error updating offering:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update offering'
      });
    }
  },
  
  /**
   * Delete an offering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteOffering: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await offeringService.deleteOffering(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Offering not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Offering deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting offering:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete offering'
      });
    }
  },
  
  /**
   * Delete offerings by course ID and section number
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteOfferingsByCourseAndSection: async (req, res) => {
    try {
      const { courseId, sectionNumber } = req.body;
      
      if (!courseId || sectionNumber === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Course ID and section number are required'
        });
      }
      
      const deletedCount = await offeringService.deleteOfferingByCourseAndSection(courseId, parseInt(sectionNumber));
      
      if (deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'No offerings found matching the criteria'
        });
      }
      
      res.status(200).json({
        success: true,
        message: `${deletedCount} offerings deleted successfully`
      });
    } catch (error) {
      console.error('Error deleting offerings:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete offerings'
      });
    }
  },
  
  /**
   * Get courses by semester ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getCoursesBySemester: async (req, res) => {
    try {
      const { semesterId } = req.query;
      
      if (!semesterId) {
        return res.status(400).json({
          success: false,
          message: 'Semester ID is required'
        });
      }
      
      const courses = await courseService.getCoursesBySemester(semesterId);
      
      res.status(200).json({
        success: true,
        data: courses
      });
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch courses'
      });
    }
  },

  /**
   * Upload offerings from CSV file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  uploadOfferingsFromCSV: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      console.log(`Processing uploaded offerings file: ${req.file.originalname}`);
      
      const results = [];
      const filePath = req.file.path;

      // Map to store timeslots for each offering
      const offeringTimeslots = new Map();

      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => {
          // Transform data to match expected format
          const transformedData = {};
          const timeslotData = {};
          let hasTimeslot = false;
          
          // Map CSV columns to offering fields (case-insensitive)
          Object.keys(data).forEach(key => {
            const lowerKey = key.toLowerCase().trim();
            
            if (lowerKey === 'courseid' || lowerKey === 'course_id') {
              transformedData.courseId = data[key].trim();
            } else if (lowerKey === 'sectionnumber' || lowerKey === 'section_number' || lowerKey === 'sectionid' || lowerKey === 'section_id' || lowerKey === 'section') {
              transformedData.sectionNumber = parseInt(data[key].trim(), 10);
            } else if (lowerKey === 'semesterid' || lowerKey === 'semester_id') {
              transformedData.semesterId = data[key].trim();
            } else if (lowerKey === 'day') {
              timeslotData.day = data[key].trim();
              hasTimeslot = true;
            } else if (lowerKey === 'starttime' || lowerKey === 'start_time') {
              timeslotData.startTime = data[key].trim();
              hasTimeslot = true;
            } else if (lowerKey === 'endtime' || lowerKey === 'end_time') {
              timeslotData.endTime = data[key].trim();
              hasTimeslot = true;
            }
          });
          
          // Only add if we have the minimum required fields
          if (transformedData.courseId && transformedData.sectionNumber !== undefined && transformedData.semesterId) {
            // Create a unique key for this offering
            const offeringKey = `${transformedData.courseId}-${transformedData.sectionNumber}-${transformedData.semesterId}`;
            
            // Check if we've seen this offering before
            if (!offeringTimeslots.has(offeringKey)) {
              // First time seeing this offering, add it to results
              offeringTimeslots.set(offeringKey, []);
              results.push(transformedData);
            }
            
            // If we have timeslot data, add it to the corresponding offering
            if (hasTimeslot && timeslotData.day && timeslotData.startTime && timeslotData.endTime) {
              offeringTimeslots.get(offeringKey).push(timeslotData);
            }
          }
        })
        .on("end", async () => {
          // Remove the temporary file
          fs.unlinkSync(filePath);
          
          console.log(`Parsed ${results.length} offerings from CSV`);

          // Process and create offerings
          const createdOfferings = [];
          const errors = [];
          
          for (const offeringData of results) {
            try {
              // Create the offering
              const offering = await offeringService.createOffering(offeringData);
              
              // Create timeslots if any
              const offeringKey = `${offeringData.courseId}-${offeringData.sectionNumber}-${offeringData.semesterId}`;
              const timeslots = offeringTimeslots.get(offeringKey) || [];
              
              if (timeslots.length > 0) {
                try {
                  await timeslotService.createTimeslotsForOffering(offering.id, timeslots);
                  offering.timeslotsCreated = timeslots.length;
                } catch (timeslotError) {
                  console.error(`Error creating timeslots for offering ${offering.id}:`, timeslotError);
                  offering.timeslotError = timeslotError.message;
                }
              }
              
              createdOfferings.push(offering);
            } catch (error) {
              console.error(`Failed to create offering for course ${offeringData.courseId}, section ${offeringData.sectionNumber}:`, error);
              errors.push({
                data: offeringData,
                error: error.message
              });
            }
          }
          
          res.status(201).json({ 
            success: true,
            message: `${createdOfferings.length} offerings created successfully, ${errors.length} failed`,
            offeringsCreated: createdOfferings.length,
            offeringsFailed: errors.length,
            totalRecords: results.length,
            errors: errors.length > 0 ? errors : undefined
          });
        })
        .on("error", (error) => {
          console.error("Error parsing CSV:", error);
          res.status(400).json({
            success: false,
            message: "Failed to parse CSV file",
            error: error.message
          });
        });
    } catch (error) {
      console.error("Error uploading offerings:", error);
      res.status(400).json({ 
        success: false,
        message: "Failed to upload offerings", 
        error: error.message 
      });
    }
  }
};

// Export controller along with upload middleware
module.exports = {
  offeringController,
  uploadMiddleware: upload
};