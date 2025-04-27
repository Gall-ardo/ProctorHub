import React, { useState, useEffect } from 'react';
import './InstructorAssignPage.css';
import InstructorNavBar from './InstructorNavBar';

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

    // Form states for adding preference
    const [selectedPriority, setSelectedPriority] = useState('Medium');
    const [preferenceReason, setPreferenceReason] = useState('');

    useEffect(() => {
        // Mock data - replace with actual API calls
        const mockTAs = [
            { id: 1, name: 'Sude Ergün', department: 'Computer Science', experience: '2 years', specialization: 'Machine Learning' },
            { id: 2, name: 'Rıdvan Yılmaz', department: 'Computer Science', experience: '1 year', specialization: 'Web Development' },
            { id: 3, name: 'Ziya Özgül', department: 'Computer Science', experience: '3 years', specialization: 'Algorithms' },
            { id: 4, name: 'Ahmet Tekin', department: 'Computer Science', experience: '2 years', specialization: 'Databases' },
            { id: 5, name: 'Elif Demir', department: 'Computer Science', experience: '1 year', specialization: 'Mobile Development' },
            { id: 6, name: 'Zeynep Kaya', department: 'Computer Science', experience: '2 years', specialization: 'Computer Networks' },
            { id: 7, name: 'Burak Öztürk', department: 'Computer Science', experience: '3 years', specialization: 'Cybersecurity' },
            { id: 8, name: 'Deniz Çelik', department: 'Computer Science', experience: '1 year', specialization: 'Artificial Intelligence' }
        ];

        const mockCourses = [
            { id: 1, code: 'CS101', name: 'Introduction to Computer Science', semester: 'Fall 2025', taNeeded: 3 },
            { id: 2, code: 'CS301', name: 'Data Structures', semester: 'Fall 2025', taNeeded: 2 }
        ];

        // Initial preferences (empty or from previous selections)
        const mockPreferences = [
            {
                id: 1,
                taId: 3,
                taName: 'Ziya Özgül',
                courseId: 1,
                courseCode: 'CS101',
                priority: 'High',
                reason: 'Strong background in algorithms and previous experience teaching this course.',
                status: 'pending'
            },
            {
                id: 2,
                taId: 1,
                taName: 'Sude Ergün',
                courseId: 2,
                courseCode: 'CS301',
                priority: 'Medium',
                reason: 'Good understanding of data structures.',
                status: 'pending'
            }
        ];

        setAvailableTAs(mockTAs);
        setInstructorCourses(mockCourses);
        setPreferredTAs(mockPreferences);
    }, []);

    const handleAddPreference = () => {
        if (!selectedTA || !selectedCourse || !selectedPriority || !preferenceReason.trim()) {
            alert("Please complete all fields to add a preference.");
            return;
        }

        // Check if this TA is already preferred for this course
        const existingPreference = preferredTAs.find(
            pref => pref.taId === selectedTA.id && pref.courseId === selectedCourse.id
        );

        if (existingPreference) {
            // Update existing preference
            const updatedPreferences = preferredTAs.map(pref => {
                if (pref.id === existingPreference.id) {
                    return {
                        ...pref,
                        priority: selectedPriority,
                        reason: preferenceReason,
                        status: 'updated'
                    };
                }
                return pref;
            });
            setPreferredTAs(updatedPreferences);
        } else {
            // Add new preference
            const newPreference = {
                id: Date.now(), // temporary ID generation
                taId: selectedTA.id,
                taName: selectedTA.name,
                courseId: selectedCourse.id,
                courseCode: selectedCourse.code,
                priority: selectedPriority,
                reason: preferenceReason,
                status: 'new'
            };
            setPreferredTAs([...preferredTAs, newPreference]);
        }

        // Reset form
        setSelectedTA(null);
        setPreferenceReason('');
        setSelectedPriority('Medium');
        setShowTAModal(false);
    };

    const handleRemovePreference = (preferenceId) => {
        const updatedPreferences = preferredTAs.filter(pref => pref.id !== preferenceId);
        setPreferredTAs(updatedPreferences);
    };

    const handleSubmitPreferences = () => {
        // Here you would typically send the preferences to your backend
        alert("Your TA preferences have been submitted successfully!");
        setShowSubmitModal(false);

        // Mark all preferences as submitted
        const submittedPreferences = preferredTAs.map(pref => ({
            ...pref,
            status: 'submitted'
        }));
        setPreferredTAs(submittedPreferences);
    };

    const filteredTAs = availableTAs.filter(ta => {
        return ta.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ta.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const filteredPreferences = preferredTAs.filter(pref => {
        if (priorityFilter === 'all') return true;
        return pref.priority.toLowerCase() === priorityFilter.toLowerCase();
    });

    // Group preferences by course
    const preferencesByCourse = {};
    filteredPreferences.forEach(pref => {
        if (!preferencesByCourse[pref.courseCode]) {
            preferencesByCourse[pref.courseCode] = [];
        }
        preferencesByCourse[pref.courseCode].push(pref);
    });

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
                                        <h3>{course.code}: {course.name}</h3>
                                        <p>Semester: {course.semester}</p>
                                        <p className="ta-count">
                                            TAs Needed: {course.taNeeded} |
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
                                        const courseId = parseInt(e.target.value);
                                        const course = instructorCourses.find(c => c.id === courseId);
                                        setSelectedCourse(course);
                                    }}
                                    required
                                >
                                    <option value="">-- Select a course --</option>
                                    {instructorCourses.map(course => (
                                        <option key={course.id} value={course.id}>
                                            {course.code}: {course.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* TA Search and Selection */}
                            <div className="form-group">
                                <label>Search and Select TA:</label>
                                <input
                                    type="text"
                                    placeholder="Search by name or specialization..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />

                                <div className="tas-selection-list">
                                    {filteredTAs.map(ta => (
                                        <div
                                            key={ta.id}
                                            className={`ta-selection-option ${selectedTA && selectedTA.id === ta.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedTA(ta)}
                                        >
                                            <div className="ta-option-info">
                                                <div className="ta-option-name">{ta.name}</div>
                                                <div className="ta-option-details">
                                                    <span>{ta.experience} experience</span>
                                                    <span>Specialization: {ta.specialization}</span>
                                                </div>
                                            </div>
                                            <div className="ta-option-select">
                                                {selectedTA && selectedTA.id === ta.id && <span>✓</span>}
                                            </div>
                                        </div>
                                    ))}

                                    {filteredTAs.length === 0 && (
                                        <div className="no-tas-found">
                                            No TAs match your search criteria
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