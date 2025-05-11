import React, { useState, useEffect } from 'react';
import './WeeklySchedule.css';

const WeeklySchedule = ({ events = [], currentDate = new Date(), onDateChange }) => {
  // State to hold the current week dates
  const [weekDates, setWeekDates] = useState([]);
  // State to hold the filtered events for the current week
  const [scheduleEvents, setScheduleEvents] = useState([]);
  // State to track the current date internally if no external state is provided
  const [internalCurrentDate, setInternalCurrentDate] = useState(currentDate);
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    
    // Process events to determine which ones fall in the current week
    if (events && events.length > 0) {
      const processedEvents = events.map(event => {
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
      setLoading(false);
    } else {
      setScheduleEvents([]);
      setLoading(false);
    }
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

  // Get the appropriate CSS class for an event based on its type
  const getEventClass = (event) => {
    let baseClass = 'ta-main-page-weekly-schedule-schedule-event';
    
    if (event.isExam) {
      return `${baseClass} red`; // Red for exams
    } else if (event.isOffering) {
      return `${baseClass} green`; // Green for course offerings
    } else {
      return `${baseClass} ${event.color || 'blue'}`;
    }
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

  // Format the week range for display (e.g., "Mar 22 - Mar 28, 2025")
  const formatWeekRange = () => {
    if (weekDates.length === 0) return '';
    
    const startDate = weekDates[0];
    const endDate = weekDates[6];
    
    const options = { month: 'short', day: 'numeric' };
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}, ${endDate.getFullYear()}`;
  };

  return (
    <div className="ta-main-page-weekly-schedule-weekly-schedule-container">
      <div className="ta-main-page-weekly-schedule-weekly-schedule-header">
        <h2>Weekly Schedule</h2>
        <div className="ta-main-page-weekly-schedule-week-navigation">
          <button onClick={goToPreviousWeek}>Previous Week</button>
          <button onClick={goToCurrentWeek}>Current Week</button>
          <button onClick={goToNextWeek}>Next Week</button>
        </div>
      </div>
      
      {loading ? (
        <div className="ta-main-page-weekly-schedule-loading">Loading schedule...</div>
      ) : error ? (
        <div className="ta-main-page-weekly-schedule-error">{error}</div>
      ) : (
        <div className="ta-main-page-weekly-schedule-weekly-schedule">
          <div className="ta-main-page-weekly-schedule-schedule-header">
            <div className="ta-main-page-weekly-schedule-time-column-header"></div>
            {weekDates.map((date, index) => (
              <div 
                key={index} 
                className={`ta-main-page-weekly-schedule-day-column-header ${isToday(date) ? 'today' : ''}`}
              >
                <div className="ta-main-page-weekly-schedule-day-name">{dayNames[index]}</div>
                <div className="ta-main-page-weekly-schedule-day-number">{formatDateNumber(date)}</div>
              </div>
            ))}
          </div>
          
          <div className="ta-main-page-weekly-schedule-schedule-body">
            <div className="ta-main-page-weekly-schedule-time-column">
              {timeSlots.map(time => (
                <React.Fragment key={time}>
                  <div className="ta-main-page-weekly-schedule-time-slot">
                    <span>{formatHour(time)}</span>
                  </div>
                  <div className="ta-main-page-weekly-schedule-time-slot half-hour"></div>
                </React.Fragment>
              ))}
            </div>
            
            <div className="ta-main-page-weekly-schedule-day-columns-container">
              {weekDates.map((date, dayIndex) => (
                <div key={dayIndex} className="ta-main-page-weekly-schedule-day-column">
                  {/* Grid cells for the time slots */}
                  {timeSlots.map(time => (
                    <React.Fragment key={`${dayIndex}-${time}`}>
                      <div className="ta-main-page-weekly-schedule-schedule-cell"></div>
                      <div className="ta-main-page-weekly-schedule-schedule-cell half-hour"></div>
                    </React.Fragment>
                  ))}
                  
                  {/* Events as absolute positioned elements */}
                  {scheduleEvents
                    .filter(event => event.isVisible && event.day === dayIndex)
                    .map(event => (
                      <div
                        key={`event-${event.id}`}
                        className={getEventClass(event)}
                        style={{
                          position: 'absolute',
                          top: `${getEventTopPosition(event)}px`,
                          height: `${getEventHeight(event)}px`,
                          width: 'calc(100% - 4px)',
                          margin: '0 2px'
                        }}
                        title={`${event.title}
Date: ${event.examDate}
Time: ${Math.floor(event.startTime)}:${(event.startTime % 1) * 60 || '00'} - ${Math.floor(event.endTime)}:${(event.endTime % 1) * 60 || '00'}
${event.description ? `${event.description}` : ''}
${event.rooms ? `Rooms: ${event.rooms}` : ''}`}
                      >
                        <div className="ta-main-page-weekly-schedule-event-title">{event.title}</div>
                        {event.endTime - event.startTime >= 1 && event.rooms && (
                          <div className="ta-main-page-weekly-schedule-event-details">
                            <div className="ta-main-page-weekly-schedule-event-location">{event.rooms}</div>
                          </div>
                        )}
                      </div>
                    ))
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklySchedule;