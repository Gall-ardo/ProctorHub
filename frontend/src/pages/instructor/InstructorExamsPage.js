import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import axios from 'axios';
import './InstructorExamsPage.css';
import './InstructorMainPage.css';
import InstructorNavBar from './InstructorNavBar';
const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5001') + '/api';


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

  // Helper to retrieve JWT and set header
  function getAuthHeader() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log("tokennnnn", token);
    if (!token) throw new Error('No authentication token found');
    return { Authorization: `Bearer ${token}` };
  }

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
      const headers = getAuthHeader();

      const response = await axios.get(`${API_URL}/instructor/my-courses`, { headers });
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
        const headers = getAuthHeader();
        // Fetch only exams for courses taught by the current instructor
        const examsResponse = await axios.get(`${API_URL}/instructor/my-exams`, { headers });
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
      const headers = getAuthHeader();
      const courseSpecific = formData.prioritizeCourseAssistants || (selectedExam?.prioritizeCourseAssistants ?? false);
      const courseName = selectedExam?.courseName || formData.courseName;
      const department = selectedExam?.department || formData.department;
      const examDate = selectedExam?.date ? new Date(selectedExam.date) : formData.date ? new Date(formData.date) : null;
      
      // Check if exam is on a weekend (0 = Sunday, 6 = Saturday)
      const isWeekend = examDate ? (examDate.getDay() === 0 || examDate.getDay() === 6) : false;
      
      // Format date for API query
      const formattedExamDate = examDate ? examDate.toISOString().split('T')[0] : '';

      // Get query parameters for course-specific TAs or department filtering
      let queryParams = '';
      if (courseName) queryParams += `courseId=${courseName}`;
      if (department) {
        if (queryParams) queryParams += '&';
        queryParams += `department=${department}`;
      }
      // Add exam date to filter out TAs with approved leave requests
      // Backend should check if this date falls within any approved leave request's date range (startDate to endDate)
      if (formattedExamDate) {
        if (queryParams) queryParams += '&';
        queryParams += `examDate=${formattedExamDate}`;
      }

      console.log('Fetching available TAs with params:', queryParams);

      const response = await axios.get(
        `${API_URL}/instructor/available-tas-for-exam${queryParams ? '?' + queryParams : ''}`, 
        { headers }
      );

      if (response.data.success) {
        // Check if there are any warnings about TAs with leave requests
        if (response.data.warnings) {
          console.warn('Warnings from server:', response.data.warnings);
        }
        
        // Transform data to include workload and other information
        const tas = response.data.data.map(ta => ({
          ...ta,
          workload: ta.totalWorkload || 0,
          department: ta.department || 'Unknown',
          isPHD: ta.isPHD || false,
          isPartTime: ta.isPartTime || false,
          isSameDepartment: ta.department === department,
          // A TA is on leave if they have an approved leave request that overlaps with the exam date
          isOnLeave: ta.leaveStatus === 'APPROVED' || ta.isOnLeave || false
        }));
        
        // Filter out TAs who are on approved leave
        const availableTAs = tas.filter(ta => !ta.isOnLeave);
        
        // Sort TAs by priority:
        // 1. Department TAs (always prioritized)
        // 2. Part-time TAs for weekend exams
        // 3. Course TAs (if checkbox selected)
        // 4. PhD TAs (for graduate courses)
        // 5. Workload (lowest first)
        const sortedTAs = availableTAs.sort((a, b) => {
          // First prioritize same department (always)
          if (a.isSameDepartment && !b.isSameDepartment) return -1;
          if (!a.isSameDepartment && b.isSameDepartment) return 1;
          
          // For weekend exams, prioritize part-time TAs
          if (isWeekend) {
            if (a.isPartTime && !b.isPartTime) return -1;
            if (!a.isPartTime && b.isPartTime) return 1;
          }
          
          // Then prioritize course TAs if checkbox is selected
          const prioritizeCourse = formData.prioritizeCourseAssistants || (selectedExam?.prioritizeCourseAssistants ?? false);
          if (prioritizeCourse) {
            const aIsCourseTA = a.courses?.some(c => c.id === courseName);
            const bIsCourseTA = b.courses?.some(c => c.id === courseName);
            
            if (aIsCourseTA && !bIsCourseTA) return -1;
            if (!aIsCourseTA && bIsCourseTA) return 1;
          }
          
          // Then prioritize PhD status for graduate courses
          if (a.isPHD && !b.isPHD) return -1;
          if (!a.isPHD && b.isPHD) return 1;
          
          // Finally, sort by workload (lowest first)
          return a.workload - b.workload;
        });
        
        setAvailableTAs(sortedTAs);
        
        // If we're editing an exam, pre-select the existing proctors
        if (selectedExam && selectedExam.proctors && selectedExam.proctors.length > 0) {
          // Map the proctors to the format expected by selectedTAs
          const formattedProctors = selectedExam.proctors.map(proctor => {
            // Find the matching TA in availableTAs to get full data
            const matchingTA = tas.find(ta => ta.id === proctor.id);
            if (matchingTA) {
              return matchingTA;
            }
            // If not found, return the basic info we have
            return {
              ...proctor,
              workload: proctor.workload || 0,
              department: proctor.department || 'Unknown',
              isPHD: proctor.isPHD || false,
              isPartTime: proctor.isPartTime || false,
              isSameDepartment: proctor.department === department,
              isOnLeave: proctor.leaveStatus === 'APPROVED' || proctor.isOnLeave || false
            };
          });
          
          // Filter out any previously assigned proctors who are now on leave
          const availableProctors = formattedProctors.filter(proctor => !proctor.isOnLeave);
          
          // If any proctors were on leave, show a warning message
          if (availableProctors.length < formattedProctors.length) {
            const onLeaveProctors = formattedProctors.filter(p => p.isOnLeave).map(p => p.name).join(', ');
            alert(`WARNING: The following previously assigned proctors have approved leave requests that overlap with the exam date and have been removed: ${onLeaveProctors}`);
          }
          
          setSelectedTAs(availableProctors);
        }
      }
    } catch (err) {
      console.error('Error fetching available TAs:', err);
    }
  };

  // Fetch swap history for an exam
  const fetchSwapHistory = async (examId) => {
    try {
      const headers = getAuthHeader();
      const response = await axios.get(`${API_URL}/instructor/exams/${examId}/swap-history`, { headers });
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
    fetchAvailableTAs();
  };

  const handleOpenSwapTAs = (exam) => {
    setSelectedExam(exam);
    setIsSwapTAsOpen(true);
    fetchAvailableTAs();
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
    // Don't allow selecting TAs who are on leave
    if (ta.isOnLeave) {
      alert(`Cannot assign ${ta.name} as they have an approved leave request that overlaps with this exam's date.`);
      return;
    }
    
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
    try {
      const headers = getAuthHeader();
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

      let examResponse;
      if (isAddExamOpen) {
        // Create new exam
        examResponse = await axios.post(`${API_URL}/instructor/exams`, examData, { headers });
      } else {
        // Update existing exam
        examResponse = await axios.put(`${API_URL}/instructor/exams/${selectedExam.id}`, examData, { headers });
      }

      if (examResponse.data.success) {
        // Get the exam ID
        const examId = isAddExamOpen ? examResponse.data.data.id : selectedExam.id;
        
        // Format date for leave request checking
        const formattedExamDate = examDate.toISOString().split('T')[0];
        
        // Double-check if any selected TAs have leave conflicts
        // Fetch all approved leave requests that overlap with the exam date
        try {
          // Only proceed with the TAs that don't have leave conflicts
          const leaveCheckResponse = await axios.get(
            `${API_URL}/instructor/check-ta-leave?examDate=${formattedExamDate}`,
            { headers }
          );
          
          if (leaveCheckResponse.data.success && leaveCheckResponse.data.data) {
            const tasOnLeave = leaveCheckResponse.data.data;
            
            // Filter out any TAs that have leave conflicts
            const filteredSelectedTAs = selectedTAs.filter(ta => !tasOnLeave.includes(ta.id));
            
            // If some TAs were filtered out, show a warning
            if (filteredSelectedTAs.length < selectedTAs.length) {
              const removedTAs = selectedTAs.filter(ta => tasOnLeave.includes(ta.id)).map(ta => ta.name).join(', ');
              alert(`Warning: The following manually selected TAs have approved leave requests for ${formattedExamDate} and will not be assigned: ${removedTAs}`);
            }
            
            // Always assign proctors automatically as part of exam creation/update
            const proctorAssignmentData = {
              examId,
              courseName: formData.courseName,
              manuallySelectedTAs: filteredSelectedTAs.map(ta => ta.id),
              proctorNum: formData.proctorNum,
              prioritizeCourseAssistants: formData.prioritizeCourseAssistants,
              prioritizeDepartmentTAs: true, // Always prioritize TAs from the same department
              prioritizePartTimeForWeekend: true, // Prioritize part-time TAs for weekend exams
              autoAssignRemainingTAs: true, // Always auto-assign remaining TAs
              department: formData.department,
              examDate: formattedExamDate, // Include exam date for leave request checking
              checkLeaveRequests: true, // Enable checking for leave requests where examDate falls within startDate and endDate
              strictLeaveCheck: true // Strict enforcement - never assign TAs on leave, even if proctor number isn't reached
            };
            
            try {
              // Assign proctors immediately after creating/updating the exam
              // Backend should check LeaveRequest table and filter out TAs with approved leave requests
              // that have the exam date falling within the leave request's startDate and endDate range
              await axios.post(`${API_URL}/instructor/exams/assign-proctors`, proctorAssignmentData, { headers });
              console.log("Proctors assigned successfully");
            } catch (proctorError) {
              console.error('Error assigning proctors:', proctorError);
              alert('Exam was created but proctor assignment failed: ' + 
                    (proctorError.response?.data?.message || proctorError.message));
              // Continue with exam creation/update even if proctor assignment fails
            }
          } else {
            throw new Error('Failed to check TA leave status');
          }
        } catch (leaveCheckError) {
          console.error('Error checking TA leave status:', leaveCheckError);
          // Fall back to traditional proctor assignment
          // Always assign proctors automatically as part of exam creation/update
          const proctorAssignmentData = {
            examId,
            courseName: formData.courseName,
            manuallySelectedTAs: selectedTAs.map(ta => ta.id),
            proctorNum: formData.proctorNum,
            prioritizeCourseAssistants: formData.prioritizeCourseAssistants,
            prioritizeDepartmentTAs: true, // Always prioritize TAs from the same department
            prioritizePartTimeForWeekend: true, // Prioritize part-time TAs for weekend exams
            autoAssignRemainingTAs: true, // Always auto-assign remaining TAs
            department: formData.department,
            examDate: formattedExamDate, // Include exam date for leave request checking
            checkLeaveRequests: true, // Enable checking for leave requests where examDate falls within startDate and endDate
            strictLeaveCheck: true // Strict enforcement - never assign TAs on leave, even if proctor number isn't reached
          };
          
          try {
            await axios.post(`${API_URL}/instructor/exams/assign-proctors`, proctorAssignmentData, { headers });
            console.log("Proctors assigned successfully (fallback)");
          } catch (proctorError) {
            console.error('Error assigning proctors:', proctorError);
            alert('Exam was created but proctor assignment failed: ' + 
                  (proctorError.response?.data?.message || proctorError.message));
          }
        }
        
        // Refresh the exams list
        const examsResponse = await axios.get(`${API_URL}/instructor/my-exams`, { headers });
        if (examsResponse.data.success) {
          setExams(examsResponse.data.data);
        }
        
        closeAllModals();
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
      const headers = getAuthHeader();
      const oldProctorId = e.target.oldProctor.value;
      const newProctorId = e.target.newProctor.value;

      if (!oldProctorId || !newProctorId) {
        return;
      }

      const response = await axios.post(`${API_URL}/instructor/exams/${selectedExam.id}/swap-proctor`, {
        oldProctorId,
        newProctorId
      }, { headers });

      if (response.data.success) {
        // Refresh exams to get updated proctor list
        const examsResponse = await axios.get(`${API_URL}/instructor/exams`, { headers });
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
      // Get the exam from the exams list
      const examToDelete = exams.find(exam => exam.id === examId);
      
      // Check if the exam has proctors
      const hasProctors = examToDelete?.proctors && examToDelete.proctors.length > 0;
      
      // Create an appropriate warning message
      let confirmMessage = 'Are you sure you want to delete this exam?';
      
      if (hasProctors) {
        const proctorCount = examToDelete.proctors.length;
        const proctorNames = examToDelete.proctors.map(p => p.name).join(', ');
        confirmMessage = `WARNING: This exam already has ${proctorCount} proctor${proctorCount > 1 ? 's' : ''} assigned (${proctorNames}). Deleting this exam will also delete all proctoring assignments and notifications sent to TAs. Are you sure you want to proceed?`;
      }
      
      // Ask for confirmation
      if (window.confirm(confirmMessage)) {
        const headers = getAuthHeader();
        const response = await axios.delete(`${API_URL}/instructor/exams/${examId}`, { headers });

        if (response.data.success) {
          // Remove the exam from the state
          setExams(exams.filter(exam => exam.id !== examId));
          closeAllModals();
        }
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
                        <div className="exam-card-header">
                          <h3>{exam.courseName} {exam.examType}</h3>
                          <button
                            className="delete-exam-btn"
                            title="Delete Exam"
                            onClick={() => {
                              handleDeleteExam(exam.id);
                            }}
                          >
                            <span className="delete-icon">×</span>
                            <span className="delete-text">Delete</span>
                          </button>
                        </div>
                        <p>
                          <strong>Current Proctor(s):</strong> {
                            exam.proctors 
                              ? exam.proctors.filter(p => p.status === 'ACCEPTED').map(p => p.name).join(', ') || 'None' 
                              : 'None'
                          }
                        </p>
                        <p>
                          <strong>Pending Proctor(s):</strong> {
                            exam.proctors 
                              ? exam.proctors.filter(p => p.status === 'PENDING').map(p => p.name).join(', ') || 'None' 
                              : 'None'
                          }
                        </p>
                        <p><strong>Classroom(s):</strong> {exam.classrooms ? exam.classrooms.join(', ') : 'None'}</p>
                        <p><strong>Time:</strong> {exam.startTime} - {exam.endTime}</p>
                        <p><strong>Date:</strong> {exam.formattedDate || (exam.date ? new Date(exam.date).toLocaleDateString('tr-TR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        }) : 'No date')}</p>
                        <p><strong>Swap Count:</strong> {exam.swapCount || 0}</p>
                        <p><strong>Exam Type:</strong> {exam.examType}</p>
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
                    <p className="hint-text">
                      Number of TAs to be automatically assigned based on workload
                    </p>
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
                      Prioritize TAs of selected course
                    </label>
                    <p className="hint-text">
                      TAs will be prioritized in this order: 1) Department TAs, 2) Part-time TAs for weekend exams, 3) Course TAs (if checkbox selected), 4) Other TAs by workload.
                      For graduate courses, PhD TAs will also be prioritized. TAs with approved leave requests on the exam date cannot be assigned.
                    </p>
                  </div>

                  <div className="form-row">
                    <div className="proctor-selection-row">
                      <button type="button" className="select-proctor-btn" onClick={handleOpenSelectProctors}>
                        Select Manual Proctors ({selectedTAs.length})
                      </button>
                      <p className="hint-text">
                        You can manually select specific TAs as proctors
                      </p>
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
                    <p className="hint-text">
                      Number of TAs to be automatically assigned based on workload
                    </p>
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
                      Prioritize TAs of selected course
                    </label>
                    <p className="hint-text">
                      TAs will be prioritized in this order: 1) Department TAs, 2) Part-time TAs for weekend exams, 3) Course TAs (if checkbox selected), 4) Other TAs by workload.
                      For graduate courses, PhD TAs will also be prioritized. TAs with approved leave requests on the exam date cannot be assigned.
                    </p>
                  </div>

                  <div className="form-row">
                    <div className="proctor-selection-row">
                      <button type="button" className="select-proctor-btn" onClick={handleOpenSelectProctors}>
                        Select Manual Proctors ({selectedTAs.length})
                      </button>
                      <p className="hint-text">
                        You can manually select specific TAs as proctors
                      </p>
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
                
                <div className="assignment-options">
                  <div className="form-row checkbox-row">
                    <label className="checkbox-container">
                      <input
                          type="checkbox"
                          name="prioritizeCourseAssistants"
                          checked={formData.prioritizeCourseAssistants}
                          onChange={handleInputChange}
                      />
                      <span className="checkmark"></span>
                      Prioritize TAs of selected course
                    </label>
                    <p className="hint-text">
                      TAs will be prioritized in this order: 1) Department TAs, 2) Part-time TAs for weekend exams, 3) Course TAs (if checkbox selected), 4) Other TAs by workload.
                      For graduate courses, PhD TAs will also be prioritized. TAs with approved leave requests on the exam date cannot be assigned.
                    </p>
                  </div>
                  
                  <div className="form-row">
                    <label>Number of Automatic Proctors:</label>
                    <input
                        type="number"
                        name="proctorNum"
                        value={formData.proctorNum}
                        onChange={handleInputChange}
                        required
                        min="0"
                    />
                    <p className="hint-text">
                      This is the number of TAs that will be automatically assigned based on workload when the exam is created.
                    </p>
                  </div>
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
                
                <div className="ta-list-container">
                  <h4>Available TAs</h4>
                  <div className="ta-list">
                    {filteredTAs.map(ta => {
                      const isOnLeave = ta.leaveStatus === 'APPROVED' || ta.isOnLeave;
                      const leaveMessage = isOnLeave
                        ? `${ta.name} has an approved leave request that overlaps with this exam date (${formData.date})`
                        : '';

                      const isSelected = selectedTAs.some(sel => sel.id === ta.id);

                      return (
                        <div
                          key={ta.id}
                          className={`ta-option
                                      ${isOnLeave ? 'ta-on-leave' : ''}
                                      ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            if (isOnLeave) {
                              alert(leaveMessage);
                            } else {
                              // toggle selection
                              if (isSelected) {
                                setSelectedTAs(selectedTAs.filter(sel => sel.id !== ta.id));
                              } else {
                                setSelectedTAs([...selectedTAs, ta]);
                              }
                            }
                          }}
                          title={isOnLeave ? leaveMessage : ''}
                        >
                          <span>{ta.name}</span>
                          <div className="ta-details">
                            {ta.workload && <span className="ta-workload">Workload: {ta.workload}h</span>}
                            {ta.department && <span className="ta-department">Dept: {ta.department}</span>}
                            {ta.department === formData.department && <span className="ta-same-dept-badge">Same Dept</span>}
                            {ta.isPHD && <span className="ta-phd-badge">PhD</span>}
                            {ta.isPartTime && <span className="ta-part-time-badge">Part-time</span>}
                            {isOnLeave && <span className="ta-on-leave-badge">On Leave</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="selected-tas-container">
                  <h4>Number of Selected Proctors: {selectedTAs.length}</h4>
                </div>
                
                <div className="assignment-buttons">
                  <button className="primary-btn" onClick={closeSelectProctors}>
                    Done
                  </button>
                  <button className="secondary-btn" onClick={() => {
                    // Clear manually selected TAs
                    setSelectedTAs([]);
                  }}>
                    Clear Selection
                  </button>
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
                            {ta.name} - {ta.department}
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