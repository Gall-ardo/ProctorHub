import React, { useState } from 'react';
import './TASwapExamDetailsPopup.css';

const TASwapExamDetailsPopup = ({ isOpen, onClose, examDetails, userExams = [] }) => {
  const [selectedExam, setSelectedExam] = useState(null);

  // Handle exam selection
  const handleExamSelection = (exam) => {
    setSelectedExam(exam.id === selectedExam ? null : exam.id);
  };

  // Handle swap button click
  const handleSwap = () => {
    if (selectedExam) {
      console.log(`Swapping ${examDetails.course} with user exam ID: ${selectedExam}`);
      // Here you would make an API call to process the swap
      onClose();
    }
  };

  if (!isOpen || !examDetails) return null;

  return (
    <div className="ta-exam-details-overlay">
      <div className="ta-exam-details-modal">
        <div className="ta-exam-details-close">
          <button onClick={onClose}>×</button>
        </div>
        
        <div className="ta-exam-details-content">
          {/* Exam details section */}
          <div className="ta-exam-details-info">
            <h2>{examDetails.course} Midterm Exam</h2>
            <div className="ta-exam-details-meta">
              <div className="ta-exam-details-row">
                <div>{examDetails.date}</div>
                <div>{examDetails.time}</div>
              </div>
              <div className="ta-exam-details-classroom">
                Classrooms: {examDetails.classroom || examDetails.classrooms}
              </div>
              {examDetails.requestedBy && (
                <div className="ta-exam-details-requested-by">
                  Requested by: {examDetails.requestedBy}
                </div>
              )}
            </div>
          </div>
          
          {/* Possible exams to swap section */}
          <div className="ta-exam-details-possible-exams">
            <h3>Possible Exams to Swap</h3>
            <div className="ta-exam-details-exam-list">
              {userExams.map((exam) => (
                <div 
                  key={exam.id} 
                  className={`ta-exam-details-exam-item ${selectedExam === exam.id ? 'selected' : ''}`}
                  onClick={() => handleExamSelection(exam)}
                >
                  <div className="ta-exam-details-exam-info">
                    {exam.course} / {exam.date} / {exam.time}
                  </div>
                  <div className="ta-exam-details-exam-radio">
                    {selectedExam === exam.id ? (
                      <div className="radio-selected"></div>
                    ) : (
                      <div className="radio-unselected"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Swap button */}
          <div className="ta-exam-details-actions">
            <button 
              className="ta-exam-details-swap-button" 
              onClick={handleSwap}
              disabled={!selectedExam}
            >
              Swap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TASwapExamDetailsPopup;