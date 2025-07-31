// admin/staff/request/Form_Request.jsx
import React, { useState } from "react";
import axios from "axios";
import "./Request.css";

export default function Form_Request({ onSuccess }) {
  const [type, setType] = useState("LEAVE");
  const [reason, setReason] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Get token from localStorage
  const getToken = () => localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setMsgType("");
    
    if (!reason || !targetDate) {
      setMsg("Please enter both reason and target date!");
      setMsgType("error");
      return;
    }
    
    // Show confirmation dialog instead of submitting directly
    setShowConfirmation(true);
  };
  
  const confirmSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:8080/api/staff/request",
        { type, reason, targetDate },
        {
          headers: {
            "Authorization": `Bearer ${getToken()}`,
            "Content-Type": "application/json"
          }
        }
      );
      setMsg("✅ Request submitted successfully!");
      setMsgType("success");
      setType("LEAVE");
      setReason("");
      setTargetDate("");
      onSuccess && onSuccess();
    } catch (err) {
      setMsgType("error");
      if (err.response && err.response.status === 401) {
        setMsg("⚠️ You are not logged in or your session has expired!");
      } else if (err.response && err.response.data && err.response.data.message) {
        setMsg("Error: " + err.response.data.message);
      } else {
        setMsg("Request failed. Please try again!");
      }
    } finally {
      setLoading(false);
      setShowConfirmation(false); // Close the confirmation dialog
    }
  };
  
  const cancelSubmit = () => {
    setShowConfirmation(false);
  };

  const getTypeLabel = (typeValue) => {
    switch (typeValue) {
      case "LEAVE": return "Leave";
      case "SWAP": return "Shift Swap";
      case "OVERTIME": return "Overtime";
      default: return "Unknown";
    }
  };

  const getPlaceholder = (typeValue) => {
    switch (typeValue) {
      case "LEAVE": return "Reason for leave request";
      case "SWAP": return "Reason for shift swap";
      case "OVERTIME": return "Reason for overtime request";
      default: return "Enter reason";
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <div className="form-request-wrapper">
      <form className="form-request" onSubmit={handleSubmit}>
        <h3>New Request</h3>
        <label>
          Request Type:
          <select value={type} onChange={e => setType(e.target.value)}>
            <option value="LEAVE">Leave</option>
            <option value="SWAP">Shift Swap</option>
            <option value="OVERTIME">Overtime</option>
          </select>
        </label>
        
        <label>
          Reason:
          <input
            type="text"
            value={reason}
            onChange={e => setReason(e.target.value)}
            required
            minLength={3}
            maxLength={100}
            placeholder={getPlaceholder(type)}
          />
        </label>
        
        <label>
          Target Date:
          <input
            type="date"
            value={targetDate}
            onChange={e => setTargetDate(e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </label>
        
        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Request"}
        </button>
        {msg && <div className={`form-msg ${msgType}`}>{msg}</div>}
      </form>
      
      {showConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-modal">
            <h4>Confirm Your Request</h4>
            <div className="confirmation-content">
              <div className="confirmation-item">
                <strong>Request Type:</strong> {getTypeLabel(type)}
              </div>
              <div className="confirmation-item">
                <strong>Reason:</strong> {reason}
              </div>
              <div className="confirmation-item">
                <strong>Date:</strong> {formatDate(targetDate)}
              </div>
            </div>
            <div className="confirmation-actions">
              <button 
                className="cancel-button" 
                onClick={cancelSubmit}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="confirm-button" 
                onClick={confirmSubmit}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
