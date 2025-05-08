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
  const [swapRequests, setSwapRequests] = useState([]);
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


  // Fetch swap requests
  const fetchSwapRequests = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // This API endpoint needs to be implemented on the backend
      const response = await axios.get(`${API_URL}/ta/proctoring/swap-requests`, getAuthHeaders());
      
      if (response.data.success) {
        setSwapRequests(response.data.data);
      } else {
        console.warn('Failed to fetch swap requests:', response.data.message);
        // Fall back to demo data
        setSwapRequests(getMockSwapRequests());
      }
    } catch (err) {
      console.error('Error fetching swap requests:', err);
      // Fall back to demo data
      setSwapRequests(getMockSwapRequests());
    }
  };

  // Handle date change in the weekly schedule
  const handleDateChange = (newDate) => {
    setCurrentDate(newDate);
  };

  // Initialize on component mount
  useEffect(() => {
    fetchScheduleData();
    fetchSwapRequests();
    
    // Set up auto-refresh every 5 minutes
    const intervalId = setInterval(() => {
      fetchScheduleData();
      fetchSwapRequests();
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
              <ProctorSwapForum 
                scheduleEvents={myScheduleEvents.filter(event => event.isExam)}
                swapRequests={swapRequests}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

// Mock swap requests for development
const getMockSwapRequests = () => {
  return [
    {
      id: 1,
      requesterName: 'Sude Ergün',
      exam: {
        id: 101,
        examDate: '30/03/2025',
        title: 'CS202 Midterm Exam',
        startTime: 15,
        endTime: 18,
        course: { code: 'CS202', name: 'Algorithms' },
        examRooms: ['B201', 'B202', 'B203'],
        proctorNum: 4,
        manualAssignedTAs: 2,
        autoAssignedTAs: 2
      },
      requestDate: new Date('2025-03-15T10:30:00'),
      availableTimeStart: '02/04/2025', // Time window start
      availableTimeEnd: '02/04/2025'     // Time window end
    },
    {
      id: 2,
      requesterName: 'Ahmet Yılmaz',
      exam: {
        id: 102,
        examDate: '31/03/2025',
        title: 'MATH301 Midterm Exam',
        startTime: 9,
        endTime: 11,
        course: { code: 'MATH301', name: 'Linear Algebra' },
        examRooms: ['EA101', 'EA102'],
        proctorNum: 3,
        manualAssignedTAs: 1,
        autoAssignedTAs: 2
      },
      requestDate: new Date('2025-03-16T14:20:00'),
      availableTimeStart: '30/03/2025', // Time window start
      availableTimeEnd: '01/04/2025'    // Time window end
    },
    {
      id: 3,
      requesterName: 'Zeynep Kaya',
      exam: {
        id: 103,
        examDate: '30/03/2025',
        title: 'BIO110 Midterm Exam',
        startTime: 10.5,
        endTime: 12.5,
        course: { code: 'BIO110', name: 'Biology' },
        examRooms: ['A101', 'A102'],
        proctorNum: 3,
        manualAssignedTAs: 2,
        autoAssignedTAs: 1
      },
      requestDate: new Date('2025-03-17T09:15:00'),
      availableTimeStart: '31/03/2025', // Time window start
      availableTimeEnd: '04/04/2025'    // Time window end
    },
    {
      id: 4,
      requesterName: 'Mehmet Yıldız',
      exam: {
        id: 104,
        examDate: '31/03/2025',
        title: 'PHYS210 Midterm Exam',
        startTime: 14,
        endTime: 16,
        course: { code: 'PHYS210', name: 'Physics' },
        examRooms: ['B301', 'B302'],
        proctorNum: 2,
        manualAssignedTAs: 1,
        autoAssignedTAs: 1
      },
      requestDate: new Date('2025-03-18T11:45:00'),
      availableTimeStart: '30/03/2025', // Time window start
      availableTimeEnd: '01/04/2025'    // Time window end
    }
  ];
};

export default TAMainPage;