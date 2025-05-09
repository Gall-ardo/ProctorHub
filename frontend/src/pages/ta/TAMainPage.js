import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import WeeklySchedule from './WeeklySchedule';
import ProctorSwapForum from './ProctorSwapForum';
import './TAMainPage.css';
import TANavBar from './TANavBar';

const TAMainPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [myScheduleEvents, setMyScheduleEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up axios with authentication
  const API_URL = 'http://localhost:5001/api';
  
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
  };

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await axios.get(`${API_URL}/ta/schedule/combined`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setMyScheduleEvents(response.data.data);
        setError(null);
      } else {
        setError(response.data.message || 'Failed to fetch schedule');
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setError('Failed to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle date change in the weekly schedule
  const handleDateChange = (newDate) => {
    setCurrentDate(newDate);
  };

  // Initialize on component mount
  useEffect(() => {
    fetchScheduleData();
    
    // Set up auto-refresh every 5 minutes
    const intervalId = setInterval(() => {
      fetchScheduleData();
    }, 300000); // 5 minutes
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="ta-main-page-main-page">
      <TANavBar />
      
      <main className="ta-main-page-main-content">
        {loading ? (
          <div className="ta-main-page-loading">Loading schedule...</div>
        ) : error ? (
          <div className="ta-main-page-error">
            <p>{error}</p>
            <button onClick={fetchScheduleData}>Try Again</button>
          </div>
        ) : (
          <>
            <WeeklySchedule 
              events={myScheduleEvents}
              currentDate={currentDate}
              onDateChange={handleDateChange}
            />
            <div className="ta-main-page-side-panel">
              {/* Using our updated ProctorSwapForum component with real API data */}
              <ProctorSwapForum 
                scheduleEvents={myScheduleEvents.filter(event => event.isExam)}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default TAMainPage;