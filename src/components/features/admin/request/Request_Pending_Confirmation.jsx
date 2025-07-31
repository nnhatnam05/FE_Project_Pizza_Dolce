import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheck, FaTimes } from 'react-icons/fa';

const RequestPendingConfirmation = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState({});
  const [adminNotes, setAdminNotes] = useState({});
  const [confirmAction, setConfirmAction] = useState(null);

  // Get token from localStorage
  const getToken = () => localStorage.getItem("token");

  // Format date from ISO string to readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get label for request type
  const getTypeLabel = (typeValue) => {
    switch (typeValue) {
      case "LEAVE": return "Leave";
      case "SWAP": return "Shift Swap";
      case "OVERTIME": return "Overtime";
      default: return "Unknown";
    }
  };

  // Fetch pending requests
  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/staff/request?status=PENDING', {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      setRequests(response.data);
      
      // Initialize admin notes for each request
      const initialNotes = {};
      response.data.forEach(request => {
        initialNotes[request.id] = '';
      });
      setAdminNotes(initialNotes);
      
      setError(null);
    } catch (err) {
      console.error("Error fetching pending requests:", err);
      setError("Failed to load pending requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch requests on component mount
  useEffect(() => {
    fetchPendingRequests();
  }, []);

  // Handle admin note change
  const handleNoteChange = (requestId, value) => {
    setAdminNotes({
      ...adminNotes,
      [requestId]: value
    });
  };

  // Show confirmation dialog for approve action
  const handleApprove = (request) => {
    setConfirmAction({
      type: 'APPROVED',
      requestId: request.id,
      requestData: request
    });
  };

  // Show confirmation dialog for deny action
  const handleDeny = (request) => {
    setConfirmAction({
      type: 'DENIED',
      requestId: request.id,
      requestData: request
    });
  };

  // Cancel confirmation
  const handleCancelConfirmation = () => {
    setConfirmAction(null);
  };

  // Confirm action and proceed with status change
  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    
    const { type, requestId } = confirmAction;
    await handleStatusChange(requestId, type);
    setConfirmAction(null);
  };

  // Common function to update request status
  const handleStatusChange = async (requestId, newStatus) => {
    setProcessing(prev => ({ ...prev, [requestId]: true }));
    try {
      let endpoint;
      if (newStatus === 'APPROVED') {
        endpoint = `http://localhost:8080/api/staff/${requestId}/request/approve`;
      } else if (newStatus === 'DENIED') {
        endpoint = `http://localhost:8080/api/staff/${requestId}/request/deny`;
      } else {
        throw new Error('Unknown status');
      }
  
      await axios.put(
        endpoint,
        { adminNote: adminNotes[requestId] },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );
      fetchPendingRequests();
    } catch (err) {
      console.error(`Error ${newStatus === 'APPROVED' ? 'approving' : 'denying'} request:`, err);
      setError(`Failed to ${newStatus === 'APPROVED' ? 'approve' : 'deny'} request. Please try again.`);
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: false }));
    }
  };
  

  if (loading) {
    return <div className="admin-loading">Loading pending requests...</div>;
  }

  if (error) {
    return (
      <div className="admin-error-container">
        <div className="admin-error">{error}</div>
        <button className="retry-button" onClick={fetchPendingRequests}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="admin-pending-container">
      <div className="admin-header">
        <h2>Pending Requests</h2>
      </div>

      {requests.length === 0 ? (
        <div className="admin-empty">
          No pending requests to review.
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Staff</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Request Date</th>
                <th>Target Date</th>
                <th>Admin Note</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="pending">
                  <td>
                    <div className="staff-info">
                      <span className="staff-code">{request.staffCode}</span>
                      <span className="staff-name">{request.staffName}</span>
                    </div>
                  </td>
                  <td>{getTypeLabel(request.type)}</td>
                  <td className="reason-cell">{request.reason}</td>
                  <td>{formatDate(request.requestDate)}</td>
                  <td>{formatDate(request.targetDate)}</td>
                  <td>
                    <textarea
                      className="admin-note-input"
                      placeholder="Optional note..."
                      value={adminNotes[request.id] || ''}
                      onChange={(e) => handleNoteChange(request.id, e.target.value)}
                    />
                  </td>
                  <td className="action-buttons">
                    <button
                      className="approve-button"
                      onClick={() => handleApprove(request)}
                      disabled={processing[request.id]}
                    >
                      <FaCheck /> Approve
                    </button>
                    <button
                      className="deny-button"
                      onClick={() => handleDeny(request)}
                      disabled={processing[request.id]}
                    >
                      <FaTimes /> Deny
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="admin-confirmation-overlay">
          <div className="admin-confirmation-modal">
            <h4>
              {confirmAction.type === 'APPROVED' ? 'Approve Request' : 'Deny Request'}
            </h4>
            
            <div className="admin-confirmation-content">
              <p>
                Are you sure you want to <strong>{confirmAction.type === 'APPROVED' ? 'approve' : 'deny'}</strong> the following request?
              </p>
              
              <div className="admin-confirmation-details">
                <div className="admin-confirmation-item">
                  <strong>Staff:</strong> {confirmAction.requestData.staffName} ({confirmAction.requestData.staffCode})
                </div>
                <div className="admin-confirmation-item">
                  <strong>Type:</strong> {getTypeLabel(confirmAction.requestData.type)}
                </div>
                <div className="admin-confirmation-item">
                  <strong>Reason:</strong> {confirmAction.requestData.reason}
                </div>
                <div className="admin-confirmation-item">
                  <strong>Target Date:</strong> {formatDate(confirmAction.requestData.targetDate)}
                </div>
                {adminNotes[confirmAction.requestId] && (
                  <div className="admin-confirmation-item">
                    <strong>Your Note:</strong> {adminNotes[confirmAction.requestId]}
                  </div>
                )}
              </div>
            </div>
            
            <div className="admin-confirmation-actions">
              <button 
                className="admin-cancel-button"
                onClick={handleCancelConfirmation}
                disabled={processing[confirmAction.requestId]}
              >
                Cancel
              </button>
              <button 
                className={confirmAction.type === 'APPROVED' ? 'admin-approve-button' : 'admin-deny-button'}
                onClick={handleConfirmAction}
                disabled={processing[confirmAction.requestId]}
              >
                {processing[confirmAction.requestId] ? 'Processing...' : 
                  confirmAction.type === 'APPROVED' ? 'Confirm Approval' : 'Confirm Denial'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestPendingConfirmation;
