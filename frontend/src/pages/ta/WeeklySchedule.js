import React, { useState, useEffect } from 'react';
import './WeeklySchedule.css';

const WeeklySchedule = ({ events = [], currentDate = new Date(), onDateChange }) => {
  // State to hold the current week dates
  const [weekDates, setWeekDates] = useState([]);
  // State to hold the filtered events for the current week
  const [scheduleEvents, setScheduleEvents] = useState([]);
  // State to track the current date internally if no external state is provided
  const [internalCurrentDate, setInternalCurrentDate] = useState(currentDate);

  // Use the prop or internal state based on whether onDateChange is provided
  const activeDate = onDateChange ? currentDate : internalCurrentDate;

  // Day names for the header
  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  // Build time slots from 8 AM to 24 PM (midnight)
  const timeSlots = [];
  for (let i = 8; i <= 24; i++) {
    timeSlots.push(i % 24);
  }

  // Calculate the dates for the current week based on the provided date
  const calculateWeekDates = (date) => {
    const day = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const diff = day === 0 ? 6 : day - 1; // Adjust for Monday as first day of week
    
    const monday = new Date(date);
    monday.setDate(date.getDate() - diff);
    monday.setHours(0, 0, 0, 0); // Set to start of day
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(monday);
      currentDay.setDate(monday.getDate() + i);
      weekDays.push(currentDay);
    }
    
    return weekDays;
  };

  // Parse date in DD/MM/YYYY format
  const parseExamDate = (dateStr) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  // Set up week dates on component mount or when activeDate changes
  useEffect(() => {
    const dates = calculateWeekDates(activeDate);
    setWeekDates(dates);
    
    // For demo, just use some hard-coded events with exam dates
    const demoEvents = [
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
    
    // Use provided events if available, otherwise use demo events
    const eventsToUse = events && events.length > 0 ? events : demoEvents;
    
    // Process events to determine which ones fall in the current week
    const processedEvents = eventsToUse.map(event => {
      const eventDate = parseExamDate(event.examDate);
      
      // Check if the event date falls within the current week
      const weekStart = new Date(dates[0]);
      const weekEnd = new Date(dates[6]);
      weekEnd.setHours(23, 59, 59, 999);
      
      // Calculate the day of the week (0-6, where 0 is Monday)
      let day = eventDate.getDay() - 1;
      if (day === -1) day = 6; // Convert Sunday (0) to 6
      
      // Only include events from the current week
      if (eventDate >= weekStart && eventDate <= weekEnd) {
        return {
          ...event,
          day,
          isVisible: true
        };
      }
      
      return {
        ...event,
        isVisible: false
      };
    });
    
    setScheduleEvents(processedEvents);
  }, [activeDate, events]);

  // Helper function to format the date number
  const formatDateNumber = (date) => {
    return date.getDate();
  };

  // Calculate top position for an event (in pixels)
  const getEventTopPosition = (event) => {
    // Calculate how many 30-min slots from the start of the day
    const startHour = Math.floor(event.startTime);
    const startMinutes = (event.startTime - startHour) * 60;
    const startSlot = (startHour - timeSlots[0]) * 2 + (startMinutes >= 30 ? 1 : 0);
    return startSlot * 30; // Each slot is 30px high
  };

  // Helper to calculate the height of an event in rows
  const getEventHeight = (event) => {
    const hoursDuration = event.endTime - event.startTime;
    return hoursDuration * 60; // Each hour is 60px high (2 slots of 30px)
  };

  // Helper to determine if a date is today
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  // Format hour for display
  const formatHour = (hour) => {
    if (hour === 0) return '00:00';
    return `${hour}:00`;
  };

  // Functions for week navigation
  const goToPreviousWeek = () => {
    const prevWeek = new Date(activeDate);
    prevWeek.setDate(activeDate.getDate() - 7);
    
    if (onDateChange) {
      onDateChange(prevWeek);
    } else {
      setInternalCurrentDate(prevWeek);
    }
  };

  const goToNextWeek = () => {
    const nextWeek = new Date(activeDate);
    nextWeek.setDate(activeDate.getDate() + 7);
    
    if (onDateChange) {
      onDateChange(nextWeek);
    } else {
      setInternalCurrentDate(nextWeek);
    }
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    
    if (onDateChange) {
      onDateChange(today);
    } else {
      setInternalCurrentDate(today);
    }
  };

  return (
    <div className="weekly-schedule-container">
      <div className="weekly-schedule-header">
        <h2>Weekly Schedule</h2>
        <div className="week-navigation">
          <button onClick={goToPreviousWeek}>Previous Week</button>
          <button onClick={goToCurrentWeek}>Current Week</button>
          <button onClick={goToNextWeek}>Next Week</button>
        </div>
      </div>
      
      <div className="weekly-schedule">
        <div className="schedule-header">
          <div className="time-column-header"></div>
          {weekDates.map((date, index) => (
            <div 
              key={index} 
              className={`day-column-header ${isToday(date) ? 'today' : ''}`}
            >
              <div className="day-name">{dayNames[index]}</div>
              <div className="day-number">{formatDateNumber(date)}</div>
            </div>
          ))}
        </div>
        
        <div className="schedule-body">
          <div className="time-column">
            {timeSlots.map(time => (
              <React.Fragment key={time}>
                <div className="time-slot">
                  <span>{formatHour(time)}</span>
                </div>
                <div className="time-slot half-hour"></div>
              </React.Fragment>
            ))}
          </div>
          
          <div className="day-columns-container">
            {weekDates.map((date, dayIndex) => (
              <div key={dayIndex} className="day-column">
                {/* Grid cells for the time slots */}
                {timeSlots.map(time => (
                  <React.Fragment key={`${dayIndex}-${time}`}>
                    <div className="schedule-cell"></div>
                    <div className="schedule-cell half-hour"></div>
                  </React.Fragment>
                ))}
                
                {/* Events as absolute positioned elements */}
                {scheduleEvents
                  .filter(event => event.isVisible && event.day === dayIndex)
                  .map(event => (
                    <div
                      key={`event-${event.id}`}
                      className={`schedule-event ${event.color || 'blue'}`}
                      style={{
                        position: 'absolute',
                        top: `${getEventTopPosition(event)}px`,
                        height: `${getEventHeight(event)}px`,
                        width: 'calc(100% - 4px)',
                        margin: '0 2px'
                      }}
                      title={`Exam Date: ${event.examDate}`}
                    >
                      {event.title}
                    </div>
                  ))
                }
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklySchedule;