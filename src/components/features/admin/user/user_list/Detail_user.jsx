import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './Detail_user.css';

const DetailUser = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:8080/api/auth/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUserDetails(response.data);
      } catch (err) {
        console.error('Error fetching user details:', err);
        if (err.response && err.response.status === 404) {
          setError('User not found');
        } else {
          setError('Failed to load user details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const calculateAge = (dobString) => {
    if (!dobString) return 'N/A';
    
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    
    // Check if birthday hasn't occurred yet this year
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return `${age} tuổi`;
  };

  const calculateWorkDuration = (joinDateString) => {
    if (!joinDateString) return 'N/A';
    
    const joinDate = new Date(joinDateString);
    const today = new Date();
    
    const diffTime = Math.abs(today - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} ngày`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} tháng`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return `${years} năm ${remainingMonths} tháng`;
    }
  };

  const renderAvatar = () => {
    if (!userDetails) return null;

    const imageUrl = userDetails.imageUrl && userDetails.imageUrl !== 'null' && userDetails.imageUrl !== 'undefined'
      ? `http://localhost:8080${userDetails.imageUrl}`
      : null;

    if (imageUrl) {
      return (
        <div className="user-avatar">
          <img 
            src={imageUrl}
            alt={`${userDetails.username}'s avatar`} 
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = '/images/Logo.png'; // Fallback to default image
            }} 
          />
        </div>
      );
    } else {
      // Create initials from username or name
      const initials = userDetails.name ? 
        userDetails.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() :
        userDetails.username.substring(0, 2).toUpperCase();
        
      return (
        <div className="user-avatar-placeholder">
          {initials}
        </div>
      );
    }
  };

  const handleBackToList = () => {
    navigate('/admin/users');
  };

  const renderStatusTag = (status = "Đang làm") => {
    const normalizedStatus = status.toLowerCase();
    
    if (normalizedStatus.includes("đang làm")) {
      return (
        <span className="staff-status đang-làm">
          Đang làm
        </span>
      );
    } else if (normalizedStatus.includes("nghỉ việc")) {
      return (
        <span className="staff-status nghỉ-việc">
          Nghỉ việc
        </span>
      );
    } else {
      return (
        <span className="staff-status đang-làm">
          {status}
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="detail-user-container">
        <div className="detail-user-loading">
          <div className="loading-spinner"></div>
          Loading user details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-user-container">
        <div className="detail-user-error">{error}</div>
        <button className="back-button" onClick={handleBackToList}>Back to User List</button>
      </div>
    );
  }

  if (!userDetails || userDetails.role !== 'STAFF') {
    return (
      <div className="detail-user-container">
        <div className="detail-user-error">This user is not a staff member or data is not available.</div>
        <button className="back-button" onClick={handleBackToList}>Back to User List</button>
      </div>
    );
  }

  const staffProfile = userDetails.staffProfile || {};

  return (
    <div className="detail-user-container">
      <div className="detail-user-header">
        <h2>Staff Details</h2>
        <button className="back-button" onClick={handleBackToList}>Back to User List</button>
      </div>

      <div className="detail-user-content">
        <div className="detail-user-profile-header">
          {renderAvatar()}
          <div className="user-header-info">
            <h3>{userDetails.name}</h3>
            <div className="user-status">
              <span className="staff-code">Code: {staffProfile.staffCode || `S10${userDetails.id}`}</span>
              {renderStatusTag(staffProfile.status)}
            </div>
            <div className="position-badge">{staffProfile.position || "Staff"}</div>
            
            <div className="user-quick-stats">
              <div className="quick-stat">
                <span className="stat-icon">📅</span>
                <span className="stat-text">Join date: {formatDate(staffProfile.joinDate)}</span>
              </div>
              <div className="quick-stat">
                <span className="stat-icon">⏱️</span>
                <span className="stat-text">Duration: {calculateWorkDuration(staffProfile.joinDate)}</span>
              </div>
              <div className="quick-stat">
                <span className="stat-icon">📍</span>
                <span className="stat-text">{staffProfile.workLocation || 'No location specified'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-user-sections">
          <div className="detail-section">
            <h4>Account Information</h4>
            <div className="detail-row">
              <div className="detail-label">Username</div>
              <div className="detail-value">{userDetails.username}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Email</div>
              <div className="detail-value">
                <a href={`mailto:${userDetails.email}`} className="email-link">
                  {userDetails.email}
                </a>
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Phone</div>
              <div className="detail-value">
                <a href={`tel:${userDetails.phone}`} className="phone-link">
                  {userDetails.phone}
                </a>
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Role</div>
              <div className="detail-value">
                <span className="role-badge">{userDetails.role}</span>
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Account Status</div>
              <div className="detail-value">
                {renderStatusTag(staffProfile.status)}
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h4>Personal Information</h4>
            <div className="detail-row">
              <div className="detail-label">Full Name</div>
              <div className="detail-value">{userDetails.name}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Gender</div>
              <div className="detail-value">
                <span className="gender-value">
                  {staffProfile.gender === 'Nam' ? '♂' : staffProfile.gender === 'Nữ' ? '♀' : '⚧'} {staffProfile.gender || "N/A"}
                </span>
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Date of Birth</div>
              <div className="detail-value">
                {formatDate(staffProfile.dob)} 
                <span className="additional-info">{calculateAge(staffProfile.dob)}</span>
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Address</div>
              <div className="detail-value address-value">
                <span className="address-icon">🏠</span>
                {staffProfile.address || "N/A"}
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h4>Work Information</h4>
            <div className="detail-row">
              <div className="detail-label">Position</div>
              <div className="detail-value">
                <span className="position-value">{staffProfile.position || "N/A"}</span>
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Shift Type</div>
              <div className="detail-value">
                <span className="shift-badge">
                  {staffProfile.shiftType || "N/A"}
                </span>
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Work Location</div>
              <div className="detail-value">
                <span className="location-value">
                  <span className="location-icon">📍</span>
                  {staffProfile.workLocation || "N/A"}
                </span>
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Join Date</div>
              <div className="detail-value">
                {formatDate(staffProfile.joinDate)}
                <span className="additional-info">
                  {calculateWorkDuration(staffProfile.joinDate)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-actions">
          <button 
            className="edit-button" 
            onClick={() => navigate(`/admin/users/edit/${id}`)}
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailUser;
