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

  const handleConfirmDelete = async () => {
    if (isDeleting) return;
    
    // Kiểm tra lại quyền trước khi xóa
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
                  <th>Code</th>
                  <th>Username</th>
                  <th>Avatar</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  {/* Add column for staff details */}
                  <th>Staff Details</th>
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
                      <td>S10{u.id}</td>
                      <td>{u.username}{isCurrentUser ? " (USING)" : ""}</td>
                      <td>{renderAvatar(u)}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td><span className={`role-badge role-${u.role?.toLowerCase()}`}>{u.role}</span></td>
                      <td>{renderStaffDetails(u)}</td>
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
    </div>
  );
}
