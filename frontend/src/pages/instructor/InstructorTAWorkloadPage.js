import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './InstructorTAWorkloadPage.css';

function InstructorTAWorkloadPage() {
  const [enteredWorkloads, setEnteredWorkloads] = useState([]);
  const [totalWorkloads, setTotalWorkloads] = useState([]);

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

  // For the "Verify" and "Reject" buttons (example placeholders)
  const handleVerify = (workloadId) => {
    console.log('Verifying workload:', workloadId);
    // Optionally call your backend to verify the workload
    // fetch(`http://localhost:5001/api/taworkload/verify/${workloadId}`, { method: 'POST' })
  };

  const handleReject = (workloadId) => {
    console.log('Rejecting workload:', workloadId);
    // Optionally call your backend to reject the workload
  };

  return (
    <div className="ta-workload-page">
      {/* Top Navbar */}
      <div className="top-navbar">
        <div className="nav-links">
          <Link to="/instructor/home">Home</Link>
          <Link to="/instructor/ta-workload"><strong>TA Workload</strong></Link>
          <Link to="/instructor/exams">Exams</Link>
          <Link to="/instructor/assign">TA Assign</Link>
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
        {/* Left Panel: TA Entered Workloads */}
        <div className="content-panel entered-workloads-section">
          <h2>TA Entered Workloads</h2>
          <div className="cards-container">
            {enteredWorkloads.map((item) => (
              <div className="card" key={item.id}>
                <h3>{item.taName} - {item.hours} Hours</h3>
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
                <h3>{item.taName} – {item.approvedHours} Hours Approved, {item.waitingHours} Hours Waiting</h3>
                <p>Last Update: {item.lastUpdate}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default InstructorTAWorkloadPage;