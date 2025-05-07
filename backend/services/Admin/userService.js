// services/Admin/userService.js
const User = require("../../models/User");
const Admin = require("../../models/Admin");
const Instructor = require("../../models/Instructor");
const DepartmentChair = require("../../models/DepartmentChair");
const Secretary = require("../../models/Secretary"); // Added Secretary model
const DeansOffice = require("../../models/DeansOffice");
const TeachingAssistant = require("../../models/TeachingAssistant");
const Secretary = require("../../models/Secretary");

const Schedule = require("../../models/Schedule");
const TimeSlot = require("../../models/TimeSlot");
const Workload = require("../../models/Workload");
const LeaveRequest = require("../../models/LeaveRequest");
const SwapRequest = require("../../models/SwapRequest");
const Notification = require("../../models/Notification");
const Log = require("../../models/Log");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const sequelize = require("../../config/db");
const emailService = require("../../services/emailService");

class UserService {
  // Generate a random password
  generateRandomPassword(length = 10) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    
    // Ensure at least one uppercase, one lowercase, one number, and one special character
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)];
    
    // Fill the rest of the password
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }

  async createUser(userData, sendEmail = true) {
    const t = await sequelize.transaction();
    
    try {
      // Check if user with the same ID or email already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { id: userData.id },
            { email: userData.email }
          ]
        },
        transaction: t
      });

      if (existingUser) {
        throw new Error(`User with ID: ${userData.id} or email: ${userData.email} already exists`);
      }

      // Validate required fields
      if (!userData.id || !userData.name || !userData.email || !userData.userType) {
        throw new Error("Missing required fields");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error("Invalid email format");
      }

      // Validate department for instructor, chair, secretary, and teaching assistant
      if ((userData.userType === 'instructor' || userData.userType === 'chair' || 
           userData.userType === 'secretary' || userData.userType === 'ta') && !userData.department) {
        throw new Error("Department is required for instructors, department chairs, secretaries, and teaching assistants");
      }

      // Validate userType - prevent creating students through this service
      if (userData.userType === 'student') {
        throw new Error("Students should be managed through the student management interface");
      }

      // Generate a random password if not provided
      const clearPassword = userData.password || this.generateRandomPassword();
      
      // Store the plain text password for email
      const passwordForEmail = clearPassword;
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(clearPassword, salt);

      // Create the base user
      const user = await User.create(userData, { transaction: t });
      
      // Create the specific user type
      try {
        switch (userData.userType.toLowerCase()) {
          case "admin":
            await Admin.create({ id: user.id }, { transaction: t });
            break;
          case "instructor":
            await Instructor.create({ 
              id: user.id,
              department: userData.department
            }, { transaction: t });
            break;
          case "chair":
            await DepartmentChair.create({ 
              id: user.id,
              department: userData.department
            }, { transaction: t });
            break;
          case "secretary":
            await Secretary.create({ 
              id: user.id,
              department: userData.department
            }, { transaction: t });
            break;
          case "dean":
            await DeansOffice.create({ id: user.id }, { transaction: t });
            break;
          case "ta":
            await TeachingAssistant.create({ 
              id: user.id,
              department: userData.department,
              totalProctoringInDepartment: 0,
              totalNonDepartmentProctoring: 0,
              totalWorkload: 0,
              isPHD: userData.isPHD || false,
              approvedAbsence: false,
              waitingAbsenceRequest: false,
              isPartTime: userData.isPartTime || false
            }, { transaction: t });
            break;
          default:
            throw new Error(`Invalid user type: ${userData.userType}`);
        }
      } catch (error) {
        console.error(`Error creating specific user type ${userData.userType}:`, error);
        throw new Error(`Failed to create ${userData.userType} profile: ${error.message}`);
      }

      await t.commit();
      
      // Send welcome email with credentials if sendEmail is true
      if (sendEmail) {
        try {
          await emailService.sendWelcomeEmail(
            user.email,
            user.name,
            user.id,
            passwordForEmail
          );
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't throw here to not disrupt the user creation process
        }
      }
      
      // Return user object with clear password for bulk operations
      const userWithPassword = user.toJSON();
      userWithPassword.clearPassword = passwordForEmail;
      
      return userWithPassword;
    } catch (error) {
      console.error("Transaction error in createUser:", error);
      await t.rollback();
      throw error;
    }
  }

  async findUserById(id) {
    try {
      return await User.findByPk(id);
    } catch (error) {
      console.error(`Error finding user by ID ${id}:`, error);
      throw error;
    }
  }

  async findUserByEmail(email) {
    try {
      return await User.findOne({ where: { email } });
    } catch (error) {
      console.error(`Error finding user by email ${email}:`, error);
      throw error;
    }
  }

  async updateUser(id, userData, resetPassword = false) {
    const t = await sequelize.transaction();
    
    try {
      // Find the user
      const user = await User.findByPk(id, { transaction: t });
      
      if (!user) {
        throw new Error("User not found");
      }
      
      // Store the original user type for comparison
      const originalUserType = user.userType;
      
      // Check if email is being updated and if it's already in use by another user
      if (userData.email && userData.email !== user.email) {
        const existingUser = await User.findOne({
          where: {
            email: userData.email,
            id: { [Op.ne]: id } // Exclude current user
          },
          transaction: t
        });
        
        if (existingUser) {
          throw new Error(`Email ${userData.email} is already in use by another user`);
        }
      }
  
      // Check if userType is being changed
      const isUserTypeChanging = userData.userType && userData.userType !== originalUserType;

      // Prevent changing user type to student
      if (userData.userType === 'student') {
        throw new Error("Cannot change user type to student. Students should be managed through the student management interface");
      }
  
      // Check if department is required and provided for the new user type
      if ((userData.userType === 'instructor' || userData.userType === 'chair' || 
           userData.userType === 'secretary' || userData.userType === 'ta') && !userData.department) {
        throw new Error("Department is required for instructors, department chairs, secretaries, and teaching assistants");
      }
  
      let passwordForEmail = null;
      
      // Reset password if requested
      if (resetPassword) {
        passwordForEmail = this.generateRandomPassword();
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(passwordForEmail, salt);
      } 
      // Update password if provided
      else if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
      } else {
        // Remove password from userData if it's not provided
        delete userData.password;
      }
  
      // Update the user details
      await user.update(userData, { transaction: t });
      
      // If user type has changed, remove the old role record and create a new one
      if (isUserTypeChanging) {
        console.log(`User type changing from ${originalUserType} to ${userData.userType}`);
        
        // Step 1: Delete the old user type record
        switch (originalUserType.toLowerCase()) {
          case "admin":
            await Admin.destroy({ where: { id }, transaction: t });
            break;
          case "instructor":
            await Instructor.destroy({ where: { id }, transaction: t });
            break;
          case "chair":
            await DepartmentChair.destroy({ where: { id }, transaction: t });
            break;
          case "secretary":
            await Secretary.destroy({ where: { id }, transaction: t });
            break;
          case "dean":
            await DeansOffice.destroy({ where: { id }, transaction: t });
            break;
          case "ta":
            await TeachingAssistant.destroy({ where: { id }, transaction: t });
            break;
        }
        
        // Step 2: Create the new user type record
        switch (userData.userType.toLowerCase()) {
          case "admin":
            await Admin.create({ id }, { transaction: t });
            break;
          case "instructor":
            await Instructor.create({ 
              id,
              department: userData.department
            }, { transaction: t });
            break;
          case "chair":
            await DepartmentChair.create({ 
              id,
              department: userData.department
            }, { transaction: t });
            break;
          case "secretary":
            await Secretary.create({ 
              id,
              department: userData.department
            }, { transaction: t });
            break;
          case "dean":
            await DeansOffice.create({ id }, { transaction: t });
            break;
          case "ta":
            await TeachingAssistant.create({ 
              id,
              department: userData.department,
              totalProctoringInDepartment: 0,
              totalNonDepartmentProctoring: 0,
              totalWorkload: 0,
              isPHD: userData.isPHD || false,
              approvedAbsence: false,
              waitingAbsenceRequest: false,
              isPartTime: userData.isPartTime || false
            }, { transaction: t });
            break;
        }
      } 
      // If just updating the same user type with new data
      else if (userData.department) {
        // Update department if the user remains the same type but department changed
        switch (user.userType.toLowerCase()) {
          case "instructor":
            const instructor = await Instructor.findByPk(user.id, { transaction: t });
            if (instructor) {
              await instructor.update({ department: userData.department }, { transaction: t });
            }
            break;
          case "chair":
            const chair = await DepartmentChair.findByPk(user.id, { transaction: t });
            if (chair) {
              await chair.update({ department: userData.department }, { transaction: t });
            }
            break;
          case "secretary":
            const secretary = await Secretary.findByPk(user.id, { transaction: t });
            if (secretary) {
              await secretary.update({ department: userData.department }, { transaction: t });
            }
            break;
          case "ta":
            const ta = await TeachingAssistant.findByPk(user.id, { transaction: t });
            if (ta) {
              // Update TA specific fields
              await ta.update({ 
                department: userData.department,
                isPHD: userData.isPHD !== undefined ? userData.isPHD : ta.isPHD,
                isPartTime: userData.isPartTime !== undefined ? userData.isPartTime : ta.isPartTime
              }, { transaction: t });
            }
            break;
        }
      }
      
      await t.commit();
      
      // Send password reset email if password was reset
      if (resetPassword && passwordForEmail) {
        try {
          await emailService.sendPasswordResetEmail(
            user.email,
            user.name,
            passwordForEmail
          );
        } catch (emailError) {
          console.error('Failed to send password reset email:', emailError);
          // Don't throw here to not disrupt the user update process
        }
      }
      
      return user;
    } catch (error) {
      console.error(`Transaction error in updateUser for ID ${id}:`, error);
      await t.rollback();
      throw error;
    }
  }

  async deleteUser(id, force = false) {
    const t = await sequelize.transaction();
    
    try {
      const user = await User.findByPk(id, { transaction: t });
      
      if (!user) {
        throw new Error("User not found");
      }

      // Log the deletion attempt
      console.log(`Attempting to delete user ${id} of type ${user.userType}${force ? ' with force flag' : ''}`);
      
      // Prevent deleting student users through this service
      if (user.userType.toLowerCase() === 'student') {
        throw new Error("Students should be managed through the student management interface");
      }
      
      // If force is true, we'll use a different approach to handle dependencies
      if (force) {
        console.log('Using forced deletion to handle dependencies');
        
        // We'll use MySQL-specific code since you're using MySQL
        // Temporarily disable foreign key checks to force delete
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { transaction: t });
        
        // Delete from specific user type table first
        switch (user.userType.toLowerCase()) {
          case "ta":
            // Only attempt to delete if record exists in this table
            const ta = await TeachingAssistant.findByPk(id, { transaction: t });
            if (ta) await ta.destroy({ transaction: t });
            break;
          case "instructor":
            const instructor = await Instructor.findByPk(id, { transaction: t });
            if (instructor) await instructor.destroy({ transaction: t });
            break;
          case "chair":
            const chair = await DepartmentChair.findByPk(id, { transaction: t });
            if (chair) await chair.destroy({ transaction: t });
            break;
          case "secretary":
            const secretary = await Secretary.findByPk(id, { transaction: t });
            if (secretary) await secretary.destroy({ transaction: t });
            break;
          case "dean":
            const dean = await DeansOffice.findByPk(id, { transaction: t });
            if (dean) await dean.destroy({ transaction: t });
            break;
          case "admin":
            const admin = await Admin.findByPk(id, { transaction: t });
            if (admin) await admin.destroy({ transaction: t });
            break;
        }
        
        // Delete the user
        await User.destroy({ where: { id }, transaction: t });
        
        // Re-enable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { transaction: t });
      } else {
        // Normal deletion process - we'll try to delete related records first
        
        // Delete notifications
        await Notification.destroy({ where: { recipientId: id }, transaction: t });
        
        // Delete logs
        await Log.destroy({ where: { userId: id }, transaction: t });
        
        // Try specific user type deletion
        switch (user.userType.toLowerCase()) {
          case "ta":
            // Delete TA-specific relationships first
            await Workload.destroy({ where: { taId: id }, transaction: t });
            await LeaveRequest.destroy({ where: { taId: id }, transaction: t });
            await SwapRequest.destroy({ 
              where: { 
                [Op.or]: [
                  { requesterId: id },
                  { recipientId: id }
                ]
              }, 
              transaction: t 
            });
            
            // Delete Schedule and TimeSlots
            const schedule = await Schedule.findOne({ where: { taId: id }, transaction: t });
            if (schedule) {
              await TimeSlot.destroy({ where: { scheduleId: schedule.id }, transaction: t });
              await schedule.destroy({ transaction: t });
            }
            
            // Delete from join tables - requires raw SQL
            try {
              await sequelize.query(
                `DELETE FROM ExamProctors WHERE TeachingAssistantId = ?`,
                { replacements: [id], transaction: t, type: sequelize.QueryTypes.DELETE }
              );
            } catch (error) {
              console.error('Error deleting from ExamProctors:', error);
            }
            
            try {
              await sequelize.query(
                `DELETE FROM CourseTAs WHERE TeachingAssistantId = ?`,
                { replacements: [id], transaction: t, type: sequelize.QueryTypes.DELETE }
              );
            } catch (error) {
              console.error('Error deleting from CourseTAs:', error);
            }
            
            try {
              await sequelize.query(
                `DELETE FROM OfferingTAs WHERE TeachingAssistantId = ?`,
                { replacements: [id], transaction: t, type: sequelize.QueryTypes.DELETE }
              );
            } catch (error) {
              console.error('Error deleting from OfferingTAs:', error);
            }
            
            // Delete the TeachingAssistant record
            await TeachingAssistant.destroy({ where: { id }, transaction: t });
            break;
            
          case "instructor":
            // Delete instructor relationships
            await Workload.destroy({ where: { instructorId: id }, transaction: t });
            
            // Delete from join tables
            try {
              await sequelize.query(
                `DELETE FROM OfferingInstructors WHERE InstructorId = ?`,
                { replacements: [id], transaction: t, type: sequelize.QueryTypes.DELETE }
              );
            } catch (error) {
              console.error('Error deleting from OfferingInstructors:', error);
            }
            
            try {
              await sequelize.query(
                `DELETE FROM InstructorCourses WHERE InstructorId = ?`,
                { replacements: [id], transaction: t, type: sequelize.QueryTypes.DELETE }
              );
            } catch (error) {
              console.error('Error deleting from InstructorCourses:', error);
            }
            
            // Delete from Instructor table
            await Instructor.destroy({ where: { id }, transaction: t });
            break;
            
          case "chair":
            await DepartmentChair.destroy({ where: { id }, transaction: t });
            break;
            
          case "secretary":
            await Secretary.destroy({ where: { id }, transaction: t });
            break;
            
          case "dean":
            await DeansOffice.destroy({ where: { id }, transaction: t });
            break;
            
          case "admin":
            await Admin.destroy({ where: { id }, transaction: t });
            break;
        }
        
        // Finally delete the user
        await User.destroy({ where: { id }, transaction: t });
      }

      await t.commit();
      return true;
    } catch (error) {
      console.error(`Transaction error in deleteUser for ID ${id}:`, error);
      await t.rollback();
      throw error;
    }
  }

  // Helper method to try both quoted and unquoted SQL formats
  async tryBothQueryFormats(sequelize, tableName, columnName, value, transaction) {
    try {
      // Try with quotes (for case-sensitive databases)
      await sequelize.query(
        `DELETE FROM "${tableName}" WHERE "${columnName}" = ?`,
        { replacements: [value], transaction, type: sequelize.QueryTypes.DELETE }
      );
      console.log(`Successfully deleted from ${tableName} (quoted format)`);
    } catch (error) {
      console.error(`Error with quoted format for ${tableName}:`, error);
      try {
        // Try without quotes
        await sequelize.query(
          `DELETE FROM ${tableName} WHERE ${columnName} = ?`,
          { replacements: [value], transaction, type: sequelize.QueryTypes.DELETE }
        );
        console.log(`Successfully deleted from ${tableName} (unquoted format)`);
      } catch (altError) {
        console.error(`Error with unquoted format for ${tableName}:`, altError);
        // Both formats failed, but we'll continue with other tables
      }
    }
  }

  async findUsers(query) {
    try {
      const whereClause = {};
      
      if (query.id) {
        whereClause.id = query.id;
      }
      
      if (query.email) {
        whereClause.email = { [Op.iLike]: `%${query.email}%` };
      }
      
      if (query.userType) {
        whereClause.userType = query.userType;
      }

      // Exclude student users from the results
      whereClause.userType = { [Op.ne]: 'student' };

      return await User.findAll({ where: whereClause });
    } catch (error) {
      console.error("Error in findUsers:", error);
      throw error;
    }
  }

  async bulkCreateUsers(usersData) {
    const createdUsers = [];
    const errors = [];
    
    for (const userData of usersData) {
      try {
        // Skip empty rows
        if (!userData.id && !userData.email && !userData.name) {
          continue;
        }
        
        // Skip student records
        if (userData.userType && userData.userType.toLowerCase() === 'student') {
          errors.push({
            data: userData,
            error: "Students should be managed through the student management interface"
          });
          continue;
        }
        
        // Create users without sending individual emails
        const user = await this.createUser(userData, false);
        createdUsers.push(user);
      } catch (error) {
        errors.push({
          data: userData,
          error: error.message
        });
        console.error(`Failed to create user ${userData.email || 'unknown email'}: ${error.message}`);
      }
    }

    // Send emails in bulk
    if (createdUsers.length > 0) {
      try {
        await emailService.sendBulkAccountCreationEmail(createdUsers);
      } catch (emailError) {
        console.error('Failed to send bulk welcome emails:', emailError);
      }
    }

    return {
      createdUsers,
      errors,
      success: createdUsers.length,
      failed: errors.length
    };
  }

  async resetUserPassword(id) {
    try {
      const user = await this.findUserById(id);
      if (!user) {
        throw new Error("User not found");
      }
      
      // Prevent resetting password for student users
      if (user.userType.toLowerCase() === 'student') {
        throw new Error("Students should be managed through the student management interface");
      }

      // Generate a new password and update the user
      const newPassword = this.generateRandomPassword();
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user.password = hashedPassword;
      await user.save();

      // Send email with new password
      await emailService.sendPasswordResetEmail(user.email, user.name, newPassword);

      return { success: true, message: "Password reset successfully" };
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  }
}

module.exports = new UserService();