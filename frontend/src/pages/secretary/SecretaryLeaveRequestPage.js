import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SecretaryLeaveRequestPage.css';
import SecretaryNavBar from './SecretaryNavBar';

export default function SecretaryLeaveRequestPage() {
  const [leaveRequests,   setLeaveRequests]   = useState([]);
  const [tasOnLeave,      setTasOnLeave]      = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const API_ROOT = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  const API      = `${API_ROOT}/api`;

  function authHeader() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    return { Authorization: `Bearer ${token}` };
  }

  useEffect(() => {
    (async () => {
      try {
        const [pendingRes, currentRes] = await Promise.all([
          axios.get(`${API}/secretary/leave-requests/pending`, { headers: authHeader() }),
          axios.get(`${API}/secretary/leave-requests/current`, { headers: authHeader() })
        ]);
        setLeaveRequests(pendingRes.data.data);
        setTasOnLeave(currentRes.data.data);
      } catch (err) {
        console.error('Error loading leave data:', err);
        alert(err.response?.data?.message || err.message);
      }
    })();
  }, []);

  const handleView    = r => { setSelectedRequest(r); setIsDetailModalOpen(true); };
  const closeModal    = () => { setIsDetailModalOpen(false); setSelectedRequest(null); };

  const handleApprove = async () => {
    try {
      await axios.post(
        `${API}/secretary/leave-requests/${selectedRequest.id}/approve`,
        {},
        { headers: authHeader() }
      );
      // re-fetch both lists
      const [pendingRes, currentRes] = await Promise.all([
        axios.get(`${API}/secretary/leave-requests/pending`, { headers: authHeader() }),
        axios.get(`${API}/secretary/leave-requests/current`, { headers: authHeader() })
      ]);
      setLeaveRequests(pendingRes.data.data);
      setTasOnLeave(currentRes.data.data);
    } catch (err) {
      console.error('Approve failed:', err);
      alert(err.response?.data?.message || err.message);
    } finally {
      closeModal();
    }
  };

  const handleReject = async () => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    try {
      await axios.post(
        `${API}/secretary/leave-requests/${selectedRequest.id}/reject`,
        { reason },
        { headers: authHeader() }
      );
      // re-fetch both lists
      const [pendingRes, currentRes] = await Promise.all([
        axios.get(`${API}/secretary/leave-requests/pending`, { headers: authHeader() }),
        axios.get(`${API}/secretary/leave-requests/current`, { headers: authHeader() })
      ]);
      setLeaveRequests(pendingRes.data.data);
      setTasOnLeave(currentRes.data.data);
    } catch (err) {
      console.error('Reject failed:', err);
      alert(err.response?.data?.message || err.message);
    } finally {
      closeModal();
    }
  };

  const handleDownload = async () => {
    if (!selectedRequest.filePath) return;
    try {
      const url  = `${API_ROOT}/uploads/leave-documents/${selectedRequest.filePath}`;
      const res  = await axios.get(url, { responseType: 'blob' });
      const blob = new Blob([res.data]);
      const link = document.createElement('a');
      link.href     = URL.createObjectURL(blob);
      link.download = selectedRequest.filePath;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download failed:', err);
      alert(`Download failed: ${err.response?.statusText || err.message}`);
    }
  };

  return (
    <div className="secretary-leave-page">
      <SecretaryNavBar />

      <div className="content-container">
        {/* Pending Requests */}
        <div className="panel leave-requests-panel">
          <h2>TA Leave Request</h2>
          <div className="requests-list">
            {leaveRequests.map(r => (
              <div className="request-card" key={r.id}>
                <div className="request-info">
                  <div className="request-name">{r.taName}</div>
                  <div className="request-date">
                    {new Date(r.startDate).toLocaleDateString()} –{' '}
                    {new Date(r.endDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="request-actions">
                  <button
                    className="view-btn"
                    onClick={() => handleView(r)}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current TAs On Leave */}
        <div className="panel tas-on-leave-panel">
          <h2>Accepted Leave Requests</h2>
          <div className="requests-list">
            {tasOnLeave.map(r => (
              <div className="request-card" key={r.id}>
                <div className="request-info">
                  <div className="request-name">{r.taName}</div>
                  <div className="request-date">
                    {new Date(r.startDate).toLocaleDateString()} –{' '}
                    {new Date(r.endDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedRequest && (
        <div className="modal-overlay">
          <div className="detail-modal">
            <div className="detail-modal-content">
              <button className="close-btn" onClick={closeModal}>×</button>

              {/* header with inline missed-proctorings */}
              <div className="detail-header">
                <h3 className="detail-title">{selectedRequest.taName}</h3>

              <p className="detail-label">
                <strong>Leave Dates: </strong>{' '}
                {new Date(selectedRequest.startDate).toLocaleDateString()} –{' '}
                {new Date(selectedRequest.endDate).toLocaleDateString()}
              </p>

              <div className="missed-inline">
                  <strong>Missed Proctorings:</strong>{' '}
                  {selectedRequest.affectedExams?.length > 0
                    ? selectedRequest.affectedExams.map((ex, i) => (
                        <span key={ex.id}>
                          {ex.courseName} ({ex.examType}) –{' '}
                          {new Date(ex.date).toLocaleDateString()}
                          {i < selectedRequest.affectedExams.length - 1 ? ', ' : ''}
                        </span>
                      ))
                    : 'None'}
                </div>
              </div>

              <p className="detail-label">
                <strong>Requested</strong>{selectedRequest.taEmail}
              </p>

              <div className="reason-box">
                <p className="reason-label">Reason:</p>
                <div className="reason-text">
                  {selectedRequest.reason.split('\n').map((line,i)=><p key={i}>{line}</p>)}
                </div>
              </div>

              {selectedRequest.filePath && (
                <button
                  className="download-btn small-btn"
                  onClick={handleDownload}
                >
                  Download Attachment
                </button>
              )}

              <div className="modal-actions">
                <div className="action-buttons">
                  <button className="accept-btn" onClick={handleApprove}>
                    Accept
                  </button>
                  <button className="reject-btn" onClick={handleReject}>
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}