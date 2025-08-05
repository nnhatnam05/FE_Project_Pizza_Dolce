import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TableMonitor from './TableMonitor';
import StaffNotifications from './StaffNotifications';
import './TableDashboard.css';

const TableDashboard = () => {
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [staffCalls, setStaffCalls] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tables');
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Get auth token from localStorage
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    loadDashboardData();
    
    // Set up auto-refresh every 5 seconds
    const interval = setInterval(() => {
      loadDashboardData();
    }, 5000);
    
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const headers = getAuthHeaders();
      
      const [tablesRes, ordersRes, sessionsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/tables', { headers }),
        axios.get('http://localhost:8080/api/dinein/orders/all', { headers }),
        axios.get('http://localhost:8080/api/dinein/sessions/all', { headers })
      ]);
      
      setTables(tablesRes.data);
      setOrders(ordersRes.data || []);
      
      // Extract staff calls and payment requests from sessions
      const sessions = sessionsRes.data || {};
      setStaffCalls(sessions.staffCalls || []);
      setPaymentRequests(sessions.paymentRequests || []);
      
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStaffCallResolve = async (tableId) => {
    try {
      const headers = getAuthHeaders();
      await axios.post(`http://localhost:8080/api/dinein/staff-calls/${tableId}/resolve`, {}, { headers });
      loadDashboardData(); // Refresh data
    } catch (err) {
      console.error('Failed to resolve staff call:', err);
      alert('Failed to resolve staff call');
    }
  };

  const handlePaymentRequestResolve = async (tableId) => {
    try {
      const headers = getAuthHeaders();
      await axios.post(`http://localhost:8080/api/dinein/payment-requests/${tableId}/resolve`, {}, { headers });
      loadDashboardData(); // Refresh data
    } catch (err) {
      console.error('Failed to resolve payment request:', err);
      alert('Failed to resolve payment request');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const headers = getAuthHeaders();
      await axios.put(`http://localhost:8080/api/dinein/orders/${orderId}/status`, {
        status: newStatus
      }, { headers });
      loadDashboardData(); // Refresh data
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Failed to update order status');
    }
  };

  const getTableWithOrders = () => {
    return tables.map(table => ({
      ...table,
      orders: orders.filter(order => 
        order.table?.id === table.id && 
        order.table // Ensure it's a dine-in order
      ),
      hasStaffCall: staffCalls.some(call => call.tableId === table.id),
      hasPaymentRequest: paymentRequests.some(req => req.tableId === table.id)
    }));
  };

  const getActiveOrders = () => {
    return orders.filter(order => 
      // Only show dine-in orders (orders with table)
      order.table && 
      order.table.id &&
      !['COMPLETED', 'CANCELLED', 'PAID'].includes(order.status)
    );
  };

  const getPendingNotifications = () => {
    return {
      staffCalls: staffCalls.length,
      paymentRequests: paymentRequests.length,
      newOrders: orders.filter(order => 
        order.status === 'NEW' && 
        order.table && 
        order.table.id
      ).length
    };
  };

  if (loading) {
    return (
      <div className="staff-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const notifications = getPendingNotifications();
  const tablesWithData = getTableWithOrders();
  const activeOrders = getActiveOrders();

  return (
    <div className="staff-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h1>🍽️ Staff Dashboard</h1>
        <div className="dashboard-stats">
          <div className="stat-card">
            <span className="stat-number">{tables.length}</span>
            <span className="stat-label">Total Tables</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{activeOrders.length}</span>
            <span className="stat-label">Active Dine-In Orders</span>
          </div>
          <div className="stat-card urgent">
            <span className="stat-number">{notifications.staffCalls}</span>
            <span className="stat-label">Staff Calls</span>
          </div>
          <div className="stat-card urgent">
            <span className="stat-number">{notifications.paymentRequests}</span>
            <span className="stat-label">Payment Requests</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'tables' ? 'active' : ''}`}
          onClick={() => setActiveTab('tables')}
        >
          📋 Table Monitor
          {(notifications.staffCalls + notifications.paymentRequests) > 0 && (
            <span className="notification-badge">
              {notifications.staffCalls + notifications.paymentRequests}
            </span>
          )}
        </button>
        
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          🍳 Dine-In Orders
          {notifications.newOrders > 0 && (
            <span className="notification-badge">{notifications.newOrders}</span>
          )}
        </button>
        
        <button 
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          🔔 Notifications
          {(notifications.staffCalls + notifications.paymentRequests) > 0 && (
            <span className="notification-badge">
              {notifications.staffCalls + notifications.paymentRequests}
            </span>
          )}
        </button>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {activeTab === 'tables' && (
          <TableMonitor 
            tables={tablesWithData}
            onStaffCallResolve={handleStaffCallResolve}
            onPaymentRequestResolve={handlePaymentRequestResolve}
            onOrderStatusUpdate={updateOrderStatus}
          />
        )}
        
        {activeTab === 'orders' && (
          <div className="orders-section">
            <h2>Active Dine-In Orders</h2>
            <div className="orders-grid">
              {activeOrders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <h3>Order #{order.orderNumber}</h3>
                    <span className={`status-badge status-${order.status?.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="order-details">
                    <p><strong>Table:</strong> {order.table?.number || 'N/A'}</p>
                    <p><strong>Items:</strong> {order.orderFoods?.length || 0}</p>
                    <p><strong>Total:</strong> ${order.totalPrice?.toFixed(2)}</p>
                    <p><strong>Time:</strong> {new Date(order.createdAt).toLocaleTimeString()}</p>
                  </div>
                  
                  <div className="order-actions">
                    {order.status === 'NEW' && (
                      <button 
                        className="btn btn-primary"
                        onClick={() => updateOrderStatus(order.id, 'IN_PROGRESS')}
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.status === 'IN_PROGRESS' && (
                      <button 
                        className="btn btn-success"
                        onClick={() => updateOrderStatus(order.id, 'READY')}
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'READY' && (
                      <button 
                        className="btn btn-info"
                        onClick={() => updateOrderStatus(order.id, 'SERVED')}
                      >
                        Mark Served
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {activeOrders.length === 0 && (
                <div className="empty-state">
                  <p>No active dine-in orders at the moment</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'notifications' && (
          <StaffNotifications 
            staffCalls={staffCalls}
            paymentRequests={paymentRequests}
            tables={tables}
            onStaffCallResolve={handleStaffCallResolve}
            onPaymentRequestResolve={handlePaymentRequestResolve}
          />
        )}
      </div>
      
      {/* Auto-refresh indicator */}
      <div className="refresh-indicator">
        <span>🔄 Auto-refreshing every 5 seconds</span>
      </div>
    </div>
  );
};

export default TableDashboard; 