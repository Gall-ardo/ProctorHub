import React, { useState, useEffect } from 'react';
import './DepartmentChairAssignPage.css';
import DepartmentChairNavBar from './DepartmentChairNavBar';

function DepartmentChairAssignPage() {
    const [availableTAs, setAvailableTAs] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [selectedInstructor, setSelectedInstructor] = useState(null);
    const [selectedTAs, setSelectedTAs] = useState({});
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showInstructorModal, setShowInstructorModal] = useState(false);
    const [showPreferencesModal, setShowPreferencesModal] = useState(false);

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

        const mockInstructors = [
            {
                id: 1,
                name: 'Dr. Mehmet Aydın',
                department: 'Computer Science',
                courses: ['CS101', 'CS301'],
                preferredTAs: [
                    { id: 1, name: 'Sude Ergün', priority: 'High', reason: 'Excellent knowledge in teaching fundamentals' },
                    { id: 3, name: 'Ziya Özgül', priority: 'Medium', reason: 'Strong background in algorithms' },
                    { id: 7, name: 'Burak Öztürk', priority: 'Low', reason: 'Previous experience with the course' }
                ]
            },
            {
                id: 2,
                name: 'Dr. Ayşe Yılmaz',
                department: 'Computer Science',
                courses: ['CS202', 'CS404'],
                preferredTAs: [
                    { id: 2, name: 'Rıdvan Yılmaz', priority: 'High', reason: 'Specializes in web development needed for CS202' },
                    { id: 5, name: 'Elif Demir', priority: 'High', reason: 'Has previous experience as TA for this course' }
                ]
            },
            {
                id: 3,
                name: 'Dr. Okan Türk',
                department: 'Computer Science',
                courses: ['CS318', 'CS350'],
                preferredTAs: [
                    { id: 4, name: 'Ahmet Tekin', priority: 'High', reason: 'Database expertise needed for CS350' },
                    { id: 6, name: 'Zeynep Kaya', priority: 'Medium', reason: 'Good knowledge of network fundamentals' },
                    { id: 8, name: 'Deniz Çelik', priority: 'Low', reason: 'AI skills for advanced topics' }
                ]
            }
        ];

        // Initialize selectedTAs object with empty arrays for each instructor
        const initialSelectedTAs = {};
        mockInstructors.forEach(instructor => {
            initialSelectedTAs[instructor.id] = [];
        });

        setAvailableTAs(mockTAs);
        setInstructors(mockInstructors);
        setSelectedTAs(initialSelectedTAs);
    }, []);

    const handleInstructorSelect = (instructor) => {
        setSelectedInstructor(instructor);
        setShowInstructorModal(false);
    };

    const toggleTASelection = (ta) => {
        if (!selectedInstructor) return;

        const instructorId = selectedInstructor.id;
        const currentSelected = [...selectedTAs[instructorId]];

        const taIndex = currentSelected.findIndex(selectedTA => selectedTA.id === ta.id);

        if (taIndex === -1) {
            // Add TA to selection
            setSelectedTAs({
                ...selectedTAs,
                [instructorId]: [...currentSelected, ta]
            });
        } else {
            // Remove TA from selection
            currentSelected.splice(taIndex, 1);
            setSelectedTAs({
                ...selectedTAs,
                [instructorId]: currentSelected
            });
        }
    };

    const isTASelected = (taId) => {
        if (!selectedInstructor) return false;
        return selectedTAs[selectedInstructor.id].some(ta => ta.id === taId);
    };

    const handleConfirmAssignments = () => {
        setShowConfirmation(true);
    };

    const handleFinalize = () => {
        // Logic to save TA assignments to database
        alert('TA assignments have been finalized!');
        setShowConfirmation(false);
    };

    return (
        <div className="departmentchair-assign-page">
            <DepartmentChairNavBar />

            <div className="assign-content-container">
                <div className="instructor-selection-panel">
                    <h2>Select Instructor</h2>
                    <div className="current-instructor">
                        {selectedInstructor ? (
                            <>
                                <div className="instructor-info">
                                    <h3>{selectedInstructor.name}</h3>
                                    <p>Department: {selectedInstructor.department}</p>
                                    <p>Courses: {selectedInstructor.courses.join(', ')}</p>
                                </div>
                                <button
                                    className="change-instructor-btn"
                                    onClick={() => setShowInstructorModal(true)}
                                >
                                    Change Instructor
                                </button>
                            </>
                        ) : (
                            <button
                                className="select-instructor-btn"
                                onClick={() => setShowInstructorModal(true)}
                            >
                                Select an Instructor
                            </button>
                        )}
                    </div>

                    {selectedInstructor && (
                        <div className="selected-tas-panel">
                            <h3>Selected Teaching Assistants</h3>
                            {selectedTAs[selectedInstructor.id].length > 0 ? (
                                <div className="selected-tas-list">
                                    {selectedTAs[selectedInstructor.id].map(ta => (
                                        <div className="selected-ta-item" key={ta.id}>
                                            <span>{ta.name}</span>
                                            <button
                                                className="remove-ta-btn"
                                                onClick={() => toggleTASelection(ta)}
                                            >
                                                ✕
                                            </button>
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
                                    View Instructor Preferences
                                </button>

                                <button
                                    className="confirm-btn"
                                    disabled={!selectedInstructor || selectedTAs[selectedInstructor.id].length === 0}
                                    onClick={handleConfirmAssignments}
                                >
                                    Confirm Assignments
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="available-tas-panel">
                    <h2>Available Teaching Assistants</h2>
                    <div className="filter-container">
                        <input
                            type="text"
                            placeholder="Search TAs by name or specialization..."
                            className="search-input"
                        />
                    </div>

                    <div className="tas-grid">
                        {availableTAs.map(ta => (
                            <div
                                className={`ta-card ${isTASelected(ta.id) ? 'selected' : ''} ${!selectedInstructor ? 'disabled' : ''}`}
                                key={ta.id}
                                onClick={() => selectedInstructor && toggleTASelection(ta)}
                            >
                                <div className="selection-indicator">
                                    {isTASelected(ta.id) && <span>✓</span>}
                                </div>
                                <div className="ta-info">
                                    <h3>{ta.name}</h3>
                                    <p><strong>Department:</strong> {ta.department}</p>
                                    <p><strong>Experience:</strong> {ta.experience}</p>
                                    <p><strong>Specialization:</strong> {ta.specialization}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Instructor Selection Modal */}
            {showInstructorModal && (
                <div className="modal-overlay">
                    <div className="modal instructor-modal">
                        <button className="close-btn" onClick={() => setShowInstructorModal(false)}>×</button>
                        <h3>Select Instructor</h3>
                        <div className="instructors-list">
                            {instructors.map(instructor => (
                                <div
                                    className="instructor-option"
                                    key={instructor.id}
                                    onClick={() => handleInstructorSelect(instructor)}
                                >
                                    <div className="instructor-name">{instructor.name}</div>
                                    <div className="instructor-courses">
                                        Courses: {instructor.courses.join(', ')}
                                    </div>
                                    <div className="preferred-tas">
                                        <div className="tas-assigned">
                                            Currently Assigned: {selectedTAs[instructor.id].length} TAs
                                        </div>
                                        <div className="instructor-preferences">
                                            <div className="preferences-label">Instructor's TA Preferences:</div>
                                            <ul className="preferences-list">
                                                {instructor.preferredTAs.map(ta => (
                                                    <li key={ta.id} className={`preference-item priority-${ta.priority.toLowerCase()}`}>
                                                        <span className="preference-name">{ta.name}</span>
                                                        <span className="preference-priority">{ta.priority}</span>
                                                        <span className="preference-reason">{ta.reason}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmation && selectedInstructor && (
                <div className="modal-overlay">
                    <div className="confirmation-modal">
                        <button className="close-btn" onClick={() => setShowConfirmation(false)}>×</button>
                        <h3>Confirm TA Assignments</h3>
                        <div className="confirmation-content">
                            <p>You are about to assign the following TAs to {selectedInstructor.name}:</p>
                            <ul className="confirmation-list">
                                {selectedTAs[selectedInstructor.id].map(ta => (
                                    <li key={ta.id} className={`${selectedInstructor.preferredTAs.some(p => p.id === ta.id) ? 'preferred-ta' : ''}`}>
                                        {ta.name} - {ta.specialization}
                                        {selectedInstructor.preferredTAs.some(p => p.id === ta.id) &&
                                            <span className="preferred-badge">Instructor's Choice</span>
                                        }
                                    </li>
                                ))}
                            </ul>
                            <p>These TAs will be assigned to courses: {selectedInstructor.courses.join(', ')}</p>
                            <div className="confirmation-actions">
                                <button
                                    className="cancel-btn"
                                    onClick={() => setShowConfirmation(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="finalize-btn"
                                    onClick={handleFinalize}
                                >
                                    Finalize Assignments
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Preferences Modal */}
            {showPreferencesModal && selectedInstructor && (
                <div className="modal-overlay">
                    <div className="preferences-modal">
                        <button className="close-btn" onClick={() => setShowPreferencesModal(false)}>×</button>
                        <h3>{selectedInstructor.name}'s TA Preferences</h3>
                        <div className="preferences-content">
                            <p>Below are the TAs that {selectedInstructor.name} has requested for courses {selectedInstructor.courses.join(', ')}:</p>

                            <div className="preferences-table">
                                <div className="preferences-header">
                                    <div className="header-name">TA Name</div>
                                    <div className="header-priority">Priority</div>
                                    <div className="header-reason">Reason</div>
                                    <div className="header-status">Status</div>
                                </div>

                                {selectedInstructor.preferredTAs.map(ta => {
                                    const isAssigned = selectedTAs[selectedInstructor.id].some(assigned => assigned.id === ta.id);
                                    return (
                                        <div key={ta.id} className="preference-row">
                                            <div className="row-name">{ta.name}</div>
                                            <div className={`row-priority priority-${ta.priority.toLowerCase()}`}>{ta.priority}</div>
                                            <div className="row-reason">{ta.reason}</div>
                                            <div className="row-status">
                                                {isAssigned ?
                                                    <span className="status-assigned">Assigned</span> :
                                                    <button
                                                        className="assign-btn"
                                                        onClick={() => {
                                                            const taToAssign = availableTAs.find(available => available.id === ta.id);
                                                            if (taToAssign) {
                                                                toggleTASelection(taToAssign);
                                                                setShowPreferencesModal(false);
                                                            }
                                                        }}
                                                    >
                                                        Assign
                                                    </button>
                                                }
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="preferences-actions">
                                <button
                                    className="assign-all-btn"
                                    onClick={() => {
                                        // Assign all preferred TAs
                                        const instructorId = selectedInstructor.id;
                                        const currentSelected = [...selectedTAs[instructorId]];
                                        const newAssignments = [];

                                        selectedInstructor.preferredTAs.forEach(preferred => {
                                            // Check if already assigned
                                            if (!currentSelected.some(ta => ta.id === preferred.id)) {
                                                const taToAssign = availableTAs.find(ta => ta.id === preferred.id);
                                                if (taToAssign) {
                                                    newAssignments.push(taToAssign);
                                                }
                                            }
                                        });

                                        if (newAssignments.length > 0) {
                                            setSelectedTAs({
                                                ...selectedTAs,
                                                [instructorId]: [...currentSelected, ...newAssignments]
                                            });
                                        }

                                        setShowPreferencesModal(false);
                                    }}
                                >
                                    Assign All Preferred TAs
                                </button>
                                <button
                                    className="close-preferences-btn"
                                    onClick={() => setShowPreferencesModal(false)}
                                >
                                    Close
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