import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import axios from 'axios';
import './InstructorExamsPage.css';
import './InstructorMainPage.css';
import InstructorNavBar from './InstructorNavBar';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function InstructorExamsPage() {
  // State variables
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Control which modal is open
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [isChangeExamOpen, setIsChangeExamOpen] = useState(false);
  const [isSwapHistoryOpen, setIsSwapHistoryOpen] = useState(false);
  const [isSelectProctorsOpen, setIsSelectProctorsOpen] = useState(false);
  const [isSwapTAsOpen, setIsSwapTAsOpen] = useState(false);

  // Selected exam data
  const [selectedExam, setSelectedExam] = useState(null);
  const [availableTAs, setAvailableTAs] = useState([]);
  const [selectedTAs, setSelectedTAs] = useState([]);
  const [swapHistory, setSwapHistory] = useState([]);

  // Handle date input change - converts from yyyy-MM-dd to dd/MM/yyyy
  const handleDateChange = (e) => {
    const isoDate = e.target.value; // Format: yyyy-MM-dd
    setFormData({
      ...formData,
      date: isoDate // Store in yyyy-MM-dd format for the date input
    });
  };

  // Form data
  const [formData, setFormData] = useState({
    courseName: '',
    examType: 'MIDTERM',
    date: '',
    startTime: '09:00',
    endTime: '11:00',
    classrooms: [],
    proctorNum: 1,
    prioritizeCourseAssistants: true,
    manualAssignedTAs: 0,
    autoAssignedTAs: 0,
    department: ''
  });

  // Search filter for TAs
  const [taSearchQuery, setTaSearchQuery] = useState('');

  // Fetch available courses
  const fetchCourses = async () => {
    try {
      // Using a different endpoint that returns only the instructor's courses
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await axios.get(`${API_URL}/api/instructor/my-courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setCourses(response.data.data);
      } else {
        console.error('Failed to fetch instructor courses');
      }
    } catch (err) {
      console.error('Error fetching instructor courses:', err);
    }
  };

  // Handle course selection
  const handleCourseSelect = (e) => {
    const courseId = e.target.value;

    // If a course is selected, find the course details and set department
    if (courseId) {
      const selectedCourse = courses.find(course => course.id === courseId);
      if (selectedCourse) {
        console.log('Selected course:', selectedCourse);
        setFormData({
          ...formData,
          courseName: courseId,
          department: selectedCourse.department || ''
        });
      }
    } else {
      setFormData({
        ...formData,
        courseName: '',
        department: ''
      });
    }
  };

  // Fetch exams and courses from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        // Fetch only exams for courses taught by the current instructor
        const examsResponse = await axios.get(`${API_URL}/api/instructor/my-exams`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (examsResponse.data.success) {
          setExams(examsResponse.data.data);
        } else {
          setError('Failed to fetch exams');
        }

        // Fetch instructor's courses
        await fetchCourses();
      } catch (err) {
        setError('Error connecting to server');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Add a separate useEffect for course loading
  useEffect(() => {
    fetchCourses();
  }, []);

  // Add an effect to fetch courses when modals open
  useEffect(() => {
    if (isAddExamOpen || isChangeExamOpen) {
      fetchCourses();
    }
  }, [isAddExamOpen, isChangeExamOpen]);

  // Fetch available TAs when select proctors modal opens
  useEffect(() => {
    if (isSelectProctorsOpen) {
      fetchAvailableTAs();
    }
  }, [isSelectProctorsOpen]);

  // Fetch swap history when swap history modal opens
  useEffect(() => {
    if (isSwapHistoryOpen && selectedExam) {
      fetchSwapHistory(selectedExam.id);
    }
  }, [isSwapHistoryOpen, selectedExam]);

  // Fetch available TAs
  const fetchAvailableTAs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const courseSpecific = formData.prioritizeCourseAssistants || (selectedExam?.prioritizeCourseAssistants ?? false);
      const courseName = selectedExam?.courseName || formData.courseName;

      const response = await axios.get(`${API_URL}/api/instructor/available-tas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { courseSpecific, courseName }
      });

      if (response.data.success) {
        setAvailableTAs(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching available TAs:', err);
    }
  };

  // Fetch swap history for an exam
  const fetchSwapHistory = async (examId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const response = await axios.get(`${API_URL}/api/instructor/exams/${examId}/swap-history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setSwapHistory(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching swap history:', err);
    }
  };

  // Handlers for opening modals
  const handleOpenAddExam = () => {
    // Reset form data for new exam
    setFormData({
      courseName: '',
      examType: 'MIDTERM',
      date: '',
      startTime: '09:00',
      endTime: '11:00', // 2 hours by default
      classrooms: [],
      proctorNum: 1,
      prioritizeCourseAssistants: true,
      manualAssignedTAs: 0,
      autoAssignedTAs: 0,
      department: ''
    });
    setSelectedTAs([]);
    setIsAddExamOpen(true);
  };

  const handleOpenChangeExam = (exam) => {
    setSelectedExam(exam);

    // Get the course ID from the exam courseName (if it's an ID format)
    // or try to find the course by name
    let courseId = exam.courseName;

    // If courses are loaded, try to find a matching course
    if (courses && courses.length > 0) {
      // Try to find by ID first
      const courseById = courses.find(c => c.id === exam.courseName);
      if (courseById) {
        courseId = courseById.id;
      } else {
        // If not found by ID, try to find by name (for backward compatibility)
        const courseByName = courses.find(c => c.courseName === exam.courseName);
        if (courseByName) {
          courseId = courseByName.id;
        }
      }
    }

    // Parse the exam data into form format
    let formattedDate = '';
    if (exam.date) {
      // If formattedDate is not available, try to use the raw date
      const date = new Date(exam.date);
      if (!isNaN(date.getTime())) {
        formattedDate = date.toISOString().split('T')[0];
      }
    }

    setFormData({
      courseName: courseId,
      examType: exam.examType,
      date: formattedDate,
      startTime: exam.startTime || '09:00',
      endTime: exam.endTime || '11:00',
      classrooms: exam.classrooms || [],
      proctorNum: exam.proctorNum || 1,
      prioritizeCourseAssistants: exam.prioritizeCourseAssistants || true,
      manualAssignedTAs: exam.manualAssignedTAs || 0,
      autoAssignedTAs: exam.autoAssignedTAs || 0,
      department: exam.department || ''
    });

    // Set selected TAs from exam proctors
    if (exam.proctors) {
      setSelectedTAs(exam.proctors);
    }

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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle classroom input
  const handleAddClassroom = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const newClassroom = e.target.value.trim();
      if (!formData.classrooms.includes(newClassroom)) {
        setFormData({
          ...formData,
          classrooms: [...formData.classrooms, newClassroom]
        });
      }
      e.target.value = '';
    }
  };

  const handleRemoveClassroom = (classroom) => {
    setFormData({
      ...formData,
      classrooms: formData.classrooms.filter(c => c !== classroom)
    });
  };

  // Handle TA selection
  const handleTASelect = (ta) => {
    if (!selectedTAs.find(selectedTA => selectedTA.id === ta.id)) {
      setSelectedTAs([...selectedTAs, ta]);
    }
  };

  const handleRemoveTA = (taId) => {
    setSelectedTAs(selectedTAs.filter(ta => ta.id !== taId));
  };

  // Handle form submission
  const handleSubmitExam = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      // Calculate duration in minutes from start and end time
      const startParts = formData.startTime.split(':').map(part => parseInt(part, 10));
      const endParts = formData.endTime.split(':').map(part => parseInt(part, 10));

      // Convert to minutes
      const startMinutes = (startParts[0] * 60) + startParts[1];
      const endMinutes = (endParts[0] * 60) + endParts[1];

      // Calculate duration (handle cases where exam goes past midnight)
      let durationMinutes = endMinutes - startMinutes;
      if (durationMinutes < 0) {
        durationMinutes += 24 * 60; // Add 24 hours in minutes
      }

      // Parse the date correctly
      const examDate = new Date(formData.date);
      examDate.setHours(startParts[0], startParts[1], 0, 0);

      // Check if date is valid
      if (isNaN(examDate.getTime())) {
        throw new Error('Invalid date format.');
      }

      // Format time strings
      const startTimeStr = `${startParts[0].toString().padStart(2, '0')}:${startParts[1].toString().padStart(2, '0')}`;
      const endTimeStr = `${endParts[0].toString().padStart(2, '0')}:${endParts[1].toString().padStart(2, '0')}`;

      // Prepare exam data for API
      const examData = {
        ...formData,
        duration: durationMinutes,
        manualAssignedTAs: selectedTAs.length,
        date: examDate.toISOString(),
        startTime: startTimeStr,
        endTime: endTimeStr
      };

      console.log('Submitting exam data:', examData);

      if (isAddExamOpen) {
        // Create new exam
        const response = await axios.post(`${API_URL}/api/instructor/exams`, examData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          // Format the response data to include time values
          const newExam = {
            ...response.data.data,
            startTime: startTimeStr,
            endTime: endTimeStr,
            formattedDate: new Date(response.data.data.date).toLocaleDateString('tr-TR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })
          };
          setExams([...exams, newExam]);
          closeAllModals();
        }
      } else {
        // Update existing exam
        const response = await axios.put(`${API_URL}/api/instructor/exams/${selectedExam.id}`, examData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          // Refresh the exams list to get the updated data
          const examsResponse = await axios.get(`${API_URL}/api/instructor/my-exams`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (examsResponse.data.success) {
            setExams(examsResponse.data.data);
          }
          closeAllModals();
        }
      }
    } catch (err) {
      console.error('Error submitting exam:', err);
      alert('Error submitting exam: ' + err.message);
    }
  };

  // Handle swap TA
  const handleSwapTA = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const oldProctorId = e.target.oldProctor.value;
      const newProctorId = e.target.newProctor.value;

      if (!oldProctorId || !newProctorId) {
        return;
      }

      const response = await axios.post(`${API_URL}/api/instructor/exams/${selectedExam.id}/swap-proctor`, {
        oldProctorId,
        newProctorId
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Refresh exams to get updated proctor list
        const examsResponse = await axios.get(`${API_URL}/api/instructor/exams`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (examsResponse.data.success) {
          setExams(examsResponse.data.data);
        }
        closeAllModals();
      }
    } catch (err) {
      console.error('Error swapping TA:', err);
    }
  };

  // Filter TAs based on search query
  const filteredTAs = taSearchQuery
      ? availableTAs.filter(ta =>
          ta.name.toLowerCase().includes(taSearchQuery.toLowerCase())
      )
      : availableTAs;

  const handleDeleteExam = async (examId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await axios.delete(`${API_URL}/api/instructor/exams/${examId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setExams(exams.filter(exam => exam.id !== examId));
        closeAllModals();
      }
    } catch (err) {
      console.error('Error deleting exam:', err);
      alert('Error deleting exam: ' + err.message);
    }
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

            {loading ? (
                <div className="loading-message">Loading exams...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : exams.length === 0 ? (
                <div className="no-exams-message">No exams found. Add your first exam.</div>
            ) : (
                <div className="cards-container">
                  {exams.map((exam) => (
                      <div className="exam-card" key={exam.id}>
                        <button 
                          className="delete-cross-btn"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this exam?')) {
                              handleDeleteExam(exam.id);
                            }
                          }}
                        >
                          ×
                        </button>
                        <h3>{exam.courseName} {exam.examType}</h3>
                        <p>Current Proctor(s): {exam.proctors ? exam.proctors.map(p => p.name).join(', ') : 'None'}</p>
                        <p>Classroom(s): {exam.classrooms ? exam.classrooms.join(', ') : 'None'}</p>
                        <p>Time: {exam.startTime} - {exam.endTime}</p>
                        <p>Date: {exam.formattedDate || (exam.date ? new Date(exam.date).toLocaleDateString('tr-TR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        }) : 'No date')}</p>
                        <p>Swap Count: {exam.swapCount || 0}</p>
                        <p>Exam Type: {exam.examType}</p>
                        <div className="card-buttons">
                          <button onClick={() => handleOpenSwapTAs(exam)}>Swap TA</button>
                          <button onClick={() => handleOpenSwapHistory(exam)}>View Swap History</button>
                          <button onClick={() => handleOpenChangeExam(exam)}>Change Exam Information</button>
                        </div>
                      </div>
                  ))}
                </div>
            )}
          </div>
        </main>

        {/* Add Exam Modal */}
        {isAddExamOpen && (
            <div className="modal-overlay">
              <div className="large-modal-content">
                <h2>Add Exam</h2>
                <form onSubmit={handleSubmitExam} className="modern-form">
                  <div className="form-row dropdown-row">
                    <label>Exam type:</label>
                    <select
                        name="examType"
                        value={formData.examType}
                        onChange={handleInputChange}
                        className="custom-dropdown"
                    >
                      <option value="MIDTERM">Midterm</option>
                      <option value="FINAL">Final</option>
                      <option value="QUIZ">Quiz</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className="form-row dropdown-row">
                    <label>Exam course:</label>
                    <select
                        name="courseName"
                        value={formData.courseName}
                        onChange={handleCourseSelect}
                        className="custom-dropdown"
                        required
                    >
                      <option value="">Select a course</option>
                      {courses && courses.length > 0 ? (
                          courses.map(course => (
                              <option key={course.id} value={course.id}>
                                {course.courseName} ({course.courseCode})
                              </option>
                          ))
                      ) : (
                          <option value="" disabled>Loading courses...</option>
                      )}
                    </select>
                  </div>

                  <div className="form-row dropdown-row">
                    <label>Department:</label>
                    <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        placeholder="e.g., CS"
                        required
                        readOnly={formData.courseName !== ''}
                        className={formData.courseName !== '' ? 'readonly-input' : ''}
                    />
                  </div>

                  <div className="form-row">
                    <label>Date:</label>
                    <div className="date-input-container">
                      <input
                          type="date"
                          value={formData.date}
                          onChange={handleDateChange}
                          required
                          className="date-input"
                      />
                    </div>
                  </div>

                  <div className="form-row time-row">
                    <div className="time-container">
                      <label>Start time:</label>
                      <input
                          type="time"
                          name="startTime"
                          value={formData.startTime}
                          onChange={handleInputChange}
                          required
                      />
                    </div>
                    <div className="time-container">
                      <label>End time:</label>
                      <input
                          type="time"
                          name="endTime"
                          value={formData.endTime}
                          onChange={handleInputChange}
                          required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <label>Classroom(s):</label>
                    <div className="classroom-container">
                      <input
                          type="text"
                          placeholder="Add classroom and press Enter"
                          onKeyDown={handleAddClassroom}
                      />
                      {formData.classrooms.map((classroom, idx) => (
                          <div key={idx} className="classroom-tag">
                            {classroom} <span className="remove-tag" onClick={() => handleRemoveClassroom(classroom)}>×</span>
                          </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-row">
                    <label>Automatic Proctor Number:</label>
                    <input
                        type="number"
                        name="proctorNum"
                        value={formData.proctorNum}
                        onChange={handleInputChange}
                        required
                        min="0"
                    />
                  </div>

                  <div className="form-row checkbox-row">
                    <label className="checkbox-container">
                      <input
                          type="checkbox"
                          name="prioritizeCourseAssistants"
                          checked={formData.prioritizeCourseAssistants}
                          onChange={handleInputChange}
                      />
                      <span className="checkmark"></span>
                      Prioritize assistants of selected course
                    </label>
                  </div>

                  <div className="form-row">
                    <div className="proctor-selection-row">
                      <button type="button" className="select-proctor-btn" onClick={handleOpenSelectProctors}>
                        Select Proctor(s)
                      </button>
                    </div>
                  </div>

                  <div className="button-row">
                    <button type="submit" className="primary-btn">ADD</button>
                    <button type="button" className="close-btn" onClick={closeAllModals}>CANCEL</button>
                  </div>
                </form>
              </div>
            </div>
        )}

        {/* Change Exam Modal */}
        {isChangeExamOpen && selectedExam && (
            <div className="modal-overlay">
              <div className="large-modal-content">
                <h2>Change Exam</h2>
                <form onSubmit={handleSubmitExam} className="modern-form">
                  <div className="form-row dropdown-row">
                    <label>Exam type:</label>
                    <select
                        name="examType"
                        value={formData.examType}
                        onChange={handleInputChange}
                        className="custom-dropdown"
                    >
                      <option value="MIDTERM">Midterm</option>
                      <option value="FINAL">Final</option>
                      <option value="QUIZ">Quiz</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className="form-row dropdown-row">
                    <label>Exam course:</label>
                    <select
                        name="courseName"
                        value={formData.courseName}
                        onChange={handleCourseSelect}
                        className="custom-dropdown"
                        required
                    >
                      <option value="">Select a course</option>
                      {courses && courses.length > 0 ? (
                          courses.map(course => (
                              <option key={course.id} value={course.id}>
                                {course.courseName} ({course.courseCode})
                              </option>
                          ))
                      ) : (
                          <option value="" disabled>Loading courses...</option>
                      )}
                    </select>
                  </div>

                  <div className="form-row dropdown-row">
                    <label>Department:</label>
                    <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        placeholder="e.g., CS"
                        required
                        readOnly={formData.courseName !== ''}
                        className={formData.courseName !== '' ? 'readonly-input' : ''}
                    />
                  </div>

                  <div className="form-row">
                    <label>Date:</label>
                    <div className="date-input-container">
                      <input
                          type="date"
                          value={formData.date}
                          onChange={handleDateChange}
                          required
                          className="date-input"
                      />
                    </div>
                  </div>

                  <div className="form-row time-row">
                    <div className="time-container">
                      <label>Start time:</label>
                      <input
                          type="time"
                          name="startTime"
                          value={formData.startTime}
                          onChange={handleInputChange}
                          required
                      />
                    </div>
                    <div className="time-container">
                      <label>End time:</label>
                      <input
                          type="time"
                          name="endTime"
                          value={formData.endTime}
                          onChange={handleInputChange}
                          required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <label>Classroom(s):</label>
                    <div className="classroom-container">
                      <input
                          type="text"
                          placeholder="Add classroom and press Enter"
                          onKeyDown={handleAddClassroom}
                      />
                      {formData.classrooms.map((classroom, idx) => (
                          <div key={idx} className="classroom-tag">
                            {classroom} <span className="remove-tag" onClick={() => handleRemoveClassroom(classroom)}>×</span>
                          </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-row">
                    <label>Automatic Proctor Number:</label>
                    <input
                        type="number"
                        name="proctorNum"
                        value={formData.proctorNum}
                        onChange={handleInputChange}
                        required
                        min="0"
                    />
                  </div>

                  <div className="form-row checkbox-row">
                    <label className="checkbox-container">
                      <input
                          type="checkbox"
                          name="prioritizeCourseAssistants"
                          checked={formData.prioritizeCourseAssistants}
                          onChange={handleInputChange}
                      />
                      <span className="checkmark"></span>
                      Prioritize assistants of selected course
                    </label>
                  </div>

                  <div className="form-row">
                    <div className="proctor-selection-row">
                      <button type="button" className="select-proctor-btn" onClick={handleOpenSelectProctors}>
                        Select Proctor(s)
                      </button>
                    </div>
                  </div>

                  <div className="button-row">
                    <button type="submit" className="primary-btn">UPDATE</button>
                    <button type="button" className="close-btn" onClick={closeAllModals}>CANCEL</button>
                  </div>
                </form>
              </div>
            </div>
        )}

        {/* Select Proctors Modal */}
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
                      value={taSearchQuery}
                      onChange={(e) => setTaSearchQuery(e.target.value)}
                  />
                </div>
                <div className="ta-list">
                  {filteredTAs.map((ta) => (
                      <div
                          key={ta.id}
                          className="ta-option"
                          onClick={() => handleTASelect(ta)}
                      >
                        <span>{ta.name}</span>
                      </div>
                  ))}
                </div>
                <div className="selected-proctors">
                  {selectedTAs.map((ta) => (
                      <div key={ta.id} className="selected-ta-tag">
                        {ta.name} <span className="remove-tag" onClick={() => handleRemoveTA(ta.id)}>×</span>
                      </div>
                  ))}
                </div>
              </div>
            </div>
        )}

        {/* Swap History Modal */}
        {isSwapHistoryOpen && selectedExam && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Swap History for {selectedExam.courseName} {selectedExam.examType}</h2>
                <div className="swap-history-container">
                  {swapHistory.length === 0 ? (
                      <p>No swap history found for this exam.</p>
                  ) : (
                      swapHistory.map((swap, index) => (
                          <div key={index} className="swap-history-card">
                            <p>{swap.oldProctor} → {swap.newProctor} – {selectedExam.courseName} {selectedExam.examType}</p>
                            <p>{swap.date} {swap.time}</p>
                          </div>
                      ))
                  )}
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
                <h2>Swap TAs for {selectedExam.courseName} {selectedExam.examType}</h2>
                <form onSubmit={handleSwapTA}>
                  <p>Current Proctor(s): {selectedExam.proctors ? selectedExam.proctors.map(p => p.name).join(', ') : 'None'}</p>
                  <div className="form-row">
                    <label>Proctor To Swap:</label>
                    <select name="oldProctor" required>
                      <option value="">Select Proctor</option>
                      {selectedExam.proctors && selectedExam.proctors.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-row">
                    <label>New Proctor:</label>
                    <select name="newProctor" required>
                      <option value="">Select New Proctor</option>
                      {availableTAs.map((ta) => (
                          <option key={ta.id} value={ta.id}>
                            {ta.name}
                          </option>
                      ))}
                    </select>
                  </div>
                  <div className="button-row">
                    <button type="submit" className="primary-btn">Swap</button>
                    <button type="button" className="close-btn" onClick={closeAllModals}>
                      Close
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
}

export default InstructorExamsPage;