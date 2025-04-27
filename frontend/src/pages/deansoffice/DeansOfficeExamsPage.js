import React, { useState, useEffect } from 'react';
import './DeansOfficeExamsPage.css';
import DeansOfficeNavBar from './DeansOfficeNavBar';

function DeansOfficeExamsPage() {
    const [exams, setExams] = useState([]);

    // Control which modal is open
    const [isAddExamOpen, setIsAddExamOpen] = useState(false);
    const [isChangeExamOpen, setIsChangeExamOpen] = useState(false);
    const [isSwapHistoryOpen, setIsSwapHistoryOpen] = useState(false);
    const [isSelectDepartmentOpen, setIsSelectDepartmentOpen] = useState(false);
    const [isSwapTAsOpen, setIsSwapTAsOpen] = useState(false);

    // Example: selected exam data
    const [selectedExam, setSelectedExam] = useState(null);

    useEffect(() => {
        const mockExams = [
            {
                id: 1,
                title: "PHYS102 Midterm Exam",
                proctors: ["Yunus Emre Erkan", "Sude Ergün"],
                classrooms: ["B-201", "B-202"],
                startTime: "14:00",
                endTime: "16:00",
                date: "22.04.2025",
                swapCount: 2,
                type: "Midterm",
                duration: "2 hours",
                proctorNumber: 2
            },
            {
                id: 2,
                title: "MATH102 Midterm Exam",
                proctors: ["Irem Esendemir", "Halil Arda Özongun", "Elif Lara Oğuzhan"],
                classrooms: ["B-201", "B-202"],
                startTime: "14:00",
                endTime: "16:00",
                date: "22.04.2025",
                swapCount: 2,
                type: "Midterm",
                duration: "2 hours",
                proctorNumber: 3
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
    const handleOpenSelectDepartment = () => {
        setIsSelectDepartmentOpen(true);
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
        setIsSelectDepartmentOpen(false);
        setIsSwapTAsOpen(false);
        setSelectedExam(null);
    };

    // Close select department but keep change exam open
    const closeSelectDepartment = () => {
        setIsSelectDepartmentOpen(false);
    };

    return (
        <div className="deansoffice-exams-page">
            {/* Top Navbar */}
            <DeansOfficeNavBar />

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
                                <p>Swap Count: {exam.swapCount}</p>
                                <p>Classroom(s): {exam.classrooms.join(', ')}</p>
                                <p>Date: {exam.date}</p>
                                <p>Time: {exam.startTime}-{exam.endTime}</p>
                                <p>Duration: {exam.duration}</p>
                                <p>Proctor Number: {exam.proctorNumber}</p>
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
                                        <div className="dropdown-option">PHYS101</div>
                                        <div className="dropdown-option">PHYS102</div>
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
                                <div className="department-selection-row">
                                    <button
                                        className="select-department-btn"
                                        onClick={handleOpenSelectDepartment}
                                    >
                                        Select Department(s)
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
                                        <div className="dropdown-option">MATH</div>
                                        <div className="dropdown-option">MATH201</div>
                                        <div className="dropdown-option">MATH202</div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                <label>Date:</label>
                                <div className="date-input-container">
                                    <input type="text" value={selectedExam.date} />
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
                                <input type="number" defaultValue={selectedExam.proctorNumber} />
                            </div>

                            <div className="form-row checkbox-row">
                                <label className="checkbox-container">
                                    <input type="checkbox" defaultChecked />
                                    <span className="checkmark"></span>
                                    Prioritize assistants of selected course
                                </label>
                            </div>

                            <div className="form-row">
                                <div className="department-selection-row">
                                    <button
                                        className="select-department-btn"
                                        onClick={handleOpenSelectDepartment}
                                    >
                                        Select Department(s)
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

            {/* Select Department Modal */}
            {isSelectDepartmentOpen && (
                <div className="modal-overlay select-department-overlay">
                    <div className="select-department-modal">
                        <div className="modal-header">
                            <h3>Select Department(s)</h3>
                            <button className="close-modal-btn" onClick={closeSelectDepartment}>×</button>
                        </div>
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="CS"
                                className="department-search-input"
                            />
                        </div>
                        <div className="department-list">
                            <div className="department-option">
                                <span>CS</span>
                            </div>
                        </div>
                        <div className="selected-departments">
                            <div className="selected-department-tag">
                                CS/2 <span className="remove-tag">×</span>
                            </div>
                            <div className="selected-department-tag">
                                MATH/5 <span className="remove-tag">×</span>
                            </div>
                        </div>
                        <div className="proctor-number-section">
                            <div className="proctor-number-label">Number of Proctors</div>
                            <div className="proctor-number-input-container">
                                <input type="text" placeholder="Enter number" />
                                <button className="add-number-btn">ADD</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Swap History Modal */}
            {isSwapHistoryOpen && selectedExam && (
                <div className="modal-overlay">
                    <div className="swap-history-content">
                        <div className="swap-history-header">
                            <h3>Swap History</h3>
                            <div className="sort-dropdown">
                                <button className="sort-button">
                                    Sort by Latest <span className="sort-arrow">▼</span>
                                </button>
                            </div>
                            <button className="swap-history-close" onClick={closeAllModals}>×</button>
                        </div>
                        <div className="swap-history-items">
                            <div className="swap-history-item">
                                <div className="swap-info">
                                    <span className="swap-names">Y. Elnouby → S. Ergün</span>
                                    <span className="swap-separator">-</span>
                                    <span className="swap-exam">CS202 Midterm Exam</span>
                                </div>
                                <div className="swap-datetime">
                                    <span className="swap-date">16.03.2025</span>
                                    <span className="swap-time">13.00-16.00</span>
                                </div>
                            </div>
                            <div className="swap-history-item">
                                <div className="swap-info">
                                    <span className="swap-names">S. Ergün → Z. Özgül</span>
                                    <span className="swap-separator">-</span>
                                    <span className="swap-exam">CS202 Midterm Exam</span>
                                </div>
                                <div className="swap-datetime">
                                    <span className="swap-date">16.03.2025</span>
                                    <span className="swap-time">18.00-20.00</span>
                                </div>
                            </div>
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

export default DeansOfficeExamsPage;