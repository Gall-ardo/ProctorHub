import React, { useState, useEffect } from 'react';
import './InstructorAssignPage.css';
import InstructorNavBar from './InstructorNavBar';
import axios from 'axios';

function InstructorAssignPage() {
    const [availableTAs, setAvailableTAs] = useState([]);
    const [instructorCourses, setInstructorCourses] = useState([]);
    const [preferredTAs, setPreferredTAs] = useState([]);
    const [selectedTA, setSelectedTA] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showTAModal, setShowTAModal] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form states for adding preference
    const [selectedPriority, setSelectedPriority] = useState('Medium');
    const [preferenceReason, setPreferenceReason] = useState('');

    const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5001') + '/api';

    // Helper to retrieve JWT and set header
    function getAuthHeader() {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        return { Authorization: `Bearer ${token}` };
    }

    // Separate function to fetch TAs
    const fetchTeachingAssistants = async () => {
        try {
            const headers = getAuthHeader();
            const response = await axios.get(`${API_URL}/instructor/available-tas`, { headers });

            if (response.data.success) {
                const tas = response.data.data || [];
                console.log("All TAs:", tas);
                return tas;
            }
            return [];
        } catch (error) {
            console.error("Error fetching teaching assistants:", error);
            return [];
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            console.log("in fetchData");
            const headers = getAuthHeader();
            try {
                // Get TAs first
                const allTAs = await fetchTeachingAssistants();

                // Then get courses and requests
                const [coursesResponse, requestsResponse] = await Promise.all([
                    axios.get(`${API_URL}/instructor/instructor-courses`, { headers }),
                    axios.get(`${API_URL}/instructor/ta-requests`, { headers })
                ]);

                console.log("coursesResponse", coursesResponse);
                setInstructorCourses(coursesResponse.data.data || []);

                // Set TAs directly
                setAvailableTAs(allTAs);

                // Transform requests data to match component needs
                const transformedRequests = requestsResponse.data.data.map(request => ({
                    id: request.id,
                    taId: request.taId,
                    taName: request.ta?.name || 'Unknown TA',
                    courseId: request.courseId,
                    courseCode: request.course?.courseCode || 'Unknown Course',
                    priority: request.priority,
                    reason: request.reason,
                    status: request.status
                }));

                setPreferredTAs(transformedRequests);
                console.log("transformedRequests", transformedRequests);

            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [API_URL]);

    const handleAddPreference = async () => {
        if (!selectedTA || !selectedCourse || !selectedPriority || !preferenceReason.trim()) {
            alert("Please complete all fields to add a preference.");
            return;
        }

        try {
            const headers = getAuthHeader();
            const requestData = {
                taId: selectedTA.id,
                courseId: selectedCourse.id,
                priority: selectedPriority,
                reason: preferenceReason
            };

            const response = await axios.post(
                `${API_URL}/instructor/ta-requests`,
                requestData,
                { headers }
            );

            if (response.data.success) {
                // Add the new preference to our state
                const newPreference = {
                    id: response.data.data.id,
                    taId: selectedTA.id,
                    taName: selectedTA.name,
                    courseId: selectedCourse.id,
                    courseCode: selectedCourse.code || selectedCourse.courseCode,
                    priority: selectedPriority,
                    reason: preferenceReason,
                    status: 'pending'
                };

                // Check if this was an update to an existing preference
                const existingIndex = preferredTAs.findIndex(
                    p => p.taId === selectedTA.id && p.courseId === selectedCourse.id
                );

                if (existingIndex >= 0) {
                    // Replace the existing preference
                    const updatedPreferences = [...preferredTAs];
                    updatedPreferences[existingIndex] = newPreference;
                    setPreferredTAs(updatedPreferences);
                } else {
                    // Add as a new preference
                    setPreferredTAs([...preferredTAs, newPreference]);
                }

                // Reset form
                setSelectedTA(null);
                setPreferenceReason('');
                setSelectedPriority('Medium');
                setShowTAModal(false);
            } else {
                alert(response.data.message || "Failed to add preference");
            }
        } catch (error) {
            console.error("Error adding preference:", error);
            alert(error.response?.data?.message || "Failed to add preference");
        }
    };

    const handleRemovePreference = async (preferenceId) => {
        try {
            const headers = getAuthHeader();
            const response = await axios.delete(
                `${API_URL}/instructor/ta-requests/${preferenceId}`,
                { headers }
            );

            if (response.data.success) {
                // Remove from local state
                const updatedPreferences = preferredTAs.filter(pref => pref.id !== preferenceId);
                setPreferredTAs(updatedPreferences);
            } else {
                alert(response.data.message || "Failed to remove preference");
            }
        } catch (error) {
            console.error("Error removing preference:", error);
            alert(error.response?.data?.message || "Failed to remove preference");
        }
    };

    const handleSubmitPreferences = async () => {
        // This would typically involve setting all pending preferences as 'submitted' in the backend
        // For now, we'll just update the UI
        alert("Your TA preferences have been submitted successfully!");
        setShowSubmitModal(false);

        // Mark all preferences as submitted in our local state
        const submittedPreferences = preferredTAs.map(pref => ({
            ...pref,
            status: 'submitted'
        }));
        setPreferredTAs(submittedPreferences);
    };

    // Simple filter by name without specialization
    const filteredTAs = searchTerm.trim() === ''
        ? availableTAs
        : availableTAs.filter(ta => {
            const name = ta.name || '';
            return name.toLowerCase().includes(searchTerm.toLowerCase());
        });

    const filteredPreferences = preferredTAs.filter(pref => {
        if (priorityFilter === 'all') return true;
        return pref.priority?.toLowerCase() === priorityFilter.toLowerCase();
    });

    // Group preferences by course
    const preferencesByCourse = {};
    filteredPreferences.forEach(pref => {
        if (!preferencesByCourse[pref.courseCode]) {
            preferencesByCourse[pref.courseCode] = [];
        }
        preferencesByCourse[pref.courseCode].push(pref);
    });

    if (loading) {
        return (
            <div className="instructor-assign-page">
                <InstructorNavBar />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="instructor-assign-page">
                <InstructorNavBar />
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
        <div className="instructor-assign-page">
            <InstructorNavBar />

            <div className="instructor-content-container">
                <div className="preferences-panel">
                    <div className="panel-header">
                        <h2>My TA Preferences</h2>
                        <div className="filter-options">
                            <select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                className="priority-filter"
                            >
                                <option value="all">All Priorities</option>
                                <option value="high">High Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="low">Low Priority</option>
                            </select>
                        </div>
                    </div>

                    {Object.keys(preferencesByCourse).length > 0 ? (
                        <div className="courses-preferences">
                            {Object.keys(preferencesByCourse).map(courseCode => (
                                <div key={courseCode} className="course-preferences-group">
                                    <h3 className="course-header">{courseCode}</h3>
                                    <div className="preferences-list">
                                        {preferencesByCourse[courseCode].map(preference => (
                                            <div
                                                key={preference.id}
                                                className={`preference-card priority-${preference.priority.toLowerCase()}`}
                                            >
                                                <div className="preference-info">
                                                    <div className="preference-name">{preference.taName}</div>
                                                    <div className="preference-details">
                                                        <span className={`priority-badge ${preference.priority.toLowerCase()}`}>
                                                            {preference.priority}
                                                        </span>
                                                        <span className={`status-badge ${preference.status}`}>
                                                            {preference.status === 'new' ? 'Not Submitted' :
                                                                preference.status === 'updated' ? 'Updated' : 'Submitted'}
                                                        </span>
                                                    </div>
                                                    <div className="preference-reason">{preference.reason}</div>
                                                </div>
                                                <div className="preference-actions">
                                                    {preference.status !== 'submitted' && (
                                                        <button
                                                            className="remove-btn"
                                                            onClick={() => handleRemovePreference(preference.id)}
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-preferences">
                            <p>You haven't added any TA preferences yet.</p>
                        </div>
                    )}

                    <div className="preferences-actions">
                        <button
                            className="add-preference-btn"
                            onClick={() => setShowTAModal(true)}
                        >
                            Add New Preference
                        </button>
                        <button
                            className="submit-preferences-btn"
                            onClick={() => setShowSubmitModal(true)}
                            disabled={preferredTAs.length === 0 || preferredTAs.every(pref => pref.status === 'submitted')}
                        >
                            Submit Preferences
                        </button>
                    </div>
                </div>

                <div className="courses-panel">
                    <h2>My Courses</h2>
                    <div className="courses-list">
                        {instructorCourses.map(course => {
                            const coursePreferences = preferredTAs.filter(pref => pref.courseId === course.id);
                            return (
                                <div key={course.id} className="course-card">
                                    <div className="course-info">
                                        <h3>{course.department + (course.code || course.courseCode)}: {course.name || course.courseName}</h3>
                                        <p className="ta-count">
                                            TAs Requested: {coursePreferences.length}
                                        </p>
                                    </div>
                                    <div className="course-preferences-summary">
                                        {coursePreferences.length > 0 ? (
                                            <div className="preferences-chips">
                                                {coursePreferences.map(pref => (
                                                    <div key={pref.id} className={`preference-chip priority-${pref.priority.toLowerCase()}`}>
                                                        {pref.taName}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="no-preferences-text">No TA preferences added</p>
                                        )}
                                    </div>
                                    <button
                                        className="add-for-course-btn"
                                        onClick={() => {
                                            setSelectedCourse(course);
                                            setShowTAModal(true);
                                        }}
                                    >
                                        Add TA for this course
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* TA Selection Modal */}
            {showTAModal && (
                <div className="modal-overlay">
                    <div className="modal ta-selection-modal">
                        <button className="close-btn" onClick={() => setShowTAModal(false)}>×</button>
                        <h3>Add TA Preference</h3>

                        <div className="modal-form">
                            {/* Course Selection */}
                            <div className="form-group">
                                <label>Select Course:</label>
                                <select
                                    value={selectedCourse ? selectedCourse.id : ''}
                                    onChange={(e) => {
                                        const courseId = e.target.value;
                                        const course = instructorCourses.find(c => c.id === courseId);
                                        setSelectedCourse(course);
                                    }}
                                    required
                                >
                                    <option value="">-- Select a course --</option>
                                    {instructorCourses.map(course => (
                                        <option key={course.id} value={course.id}>
                                            {course.department + (course.code || course.courseCode)}: {course.name || course.courseName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* TA Search and Selection */}
                            <div className="form-group">
                                <label>Search and Select TA:</label>
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />

                                <div className="tas-selection-list">
                                    {filteredTAs.length > 0 ? (
                                        filteredTAs.map(ta => (
                                            <div
                                                key={ta.id}
                                                className={`ta-selection-option ${selectedTA && selectedTA.id === ta.id ? 'selected' : ''}`}
                                                onClick={() => setSelectedTA(ta)}
                                            >
                                                <div className="ta-option-info">
                                                    <div className="ta-option-name">{ta.name}</div>
                                                    <div className="ta-option-details">
                                                        {ta.department && <span>Department: {ta.department}</span>}
                                                        {ta.isPHD !== undefined && <span>{ta.isPHD ? 'PhD Student' : 'MS Student'}</span>}
                                                    </div>
                                                </div>
                                                <div className="ta-option-select">
                                                    {selectedTA && selectedTA.id === ta.id && <span>✓</span>}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-tas-found">
                                            {searchTerm ? 'No TAs found matching your search' : 'No TAs available'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Priority Selection */}
                            <div className="form-group">
                                <label>Priority Level:</label>
                                <div className="priority-selection">
                                    <div
                                        className={`priority-option high ${selectedPriority === 'High' ? 'selected' : ''}`}
                                        onClick={() => setSelectedPriority('High')}
                                    >
                                        High
                                    </div>
                                    <div
                                        className={`priority-option medium ${selectedPriority === 'Medium' ? 'selected' : ''}`}
                                        onClick={() => setSelectedPriority('Medium')}
                                    >
                                        Medium
                                    </div>
                                    <div
                                        className={`priority-option low ${selectedPriority === 'Low' ? 'selected' : ''}`}
                                        onClick={() => setSelectedPriority('Low')}
                                    >
                                        Low
                                    </div>
                                </div>
                            </div>

                            {/* Reason Text Area */}
                            <div className="form-group">
                                <label>Reason for Preference:</label>
                                <textarea
                                    value={preferenceReason}
                                    onChange={(e) => setPreferenceReason(e.target.value)}
                                    placeholder="Explain why you would like this TA for your course..."
                                    rows={4}
                                    required
                                ></textarea>
                            </div>

                            <div className="form-actions">
                                <button
                                    className="cancel-btn"
                                    onClick={() => setShowTAModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="add-btn"
                                    onClick={handleAddPreference}
                                    disabled={!selectedTA || !selectedCourse || !preferenceReason.trim()}
                                >
                                    Add Preference
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Submit Confirmation Modal */}
            {showSubmitModal && (
                <div className="modal-overlay">
                    <div className="modal confirm-modal">
                        <button className="close-btn" onClick={() => setShowSubmitModal(false)}>×</button>
                        <h3>Submit TA Preferences</h3>

                        <div className="modal-content">
                            <p>You are about to submit the following TA preferences:</p>

                            <div className="submit-preferences-summary">
                                {Object.keys(preferencesByCourse).map(courseCode => (
                                    <div key={courseCode} className="submit-course-group">
                                        <h4>{courseCode}</h4>
                                        <ul className="submit-preference-list">
                                            {preferencesByCourse[courseCode]
                                                .filter(pref => pref.status !== 'submitted')
                                                .map(pref => (
                                                    <li key={pref.id} className={`submit-preference-item priority-${pref.priority.toLowerCase()}`}>
                                                        <span className="preference-ta-name">{pref.taName}</span>
                                                        <span className="preference-priority-badge">{pref.priority}</span>
                                                    </li>
                                                ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            <p className="submission-note">
                                Once submitted, your preferences will be sent to the Department Chair for review.
                                You will be notified when TA assignments are finalized.
                            </p>

                            <div className="modal-actions">
                                <button
                                    className="cancel-submit-btn"
                                    onClick={() => setShowSubmitModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="confirm-submit-btn"
                                    onClick={handleSubmitPreferences}
                                >
                                    Confirm Submission
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InstructorAssignPage;
