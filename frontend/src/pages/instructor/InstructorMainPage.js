import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './InstructorMainPage.css';

function InstructorMainPage() {
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [latestSwaps, setLatestSwaps] = useState([]);

  useEffect(() => {
    // Fetch upcoming exams
    fetch('/api/exams')
      .then(response => response.json())
      .then(data => setUpcomingExams(data))
      .catch(err => console.error('Error fetching upcoming exams:', err));

    // Fetch latest swaps
    fetch('/api/swaps')
      .then(response => response.json())
      .then(data => setLatestSwaps(data))
      .catch(err => console.error('Error fetching latest swaps:', err));
  }, []);

  return (
    <div className="instructor-main-page">
      {/* Top Navbar */}
      <div className="top-navbar">
        <div className="nav-links">
          <Link to="/instructor/main"><strong>Home</strong></Link>
          <Link to="/ta/taworkloadpage">TA Workload</Link>
          <Link to="/exams">Exams</Link>
          <Link to="/ta/assign">TA Assign</Link>
        </div>
        <div className="nav-icons">
          <div className="notification-icon">
            <img src="/notification.png" alt="Notifications" />
          </div>
          <div className="profile-icon">
            <img src="/profile.png" alt="Profile" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        {/* Upcoming Exams */}
        <div className="content-panel upcoming-exams-section">
          <h2>Upcoming Exams</h2>
          <div className="cards-container">
            {upcomingExams.map((exam, index) => (
              <div className="card" key={index}>
                <h3>{exam.course}</h3>
                <p>{exam.date}</p>
                <p>{exam.time}</p>
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
                <h3>{swap.from} → {swap.to}</h3>
                <p>{swap.swapInfo}</p>
                <p>{swap.date} {swap.time}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default InstructorMainPage;