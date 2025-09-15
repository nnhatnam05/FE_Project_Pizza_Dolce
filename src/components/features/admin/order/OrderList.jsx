import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaSearch, FaFilter, FaCalendarAlt, FaUser, FaShoppingCart, FaDollarSign, FaClock } from 'react-icons/fa';
import './Order.css';
import { format } from 'date-fns';
import { useNotification } from '../../../../contexts/NotificationContext';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useNotification();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [deliveredRes, cancelledRes] = await Promise.all([
        axios.get('http://localhost:8080/api/orders/filter?status=DELIVERED', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8080/api/orders/filter?status=CANCELLED', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const allOrders = [...deliveredRes.data, ...cancelledRes.data]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setOrders(allOrders);
      applyFilters(allOrders, statusFilter, timeFilter, searchTerm);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      showError("Failed to load orders!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getTimeFilteredOrders = (ordersList, timeFilter) => {
    if (timeFilter === 'all') return ordersList;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return ordersList.filter(order => {
      const orderDate = new Date(order.createdAt);
      switch (timeFilter) {
        case 'today':
          return orderDate >= today;
        case 'week':
          return orderDate >= weekAgo;
        case 'month':
          return orderDate >= monthAgo;
        default:
          return true;
      }
    });
  };

  const applyFilters = (ordersList, status, time, search) => {
    let result = [...ordersList];

    // Time filter
    result = getTimeFilteredOrders(result, time);

    // Status filter
    if (status !== 'all') {
      result = result.filter(order => order.status === status);
    }

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(order =>
        order.orderNumber.toLowerCase().includes(searchLower) ||
        order.customer?.fullName?.toLowerCase().includes(searchLower) ||
        order.customer?.email?.toLowerCase().includes(searchLower) ||
        order.staff?.name?.toLowerCase().includes(searchLower) ||
        order.staff?.email?.toLowerCase().includes(searchLower) ||
        order.foodList?.some(food => food.name.toLowerCase().includes(searchLower))
      );
    }

    setFilteredOrders(result);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    applyFilters(orders, status, timeFilter, searchTerm);
  };

  const handleTimeFilterChange = (time) => {
    setTimeFilter(time);
    applyFilters(orders, statusFilter, time, searchTerm);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilters(orders, statusFilter, timeFilter, value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy HH:mm');
  };

  const getStatusBadgeClass = (status) => {
    return status === 'DELIVERED' ? 'status-delivered' : 'status-cancelled';
  };

  const getPaymentMethodLabel = (pm) => {
    if (!pm) return '—';
    const key = String(pm).toUpperCase();
    if (key === 'CASH') return 'Cash';
    if (key === 'QR_BANKING') return 'Bank Transfer';
    if (key === 'PAYOS') return 'PayOS';
    return pm;
  };

  const getOrderStats = () => {
    const delivered = filteredOrders.filter(o => o.status === 'DELIVERED').length;
    const cancelled = filteredOrders.filter(o => o.status === 'CANCELLED').length;
    const totalRevenue = filteredOrders
      .filter(o => o.status === 'DELIVERED')
      .reduce((sum, o) => sum + o.totalPrice, 0);
    
    return { delivered, cancelled, totalRevenue };
  };

  const stats = getOrderStats();

  return (
    <div className="modern-order-container">
      {/* Header */}
      <div className="modern-header">
        <div className="header-content">
          <h1 className="page-title">
            <FaShoppingCart className="title-icon" />
            Completed & Cancelled Orders
          </h1>
        </div>
      </div>

      {/* Filters */}
      <div className="modern-filters">
        <div className="filter-group">
          <label className="filter-label">
            <FaCalendarAlt className="filter-icon" />
            Time Period
          </label>
          <select 
            value={timeFilter} 
            onChange={(e) => handleTimeFilterChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">
            <FaFilter className="filter-icon" />
            Status
          </label>
          <select 
            value={statusFilter} 
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="search-group">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search orders, customers, staff..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="modern-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <div>Loading orders...</div>
          </div>
        ) : (
          <div className="content-layout">
            {/* Orders List */}
            <div className="orders-section">
              {filteredOrders.length === 0 ? (
                <div className="empty-state">
                  <FaShoppingCart className="empty-icon" />
                  <h3>No orders found</h3>
                  <p>Try adjusting your filters or search terms</p>
                </div>
              ) : (
                <div className="orders-grid">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className={`order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="order-card-header">
                        <div className="order-number">#{order.orderNumber}</div>
                        <span className={`completed-status-badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="order-card-body">
                        <div className="order-info-row">
                          <FaUser className="info-icon" />
                          <span>{order.customer?.fullName || 'Guest'}</span>
                        </div>
                        
                        {order.staff && (
                          <div className="order-info-row staff-row">
                            <FaUser className="info-icon" />
                            <span>Staff: {order.staff.name}</span>
                          </div>
                        )}
                        
                        <div className="order-info-row">
                          <FaDollarSign className="info-icon" />
                          <span className="price">${order.totalPrice}</span>
                        </div>

                        <div className="order-info-row">
                          <FaDollarSign className="info-icon" />
                          <span>Payment: {getPaymentMethodLabel(order.paymentMethod)}</span>
                        </div>
                        
                        <div className="order-info-row">
                          <FaClock className="info-icon" />
                          <span className="date">{formatDate(order.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Details */}
            <div className="details-section">
              {selectedOrder ? (
                <div className="order-details-card">
                  <div className="details-header">
                    <h3>Order Details</h3>
                    <span className={`completed-status-badge ${getStatusBadgeClass(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  
                  <div className="details-content">
                    <div className="detail-section">
                      <h4>Order Information</h4>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <label>Order ID:</label>
                          <span>#{selectedOrder.orderNumber}</span>
                        </div>
                        <div className="detail-item">
                          <label>Total Amount:</label>
                          <span className="price">${selectedOrder.totalPrice}</span>
                        </div>
                        <div className="detail-item">
                          <label>Payment Method:</label>
                          <span>{getPaymentMethodLabel(selectedOrder.paymentMethod)}</span>
                        </div>
                        <div className="detail-item">
                          <label>Created:</label>
                          <span>{formatDate(selectedOrder.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>Customer Information</h4>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <label>Name:</label>
                          <span>{selectedOrder.customer?.fullName || 'Guest'}</span>
                        </div>
                        <div className="detail-item">
                          <label>Email:</label>
                          <span>{selectedOrder.customer?.email || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <label>Phone:</label>
                          <span>{selectedOrder.customer?.phoneNumber || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {selectedOrder.staff && (
                      <div className="detail-section">
                        <h4>Staff Information</h4>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <label>Staff Name:</label>
                            <span>{selectedOrder.staff.name}</span>
                          </div>
                          <div className="detail-item">
                            <label>Email:</label>
                            <span>{selectedOrder.staff.email}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedOrder.deliveryAddress && (
                      <div className="detail-section">
                        <h4>Delivery Information</h4>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <label>Recipient:</label>
                            <span>{selectedOrder.recipientName || 'N/A'}</span>
                          </div>
                          <div className="detail-item">
                            <label>Phone:</label>
                            <span>{selectedOrder.recipientPhone || 'N/A'}</span>
                          </div>
                          <div className="detail-item full-width">
                            <label>Address:</label>
                            <span>{selectedOrder.deliveryAddress}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="detail-section">
                      <h4>Order Items</h4>
                      <div className="items-list">
                        {selectedOrder.foodList?.map((food, idx) => (
                          <div key={idx} className="item-row">
                            <span className="item-name">{food.name}</span>
                            <span className="item-quantity">×{food.quantity}</span>
                            <span className="item-price">${(food.price * food.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedOrder.status === 'CANCELLED' && selectedOrder.rejectReason && (
                      <div className="detail-section">
                        <h4>Cancellation Reason</h4>
                        <p className="cancel-reason">{selectedOrder.rejectReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="no-selection">
                  <FaShoppingCart className="no-selection-icon" />
                  <h3>Select an order</h3>
                  <p>Choose an order from the list to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}