const { generateExamSeatingPDF } = require('../../services/instructor/printService');

/**
 * Print students alphabetically for an exam
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - PDF stream
 */
const printStudentsAlphabetically = async (req, res) => {
  try {
    const { examId } = req.params;
    console.log(`Request to print students alphabetically for exam ID: ${examId}`);
    
    // Verify the instructor has access to this exam
    // Check if the exam belongs to a course taught by this instructor
    // This verification would ideally be handled by a middleware or a helper function
    
    const { stream, filename } = await generateExamSeatingPDF(examId, false);
    console.log(`PDF generated successfully: ${filename}`);
    
    // Set headers for PDF download
    res.setHeader('Content-disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-type', 'application/pdf');
    
    // Pipe the PDF stream to the response
    stream.pipe(res);
    console.log('Response streaming started');
  } catch (error) {
    console.error('Error printing students alphabetically:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to generate PDF',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Print students randomly for an exam
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - PDF stream
 */
const printStudentsRandomly = async (req, res) => {
  try {
    const { examId } = req.params;
    console.log(`Request to print students randomly for exam ID: ${examId}`);
    
    // Verify the instructor has access to this exam
    // This verification would ideally be handled by a middleware or a helper function
    
    const { stream, filename } = await generateExamSeatingPDF(examId, true);
    console.log(`PDF generated successfully: ${filename}`);
    
    // Set headers for PDF download
    res.setHeader('Content-disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-type', 'application/pdf');
    
    // Pipe the PDF stream to the response
    stream.pipe(res);
    console.log('Response streaming started');
  } catch (error) {
    console.error('Error printing students randomly:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to generate PDF',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  printStudentsAlphabetically,
  printStudentsRandomly
};