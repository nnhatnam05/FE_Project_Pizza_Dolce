import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheck, FaTimes } from 'react-icons/fa';

const RequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

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

  // Fetch requests based on status filter
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        let requestsData = [];
  
        if (statusFilter === "ALL") {
          // Gọi song song cả hai API, chờ cả hai xong rồi gộp
          const [approvedRes, deniedRes] = await Promise.all([
            axios.get('http://localhost:8080/api/staff/request?status=APPROVED', {
              headers: { Authorization: `Bearer ${getToken()}` }
            }),
            axios.get('http://localhost:8080/api/staff/request?status=DENIED', {
              headers: { Authorization: `Bearer ${getToken()}` }
            }),
          ]);
          requestsData = [...approvedRes.data, ...deniedRes.data];
        } else {
          // Chỉ lọc một trạng thái
          const response = await axios.get(
            `http://localhost:8080/api/staff/request?status=${statusFilter}`,
            {
              headers: { Authorization: `Bearer ${getToken()}` }
            }
          );
          requestsData = response.data;
        }
  
        setRequests(requestsData);
        setError(null);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError("Failed to load requests. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchRequests();
  }, [statusFilter]);
  

  // Handle status filter change
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  if (loading) {
    return <div className="admin-loading">Loading requests...</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  return (
    <div className="admin-list-container">
      <div className="admin-header">
        <h2>Confirmed Requests</h2>
        <div className="admin-filter">
          <label>
            Status:
            <select value={statusFilter} onChange={handleStatusChange}>
              <option value="ALL">All Confirmed</option>
              <option value="APPROVED">Approved</option>
              <option value="DENIED">Denied</option>
            </select>
          </label>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="admin-empty">
          No {statusFilter === 'ALL' ? 'confirmed' : statusFilter.toLowerCase()} requests found.
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
                <th>Status</th>
                <th>Admin Note</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className={request.status.toLowerCase()}>
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
                    <div className={`status-badge ${request.status.toLowerCase()}`}>
                      {request.status === 'APPROVED' ? (
                        <><FaCheck className="status-icon" /> Approved</>
                      ) : (
                        <><FaTimes className="status-icon" /> Denied</>
                      )}
                    </div>
                  </td>
                  <td>
                    {request.adminNote ? (
                      <div className={`admin-note ${request.status === 'DENIED' ? 'denied-note' : ''}`}>
                        {request.adminNote}
                      </div>
                    ) : (
                      <span className="no-note">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RequestList;
