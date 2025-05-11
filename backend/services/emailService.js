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

  async sendPasswordResetEmail(recipient, name, password) {
    try {
      console.log(`Sending password reset email to ${recipient}`);
      
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
      // Don't throw the error - we don't want to prevent password reset if email fails
      return false;
    }
  }

  async sendProctorAssignmentEmail(recipient, name, courseName, examDate, duration) {
    console.log(`Sending proctor assignment email to ${recipient}`);
    try {
      const dateObj = (examDate instanceof Date)
        ? examDate
        : new Date(examDate);

      const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long', // Optional: "Monday"
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Calculate start and end times using duration
      const startTimeObj = dateObj;
      const endTimeObj = new Date(dateObj.getTime() + (duration || 120) * 60000);

      const startTime = startTimeObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const endTime = endTimeObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipient,
        subject: `Proctor Assignment for ${courseName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin:0 auto; padding:20px; border:1px solid #ddd; border-radius:5px;">
            <h2 style="color:#c42626;">Proctor Assignment Notification</h2>
            <p>Dear ${name},</p>
            <p>You have been assigned as a proctor for the following exam:</p>
            <ul>
              <li><strong>Course:</strong> ${courseName}</li>
              <li><strong>Date:</strong> ${formattedDate}</li>
              <li><strong>Time:</strong> ${startTime} – ${endTime}</li>
            </ul>
            <p>Please arrive at least 15 minutes before the start time and check in with the exam coordinator.</p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Proctor assignment email sent:', info.messageId);
      return true;
    } catch (err) {
      console.error('Error sending proctor assignment email:', err);
      return false;
    }

  }

  async sendEmail(to, subject, text) {
    const mailOptions = { 
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    };
    return this.transporter.sendMail(mailOptions)
      .then(info => {
        console.log('Email sent:', info.response);
        return true;
      })
      .catch(error => {
        console.error('Error sending email:', error);
        return false;
      });
   }

}

module.exports = new EmailService();