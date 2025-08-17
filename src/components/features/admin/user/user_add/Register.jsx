// src/components/features/auth/Register.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { validatePhoneNumber } from '../../../../../utils/phoneValidation';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    phone: '',
    role: 'ADMIN',
    position: '',
    shiftType: '',
    address: '',
    dob: '',
    gender: 'Nam',
    workLocation: '',
    isActive: true // Thêm field active status
  });

  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Staff position options
  const positionOptions = [
    "Manager",
    "Cashier", 
    "Staff", 
    "Cook", 
    "Delivery"
  ];

  // Staff shift types
  const shiftOptions = [
    "Morning (7:00-15:00)",
    "Afternoon (15:00-23:00)",
    "Night (23:00-7:00)",
    "Full time (9:00-18:00)"
  ];

  // Gender options
  const genderOptions = ["Male", "Female", "Other"];

  // Work location options
  const locationOptions = [
    "Branch 1 - District 1",
    "Branch 2 - District 3",
    "Branch 3 - District 7",
    "Branch 4 - District Tân Bình",
    "Branch 5 - District Bình Thạnh"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Clear field-specific error when user types
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
    
    // Check password match when either password field changes
    if (e.target.name === 'password' || e.target.name === 'confirmPassword') {
      if (e.target.name === 'confirmPassword' && formData.password !== e.target.value) {
        setPasswordError('Passwords do not match');
      } else if (e.target.name === 'password' && formData.confirmPassword && formData.confirmPassword !== e.target.value) {
        setPasswordError('Passwords do not match');
      } else {
        setPasswordError('');
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateUsername = (username) => {
    if (!username.trim()) {
      return "Username is required";
    }
    return "";
  };

  const validatePassword = (password) => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    if (!/(?=.*[0-9])/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/(?=.*[a-zA-Z])/.test(password)) {
      return "Password must contain at least one letter";
    }
    return "";
  };

  const validateName = (name) => {
    if (!name.trim()) {
      return "Full name is required";
    }
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(name)) {
      return "Full name cannot contain numbers or special characters";
    }
    return "";
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email is required";
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Email format is invalid";
    }
    return "";
  };

  // Using imported validatePhoneNumber function
  const validatePhone = (phone) => {
    const error = validatePhoneNumber(phone);
    return error || "";
  };

  const validateStaffDetails = () => {
    if (formData.role === 'STAFF') {
      const errors = {};
      
      if (!formData.position) {
        errors.position = "Position is required for staff members";
      }
      
      if (!formData.shiftType) {
        errors.shiftType = "Shift type is required for staff members";
      }
      
      if (!formData.address) {
        errors.address = "Address is required for staff members";
      }
      
      if (!formData.dob) {
        errors.dob = "Date of birth is required for staff members";
      }
      
      if (!formData.workLocation) {
        errors.workLocation = "Work location is required for staff members";
      }
      
      return errors;
    }
    return {};
  };

  const validateStep = (step) => {
    let stepErrors = {};
    let isValid = true;

    switch (step) {
      case 1:
        const usernameError = validateUsername(formData.username);
        if (usernameError) {
          stepErrors.username = usernameError;
          isValid = false;
        }
        
        const passwordError = validatePassword(formData.password);
        if (passwordError) {
          stepErrors.password = passwordError;
          isValid = false;
        }
        
        if (!formData.confirmPassword) {
          stepErrors.confirmPassword = "Please confirm your password";
          isValid = false;
        } else if (formData.password !== formData.confirmPassword) {
          stepErrors.confirmPassword = "Passwords do not match";
          setPasswordError("Passwords do not match");
          isValid = false;
        }
        break;
        
      case 2:
        const nameError = validateName(formData.name);
        if (nameError) {
          stepErrors.name = nameError;
          isValid = false;
        }
        
        const emailError = validateEmail(formData.email);
        if (emailError) {
          stepErrors.email = emailError;
          isValid = false;
        }
        
        const phoneError = validatePhone(formData.phone);
        if (phoneError) {
          stepErrors.phone = phoneError;
          isValid = false;
        }
        break;
        
      case 3:
        // Validate staff-specific fields if role is STAFF
        if (formData.role === 'STAFF') {
          if (!formData.position) {
            stepErrors.position = "Position is required for staff members";
            isValid = false;
          }
          
          if (!formData.shiftType) {
            stepErrors.shiftType = "Shift type is required for staff members";
            isValid = false;
          }
        }
        break;
        
      default:
        break;
    }

    setErrors({...errors, ...stepErrors});
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
    if (e) e.preventDefault();
  
    // Kiểm tra validation
    if (!validateStep(currentStep)) {
      setMessage('Please fill in all required fields correctly');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      setCurrentStep(1);
      return;
    }
    
    // Kiểm tra thông tin nhân viên nếu là STAFF
    if (formData.role === 'STAFF') {
      const staffErrors = validateStaffDetails();
      if (Object.keys(staffErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...staffErrors }));
        setMessage('Please fill in all required staff details');
        return;
      }
    }
  
    setIsSubmitting(true);
  
    try {
      const token = localStorage.getItem('token');
      console.log("Token being used:", token.substring(0, 20) + "..."); // Log token (một phần) để debug
      
      const formDataToSend = new FormData();
  
      // Add basic fields
      formDataToSend.append('username', formData.username);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('role', formData.role);
      formDataToSend.append('isActive', formData.isActive); // Add isActive field
      
      // Add staff information if STAFF
      if (formData.role === 'STAFF') {
        formDataToSend.append('position', formData.position);
        formDataToSend.append('shiftType', formData.shiftType);
        formDataToSend.append('address', formData.address);
        formDataToSend.append('dob', formData.dob);
        formDataToSend.append('gender', formData.gender);
        formDataToSend.append('workLocation', formData.workLocation);
      }
      
      // Add image if available
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }
  
      // Sử dụng axios trực tiếp với các header cụ thể
      const res = await axios({
        method: 'post',
        url: 'http://localhost:8080/api/auth/register',
        data: formDataToSend,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
  
      console.log("Registration successful:", res.data);
      setMessage('User added successfully!');
      setTimeout(() => navigate('/admin/users'), 1500);
    } catch (err) {
      console.error("Registration error details:", err);
      
      if (err.response && err.response.status === 403) {
        setMessage('Access forbidden: You do not have permission to register users. Please check your role.');
        console.error('Access forbidden. Your current role may not have permission.');
      } else if (err.response && err.response.data) {
        const data = err.response.data;
        console.log("Error response data:", data);
        
        if (typeof data === 'string') {
          if (data.includes("Username already exists")) {
            setErrors(prev => ({ ...prev, username: "Username already exists" }));
            setCurrentStep(1);
          } else if (data.includes("Email already exists")) {
            setErrors(prev => ({ ...prev, email: "Email already exists" }));
            setCurrentStep(2);
          } else if (data.includes("Phone already exists")) {
            setErrors(prev => ({ ...prev, phone: "Phone already exists" }));
            setCurrentStep(2);
          } else if (data.includes("Missing staff details")) {
            setErrors(prev => ({ ...prev, position: "Position is required", shiftType: "Shift type is required" }));
            setCurrentStep(3);
          }
          setMessage(data);
        } else {
          setMessage('Registration failed: ' + (data.message || 'Unknown error'));
        }
      } else {
        setMessage('Registration failed. Please check your connection and try again.');
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
              <div className="info-text">
                Enter login information for the new user. Username must be unique and password must be entered twice for confirmation.
              </div>
              
              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  name="username" 
                  value={formData.username} 
                  onChange={handleChange} 
                  placeholder="Enter username"
                  className={errors.username ? 'error' : ''}
                />
                {errors.username && <p className="error-message">{errors.username}</p>}
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="password-input-container">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="Enter password"
                    className={errors.password ? 'error' : ''}
                  />
                  <button 
                    type="button" 
                    className="toggle-password" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && <p className="error-message">{errors.password}</p>}
                <p className="password-hint">Password must be at least 6 characters and include both letters and numbers</p>
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <div className="password-input-container">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    placeholder="Confirm password"
                    className={errors.confirmPassword || passwordError ? 'error' : ''}
                  />
                  <button 
                    type="button" 
                    className="toggle-password" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {(errors.confirmPassword || passwordError) && (
                  <p className="error-message">{errors.confirmPassword || passwordError}</p>
                )}
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
              <div className="step-title">Personal Information</div>
            </div>
            <div className="step-content">
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="Enter full name"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <p className="error-message">{errors.name}</p>}
              </div>

              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="Enter email address"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <p className="error-message">{errors.email}</p>}
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="Enter phone number (10 digits)"
                  className={errors.phone ? 'error' : ''}
                  maxLength={10}
                />
                {errors.phone && <p className="error-message">{errors.phone}</p>}
              </div>
              
              <div className="step-actions">
                <button type="button" onClick={prevStep} className="prev-btn">
                  Back
                </button>
                <button type="button" onClick={nextStep} className="next-btn">
                  Next
                </button>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="step-section active">
            <div className="step-header" onClick={() => validateStep(2) && setCurrentStep(3)}>
              <div className="step-number">3</div>
              <div className="step-title">Role and Details</div>
            </div>
            <div className="step-content">
              <div className="form-group">
                <label>Role</label>
                <select 
                  name="role" 
                  onChange={handleChange} 
                  value={formData.role}
                  className={errors.role ? 'error' : ''}
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="STAFF">STAFF</option>
                </select>
                {errors.role && <p className="error-message">{errors.role}</p>}
              </div>
              
              {/* Staff-specific fields if role is STAFF */}
              {formData.role === 'STAFF' && (
                <div className="staff-specific-fields">
                  <div className="form-group">
                    <label>Position</label>
                    <select 
                      name="position" 
                      value={formData.position} 
                      onChange={handleChange}
                      className={errors.position ? 'error' : ''}
                    >
                      <option value="">Select Position</option>
                      {positionOptions.map((pos, index) => (
                        <option key={index} value={pos}>{pos}</option>
                      ))}
                    </select>
                    {errors.position && <p className="error-message">{errors.position}</p>}
                  </div>

                  <div className="form-group">
                    <label>Shift Type</label>
                    <select 
                      name="shiftType" 
                      value={formData.shiftType} 
                      onChange={handleChange}
                      className={errors.shiftType ? 'error' : ''}
                    >
                      <option value="">Select Shift Type</option>
                      {shiftOptions.map((shift, index) => (
                        <option key={index} value={shift}>{shift}</option>
                      ))}
                    </select>
                    {errors.shiftType && <p className="error-message">{errors.shiftType}</p>}
                  </div>
                  
                  <div className="form-group">
                    <label>Gender</label>
                    <select 
                      name="gender" 
                      value={formData.gender} 
                      onChange={handleChange}
                      className={errors.gender ? 'error' : ''}
                    >
                      {genderOptions.map((gender, index) => (
                        <option key={index} value={gender}>{gender}</option>
                      ))}
                    </select>
                    {errors.gender && <p className="error-message">{errors.gender}</p>}
                  </div>
                  
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input 
                      type="date" 
                      name="dob" 
                      value={formData.dob} 
                      onChange={handleChange}
                      className={errors.dob ? 'error' : ''}
                    />
                    {errors.dob && <p className="error-message">{errors.dob}</p>}
                  </div>
                  
                  <div className="form-group">
                    <label>Address</label>
                    <input 
                      type="text" 
                      name="address" 
                      value={formData.address} 
                      onChange={handleChange} 
                      placeholder="Enter full address"
                      className={errors.address ? 'error' : ''}
                    />
                    {errors.address && <p className="error-message">{errors.address}</p>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="workLocation">Work Location</label>
                    <select 
                      id="workLocation"
                      name="workLocation" 
                      value={formData.workLocation} 
                      onChange={handleChange}
                      className={errors.workLocation ? 'error' : ''}
                    >
                      <option value="">Select work location</option>
                      {locationOptions.map((location, index) => (
                        <option key={index} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                    {errors.workLocation && <span className="error-message">{errors.workLocation}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="isActive">Account Status</label>
                    <div className="checkbox-group">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      />
                      <label htmlFor="isActive" className="checkbox-label">
                        Active Account (User can login and access system)
                      </label>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="form-group">
                <label>Avatar Image</label>
                <div className="image-upload-container">
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Avatar Preview" />
                    </div>
                  )}
                  <input 
                    type="file" 
                    id="avatar-upload" 
                    name="image" 
                    accept="image/*"
                    onChange={handleImageChange} 
                    className="image-upload-input"
                  />
                  <label htmlFor="avatar-upload" className="image-upload-label">
                    {selectedImage ? 'Change Image' : 'Select Image'}
                  </label>
                </div>
              </div>
              
              <div className="step-actions">
                <button type="button" onClick={prevStep} className="prev-btn">
                  Back
                </button>
                <button 
                  type="submit" 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="submit-btn"
                >
                  {isSubmitting ? 'Processing...' : 'Complete'}
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
          className={`step-indicator ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}
          onClick={() => validateStep(currentStep) && currentStep > 2 && setCurrentStep(2)}
        >
          <div className="indicator-number">2</div>
          <div className="indicator-text">Personal Information</div>
        </div>
        <div 
          className={`step-indicator ${currentStep >= 3 ? 'active' : ''}`}
          onClick={() => validateStep(currentStep) && currentStep > 3 && setCurrentStep(3)}
        >
          <div className="indicator-number">3</div>
          <div className="indicator-text">Role and Details</div>
        </div>
      </div>
    );
  };

  return (
    <div className="user-add-container">
      <h2>Add User</h2>
      
      {renderStepIndicators()}
      
      <form onSubmit={(e) => e.preventDefault()}>
        {renderStep()}
      </form>
      
      {message && <p className={message.includes('successfully') ? 'message success-message' : 'message error-message'}>{message}</p>}
    </div>
  );
};

export default Register;
