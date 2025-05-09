import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TAPersonalSwapRequest.css';

// Email Suggestions Component
const EmailSuggestions = ({ suggestions, onSelect, visible }) => {
  if (!visible || suggestions.length === 0) return null;

  return (
    <div 
      style={{ 
        position: 'absolute', 
        backgroundColor: 'white', 
        border: '1px solid #ddd', 
        borderRadius: '4px', 
        zIndex: 10, 
        width: 'calc(100% - 30px)',
        maxHeight: '150px',
        overflowY: 'auto',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        margin: '0 15px'
      }}
    >
      {suggestions.map((ta, index) => (
        <div 
          key={index}
          style={{ 
            padding: '8px 12px', 
            borderBottom: index < suggestions.length - 1 ? '1px solid #eee' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
          onClick={() => onSelect(ta.email)}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{ta.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{ta.email}</div>
          </div>
          <div style={{ 
            color: '#1976D2', 
            fontSize: '12px',
            backgroundColor: '#e3f2fd',
            padding: '3px 6px',
            borderRadius: '4px'
          }}>
            Select
          </div>
        </div>
      ))}
    </div>
  );
};

// TA Selection Component (similar to Instructor selection in AddWorkloadPopup)
const TASelection = ({ selectedTA, onSelect, departmentTAs, isLoading }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSelectTA = (ta) => {
    onSelect(ta);
    setDropdownOpen(false);
  };

  return (
    <div className="ta-personal-swap-section">
      <label className="ta-personal-swap-label">Select TA</label>
      
      {isLoading ? (
        <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
          Loading teaching assistants...
        </div>
      ) : departmentTAs.length === 0 ? (
        <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
          No teaching assistants found in the system. Please enter TA email manually.
        </div>
      ) : (
        <div className="ta-personal-swap-custom-select" style={{ position: 'relative' }}>
          <div 
            className="ta-personal-swap-selected-option" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            {selectedTA ? 
              `${selectedTA.name} (${selectedTA.email})` : 
              'Select a teaching assistant'
            }
            <span style={{ fontFamily: 'Arial', fontSize: '12px' }}>▼</span>
          </div>
          
          {dropdownOpen && (
            <div 
              style={{ 
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '0 0 4px 4px',
                zIndex: 10,
                maxHeight: '200px',
                overflowY: 'auto',
                marginTop: '1px'
              }}
            >
              {departmentTAs.map((ta, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '8px 12px',
                    borderBottom: index < departmentTAs.length - 1 ? '1px solid #eee' : 'none',
                    cursor: 'pointer',
                    backgroundColor: selectedTA && selectedTA.id === ta.id ? '#e3f2fd' : 'white'
                  }}
                  onClick={() => handleSelectTA(ta)}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{ta.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{ta.email}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TAPersonalSwapRequest = ({ isOpen, onClose, currentUserExams = [] }) => {
  const [taEmail, setTaEmail] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recentTargetTAs, setRecentTargetTAs] = useState([]);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
  
  // New states for department TAs
  const [departmentTAs, setDepartmentTAs] = useState([]);
  const [selectedTA, setSelectedTA] = useState(null);
  const [loadingDepartmentTAs, setLoadingDepartmentTAs] = useState(false);

  // Get user's exams from props or fetch them if not provided
  const [exams, setExams] = useState([]);

  const API_URL = 'http://localhost:5001/api';

  useEffect(() => {
    // If current user exams were provided as props, use those
    if (currentUserExams.length > 0) {
      setExams(currentUserExams);
    } else {
      // Otherwise fetch them from the API
      fetchUserExams();
    }

    // When the modal opens, fetch recent TAs and department TAs
    if (isOpen) {
      fetchRecentTargetTAs();
      fetchDepartmentTAs();
    }
  }, [currentUserExams, isOpen]);

  const fetchUserExams = async () => {
    try {
      setLoading(true);
      // Get the token from localStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/ta/swaps/my-exams`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setExams(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch exams');
      }
    } catch (err) {
      if (err.response) {
        console.error('Server error:', err.response.data);
        setError(err.response.data.message || 'Server error');
      } else if (err.request) {
        console.error('No response received:', err.request);
        setError('No response from server.');
      } else {
        console.error('Error', err.message);
        setError('Unexpected error: ' + err.message);
      }
      
    } finally {
      setLoading(false);
    }
  };

  // Fetch teaching assistants from the same department
  const fetchDepartmentTAs = async () => {
    try {
      setLoadingDepartmentTAs(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_URL}/ta/swaps/department-tas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Set department TAs if they exist
        setDepartmentTAs(response.data.data || []);
      } else {
        console.warn('Failed to fetch department TAs:', response.data.message);
        setDepartmentTAs([]);
      }
    } catch (err) {
      console.error('Error fetching department TAs:', err);
      // Don't show error to user, just show empty state
      setDepartmentTAs([]);
    } finally {
      setLoadingDepartmentTAs(false);
    }
  };

  // Fetch recent TAs the user has swapped with
  const fetchRecentTargetTAs = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_URL}/ta/swaps/submitted`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Extract unique TA emails from personal swap requests
        const uniqueTAs = new Set();
        const taEmails = [];

        response.data.data.forEach(request => {
          if (!request.isForumPost && request.targetTaEmail && !uniqueTAs.has(request.targetTaEmail)) {
            uniqueTAs.add(request.targetTaEmail);
            taEmails.push({
              email: request.targetTaEmail,
              name: request.targetTaName || 'Unknown'
            });
          }
        });

        setRecentTargetTAs(taEmails);
      }
    } catch (err) {
      console.error('Error fetching recent target TAs:', err);
    }
  };

  const handleSubmit = async () => {
    // Reset messages
    setError('');
    setSuccess('');
    
    // Validate inputs
    if (!taEmail) {
      setError('Please enter a TA email');
      return;
    }
    
    if (!selectedExam) {
      setError('Please select an exam to swap');
      return;
    }
    
    if (!startDate || !endDate) {
      setError('Please select date range');
      return;
    }
    
    try {
      setLoading(true);
      // Get the token from localStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }
      
      // Prepare request data
      const requestData = {
        targetTaEmail: taEmail,
        examId: selectedExam,
        startDate,
        endDate
      };
      
      // Send API request
      const response = await axios.post(`${API_URL}/ta/swaps`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setSuccess('Swap request sent successfully');
        // Reset form and close modal after a brief delay to show success message
        setTimeout(() => {
          resetForm();
          onClose();
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to send swap request');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
      console.error('Error sending swap request:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTaEmail('');
    setStartDate('');
    setEndDate('');
    setSelectedExam(null);
    setSelectedTA(null);
    setError('');
    setSuccess('');
  };

  const handleExamSelection = (exam) => {
    setSelectedExam(exam.id === selectedExam ? null : exam.id);
  };

  const handleEmailInputFocus = () => {
    if (recentTargetTAs.length > 0) {
      setShowEmailSuggestions(true);
    }
  };

  const handleEmailSelection = (email) => {
    setTaEmail(email);
    setShowEmailSuggestions(false);
  };

  // Handle TA selection from dropdown
  const handleTASelection = (ta) => {
    setSelectedTA(ta);
    setTaEmail(ta.email);
  };

  if (!isOpen) return null;

  return (
    <div className="ta-personal-swap-overlay">
      <div className="ta-personal-swap-modal">
        <div className="ta-personal-swap-header">
          <h2 className="ta-personal-swap-title">Send Personal Swap Request</h2>
          <button className="ta-personal-swap-close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="ta-personal-swap-content">
          {/* Success Message */}
          {success && (
            <div className="ta-personal-swap-success" style={{ padding: '15px', backgroundColor: '#dff0d8', color: '#3c763d', margin: '15px', borderRadius: '4px' }}>
              {success}
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="ta-personal-swap-error" style={{ padding: '15px', backgroundColor: '#f2dede', color: '#a94442', margin: '15px', borderRadius: '4px' }}>
              {error}
            </div>
          )}
          
          {/* TA Selection Dropdown - New Component */}
          <TASelection 
            selectedTA={selectedTA}
            onSelect={handleTASelection}
            departmentTAs={departmentTAs}
            isLoading={loadingDepartmentTAs}
          />
          
          {/* TA Email Input */}
          <div className="ta-personal-swap-section" style={{ position: 'relative' }}>
            <label className="ta-personal-swap-label">TA Email</label>
            <input 
              type="email" 
              className="ta-personal-swap-input" 
              placeholder="Enter TA e-mail" 
              value={taEmail} 
              onChange={(e) => {
                setTaEmail(e.target.value);
                // Clear selected TA if email is changed manually
                if (selectedTA && selectedTA.email !== e.target.value) {
                  setSelectedTA(null);
                }
              }}
              onFocus={handleEmailInputFocus}
              onBlur={() => setTimeout(() => setShowEmailSuggestions(false), 200)}
            />
            
            {/* Email Suggestions Component */}
            <EmailSuggestions 
              suggestions={recentTargetTAs} 
              onSelect={handleEmailSelection} 
              visible={showEmailSuggestions}
            />
          </div>
          
          {/* Date Selection */}
          <div className="ta-personal-swap-section">
            <label className="ta-personal-swap-label">Select date</label>
            <div className="ta-personal-swap-date-container">
              <div className="ta-personal-swap-date-header">
              </div>
              
              <div className="ta-personal-swap-date-inputs">
                <div className="ta-personal-swap-date-fields">
                  <div className="ta-personal-swap-date-field">
                    <div className="ta-personal-swap-date-label">Start date</div>
                    <div className="ta-personal-swap-input-with-icon">
                      <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)}  
                      />
                    </div>
                  </div>
                  <div className="ta-personal-swap-date-field">
                    <div className="ta-personal-swap-date-label">End date</div>
                    <div className="ta-personal-swap-input-with-icon">
                      <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)}  
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Exam Selection */}
          <div className="ta-personal-swap-section">
            <label className="ta-personal-swap-label">Exam to Swap</label>
            
            {loading && <div style={{ textAlign: 'center', padding: '20px' }}>Loading exams...</div>}
            {!loading && exams.length === 0 && 
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                No exams available for swap. Make sure you have accepted proctoring assignments.
              </div>
            }
            {!loading && exams.length > 0 && (
              <div className="ta-personal-swap-exam-list">
                {exams.map((exam) => (
                  <div 
                    key={exam.id} 
                    className={`ta-personal-swap-exam-item ${selectedExam === exam.id ? 'selected' : ''}`}
                    onClick={() => handleExamSelection(exam)}
                  >
                    <div className="ta-personal-swap-exam-info">
                      {exam.course} / {exam.date} / {exam.time}
                    </div>
                    <div className="ta-personal-swap-exam-radio">
                      {selectedExam === exam.id ? <div className="radio-selected"></div> : <div className="radio-unselected"></div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="ta-personal-swap-footer">
          <button 
            className="ta-personal-swap-submit-button" 
            onClick={handleSubmit}
            disabled={loading || !taEmail || !selectedExam}
          >
            {loading ? 'Sending...' : 'Send Personal Swap Request'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TAPersonalSwapRequest;