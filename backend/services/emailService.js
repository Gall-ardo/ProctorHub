// services/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendWelcomeEmail(recipient, name, userId, password) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipient,
        subject: 'Welcome to ProctorHub - Your Account Information',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #c42626;">Welcome to ProctorHub</h2>
            <p>Hello ${name},</p>
            <p>Your account has been successfully created in the ProctorHub system.</p>
            <p>Here are your login credentials:</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>User ID:</strong> ${userId}</p>
              <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
            </div>
            <p>Please log in using these credentials and change your password after your first login.</p>
            <p>If you have any questions, please contact the administrator.</p>
            <p>Thank you,<br />ProctorHub Team</p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(recipient, name, password) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipient,
        subject: 'ProctorHub - Your Password Has Been Reset',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #c42626;">Password Reset</h2>
            <p>Hello ${name},</p>
            <p>Your password has been reset in the ProctorHub system.</p>
            <p>Your new password is:</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
            </div>
            <p>Please log in using this password and change it after your first login.</p>
            <p>If you have any questions, please contact the administrator.</p>
            <p>Thank you,<br />ProctorHub Team</p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }

  async sendBulkAccountCreationEmail(users) {
    try {
      const promises = users.map(user => {
        return this.sendWelcomeEmail(user.email, user.name, user.id, user.clearPassword);
      });
      
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Error sending bulk emails:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(recipient, name, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipient,
      subject: 'ProctorHub Password Reset',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>Click the link below to choose a new password. This link expires in 1 hour.</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>If you didn’t request this, just ignore this email.</p>
      `
    };
    return this.transporter.sendMail(mailOptions);
  }

}

module.exports = new EmailService();