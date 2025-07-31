import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Request.css";

export default function History_Request() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // Get CSS class and label for status
  const getStatusInfo = (status) => {
    switch (status) {
      case "PENDING":
        return { 
          class: "status-pending",
          icon: "⏳",
          label: "Pending" 
        };
      case "APPROVED":
        return { 
          class: "status-approved",
          icon: "✅",
          label: "Approved" 
        };
      case "DENIED":
        return { 
          class: "status-denied",
          icon: "❌",
          label: "Denied" 
        };
      default:
        return { 
          class: "",
          icon: "❓",
          label: "Unknown" 
        };
    }
  };

  // Call API to fetch data
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8080/api/staff/me", {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });
        setRequests(response.data);
        setError("");
      } catch (err) {
        console.error("Error fetching requests:", err);
        if (err.response && err.response.status === 401) {
          setError("You are not logged in or your session has expired.");
        } else {
          setError("Could not load data. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) {
    return <div className="history-loading">Loading requests...</div>;
  }

  if (error) {
    return <div className="history-error">{error}</div>;
  }

  return (
    <div className="history-container">
      <h3>Request History</h3>

      {requests.length === 0 ? (
        <div className="history-empty">No requests found. Create a new request to see it here.</div>
      ) : (
        <div className="request-table-container">
          <table className="request-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Request Date</th>
                <th>Target Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Manager Notes</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => {
                const statusInfo = getStatusInfo(request.status);
                return (
                  <tr key={request.id} className={statusInfo.class}>
                    <td>{getTypeLabel(request.type)}</td>
                    <td>{formatDate(request.requestDate)}</td>
                    <td>{formatDate(request.targetDate)}</td>
                    <td>{request.reason}</td>
                    <td className={`status ${statusInfo.class}`}>
                      <span className="status-icon">{statusInfo.icon}</span>
                      {statusInfo.label}
                    </td>
                    <td>
                      {request.adminNote ? (
                        <div className={`admin-note ${request.status === "DENIED" ? "denied-note" : ""}`}>
                          {request.adminNote}
                        </div>
                      ) : (
                        <span className="no-note">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
