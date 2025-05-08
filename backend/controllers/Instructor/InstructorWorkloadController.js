const { get } = require('../../routes');
const {
  getPendingWorkloads: fetchPending,
  approveWorkload: serviceApprove,
  rejectWorkload: serviceReject,
  getWorkloadTotals: serviceTotals
} = require('../../services/Instructor/InstructorWorkloadService');

exports.listPending = async (req, res) => {
  try {
    const data = await fetchPending(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error listing pending workloads:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approve = async (req, res) => {
  try {
    const workload = await serviceApprove(req.params.id);
    res.json({ success: true, data: workload });
  } catch (err) {
    console.error('Error approving workload:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.reject = async (req, res) => {
  try {
    if (!req.body.reason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }
    const workload = await serviceReject(req.params.id, req.body.reason);
    res.json({ success: true, data: workload });
  } catch (err) {
    console.error('Error rejecting workload:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.totals = async (req, res) => {
  try {
    const data = await serviceTotals(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error getting totals:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};