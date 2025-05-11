const service = require('../../services/Instructor/leaveRequestService');

/**
 * Get pending leave requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPending = async (req, res) => {
  try {
    const data = await service.listPending();
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error listing pending leave-requests:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get current (approved) leave requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getCurrent = async (req, res) => {
  try {
    const data = await service.listCurrent();
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error listing current leaves:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Approve a leave request and handle proctoring reassignments
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.approve = async (req, res) => {
  try {
    const instructorId = req.user.id;
    await service.approve(req.params.id, instructorId);
    res.json({ success: true, message: 'Leave request approved successfully. Affected proctoring assignments have been updated.' });
  } catch (err) {
    console.error('Error approving leave:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Reject a leave request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.reject = async (req, res) => {
  try {
    const instructorId = req.user.id;
    await service.reject(req.params.id, req.body.reason, instructorId);
    res.json({ success: true, message: 'Leave request rejected successfully.' });
  } catch (err) {
    console.error('Error rejecting leave:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}; 