// backend/controllers/Secretary/workloadApproveController.js
const {
    getPendingWorkloads: fetchPending,
    approveWorkload: serviceApprove,
    rejectWorkload: serviceReject,
    getWorkloadTotals: serviceTotals
  } = require('../../services/Secretary/workloadApproveService');
  
  exports.listPending = async (req, res) => {
    try {
      // Pass secretary’s user ID so the service can look up their department
      const data = await fetchPending(req.user.id);
      res.json({ success: true, data });
    } catch (err) {
      console.error('Error listing pending workloads:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  };
  
  exports.approve = async (req, res) => {
    try {
      const workload = await serviceApprove(
        req.params.id,    // workloadId
        req.user.id       // secretaryId
      );
      res.json({
        success: true,
        data: workload,
        message: `Workload approved successfully. ${workload.duration} hours have been added to the TA's total workload.`
      });
    } catch (err) {
      console.error('Error approving workload:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  };
  
  exports.reject = async (req, res) => {
    try {
      const { reason } = req.body;
      if (!reason) {
        return res
          .status(400)
          .json({ success: false, message: 'Rejection reason is required' });
      }
  
      const workload = await serviceReject(
        req.params.id,    // workloadId
        reason,           // rejectionReason
        req.user.id       // secretaryId
      );
      res.json({
        success: true,
        data: workload,
        message: 'Workload rejected successfully. The TA has been notified.'
      });
    } catch (err) {
      console.error('Error rejecting workload:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  };
  
  exports.totals = async (req, res) => {
    try {
      // Pass secretary’s user ID so the service can look up their department
      const data = await serviceTotals(req.user.id);
      res.json({ success: true, data });
    } catch (err) {
      console.error('Error getting totals:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  };