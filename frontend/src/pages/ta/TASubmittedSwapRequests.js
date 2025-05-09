import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TAPersonalSwapRequest.css'; // Reuse existing styles

const TASubmittedSwapRequests = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedRequests, setSubmittedRequests] = useState([]);
  const API_URL = 'http://localhost:5001/api';

  useEffect(() => {
    if (isOpen) {
      fetchSubmittedRequests();
    }
  }, [isOpen]);

  const fetchSubmittedRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/ta/swaps/submitted`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setSubmittedRequests(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch submitted requests');
      }
    } catch (err) {
      setError('Error fetching submitted requests. Please try again.');
      console.error('Error fetching submitted requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await axios.delete(`${API_URL}/ta/swaps/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Refresh the list after successful cancellation
        fetchSubmittedRequests();
      } else {
        setError(response.data.message || 'Failed to cancel request');
      }
    } catch (err) {
      setError('Error cancelling request. Please try again.');
      console.error('Error cancelling request:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    let color = '';
    switch(status) {
      case 'APPROVED':
        color = '#4caf50'; // Green
        break;
      case 'CANCELLED':
        color = '#f44336'; // Red
        break;
      case 'PENDING':
      default:
        color = '#ff9800'; // Orange
        break;
    }
    
    return (
      <div style={{
        display: 'inline-block',
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold',
        backgroundColor: color,
        color: 'white'
      }}>
        {status}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="ta-personal-swap-overlay">
      <div className="ta-personal-swap-modal" style={{ width: '600px', maxHeight: '80vh' }}>
        <div className="ta-personal-swap-header">
          <h2 className="ta-personal-swap-title">My Submitted Swap Requests</h2>
          <button className="ta-personal-swap-close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="ta-personal-swap-content" style={{ padding: '20px', overflowY: 'auto' }}>
          {/* Error Message */}
          {error && (
            <div style={{ padding: '15px', backgroundColor: '#f2dede', color: '#a94442', marginBottom: '15px', borderRadius: '4px' }}>
              {error}
            </div>
          )}
          
          {/* Loading Indicator */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              Loading submitted requests...
            </div>
          )}
          
          {/* No Requests Message */}
          {!loading && submittedRequests.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              You have not submitted any swap requests yet.
            </div>
          )}
          
          {/* Request List */}
          {!loading && submittedRequests.length > 0 && (
            <div>
              {submittedRequests.map((request) => (
                <div 
                  key={request.id} 
                  style={{
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '15px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ fontWeight: 'bold' }}>
                      {request.course} - {request.date}
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <div><strong>Time:</strong> {request.time}</div>
                    <div><strong>Classroom:</strong> {request.classroom}</div>
                    <div>
                      <strong>Request Type:</strong> {request.isForumPost ? 'Forum Post' : 'Personal Request'}
                    </div>
                    {!request.isForumPost && (
                      <div>
                        <strong>Target TA:</strong> {request.targetTaName} ({request.targetTaEmail})
                      </div>
                    )}
                    <div><strong>Submitted:</strong> {request.submitTime}</div>
                  </div>
                  
                  {request.status === 'PENDING' && (
                    <div style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => handleCancelRequest(request.id)}
                        style={{
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel Request
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TASubmittedSwapRequests;