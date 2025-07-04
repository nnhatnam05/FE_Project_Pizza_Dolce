import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../user_add/Register.css';

const EditUser = () => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    role: 'ADMIN',
    position: '',
    shiftType: '',
    address: '',
    dob: '',
    gender: 'Nam',
    workLocation: ''
  });
  const [originalData, setOriginalData] = useState({
    username: '',
    email: '',
    phone: ''
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

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

  // Memoize fetchUser function to prevent unnecessary re-renders
  const fetchUser = useCallback(async (token) => {
    let isMounted = true;
    try {
      // Sử dụng endpoint cơ bản để lấy thông tin người dùng
      const res = await axios.get(`http://localhost:8080/api/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!isMounted) return;
      
      // Store both current form data and original data for comparison
      const userData = res.data;
      const staffData = userData.staffProfile || {};
      
      setFormData({
        username: userData.username || '',
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        role: userData.role || 'ADMIN',
        position: staffData.position || '',
        shiftType: staffData.shiftType || '',
        address: staffData.address || '',
        dob: staffData.dob || '',
        gender: staffData.gender || 'Male',
        workLocation: staffData.workLocation || ''
      });
      
      setOriginalData({
        username: userData.username || '',
        email: userData.email || '',
        phone: userData.phone || ''
      });
      
      // Hiển thị avatar hiện tại nếu có
      if (userData.imageUrl) {
        setImagePreview(`http://localhost:8080${userData.imageUrl}`);
      }
    } catch (err) {
      if (!isMounted) return;
      console.error("Error fetching user:", err);
      setMessage('Failed to load user data');
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    
    // Trước hết kiểm tra quyền của người dùng hiện tại
    const checkCurrentUserRole = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          if (isMounted) {
            setMessage('You are not logged in. Please log in to continue.');
            setTimeout(() => {
              if (isMounted) {
                navigate('/admin/login');
              }
            }, 1500);
          }
          return;
        }

        const userResponse = await axios.get('http://localhost:8080/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!isMounted) return;
        
        setCurrentUserRole(userResponse.data.role);
        
        if (userResponse.data.role !== 'ADMIN') {
          setMessage('Access forbidden: Only ADMIN users can edit other users.');
          setTimeout(() => {
            if (isMounted) {
              navigate('/admin/users');
            }
          }, 1500);
          return;
        }

        fetchUser(token);
      } catch (err) {
        if (!isMounted) return;
        console.error("Error checking user permissions:", err);
        setMessage('Failed to verify your permissions. Please log in again.');
        setTimeout(() => {
          if (isMounted) {
            navigate('/admin/login');
          }
        }, 1500);
      }
    };

    checkCurrentUserRole();
    
    return () => {
      isMounted = false;
    };
  }, [id, navigate, fetchUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Clear field-specific error when user types
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    if (name === 'password') {
      setPassword(value);
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    }
    
    // Clear password errors
    if (errors.password || errors.confirmPassword) {
      setErrors({
        ...errors,
        password: '',
        confirmPassword: ''
      });
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

  const validatePhone = (phone) => {
    if (!phone.trim()) {
      return "Phone number is required";
    }
    if (!/^\d{10}$/.test(phone)) {
      return "Phone number must be exactly 10 digits";
    }
    return "";
  };

  const validatePassword = () => {
    // Only validate if password is provided (since it's optional for editing)
    if (!password) return "";
    
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

  const validatePasswordMatch = () => {
    if (password && password !== confirmPassword) {
      return "Passwords do not match";
    }
    return "";
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
        // For step 1, only validate passwords if they're provided
        const passwordError = validatePassword();
        if (passwordError) {
          stepErrors.password = passwordError;
          isValid = false;
        }
        
        const passwordMatchError = validatePasswordMatch();
        if (passwordMatchError) {
          stepErrors.confirmPassword = passwordMatchError;
          isValid = false;
        }
        
        // Username is disabled, so no validation needed
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
          
          if (!formData.address) {
            stepErrors.address = "Address is required for staff members";
            isValid = false;
          }
          
          if (!formData.dob) {
            stepErrors.dob = "Date of birth is required for staff members";
            isValid = false;
          }
          
          if (!formData.workLocation) {
            stepErrors.workLocation = "Work location is required for staff members";
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
    
    // Kiểm tra quyền admin
    if (currentUserRole !== 'ADMIN') {
      setMessage('Access forbidden: Only ADMIN users can update users.');
      return;
    }
    
    // Kiểm tra validation chỉ cho step hiện tại
    if (!validateStep(currentStep)) {
      setMessage('Please fill in all required fields correctly');
      return;
    }
    
    if (password && password !== confirmPassword) {
      setErrors(prev => ({...prev, confirmPassword: 'Passwords do not match'}));
      setCurrentStep(1);
      return;
    }
    
    // Kiểm tra thông tin nhân viên nếu là STAFF
    if (formData.role === 'STAFF') {
      const staffErrors = validateStaffDetails();
      if (Object.keys(staffErrors).length > 0) {
        setErrors(prev => ({...prev, ...staffErrors}));
        setMessage('Please fill in all required staff details');
        return;
      }
    }
    
    setIsSubmitting(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      console.log("Token being used:", token.substring(0, 20) + "..."); // Log token (một phần) để debug
      
      // Sử dụng FormData thay vì JSON
      const formDataToSend = new FormData();
      
      // Thêm các trường cơ bản
      formDataToSend.append('username', formData.username);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('role', formData.role);
      
      // Thêm mật khẩu nếu đã nhập
      if (password && password.trim() !== '') {
        formDataToSend.append('password', password);
      }
      
      // Thêm thông tin staffProfile nếu là STAFF
      if (formData.role === 'STAFF') {
        formDataToSend.append('position', formData.position);
        formDataToSend.append('shiftType', formData.shiftType);
        formDataToSend.append('address', formData.address);
        formDataToSend.append('dob', formData.dob);
        formDataToSend.append('gender', formData.gender);
        formDataToSend.append('workLocation', formData.workLocation);
      }
      
      // Thêm ảnh nếu có
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }

      // Sử dụng axios trực tiếp với các header cụ thể
      const response = await axios({
        method: 'put',
        url: `http://localhost:8080/api/auth/users/${id}`,
        data: formDataToSend,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log("Update successful:", response.data);
      setMessage('User updated successfully!');
      
      // Sử dụng biến để kiểm tra component đã unmounted chưa
      let isComponentMounted = true;
      setTimeout(() => {
        if (isComponentMounted) {
          navigate('/admin/users');
        }
      }, 1500);
      
      return () => {
        isComponentMounted = false;
      };
    } catch (err) {
      console.error("Update error details:", err);
      
      if (err.response && err.response.status === 403) {
        setMessage('Access forbidden: You do not have permission to update users. Only ADMIN users can perform this action.');
        console.error('Access forbidden. Your current role may not have permission.');
      } else if (err.response && err.response.data) {
        const errorResponse = err.response.data;
        console.log("Error response data:", errorResponse);
        
        // Xử lý các loại lỗi cụ thể
        if (typeof errorResponse === 'string') {
          // Nếu backend trả về lỗi dạng string
          setMessage(errorResponse);
        } else if (errorResponse.error) {
          // Nếu backend trả về lỗi dạng {error: "message"}
          const errorMessage = errorResponse.error;
          
          if (errorMessage.includes("Username already exists")) {
            setErrors(prev => ({ ...prev, username: "Username already exists" }));
            setCurrentStep(1);
          } else if (errorMessage.includes("Email already exists")) {
            setErrors(prev => ({ ...prev, email: "Email already exists" }));
            setCurrentStep(2);
          } else if (errorMessage.includes("Phone already exists")) {
            setErrors(prev => ({ ...prev, phone: "Phone already exists" }));
            setCurrentStep(2);
          } else {
            setMessage(errorMessage);
          }
        } else if (errorResponse.message) {
          // Nếu backend trả về lỗi dạng {message: "error"}
          setMessage(errorResponse.message);
        } else {
          setMessage('Update failed: Unknown error');
        }
      } else if (err.response && err.response.status === 404) {
        setMessage("User not found. The user may have been deleted.");
      } else {
        setMessage('Update failed. Please check your connection and try again.');
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
              <div className="step-title">Account Information</div>
            </div>
            <div className="step-content">
              <div className="info-text">
                Update account information. Username cannot be changed. Password is optional - leave blank to keep current password.
              </div>
              
              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  name="username" 
                  value={formData.username} 
                  disabled 
                  className="disabled-input"
                />
                {errors.username && <p className="error-message">{errors.username}</p>}
              </div>

              <div className="form-group">
                <label>New Password (optional)</label>
                <div className="password-input-container">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={password} 
                    onChange={handlePasswordChange} 
                    placeholder="Leave blank to keep current password"
                    className={errors.password ? 'error' : ''}
                    autoComplete="new-password"
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
                <label>Confirm New Password</label>
                <div className="password-input-container">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    name="confirmPassword" 
                    value={confirmPassword} 
                    onChange={handlePasswordChange} 
                    placeholder="Confirm new password"
                    className={errors.confirmPassword ? 'error' : ''}
                    autoComplete="new-password"
                  />
                  <button 
                    type="button" 
                    className="toggle-password" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
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
                {formData.email !== originalData.email && (
                  <p className="info-hint">You're changing the email address. This must be unique.</p>
                )}
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
                {formData.phone !== originalData.phone && (
                  <p className="info-hint">You're changing the phone number. This must be unique.</p>
                )}
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
                    <label>Work Location</label>
                    <select 
                      name="workLocation" 
                      value={formData.workLocation} 
                      onChange={handleChange}
                      className={errors.workLocation ? 'error' : ''}
                    >
                      <option value="">Select Work Location</option>
                      {locationOptions.map((location, index) => (
                        <option key={index} value={location}>{location}</option>
                      ))}
                    </select>
                    {errors.workLocation && <p className="error-message">{errors.workLocation}</p>}
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
                    {imagePreview ? 'Change Image' : 'Select Image'}
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
                  {isSubmitting ? 'Processing...' : 'Update User'}
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
          <div className="indicator-text">Account Information</div>
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

  if (loading) return <div className="user-add-container"><p className="message">Loading...</p></div>;

  return (
    <div className="user-add-container">
      <h2>Edit User</h2>
      
      {renderStepIndicators()}
      
      <form onSubmit={(e) => e.preventDefault()}>
        {renderStep()}
      </form>
      
      {message && <p className={message.includes('successfully') ? 'message success-message' : 'message error-message'}>{message}</p>}
    </div>
  );
};

export default EditUser;
