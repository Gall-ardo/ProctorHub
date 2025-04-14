import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WeeklySchedule from './WeeklySchedule';
import ProctorSwapForum from './ProctorSwapForum';
import './TAMainPage.css';
import TANavBar from './TANavBar';


const TAMainPage = () => {
  const [currentWeek, setCurrentWeek] = useState(getWeekDates());
  const [myScheduleEvents, setMyScheduleEvents] = useState([]);
  const [swapRequests, setSwapRequests] = useState([]);

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

  // Initialize MY schedule events - this is what appears in MY calendar
  useEffect(() => {
    // These are MY schedule events (for the weekly schedule)
    const myEvents = [
      {
        id: 1,
        title: 'CS550',
        examDate: '25/03/2025',
        startTime: 10,
        endTime: 12.5,
        color: 'blue',
        isExam: false
      },
      {
        id: 2,
        title: 'EEE586',
        examDate: '28/03/2025',
        startTime: 8.5,
        endTime: 10.5,
        color: 'blue',
        isExam: false
      },
      {
        id: 3,
        title: 'EEE586',
        examDate: '24/03/2025',
        startTime: 13.5,
        endTime: 15.5,
        color: 'blue',
        isExam: false // Just a course session
      },
      {
        id: 4,
        title: 'CS202 - Proctoring',
        examDate: '29/03/2025',
        startTime: 15,
        endTime: 18,
        color: 'red',
        isExam: true
      },
      {
        id: 5,
        title: 'CS550',
        examDate: '28/03/2025',
        startTime: 15.5,
        endTime: 17.5,
        color: 'blue',
        isExam: false // Course review session
      },
      // Additional exams
      {
        id: 6,
        title: 'MATH301 - Proctoring',
        examDate: '22/03/2025',
        startTime: 9,
        endTime: 11,
        color: 'red',
        isExam: true
      },
      {
        id: 7,
        title: 'PHYS210 - Proctoring',
        examDate: '26/03/2025',
        startTime: 14,
        endTime: 16,
        color: 'red',
        isExam: true
      },
      {
        id: 8,
        title: 'HIST220 - Proctoring',
        examDate: '27/03/2025',
        startTime: 11,
        endTime: 13,
        color: 'red',
        isExam: true
      },
      {
        id: 9,
        title: 'BIO110 - Proctoring',
        examDate: '30/03/2025',
        startTime: 10.5,
        endTime: 12.5,
        color: 'red',
        isExam: true
      },
      {
        id: 10,
        title: 'STAT205 - Proctoring',
        examDate: '31/03/2025',
        startTime: 13,
        endTime: 15,
        color: 'red',
        isExam: true
      }
    ];
    
    setMyScheduleEvents(myEvents);
  }, []);

  // Initialize swap requests from OTHER TAs
  useEffect(() => {
    // Mock data for swap requests from other TAs
    const mockSwapRequests = [
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
        availableTimeEnd: '01/04/2025' // Time window end
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
        availableTimeEnd: '04/04/2025' // Time window end
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
        availableTimeEnd: '01/04/2025' // Time window end
      }
    ];
    
    setSwapRequests(mockSwapRequests);
  }, []);

  return (
    <div className="ta-main-page-main-page">
      <TANavBar />
      
      <main className="ta-main-page-main-content">
        <WeeklySchedule 
          weekDates={currentWeek} 
          events={myScheduleEvents} 
        />
        <div className="ta-main-page-side-panel">
          <ProctorSwapForum 
            scheduleEvents={myScheduleEvents}
            swapRequests={swapRequests}
          />
        </div>
      </main>
    </div>
  );
};

export default TAMainPage;