// services/Admin/userService.js
const User = require("../../models/User");
const Admin = require("../../models/Admin");
const Instructor = require("../../models/Instructor");
const DepartmentChair = require("../../models/DepartmentChair");
const DeansOffice = require("../../models/DeansOffice");
const TeachingAssistant = require("../../models/TeachingAssistant");
const Student = require("../../models/Student");
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

      // Validate department for instructor and chair
      if ((userData.userType === 'instructor' || userData.userType === 'chair') && !userData.department) {
        throw new Error("Department is required for instructors and department chairs");
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
          case "dean":
            await DeansOffice.create({ id: user.id }, { transaction: t });
            break;
          case "ta":
            await TeachingAssistant.create({ id: user.id }, { transaction: t });
            break;
          case "student":
            await Student.create({ id: user.id }, { transaction: t });
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
      
      // Handle department update if user type has a department
      if (userData.department) {
        try {
          switch (user.userType.toLowerCase()) {
            case "instructor":
              const instructor = await Instructor.findByPk(user.id, { transaction: t });
              if (instructor) {
                await instructor.update({ department: userData.department }, { transaction: t });
              } else {
                await Instructor.create({ id: user.id, department: userData.department }, { transaction: t });
              }
              break;
            case "chair":
              const chair = await DepartmentChair.findByPk(user.id, { transaction: t });
              if (chair) {
                await chair.update({ department: userData.department }, { transaction: t });
              } else {
                await DepartmentChair.create({ id: user.id, department: userData.department }, { transaction: t });
              }
              break;
          }
        } catch (error) {
          console.error(`Error updating department for user ${id}:`, error);
          throw new Error(`Failed to update department: ${error.message}`);
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

  async deleteUser(id) {
    const t = await sequelize.transaction();
    
    try {
      const user = await User.findByPk(id, { transaction: t });
      
      if (!user) {
        throw new Error("User not found");
      }

      // Delete the specific user type based on userType
      try {
        switch (user.userType.toLowerCase()) {
          case "admin":
            await Admin.destroy({ where: { id }, transaction: t });
            break;
          case "instructor":
            await Instructor.destroy({ where: { id }, transaction: t });
            break;
          case "chair":
            await DepartmentChair.destroy({ where: { id }, transaction: t });
            break;
          case "dean":
            await DeansOffice.destroy({ where: { id }, transaction: t });
            break;
          case "ta":
            await TeachingAssistant.destroy({ where: { id }, transaction: t });
            break;
          case "student":
            await Student.destroy({ where: { id }, transaction: t });
            break;
        }
      } catch (error) {
        console.error(`Error deleting specific user type for ID ${id}:`, error);
        throw new Error(`Failed to delete user profile: ${error.message}`);
      }

      // Delete the base user
      await user.destroy({ transaction: t });

      await t.commit();
      return true;
    } catch (error) {
      console.error(`Transaction error in deleteUser for ID ${id}:`, error);
      await t.rollback();
      throw error;
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