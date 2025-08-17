import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CustomerManagement.css';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Thêm state cho toggle status
  const [showToggleConfirmDialog, setShowToggleConfirmDialog] = useState(false);
  const [customerToToggle, setCustomerToToggle] = useState(null);
  const [toggleError, setToggleError] = useState('');
  const [toggleSuccess, setToggleSuccess] = useState('');
  const [isToggling, setIsToggling] = useState(false);
  
  const navigate = useNavigate();

  const customersPerPage = 10;

  // Fetch all customers
  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/admin/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data || []);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handle view details
  const handleViewDetails = (customerId) => {
    navigate(`/admin/customers/details/${customerId}`);
  };

  // Handle toggle status
  const handleToggleStatus = (id, name, currentStatus) => {
    // Reset any previous messages
    setToggleError('');
    setToggleSuccess('');
    
    // Set customer to toggle and show confirm dialog
    setCustomerToToggle({ id, name, currentStatus });
    setShowToggleConfirmDialog(true);
  };

  const handleConfirmToggle = async () => {
    if (isToggling) return;
    
    setIsToggling(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(`http://localhost:8080/api/admin/customers/${customerToToggle.id}/toggle-status`, {}, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Show success message
      const newStatus = customerToToggle.currentStatus ? 'deactivated' : 'activated';
      setToggleSuccess(`Customer ${newStatus} successfully`);
      
      // Refresh customer list after successful toggle
      fetchCustomers();
      
      // Close dialog after delay
      setTimeout(() => {
        setShowToggleConfirmDialog(false);
        setCustomerToToggle(null);
        setToggleSuccess('');
      }, 1500);
      
    } catch (err) {
      console.error("Error toggling customer status:", err);
      
      if (err.response) {
        const statusCode = err.response.status;
        const errorData = err.response.data;
        
        if (statusCode === 403) {
          setToggleError("Access forbidden: You don't have permission to toggle customer status.");
        } else if (statusCode === 404) {
          setToggleError("Customer not found. The customer may have been already deleted.");
        } else if (errorData) {
          if (typeof errorData === 'string') {
            setToggleError(errorData);
          } else if (errorData.error) {
            setToggleError(errorData.error);
          } else if (errorData.message) {
            setToggleError(errorData.message);
          } else {
            setToggleError(`Failed to toggle customer status: ${statusCode}`);
          }
        } else {
          setToggleError(`Server error (${statusCode}). Please try again later.`);
        }
      } else if (err.request) {
        setToggleError('No response from server. Please check your connection.');
      } else {
        setToggleError('Failed to toggle customer status. Please try again later.');
      }
    } finally {
      setIsToggling(false);
    }
  };

  const handleCancelToggle = () => {
    setShowToggleConfirmDialog(false);
    setCustomerToToggle(null);
    setToggleError('');
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer =>
    customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  const renderAvatar = () => {
    return (
      <div className="customer-avatar-small">
        👤
      </div>
    );
  };

  return (
    <div className="customer-list-container">
      <div className="customer-list-header">
        <h2>Customer List</h2>
        <div className="customer-stats">
          <span className="total-customers">Total: {customers.length} customers</span>
        </div>
      </div>

      <div className="customer-list-filters">
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <i className="search-icon">🔍</i>
        </div>
      </div>

      {loading ? (
        <div className="customer-loading">
          <div className="loading-spinner"></div>
          Loading customers...
        </div>
      ) : (
        <>
          <div className="customer-table-container">
            <table className="customer-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Avatar</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Points</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-customers">
                      {searchTerm ? 'No customers found matching your search.' : 'No customers found.'}
                    </td>
                  </tr>
                ) : (
                  currentCustomers.map((customer, idx) => {
                    const actualIndex = indexOfFirstCustomer + idx + 1;
                    
                    return (
                      <tr key={customer.id}>
                        <td>{actualIndex}</td>
                        <td>{renderAvatar()}</td>
                        <td className="customer-name">{customer.fullName || 'N/A'}</td>
                        <td>{customer.email}</td>
                        <td>{customer.phoneNumber || 'N/A'}</td>
                        <td className="points-cell">{customer.point || 0}</td>
                        <td className="status-cell">
                          <button 
                            className={`status-toggle-btn ${(customer.isActive !== null ? customer.isActive : true) ? 'status-active' : 'status-inactive'}`}
                            onClick={() => handleToggleStatus(customer.id, customer.fullName, customer.isActive !== null ? customer.isActive : true)}
                            title={(customer.isActive !== null ? customer.isActive : true) ? "Click to deactivate" : "Click to activate"}
                          >
                            {(customer.isActive !== null ? customer.isActive : true) ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="actions-cell">
                          <div className="action-buttons">
                            <button 
                              className="action-btn view-btn" 
                              onClick={() => handleViewDetails(customer.id)}
                              title="View Details"
                            >
                              👁️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {indexOfFirstCustomer + 1} to {Math.min(indexOfLastCustomer, filteredCustomers.length)} of {filteredCustomers.length} customers
              </div>
              <div className="pagination-controls">
                <button 
                  className="pagination-btn" 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
                
                <button 
                  className="pagination-btn" 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Toggle Status Confirm Dialog */}
      {showToggleConfirmDialog && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <div className="confirm-dialog-content">
              <h3>Confirm Status Change</h3>
              <p>Are you sure you want to <strong>{customerToToggle?.currentStatus ? 'deactivate' : 'activate'}</strong> <strong>{customerToToggle?.name}</strong>?</p>
              <p className="toggle-warning">
                {customerToToggle?.currentStatus 
                  ? 'Deactivating will prevent this customer from logging in and placing orders.'
                  : 'Activating will restore this customer\'s access to the system.'
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
                  {isToggling ? 'Processing...' : (customerToToggle?.currentStatus ? 'Deactivate' : 'Activate')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}