const reportService = require('../../services/Admin/reportService');
const { Op } = require('sequelize');

/**
 * Report Controller for Admin
 * Handles all report-related operations for admin users
 */
class ReportController {
  /**
   * Get available report types
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getReportTypes(req, res) {
    try {
      const reportTypes = await reportService.getReportTypes();
      return res.status(200).json({ success: true, data: reportTypes });
    } catch (error) {
      console.error('Error getting report types:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch report types', error: error.message });
    }
  }

  /**
   * Get available years for reports
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAvailableYears(req, res) {
    try {
      const years = await reportService.getAvailableYears();
      return res.status(200).json({ success: true, data: years });
    } catch (error) {
      console.error('Error getting available years:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch available years', error: error.message });
    }
  }

  /**
   * Get available semesters
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSemesters(req, res) {
    try {
      const semesters = await reportService.getSemesters();
      return res.status(200).json({ success: true, data: semesters });
    } catch (error) {
      console.error('Error getting semesters:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch semesters', error: error.message });
    }
  }

  /**
   * Get reports with optional filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getReports(req, res) {
    try {
      const { year, type, semester, search } = req.query;
      const reports = await reportService.getReports(year, type, semester, search);
      return res.status(200).json({ success: true, data: reports });
    } catch (error) {
      console.error('Error getting reports:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch reports', error: error.message });
    }
  }

  /**
   * Generate a proctoring report
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateProctoringReport(req, res) {
    try {
      const { year, semester } = req.query;
      const report = await reportService.generateProctoringReport(year, semester);
      return res.status(200).json({ success: true, data: report });
    } catch (error) {
      console.error('Error generating proctoring report:', error);
      return res.status(500).json({ success: false, message: 'Failed to generate proctoring report', error: error.message });
    }
  }

  /**
   * Generate a swap report
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateSwapReport(req, res) {
    try {
      const { year, semester } = req.query;
      const report = await reportService.generateSwapReport(year, semester);
      return res.status(200).json({ success: true, data: report });
    } catch (error) {
      console.error('Error generating swap report:', error);
      return res.status(500).json({ success: false, message: 'Failed to generate swap report', error: error.message });
    }
  }

  /**
   * Generate a student list report
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateStudentListReport(req, res) {
    try {
      const { year, semester, department } = req.query;
      const report = await reportService.generateStudentListReport(year, semester, department);
      return res.status(200).json({ success: true, data: report });
    } catch (error) {
      console.error('Error generating student list report:', error);
      return res.status(500).json({ success: false, message: 'Failed to generate student list report', error: error.message });
    }
  }

  /**
   * Generate a course list report
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateCourseListReport(req, res) {
    try {
      const { year, semester, department } = req.query;
      const report = await reportService.generateCourseListReport(year, semester, department);
      return res.status(200).json({ success: true, data: report });
    } catch (error) {
      console.error('Error generating course list report:', error);
      return res.status(500).json({ success: false, message: 'Failed to generate course list report', error: error.message });
    }
  }

  /**
   * Generate a TA report
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateTAReport(req, res) {
    try {
      const { year, semester, department } = req.query;
      const report = await reportService.generateTAReport(year, semester, department);
      return res.status(200).json({ success: true, data: report });
    } catch (error) {
      console.error('Error generating TA report:', error);
      return res.status(500).json({ success: false, message: 'Failed to generate TA report', error: error.message });
    }
  }

  /**
   * Generate a workload report
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
    /**
   * Generate a workload report
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateWorkloadReport(req, res) {
    try {
      const { year, semester } = req.query;
      const report = await reportService.generateWorkloadReport(year, semester);
      return res.status(200).json({ success: true, data: report });
    } catch (error) {
      console.error('Error generating workload report:', error);
      return res.status(500).json({ success: false, message: 'Failed to generate workload report', error: error.message });
    }
  }


  /**
   * Download a specific report
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async downloadReport(req, res) {
    const { id, type, year, semester } = req.body;
    try {
        const result = await reportService.downloadReport(type, year, semester);
        res.setHeader('Content-disposition', `attachment; filename=${result.filename}`);
        res.setHeader('Content-type', 'application/pdf');
        res.send(result.content);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
  }

  /**
   * Download multiple reports as a zip file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async downloadMultipleReports(req, res) {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, message: 'Please provide report IDs to download' });
      }

      const zipFile = await reportService.downloadMultipleReports(ids);
      
      // Set appropriate headers for zip file download
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename=${zipFile.filename}`);
      
      return res.send(zipFile.content);
    } catch (error) {
      console.error('Error downloading multiple reports:', error);
      return res.status(500).json({ success: false, message: 'Failed to download reports', error: error.message });
    }
  }

  /**
   * Get system log entries with optional filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSystemLogs(req, res) {
    try {
      const { startDate, endDate, userType, action } = req.query;
      const logs = await reportService.getSystemLogs(startDate, endDate, userType, action);
      return res.status(200).json({ success: true, data: logs });
    } catch (error) {
      console.error('Error getting system logs:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch system logs', error: error.message });
    }
  }
}

module.exports = new ReportController();