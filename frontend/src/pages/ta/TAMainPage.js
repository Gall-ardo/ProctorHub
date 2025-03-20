import React, { useState, useEffect } from 'react';
import WeeklySchedule from './WeeklySchedule';
import ProctorSwapForum from './ProctorSwapForum';
import './TAMainPage.css';

const TAMainPage = () => {
  const [currentWeek, setCurrentWeek] = useState(getWeekDates());
  const [upcomingExams, setUpcomingExams] = useState([]);

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    // Simulating API call to fetch exams
    const mockExams = [
      {
        id: 1,
        course: { code: 'CS202', name: 'Algorithms' },
        date: new Date('2025-03-16T13:00:00'),
        duration: 180, // in minutes
        examType: 'Midterm Exam',
        proctorNum: 4,
        manualAssignedTAs: 2,
        autoAssignedTAs: 2,
        proctors: [],
        examRooms: []
      },
      {
        id: 2,
        course: { code: 'GE301', name: 'Economics' },
        date: new Date('2025-03-19T10:00:00'),
        duration: 180, // in minutes
        examType: 'Midterm Exam',
        proctorNum: 3,
        manualAssignedTAs: 1,
        autoAssignedTAs: 2,
        proctors: [],
        examRooms: []
      }
    ];
    
    setUpcomingExams(mockExams);
  }, []);

  // Get dates for current week (Mon-Sun)
  function getWeekDates() {
    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const diff = currentDay === 0 ? 6 : currentDay - 1; // Adjust to make Monday the first day
    
    const monday = new Date(now);
    monday.setDate(now.getDate() - diff);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      weekDates.push(day);
    }
    
    return weekDates;
  }

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    }).replace(/\//g, '.');
  };

  // Format time for display
  const formatTime = (date, durationMins = 0) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    const formattedStart = `${hours.toString().padStart(2, '0')}.${minutes.toString().padStart(2, '0')}`;
    
    if (durationMins) {
      const endDate = new Date(date);
      endDate.setMinutes(endDate.getMinutes() + durationMins);
      const endHours = endDate.getHours();
      const endMinutes = endDate.getMinutes();
      const formattedEnd = `${endHours.toString().padStart(2, '0')}.${endMinutes.toString().padStart(2, '0')}`;
      return `${formattedStart}-${formattedEnd}`;
    }
    
    return formattedStart;
  };

  return (
    <div className="ta-main-page">
      <header className="header">
        <div className="logo-area">
        <img src="/university-logo.png" alt="University Logo" className="logo" />
        </div>
        <nav className="main-nav">
          <ul>
            <li className="active"><a href="#">Home</a></li>
            <li><a href="#">Workload</a></li>
            <li><a href="#">Proctoring</a></li>
            <li><a href="#">Leave of Absence</a></li>
            <li><a href="#">Swap</a></li>
          </ul>
        </nav>
        <div className="user-actions">
          <button className="notification-btn">
            <i className="notification-icon"></i>
          </button>
          <button className="profile-btn">
            <i className="profile-icon"></i>
          </button>
        </div>
      </header>

      <main className="main-content">
        <WeeklySchedule weekDates={currentWeek} />
        
        <div className="side-panel">
          <ProctorSwapForum upcomingExams={upcomingExams} />
        </div>
      </main>
    </div>
  );
};

export default TAMainPage;