import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DeansOfficeNavBar from './DeansOfficeNavBar'; // Import the navbar
import './DeansOfficeMainPage.css'; // Updated CSS file

function DeanHomePage() {
  const [exams, setExams] = useState([]);
  const [swaps, setSwaps] = useState({ proctorSwaps: [], taSwaps: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_ROOT = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  const API = `${API_ROOT}/api`;

  useEffect(() => {
    const fetchDeanHomePageData = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await axios.get(`${API}/dean/home`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Correctly map the exams and swap data
        setExams(response.data.exams);
        setSwaps(response.data.swaps);
      } catch (err) {
        console.error('Error fetching Dean homepage data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchDeanHomePageData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="dean-home-page">
      {/* Navbar */}
      <DeansOfficeNavBar />
      {/* Main content */}
      {/* Main content */}
      <div className="main-content">
        {/* Upcoming Exams Section */}
        <section className="content-panel upcoming-exams">
          <h2>Upcoming Exams</h2>
          <div className="cards-container">
            {exams.map((exam) => (
                <div className="card" key={exam.course}>
                  <div className="card-info">
                    <h3>{exam.course.match(/[A-Z]+\d{3}/i)[0]}</h3> {/* Extract course code with exactly 3 digits */}
                    <p>{exam.date}</p>
                    <p>Duration: {exam.duration} min</p>
                    {exam.classrooms && <p>Classrooms: {exam.classrooms.join(', ')}</p>}
                  </div>
                </div>
            ))}
          </div>
        </section>
        {/* Swap Requests Section (Proctor and TA swaps) */}
        <section className="content-panel swap-requests">
          <h2>Swap Requests</h2>
          <div className="swap-columns">
            <div className="swap-column">
              <h3>Instructor Swaps</h3>
              <div className="cards-container">
                {swaps.proctorSwaps.map((swap) => (
                  <div className="card" key={swap.exam.id}>
                    <div className="card-info">
                      <h3>{swap.exam.courseName.match(/[A-Z]+\d{3}/i)[0]}</h3> {/* Ensure you're using the right property */}
                      {/* Use optional chaining to prevent errors if `taUser` is not available */}
                      <p>{swap.teachingAssistant?.taUser?.name} swapped with {swap.targetTa?.taUser?.name}</p>
                      <p>{swap.exam.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="swap-column">
              <h3>TA Swaps</h3>
              <div className="cards-container">
                {swaps.taSwaps.map((swap) => (
                  <div className="card" key={swap.id}>
                    <div className="card-info">
                      <h3>{swap.exam.courseName.match(/[A-Z]+\d{3}/i)[0]}</h3> {/* Ensure you're using the right property */}
                      {/* Use optional chaining to prevent errors if `taUser` is not available */}
                      <p>{swap.requester?.taUser?.name} → {swap.targetTa?.taUser?.name}</p>
                      <p>{swap.exam.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default DeanHomePage;
