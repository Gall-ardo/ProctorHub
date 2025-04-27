import React, { useState, useEffect } from 'react';
import './DeansOfficeMainPage.css';
import DeansOfficeNavBar from "./DeansOfficeNavBar";

function DeansOfficeMainPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [examEvents, setExamEvents] = useState([]);

    // Days of the week
    const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    // Hours of the day
    const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM to 9 PM

    useEffect(() => {
        // Mock data for exam events - replace with actual API call
        const mockExamEvents = [
            {
                id: 1,
                courseCode: 'CS202',
                date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 11), // Tuesday
                startTime: '09:30',
                endTime: '10:30',
                color: '#00a1e0' // Blue
            },
            {
                id: 2,
                courseCode: 'CS202',
                date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 13), // Thursday
                startTime: '13:00',
                endTime: '15:00',
                color: '#00a1e0' // Blue
            },
            {
                id: 3,
                courseCode: 'CS101',
                date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10), // Monday
                startTime: '10:00',
                endTime: '12:00',
                color: '#8e44ad' // Purple
            },
            {
                id: 4,
                courseCode: 'CS350',
                date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 12), // Wednesday
                startTime: '15:30',
                endTime: '17:00',
                color: '#8e44ad' // Purple
            },
            {
                id: 5,
                courseCode: 'CS224 - Programming',
                date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15), // Saturday
                startTime: '13:00',
                endTime: '16:00',
                color: '#c1272d' // Red (matches header)
            }
        ];

        setExamEvents(mockExamEvents);
    }, [currentDate]);

    // Function to generate the week dates based on current date
    const getWeekDates = () => {
        const startOfWeek = new Date(currentDate);
        const day = startOfWeek.getDay();

        // Adjust to make Monday the first day (0)
        const diff = day === 0 ? 6 : day - 1;
        startOfWeek.setDate(startOfWeek.getDate() - diff);

        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            return date;
        });
    };

    const weekDates = getWeekDates();

    // Function to check if a date is today
    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    // Function to position an event in the calendar grid
    const getEventPosition = (event) => {
        const eventDate = event.date.getDay();
        // Convert to our week format (Monday is 0)
        const dayIndex = eventDate === 0 ? 6 : eventDate - 1;

        // Get start and end hour for positioning
        const startHour = parseInt(event.startTime.split(':')[0]);
        const startMinute = parseInt(event.startTime.split(':')[1]);
        const endHour = parseInt(event.endTime.split(':')[0]);
        const endMinute = parseInt(event.endTime.split(':')[1]);

        // Calculate top position (hours since 7AM)
        const topPosition = (startHour - 7) + (startMinute / 60);
        // Calculate height (duration in hours)
        const height = (endHour - startHour) + ((endMinute - startMinute) / 60);

        return {
            gridColumn: `${dayIndex + 1} / ${dayIndex + 2}`,
            gridRow: `${Math.floor(topPosition * 4) + 2} / span ${Math.ceil(height * 4)}`,
            backgroundColor: event.color
        };
    };

    return (
        <div className="deansoffice-page">
            <DeansOfficeNavBar/>

            {/* Main Content */}
            <main className="dean-main-content">
                <h1>Upcoming Exams</h1>

                <div className="calendar-container">
                    {/* Calendar Header with Days */}
                    <div className="calendar-header">
                        {weekDates.map((date, index) => (
                            <div key={index} className={`calendar-day ${isToday(date) ? 'today' : ''}`}>
                                <div className="day-name">{daysOfWeek[index]}</div>
                                <div className="day-number">{date.getDate()}</div>
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="calendar-grid">
                        {/* Time Labels */}
                        <div className="time-labels">
                            {hours.map(hour => (
                                <div key={hour} className="hour-label">
                                    {hour % 12 === 0 ? 12 : hour % 12} {hour < 12 ? 'AM' : 'PM'}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Cells */}
                        <div className="calendar-cells">
                            {/* Hour lines */}
                            {hours.map(hour => (
                                <div key={hour} className="hour-line" style={{ gridRow: (hour - 6) * 4 }}></div>
                            ))}

                            {/* Day columns */}
                            {weekDates.map((_, index) => (
                                <div key={index} className="day-column" style={{ gridColumn: index + 1 }}></div>
                            ))}

                            {/* Events */}
                            {examEvents.map(event => {
                                const eventStyle = getEventPosition(event);
                                const timeRange = `${event.startTime.replace(':', ':')} - ${event.endTime.replace(':', ':')}`;

                                return (
                                    <div key={event.id} className="exam-event" style={eventStyle}>
                                        <div className="event-title">{event.courseCode}</div>
                                        <div className="event-time">{timeRange}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default DeansOfficeMainPage;