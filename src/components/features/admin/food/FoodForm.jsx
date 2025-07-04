import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './Food.css';

export default function FoodForm() {
  const [form, setForm] = useState({ 
    name: '', 
    price: '', 
    description: '', 
    status: 'AVAILABLE' 
  });
  const [originalName, setOriginalName] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
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
      axios.get(`http://localhost:8080/api/foods/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setForm(res.data);
          setOriginalName(res.data.name);
          
          // Set image preview if exists
          if (res.data.imageUrl) {
            setImagePreview(`http://localhost:8080${res.data.imageUrl}`);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load food", err);
          setMessage("Failed to load food data");
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear image error if exists
      if (errors.image) {
        setErrors({
          ...errors,
          image: ''
        });
      }
    }
  };

  const validateName = (name) => {
    if (!name.trim()) {
      return "Food name is required";
    }
    return "";
  };

  const validatePrice = (price) => {
    if (!price) {
      return "Price is required";
    }
    if (isNaN(price) || parseFloat(price) <= 0) {
      return "Price must be a positive number";
    }
    return "";
  };

  const validateStep = (step) => {
    let stepErrors = {};
    let isValid = true;

    switch (step) {
      case 1:
        const nameError = validateName(form.name);
        if (nameError) {
          stepErrors.name = nameError;
          isValid = false;
        }
        
        const priceError = validatePrice(form.price);
        if (priceError) {
          stepErrors.price = priceError;
          isValid = false;
        }
        break;
        
      default:
        break;
    }

    setErrors(stepErrors);
    return isValid;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
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
    
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("description", form.description);
    formData.append("status", form.status);
    if (image) formData.append("image", image);

    const token = localStorage.getItem('token');

    try {
      if (id) {
        await axios.post(`http://localhost:8080/api/foods/update/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setMessage("Food updated successfully!");
      } else {
        await axios.post('http://localhost:8080/api/foods', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setMessage("Food created successfully!");
      }
      
      setTimeout(() => navigate('/admin/foods'), 1500);
    } catch (error) {
      console.error("Save failed:", error);
      
      // Handle backend validation errors
      if (error.response) {
        const statusCode = error.response.status;
        const errorResponse = error.response.data;
        
        // Log detailed error information for debugging
        console.log("Error status:", statusCode);
        console.log("Error response:", errorResponse);
        
        // Handle ResponseStatusException errors
        if (statusCode === 400) {
          // BAD_REQUEST errors
          const errorMessage = errorResponse.message || errorResponse.error || JSON.stringify(errorResponse);
          
          if (errorMessage.includes("Food name already exists")) {
            setErrors(prev => ({ ...prev, name: "Food name already exists" }));
            setCurrentStep(1);
            setMessage("Food name already exists. Please choose a different name.");
          } else if (errorMessage.includes("Image already exists")) {
            setErrors(prev => ({ ...prev, image: "Image already exists" }));
            setCurrentStep(2);
            setMessage("Image already exists. Please choose a different image.");
          } else {
            // Generic bad request error
            setMessage(errorMessage || "Invalid request. Please check your data.");
          }
        } else if (statusCode === 404) {
          // NOT_FOUND errors
          setMessage("Food not found. It may have been deleted.");
        } else if (statusCode === 500) {
          // INTERNAL_SERVER_ERROR errors
          const errorMessage = errorResponse.message || errorResponse.error || JSON.stringify(errorResponse);
          
          if (errorMessage.includes("Failed to upload image")) {
            setErrors(prev => ({ ...prev, image: "Failed to upload image" }));
            setCurrentStep(2);
            setMessage("Failed to upload image. Please try again with a different image.");
          } else {
            setMessage("A server error occurred. Please try again later.");
          }
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

  // Render step content based on current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-section active">
            <div className="step-header" onClick={() => setCurrentStep(1)}>
              <div className="step-number">1</div>
              <div className="step-title">Basic Information</div>
            </div>
            <div className="step-content">
              {errors.name && errors.name.includes("already exists") && (
                <div className="error-alert">
                  <strong>Error:</strong> Food name already exists. Please choose a different name.
                </div>
              )}
              
              <div className="form-group">
                <label>Food Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange} 
                  placeholder="Enter food name"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <p className="error-message">{errors.name}</p>}
                {id && form.name !== originalName && (
                  <p className="info-hint">You're changing the food name. This must be unique.</p>
                )}
              </div>

              <div className="form-group">
                <label>Price</label>
                <input 
                  type="number" 
                  name="price" 
                  value={form.price} 
                  onChange={handleChange} 
                  placeholder="Enter price"
                  step="0.01"
                  min="0"
                  className={errors.price ? 'error' : ''}
                />
                {errors.price && <p className="error-message">{errors.price}</p>}
              </div>
              
              <div className="step-actions">
                <button type="button" onClick={nextStep} className="next-btn">
                  Next
                </button>
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="step-section active">
            <div className="step-header" onClick={() => validateStep(1) && setCurrentStep(2)}>
              <div className="step-number">2</div>
              <div className="step-title">Details & Image</div>
            </div>
            <div className="step-content">
              {errors.image && (
                <div className="error-alert">
                  <strong>Error:</strong> {errors.image}. Please choose a different image.
                </div>
              )}
              
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  name="description" 
                  value={form.description} 
                  onChange={handleChange}
                  placeholder="Enter food description"
                  rows="4"
                  className={errors.description ? 'error' : ''}
                />
                {errors.description && <p className="error-message">{errors.description}</p>}
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
                  <option value="UNAVAILABLE">UNAVAILABLE</option>
                </select>
                {errors.status && <p className="error-message">{errors.status}</p>}
              </div>
              
              <div className="form-group">
                <label>Food Image</label>
                <div className="image-upload-container">
                  {imagePreview && (
                    <div className="food-image-preview">
                      <img src={imagePreview} alt="Food Preview" />
                    </div>
                  )}
                  <input 
                    type="file" 
                    id="food-image-upload" 
                    name="image" 
                    accept="image/*"
                    onChange={handleImageChange} 
                    className="image-upload-input"
                  />
                  <label htmlFor="food-image-upload" className="image-upload-label">
                    {imagePreview ? 'Change Image' : 'Select Image'}
                  </label>
                </div>
                {errors.image && <p className="error-message">{errors.image}</p>}
              </div>
              
              <div className="step-actions">
                <button type="button" onClick={prevStep} className="prev-btn">
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || Object.keys(errors).length > 0}
                  className="submit-btn"
                >
                  {isSubmitting ? 'Processing...' : id ? 'Update Food' : 'Create Food'}
                </button>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Render step indicators
  const renderStepIndicators = () => {
    return (
      <div className="step-indicators">
        <div 
          className={`step-indicator ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}
          onClick={() => validateStep(currentStep) && currentStep > 1 && setCurrentStep(1)}
        >
          <div className="indicator-number">1</div>
          <div className="indicator-text">Basic Information</div>
        </div>
        <div 
          className={`step-indicator ${currentStep >= 2 ? 'active' : ''}`}
          onClick={() => validateStep(currentStep) && currentStep > 2 && setCurrentStep(2)}
        >
          <div className="indicator-number">2</div>
          <div className="indicator-text">Details & Image</div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="food-form-container"><p className="message">Loading...</p></div>;

  return (
    <div className="food-form-container">
      <h2>{id ? "Edit Food" : "Add Food"}</h2>
      
      {renderStepIndicators()}
      
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {renderStep()}
      </form>
      
      {message && <p className={message.includes('successfully') ? 'message success-message' : 'message error-message'}>{message}</p>}
    </div>
  );
} 