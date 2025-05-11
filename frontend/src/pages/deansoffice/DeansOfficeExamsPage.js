import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import axios from 'axios';
import './DeansOfficeExamsPage.css';
import './DeansOfficeMainPage.css';
import DeansOfficeNavBar from './DeansOfficeNavBar';
const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5001') + '/api';


function DeansOfficeExamsPage() {
  // State variables
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

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
  const [oldProctorId, setOldProctorId] = useState(null);
  const [oldProctorName, setOldProctorName] = useState('');

  const [availableDepartments, setAvailableDepartments] = useState([]);

  // Helper to retrieve JWT and set header
  function getAuthHeader() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log("tokennnnn", token);
    if (!token) throw new Error('No authentication token found');
    return { Authorization: `Bearer ${token}` };
  }

// Handler for printing students alphabetically
const handlePrintStudentsAlphabetically = async (examId) => {
  try {
    console.log(`Starting PDF generation for examId: ${examId}`);
    const endpoint = `${API_URL}/dean/exams/${examId}/print-students-alphabetically`;
    console.log(`Sending request to ${endpoint}`);
    
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }
    
    console.log('Authorization token retrieved');
    
    // Use axios to make a request to download the PDF
    const response = await axios.get(endpoint, {
      responseType: 'blob', // Important for file downloads
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response received from API:', response.status, response.headers);
    
    // Check if we actually got a PDF
    if (response.headers['content-type'] !== 'application/pdf') {
      console.error('Response is not a PDF. Content type:', response.headers['content-type']);
      
      // Try to read the error message if it's JSON
      if (response.headers['content-type'].includes('application/json')) {
        const reader = new FileReader();
        reader.onload = function() {
          try {
            const errorJson = JSON.parse(reader.result);
            console.error('Server error:', errorJson);
            alert(`Error: ${errorJson.message || 'Unknown server error'}`);
          } catch (e) {
            console.error('Could not parse error JSON:', e);
            alert('Failed to generate PDF. Server returned an error.');
          }
        };
        reader.readAsText(response.data);
        return;
      } else {
        throw new Error('Response is not a PDF');
      }
    }
    
    console.log('Creating blob from response data');

    // Create a blob URL and trigger download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from response headers if available
    const contentDisposition = response.headers['content-disposition'];
    let filename = `print_alphabetical.pdf`;
    
    if (contentDisposition) {
      console.log('Content-Disposition header:', contentDisposition);
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch && filenameMatch.length === 2) {
        filename = filenameMatch[1];
        console.log(`Extracted filename: ${filename}`);
      } else {
        console.warn('Filename could not be extracted from Content-Disposition');
      }
    } else {
      console.warn('No Content-Disposition header found');
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    console.log('Download triggered and cleanup done');
  } catch (error) {
    console.error('Error printing students alphabetically:', error);
    
    // Enhanced error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Server error data:', error.response.data);
      console.error('Server error status:', error.response.status);
      console.error('Server error headers:', error.response.headers);
      
      if (error.response.status === 404) {
        alert('Error: The API endpoint for PDF generation was not found. Please check your route configuration.');
      } else if (error.response.status === 401) {
        alert('Error: You are not authorized to access this function. Please log in again.');
      } else {
        alert(`Error: Server returned ${error.response.status}. ${error.response.data?.message || ''}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      alert('Error: No response received from server. Please check your network connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      alert(`Failed to generate PDF. Error: ${error.message}`);
    }
  }
};

// Handler for printing students randomly
const handlePrintStudentsRandomly = async (examId) => {
  try {
    console.log(`Starting PDF generation for examId: ${examId}`);
    const endpoint = `${API_URL}/dean/exams/${examId}/print-students-randomly`;
    console.log(`Sending request to ${endpoint}`);
    
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }
    
    console.log('Authorization token retrieved');
    
    // Use axios to make a request to download the PDF
    const response = await axios.get(endpoint, {
      responseType: 'blob', // Important for file downloads
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response received from API:', response.status, response.headers);
    
    // Check if we actually got a PDF
    if (response.headers['content-type'] !== 'application/pdf') {
      console.error('Response is not a PDF. Content type:', response.headers['content-type']);
      
      // Try to read the error message if it's JSON
      if (response.headers['content-type'].includes('application/json')) {
        const reader = new FileReader();
        reader.onload = function() {
          try {
            const errorJson = JSON.parse(reader.result);
            console.error('Server error:', errorJson);
            alert(`Error: ${errorJson.message || 'Unknown server error'}`);
          } catch (e) {
            console.error('Could not parse error JSON:', e);
            alert('Failed to generate PDF. Server returned an error.');
          }
        };
        reader.readAsText(response.data);
        return;
      } else {
        throw new Error('Response is not a PDF');
      }
    }
    
    console.log('Creating blob from response data');

    // Create a blob URL and trigger download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from response headers if available
    const contentDisposition = response.headers['content-disposition'];
    let filename = `print_random.pdf`;
    
    if (contentDisposition) {
      console.log('Content-Disposition header:', contentDisposition);
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch && filenameMatch.length === 2) {
        filename = filenameMatch[1];
        console.log(`Extracted filename: ${filename}`);
      } else {
        console.warn('Filename could not be extracted from Content-Disposition');
      }
    } else {
      console.warn('No Content-Disposition header found');
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    console.log('Download triggered and cleanup done');
  } catch (error) {
    console.error('Error printing students randomly:', error);
    
    // Enhanced error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Server error data:', error.response.data);
      console.error('Server error status:', error.response.status);
      console.error('Server error headers:', error.response.headers);
      
      if (error.response.status === 404) {
        alert('Error: The API endpoint for PDF generation was not found. Please check your route configuration.');
      } else if (error.response.status === 401) {
        alert('Error: You are not authorized to access this function. Please log in again.');
      } else {
        alert(`Error: Server returned ${error.response.status}. ${error.response.data?.message || ''}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      alert('Error: No response received from server. Please check your network connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      alert(`Failed to generate PDF. Error: ${error.message}`);
    }
  }
};
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
    department: []
  });

  // Search filter for TAs
  const [taSearchQuery, setTaSearchQuery] = useState('');

  // Fetch available courses
  const fetchCourses = async () => {
    try {
      // Using a different endpoint that returns only the dean's courses
      const headers = getAuthHeader();

      const response = await axios.get(`${API_URL}/dean/courses`, { headers });
      if (response.data.success) {
        setCourses(response.data.data);
      } else {
        console.error('Failed to fetch dean courses');
      }
    } catch (err) {
      console.error('Error fetching dean courses:', err);
    }
  };

  // Handle course selection
  const handleCourseSelect = (e) => {
    const courseId = e.target.value;
    const selectedCourse = courses.find(course => course.id === courseId);
    setFormData({ ...formData, courseName: courseId, department: selectedCourse.department });
  };

  // Fetch exams and courses from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const headers = getAuthHeader();
        // Fetch only exams for courses taught by the current dean
        const examsResponse = await axios.get(`${API_URL}/dean/exams`, { headers });
        if (examsResponse.data.success) {
          setExams(examsResponse.data.data);
        } else {
          setError('Failed to fetch exams');
        }
        // Fetch dean's courses
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

  // Add an effect to fetch courses when modals open
  useEffect(() => {
    if (isAddExamOpen || isChangeExamOpen) {
      fetchCourses();
      fetchClassrooms(); // Also fetch classrooms
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

  useEffect(() => {
    if (courses.length) {
        // define arr of cs eee me ie
        const depts = ['CS', 'EEE', 'ME', 'IE'];

      setAvailableDepartments(depts);
    }
  }, [courses]);

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
        `${API_URL}/dean/available-tas-for-exam${queryParams ? '?' + queryParams : ''}`, 
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
          // Debug logging for department matching
          console.log(`Comparing TAs: ${a.name} (dept: ${a.department}) vs ${b.name} (dept: ${b.department})`);
          console.log(`Exam department: ${department}`);
          console.log(`${a.name} isSameDepartment: ${a.isSameDepartment}, ${b.name} isSameDepartment: ${b.isSameDepartment}`);
        
          // First prioritize same department (HIGHEST PRIORITY)
          // Same department TAs are ALWAYS prioritized over other department TAs
          if (a.isSameDepartment && !b.isSameDepartment) return -1;
          if (!a.isSameDepartment && b.isSameDepartment) return 1;
          
          // If both TAs are from the same department (or both from different departments),
          // then consider the other factors
          
          // For weekend exams, prioritize part-time TAs
          if (isWeekend) {
            if (a.isPartTime && !b.isPartTime) return -1;
            if (!a.isPartTime && b.isPartTime) return 1;
          }
          // For weekday exams, prioritize full-time TAs
          else {
            if (!a.isPartTime && b.isPartTime) return -1;
            if (a.isPartTime && !b.isPartTime) return 1;
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
      const response = await axios.get(`${API_URL}/dean/exams/${examId}/swap-history`, { headers });
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
      department: '',
      departments: []
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
    fetchSwapTAs(exam);
    // Add detailed log to check proctors data including their status
    console.log("All proctors for this exam:", exam.proctors);
    if (exam.proctors) {
      const pendingProctors = exam.proctors.filter(p => p.status === 'PENDING');
      const acceptedProctors = exam.proctors.filter(p => p.status === 'ACCEPTED');
      console.log(`Pending proctors: ${pendingProctors.length}`, pendingProctors);
      console.log(`Accepted proctors: ${acceptedProctors.length}`, acceptedProctors);
    }
  };

  // Function to fetch TAs available for swapping (excluding current proctors)
  const fetchSwapTAs = async (exam) => {
    try {
      const headers = getAuthHeader();
      const department = exam.department;
      const examDate = exam.date ? new Date(exam.date) : null;
      
      // Format date for API query
      const formattedExamDate = examDate ? examDate.toISOString().split('T')[0] : '';
      
      // Build query parameters
      let queryParams = '';
      if (exam.courseName) queryParams += `courseId=${exam.courseName}`;
      if (department) {
        if (queryParams) queryParams += '&';
        queryParams += `department=${department}`;
      }
      if (formattedExamDate) {
        if (queryParams) queryParams += '&';
        queryParams += `examDate=${formattedExamDate}`;
      }
      
      // Get IDs of all proctors associated with this exam (all statuses)
      const acceptedProctorIds = exam.proctors 
        ? exam.proctors.filter(p => p.status === 'ACCEPTED').map(p => p.id) 
        : [];
      
      const pendingProctorIds = exam.proctors 
        ? exam.proctors.filter(p => p.status === 'PENDING').map(p => p.id) 
        : [];
        
      const swappedProctorIds = exam.proctors 
        ? exam.proctors.filter(p => p.status === 'SWAPPED').map(p => p.id) 
        : [];
        
      const rejectedProctorIds = exam.proctors 
        ? exam.proctors.filter(p => p.status === 'REJECTED').map(p => p.id) 
        : [];
      
      // Combine all proctor IDs to exclude
      const allProctorIdsToExclude = [
        ...acceptedProctorIds,
        ...pendingProctorIds,
        ...swappedProctorIds,
        ...rejectedProctorIds
      ];
      
      console.log("ACCEPTED proctors:", acceptedProctorIds);
      console.log("PENDING proctors:", pendingProctorIds);
      console.log("SWAPPED proctors:", swappedProctorIds);
      console.log("REJECTED proctors:", rejectedProctorIds);
      console.log("ALL proctors to exclude:", allProctorIdsToExclude);
      
      const response = await axios.get(
        `${API_URL}/dean/available-tas-for-exam${queryParams ? '?' + queryParams : ''}`, 
        { headers }
      );
      
      if (response.data.success) {
        console.log("All available TAs before filtering:", response.data.data.length);
        
        // Filter out all current, pending, swapped, and rejected proctors
        const filteredTAs = response.data.data
          .filter(ta => {
            const isExistingProctor = allProctorIdsToExclude.includes(ta.id);
            if (isExistingProctor) {
              console.log(`Excluded existing proctor: ${ta.name} (${ta.id})`);
            }
            return !isExistingProctor;
          })
          .filter(ta => !ta.hasProctoringConflict)
          .filter(ta => !ta.hasOfferingConflict)
          .filter(ta => !ta.hasOfferingCourseExamConflict);
        
        console.log("Available TAs after filtering out all exam proctors:", filteredTAs.length);
        setAvailableTAs(filteredTAs);
      }
    } catch (error) {
      console.error('Error fetching available TAs for swap:', error);
    }
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

  // Handle classroom selection
  const handleClassroomSelect = (e) => {
    const selectedClassroomId = e.target.value;
    
    if (selectedClassroomId && !formData.classrooms.includes(selectedClassroomId)) {
      setFormData({
        ...formData,
        classrooms: [...formData.classrooms, selectedClassroomId]
      });
    }
  };

  const handleRemoveClassroom = (classroomId) => {
    setFormData({
      ...formData,
      classrooms: formData.classrooms.filter(id => id !== classroomId)
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
      // Check if selected classrooms have enough capacity for the course
      if (formData.courseName) {
        const selectedCourse = courses.find(course => course.id === formData.courseName);
        if (selectedCourse && selectedCourse.studentCount) {
          // Calculate total capacity from selected classrooms (0 if no classrooms)
          const totalCapacity = formData.classrooms.length === 0 ? 0 : formData.classrooms.reduce((total, classroomId) => {
            const classroom = classrooms.find(c => c.id === classroomId);
            return total + (classroom ? (classroom.examSeatingCapacity || classroom.capacity || 0) : 0);
          }, 0);
          
          // If course student count exceeds classroom capacity (or no classrooms), show warning and stop submission
          if (selectedCourse.studentCount > totalCapacity) {
            // Custom message for no classrooms case
            const errorMsg = formData.classrooms.length === 0 
              ? `Error: The course has ${selectedCourse.studentCount} students, but no classrooms are selected. Please select classrooms with enough capacity.`
              : `Error: The course has ${selectedCourse.studentCount} students, but the selected classrooms only have a total capacity of ${totalCapacity}. Please select additional classrooms to accommodate all students.`;
            
            alert(errorMsg);
            return; // Stop form submission
          }
        }
      }
      
      const headers = getAuthHeader();

      let examResponse;
      if (isAddExamOpen) {
        // For creating new exam - Calculate duration and format date/time
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

        // Prepare full exam data for API
        const examData = {
          ...formData,
          duration: durationMinutes,
          manualAssignedTAs: selectedTAs.length,
          date: examDate.toISOString(),
          startTime: startTimeStr,
          endTime: endTimeStr,
          department: formData.department,
          departments: formData.departments,
        };

        console.log('Submitting new exam data:', examData);
        // Create new exam
        examResponse = await axios.post(`${API_URL}/dean/exams`, examData, { headers });
        
        if (examResponse.data.success) {
          // Get the exam ID
          const examId = examResponse.data.data.id;
          
          // Format date for leave request checking
          const formattedExamDate = examDate.toISOString().split('T')[0];
          
          // Double-check if any selected TAs have leave conflicts
          // Fetch all approved leave requests that overlap with the exam date
          try {
            // Only proceed with the TAs that don't have leave conflicts
            const leaveCheckResponse = await axios.get(
              `${API_URL}/dean/check-ta-leave?examDate=${formattedExamDate}`,
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
              
              // Always assign proctors automatically as part of exam creation
              const proctorAssignmentData = {
                examId,
                courseName: formData.courseName,
                manuallySelectedTAs: filteredSelectedTAs.map(ta => ta.id),
                proctorNum: formData.proctorNum,
                prioritizeCourseAssistants: false,
                prioritizeDepartmentTAs: true, 
                prioritizePartTimeForWeekend: true,
                autoAssignRemainingTAs: true,
                department: formData.department,
                examDate: formattedExamDate,
                checkLeaveRequests: true,
                strictLeaveCheck: true,
                departments: formData.departments
              };
              
              try {
                // Assign proctors immediately after creating the exam
                console.log('Assigning proctors with data:', proctorAssignmentData);
                await axios.post(`${API_URL}/dean/exams/assign-proctors`, proctorAssignmentData, { headers });
                console.log("Proctors assigned successfully");
              } catch (proctorError) {
                console.error('Error assigning proctors:', proctorError);
                alert('Exam was created but proctor assignment failed: ' + 
                      (proctorError.response?.data?.message || proctorError.message));
              }
            }
          } catch (leaveCheckError) {
            console.error('Error checking TA leave status:', leaveCheckError);
            // Fall back to traditional proctor assignment
            const proctorAssignmentData = {
              examId,
              courseName: formData.courseName,
              manuallySelectedTAs: selectedTAs.map(ta => ta.id),
              proctorNum: formData.proctorNum,
              prioritizeCourseAssistants: formData.prioritizeCourseAssistants,
              prioritizeDepartmentTAs: true,
              prioritizePartTimeForWeekend: true,
              autoAssignRemainingTAs: true,
              department: formData.department,
              examDate: formattedExamDate,
              checkLeaveRequests: true,
              strictLeaveCheck: true
            };
            
            try {
              await axios.post(`${API_URL}/dean/exams/assign-proctors`, proctorAssignmentData, { headers });
              console.log("Proctors assigned successfully (fallback)");
            } catch (proctorError) {
              console.error('Error assigning proctors:', proctorError);
              alert('Exam was created but proctor assignment failed: ' + 
                    (proctorError.response?.data?.message || proctorError.message));
            }
          }
        }
      } else {
        // For updating existing exam - only update examType and classrooms
        const updateData = {
          examType: formData.examType,
          classrooms: formData.classrooms
        };
        
        console.log('Updating exam with data:', updateData);
        // Update existing exam with minimal data
        examResponse = await axios.put(`${API_URL}/dean/exams/${selectedExam.id}`, updateData, { headers });
      }

      if (examResponse.data.success) {
        // Refresh the exams list
        const examsResponse = await axios.get(`${API_URL}/dean/exams`, { headers });
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
      setIsLoading(true);
      const headers = getAuthHeader();
      const oldProctorId = e.target.oldProctor.value;
      const newProctorId = e.target.newProctor.value;

      if (!oldProctorId || !newProctorId) {
        setIsLoading(false);
        return;
      }

      console.log(`Requesting to swap proctor ${oldProctorId} with ${newProctorId}`);

      // Get the old proctor's data for workload updates
      const oldProctor = selectedExam.proctors.find(p => p.id === oldProctorId);
      if (!oldProctor) {
        throw new Error('Selected proctor not found');
      }

      // Use the request-swap-proctor endpoint instead of immediate swap
      const response = await axios.post(
        `${API_URL}/dean/exams/${selectedExam.id}/request-swap-proctor`, 
        {
          oldProctorId,
          newProctorId
        }, 
        { headers }
      );
      console.log("responseeee", response);
      if (response.data.success) {
        // Only update workload if the proctor had ACCEPTED status (not PENDING)
        if (oldProctor.status === 'ACCEPTED') {
          try {
            await axios.post(
              `${API_URL}/dean/update-ta-workload`, 
              {
                taId: oldProctorId,
                examId: selectedExam.id,
                action: 'SWAP', // This action tells the backend to reduce the workload
                examDepartment: selectedExam.department,
                isOldProctorSameDepartment: oldProctor.department === selectedExam.department
              }, 
              { headers }
            );
            console.log(`Updated workload for swapped proctor ${oldProctor.name} (status was ACCEPTED)`);
          } catch (workloadError) {
            console.error('Error updating proctor workload:', workloadError);
            // Continue with UI updates even if workload update fails
          }
        } else {
          console.log(`No workload update for ${oldProctor.name} (status was ${oldProctor.status}, not ACCEPTED)`);
        }

        // First update the local state to immediately show the change
        // Find the proctor to be swapped and update its status
        const updatedProctors = selectedExam.proctors.map(proctor => {
          if (proctor.id === oldProctorId) {
            console.log(`Marking proctor ${proctor.name} (${proctor.id}) as SWAPPED`);
            return { ...proctor, status: 'SWAPPED' };
          }
          return proctor;
        });
        
        // Create a new object with updated proctors
        const updatedExam = { ...selectedExam, proctors: updatedProctors };
        setSelectedExam(updatedExam);
        
        // Update the exam in the exams list
        const updatedExams = exams.map(exam => {
          if (exam.id === selectedExam.id) {
            return { ...exam, proctors: updatedProctors };
          }
          return exam;
        });
        setExams(updatedExams);
        
        // Then refresh exams to get updated proctor list from the server
        const examsResponse = await axios.get(`${API_URL}/dean/exams`, { headers });
        if (examsResponse.data.success) {
          setExams(examsResponse.data.data);
        }
        
        setSuccess('Proctor swap request sent successfully! The proctor has been marked as SWAPPED.');
        closeAllModals();
      }
    } catch (err) {
      console.error('Error swapping TA:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to send proctor swap request');
      setShowError(true);
    } finally {
      setIsLoading(false);
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
        const response = await axios.delete(`${API_URL}/dean/exams/${examId}`, { headers });

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

  const handleDepartmentCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData(fd => {
      const next = checked
        ? [...fd.departments, value]
        : fd.departments.filter(d => d !== value);
      return { ...fd, departments: next };
    });
  };

  // Fetch available classrooms
  const fetchClassrooms = async () => {
    try {
      const headers = getAuthHeader();
      const response = await axios.get(`${API_URL}/dean/classrooms`, { headers });
      
      if (response.data.success) {
        setClassrooms(response.data.data);
      } else {
        console.error('Failed to fetch classrooms');
      }
      console.log("responseeee", response);
    } catch (err) {
      console.error('Error fetching classrooms:', err);
    }
  };

  // Function to fetch available proctors for swapping
  const fetchAvailableProctors = async (exam, currentProctorId) => {
    try {
      const headers = getAuthHeader();
      const department = exam.department;
      const examDate = exam.date ? new Date(exam.date) : null;
      
      // Format date for API query
      const formattedExamDate = examDate ? examDate.toISOString().split('T')[0] : '';

      // Build query parameters
      let queryParams = '';
      if (exam.courseName) queryParams += `courseId=${exam.courseName}`;
      if (department) {
        if (queryParams) queryParams += '&';
        queryParams += `department=${department}`;
      }
      if (formattedExamDate) {
        if (queryParams) queryParams += '&';
        queryParams += `examDate=${formattedExamDate}`;
      }

      const response = await axios.get(
        `${API_URL}/dean/available-tas-for-exam${queryParams ? '?' + queryParams : ''}`, 
        { headers }
      );

      if (response.data.success) {
        // Get all current proctor IDs to exclude them
        const currentProctorIds = exam.proctors 
          ? exam.proctors.map(p => p.id) 
          : [];
        
        // Filter out the current proctors, conflicting proctors, and rejected proctors
        const proctors = response.data.data
          .filter(ta => !currentProctorIds.includes(ta.id)) // Filter out all current proctors
          .filter(ta => !ta.hasProctoringConflict)
          .filter(ta => !ta.hasOfferingConflict)
          .filter(ta => !ta.hasOfferingCourseExamConflict);
        
        // Additionally, filter out TAs who have rejected this exam
        const rejectedTAs = exam.proctors 
          ? exam.proctors.filter(p => p.status === 'REJECTED').map(p => p.id) 
          : [];
        
        const filteredProctors = proctors.filter(ta => !rejectedTAs.includes(ta.id));
        
        // Sort by department match (same department first)
        const sortedProctors = filteredProctors.sort((a, b) => {
          if (a.isSameDepartment && !b.isSameDepartment) return -1;
          if (!a.isSameDepartment && b.isSameDepartment) return 1;
          return 0;
        });
      }
    } catch (error) {
      console.error('Error fetching available proctors:', error);
    }
  };

  return (
      <div className="dean-exams-page">
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

            {loading ? (
                <div className="loading-message">Loading exams...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : exams.length === 0 ? (
                <div className="no-exams-message">No exams found. Add your first exam.</div>
            ) : (
              <div className="cards-container">
                {exams.map(exam => {
                  // find the full course object for this exam
                  const course = courses.find(c => c.id === exam.courseName);
                  // use courseCode if available, otherwise fall back to whatever's in exam.courseName
                  const displayCode = course?.courseCode || exam.courseName;
                  return (
                    <div className="exam-card" key={exam.id}>
                      <div className="exam-card-header">
                        <h3>
                          {displayCode} {exam.examType}
                        </h3>
                        <button
                          className="delete-exam-btn"
                          title="Delete Exam"
                          onClick={() => handleDeleteExam(exam.id)}
                        >
                          <span className="delete-icon">×</span>
                          <span className="delete-text">Delete</span>
                        </button>
                      </div>
                      <p>
                        <strong>Current Proctor(s):</strong>{" "}
                        {exam.proctors
                          ? exam.proctors
                              .filter(p => p.status === "ACCEPTED")
                              .map(p => p.name)
                              .join(", ") || "None"
                          : "None"}
                      </p>
                      <p>
                        <strong>Pending Proctor(s):</strong>{" "}
                        {exam.proctors
                          ? exam.proctors
                              .filter(p => p.status === "PENDING")
                              .map(p => p.name)
                              .join(", ") || "None"
                          : "None"}
                      </p>
                      <p>
                        <strong>Duration(in minutes):</strong> {exam.duration}
                      </p>
                      <p>
                        <strong>Date:</strong>{" "}
                        {exam.formattedDate ||
                          (exam.date
                            ? new Date(exam.date).toLocaleDateString("tr-TR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })
                            : "No date")}
                      </p>
                      <p>
                        <strong>Exam Type:</strong> {exam.examType}
                      </p>
                      <div className="card-buttons">
                        <button onClick={() => handleOpenSwapTAs(exam)}>Swap TA</button>
                        <button onClick={() => handlePrintStudentsAlphabetically(exam.id)}>
                          Print Students Alphabetically
                        </button>
                        <button onClick={() => handlePrintStudentsRandomly(exam.id)}>
                          Print Students Randomly
                        </button>
                      </div>
                    </div>
                  );
              })}
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
                                {course.department}{course.courseCode} ({course.courseName})
                              </option>
                          ))
                      ) : (
                          <option value="" disabled>Loading courses...</option>
                      )}
                    </select>
                  </div>

                  <div className="form-row checkbox-row">
                    <label>Departments:</label>
                    <div className="checkbox-group">
                        {availableDepartments.map(dept => (
                        <label key={dept} className="checkbox-container">
                            <input
                            type="checkbox"
                            value={dept}
                            checked={formData.departments.includes(dept)}
                            onChange={handleDepartmentCheckboxChange}
                            />
                            <span className="checkbox-label">{dept}</span>
                        </label>
                        ))}
                    </div>
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
                      <select 
                        onChange={handleClassroomSelect}
                        value=""
                      >
                        <option value="">Select a classroom</option>
                        {classrooms.map(classroom => (
                          <option 
                            key={classroom.id} 
                            value={classroom.id}
                            disabled={formData.classrooms.includes(classroom.id)}
                          >
                            {classroom.building} - {classroom.name} (Capacity: {classroom.examSeatingCapacity || classroom.capacity})
                          </option>
                        ))}
                      </select>
                      <div className="selected-classrooms">
                        {formData.classrooms.map((classroomId) => {
                          const classroom = classrooms.find(c => c.id === classroomId);
                          return classroom ? (
                            <div key={classroomId} className="classroom-tag">
                              {classroom.building} - {classroom.name}
                              <span className="remove-tag" onClick={() => handleRemoveClassroom(classroomId)}>×</span>
                            </div>
                          ) : null;
                        })}
                      </div>
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
    
  </label>
  <div></div>

  <div className="hint-text">
    TAs will be prioritized in this order:<br />
    1) Department<br />
    2) Full-time and Part-time<br />
    3) Course TAs (if checkbox selected)<br />
    For graduate courses, PhD TAs will also be prioritized.<br />
    TAs with approved leave requests on the exam date cannot be assigned.
  </div>
                  </div>

                  <div className="form-row">
                    <div className="proctor-selection-row">
                      <button type="button" className="select-proctor-btn" onClick={handleOpenSelectProctors}>
                        Select Manual Proctors ({selectedTAs.length})
                      </button>
                      <p className="hint-text">
                        You can manually select the TAs.
                      </p>
                    </div>
                  </div>

                  <div className="button-row">
                    <button type="submit" className="add-primary-btn">ADD</button>
                    <button type="button" className="close-btn" onClick={closeAllModals}>X</button>
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
                        disabled
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
                        readOnly
                        className="readonly-input"
                    />
                  </div>

                  <div className="form-row">
                    <label>Date:</label>
                    <div className="date-input-container">
                      <input
                          type="date"
                          value={formData.date}
                          className="date-input readonly-input"
                          readOnly
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
                          className="readonly-input"
                          readOnly
                      />
                    </div>
                    <div className="time-container">
                      <label>End time:</label>
                      <input
                          type="time"
                          name="endTime"
                          value={formData.endTime}
                          className="readonly-input"
                          readOnly
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <label>Classroom(s):</label>
                    <div className="classroom-container">
                      <select 
                        onChange={handleClassroomSelect}
                        value=""
                      >
                        <option value="">Select a classroom</option>
                        {classrooms.map(classroom => (
                          <option 
                            key={classroom.id} 
                            value={classroom.id}
                            disabled={formData.classrooms.includes(classroom.id)}
                          >
                            {classroom.building} - {classroom.name} (Capacity: {classroom.examSeatingCapacity || classroom.capacity})
                          </option>
                        ))}
                      </select>
                      <div className="selected-classrooms">
                        {formData.classrooms.map((classroomId) => {
                          const classroom = classrooms.find(c => c.id === classroomId);
                          return classroom ? (
                            <div key={classroomId} className="classroom-tag">
                              {classroom.building} - {classroom.name}
                              <span className="remove-tag" onClick={() => handleRemoveClassroom(classroomId)}>×</span>
                            </div>
                          ) : null;
                        })}
                      </div>
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
                <div className="dean-assign-modal-header">
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
                  {!swapHistory || swapHistory.length === 0 ? (
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
                <h2>Request TA Swap for {selectedExam.courseName} {selectedExam.examType}</h2>
                <div className="swap-proctor-info">
                  <p>This will send a request to the selected TA to take over the proctoring assignment. The TA will need to accept your request before the swap is finalized.</p>
                </div>
                <form onSubmit={handleSwapTA}>
                  <p>Current Proctor(s): {selectedExam.proctors ? selectedExam.proctors
                    .filter(p => p.status === 'ACCEPTED' || p.status === 'PENDING')
                    .map(p => `${p.name} ${p.status === 'PENDING' ? '(pending)' : ''}`)
                    .join(', ') : 'None'}</p>
                  <div className="form-row">
                    <label>Proctor To Swap:</label>
                    <select name="oldProctor" required>
                      <option value="">Select Proctor</option>
                      {selectedExam.proctors && selectedExam.proctors
                        .filter(p => p.status === 'ACCEPTED' || p.status === 'PENDING')
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} {p.status === 'PENDING' ? '(pending)' : ''}
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
                    <button 
                      type="submit" 
                      className="primary-btn"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Sending Request...' : 'Send Swap Request'}
                    </button>
                    <button 
                      type="button" 
                      className="close-btn" 
                      onClick={closeAllModals}
                      disabled={isLoading}
                    >
                      Close
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="success-message">
            {success}
            <button onClick={() => setSuccess(null)} className="close-success-btn">×</button>
          </div>
        )}

        {/* Error Message */}
        {showError && (
          <div className="error-message" style={{ position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#f8d7da', padding: '10px 20px', borderRadius: '4px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)', zIndex: 9999 }}>
            {errorMessage}
            <button onClick={() => setShowError(false)} className="close-success-btn" style={{ background: 'none', border: 'none', color: '#721c24', fontSize: '20px', cursor: 'pointer', marginLeft: '10px' }}>×</button>
          </div>
        )}
      </div>
  );
}

export default DeansOfficeExamsPage;