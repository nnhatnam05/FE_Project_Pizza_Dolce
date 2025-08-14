import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNotification } from "../../../../contexts/NotificationContext";
import "./Order.css";
import { FaSync, FaSearch, FaFilter, FaCalendarAlt, FaTruck, FaDollarSign, FaClock, FaUser } from "react-icons/fa";

const DELIVERY_STATUS = [
  { key: "PREPARING", label: "Preparing", color: "#ff9800" },
  { key: "WAITING_FOR_SHIPPER", label: "Waiting for Shipper", color: "#9c27b0" },
  { key: "DELIVERING", label: "Delivering", color: "#2196f3" }
];

export default function Order_DeliveryStatus() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshInterval, setRefreshInterval] = useState(60);
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
      const responses = await Promise.all([
        axios.get("http://localhost:8080/api/orders/filter?deliveryStatus=PREPARING", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("http://localhost:8080/api/orders/filter?deliveryStatus=WAITING_FOR_SHIPPER", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("http://localhost:8080/api/orders/filter?deliveryStatus=DELIVERING", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const allOrders = [
        ...responses[0].data,
        ...responses[1].data,
        ...responses[2].data
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const uniqueOrders = Array.from(
        new Map(allOrders.map(order => [order.id, order])).values()
      );

      setOrders(uniqueOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      if (showLoading) {
        showError("Failed to load delivery orders!");
      }
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

  const getStatusLabel = (status) => {
    const statusObj = DELIVERY_STATUS.find(s => s.key === status);
    return statusObj ? statusObj.label : status;
  };

  const getStatusColor = (status) => {
    const statusObj = DELIVERY_STATUS.find(s => s.key === status);
    return statusObj ? statusObj.color : "#757575";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ALLOWED_STATUS = ["PREPARING", "WAITING_FOR_SHIPPER", "DELIVERING"];

  const filteredOrders = orders.filter(order => {
    // Time filter
    const timeFiltered = getTimeFilteredOrders([order], timeFilter).length > 0;
    if (!timeFiltered) return false;

    // Status filter
    if (filter === "all") {
      if (!ALLOWED_STATUS.includes(order.deliveryStatus)) return false;
    } else {
      if (order.deliveryStatus !== filter) return false;
    }

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(searchLower) ||
        order.customer?.fullName?.toLowerCase().includes(searchLower) ||
        order.customer?.email?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const getOrderStats = () => {
    const preparing = filteredOrders.filter(o => o.deliveryStatus === 'PREPARING').length;
    const waiting = filteredOrders.filter(o => o.deliveryStatus === 'WAITING_FOR_SHIPPER').length;
    const delivering = filteredOrders.filter(o => o.deliveryStatus === 'DELIVERING').length;
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    
    return { preparing, waiting, delivering, totalRevenue };
  };

  const stats = getOrderStats();

  return (
    <div className="modern-order-container">
      {/* Header */}
      <div className="modern-header">
        <div className="header-content">
          <h1 className="page-title">
            <FaTruck className="title-icon" />
            Delivery Orders Tracking
          </h1>
        </div>
        <div className="header-actions">
          <button 
            className="refresh-btn"
            onClick={() => fetchOrders(true)}
            disabled={loading}
          >
            <FaSync className={loading ? 'spinning' : ''} />
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
            Delivery Status
          </label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            {DELIVERY_STATUS.map(status => (
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
              placeholder="Search orders, customers..."
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
            onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
            className="filter-select"
          >
            <option value="30">30 seconds</option>
            <option value="60">1 minute</option>
            <option value="300">5 minutes</option>
            <option value="0">Off</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="modern-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <div>Loading delivery orders...</div>
          </div>
        ) : (
          <div className="content-layout">
            {/* Orders List */}
            <div className="orders-section">
              {filteredOrders.length === 0 ? (
                <div className="empty-state">
                  <FaTruck className="empty-icon" />
                  <h3>No delivery orders found</h3>
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
                        <span 
                          className="delivery-status-badge"
                          style={{ backgroundColor: getStatusColor(order.deliveryStatus) }}
                        >
                          {getStatusLabel(order.deliveryStatus)}
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
                    <span 
                      className="delivery-status-badge"
                      style={{ backgroundColor: getStatusColor(selectedOrder.deliveryStatus) }}
                    >
                      {getStatusLabel(selectedOrder.deliveryStatus)}
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
                          <label>Created:</label>
                          <span>{formatDate(selectedOrder.createdAt)}</span>
                        </div>
                        <div className="detail-item">
                          <label>Payment Method:</label>
                          <span>{selectedOrder.paymentMethod?.name || "Not paid"}</span>
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
                        <div className="detail-item">
                          <label>Loyalty Points:</label>
                          <span>{selectedOrder.customer?.point || 0} points</span>
                        </div>
                      </div>
                    </div>

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
                          <span>{selectedOrder.deliveryAddress || 'N/A'}</span>
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

                    {selectedOrder.voucherCode && (
                      <div className="detail-section">
                        <h4>Voucher Information</h4>
                        <div className="voucher-info">
                          <span className="voucher-code">{selectedOrder.voucherCode}</span>
                          {selectedOrder.voucherDiscount > 0 && (
                            <span className="voucher-discount">-${selectedOrder.voucherDiscount}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedOrder.deliveryNote && (
                      <div className="detail-section">
                        <h4>Delivery Notes</h4>
                        <p className="order-note">{selectedOrder.deliveryNote}</p>
                      </div>
                    )}

                    {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                      <div className="detail-section">
                        <h4>Status History</h4>
                        <div className="status-timeline">
                          {selectedOrder.statusHistory.map((history, idx) => (
                            <div key={idx} className="timeline-item">
                              <div className="timeline-time">{formatDate(history.changedAt)}</div>
                              <div className="timeline-status">{history.status}</div>
                              {history.note && <div className="timeline-note">{history.note}</div>}
                              <div className="timeline-by">By: {history.changedBy}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="no-selection">
                  <FaTruck className="no-selection-icon" />
                  <h3>Select an order</h3>
                  <p>Choose an order from the list to view delivery details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
