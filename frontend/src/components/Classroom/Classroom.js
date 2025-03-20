import React, { useState } from 'react';
import './Classroom.css';

const Classroom = () => {
  const [buildingId, setBuildingId] = useState('');
  const [classroomId, setClassroomId] = useState('');
  const [capacity, setCapacity] = useState('');
  const [examCapacity, setExamCapacity] = useState('');

  return (
    <div className="classroom-container">
      <div className="header">
        <h1>Classroom Management</h1>
      </div>

      <div className="classroom-content">
        {/* Left Side Buttons */}
        <div className="left-side">
          <div className="buttons">
            <button className="button add">Add Classroom</button>
            <button className="button delete">Delete Classroom</button>
            <button className="button edit">Edit Classroom</button>
          </div>

          {/* File Upload Section */}
          <div className="upload-section">
            <div className="upload-box">
              <p>Drag and Drop here</p>
              <button className="button">Select file</button>
              <input type="file" hidden />
              <button className="button">Upload File</button>
            </div>
          </div>
        </div>

        {/* Right Side Form Section */}
        <div className="form-section">
          <h2>Enter Classroom Information</h2>
          <form>
            <div className="input-field">
              <input
                type="text"
                placeholder="Enter building ID"
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value)}
              />
            </div>
            <div className="input-field">
              <input
                type="text"
                placeholder="Enter classroom ID"
                value={classroomId}
                onChange={(e) => setClassroomId(e.target.value)}
              />
            </div>
            <div className="input-field">
              <input
                type="number"
                placeholder="Enter capacity"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
            <div className="input-field">
              <input
                type="number"
                placeholder="Enter exam capacity"
                value={examCapacity}
                onChange={(e) => setExamCapacity(e.target.value)}
              />
            </div>

            <div className="form-buttons">
              <button className="add-classroom" type="submit">
                Add Classroom
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Classroom;
