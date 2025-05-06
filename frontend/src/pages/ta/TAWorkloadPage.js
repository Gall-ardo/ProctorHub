import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TAWorkloadPage.css';
import AddWorkloadPopup from './AddWorkloadPopup';
import TANavBar from './TANavBar';
import axios from 'axios';

const TAWorkloadPage = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [waitingWorkloads, setWaitingWorkloads] = useState([]);
  const [approvedWorkloads, setApprovedWorkloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:5001/api';

  useEffect(() => {
    const fetchWorkloads = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        console.log('Fetching workloads with token:', token ? 'exists' : 'missing');

        const pendingResponse = await axios.get(`${API_URL}/ta/workloads/pending`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const approvedResponse = await axios.get(`${API_URL}/ta/workloads/approved`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (pendingResponse.data.success && approvedResponse.data.success) {
          const formatWorkload = (workload) => {
            const date = new Date(workload.date);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
            const hours = Math.round(workload.duration);
          
            const instructor = workload.instructor?.email || 'Unknown';
          
            return {
              id: workload.id,
              course: workload.Course?.courseCode || 'Unknown',
              type: workload.taskType,
              date: formattedDate,
              hours: hours,
              instructor: instructor
            };
          };
          
          

          setWaitingWorkloads(pendingResponse.data.data.map(formatWorkload));
          setApprovedWorkloads(approvedResponse.data.data.map(formatWorkload));
        } else {
          setError('Failed to fetch workload data');
        }
      } catch (err) {
        console.error('Error fetching workloads:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkloads();
  }, []);

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleSubmitWorkload = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      console.log('Submitting workload with token:', token ? 'exists' : 'missing');

      const response = await axios.post(`${API_URL}/ta/workloads`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const workloadData = response.data.data;

        const instructorName = formData.instructorEmail
          .split('@')[0]
          .split('.')
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');

        const dateObj = new Date(formData.date);
        const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}.${(dateObj.getMonth() + 1).toString().padStart(2, '0')}.${dateObj.getFullYear()}`;

        const newWorkload = {
          id: workloadData.id,
          course: formData.courseId,
          type: formData.workloadType,
          date: formattedDate,
          hours: parseInt(formData.hours),
          instructor: instructorName,
        };

        setWaitingWorkloads((prev) => [newWorkload, ...prev]);
      } else {
        alert(response.data.message || 'Failed to submit workload request');
      }
    } catch (err) {
      console.error('Error submitting workload request:', err);
      alert(err.response?.data?.message || 'An error occurred while submitting the workload request');
    }
  };

  const renderWorkloadIcon = (type) => {
    const typeLC = type.toLowerCase();
    if (typeLC.includes('lab')) {
      return <div className="ta-workload-page-flask-icon"></div>;
    } else if (typeLC.includes('grading')) {
      return <div className="ta-workload-page-pencil-icon"></div>;
    } else if (typeLC.includes('recitation')) {
      return <div className="ta-workload-page-presentation-icon"></div>;
    } else if (typeLC.includes('office')) {
      return <div className="ta-workload-page-clock-icon"></div>;
    } else {
      return <div className="ta-workload-page-default-icon"></div>;
    }
  };

  const renderWorkloadList = (workloads, isWaiting = false) => {
    return workloads.map((workload) => (
      <div key={workload.id} className="ta-workload-page-workload-item">
        <div className="ta-workload-page-workload-details">
          <div className="ta-workload-page-course-info">{workload.course} - {workload.type}</div>
          <div className="ta-workload-page-workload-meta">
            <span>{workload.date}</span>
            <span> - </span>
            <span>{workload.hours} hours</span>
          </div>
          <div className="ta-workload-page-instructor">Instructor: {workload.instructor}</div>
        </div>
        <div className="ta-workload-page-workload-actions">
          <div className="ta-workload-page-workload-type-icon">
            {renderWorkloadIcon(workload.type)}
          </div>
        </div>
      </div>
    ));
  };

  const totalApprovedHours = approvedWorkloads.reduce((sum, workload) => sum + workload.hours, 0);
  const totalWaitingHours = waitingWorkloads.reduce((sum, workload) => sum + workload.hours, 0);

  return (
    <div className="ta-workload-page-ta-main-page">
      <TANavBar />
      <main className="ta-workload-page-main-content ta-workload-page-workload-main">
        <div className="ta-workload-page-workload-stats-vertical">
          <div className="ta-workload-page-stat-container">
            <div className="ta-workload-page-stat-item">
              <div className="ta-workload-page-stat-label">Total Approved Workload Hours</div>
              <div className="ta-workload-page-circle approved">
                <svg viewBox="0 0 36 36" className="ta-workload-page-circular-chart">
                  <path
                    className="ta-workload-page-circle-bg"
                    d="M18 2.0845
                       a 15.9155 15.9155 0 0 1 0 31.831
                       a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="ta-workload-page-circle"
                    strokeDasharray={`${totalApprovedHours}, 100`}
                    d="M18 2.0845
                       a 15.9155 15.9155 0 0 1 0 31.831
                       a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="ta-workload-page-percentage">{totalApprovedHours}</text>
                </svg>
              </div>
            </div>
          </div>

          <div className="ta-workload-page-middle-stat">
            <div className="ta-workload-page-stat-item">
              <div className="ta-workload-page-stat-label">Total Waiting Workload Hours</div>
              <div className="ta-workload-page-circle waiting">
                <svg viewBox="0 0 36 36" className="ta-workload-page-circular-chart">
                  <path
                    className="ta-workload-page-circle-bg"
                    d="M18 2.0845
                       a 15.9155 15.9155 0 0 1 0 31.831
                       a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="ta-workload-page-circle"
                    strokeDasharray={`${totalWaitingHours}, 100`}
                    d="M18 2.0845
                       a 15.9155 15.9155 0 0 1 0 31.831
                       a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="ta-workload-page-percentage">{totalWaitingHours}</text>
                </svg>
              </div>
            </div>
          </div>

          <div className="ta-workload-page-add-workload-container">
            <div className="ta-workload-page-stat-item ta-workload-page-add-workload">
              <div className="ta-workload-page-stat-label">Add Workload</div>
              <div className="ta-workload-page-circle add" onClick={handleOpenPopup}>
                <span className="ta-workload-page-add-icon">+</span>
              </div>
            </div>
          </div>
        </div>

        <div className="ta-workload-page-workload-lists">
          <div className="ta-workload-page-workload-list-container">
            <h2>Waiting For Approval</h2>
            <div className="ta-workload-page-workload-content">
              {loading ? (
                <div className="ta-workload-page-loading">Loading workloads...</div>
              ) : error ? (
                <div className="ta-workload-page-error">{error}</div>
              ) : waitingWorkloads.length === 0 ? (
                <div className="ta-workload-page-no-workloads">No pending workloads found</div>
              ) : (
                renderWorkloadList(waitingWorkloads, true)
              )}
            </div>
          </div>
          <div className="ta-workload-page-workload-list-container">
            <h2>Approved Workloads</h2>
            <div className="ta-workload-page-workload-content">
              {loading ? (
                <div className="ta-workload-page-loading">Loading workloads...</div>
              ) : error ? (
                <div className="ta-workload-page-error">{error}</div>
              ) : approvedWorkloads.length === 0 ? (
                <div className="ta-workload-page-no-workloads">No approved workloads found</div>
              ) : (
                renderWorkloadList(approvedWorkloads)
              )}
            </div>
          </div>
        </div>
      </main>

      <AddWorkloadPopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        onSubmit={handleSubmitWorkload}
      />
    </div>
  );
};

export default TAWorkloadPage;
