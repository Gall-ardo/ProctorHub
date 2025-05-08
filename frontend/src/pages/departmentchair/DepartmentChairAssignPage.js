import React, { useState, useEffect } from 'react';
import './DepartmentChairAssignPage.css';
import DepartmentChairNavBar from './DepartmentChairNavBar';
import axios from 'axios';

function DepartmentChairAssignPage() {
    const [availableTAs, setAvailableTAs] = useState([]);
    const [departmentCourses, setDepartmentCourses] = useState([]);
    const [taRequests, setTaRequests] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedTAs, setSelectedTAs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showPreferencesModal, setShowPreferencesModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // API URL setup with fallback to localhost
    const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5001') + '/api';

    // Helper to retrieve JWT and set header
    function getAuthHeader() {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        return { Authorization: `Bearer ${token}` };
    }

    // Fetch department data on component mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const headers = getAuthHeader();
                const chairData = await axios.get(`${API_URL}/chair/profile`, { headers });
                const department = chairData.data.data?.department;

                if (!department) {
                    throw new Error('Department information not found');
                }

                // Fetch all data in parallel
                const [coursesResponse, tasResponse, requestsResponse] = await Promise.all([
                    axios.get(`${API_URL}/chair/department-courses/${department}`, { headers }),
                    axios.get(`${API_URL}/chair/available-tas`, { headers }),
                    axios.get(`${API_URL}/chair/ta-requests`, { headers })
                ]);

                setDepartmentCourses(coursesResponse.data.data || []);
                setAvailableTAs(tasResponse.data.data || []);
                setTaRequests(requestsResponse.data.data || []);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load department data. Please try again later.");
                
                // For development - initialize with mock data if API fails
                if (process.env.NODE_ENV === 'development') {
                    initializeWithMockData();
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [API_URL]);

    // Initialize with mock data for development or when API fails
    const initializeWithMockData = () => {
        const mockTAs = [
            { id: '1', name: 'Sude Ergün', department: 'Computer Science', email: 'sude@example.com' },
            { id: '2', name: 'Rıdvan Yılmaz', department: 'Computer Science', email: 'ridvan@example.com' },
            { id: '3', name: 'Ziya Özgül', department: 'Computer Science', email: 'ziya@example.com' },
            { id: '4', name: 'Ahmet Tekin', department: 'Computer Science', email: 'ahmet@example.com' },
            { id: '5', name: 'Elif Demir', department: 'Computer Science', email: 'elif@example.com' },
        ];

        const mockCourses = [
            { 
                id: '101', 
                courseCode: 'CS101', 
                courseName: 'Introduction to Computer Science',
                department: 'Computer Science',
                credit: 3,
                studentCount: 120,
                taNeeded: 3,
                assignedTAs: 2,  // This course already has 2 TAs assigned
                assignedTAIds: ['1', '2'] // IDs of TAs assigned to this course
            },
            { 
                id: '202', 
                courseCode: 'CS202', 
                courseName: 'Data Structures',
                department: 'Computer Science',
                credit: 4,
                studentCount: 80,
                taNeeded: 2,
                assignedTAs: 1,  // This course already has 1 TA assigned
                assignedTAIds: ['3'] // IDs of TAs assigned to this course
            },
            { 
                id: '301', 
                courseCode: 'CS301', 
                courseName: 'Algorithms',
                department: 'Computer Science',
                credit: 4,
                studentCount: 60,
                taNeeded: 2,
                assignedTAs: 0,  // This course has no TAs assigned yet
                assignedTAIds: [] // No TAs assigned to this course
            },
        ];

        const mockRequests = [
            {
                id: 'req1',
                courseId: '101',
                course: { 
                    courseCode: 'CS101', 
                    courseName: 'Introduction to Computer Science'
                },
                instructorId: 'inst1',
                instructor: { 
                    name: 'Dr. Mehmet Aydın',
                    department: 'Computer Science'
                },
                taId: '1',
                ta: {
                    name: 'Sude Ergün',
                    email: 'sude@example.com',
                    department: 'Computer Science'
                },
                priority: 'High',
                reason: 'Excellent knowledge in teaching fundamentals',
                status: 'pending'
            },
            {
                id: 'req2',
                courseId: '101',
                course: { 
                    courseCode: 'CS101', 
                    courseName: 'Introduction to Computer Science'
                },
                instructorId: 'inst1',
                instructor: { 
                    name: 'Dr. Mehmet Aydın',
                    department: 'Computer Science'
                },
                taId: '3',
                ta: {
                    name: 'Ziya Özgül',
                    email: 'ziya@example.com',
                    department: 'Computer Science'
                },
                priority: 'Medium',
                reason: 'Strong background in algorithms',
                status: 'pending'
            },
            {
                id: 'req3',
                courseId: '202',
                course: { 
                    courseCode: 'CS202', 
                    courseName: 'Data Structures'
                },
                instructorId: 'inst2',
                instructor: { 
                    name: 'Dr. Ayşe Yılmaz',
                    department: 'Computer Science'
                },
                taId: '2',
                ta: {
                    name: 'Rıdvan Yılmaz',
                    email: 'ridvan@example.com',
                    department: 'Computer Science'
                },
                priority: 'High',
                reason: 'Specializes in data structures',
                status: 'pending'
            },
            {
                id: 'req4',
                courseId: '301',
                course: { 
                    courseCode: 'CS301', 
                    courseName: 'Algorithms'
                },
                instructorId: 'inst3',
                instructor: { 
                    name: 'Dr. Okan Türk',
                    department: 'Computer Science'
                },
                taId: '4',
                ta: {
                    name: 'Ahmet Tekin',
                    email: 'ahmet@example.com',
                    department: 'Computer Science'
                },
                priority: 'High',
                reason: 'Strong algorithmic thinking',
                status: 'pending'
            }
        ];

        setAvailableTAs(mockTAs);
        setDepartmentCourses(mockCourses);
        setTaRequests(mockRequests);
    };

    // Handle course selection
    const handleCourseSelect = (course) => {
        console.log(`DEBUGGING: handleCourseSelect called with course:`, course);
        setSelectedCourse(course);
        setSelectedTAs([]); // Clear selected TAs first to avoid showing stale data
        
        // Check if the course has already assigned TAs
        if (course) {
            try {
                console.log(`Selected course: ${course.courseCode} (ID: ${course.id})`);
                
                // Always try API first, fallback to mock/local data if needed
                const headers = getAuthHeader();
                console.log(`DEBUGGING: Making API call to ${API_URL}/chair/course-tas/${course.id}`);
                axios.get(`${API_URL}/chair/course-tas/${course.id}`, { headers })
                    .then(response => {
                        console.log(`DEBUGGING: API response received:`, response.data);
                        if (response.data.success && response.data.data && response.data.data.length > 0) {
                            // Mark all TAs from the response as previously assigned
                            const assignedTAs = response.data.data.map(ta => ({
                                ...ta,
                                wasAlreadyAssigned: true
                            }));
                            console.log(`DEBUGGING: Setting ${assignedTAs.length} TAs from API:`, assignedTAs);
                            setSelectedTAs(assignedTAs);
                            console.log(`SUCCESS: Loaded ${assignedTAs.length} assigned TAs from API for course ${course.courseCode}`);
                        } else {
                            console.log(`API returned no TAs for course ${course.courseCode}, falling back to local data`);
                            // Fall back to local data if API returns no TAs
                            handleLocalTALoading(course);
                        }
                    })
                    .catch(err => {
                        console.error("Error fetching assigned TAs:", err);
                        // Fall back to local data if API call fails
                        console.log("Falling back to local TA data due to API error");
                        handleLocalTALoading(course);
                    });
            } catch (err) {
                console.error("Error setting up assigned TAs:", err);
                console.log(`DEBUGGING: Error in handleCourseSelect:`, err);
                setSelectedTAs([]);
            }
        } else {
            console.log(`DEBUGGING: No course selected, clearing selected TAs`);
            setSelectedTAs([]);
        }
    };

    // Helper function to load TAs from local data when API is not available
    const handleLocalTALoading = (course) => {
        console.log(`DEBUGGING: handleLocalTALoading called with course:`, course);
        
        // Reset the selected TAs
        let newSelectedTAs = [];
        
        // If the course has assigned TA IDs, load those specific TAs
        if (course.assignedTAIds && course.assignedTAIds.length > 0) {
            console.log(`DEBUGGING: Course has ${course.assignedTAIds.length} assigned TA IDs:`, course.assignedTAIds);
            // Get the TAs that match the assigned TA IDs
            newSelectedTAs = course.assignedTAIds.map(taId => {
                const ta = availableTAs.find(ta => ta.id === taId);
                console.log(`DEBUGGING: Looking for TA with ID ${taId}:`, ta || 'not found');
                if (ta) {
                    // Clone the TA object and mark it as previously assigned
                    return { 
                        ...ta,
                        wasAlreadyAssigned: true // Mark as previously assigned
                    };
                }
                return null;
            }).filter(ta => ta !== null); // Remove any nulls (TAs not found)
            
            console.log(`Loaded ${newSelectedTAs.length} assigned TAs locally for course ${course.courseCode}`);
        } else {
            console.log(`No assigned TAs found locally for course ${course.courseCode}`);
        }
        
        console.log(`DEBUGGING: Setting ${newSelectedTAs.length} TAs from local data:`, newSelectedTAs);
        setSelectedTAs(newSelectedTAs);
    };

    // Toggle TA selection for the current course
    const toggleTASelection = (ta) => {
        if (!selectedCourse) return;

        const taIndex = selectedTAs.findIndex(selectedTA => selectedTA.id === ta.id);

        if (taIndex === -1) {
            // Add TA to selection
            // Check if this TA was previously assigned to the course (from the list of available TAs)
            const wasPreviouslyAssigned = selectedTAs.some(
                existingTa => existingTa.id === ta.id && existingTa.wasAlreadyAssigned
            );
            
            // Create a new TA object, preserving the wasAlreadyAssigned flag if it exists
            const newTA = {
                ...ta,
                wasAlreadyAssigned: wasPreviouslyAssigned || ta.wasAlreadyAssigned || false
            };
            
            setSelectedTAs([...selectedTAs, newTA]);
        } else {
            // Remove TA from selection
            const updatedTAs = [...selectedTAs];
            updatedTAs.splice(taIndex, 1);
            setSelectedTAs(updatedTAs);
        }
    };

    // Check if a TA is selected for the current course
    const isTASelected = (taId) => {
        return selectedTAs.some(ta => ta.id === taId);
    };

    // Get TA requests for a specific course
    const getRequestsForCourse = (courseId) => {
        return taRequests.filter(request => request.courseId === courseId);
    };

    // Get instructors who requested TAs for a specific course
    const getInstructorsForCourse = (courseId) => {
        const requests = getRequestsForCourse(courseId);
        const instructors = [...new Map(
            requests.map(request => [
                request.instructorId, 
                { 
                    id: request.instructorId, 
                    name: request.instructor?.name || 'Unknown Instructor',
                    department: request.instructor?.department || 'Unknown Department' 
                }
            ])
        ).values()];
        
        return instructors;
    };

    // Get TA requests by an instructor for a specific course
    const getRequestsByInstructor = (courseId, instructorId) => {
        return taRequests.filter(request => 
            request.courseId === courseId && request.instructorId === instructorId
        );
    };

    // Open confirmation modal to finalize TA assignments
    const handleConfirmAssignments = () => {
        if (!selectedCourse || selectedTAs.length === 0) return;
        setShowConfirmation(true);
    };

    // Finalize TA assignments
    const handleFinalize = async () => {
        if (!selectedCourse) return;

        try {
            const headers = getAuthHeader();
            
            // Simplified data - just send the IDs of selected TAs
            // The backend will handle removing old assignments and adding new ones
            const assignmentData = {
                courseId: selectedCourse.id,
                taIds: selectedTAs.map(ta => ta.id)
            };

            console.log(`Sending assignment data for ${selectedCourse.courseCode}:`, assignmentData);

            const response = await axios.post(
                `${API_URL}/chair/assign-tas-to-course`,
                assignmentData,
                { headers }
            );

            if (response.data.success) {
                alert(`TA assignments for ${selectedCourse.courseCode} have been updated.`);
                
                // Update the courses to reflect the new TA assignments
                const updatedCourses = departmentCourses.map(course => {
                    if (course.id === selectedCourse.id) {
                        return { 
                            ...course, 
                            assignedTAs: selectedTAs.length,
                            assignedTAIds: selectedTAs.map(ta => ta.id)
                        };
                    }
                    return course;
                });
                
                setDepartmentCourses(updatedCourses);
                
                // Mark all selected TAs as previously assigned since they've been confirmed
                const updatedTAs = selectedTAs.map(ta => ({
                    ...ta,
                    wasAlreadyAssigned: true
                }));
                setSelectedTAs(updatedTAs);
                
                setShowConfirmation(false);
            } else {
                alert(response.data.message || "Failed to assign TAs");
            }
        } catch (error) {
            console.error("Error assigning TAs:", error);
            alert(error.response?.data?.message || "Failed to assign TAs to course");
        }
    };

    // Filter TAs by name/email
    const filteredTAs = searchTerm.trim() === ''
        ? availableTAs
        : availableTAs.filter(ta => {
            const searchLower = searchTerm.toLowerCase();
            return (
                (ta.name && ta.name.toLowerCase().includes(searchLower)) ||
                (ta.email && ta.email.toLowerCase().includes(searchLower))
            );
        });

    if (loading) {
        return (
            <div className="departmentchair-assign-page">
                <DepartmentChairNavBar />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="departmentchair-assign-page">
                <DepartmentChairNavBar />
                <div className="error-container">
                    <p className="error-message">{error}</p>
                    <button onClick={() => window.location.reload()} className="retry-button">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="departmentchair-assign-page">
            <DepartmentChairNavBar />

            <div className="assign-content-container">
                <div className="course-selection-panel">
                    <h2>Department Courses</h2>
                    <div className="courses-list">
                        {departmentCourses.map(course => (
                            <div 
                                key={course.id} 
                                className={`course-card ${selectedCourse && selectedCourse.id === course.id ? 'selected' : ''}`}
                                onClick={() => handleCourseSelect(course)}
                            >
                                <div className="course-info">
                                    <h3>{course.courseCode}</h3>
                                    <p>{course.courseName}</p>
                                    <div className="course-metadata">
                                        <span>Students: {course.studentCount || 'N/A'}</span>
                                        <span>TAs Needed: {course.taNeeded || 'N/A'}</span>
                                        <span>Requests: {getRequestsForCourse(course.id).length}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedCourse && (
                        <div className="selected-tas-panel">
                            <h3>Selected TAs for {selectedCourse.courseCode}</h3>
                            {selectedTAs.length > 0 ? (
                                <div className="selected-tas-list">
                                    {selectedTAs.map(ta => (
                                        <div 
                                            className={`selected-ta-item ${ta.wasAlreadyAssigned ? 'previously-assigned' : ''}`} 
                                            key={ta.id}
                                        >
                                            <span>{ta.name}</span>
                                            <div className="ta-indicators">
                                                {ta.wasAlreadyAssigned && (
                                                    <span className="assigned-indicator" title="Previously assigned to this course">
                                                        👑
                                                    </span>
                                                )}
                                                <button
                                                    className="remove-ta-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleTASelection(ta);
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-tas-selected">No TAs selected yet</p>
                            )}

                            <div className="selection-actions">
                                <button
                                    className="view-preferences-btn"
                                    onClick={() => setShowPreferencesModal(true)}
                                >
                                    View Course Preferences
                                </button>

                                <button
                                    className="confirm-btn"
                                    disabled={!selectedCourse || selectedTAs.length === 0}
                                    onClick={handleConfirmAssignments}
                                >
                                    Confirm Assignments
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="right-panels-container">
                    <div className="available-tas-panel">
                        <h2>Available Teaching Assistants</h2>
                        <div className="filter-container">
                            <input
                                type="text"
                                placeholder="Search TAs by name or email..."
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="tas-grid">
                            {filteredTAs.map(ta => (
                                <div
                                    className={`ta-card ${isTASelected(ta.id) ? 'selected' : ''} ${!selectedCourse ? 'disabled' : ''}`}
                                    key={ta.id}
                                    onClick={() => selectedCourse && toggleTASelection(ta)}
                                >
                                    <div className="selection-indicator">
                                        {isTASelected(ta.id) && <span>✓</span>}
                                    </div>
                                    <div className="ta-info">
                                        <h3>{ta.name}</h3>
                                        <p><strong>Email:</strong> {ta.email}</p>
                                        <p><strong>Department:</strong> {ta.department}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {selectedCourse && (
                        <div className="course-requests-panel">
                            <h2>TA Requests for {selectedCourse.courseCode}</h2>
                            {getRequestsForCourse(selectedCourse.id).length > 0 ? (
                                <>
                                    {getInstructorsForCourse(selectedCourse.id).map(instructor => (
                                        <div key={instructor.id} className="instructor-requests-container">
                                            <h3 className="instructor-name">{instructor.name}</h3>
                                            <div className="ta-requests-list">
                                                {getRequestsByInstructor(selectedCourse.id, instructor.id).map(request => (
                                                    <div key={request.id} className={`ta-request-card priority-${request.priority.toLowerCase()}`}>
                                                        <div className="request-info">
                                                            <div className="request-ta-name">{request.ta?.name || 'Unknown TA'}</div>
                                                            <div className="request-metadata">
                                                                <span className="priority-badge">{request.priority}</span>
                                                            </div>
                                                            <div className="request-reason">{request.reason}</div>
                                                        </div>
                                                        <div className="request-actions">
                                                            <button 
                                                                className={`add-ta-btn ${isTASelected(request.taId) ? 'added' : ''}`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const taToAdd = availableTAs.find(ta => ta.id === request.taId);
                                                                    if (taToAdd && !isTASelected(request.taId)) {
                                                                        toggleTASelection(taToAdd);
                                                                    } else if (taToAdd) {
                                                                        toggleTASelection(taToAdd);
                                                                    }
                                                                }}
                                                            >
                                                                {isTASelected(request.taId) ? 'Remove' : 'Add'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <p className="no-requests-message">No TA requests for this course.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Course Preferences Modal */}
            {showPreferencesModal && selectedCourse && (
                <div className="modal-overlay">
                    <div className="preferences-modal">
                        <button className="close-btn" onClick={() => setShowPreferencesModal(false)}>×</button>
                        <h3>TA Preferences for {selectedCourse.courseCode}</h3>
                        <div className="preferences-content">
                            <p>Below are all the TA requests made by instructors for {selectedCourse.courseCode} ({selectedCourse.courseName}):</p>

                            {getRequestsForCourse(selectedCourse.id).length > 0 ? (
                                <div className="preferences-table">
                                    <div className="preferences-header">
                                        <div className="header-name">TA Name</div>
                                        <div className="header-instructor">Instructor</div>
                                        <div className="header-priority">Priority</div>
                                        <div className="header-reason">Reason</div>
                                        <div className="header-status">Status</div>
                                    </div>

                                    {getRequestsForCourse(selectedCourse.id).map(request => {
                                        const isAssigned = isTASelected(request.taId);
                                        return (
                                            <div key={request.id} className="preference-row">
                                                <div className="row-name">{request.ta?.name || 'Unknown'}</div>
                                                <div className="row-instructor">{request.instructor?.name || 'Unknown'}</div>
                                                <div className={`row-priority priority-${request.priority.toLowerCase()}`}>{request.priority}</div>
                                                <div className="row-reason">{request.reason}</div>
                                                <div className="row-status">
                                                    {isAssigned ? (
                                                        <span className="status-assigned">Selected</span>
                                                    ) : (
                                                        <button
                                                            className="assign-btn"
                                                            onClick={() => {
                                                                const taToAssign = availableTAs.find(ta => ta.id === request.taId);
                                                                if (taToAssign) {
                                                                    toggleTASelection(taToAssign);
                                                                }
                                                            }}
                                                        >
                                                            Select
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="no-preferences">No preferences have been submitted for this course.</p>
                            )}

                            <div className="preferences-actions">
                                <button
                                    className="select-all-high-priority-btn"
                                    onClick={() => {
                                        // Select all high priority TAs that aren't already selected
                                        const highPriorityRequests = getRequestsForCourse(selectedCourse.id)
                                            .filter(request => request.priority === 'High');
                                            
                                        const tasToAdd = highPriorityRequests
                                            .filter(request => !isTASelected(request.taId))
                                            .map(request => availableTAs.find(ta => ta.id === request.taId))
                                            .filter(ta => ta !== undefined); // Filter out undefined values
                                        
                                        if (tasToAdd.length > 0) {
                                            setSelectedTAs([...selectedTAs, ...tasToAdd]);
                                        }
                                        
                                        setShowPreferencesModal(false);
                                    }}
                                >
                                    Select All High Priority TAs
                                </button>
                                <button
                                    className="select-all-btn"
                                    onClick={() => {
                                        // Select all requested TAs for this course
                                        const tasToAdd = getRequestsForCourse(selectedCourse.id)
                                            .filter(request => !isTASelected(request.taId))
                                            .map(request => availableTAs.find(ta => ta.id === request.taId))
                                            .filter(ta => ta !== undefined); // Filter out undefined values
                                        
                                        if (tasToAdd.length > 0) {
                                            setSelectedTAs([...selectedTAs, ...tasToAdd]);
                                        }
                                        
                                        setShowPreferencesModal(false);
                                    }}
                                >
                                    Select All Requested TAs
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmation && selectedCourse && (
                <div className="modal-overlay">
                    <div className="confirmation-modal">
                        <button className="close-btn" onClick={() => setShowConfirmation(false)}>×</button>
                        <h3>Confirm TA Assignments</h3>
                        <div className="confirmation-content">
                            <p>You are about to assign the following TAs to {selectedCourse.courseCode} ({selectedCourse.courseName}):</p>
                            <ul className="confirmation-list">
                                {selectedTAs.map(ta => (
                                    <li 
                                        key={ta.id} 
                                        className={`${getRequestsForCourse(selectedCourse.id).some(req => req.taId === ta.id) ? 'requested-ta' : ''} ${ta.wasAlreadyAssigned ? 'previously-assigned-ta' : 'newly-assigned-ta'}`}
                                    >
                                        {ta.name}
                                        {getRequestsForCourse(selectedCourse.id).some(req => req.taId === ta.id) && (
                                            <span className="requested-badge">Instructor Requested</span>
                                        )}
                                        {ta.wasAlreadyAssigned && (
                                            <span className="previously-assigned-badge">Already Assigned</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                            <p className="confirmation-note">
                                This will {selectedTAs.some(ta => !ta.wasAlreadyAssigned) ? 'update' : 'confirm'} the TA assignments for this course. Instructors will be notified about the assignments.
                            </p>
                            <div className="confirmation-actions">
                                <button
                                    className="cancel-btn"
                                    onClick={() => setShowConfirmation(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="confirm-btn"
                                    onClick={handleFinalize}
                                >
                                    Confirm Assignments
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DepartmentChairAssignPage;