import React from 'react';
import './ProctorSwapForum.css';

const ProctorSwapForum = ({ upcomingExams }) => {
  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '.');
  };

  // Format time for display
  const formatTime = (date, durationMins = 0) => {
    const startTime = `${date.getHours().toString().padStart(2, '0')}.${date.getMinutes().toString().padStart(2, '0')}`;
    
    if (durationMins) {
      const endDate = new Date(date);
      endDate.setMinutes(endDate.getMinutes() + durationMins);
      const endTime = `${endDate.getHours().toString().padStart(2, '0')}.${endDate.getMinutes().toString().padStart(2, '0')}`;
      return `${startTime}-${endTime}`;
    }
    
    return startTime;
  };

  return (
    <div className="proctor-swap-forum">
      <h2>Proctoring Swap Forum</h2>
      
      <div className="upcoming-exams">
        {upcomingExams.map(exam => (
          <div key={exam.id} className="exam-card">
            <div className="exam-header">
              <div className="course-code">{exam.course.code} {exam.examType}</div>
              <button className="info-button">i</button>
            </div>
            
            <div className="exam-details">
              <div className="exam-date">{formatDate(exam.date)}</div>
              <div className="exam-time">{formatTime(exam.date, exam.duration)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProctorSwapForum;