import React, { useState } from 'react';
import './AddWorkloadPopup.css';

const AddWorkloadPopup = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    instructorEmail: '',
    courseCode: '',
    date: '',
    hours: '04',
    minutes: '00',
    workloadType: 'Lab Work'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <h2>Add Workload</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Instructor Email</label>
            <input
              type="email"
              name="instructorEmail"
              placeholder="Enter instructor e-mail"
              value={formData.instructorEmail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Course Code</label>
            <input
              type="text"
              name="courseCode"
              placeholder="Enter course code"
              value={formData.courseCode}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Enter date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Enter time</label>
            <div className="time-input">
              <input
                type="text"
                name="hours"
                value={formData.hours}
                onChange={handleChange}
                required
              />
              <span>:</span>
              <input
                type="text"
                name="minutes"
                value={formData.minutes}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Select the workload type</label>
            <div className="workload-type-options">
              <label className="radio-option">
                <input
                  type="radio"
                  name="workloadType"
                  value="Lab Work"
                  checked={formData.workloadType === "Lab Work"}
                  onChange={handleChange}
                />
                <span className="radio-circle"></span>
                <span className="radio-label">Lab Work</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="workloadType"
                  value="Grading"
                  checked={formData.workloadType === "Grading"}
                  onChange={handleChange}
                />
                <span className="radio-circle"></span>
                <span className="radio-label">Grading</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="workloadType"
                  value="Recitation"
                  checked={formData.workloadType === "Recitation"}
                  onChange={handleChange}
                />
                <span className="radio-circle"></span>
                <span className="radio-label">Recitation</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="workloadType"
                  value="Office Hour"
                  checked={formData.workloadType === "Office Hour"}
                  onChange={handleChange}
                />
                <span className="radio-circle"></span>
                <span className="radio-label">Office Hour</span>
              </label>
            </div>
          </div>

          <button type="submit" className="submit-btn">Send Workload Request</button>
        </form>
      </div>
    </div>
  );
};

export default AddWorkloadPopup;