// controllers/Admin/userController.js
const userService = require('../../services/Admin/userService');
const fs = require('fs');
const csv = require('csv-parser');

class UserController {
  async createUser(req, res) {
    try {
      // Log request data for debugging
      console.log('Create user request:', JSON.stringify(req.body, null, 2));
      
      // Validate user type - block student creation
      if (req.body.userType && req.body.userType.toLowerCase() === 'student') {
        return res.status(400).json({
          success: false,
          message: "Students should be managed through the student management interface",
          error: "Invalid user type for this interface"
        });
      }
      
      // Create user with password generation and email notification
      const user = await userService.createUser(req.body, true);
      
      console.log('User created successfully:', user.id);
      res.status(201).json({
        success: true,
        message: 'User created successfully. A welcome email with login credentials has been sent.',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.userType
        }
      });
    } catch (error) {
      console.error("Error creating user:", error);
      
      // Provide more descriptive error messages based on error type
      let statusCode = 400;
      let errorMessage = error.message;
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        errorMessage = 'A user with this ID or email already exists';
      } else if (error.name === 'SequelizeValidationError') {
        errorMessage = error.errors.map(e => e.message).join(', ');
      } else if (error.message.includes('Missing required')) {
        errorMessage = error.message;
      }
      
      res.status(statusCode).json({ 
        success: false,
        message: "Failed to create user", 
        error: errorMessage
      });
    }
  }

  async getUser(req, res) {
    try {
      const user = await userService.findUserById(req.params.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      
      // Block access to student users
      if (user.userType === 'student') {
        return res.status(403).json({
          success: false,
          message: "Students should be managed through the student management interface"
        });
      }
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to get user", 
        error: error.message 
      });
    }
  }

  async findUsers(req, res) {
    try {
      console.log('Find users request, query:', req.query);
      
      // Block search for student users
      if (req.query.userType && req.query.userType.toLowerCase() === 'student') {
        return res.status(400).json({
          success: false,
          message: "Students should be managed through the student management interface"
        });
      }
      
      const users = await userService.findUsers(req.query);
      
      res.status(200).json(users);
    } catch (error) {
      console.error("Error finding users:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to find users", 
        error: error.message 
      });
    }
  }

  async updateUser(req, res) {
    try {
      console.log(`Update user request for ID ${req.params.id}:`, JSON.stringify(req.body, null, 2));
      
      // Block updating user type to student
      if (req.body.userType && req.body.userType.toLowerCase() === 'student') {
        return res.status(400).json({
          success: false,
          message: "Students should be managed through the student management interface",
          error: "Invalid user type for this interface"
        });
      }
      
      // First check if the user is a student
      const user = await userService.findUserById(req.params.id);
      if (user && user.userType === 'student') {
        return res.status(403).json({
          success: false,
          message: "Students should be managed through the student management interface",
          error: "Cannot update student users through this interface"
        });
      }
      
      // Check if we should reset the password
      const resetPassword = req.query.resetPassword === 'true';
      
      const updatedUser = await userService.updateUser(req.params.id, req.body, resetPassword);
      
      let message = 'User updated successfully';
      if (resetPassword) {
        message += '. A new password has been generated and sent to the user\'s email.';
      }
      
      res.status(200).json({
        success: true,
        message: message,
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          userType: updatedUser.userType
        }
      });
    } catch (error) {
      console.error("Error updating user:", error);
      
      let statusCode = 400;
      if (error.message.includes('not found')) {
        statusCode = 404;
      }
      
      res.status(statusCode).json({ 
        success: false,
        message: "Failed to update user", 
        error: error.message 
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const userId = req.params.id;
      console.log(`Reset password request for user ID: ${userId}`);
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required"
        });
      }
      
      // First check if the user is a student
      const user = await userService.findUserById(userId);
      if (user && user.userType === 'student') {
        return res.status(403).json({
          success: false,
          message: "Students should be managed through the student management interface",
          error: "Cannot reset passwords for student users through this interface"
        });
      }
      
      // Call the service to reset the password
      const result = await userService.resetUserPassword(userId);
      
      res.status(200).json({
        success: true,
        message: "Password reset successfully. A new password has been sent to the user's email."
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      
      let statusCode = 400;
      if (error.message.includes('not found')) {
        statusCode = 404;
      }
      
      res.status(statusCode).json({ 
        success: false,
        message: "Failed to reset password", 
        error: error.message 
      });
    }
  }

  async deleteUser(req, res) {
    try {
      console.log(`Delete user request for ID ${req.params.id}`);
      
      // First check if the user is a student
      const user = await userService.findUserById(req.params.id);
      if (user && user.userType === 'student') {
        return res.status(403).json({
          success: false,
          message: "Students should be managed through the student management interface",
          error: "Cannot delete student users through this interface"
        });
      }
      
      await userService.deleteUser(req.params.id);
      
      res.status(200).json({
        success: true,
        message: "User deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      
      let statusCode = 400;
      let errorMessage = "Failed to delete user";
      
      if (error.message.includes('not found')) {
        statusCode = 404;
        errorMessage = "User not found";
      } else if (error.name === 'SequelizeForeignKeyConstraintError') {
        statusCode = 409; // Changed to 409 Conflict for better semantics
        errorMessage = "Cannot delete user because they are referenced in other tables. Please use force delete or remove those references first.";
      }
      
      res.status(statusCode).json({ 
        success: false,
        message: errorMessage, 
        error: error.message,
        constraint: error.original?.constraint, // Include constraint info for debugging
        code: error.original?.code
      });
    }
  }

  async forceDeleteUser(req, res) {
    try {
      console.log(`Force delete user request for ID ${req.params.id}`);
      
      // First check if the user is a student
      const user = await userService.findUserById(req.params.id);
      if (user && user.userType === 'student') {
        return res.status(403).json({
          success: false,
          message: "Students should be managed through the student management interface",
          error: "Cannot delete student users through this interface"
        });
      }
      
      // Check for confirmation parameter
      if (req.query.confirm !== 'true') {
        return res.status(400).json({
          success: false,
          message: "Confirmation required. Add ?confirm=true to force delete."
        });
      }
      
      await userService.deleteUser(req.params.id, true); // true flag for force delete
      
      res.status(200).json({
        success: true,
        message: "User and all dependencies forcefully deleted successfully"
      });
    } catch (error) {
      console.error("Error force deleting user:", error);
      
      let statusCode = 500;
      let errorMessage = "Failed to force delete user";
      
      if (error.message.includes('not found')) {
        statusCode = 404;
        errorMessage = "User not found";
      }
      
      res.status(statusCode).json({ 
        success: false,
        message: errorMessage, 
        error: error.message
      });
    }
  }

  async uploadUsers(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      console.log(`Processing uploaded file: ${req.file.originalname}`);
      
      const results = [];
      const filePath = req.file.path;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => {
          const transformedData = {};
          
          Object.keys(data).forEach(key => {
            const lowerKey = key.toLowerCase().trim();
            const value = data[key]?.trim();

            if (lowerKey === 'id' || lowerKey === 'userid') {
              transformedData.id = value;
            } else if (lowerKey === 'name' || lowerKey === 'fullname') {
              transformedData.name = value;
            } else if (lowerKey === 'email') {
              transformedData.email = value;
            } else if (lowerKey === 'usertype' || lowerKey === 'role' || lowerKey === 'type') {
              const userType = value.toLowerCase();
              if (userType === 'student') {
                console.log(`Skipping student record for ID: ${data.id || 'unknown'}`);
                return;
              }
              transformedData.userType = value;
            } else if (lowerKey === 'department' || lowerKey === 'dept') {
              transformedData.department = value;
            } else if (lowerKey === 'isphd') {
              transformedData.isPHD = value.toLowerCase() === 'true';
            } else if (lowerKey === 'isparttime') {
              transformedData.isPartTime = value.toLowerCase() === 'true';
            } else if (lowerKey === 'istaassigner') {
              transformedData.isTaAssigner = value.toLowerCase() === 'true';
            }
          });

          if (transformedData.userType && transformedData.id && transformedData.email && transformedData.name) {
            results.push(transformedData);
          } else {
            console.log("Skipping incomplete row:", data);
          }
        })
        .on("end", async () => {
          fs.unlinkSync(filePath);
          
          console.log(`Parsed ${results.length} users from CSV`);

          const uploadResult = await userService.bulkCreateUsers(results);
          
          res.status(201).json({ 
            success: true,
            message: `${uploadResult.success} users created successfully, ${uploadResult.failed} failed. Welcome emails with login credentials have been sent.`,
            usersCreated: uploadResult.success,
            usersFailed: uploadResult.failed,
            totalRecords: results.length,
            errors: uploadResult.errors.length > 0 ? uploadResult.errors : undefined
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
      console.error("Error uploading users:", error);
      res.status(400).json({ 
        success: false,
        message: "Failed to upload users", 
        error: error.message 
      });
    }
  }


  // controllers/Admin/userController.js
// ... (other requires and UserController methods) ...

  async deleteUsersFromCSV(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      console.log(`Processing CSV for user deletion: ${req.file.originalname}`);
      
      const idsToDelete = [];
      const filePath = req.file.path;
      const forceDelete = req.query.force === 'true';

      fs.createReadStream(filePath)
        .pipe(csv({ mapHeaders: ({ header }) => header.trim().toLowerCase() }))
        .on("data", (row) => {
          let id = null;
          if (row.id) id = row.id.trim();
          else if (row.userid) id = row.userid.trim();
          else if (Object.keys(row).length > 0) {
            const firstColumnKey = Object.keys(row)[0];
            if (row[firstColumnKey]) id = row[firstColumnKey].trim();
          }
          if (id && id.length > 0) { idsToDelete.push(id); }
          else if (id !== null) { console.warn(`Skipping empty ID from CSV row:`, row); }
        })
        .on("end", async () => {
          fs.unlinkSync(filePath); 
          
          if (idsToDelete.length === 0) {
            return res.status(400).json({
              success: false,
              message: "No valid user IDs found in the CSV file."
            });
          }

          console.log(`Attempting to delete ${idsToDelete.length} users via CSV. Force delete: ${forceDelete}`);
          const deleteResult = await userService.bulkDeleteUsersByIds(idsToDelete, forceDelete);
          
          // --- MODIFIED MESSAGE CONSTRUCTION ---
          let summaryMessage;
          if (deleteResult.failedCount > 0) {
            summaryMessage = `${deleteResult.deletedCount} users deleted, ${deleteResult.failedCount} failed. Check server logs for details.`;
          } else {
            summaryMessage = `${deleteResult.deletedCount} users successfully deleted.`;
          }
          if (forceDelete && deleteResult.deletedCount > 0) {
            summaryMessage += " (Force delete applied)";
          }
          // --- END MODIFIED MESSAGE CONSTRUCTION ---

          res.status(200).json({ 
            success: true,
            message: summaryMessage, // Use the shorter summary message
            deletedCount: deleteResult.deletedCount,
            failedCount: deleteResult.failedCount,
            totalProcessed: idsToDelete.length,
            // Keep detailed errors in the response for potential debugging/logging on client if needed
            errors: deleteResult.errors.length > 0 ? deleteResult.errors : undefined 
          });
        })
        .on("error", (error) => {
          // ... (error handling remains the same)
          console.error("Error parsing CSV for deletion:", error);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          res.status(400).json({
            success: false,
            message: "Failed to parse CSV file for deletion",
            error: error.message
          });
        });
    } catch (error) {
      // ... (error handling remains the same)
      console.error("Error processing CSV for user deletion:", error);
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ 
        success: false,
        message: "Failed to process CSV for user deletion", 
        error: error.message 
      });
    }
  }

}

module.exports = new UserController();