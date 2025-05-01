// controllers/Admin/userController.js
const userService = require('../../services/Admin/userService');
const fs = require('fs');
const csv = require('csv-parser');

class UserController {
  async createUser(req, res) {
    try {
      // Log request data for debugging
      console.log('Create user request:', JSON.stringify(req.body, null, 2));
      
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
      
      await userService.deleteUser(req.params.id);
      
      res.status(200).json({
        success: true,
        message: "User deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      
      let statusCode = 400;
      if (error.message.includes('not found')) {
        statusCode = 404;
      }
      
      res.status(statusCode).json({ 
        success: false,
        message: "Failed to delete user", 
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
          // Transform column names to match expected format if needed
          const transformedData = {};
          
          // Map CSV columns to user fields
          Object.keys(data).forEach(key => {
            // Convert column headers to expected property names
            const lowerKey = key.toLowerCase().trim();
            
            if (lowerKey === 'id' || lowerKey === 'userid') {
              transformedData.id = data[key];
            } else if (lowerKey === 'name' || lowerKey === 'fullname') {
              transformedData.name = data[key];
            } else if (lowerKey === 'email') {
              transformedData.email = data[key];
            } else if (lowerKey === 'usertype' || lowerKey === 'role' || lowerKey === 'type') {
              transformedData.userType = data[key];
            } else if (lowerKey === 'department' || lowerKey === 'dept') {
              transformedData.department = data[key];
            }
          });
          
          results.push(transformedData);
        })
        .on("end", async () => {
          // Remove the temporary file
          fs.unlinkSync(filePath);
          
          console.log(`Parsed ${results.length} users from CSV`);

          // Process and create users
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
}


module.exports = new UserController();