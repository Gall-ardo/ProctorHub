// backend/controllers/Dean/leaveRequestController.js
const service = require('../../services/Secretary/leaveRequestService');

exports.getPending = async (req, res) => {
  try {
    const data = await service.listPending();
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error listing pending leave-requests:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCurrent = async (req, res) => {
  try {
    const data = await service.listCurrent();
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error listing current leaves:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approve = async (req, res) => {
  try {
    await service.approve(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error approving leave:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.reject = async (req, res) => {
  try {
    await service.reject(req.params.id, req.body.reason);
    res.json({ success: true });
  } catch (err) {
    console.error('Error rejecting leave:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};