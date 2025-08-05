import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGift, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import './Detail_Customer.css';

export default function Detail_Customer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const fetchCustomerDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/admin/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomerDetails(response.data);
    } catch (error) {
      console.error("Failed to fetch customer details:", error);
      setError('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    navigate('/admin/customers');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="detail-customer-container">
        <div className="loading-spinner">Loading customer details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-customer-container">
        <div className="error-message">{error}</div>
        <button className="back-button" onClick={handleBackToList}>
          <FaArrowLeft /> Back to Customer List
        </button>
      </div>
    );
  }

  if (!customerDetails) {
    return (
      <div className="detail-customer-container">
        <div className="error-message">Customer not found</div>
        <button className="back-button" onClick={handleBackToList}>
          <FaArrowLeft /> Back to Customer List
        </button>
      </div>
    );
  }

  return (
    <div className="detail-customer-container">
      <div className="detail-customer-header">
        <button className="back-button" onClick={handleBackToList}>
          <FaArrowLeft /> Back to Customer List
        </button>
        <h1>Customer Details</h1>
      </div>

      <div className="detail-customer-content">
        {/* Basic Information */}
        <div className="detail-section">
          <div className="section-header">
            <FaUser className="section-icon" />
            <h2>Customer Information</h2>
          </div>
          <div className="customer-basic-info">
            <div className="customer-avatar-large">
              <FaUser />
            </div>
            <div className="basic-info-grid">
              <div className="info-item">
                <label>Full Name:</label>
                <span>{customerDetails.customer.fullName || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{customerDetails.customer.email}</span>
              </div>
              <div className="info-item">
                <label>Phone Number:</label>
                <span>{customerDetails.customer.phoneNumber || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Loyalty Points:</label>
                <span className="points-value">{customerDetails.customer.point || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="detail-section">
          <div className="section-header">
            <FaShoppingCart className="section-icon" />
            <h2>Order History ({customerDetails.orders.length})</h2>
          </div>
          <div className="orders-container">
            {customerDetails.orders.length === 0 ? (
              <div className="no-data">No orders found</div>
            ) : (
              <div className="orders-table-wrapper">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order Number</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Voucher</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerDetails.orders.map(order => (
                      <tr key={order.id}>
                        <td className="order-number">#{order.orderNumber}</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td className="order-total">{formatCurrency(order.totalPrice)}</td>
                        <td>
                          <span className={`status-badge status-${order.status.toLowerCase()}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          {order.voucherCode ? (
                            <div className="voucher-info">
                              <span className="voucher-code">{order.voucherCode}</span>
                              {order.voucherDiscount > 0 && (
                                <span className="voucher-discount">
                                  -{formatCurrency(order.voucherDiscount)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="no-voucher">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Current Vouchers */}
        <div className="detail-section">
          <div className="section-header">
            <FaGift className="section-icon" />
            <h2>Current Vouchers ({customerDetails.vouchers.length})</h2>
          </div>
          <div className="vouchers-container">
            {customerDetails.vouchers.length === 0 ? (
              <div className="no-data">No vouchers found</div>
            ) : (
              <div className="vouchers-grid">
                {customerDetails.vouchers.map(voucher => (
                  <div key={voucher.id} className="voucher-card">
                    <div className="voucher-header">
                      <span className="voucher-code">{voucher.code}</span>
                      <span className="voucher-type">{voucher.type}</span>
                    </div>
                    <div className="voucher-body">
                      <div className="voucher-value">
                        {voucher.type === 'PERCENTAGE' ? `${voucher.value}%` : formatCurrency(voucher.value)}
                      </div>
                      <div className="voucher-expires">
                        Expires: {formatDate(voucher.expiresAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Saved Addresses */}
        <div className="detail-section">
          <div className="section-header">
            <FaMapMarkerAlt className="section-icon" />
            <h2>Saved Addresses ({customerDetails.addresses.length})</h2>
          </div>
          <div className="addresses-container">
            {customerDetails.addresses.length === 0 ? (
              <div className="no-data">No addresses found</div>
            ) : (
              <div className="addresses-list">
                {customerDetails.addresses.map(address => (
                  <div key={address.id} className="address-card">
                    <div className="address-header">
                      <span className="recipient-name">{address.recipientName}</span>
                      {address.isDefault && (
                        <span className="default-badge">Default</span>
                      )}
                    </div>
                    <div className="address-body">
                      <div className="recipient-phone">
                        <FaPhone className="phone-icon" />
                        {address.recipientPhone}
                      </div>
                      <div className="address-text">
                        <FaMapMarkerAlt className="address-icon" />
                        {address.address}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 