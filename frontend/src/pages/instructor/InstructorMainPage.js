// src/components/InstructorMainPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import InstructorNavBar from './InstructorNavBar';
import './InstructorMainPage.css';

export default function InstructorMainPage() {
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [latestSwaps,   setLatestSwaps]   = useState([]);
  const [selectedInfo,  setSelectedInfo]  = useState(null);
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);

  // Base URL for all API calls
  const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5001') + '/api';

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        console.log('Fetching instructor dashboard with token:', token ? 'exists' : 'missing');

        // Hit your single dashboard endpoint
        const response = await axios.get(`${API_URL}/instructor/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Your controller does: res.json({ upcomingExams, latestSwaps })
        const { upcomingExams, latestSwaps } = response.data;

        setUpcomingExams(upcomingExams || []);
        setLatestSwaps(latestSwaps   || []);
      } catch (err) {
        console.error('Error loading dashboard:', err);
        if (err.response?.data) {
          console.error('Server response data:', err.response.data);
        }
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const openModal  = info => { setSelectedInfo(info); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setSelectedInfo(null); };

  return (
    <div className="instructor-main-page">
      <InstructorNavBar />

      <main className="main-content">
        {/* Upcoming Exams */}
        <section className="content-panel upcoming-exams-section">
          <h2>Upcoming Exams</h2>

          {loading ? (
            <div className="loading">Loading exams…</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : upcomingExams.length === 0 ? (
            <div className="empty">No upcoming exams found</div>
          ) : (
            <div className="cards-container">
              {upcomingExams.map((exam, i) => (
                <div className="card" key={i}>
                  <div className="card-info">
                    <h3>{exam.course}</h3>
                    <p>{exam.date}</p>
                    <p>{exam.time}</p>
                  </div>
                  <button
                    className="info-button"
                    onClick={() => openModal({ type: 'exam', data: exam })}
                  >
                    ⓘ
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Latest Swaps */}
        <section className="content-panel latest-swaps-section">
          <h2>Latest Swaps</h2>

          {loading ? (
            <div className="loading">Loading swaps…</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : latestSwaps.length === 0 ? (
            <div className="empty">No swap requests found</div>
          ) : (
            <div className="cards-container">
              {latestSwaps.map((swap, i) => (
                <div className="card" key={i}>
                  <div className="card-info">
                    <h3>{swap.from} → {swap.to}</h3>
                    <p>{swap.swapInfo}</p>
                    <p>{swap.date} {swap.time}</p>
                  </div>
                  <button
                    className="info-button"
                    onClick={() => openModal({ type: 'swap', data: swap })}
                  >
                    ⓘ
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <button className="close-button" onClick={closeModal}>×</button>

            {selectedInfo.type === 'exam' ? (
              <>
                <h3>{selectedInfo.data.course}</h3>
                <p><strong>Date:</strong> {selectedInfo.data.date}</p>
                <p><strong>Time:</strong> {selectedInfo.data.time}</p>
                <p><strong>Duration:</strong> {selectedInfo.data.duration}</p>
                <p><strong>Classrooms:</strong> {selectedInfo.data.classrooms.join(', ')}</p>
              </>
            ) : (
              <>
                <h3>{selectedInfo.data.from} → {selectedInfo.data.to}</h3>
                <p><strong>Swap Info:</strong> {selectedInfo.data.swapInfo}</p>
                <p><strong>Date & Time:</strong> {selectedInfo.data.date} {selectedInfo.data.time}</p>
                <p><strong>Duration:</strong> {selectedInfo.data.duration}</p>
                <p><strong>Classrooms:</strong> {selectedInfo.data.classrooms.join(', ')}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
);
}