import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNotification } from "../../../../contexts/NotificationContext";
import "./Order.css";
import { FaSync, FaSearch, FaUser, FaEye, FaCreditCard, FaPhone, FaFilter, FaCalendarAlt, FaShoppingBag, FaDollarSign, FaClock } from "react-icons/fa";

const TAKEAWAY_STATUS = [
  { key: "PENDING", label: "Pending Payment", color: "#ff9800" },
  { key: "PAID", label: "Paid", color: "#4caf50" },
  { key: "PREPARING", label: "Preparing", color: "#2196f3" },
  { key: "READY", label: "Ready", color: "#9c27b0" },
  { key: "COMPLETED", label: "Completed", color: "#4caf50" },
  { key: "CANCELLED", label: "Cancelled", color: "#f44336" }
];

const PAYMENT_METHODS = {
  "CASH": "Cash",
  "QR_BANKING": "QR Banking"
};

export default function AdminTakeAwayOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { showError, showSuccess } = useNotification();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshInterval, setRefreshInterval] = useState(30);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders(false);
    }, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const fetchOrders = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/api/admin/orders/take-away", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch take-away orders:", error);
      showError("Failed to fetch take-away orders");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

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

  const getStatusColor = (status) => {
    const statusObj = TAKEAWAY_STATUS.find(s => s.key === status);
    return statusObj ? statusObj.color : "#666";
  };

  const getStatusLabel = (status) => {
    const statusObj = TAKEAWAY_STATUS.find(s => s.key === status);
    return statusObj ? statusObj.label : status;
  };

  const filteredOrders = orders.filter(order => {
    // Time filter
    const timeFiltered = getTimeFilteredOrders([order], timeFilter).length > 0;
    if (!timeFiltered) return false;

    // Status filter
    const matchesFilter = filter === "all" || order.status === filter;
    
    // Search filter
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.staff?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.recipientPhone?.includes(searchTerm);
    
    return matchesFilter && matchesSearch;
  });

  const formatCurrency = (amount) => {
    return `$${Number(amount).toFixed(2)}`;
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderStats = () => {
    const pending = filteredOrders.filter(o => o.status === 'PENDING').length;
    const paid = filteredOrders.filter(o => o.status === 'PAID').length;
    const preparing = filteredOrders.filter(o => o.status === 'PREPARING').length;
    const ready = filteredOrders.filter(o => o.status === 'READY').length;
    const completed = filteredOrders.filter(o => o.status === 'COMPLETED').length;
    const totalRevenue = filteredOrders
      .filter(o => ['PAID', 'PREPARING', 'READY', 'COMPLETED'].includes(o.status))
      .reduce((sum, o) => sum + o.totalPrice, 0);
    
    return { pending, paid, preparing, ready, completed, totalRevenue };
  };

  const stats = getOrderStats();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading take-away orders...</p>
      </div>
    );
  }

  return (
    <div className="modern-order-container">
      {/* Header */}
      <div className="modern-header">
        <div className="header-content">
          <h1 className="page-title">
            <FaShoppingBag className="title-icon" />
            Take-Away Orders Management
          </h1>
        </div>
        <div className="header-actions">
          <button 
            className="refresh-btn"
            onClick={() => fetchOrders()}
            title="Refresh"
          >
            <FaSync />
          </button>
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
            onChange={(e) => setTimeFilter(e.target.value)}
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
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            {TAKEAWAY_STATUS.map(status => (
              <option key={status.key} value={status.key}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="search-group">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search orders, customers, staff, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Auto Refresh</label>
          <select 
            value={refreshInterval} 
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="filter-select"
          >
            <option value={15}>15 seconds</option>
            <option value={30}>30 seconds</option>
            <option value={60}>1 minute</option>
            <option value={0}>Off</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="modern-content">
        <div className="content-layout">
          {/* Orders List */}
          <div className="orders-section">
            {filteredOrders.length === 0 ? (
              <div className="empty-state">
                <FaShoppingBag className="empty-icon" />
                <h3>No take-away orders found</h3>
                <p>Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="orders-grid">
                {filteredOrders.map(order => (
                  <div 
                    key={order.id} 
                    className={`order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="order-card-header">
                      <div className="order-number">#{order.orderNumber}</div>
                      <span 
                        className="takeaway-status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>

                    <div className="order-card-body">
                      <div className="order-info-row">
                        <FaUser className="info-icon" />
                        <span>Customer: {order.customer?.fullName || order.recipientName || 'Walk-in'}</span>
                      </div>

                      {order.recipientPhone && (
                        <div className="order-info-row">
                          <FaPhone className="info-icon" />
                          <span>Phone: {order.recipientPhone}</span>
                        </div>
                      )}

                      {order.staff && (
                        <div className="order-info-row staff-row">
                          <FaUser className="info-icon" />
                          <span>Staff: {order.staff.name}</span>
                        </div>
                      )}

                      {order.paymentMethod && (
                        <div className="order-info-row">
                          <FaCreditCard className="info-icon" />
                          <span>Payment: {PAYMENT_METHODS[order.paymentMethod] || order.paymentMethod}</span>
                        </div>
                      )}

                      <div className="order-info-row">
                        <FaDollarSign className="info-icon" />
                        <span className="price">{formatCurrency(order.totalPrice)}</span>
                      </div>

                      <div className="order-info-row">
                        <FaClock className="info-icon" />
                        <span className="date">{formatDateTime(order.createdAt)}</span>
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
                  <span 
                    className="takeaway-status-badge"
                    style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                  >
                    {getStatusLabel(selectedOrder.status)}
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
                        <span className="price">{formatCurrency(selectedOrder.totalPrice)}</span>
                      </div>
                      <div className="detail-item">
                        <label>Created:</label>
                        <span>{formatDateTime(selectedOrder.createdAt)}</span>
                      </div>
                      {selectedOrder.updatedAt && (
                        <div className="detail-item">
                          <label>Last Updated:</label>
                          <span>{formatDateTime(selectedOrder.updatedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Customer Information</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Name:</label>
                        <span>{selectedOrder.customer?.fullName || selectedOrder.recipientName || 'Walk-in Customer'}</span>
                      </div>
                      {selectedOrder.recipientPhone && (
                        <div className="detail-item">
                          <label>Phone:</label>
                          <span>{selectedOrder.recipientPhone}</span>
                        </div>
                      )}
                      {selectedOrder.customer?.email && (
                        <div className="detail-item">
                          <label>Email:</label>
                          <span>{selectedOrder.customer.email}</span>
                        </div>
                      )}
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

                  {selectedOrder.paymentMethod && (
                    <div className="detail-section">
                      <h4>Payment Information</h4>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <label>Payment Method:</label>
                          <span>{PAYMENT_METHODS[selectedOrder.paymentMethod] || selectedOrder.paymentMethod}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedOrder.orderFoods && selectedOrder.orderFoods.length > 0 && (
                    <div className="detail-section">
                      <h4>Order Items</h4>
                      <div className="items-list">
                        {selectedOrder.orderFoods.map((item, index) => (
                          <div key={index} className="item-row">
                            <span className="item-name">{item.food?.name || 'N/A'}</span>
                            <span className="item-quantity">×{item.quantity}</span>
                            <span className="item-price">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="order-total">
                        <strong>Total: {formatCurrency(selectedOrder.totalPrice)}</strong>
                      </div>
                    </div>
                  )}

                  {selectedOrder.customer && (
                    <div className="detail-section">
                      <h4>Customer Details</h4>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <label>Email:</label>
                          <span>{selectedOrder.customer.email}</span>
                        </div>
                        <div className="detail-item">
                          <label>Loyalty Points:</label>
                          <span>{selectedOrder.customer.customerDetail?.point || 0} points</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedOrder.note && (
                    <div className="detail-section">
                      <h4>Notes</h4>
                      <p className="order-note">{selectedOrder.note}</p>
                    </div>
                  )}

                  {selectedOrder.billImageUrl && (
                    <div className="detail-section">
                      <h4>Payment Proof</h4>
                      <img 
                        src={selectedOrder.billImageUrl} 
                        alt="Payment proof" 
                        className="payment-image"
                        style={{ maxWidth: '300px', height: 'auto', borderRadius: '8px' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="no-selection">
                <FaShoppingBag className="no-selection-icon" />
                <h3>Select an order</h3>
                <p>Choose an order from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 