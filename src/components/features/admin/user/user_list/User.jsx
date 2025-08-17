import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../../../contexts/NotificationContext';
import './User.css';

export default function User() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const { showError } = useNotification();
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToDeleteName, setUserToDeleteName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Thêm state cho toggle status
  const [showToggleConfirmDialog, setShowToggleConfirmDialog] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);
  const [toggleError, setToggleError] = useState('');
  const [toggleSuccess, setToggleSuccess] = useState('');
  const [isToggling, setIsToggling] = useState(false);
  
  const navigate = useNavigate();

  const usersPerPage = 10;
  
  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCurrentUserId(response.data.id);
      setCurrentUserRole(response.data.role);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = Array.isArray(res.data) ? res.data : res.data.data;
      setUsers(data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    // Fetch current user first, then fetch all users
    fetchCurrentUser();
    fetchUsers();
  }, []);

  // Filter users based on search term and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Calculate pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDelete = (id, name) => {
    // Kiểm tra xem người dùng hiện tại có quyền ADMIN không
    if (currentUserRole !== 'ADMIN') {
      showError("You don't have permission to delete users. Only ADMIN users can perform this action.");
      return;
    }
    
    // Prevent deleting current logged-in user
    if (id === currentUserId) {
      showError("You cannot delete your own account while logged in.");
      return;
    }

    // Reset any previous messages
    setDeleteError('');
    setDeleteSuccess('');
    
    // Set user to delete and show confirm dialog
    setUserToDelete(id);
    setUserToDeleteName(name || `User ID: ${id}`);
    setShowConfirmDialog(true);
  };

  // Thêm function xử lý toggle status
  const handleToggleStatus = (id, name, currentStatus) => {
    // Prevent toggling current logged-in user
    if (id === currentUserId) {
      showError("You cannot deactivate your own account while logged in.");
      return;
    }

    // Reset any previous messages
    setToggleError('');
    setToggleSuccess('');
    
    // Set user to toggle and show confirm dialog
    setUserToToggle({ id, name, currentStatus });
    setShowToggleConfirmDialog(true);
  };

  const handleConfirmToggle = async () => {
    if (isToggling) return;
    
    setIsToggling(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(`http://localhost:8080/api/auth/users/${userToToggle.id}/toggle-status`, {}, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Show success message
      const newStatus = userToToggle.currentStatus ? 'deactivated' : 'activated';
      setToggleSuccess(`User ${newStatus} successfully`);
      
      // Refresh user list after successful toggle
      fetchUsers();
      
      // Close dialog after delay
      setTimeout(() => {
        setShowToggleConfirmDialog(false);
        setUserToToggle(null);
        setToggleSuccess('');
      }, 1500);
      
    } catch (err) {
      console.error("Error toggling user status:", err);
      
      if (err.response) {
        const statusCode = err.response.status;
        const errorData = err.response.data;
        
        if (statusCode === 403) {
          setToggleError("Access forbidden: You don't have permission to toggle user status.");
        } else if (statusCode === 404) {
          setToggleError("User not found. The user may have been already deleted.");
        } else if (errorData) {
          if (typeof errorData === 'string') {
            setToggleError(errorData);
          } else if (errorData.error) {
            setToggleError(errorData.error);
          } else if (errorData.message) {
            setToggleError(errorData.message);
          } else {
            setToggleError(`Failed to toggle user status: ${statusCode}`);
          }
        } else {
          setToggleError(`Server error (${statusCode}). Please try again later.`);
        }
      } else if (err.request) {
        setToggleError('No response from server. Please check your connection.');
      } else {
        setToggleError('Failed to toggle user status. Please try again later.');
      }
    } finally {
      setIsToggling(false);
    }
  };

  const handleCancelToggle = () => {
    setShowToggleConfirmDialog(false);
    setUserToToggle(null);
    setToggleError('');
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) return;
    
            // Check permissions again before deleting
    if (currentUserRole !== 'ADMIN') {
      setDeleteError("Access forbidden: Only ADMIN users can delete other users.");
      return;
    }
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      
      console.log(`Attempting to delete user with ID: ${userToDelete}`);
      
      // Sử dụng API đường dẫn /api/admin/users/{id} thay vì /api/auth/users/{id}
      const response = await axios.delete(`http://localhost:8080/api/auth/users/${userToDelete}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Delete response:", response.data);
      
      // Show success message
      setDeleteSuccess('User deleted successfully');
      
      // Refresh user list after successful deletion
      fetchUsers();
      
      // Close dialog after delay
      setTimeout(() => {
        setShowConfirmDialog(false);
        setUserToDelete(null);
        setUserToDeleteName('');
        setDeleteSuccess('');
      }, 1500);
      
    } catch (err) {
      console.error("Error deleting user:", err);
      
      // Handle error response
      if (err.response) {
        const statusCode = err.response.status;
        const errorData = err.response.data;
        
        console.log("Error status:", statusCode);
        console.log("Error data:", errorData);
        
        if (statusCode === 403) {
          setDeleteError("Access forbidden: You don't have permission to delete users. Only ADMIN users can perform this action.");
        } else if (statusCode === 404) {
          setDeleteError("User not found. The user may have been already deleted.");
        } else if (errorData) {
          if (typeof errorData === 'string') {
            setDeleteError(errorData);
          } else if (errorData.error) {
            setDeleteError(errorData.error);
          } else if (errorData.message) {
            setDeleteError(errorData.message);
          } else {
            setDeleteError(`Failed to delete user: ${statusCode}`);
          }
        } else {
          setDeleteError(`Server error (${statusCode}). Please try again later.`);
        }
      } else if (err.request) {
        setDeleteError('No response from server. Please check your connection.');
      } else {
        setDeleteError('Failed to delete user. Please try again later.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setUserToDelete(null);
    setUserToDeleteName('');
    setDeleteError('');
  };

  const handleEdit = (id) => {
    navigate(`/admin/users/edit/${id}`);
  };
  
  const handleViewDetails = (id) => {
    navigate(`/admin/users/details/${id}`);
  };

  // Render avatar with fallback
  const renderAvatar = (user) => {
    const imageUrl = user.imageUrl && user.imageUrl !== 'null' && user.imageUrl !== 'undefined'
      ? `http://localhost:8080${user.imageUrl}`
      : null;

    if (imageUrl) {
      return (
        <div className="avatar-img-container">
          <img 
            src={imageUrl}
            alt={`${user.username}'s avatar`} 
            className="avatar-img" 
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = '/images/Logo.png'; // Fallback to default image
            }} 
          />
        </div>
      );
    } else {
      // Create initials from username or name
      const initials = user.name ? 
        user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() :
        user.username.substring(0, 2).toUpperCase();
        
      return (
        <div className="avatar-placeholder">
          {initials}
        </div>
      );
    }
  };
  
  // Render staff details if available
  const renderStaffDetails = (user) => {
    if (user.role !== 'STAFF' || !user.staffProfile) return '-';
    
    return (
      <span className="staff-details-badge" title={`
        Position: ${user.staffProfile.position || 'N/A'}
        Shift: ${user.staffProfile.shiftType || 'N/A'}
        Location: ${user.staffProfile.workLocation || 'N/A'}
      `}>
        {user.staffProfile.position}
      </span>
    );
  };

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <h2>User List</h2>
        <button className="add-user-btn" onClick={() => navigate('/admin/register')}>+ Add User</button>
      </div>

      <div className="user-list-filters">
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search users..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
          <i className="search-icon">🔍</i>
        </div>
        <div className="filter-container">
          <select 
            value={roleFilter} 
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1); // Reset to first page on filter change
            }}
            className="role-filter"
          >
            <option value="ALL">All roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="STAFF">STAFF</option>
          </select>
        </div>
      </div>

      {/* Hiển thị thông báo nếu không phải ADMIN */}
      {currentUserRole && currentUserRole !== 'ADMIN' && (
        <div className="role-warning">
          <p>
            <strong>Note:</strong> You are logged in with {currentUserRole} privileges. Some actions like deleting users are restricted to ADMIN users only.
          </p>
        </div>
      )}

      {loading ? (
        <div className="user-loading">
          <div className="loading-spinner"></div>
          Loading users...
        </div>
      ) : (
        <>
          <div className="user-table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User Info</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((u, idx) => {
                  const isCurrentUser = u.id === currentUserId;
                  const actualIndex = indexOfFirstUser + idx + 1;
                  const isStaff = u.role === 'STAFF';
                  
                  return (
                    <tr key={u.id} className={isCurrentUser ? "current-user-row" : ""}>
                      <td>{actualIndex}</td>
                      <td className="user-info-cell">
                        <div className="user-avatar-name">
                          {renderAvatar(u)}
                          <div className="user-details">
                            <div className="user-name">{u.name}</div>
                            <div className="user-code">S10{u.id} • {u.username}{isCurrentUser ? " (USING)" : ""}</div>
                            {isStaff && u.staffProfile && (
                              <div className="staff-details">
                                <small>📍 {u.staffProfile.workLocation || 'N/A'}</small>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="contact-cell">
                        <div className="contact-info">
                          <div className="email">{u.email}</div>
                          <div className="phone">{u.phone}</div>
                        </div>
                      </td>
                      <td><span className={`role-badge role-${u.role?.toLowerCase()}`}>{u.role}</span></td>
                      <td>
                        <button 
                          className={`status-toggle-btn ${(u.isActive !== null ? u.isActive : true) ? 'status-active' : 'status-inactive'}`}
                          onClick={() => handleToggleStatus(u.id, u.name || u.username, u.isActive !== null ? u.isActive : true)}
                          disabled={u.id === currentUserId}
                          title={(u.isActive !== null ? u.isActive : true) ? "Click to deactivate" : "Click to activate"}
                        >
                          {(u.isActive !== null ? u.isActive : true) ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="actions-cell">
                        <div className="action-buttons">
                          {isStaff && (
                            <button 
                              className="action-btn view-btn" 
                              onClick={() => handleViewDetails(u.id)}
                              title="View Details"
                            >
                              👁️
                            </button>
                          )}
                          <button 
                            className="action-btn edit-btn" 
                            onClick={() => handleEdit(u.id)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button 
                            className="action-btn delete-btn" 
                            onClick={() => handleDelete(u.id, u.name || u.username)}
                            disabled={isCurrentUser || currentUserRole !== 'ADMIN'}
                            title={currentUserRole !== 'ADMIN' ? "Only ADMIN users can delete" : "Delete"}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredUsers.length > 0 ? (
            <div className="pagination">
              <div className="pagination-info">
                Showing {indexOfFirstUser + 1} - {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
              </div>
              <div className="pagination-controls">
                <button 
                  className="page-control" 
                  onClick={() => paginate(1)} 
                  disabled={currentPage === 1}
                  title="First Page"
                >
                  «
                </button>
                <button 
                  className="page-control" 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  title="Previous Page"
                >
                  ‹
                </button>
                
                {/* Page numbers */}
                <div className="page-numbers">
                  {[...Array(totalPages).keys()].map(number => (
                    <button
                      key={number + 1}
                      onClick={() => paginate(number + 1)}
                      className={`page-number ${currentPage === number + 1 ? 'active' : ''}`}
                    >
                      {number + 1}
                    </button>
                  ))}
                </div>
                
                <button 
                  className="page-control" 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  title="Next Page"
                >
                  ›
                </button>
                <button 
                  className="page-control" 
                  onClick={() => paginate(totalPages)} 
                  disabled={currentPage === totalPages}
                  title="Last Page"
                >
                  »
                </button>
              </div>
            </div>
          ) : (
            <div className="no-results">No users found</div>
          )}
        </>
      )}

      {/* Custom Confirm Dialog with error handling */}
      {showConfirmDialog && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <div className="confirm-dialog-content">
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete <strong>{userToDeleteName}</strong>?</p>
              <p className="delete-warning">This action cannot be undone. All associated data will be permanently removed.</p>
              
              {deleteError && (
                <div className="delete-error-message">
                  {deleteError}
                </div>
              )}
              
              {deleteSuccess && (
                <div className="delete-success-message">
                  {deleteSuccess}
                </div>
              )}
              
              <div className="confirm-dialog-actions">
                <button 
                  onClick={handleCancelDelete} 
                  className="cancel-btn" 
                  disabled={!!deleteSuccess || isDeleting}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDelete} 
                  className="confirm-btn"
                  disabled={!!deleteSuccess || isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Status Confirm Dialog */}
      {showToggleConfirmDialog && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <div className="confirm-dialog-content">
              <h3>Confirm Status Change</h3>
              <p>Are you sure you want to <strong>{userToToggle?.currentStatus ? 'deactivate' : 'activate'}</strong> <strong>{userToToggle?.name}</strong>?</p>
              <p className="toggle-warning">
                {userToToggle?.currentStatus 
                  ? 'Deactivating will prevent this user from logging in and accessing the system.'
                  : 'Activating will restore this user\'s access to the system.'
                }
              </p>
              
              {toggleError && (
                <div className="delete-error-message">
                  {toggleError}
                </div>
              )}
              
              {toggleSuccess && (
                <div className="delete-success-message">
                  {toggleSuccess}
                </div>
              )}
              
              <div className="confirm-dialog-actions">
                <button 
                  onClick={handleCancelToggle} 
                  className="cancel-btn" 
                  disabled={!!toggleSuccess || isToggling}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmToggle} 
                  className="confirm-btn"
                  disabled={!!toggleSuccess || isToggling}
                >
                  {isToggling ? 'Processing...' : (userToToggle?.currentStatus ? 'Deactivate' : 'Activate')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
