import React, { useState } from 'react';
import './TAPersonalSwapRequest.css';

const TAPersonalSwapRequest = ({ isOpen, onClose, currentUserExams = [] }) => {
  const [taEmail, setTaEmail] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedExam, setSelectedExam] = useState(null);

  // Sample exams for the user to choose from (replace with your actual data)
  const exams = currentUserExams.length > 0 ? currentUserExams : [
    { id: 1, course: 'CS201', date: '25.03.2025', time: '13.00-16.00' },
    { id: 2, course: 'MATH102', date: '22.03.2025', time: '18.00-21.00' },
    { id: 3, course: 'CS101', date: '27.03.2025', time: '15.00-18.00' }
  ];

  const handleSubmit = () => {
    // Process the form submission
    const requestData = {
      taEmail,
      dateRange: { startDate, endDate },
      selectedExam
    };
    
    console.log('Submitting swap request:', requestData);
    
    // Here you would typically make an API call to submit the request
    
    // Reset form and close modal
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTaEmail('');
    setStartDate('');
    setEndDate('');
    setSelectedExam(null);
  };

  const handleExamSelection = (exam) => {
    setSelectedExam(exam.id === selectedExam ? null : exam.id);
  };

  if (!isOpen) return null;

  return (
    <div className="ta-personal-swap-overlay">
      <div className="ta-personal-swap-modal">
        <div className="ta-personal-swap-header">
          <h2 className="ta-personal-swap-title">Send Personal Swap Request</h2>
          <button className="ta-personal-swap-close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="ta-personal-swap-content">
          {/* TA Email Input */}
          <div className="ta-personal-swap-section">
            <label className="ta-personal-swap-label">TA Email</label>
            <input 
              type="email" 
              className="ta-personal-swap-input" 
              placeholder="Enter TA e-mail" 
              value={taEmail} 
              onChange={(e) => setTaEmail(e.target.value)} 
            />
          </div>
          
          {/* Date Selection */}
          <div className="ta-personal-swap-section">
            <label className="ta-personal-swap-label">Select date</label>
            <div className="ta-personal-swap-date-container">
              <div className="ta-personal-swap-date-header">
              </div>
              
              <div className="ta-personal-swap-date-inputs">
                <div className="ta-personal-swap-date-fields">
                  <div className="ta-personal-swap-date-field">
                    <div className="ta-personal-swap-date-label">Start date</div>
                    <div className="ta-personal-swap-input-with-icon">
                      <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)}  
                      />
                    </div>
                  </div>
                  <div className="ta-personal-swap-date-field">
                    <div className="ta-personal-swap-date-label">End date</div>
                    <div className="ta-personal-swap-input-with-icon">
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
          <div className="ta-personal-swap-section">
            <label className="ta-personal-swap-label">Exam to Swap</label>
            <div className="ta-personal-swap-exam-list">
              {exams.map((exam) => (
                <div 
                  key={exam.id} 
                  className={`ta-personal-swap-exam-item ${selectedExam === exam.id ? 'selected' : ''}`}
                  onClick={() => handleExamSelection(exam)}
                >
                  <div className="ta-personal-swap-exam-info">
                    {exam.course} / {exam.date} / {exam.time}
                  </div>
                  <div className="ta-personal-swap-exam-radio">
                    {selectedExam === exam.id ? <div className="radio-selected"></div> : <div className="radio-unselected"></div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="ta-personal-swap-footer">
          <button 
            className="ta-personal-swap-submit-button" 
            onClick={handleSubmit}
            disabled={!taEmail || !selectedExam}
          >
            Send Personal Swap Request
          </button>
        </div>
      </div>
    </div>
  );
};


export default TAPersonalSwapRequest;