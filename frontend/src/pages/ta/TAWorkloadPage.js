import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './TAWorkloadPage.css';
import AddWorkloadPopup from './AddWorkloadPopup';

const NavBar = () => {
  return (
    <div className="top-navbar">
      <div className="nav-links">
        <Link to="/ta/tamainpage">Home</Link>
        <Link to="/ta/taworkloadpage"><strong>Workload</strong></Link>
        <Link to="#">Proctoring</Link>
        <Link to="#">Leave of Absence</Link>
        <Link to="#">Swap</Link>
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
  );
};

const TAWorkloadPage = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [waitingWorkloads, setWaitingWorkloads] = useState([
    {
      id: 1,
      course: 'CS224',
      type: 'Lab work',
      date: '16.03.2025',
      hours: 4,
      instructor: 'Fazlı Can'
    },
    {
      id: 2,
      course: 'CS102',
      type: 'Grading',
      date: '13.03.2025',
      hours: 4,
      instructor: 'Uğur Güdükbay'
    },
    {
      id: 7,
      course: 'CS224',
      type: 'Lab work',
      date: '20.03.2025',
      hours: 4,
      instructor: 'Fazlı Can'
    },
    {
      id: 8,
      course: 'CS550',
      type: 'Office hours',
      date: '15.03.2025',
      hours: 4,
      instructor: 'Mehmet Yılmaz'
    }
  ]);
  
  const [approvedWorkloads, setApprovedWorkloads] = useState([
    {
      id: 3,
      course: 'CS224',
      type: 'Lab work',
      date: '02.03.2025',
      hours: 4,
      instructor: 'Fazlı Can'
    },
    {
      id: 4,
      course: 'CS102',
      type: 'Grading',
      date: '07.03.2025',
      hours: 4,
      instructor: 'Uğur Güdükbay'
    },
    {
      id: 5,
      course: 'CS224',
      type: 'Lab work',
      date: '12.02.2025',
      hours: 4,
      instructor: 'Fazlı Can'
    },
    {
      id: 6,
      course: 'CS102',
      type: 'Grading',
      date: '17.02.2025',
      hours: 4,
      instructor: 'Uğur Güdükbay'
    },
    {
      id: 9,
      course: 'CS550',
      type: 'Office hours',
      date: '25.02.2025',
      hours: 4,
      instructor: 'Mehmet Yılmaz'
    },
    {
      id: 10,
      course: 'EEE586',
      type: 'Lab work',
      date: '10.02.2025',
      hours: 4,
      instructor: 'Ayşe Demir'
    },
    {
      id: 11,
      course: 'MATH301',
      type: 'Recitation',
      date: '05.02.2025',
      hours: 4,
      instructor: 'Kemal Öztürk'
    },
    {
      id: 12,
      course: 'PHYS210',
      type: 'Lab work',
      date: '15.02.2025',
      hours: 4,
      instructor: 'Zeynep Kaya'
    },
    {
      id: 13,
      course: 'HIST220',
      type: 'Recitation',
      date: '20.02.2025',
      hours: 4,
      instructor: 'Ali Yılmaz'
    },
    {
      id: 14,
      course: 'BIO110',
      type: 'Lab work',
      date: '28.02.2025',
      hours: 4,
      instructor: 'Selin Demir'
    }
  ]);

  // Function to handle opening the popup
  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  // Function to handle closing the popup
  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  // Function to handle form submission
  const handleSubmitWorkload = (formData) => {
    // Extract instructor name from email (just for demo)
    const instructorName = formData.instructorEmail.split('@')[0].split('.').map(
      part => part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');

    // Format date from YYYY-MM-DD to DD.MM.YYYY
    const dateObj = new Date(formData.date);
    const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}.${(dateObj.getMonth() + 1).toString().padStart(2, '0')}.${dateObj.getFullYear()}`;

    // Create new workload object
    const newWorkload = {
      id: Date.now(), // Use timestamp as ID
      course: formData.courseCode,
      type: formData.workloadType,
      date: formattedDate,
      hours: parseInt(formData.hours),
      instructor: instructorName
    };

    // Add to waiting workloads
    setWaitingWorkloads(prev => [newWorkload, ...prev]);
  };

  // Function to render the proper icon based on workload type
  const renderWorkloadIcon = (type) => {
    const typeLC = type.toLowerCase();
    if (typeLC.includes('lab')) {
      return <div className="flask-icon"></div>;
    } else if (typeLC.includes('grading')) {
      return <div className="pencil-icon"></div>;
    } else if (typeLC.includes('recitation')) {
      return <div className="presentation-icon"></div>;
    } else if (typeLC.includes('office')) {
      return <div className="clock-icon"></div>;
    } else {
      return <div className="default-icon"></div>;
    }
  };

  const renderWorkloadList = (workloads, isWaiting = false) => {
    return workloads.map((workload) => (
      <div key={workload.id} className="workload-item">
        <div className="workload-details">
          <div className="course-info">{workload.course} - {workload.type}</div>
          <div className="workload-meta">
            <span>{workload.date}</span>
            <span> - </span>
            <span>{workload.hours} hours</span>
          </div>
          <div className="instructor">Instructor: {workload.instructor}</div>
        </div>
        <div className="workload-actions">
          <div className="workload-type-icon">
            {renderWorkloadIcon(workload.type)}
          </div>
        </div>
      </div>
    ));
  };

  const totalApprovedHours = approvedWorkloads.reduce((sum, workload) => sum + workload.hours, 0);
  const totalWaitingHours = waitingWorkloads.reduce((sum, workload) => sum + workload.hours, 0);

  return (
    <div className="ta-main-page">
      <NavBar />
      <main className="main-content workload-main">
        <div className="workload-stats-vertical">
          <div className="stat-container">
            <div className="stat-item">
              <div className="stat-label">Total Approved Workload Hours</div>
              <div className="circle approved">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path 
                    className="circle-bg" 
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path 
                    className="circle"
                    strokeDasharray={`${totalApprovedHours}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="percentage">{totalApprovedHours}</text>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="middle-stat">
            <div className="stat-item">
              <div className="stat-label">Total Waiting Workload Hours</div>
              <div className="circle waiting">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path 
                    className="circle-bg" 
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path 
                    className="circle"
                    strokeDasharray={`${totalWaitingHours}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="percentage">{totalWaitingHours}</text>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="add-workload-container">
            <div className="stat-item add-workload">
              <div className="stat-label">Add Workload</div>
              <div className="circle add" onClick={handleOpenPopup}>
                <span className="add-icon">+</span>
              </div>
            </div>
          </div>
        </div>

        <div className="workload-lists">
          <div className="workload-list-container">
            <h2>Waiting For Approval</h2>
            <div className="workload-content">
              {renderWorkloadList(waitingWorkloads, true)}
            </div>
          </div>
          <div className="workload-list-container">
            <h2>Approved Workloads</h2>
            <div className="workload-content">
              {renderWorkloadList(approvedWorkloads)}
            </div>
          </div>
        </div>
      </main>

      {/* Add Workload Popup */}
      <AddWorkloadPopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        onSubmit={handleSubmitWorkload}
      />
    </div>
  );
};

export default TAWorkloadPage;