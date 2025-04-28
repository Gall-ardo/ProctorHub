// controllers/Admin/offeringController.js
const offeringService = require('../../services/Admin/offeringService');
const instructorService = require('../../services/Admin/instructorService');
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
      const { department, instructors, courseCode, sectionId, semester } = req.body;
      
      // Validate required fields
      if (!department || !courseCode || !sectionId || !semester) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }
      
      // Create offering
      const offering = await offeringService.createOffering({
        department,
        instructors,
        courseCode,
        sectionId,
        semester
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
      const { department, semester } = req.query;
      const offerings = await offeringService.getAllOfferings({ department, semester });
      
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
   * Find offerings by course code and section ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  findOfferings: async (req, res) => {
    try {
      const { courseCode, sectionId } = req.query;
      
      if (!courseCode || !sectionId) {
        return res.status(400).json({
          success: false,
          message: 'Course code and section ID are required'
        });
      }
      
      const offerings = await offeringService.getOfferingByCourseAndSection(courseCode, sectionId);
      
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
      const { department, instructors, courseCode, sectionId, semester } = req.body;
      
      // Update offering
      const offering = await offeringService.updateOffering(id, {
        department,
        instructors,
        courseCode,
        sectionId,
        semester
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
   * Delete offerings by course code and section ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteOfferingsByCourseAndSection: async (req, res) => {
    try {
      const { courseCode, sectionId } = req.body;
      
      if (!courseCode || !sectionId) {
        return res.status(400).json({
          success: false,
          message: 'Course code and section ID are required'
        });
      }
      
      const deletedCount = await offeringService.deleteOfferingByCourseAndSection(courseCode, sectionId);
      
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
   * Get instructors by department for offering selection
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getInstructorsByDepartment: async (req, res) => {
    try {
      const { department } = req.query;
      
      if (!department) {
        return res.status(400).json({
          success: false,
          message: 'Department is required'
        });
      }
      
      const instructors = await instructorService.getInstructorsByDepartment(department);
      
      res.status(200).json({
        success: true,
        data: instructors
      });
    } catch (error) {
      console.error('Error fetching instructors:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch instructors'
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

      // A cache to store instructor ids by name for faster lookup
      const instructorCache = {};

      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => {
          // Transform data to match expected format
          const transformedData = {};
          
          // Map CSV columns to offering fields (case-insensitive)
          Object.keys(data).forEach(key => {
            const lowerKey = key.toLowerCase().trim();
            
            if (lowerKey === 'department' || lowerKey === 'dept') {
              transformedData.department = data[key].trim();
            } else if (lowerKey === 'instructorids' || lowerKey === 'instructors' || lowerKey === 'instructor_ids') {
              // Handle instructors - could be comma-separated IDs
              const instructorIds = data[key].split(',').map(id => id.trim()).filter(id => id);
              transformedData.instructorIds = instructorIds;
            } else if (lowerKey === 'coursecode' || lowerKey === 'course_code' || lowerKey === 'course') {
              transformedData.courseCode = data[key].trim();
            } else if (lowerKey === 'sectionid' || lowerKey === 'section_id' || lowerKey === 'section') {
              transformedData.sectionId = data[key].trim();
            } else if (lowerKey === 'semester' || lowerKey === 'term') {
              transformedData.semester = data[key].trim();
            }
          });
          
          // Only add if we have the minimum required fields
          if (transformedData.courseCode && transformedData.sectionId && transformedData.semester) {
            results.push(transformedData);
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
              // If we have instructor IDs, we need to fetch their details
              if (offeringData.instructorIds && offeringData.instructorIds.length > 0) {
                const instructors = [];
                
                for (const instructorId of offeringData.instructorIds) {
                  // Check cache first
                  if (!instructorCache[instructorId]) {
                    try {
                      const instructor = await instructorService.getInstructorById(instructorId);
                      if (instructor) {
                        instructorCache[instructorId] = instructor;
                      }
                    } catch (e) {
                      console.warn(`Could not find instructor with ID ${instructorId}`);
                    }
                  }
                  
                  // If we found the instructor, add it to our list
                  if (instructorCache[instructorId]) {
                    instructors.push(instructorCache[instructorId]);
                  }
                }
                
                offeringData.instructors = instructors;
              }
              
              delete offeringData.instructorIds; // Remove the temp field
              
              // Create the offering
              const offering = await offeringService.createOffering(offeringData);
              createdOfferings.push(offering);
            } catch (error) {
              console.error(`Failed to create offering ${offeringData.courseCode}-${offeringData.sectionId}:`, error);
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