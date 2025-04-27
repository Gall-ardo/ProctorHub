import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './InstructorExamsPage.css';
import './InstructorMainPage.css';
import InstructorNavBar from './InstructorNavBar';

function InstructorExamsPage() {
  const [exams, setExams] = useState([]);

  // Control which modal is open
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [isChangeExamOpen, setIsChangeExamOpen] = useState(false);
  const [isSwapHistoryOpen, setIsSwapHistoryOpen] = useState(false);
  const [isSelectProctorsOpen, setIsSelectProctorsOpen] = useState(false);
  const [isSwapTAsOpen, setIsSwapTAsOpen] = useState(false);

  // Example: selected exam data
  const [selectedExam, setSelectedExam] = useState(null);

  // Mock exam data since we're not using the fetch call in this example
  useEffect(() => {
    const mockExams = [
      {
        id: 1,
        title: "CS202 Midterm",
        proctors: ["Sude Ergün", "Rıdvan Yılmaz"],
        classrooms: ["B-201", "B-202"],
        startTime: "04:00",
        endTime: "17:00",
        date: "22/04/2025",
        swapCount: 2,
        type: "Midterm"
      },
      {
        id: 2,
        title: "CS101 Final",
        proctors: ["Ziya Özgül"],
        classrooms: ["EA-409", "EA-410", "EA-411"],
        startTime: "13:00",
        endTime: "16:00",
        date: "28/04/2025",
        swapCount: 0,
        type: "Final"
      }
    ];
    setExams(mockExams);
  }, []);

  // Handlers for opening modals
  const handleOpenAddExam = () => {
    setIsAddExamOpen(true);
  };
  const handleOpenChangeExam = (exam) => {
    setSelectedExam(exam);
    setIsChangeExamOpen(true);
  };
  const handleOpenSwapHistory = (exam) => {
    setSelectedExam(exam);
    setIsSwapHistoryOpen(true);
  };
  const handleOpenSelectProctors = () => {
    setIsSelectProctorsOpen(true);
  };
  const handleOpenSwapTAs = (exam) => {
    setSelectedExam(exam);
    setIsSwapTAsOpen(true);
  };

  // Handlers for closing modals
  const closeAllModals = () => {
    setIsAddExamOpen(false);
    setIsChangeExamOpen(false);
    setIsSwapHistoryOpen(false);
    setIsSelectProctorsOpen(false);
    setIsSwapTAsOpen(false);
    setSelectedExam(null);
  };

  // Close select proctors but keep change exam open
  const closeSelectProctors = () => {
    setIsSelectProctorsOpen(false);
  };

  return (
      <div className="instructor-exams-page">
        {/* Top Navbar */}
        <InstructorNavBar />

        {/* Main Content */}
        <main className="main-content">
          <div className="exams-container">
            <div className="exams-header">
              <h2>Exams</h2>
              <button className="add-exam-btn" onClick={handleOpenAddExam}>
                Add New Exam
              </button>
            </div>

            <div className="cards-container">
              {exams.map((exam) => (
                  <div className="exam-card" key={exam.id}>
                    <h3>{exam.title}</h3>
                    <p>Current Proctor(s): {exam.proctors.join(', ')}</p>
                    <p>Classroom(s): {exam.classrooms.join(', ')}</p>
                    <p>Time: {exam.startTime} - {exam.endTime}</p>
                    <p>Swap Count: {exam.swapCount}</p>
                    <p>Exam Type: {exam.type}</p>
                    <div className="card-buttons">
                      <button onClick={() => handleOpenSwapTAs(exam)}>Swap TA</button>
                      <button onClick={() => handleOpenSwapHistory(exam)}>View Swap History</button>
                      <button onClick={() => handleOpenChangeExam(exam)}>Change Exam Information</button>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </main>

        {/* Add Exam Modal - Updated to match design */}
        {isAddExamOpen && (
            <div className="modal-overlay">
              <div className="large-modal-content">
                <h2>Add Exam</h2>
                <div className="modern-form">
                  <div className="form-row dropdown-row">
                    <label>Exam type:</label>
                    <div className="custom-dropdown">
                      <div className="dropdown-selected">
                        <span>Select exam type</span>
                        <span className="dropdown-arrow">▼</span>
                      </div>
                      <div className="dropdown-options">
                        <div className="dropdown-option">Midterm</div>
                        <div className="dropdown-option">Final</div>
                        <div className="dropdown-option">Quiz</div>
                      </div>
                    </div>
                  </div>

                  <div className="form-row dropdown-row">
                    <label>Exam course:</label>
                    <div className="custom-dropdown">
                      <div className="dropdown-selected">
                        <span>Select course</span>
                        <span className="dropdown-arrow">▼</span>
                      </div>
                      <div className="dropdown-options">
                        <div className="dropdown-option">CS201</div>
                        <div className="dropdown-option">CS464</div>
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <label>Date:</label>
                    <div className="date-input-container">
                      <input type="text" placeholder="mm/dd/yyyy" />
                      <span className="calendar-icon">📅</span>
                    </div>
                  </div>

                  <div className="form-row time-row">
                    <div className="time-container">
                      <label>Start time:</label>
                      <div className="time-input-group">
                        <input type="text" value="04" className="time-input" />
                        <span className="time-separator">:</span>
                        <input type="text" value="00" className="time-input" />
                      </div>
                    </div>
                    <div className="time-container">
                      <label>End time:</label>
                      <div className="time-input-group">
                        <input type="text" value="17" className="time-input" />
                        <span className="time-separator">:</span>
                        <input type="text" value="00" className="time-input" />
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <label>Classroom(s):</label>
                    <div className="classroom-container">
                      <input type="text" placeholder="Add classroom" />
                    </div>
                  </div>

                  <div className="form-row">
                    <label>Automatic Proctor Number:</label>
                    <input type="number" placeholder="Enter number" />
                  </div>

                  <div className="form-row checkbox-row">
                    <label className="checkbox-container">
                      <input type="checkbox" />
                      <span className="checkmark"></span>
                      Prioritize assistants of selected course
                    </label>
                  </div>

                  <div className="form-row">
                    <div className="proctor-selection-row">
                      <button className="select-proctor-btn" onClick={handleOpenSelectProctors}>
                        Select Proctor(s)
                      </button>
                    </div>
                  </div>

                  <div className="button-row">
                    <button className="primary-btn" onClick={closeAllModals}>ADD</button>
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* Change Exam Modal - Updated to match design */}
        {isChangeExamOpen && selectedExam && (
            <div className="modal-overlay">
              <div className="large-modal-content">
                <h2>Change Exam</h2>
                <div className="modern-form">
                  <div className="form-row dropdown-row">
                    <label>Exam type:</label>
                    <div className="custom-dropdown">
                      <div className="dropdown-selected">
                        <span>{selectedExam.type}</span>
                        <span className="dropdown-arrow">▼</span>
                      </div>
                      <div className="dropdown-options">
                        <div className="dropdown-option">Midterm</div>
                        <div className="dropdown-option">Final</div>
                        <div className="dropdown-option">Quiz</div>
                      </div>
                    </div>
                  </div>

                  <div className="form-row dropdown-row">
                    <label>Exam course:</label>
                    <div className="custom-dropdown">
                      <div className="dropdown-selected">
                        <span>{selectedExam.title.split(" ")[0]}</span>
                        <span className="dropdown-arrow">▼</span>
                      </div>
                      <div className="dropdown-options">
                        <div className="dropdown-option">CS201</div>
                        <div className="dropdown-option">CS464</div>
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <label>Date:</label>
                    <div className="date-input-container">
                      <input type="text" value={selectedExam.date || "22/04/2025"} />
                      <span className="calendar-icon">📅</span>
                    </div>
                  </div>

                  <div className="form-row time-row">
                    <div className="time-container">
                      <label>Start time:</label>
                      <div className="time-input-group">
                        <input type="text" defaultValue={selectedExam.startTime.split(":")[0]} className="time-input" />
                        <span className="time-separator">:</span>
                        <input type="text" defaultValue={selectedExam.startTime.split(":")[1]} className="time-input" />
                      </div>
                    </div>
                    <div className="time-container">
                      <label>End time:</label>
                      <div className="time-input-group">
                        <input type="text" defaultValue={selectedExam.endTime.split(":")[0]} className="time-input" />
                        <span className="time-separator">:</span>
                        <input type="text" defaultValue={selectedExam.endTime.split(":")[1]} className="time-input" />
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <label>Classroom(s):</label>
                    <div className="classroom-container">
                      <input type="text" placeholder="Add classroom" />
                      {selectedExam.classrooms.map((classroom, idx) => (
                          <div key={idx} className="classroom-tag">
                            {classroom} <span className="remove-tag">×</span>
                          </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-row">
                    <label>Automatic Proctor Number:</label>
                    <input type="number" defaultValue="1" />
                  </div>

                  <div className="form-row checkbox-row">
                    <label className="checkbox-container">
                      <input type="checkbox" defaultChecked />
                      <span className="checkmark"></span>
                      Prioritize assistants of selected course
                    </label>
                  </div>

                  <div className="form-row">
                    <div className="proctor-selection-row">
                      <button className="select-proctor-btn" onClick={handleOpenSelectProctors}>
                        Select Proctor(s)
                      </button>
                    </div>
                  </div>

                  <div className="button-row">
                    <button className="primary-btn" onClick={closeAllModals}>UPDATE</button>
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* Select Proctors Modal - Updated to match design */}
        {isSelectProctorsOpen && (
            <div className="modal-overlay select-proctors-overlay">
              <div className="select-proctors-modal">
                <div className="modal-header">
                  <h3>Select Proctor(s)</h3>
                  <button className="close-modal-btn" onClick={closeSelectProctors}>×</button>
                </div>
                <div className="search-container">
                  <input
                      type="text"
                      placeholder="Search TA..."
                      className="proctor-search-input"
                  />
                </div>
                <div className="ta-list">
                  <div className="ta-option">
                    <span>Yahya Elnouby</span>
                  </div>
                  <div className="ta-option">
                    <span>Rıdvan Yılmaz</span>
                  </div>
                </div>
                <div className="selected-proctors">
                  <div className="selected-ta-tag">
                    Sude Ergün <span className="remove-tag">×</span>
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* Swap History Modal */}
        {isSwapHistoryOpen && selectedExam && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Swap History for {selectedExam.title}</h2>
                <div className="swap-history-container">
                  <div className="swap-history-card">
                    <p>Y. Elnouby → S. Ergun – {selectedExam.title}</p>
                    <p>16.03.2025 13:00-16:00</p>
                  </div>
                  <div className="swap-history-card">
                    <p>Z. Özgül → S. Ergun – {selectedExam.title}</p>
                    <p>16.03.2025 18:00-20:00</p>
                  </div>
                </div>
                <div className="button-row">
                  <button className="close-btn" onClick={closeAllModals}>Close</button>
                </div>
              </div>
            </div>
        )}

        {/* Swap TAs Modal */}
        {isSwapTAsOpen && selectedExam && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Swap TAs for {selectedExam.title}</h2>
                <p>Current Proctor(s): {selectedExam.proctors.join(', ')}</p>
                <div className="form-row">
                  <label>Proctor To Swap:</label>
                  <select>
                    <option value="">Select Proctor</option>
                    {selectedExam.proctors.map((p, i) => (
                        <option key={i} value={p}>
                          {p}
                        </option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <label>New Proctor:</label>
                  <input
                      type="text"
                      placeholder="Enter new TA"
                  />
                </div>
                <div className="button-row">
                  <button className="primary-btn">Swap</button>
                  <button className="close-btn" onClick={closeAllModals}>
                    Close
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}

export default InstructorExamsPage;