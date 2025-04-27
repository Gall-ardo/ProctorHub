import React, { useState, useEffect } from 'react';
import './DeansOfficeLeaveRequestPage.css';
import DeansOfficeNavBar from './DeansOfficeNavBar';

function DeansOfficeLeaveRequestPage() {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [tasOnLeave, setTasOnLeave] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);

    useEffect(() => {
        // Mock data - replace with actual API calls
        const mockLeaveRequests = [
            {
                id: 1,
                name: 'Sude Ergün',
                startDate: '21.09.2025',
                endDate: '30.12.2025',
                status: 'pending',
                email: 'sude.ergun@bilkent.edu.tr',
                reason: 'Dear professor,\nI am going to be in Erasmus in the given dates.\nI attached my approval to this message.',
                hasAttachment: true,
                attachmentName: 'Erasmus_Approval_Document.pdf',
                attachmentType: 'pdf'
            },
            {
                id: 2,
                name: 'Rıdvan Yılmaz',
                startDate: '14.03.2025',
                endDate: '20.06.2025',
                status: 'pending',
                email: 'ridvan.yilmaz@bilkent.edu.tr',
                reason: 'Dear professor,\nI will be attending a conference in Germany during these dates.\nI have attached the conference invitation.',
                hasAttachment: true,
                attachmentName: 'Conference_Invitation.pdf',
                attachmentType: 'pdf'
            },
            {
                id: 3,
                name: 'Ziya Özgül',
                startDate: '15.12.2025',
                endDate: '30.04.2026',
                status: 'pending',
                email: 'ziya.ozgul@bilkent.edu.tr',
                reason: 'Dear professor,\nI need to take a semester off for personal health reasons.\nI have attached the medical report for your review.',
                hasAttachment: true,
                attachmentName: 'Medical_Report.jpg',
                attachmentType: 'image'
            }
        ];

        const mockTasOnLeave = [
            { id: 1, name: 'Rıdvan Yılmaz', startDate: '14.03.2025', endDate: '20.06.2025' },
            { id: 2, name: 'Ziya Özgül', startDate: '15.12.2025', endDate: '30.04.2026' },
            { id: 3, name: 'Sude Ergün', startDate: '21.09.2025', endDate: '30.12.2025' }
        ];

        setLeaveRequests(mockLeaveRequests);
        setTasOnLeave(mockTasOnLeave);
    }, []);

    const handleViewRequest = (request) => {
        setSelectedRequest(request);
        setIsDetailModalOpen(true);
    };

    const handleInfoClick = (item) => {
        setSelectedRequest(item);
        setIsInfoModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsInfoModalOpen(false);
        setIsDetailModalOpen(false);
        setIsFileViewerOpen(false);
        setSelectedRequest(null);
    };

    const handleSort = () => {
        const sortedTAs = [...tasOnLeave].sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
        setTasOnLeave(sortedTAs);
    };

    const handleAccept = () => {
        // Logic to accept leave request
        alert('Leave request accepted');
        handleCloseModal();
    };

    const handleReject = () => {
        // Logic to reject leave request
        alert('Leave request rejected');
        handleCloseModal();
    };

    const handleViewFile = () => {
        setIsFileViewerOpen(true);
    };

    // File viewer component
    const FileViewer = ({ file }) => {
        if (!file) return null;

        return (
            <div className="file-viewer">
                <div className="file-viewer-header">
                    <h3>{file.attachmentName}</h3>
                    <button className="close-btn" onClick={() => setIsFileViewerOpen(false)}>×</button>
                </div>
                <div className="file-viewer-content">
                    {file.attachmentType === 'pdf' ? (
                        <div className="pdf-container">
                            {/* Placeholder for PDF viewer */}
                            <div className="pdf-placeholder">
                                <img src="/api/placeholder/400/500" alt="PDF Document Preview" />
                                <div className="pdf-info">
                                    <p><strong>File:</strong> {file.attachmentName}</p>
                                    <p><strong>Type:</strong> PDF Document</p>
                                    <p><strong>From:</strong> {file.name}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="image-container">
                            <img src="/api/placeholder/600/400" alt="Document Preview" />
                        </div>
                    )}
                </div>
                <div className="file-viewer-actions">
                    <button className="action-btn download-btn">Download</button>
                    <button className="action-btn print-btn">Print</button>
                </div>
            </div>
        );
    };

    return (
        <div className="DeansOffice-leave-page">
            {/* Use the existing DeansOfficeNavBar component */}
            <DeansOfficeNavBar />

            {/* Main Content */}
            <div className="content-container">
                {/* Leave Requests Panel */}
                <div className="panel leave-requests-panel">
                    <h2>TA Leave Request</h2>
                    <div className="requests-list">
                        {leaveRequests.map((request) => (
                            <div className="request-card" key={request.id}>
                                <div className="request-info">
                                    <div className="request-name">{request.name}</div>
                                    <div className="request-date">{request.startDate}-{request.endDate}</div>
                                </div>
                                <div className="request-actions">
                                    <button
                                        className="view-btn"
                                        onClick={() => handleViewRequest(request)}
                                    >
                                        View
                                    </button>
                                    <button
                                        className="info-btn"
                                        onClick={() => handleInfoClick(request)}
                                    >
                                        ⓘ
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* TAs on Leave Panel */}
                <div className="panel tas-on-leave-panel">
                    <div className="panel-header">
                        <h2>TAs On Leave</h2>
                        <button className="sort-btn" onClick={handleSort}>
                            Sort by Name <span className="dropdown-arrow">▼</span>
                        </button>
                    </div>
                    <div className="tas-list">
                        {tasOnLeave.map((ta) => (
                            <div className="ta-card" key={ta.id}>
                                <div className="ta-name">{ta.name}</div>
                                <button
                                    className="info-btn"
                                    onClick={() => handleInfoClick(ta)}
                                >
                                    ⓘ
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Info Modal */}
            {isInfoModalOpen && selectedRequest && (
                <div className="modal-overlay">
                    <div className="modal">
                        <button className="close-btn" onClick={handleCloseModal}>×</button>
                        <h3>Leave Request Info</h3>
                        <div className="modal-content">
                            <p><strong>Name:</strong> {selectedRequest.name}</p>
                            <p><strong>Period:</strong> {selectedRequest.startDate} - {selectedRequest.endDate}</p>
                            {selectedRequest.email && (
                                <p><strong>Email:</strong> {selectedRequest.email}</p>
                            )}
                            {selectedRequest.status && (
                                <p><strong>Status:</strong> {selectedRequest.status}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Detailed View Modal */}
            {isDetailModalOpen && selectedRequest && (
                <div className="modal-overlay">
                    <div className="detail-modal">
                        <div className="detail-modal-content">
                            <button className="close-btn" onClick={handleCloseModal}>×</button>
                            <h3>{selectedRequest.name}</h3>

                            <div className="detail-info">
                                <p className="detail-label">Leave Date: {selectedRequest.startDate}-{selectedRequest.endDate}</p>
                                <p className="detail-label">Requested by: {selectedRequest.email}</p>
                            </div>

                            <div className="reason-box">
                                <p className="reason-label">Reason:</p>
                                <div className="reason-text">
                                    {selectedRequest.reason.split('\n').map((line, index) => (
                                        <p key={index}>{line}</p>
                                    ))}
                                </div>
                            </div>

                            <div className="modal-actions">
                                <div className="action-buttons">
                                    <button className="accept-btn" onClick={handleAccept}>Accept</button>
                                    <button className="reject-btn" onClick={handleReject}>Reject</button>
                                </div>
                                {selectedRequest.hasAttachment && (
                                    <button className="view-file-btn" onClick={handleViewFile}>
                                        View File
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* File Viewer Modal */}
            {isFileViewerOpen && selectedRequest && (
                <div className="modal-overlay">
                    <div className="file-modal">
                        <FileViewer file={selectedRequest} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default DeansOfficeLeaveRequestPage;