import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './SecretaryTAWorkloadPage.css';
import './SecretaryMainPage.css';
import SecretaryNavBar from './SecretaryNavBar';

function SecretaryTAWorkloadPage() {
    const [enteredWorkloads, setEnteredWorkloads] = useState([]);
    const [totalWorkloads, setTotalWorkloads] = useState([]);

    // Pop-up (modal) states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null); // 'verify' or 'reject'
    const [selectedWorkloadId, setSelectedWorkloadId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        // Fetch TA Entered Workloads
        fetch('http://localhost:5001/api/ta-workload/entered')
            .then((res) => res.json())
            .then((data) => setEnteredWorkloads(data))
            .catch((err) => console.error('Error fetching entered workloads:', err));

        // Fetch TA Total Workloads
        fetch('http://localhost:5001/api/ta-workload/total')
            .then((res) => res.json())
            .then((data) => setTotalWorkloads(data))
            .catch((err) => console.error('Error fetching total workloads:', err));
    }, []);

    // Clicking "Verify"
    const handleVerify = (workloadId) => {
        setSelectedAction('verify');
        setSelectedWorkloadId(workloadId);
        setIsModalOpen(true);
    };

    // Clicking "Reject"
    const handleReject = (workloadId) => {
        setSelectedAction('reject');
        setSelectedWorkloadId(workloadId);
        setIsModalOpen(true);
    };

    // Close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedWorkloadId(null);
        setSelectedAction(null);
        setRejectionReason('');
    };

    // Confirm button in modal
    const handleConfirm = () => {
        if (selectedAction === 'verify') {
            console.log('Verifying workload:', selectedWorkloadId);
            // Later: add real backend call
        } else if (selectedAction === 'reject') {
            // Check rejection reason
            if (!rejectionReason.trim()) {
                alert('Please provide a reason for rejecting this request.');
                return;
            }
            console.log('Rejecting workload:', selectedWorkloadId, 'Reason:', rejectionReason);
            // Later: add real backend call
        }
        // close modal
        closeModal();
    };

    return (
        <div className="ta-workload-page">
            {/* Top Navbar */}
            <SecretaryNavBar />

            {/* Main Content */}
            <main className="main-content">
                {/* Left Panel: TA Entered Workloads */}
                <div className="content-panel entered-workloads-section">
                    <h2>TA Entered Workloads</h2>
                    <div className="cards-container">
                        {enteredWorkloads.map((item) => (
                            <div className="card" key={item.id}>
                                <h3>
                                    {item.taName} - {item.hours} Hours
                                </h3>
                                <p>{item.date}</p>
                                <div className="action-buttons">
                                    <button onClick={() => handleVerify(item.id)}>Verify</button>
                                    <button onClick={() => handleReject(item.id)}>Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: TA Total Workloads */}
                <div className="content-panel total-workloads-section">
                    <h2>TA Total Workloads</h2>
                    <div className="cards-container">
                        {totalWorkloads.map((item) => (
                            <div className="card" key={item.id}>
                                <h3>
                                    {item.taName} – {item.approvedHours} Hours Approved, {item.waitingHours} Hours Waiting
                                </h3>
                                <p>Last Update: {item.lastUpdate}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* ===== MODAL for Verify/Reject ===== */}
            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        {/* Close / X button */}
                        <button className="close-modal-button" onClick={closeModal}>×</button>

                        {selectedAction === 'verify' ? (
                            <>
                                <h3>Are you sure you want to verify this workload?</h3>
                                <div className="button-row">
                                    <button onClick={closeModal}>No</button>
                                    <button onClick={handleConfirm}>Yes</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3>Are you sure you want to reject this workload?</h3>
                                <label>Please provide a reason for rejection:</label>
                                <textarea
                                    className="rejection-textarea"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Reason for rejecting"
                                />
                                <div className="button-row">
                                    <button onClick={closeModal}>Cancel</button>
                                    {/* "Reject" is disabled if reason is empty */}
                                    <button onClick={handleConfirm} disabled={!rejectionReason.trim()}>
                                        Yes
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SecretaryTAWorkloadPage;