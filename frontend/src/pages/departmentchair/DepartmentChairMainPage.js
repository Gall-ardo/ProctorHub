import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './DepartmentChairMainPage.css';
import DepartmentChairNavBar from './DepartmentChairNavBar';


function DepartmentChairMainPage() {
    const [upcomingExams, setUpcomingExams] = useState([]);
    const [latestSwaps, setLatestSwaps] = useState([]);
    const [selectedInfo, setSelectedInfo] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (info) => {
        setSelectedInfo(info);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedInfo(null);
    };

    useEffect(() => {
        // Fetch upcoming exams
        fetch('http://localhost:5001/api/exams/upcoming')
            .then(async response => {
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text();
                    throw new Error(`Expected JSON, got: ${text}`);
                }
                return response.json();
            })
            .then(data => setUpcomingExams(data))
            .catch(err => console.error("Error fetching upcoming exams:", err));

        // Fetch latest swaps
        fetch('http://localhost:5001/api/swaps/latest')
            .then(response => response.json())
            .then(data => setLatestSwaps(data))
            .catch(err => console.error('Error fetching latest swaps:', err));
    }, []);

    return (
        <div className="departmentchair-main-page">
            <DepartmentChairNavBar />

            {/* Main Content */}
            <main className="main-content">
                {/* Upcoming Exams */}
                <div className="content-panel upcoming-exams-section">
                    <h2>Upcoming Exams</h2>
                    <div className="cards-container">
                        {upcomingExams.map((exam, index) => (
                            <div className="card" key={index}>
                                <div className="card-info">
                                    <h3>{exam.course}</h3>
                                    <p>{exam.date}</p>
                                    <p>{exam.time}</p>
                                </div>
                                <button className="info-button" onClick={() => openModal({ type: 'exam', data: exam })}>ⓘ</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Latest Swaps */}
                <div className="content-panel latest-swaps-section">
                    <h2>Latest Swaps</h2>
                    <div className="cards-container">
                        {latestSwaps.map((swap, index) => (
                            <div className="card" key={index}>
                                <div className="card-info">
                                    <h3>{swap.from} → {swap.to}</h3>
                                    <p>{swap.swapInfo}</p>
                                    <p>{swap.date} {swap.time}</p>
                                </div>
                                <button className="info-button" onClick={() => openModal({ type: 'swap', data: swap })}>ⓘ</button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <button className="close-button" onClick={closeModal}>×</button>
                        {selectedInfo?.type === 'exam' ? (
                            <>
                                <h3>{selectedInfo.data.course}</h3>
                                <p><strong>Date:</strong> {selectedInfo.data.date}</p>
                                <p><strong>Time Interval:</strong> {selectedInfo.data.time}</p>
                                <p><strong>Exam Duration:</strong> {selectedInfo.data.duration}</p>
                                <p><strong>Classrooms:</strong> {selectedInfo.data.classrooms?.join(', ')}</p>
                            </>
                        ) : (
                            <>
                                <h3>{selectedInfo.data.from} → {selectedInfo.data.to}</h3>
                                <p><strong>Swap Info:</strong> {selectedInfo.data.swapInfo}</p>
                                <p><strong>Date & Time:</strong> {selectedInfo.data.date} {selectedInfo.data.time}</p>
                                {/* For a swap, you could show the exam's classroom/duration too, if it exists. */}
                                <p><strong>Exam Duration:</strong> {selectedInfo.data.duration}</p>
                                <p><strong>Classroom:</strong> {selectedInfo.data.classrooms?.join(', ')}</p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DepartmentChairMainPage;