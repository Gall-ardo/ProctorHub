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

  // Fetch exam data from your backend
  useEffect(() => {
    fetch('http://localhost:5001/api/exams') // or '/api/exams'
      .then((res) => res.json())
      .then((data) => setExams(data))
      .catch((err) => console.error('Error fetching exams:', err));
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
  const handleOpenSelectProctors = (exam) => {
    setSelectedExam(exam);
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

      {/* Modals */}
      {isAddExamOpen && <AddExamModal onClose={closeAllModals} />}
      {isChangeExamOpen && (
        <ChangeExamModal exam={selectedExam} onClose={closeAllModals} onSelectProctors={handleOpenSelectProctors} />
      )}
      {isSwapHistoryOpen && <SwapHistoryModal exam={selectedExam} onClose={closeAllModals} />}
      {isSelectProctorsOpen && <SelectProctorsModal exam={selectedExam} onClose={closeAllModals} />}
      {isSwapTAsOpen && <SwapTAsModal exam={selectedExam} onClose={closeAllModals} />}
    </div>
  );
}

/* ===================
   ADD EXAM MODAL
=================== */
function AddExamModal({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add Exam</h2>
        <div className="form-row">
          <label>Exam type:</label>
          <select>
            <option>Midterm</option>
            <option>Final</option>
            <option>Quiz</option>
          </select>
        </div>
        <div className="form-row">
          <label>Exam Course:</label>
          <input type="text" placeholder="e.g. CS202" />
        </div>
        <div className="form-row">
          <label>Date:</label>
          <input type="date" />
        </div>
        <div className="form-row">
          <label>Start time:</label>
          <input type="time" />
          <label>End time:</label>
          <input type="time" />
        </div>
        <div className="form-row">
          <label>Classroom(s):</label>
          <input type="text" placeholder="e.g. B-201, B-202" />
        </div>
        <div className="form-row">
          <label>Automatic Proctor Number:</label>
          <input type="number" />
        </div>
        <div className="form-row">
          <label>Prioritize assistants of selected course</label>
          <input type="checkbox" />
        </div>
        <div className="form-row">
          <label>Manual Proctor Number:</label>
          <input type="number" />
        </div>
        <div className="button-row">
          <button className="primary-btn">ADD</button>
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ===================
   CHANGE EXAM MODAL
=================== */
function ChangeExamModal({ exam, onClose, onSelectProctors }) {
  if (!exam) return null; // safety check

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Change Exam</h2>
        <div className="form-row">
          <label>Exam type:</label>
          <select defaultValue={exam.type}>
            <option>Midterm</option>
            <option>Final</option>
            <option>Quiz</option>
          </select>
        </div>
        <div className="form-row">
          <label>Exam Course:</label>
          <input type="text" defaultValue={exam.title} />
        </div>
        <div className="form-row">
          <label>Date:</label>
          <input type="date" />
        </div>
        <div className="form-row">
          <label>Start time:</label>
          <input type="time" defaultValue="17:00" />
          <label>End time:</label>
          <input type="time" defaultValue="19:00" />
        </div>
        <div className="form-row">
          <label>Classroom(s):</label>
          <input type="text" placeholder="e.g. B-201, B-202" defaultValue="B-201, B-202" />
        </div>
        <div className="form-row">
          <label>Automatic Proctor Number:</label>
          <input type="number" defaultValue={1} />
        </div>
        <div className="form-row">
          <label>Prioritize assistants of selected course</label>
          <input type="checkbox" defaultChecked />
        </div>
        <div className="form-row">
          <label>Manual Proctor Number:</label>
          <input type="number" defaultValue={2} />
          <button className="select-proctor-btn" onClick={() => onSelectProctors(exam)}>
            Select Proctor(s)
          </button>
        </div>
        <div className="button-row">
          <button className="primary-btn">UPDATE</button>
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ===================
   SWAP HISTORY MODAL
=================== */
function SwapHistoryModal({ exam, onClose }) {
  if (!exam) return null;
  // Mock swap history
  const swapHistory = [
    {
      from: 'Y. Elnouby',
      to: 'S. Ergun',
      exam: 'CS202 Midterm',
      date: '16.03.2025',
      time: '13:00-16:00',
    },
    {
      from: 'Z. Özgül',
      to: 'S. Ergun',
      exam: 'CS202 Midterm',
      date: '16.03.2025',
      time: '18:00-20:00',
    },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Swap History for {exam.title}</h2>
        <div className="swap-history-container">
          {swapHistory.map((swap, index) => (
            <div className="swap-history-card" key={index}>
              <p>{swap.from} → {swap.to} – {swap.exam}</p>
              <p>{swap.date} {swap.time}</p>
            </div>
          ))}
        </div>
        <div className="button-row">
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ===================
   SELECT PROCTORS MODAL
=================== */
function SelectProctorsModal({ exam, onClose }) {
    // Always call hooks at the top
    const [proctors, setProctors] = useState(['Sude Ergün']);
    const [newProctor, setNewProctor] = useState('');
  
    if (!exam) return null;
  
    const handleAddProctor = () => {
      if (newProctor.trim()) {
        setProctors([...proctors, newProctor]);
        setNewProctor('');
      }
    };
  
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Select Proctor(s)</h2>
          <div className="form-row">
            <label>Proctor:</label>
            <input
              type="text"
              value={newProctor}
              onChange={(e) => setNewProctor(e.target.value)}
              placeholder="Enter TA name"
            />
            <button className="primary-btn" onClick={handleAddProctor}>
              Add
            </button>
          </div>
          <div className="proctors-list">
            {proctors.map((p, index) => (
              <div key={index} className="proctor-tag">
                {p}
              </div>
            ))}
          </div>
          <div className="button-row">
            <button className="close-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

/* ===================
   SWAP TAs MODAL
=================== */
function SwapTAsModal({ exam, onClose }) {
    // Always call hooks at the top
    const [proctorToSwap, setProctorToSwap] = useState('');
    const [newProctor, setNewProctor] = useState('');
  
    if (!exam) return null;
  
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Swap TAs for {exam.title}</h2>
          <p>Current Proctor(s): {exam.proctors.join(', ')}</p>
          <div className="form-row">
            <label>Proctor To Swap:</label>
            <select
              value={proctorToSwap}
              onChange={(e) => setProctorToSwap(e.target.value)}
            >
              <option value="">Select Proctor</option>
              {exam.proctors.map((p, i) => (
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
              value={newProctor}
              onChange={(e) => setNewProctor(e.target.value)}
            />
          </div>
          <div className="button-row">
            <button className="primary-btn">Swap</button>
            <button className="close-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

export default InstructorExamsPage;