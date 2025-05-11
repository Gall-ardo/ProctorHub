// src/components/InstructorMainPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import InstructorNavBar from './InstructorNavBar';
import './InstructorMainPage.css';
import './InstructorExamsPage.css'; // Import the exams page styles

export default function InstructorMainPage() {
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [latestSwaps,   setLatestSwaps]   = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [courses,       setCourses]       = useState([]);

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

        // Fetch courses to display proper course codes
        const coursesResponse = await axios.get(`${API_URL}/instructor/my-courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (coursesResponse.data.success) {
          setCourses(coursesResponse.data.data);
        }

        // Your controller does: res.json({ upcomingExams, latestSwaps })
        const { upcomingExams, latestSwaps } = response.data;

        setUpcomingExams(upcomingExams || []);
        setLatestSwaps(latestSwaps || []);
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

  return (
    <div className="instructor-main-page">
      <InstructorNavBar />

      <main className="main-content">
        {/* Upcoming Exams with improved styling */}
        <section className="content-panel exams-container">
          <div className="exams-header">
            <h2>Upcoming Exams</h2>
            <Link to="/instructor/exams" className="add-exam-btn">
              Manage Exams
            </Link>
          </div>

          {loading ? (
            <div className="loading">Loading exams…</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : upcomingExams.length === 0 ? (
            <div className="empty">No upcoming exams found</div>
          ) : (
            <div className="cards-container">
              {upcomingExams.map((exam, i) => {
                // Find the course to display proper course code
                const course = courses.find(c => c.id === exam.course || c.courseName === exam.course);
                const displayCode = course?.department +course?.courseCode || exam.course;
                
                return (
                  <div className="exam-card" key={i}>
                    <div className="exam-card-header">
                      <h3>{displayCode}</h3>
                    </div>
                    <p><strong>Date:</strong> {exam.date}</p>
                    <p><strong>Time:</strong> {exam.time}</p>
                    {exam.classrooms && exam.classrooms.length > 0 && (
                      <p><strong>Classroom(s):</strong>{" "}
                        {exam.classrooms ? exam.classrooms.join(", ") : "None"}</p>
                    )}
                    <div className="card-buttons">
                      <Link to="/instructor/exams" className="info-button">
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      

        {/* Latest Swaps */}
        <section className="content-panel exams-container">
          <div className="exams-header">
            <h2>Latest Swap Requests</h2>
          </div>

          {loading ? (
            <div className="loading">Loading swaps…</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : latestSwaps.length === 0 ? (
            <div className="empty">No swap requests found</div>
          ) : (
            <div className="cards-container">
              {latestSwaps.map((swap, i) => {
                // Find the course to display proper course code
                const course = courses.find(c => c.id === swap.examName || c.courseName === swap.examName);
                const displayCode = course?.department + course?.courseCode || swap.examName;
                
                return (
                  <div className="exam-card" key={i}>
                    <div className="exam-card-header">
                      <h3>{swap.type === 'INSTRUCTOR_INITIATED' ? 'Instructor Swap' : 'TA Swap Request'}</h3>
                    </div>
                    <p><strong>From:</strong> {swap.from}</p>
                    <p><strong>To:</strong> {swap.to}</p>
                    <p><strong>Exam:</strong> {displayCode}</p>
                    <p><strong>Exam Date:</strong> {swap.examDate}</p>
                    <p><strong>Swap Info:</strong> {swap.swapInfo}</p>
                    <p><strong>Date & Time:</strong> {swap.date} {swap.time}</p>
                    <div className="card-buttons">
                      <Link to="/instructor/exams" className="info-button">
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}