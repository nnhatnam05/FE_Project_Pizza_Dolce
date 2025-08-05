import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './Table.css';

export default function TableForm() {
  const [form, setForm] = useState({ 
    number: '', 
    capacity: '', 
    status: 'AVAILABLE',
    location: ''
  });
  const [originalNumber, setOriginalNumber] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      setLoading(true);
      const token = localStorage.getItem('token');
      axios.get(`http://localhost:8080/api/tables/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => {
        setForm(res.data);
        setOriginalNumber(res.data.number);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load table", err);
        setMessage("Failed to load table data");
        setLoading(false);
      });
    }
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    
    // Clear general message when typing in any field
    if (message) {
      setMessage('');
    }
  };

  const validateNumber = (number) => {
    if (!number || number <= 0) {
      return "Table number is required and must be positive";
    }
    return "";
  };

  const validateCapacity = (capacity) => {
    if (!capacity || capacity <= 0) {
      return "Capacity is required and must be positive";
    }
    return "";
  };

  const validateStep = (step) => {
    let stepErrors = {};
    let isValid = true;

    switch (step) {
      case 1:
        const numberError = validateNumber(form.number);
        if (numberError) {
          stepErrors.number = numberError;
          isValid = false;
        }
        
        const capacityError = validateCapacity(form.capacity);
        if (capacityError) {
          stepErrors.capacity = capacityError;
          isValid = false;
        }
        break;
        
      default:
        break;
    }

    setErrors(stepErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation before submission
    if (!validateStep(1)) {
      return;
    }
    
    setIsSubmitting(true);
    setMessage('');
    setErrors({});
    
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    try {
      if (id) {
        const response = await axios.put(`http://localhost:8080/api/tables/${id}`, form, config);
        setMessage("Table updated successfully!");
      } else {
        const response = await axios.post('http://localhost:8080/api/tables', form, config);
        setMessage("Table created successfully!");
      }
      
      setTimeout(() => navigate('/admin/tables'), 1500);
    } catch (error) {
      console.error("Save failed:", error);
      
      // Handle backend validation errors
      if (error.response) {
        const statusCode = error.response.status;
        const errorResponse = error.response.data;
        
        // Log detailed error information for debugging
        console.log("Error status:", statusCode);
        console.log("Error response:", errorResponse);
        
        if (statusCode === 400) {
          // BAD_REQUEST errors
          const errorMessage = typeof errorResponse === 'string' 
            ? errorResponse 
            : errorResponse.message || JSON.stringify(errorResponse);
          
          if (errorMessage.includes("Table number already exists")) {
            setErrors(prev => ({ ...prev, number: "Table number already exists" }));
            setMessage("Table number already exists. Please choose a different number.");
          } else {
            // Generic bad request error
            setMessage(errorMessage || "Invalid request. Please check your data.");
          }
        } else if (statusCode === 404) {
          // NOT_FOUND errors
          setMessage("Table not found. It may have been deleted.");
        } else {
          // Other status codes
          setMessage(`Error: ${error.response.statusText || "Unknown error occurred"}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        setMessage("No response from server. Please check your connection and try again.");
      } else {
        // Something happened in setting up the request
        setMessage("An error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="table-form-container"><p className="message">Loading...</p></div>;

  return (
    <div className="table-form-container">
      <h2>{id ? "Edit Table" : "Add Table"}</h2>
      
      <form onSubmit={handleSubmit} className="table-form">
        <div className="form-section">
          {errors.number && errors.number.includes("already exists") && (
            <div className="error-alert">
              <strong>Error:</strong> Table number already exists. Please choose a different number.
            </div>
          )}
          
          <div className="form-group">
            <label>Table Number</label>
            <input 
              type="number" 
              name="number" 
              value={form.number} 
              onChange={handleChange} 
              placeholder="Enter table number"
              min="1"
              className={errors.number ? 'error' : ''}
            />
            {errors.number && <p className="error-message">{errors.number}</p>}
            {id && form.number !== originalNumber && (
              <p className="info-hint">You're changing the table number. This must be unique.</p>
            )}
          </div>

          <div className="form-group">
            <label>Capacity</label>
            <input 
              type="number" 
              name="capacity" 
              value={form.capacity} 
              onChange={handleChange} 
              placeholder="Enter capacity"
              min="1"
              className={errors.capacity ? 'error' : ''}
            />
            {errors.capacity && <p className="error-message">{errors.capacity}</p>}
          </div>

          <div className="form-group">
            <label>Location</label>
            <input 
              type="text" 
              name="location" 
              value={form.location} 
              onChange={handleChange} 
              placeholder="Enter table location (e.g., Near window, Corner table)"
              className={errors.location ? 'error' : ''}
            />
            {errors.location && <p className="error-message">{errors.location}</p>}
            <p className="info-hint">Optional: Describe where this table is located in the restaurant</p>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select 
              name="status" 
              value={form.status} 
              onChange={handleChange}
              className={errors.status ? 'error' : ''}
            >
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="OCCUPIED">OCCUPIED</option>
              <option value="RESERVED">RESERVED</option>
              <option value="CLEANING">CLEANING</option>
            </select>
            {errors.status && <p className="error-message">{errors.status}</p>}
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              disabled={isSubmitting || Object.keys(errors).length > 0}
              className="submit-btn"
            >
              {isSubmitting ? 'Processing...' : id ? 'Update Table' : 'Create Table'}
            </button>
          </div>
        </div>
      </form>
      
      {message && <p className={message.includes('successfully') ? 'message success-message' : 'message error-message'}>{message}</p>}
    </div>
  );
}