import React, { useState } from 'react';
import './TASubmitForumRequest.css';

const TASubmitForumRequest = ({ isOpen, onClose, userExams = [] }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedExam, setSelectedExam] = useState(null);

  // Handle exam selection
  const handleExamSelection = (exam) => {
    setSelectedExam(exam.id === selectedExam ? null : exam.id);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (selectedExam) {
      console.log('Submitting swap request to forum:', {
        dateRange: { startDate, endDate },
        examId: selectedExam
      });
      
      // Here you would make an API call to submit the request to the forum
      
      // Reset form and close modal
      resetForm();
      onClose();
    }
  };

  // Reset form fields
  const resetForm = () => {
    setStartDate('');
    setEndDate('');
    setSelectedExam(null);
  };

  if (!isOpen) return null;

  return (
    <div className="ta-submit-forum-overlay">
      <div className="ta-submit-forum-modal">
        <div className="ta-submit-forum-header">
          <h2 className="ta-submit-forum-title">Submit Swap Request to Forum</h2>
          <button className="ta-submit-forum-close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="ta-submit-forum-content">
          {/* Date Selection */}
          <div className="ta-submit-forum-section">
            <label className="ta-submit-forum-label">Select date</label>
            <div className="ta-submit-forum-date-container">
              <div className="ta-submit-forum-date-header">
                <span>Enter available dates</span>
              </div>
              
              <div className="ta-submit-forum-date-inputs">
                <div className="ta-submit-forum-date-fields">
                  <div className="ta-submit-forum-date-field">
                    <div className="ta-submit-forum-date-label">Start date</div>
                    <div className="ta-submit-forum-input-with-icon">
                      <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                      />
                    </div>
                  </div>
                  <div className="ta-submit-forum-date-field">
                    <div className="ta-submit-forum-date-label">End date</div>
                    <div className="ta-submit-forum-input-with-icon">
                      <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Exam Selection */}
          <div className="ta-submit-forum-section">
            <label className="ta-submit-forum-label">Exam to Swap</label>
            <div className="ta-submit-forum-exam-list">
              {userExams.map((exam) => (
                <div 
                  key={exam.id} 
                  className={`ta-submit-forum-exam-item ${selectedExam === exam.id ? 'selected' : ''}`}
                  onClick={() => handleExamSelection(exam)}
                >
                  <div className="ta-submit-forum-exam-info">
                    {exam.course} / {exam.date} / {exam.time}
                  </div>
                  <div className="ta-submit-forum-exam-radio">
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
        </div>
        
        <div className="ta-submit-forum-footer">
          <button 
            className="ta-submit-forum-submit-button" 
            onClick={handleSubmit}
            disabled={!selectedExam || !startDate || !endDate}
          >
            Submit Swap Request to Forum
          </button>
        </div>
      </div>
    </div>
  );
};

export default TASubmitForumRequest;