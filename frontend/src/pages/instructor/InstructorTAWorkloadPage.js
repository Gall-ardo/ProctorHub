// src/components/InstructorTAWorkloadPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import InstructorNavBar from './InstructorNavBar';
import './InstructorTAWorkloadPage.css';

export default function InstructorTAWorkloadPage() {
  const [pending, setPending] = useState([]);
  const [totals,  setTotals]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Modal state
  const [isModalOpen,       setIsModalOpen]       = useState(false);
  const [actionType,        setActionType]        = useState('');
  const [selectedId,        setSelectedId]        = useState(null);
  const [rejectionReason,   setRejectionReason]   = useState('');

  const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5001') + '/api';

  function getAuthHeader() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    return { Authorization: `Bearer ${token}` };
  }

  const fetchWorkloadData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeader();
      const [pendingResp, totalsResp] = await Promise.all([
        axios.get(`${API_URL}/instructor/workloads/pending`, { headers }),
        axios.get(`${API_URL}/instructor/workloads/totals`,  { headers })
      ]);

      console.log('Pending workloads:', pendingResp.data.data);
      console.log('Workload totals:',  totalsResp.data.data);

      setPending(pendingResp.data.data);
      setTotals(totalsResp.data.data);
    } catch (err) {
      console.error('Error loading workloads:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkloadData();
  }, []);

  const openModal = (type, id) => {
    setActionType(type);
    setSelectedId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedId(null);
    setActionType('');
    setRejectionReason('');
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeader();

      if (actionType === 'approve') {
        await axios.post(`${API_URL}/instructor/workloads/${selectedId}/approve`, {}, { headers });
      } else {
        if (!rejectionReason.trim()) {
          alert('Please provide a rejection reason.');
          return;
        }
        await axios.post(
          `${API_URL}/instructor/workloads/${selectedId}/reject`,
          { reason: rejectionReason },
          { headers }
        );
      }

      await fetchWorkloadData();
    } catch (err) {
      console.error('Action failed:', err);
      alert(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
      closeModal();
    }
  };

  if (loading && !pending.length && !totals.length) {
    return <div className="loading">Loading workloads…</div>;
  }
  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="instructor-ta-workload-page">
      <InstructorNavBar />

      <main className="main-content">
        <section className="content-panel entered-workloads-section">
          <h2>Pending Workloads</h2>
          {pending.length === 0 ? (
            <p>No pending requests.</p>
          ) : (
            <div className="cards-container">
              {pending.map(w => {
                // safe fallback for whichever shape your backend actually sent:
                const taName =
                  w.teachingAssistant?.ta?.name ||
                  w.teachingAssistant?.name ||
                  'Unknown TA';

                return (
                <div className="card" key={w.id}>
                  <div className="card-info">
                    <div className="info-row">
                      <span className="ta-name">
                        <h3>{taName} – {w.duration} Hours</h3>
                      </span>
                    </div>
                    <div className="info-row">
                      <strong>Date:</strong> {new Date(w.date).toLocaleDateString()}
                    </div>
                    <div className="info-row">
                      <strong>Task:</strong> {w.taskType || 'Not specified'}
                    </div>
                    {w.course && (
                      <div className="info-row">
                        <strong>Course:</strong> {w.course}
                      </div>
                    )}
                  </div>
                  <div className="action-buttons">
                    <button onClick={() => openModal('approve', w.id)}>Approve</button>
                    <button onClick={() => openModal('reject', w.id)}>Reject</button>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="content-panel total-workloads-section">
          <h2>Workload Summary</h2>
          {totals.length === 0 ? (
            <p>No summary data.</p>
          ) : (
            <div className="cards-container">
              {totals.map(t => (
                <div className="card" key={t.id}>
                  <h3>{t.taName}</h3>
                  <p>
                    Approved: {t.approvedHours} Hours, Waiting: {t.waitingHours} Hours
                  </p>
                  <p>
                    Last Update:{' '}
                    {new Date(t.lastUpdate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <button
              className="close-modal-button"
              onClick={closeModal}
            >
              ×
            </button>

            {actionType === 'approve' ? (
              <>
                <h3 style={{ marginBottom: '1rem' }}>Confirm Verification</h3>
                <p>Are you sure you want to approve this workload request?</p>
                <div className="button-row">
                  <button onClick={handleConfirm}>Yes</button>
                  <button onClick={closeModal}>No</button>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ marginBottom: '1rem' }}>Reject Workload</h3>
                <p>Please provide a reason for rejection:</p>
                <textarea
                  className="rejection-textarea"
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="Reason for rejecting"
                />
                <div className="button-row">
                <button
                    onClick={handleConfirm}
                    disabled={!rejectionReason.trim()}
                  >
                    Submit
                  </button>
                  <button onClick={closeModal}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}