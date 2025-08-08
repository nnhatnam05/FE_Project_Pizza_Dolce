import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TableMonitor from './TableMonitor';
import StaffNotifications from './StaffNotifications';
import useWebSocket from '../../../hooks/useWebSocket';
import NotificationToast from '../../common/NotificationToast';
import { useNotification } from '../../../contexts/NotificationContext';
import './TableDashboard.css';

const TableDashboard = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showConfirm } = useNotification();
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [staffCalls, setStaffCalls] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tables');
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [activeNotifications, setActiveNotifications] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState(new Set()); // Track expanded orders
  
  // WebSocket connection
  const { connected, subscribe, notifications: wsNotifications, addNotification, removeNotification } = useWebSocket();

  // Get auth token from localStorage
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    loadDashboardData();
    
    // Set up auto-refresh every 30 seconds (reduced frequency since we have real-time updates)
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);
    
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  // WebSocket subscriptions
  useEffect(() => {
    if (connected && subscribe) {
      console.log('Setting up WebSocket subscriptions...');
      
      // Subscribe to order updates
      const orderSub = subscribe('/topic/staff/orders', (orderData) => {
        // Parse JSON string if needed
        const parsedOrderData = typeof orderData === 'string' ? JSON.parse(orderData) : orderData;
        console.log('New order received via WebSocket:', parsedOrderData);
        setOrders(prev => {
          console.log('WebSocket setOrders - prev type:', typeof prev, 'isArray:', Array.isArray(prev), 'value:', prev);
          const prevArray = Array.isArray(prev) ? prev : [];
          const existingIndex = prevArray.findIndex(order => order.id === parsedOrderData.orderId);
          if (existingIndex >= 0) {
            // Update existing order
            const updated = [...prevArray];
            updated[existingIndex] = { ...updated[existingIndex], ...parsedOrderData };
            console.log('WebSocket setOrders - returning updated array:', updated);
            return updated;
          } else {
            // Add new order (create full order object)
            const newOrder = {
              id: parsedOrderData.orderId,
              orderNumber: parsedOrderData.orderNumber,
              status: parsedOrderData.status,
              totalPrice: parsedOrderData.totalPrice,
              table: { number: parsedOrderData.tableNumber }
            };
            const result = [newOrder, ...prevArray];
            console.log('WebSocket setOrders - returning new array:', result);
            return result;
          }
        });
        
        // Also update table orders if it's a dine-in order
        if (parsedOrderData.tableNumber) {
          setTables(prev => {
            console.log('WebSocket setTables - prev type:', typeof prev, 'isArray:', Array.isArray(prev));
            const safePrev = Array.isArray(prev) ? prev : [];
            return safePrev.map(table => {
              if (table.number === parsedOrderData.tableNumber) {
                const existingOrderIndex = table.orders?.findIndex(order => order.id === parsedOrderData.orderId) || -1;
                const newOrder = {
                  id: parsedOrderData.orderId,
                  orderNumber: parsedOrderData.orderNumber,
                  status: parsedOrderData.status,
                  totalPrice: parsedOrderData.totalPrice,
                  table: { number: parsedOrderData.tableNumber }
                };
                
                if (existingOrderIndex >= 0) {
                  // Update existing order in table
                  const updatedOrders = [...(table.orders || [])];
                  updatedOrders[existingOrderIndex] = newOrder;
                  return { ...table, orders: updatedOrders };
                } else {
                  // Add new order to table
                  return { ...table, orders: [...(table.orders || []), newOrder] };
                }
              }
              return table;
            });
          });
        }
      });

      // Subscribe to staff calls (no notifications)
      const callSub = subscribe('/topic/staff/calls', (callData) => {
        console.log('Staff call received:', callData);
        
        // Extract data from notification
        const notificationData = callData.data || {};
        const processedCall = {
          type: 'staff_call',
          tableId: notificationData.tableId || callData.data,
          tableNumber: notificationData.tableNumber,
          reason: notificationData.reason || 'General assistance',
          callTime: notificationData.callTime || callData.timestamp,
          timestamp: callData.timestamp,
          message: callData.message,
          priority: 'high'
        };
        
        setStaffCalls(prev => {
          // Check for duplicates based on tableId and timestamp
          const isDuplicate = prev.some(call => 
            call.tableId === processedCall.tableId && 
            call.callTime === processedCall.callTime
          );
          
          if (isDuplicate) {
            console.log('Duplicate staff call ignored:', processedCall);
            return prev;
          }
          
          return [processedCall, ...prev.slice(0, 49)]; // Keep max 50 notifications
        });
      });

      // Subscribe to payment requests (no notifications)
      const paymentSub = subscribe('/topic/staff/payments', (paymentData) => {
        console.log('Payment request received:', paymentData);
        
        // Extract data from notification
        const notificationData = paymentData.data || {};
        const processedRequest = {
          type: 'payment_request',
          tableId: notificationData.tableId || paymentData.data,
          tableNumber: notificationData.tableNumber,
          requestTime: notificationData.requestTime || paymentData.timestamp,
          timestamp: paymentData.timestamp,
          message: paymentData.message,
          priority: 'high'
        };
        
        setPaymentRequests(prev => {
          // Check for duplicates based on tableId and timestamp
          const isDuplicate = prev.some(request => 
            request.tableId === processedRequest.tableId && 
            request.requestTime === processedRequest.requestTime
          );
          
          if (isDuplicate) {
            console.log('Duplicate payment request ignored:', processedRequest);
            return prev;
          }
          
          return [processedRequest, ...prev.slice(0, 49)]; // Keep max 50 notifications
        });
      });

      // Subscribe to table status updates
      const tableSub = subscribe('/topic/staff/tables', (tableData) => {
        console.log('Table status update received:', tableData);
        setTables(prev => {
          const existingIndex = prev.findIndex(table => table.id === tableData.id);
          if (existingIndex >= 0) {
            // Update existing table
            const updated = [...prev];
            updated[existingIndex] = { ...updated[existingIndex], ...tableData };
            return updated;
          }
          return prev;
        });
      });

      return () => {
        // Cleanup subscriptions
        if (orderSub) orderSub.unsubscribe();
        if (callSub) callSub.unsubscribe();
        if (paymentSub) paymentSub.unsubscribe();
        if (tableSub) tableSub.unsubscribe();
      };
    } else {
      console.log('WebSocket not connected or subscribe function not available');
    }
  }, [connected, subscribe]);

  const playNotificationSound = () => {
    // Create a simple notification sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const loadDashboardData = async () => {
    try {
      const headers = getAuthHeaders();
      
      // Load tables first
      const tablesRes = await axios.get('http://localhost:8080/api/tables', { headers });
      const tablesData = tablesRes.data || [];
      
      // Load orders for each table
      const tablesWithOrders = await Promise.all(
        tablesData.map(async (table) => {
          try {
            const ordersRes = await axios.get(
              `http://localhost:8080/api/dinein/table/${table.number}/all-orders`, 
              { headers }
            );
            return {
              ...table,
              orders: ordersRes.data || []
            };
          } catch (err) {
            console.error(`Failed to load orders for table ${table.number}:`, err);
            return {
              ...table,
              orders: []
            };
          }
        })
      );
      
      setTables(tablesWithOrders);
      console.log('Tables with orders loaded:', tablesWithOrders);
      
      // Load all orders for general order management
      try {
        const allOrdersRes = await axios.get('http://localhost:8080/api/dinein/orders/all', { headers });
        console.log('API response for all orders:', allOrdersRes.data);
        console.log('API response type:', typeof allOrdersRes.data, 'isArray:', Array.isArray(allOrdersRes.data));
        const ordersData = Array.isArray(allOrdersRes.data) ? allOrdersRes.data : [];
        setOrders(ordersData);
        console.log('Set orders to:', ordersData);
      } catch (err) {
        console.error('Failed to load all orders:', err);
        setOrders([]);
      }
      
      // Load sessions for staff calls and payment requests
      try {
        const sessionsRes = await axios.get('http://localhost:8080/api/dinein/sessions/all', { headers });
        const sessions = sessionsRes.data || {};
        setStaffCalls(sessions.staffCalls || []);
        setPaymentRequests(sessions.paymentRequests || []);
      } catch (err) {
        console.error('Failed to load sessions:', err);
        setStaffCalls([]);
        setPaymentRequests([]);
      }
      
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
      showError('Failed to resolve staff call');
    }
  };

  const handlePaymentRequestResolve = async (tableId) => {
    try {
      const headers = getAuthHeaders();
      await axios.post(`http://localhost:8080/api/dinein/payment-requests/${tableId}/resolve`, {}, { headers });
      loadDashboardData(); // Refresh data
    } catch (err) {
      console.error('Failed to resolve payment request:', err);
      showError('Failed to resolve payment request');
    }
  };

  const updateOrderStatus = async (orderId, newStatus, orderNumber) => {
    // Confirmation dialog
    const confirmMessage = `Are you sure you want to update Order #${orderNumber} status to ${newStatus}?`;
    const confirmed = await showConfirm({
      title: 'Update Order Status',
      message: confirmMessage,
      type: 'warning',
      confirmText: 'Update'
    });
    
    if (!confirmed) {
      return;
    }

    try {
      const headers = getAuthHeaders();
      await axios.put(`http://localhost:8080/api/dinein/orders/${orderId}/status`, {
        status: newStatus
      }, { headers });
      loadDashboardData(); // Refresh data
      showSuccess(`Order #${orderNumber} status updated to ${newStatus} successfully!`);
    } catch (err) {
      console.error('Failed to update order status:', err);
      showError('Failed to update order status: ' + (err.response?.data || err.message));
    }
  };

  // Toggle order items visibility
  const toggleOrderItems = (orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const getTableWithOrders = () => {
    const safeTables = Array.isArray(tables) ? tables : [];
    const safeOrders = Array.isArray(orders) ? orders : [];
    
    return safeTables.map(table => ({
      ...table,
      // Use orders already loaded for each table, or filter from global orders as fallback
      orders: table.orders || safeOrders.filter(order => 
        order.table?.id === table.id && 
        order.table // Ensure it's a dine-in order
      ),
      hasStaffCall: Array.isArray(staffCalls) ? staffCalls.some(call => {
        // Compare both tableId and tableNumber for better matching
        return call.tableId === table.id || 
               call.tableNumber === table.number ||
               String(call.tableId) === String(table.id);
      }) : false,
      hasPaymentRequest: Array.isArray(paymentRequests) ? paymentRequests.some(req => {
        // Compare both tableId and tableNumber for better matching
        return req.tableId === table.id || 
               req.tableNumber === table.number ||
               String(req.tableId) === String(table.id);
      }) : false
    }));
  };

  const getActiveOrders = () => {
    const safeOrders = Array.isArray(orders) ? orders : [];
    return safeOrders.filter(order => 
      // Only show dine-in orders (orders with table)
      order.table && 
      order.table.id &&
      !['COMPLETED', 'CANCELLED', 'PAID'].includes(order.status)
    );
  };

  const getPendingNotifications = () => {
    // Debug logging
    console.log('getPendingNotifications - orders type:', typeof orders, 'value:', orders);
    console.log('getPendingNotifications - Array.isArray(orders):', Array.isArray(orders));
    
    // Early return with safe defaults if data is not ready
    if (!orders || !staffCalls || !paymentRequests) {
      console.log('getPendingNotifications - data not ready, returning defaults');
      return {
        staffCalls: 0,
        paymentRequests: 0,
        newOrders: 0
      };
    }
    
    // Ensure orders is always an array
    const safeOrders = Array.isArray(orders) ? orders : [];
    const safeStaffCalls = Array.isArray(staffCalls) ? staffCalls : [];
    const safePaymentRequests = Array.isArray(paymentRequests) ? paymentRequests : [];
    
    try {
      const result = {
        staffCalls: safeStaffCalls.length,
        paymentRequests: safePaymentRequests.length,
        newOrders: safeOrders.filter(order => 
          order.status === 'NEW' && 
          order.table && 
          order.table.id
        ).length
      };
      console.log('getPendingNotifications - result:', result);
      return result;
    } catch (error) {
      console.error('getPendingNotifications - error:', error);
      return {
        staffCalls: 0,
        paymentRequests: 0,
        newOrders: 0
      };
    }
  };

  // Debug logging for state values
  console.log('TableDashboard render - orders:', orders, 'type:', typeof orders, 'isArray:', Array.isArray(orders));
  console.log('TableDashboard render - staffCalls:', staffCalls, 'type:', typeof staffCalls, 'isArray:', Array.isArray(staffCalls));
  console.log('TableDashboard render - paymentRequests:', paymentRequests, 'type:', typeof paymentRequests, 'isArray:', Array.isArray(paymentRequests));
  console.log('TableDashboard render - loading:', loading);

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

  // Only compute derived data when base data is ready
  const notifications = loading ? { staffCalls: 0, paymentRequests: 0, newOrders: 0 } : getPendingNotifications();
  const tablesWithData = loading ? [] : getTableWithOrders();
  const activeOrders = loading ? [] : getActiveOrders();

  const groupOrdersByTable = (orders) => {
    const grouped = {};
    const safeOrders = Array.isArray(orders) ? orders : [];
    safeOrders.forEach(order => {
      const tableNumber = order.table?.number;
      if (tableNumber) {
        if (!grouped[tableNumber]) {
          grouped[tableNumber] = [];
        }
        grouped[tableNumber].push(order);
      }
    });
    return grouped;
  };

  const getTotalItemsForTable = (tableOrders) => {
    return tableOrders.reduce((sum, order) => sum + (order.orderItems?.length || 0), 0);
  };

  const handleEditOrder = (orderId) => {
    // Navigate to order edit page
    navigate(`/staff/orders/${orderId}/edit`);
  };

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
            <div className="orders-by-table">
              {Object.entries(groupOrdersByTable(activeOrders)).map(([tableNumber, tableOrders]) => (
                <div key={tableNumber} className="table-orders-group">
                  <div className="table-group-header">
                    <h3>🍽️ Table {tableNumber}</h3>
                    <div className="table-group-summary">
                      <span className="orders-count">{tableOrders.length} orders</span>
                      <span className="items-count">{getTotalItemsForTable(tableOrders)} items</span>
                    </div>
                  </div>
                  
                  <div className="table-orders-list">
                    {tableOrders.map(order => {
                      const isExpanded = expandedOrders.has(order.id);
                      return (
                        <div key={order.id} className="staff-order-card">
                          <div className="staff-order-header">
                            <div 
                              className="staff-order-title"
                              onClick={() => toggleOrderItems(order.id)}
                              style={{ cursor: 'pointer' }}
                            >
                              <h4>
                                <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                                Order #{order.orderNumber}
                              </h4>
                              <span className={`staff-order-status status-${order.status?.toLowerCase()}`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="staff-order-meta">
                              <span className="order-time">{new Date(order.createdAt).toLocaleTimeString()}</span>
                              <span className="order-total">${order.totalPrice?.toFixed(2)}</span>
                              <span className="order-items-count">
                                🍽️ {order.orderItems?.length || 0} items
                              </span>
                            </div>
                          </div>
                          
                          {/* Expandable Order Items Details */}
                          {isExpanded && order.orderItems && order.orderItems.length > 0 && (
                            <div className="staff-order-items">
                              <h5>📝 Order Items:</h5>
                              <div className="staff-items-list">
                                {order.orderItems.map((item, index) => (
                                  <div key={index} className="staff-order-item">
                                    <div className="item-info">
                                      <span className="item-name">{item.food?.name || item.foodName}</span>
                                      <span className="item-price-unit">${item.foodPrice?.toFixed(2)} each</span>
                                    </div>
                                    <div className="item-details">
                                      <span className="item-quantity">x{item.quantity}</span>
                                      <span className="item-total">${item.totalPrice?.toFixed(2)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Show message if no items when expanded */}
                          {isExpanded && (!order.orderItems || order.orderItems.length === 0) && (
                            <div className="staff-order-items">
                              <p className="no-items-message">No items in this order</p>
                            </div>
                          )}
                          
                          <div className="staff-order-actions">
                            {/* Edit Order Button - only for NEW status */}
                            {order.status === 'NEW' && (
                              <button 
                                className="btn btn-edit"
                                onClick={() => handleEditOrder(order.id)}
                              >
                                ✏️ Edit Order
                              </button>
                            )}
                            
                            {/* Status Update Buttons */}
                            {order.status === 'NEW' && (
                              <button 
                                className="btn btn-primary"
                                onClick={() => updateOrderStatus(order.id, 'IN_PROGRESS', order.orderNumber)}
                              >
                                🍳 Start Preparing
                              </button>
                            )}
                            {order.status === 'IN_PROGRESS' && (
                              <button 
                                className="btn btn-success"
                                onClick={() => updateOrderStatus(order.id, 'READY', order.orderNumber)}
                              >
                                ✅ Mark Ready
                              </button>
                            )}
                            {order.status === 'READY' && (
                              <button 
                                className="btn btn-info"
                                onClick={() => updateOrderStatus(order.id, 'SERVED', order.orderNumber)}
                              >
                                🍽️ Mark Served
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
        <span>
          {connected ? '🟢 Real-time connected' : '🔴 Connecting...'}
          {' | '}
          🔄 Auto-refreshing every 30 seconds
        </span>
      </div>

      {/* Real-time Notifications */}
      <div className="notifications-container">
        {activeNotifications.slice(0, 5).map((notification, index) => (
          <NotificationToast
            key={`${notification.timestamp}-${index}`}
            notification={notification}
            onClose={() => {
              setActiveNotifications(prev => prev.filter((_, i) => i !== index));
              removeNotification(index);
            }}
            autoClose={true}
            duration={notification.priority === 'HIGH' ? 8000 : 5000}
          />
        ))}
      </div>
    </div>
  );
};

export default TableDashboard; 