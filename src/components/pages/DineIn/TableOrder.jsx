import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TableMenu from './TableMenu';
import { useResizeObserverErrorSuppression } from '../../../utils/errorHandler';
import { useNotification } from '../../../contexts/NotificationContext';
import useWebSocket from '../../../hooks/useWebSocket';
import './TableOrder.css';

const TableOrder = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useNotification();
  const { connected, subscribe } = useWebSocket();
  const tableNumber = searchParams.get('table'); // This is table number, not table ID
  
  const [table, setTable] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [tableSummary, setTableSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCallingStaff, setIsCallingStaff] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(new Set()); // Track expanded orders
  const [showItemsSummary, setShowItemsSummary] = useState(false); // Track items summary visibility

  // Suppress ResizeObserver errors
  useResizeObserverErrorSuppression();

  useEffect(() => {
    if (!tableNumber) {
      setError('Invalid table QR code');
      setLoading(false);
      return;
    }

    loadTableInfo();
    loadAllOrders();
    loadTableSummary();
  }, [tableNumber]);

  // WebSocket listener for payment confirmation
  useEffect(() => {
    if (connected && subscribe && tableNumber) {
      console.log('[WEBSOCKET] Setting up payment confirmation listener for table:', tableNumber);
      
      // Listen for payment confirmation for this specific table
      const paymentSub = subscribe('/topic/table/payment-confirmed', (data) => {
        console.log('[WEBSOCKET] Payment confirmation received:', data);
        
        if (data.tableNumber === parseInt(tableNumber)) {
          console.log('[WEBSOCKET] Payment confirmed for our table, redirecting to thank you page');
          
          // Show success notification
          showSuccess('Thanh toán đã được xác nhận! Đang chuyển đến trang nhận điểm...');
          
          // Redirect to thank you page with claim token
          const thankYouUrl = `/dinein/thank-you?token=${data.claimToken}&table=${tableNumber}`;
          setTimeout(() => {
            window.location.href = thankYouUrl;
          }, 1500); // Small delay to show the notification
        }
      });

      // Cleanup subscription on unmount
      return () => {
        if (paymentSub) {
          console.log('[WEBSOCKET] Cleaning up payment confirmation listener');
          paymentSub.unsubscribe();
        }
      };
    } else {
      console.log('[WEBSOCKET] Not setting up listener - connected:', connected, 'subscribe:', !!subscribe, 'tableNumber:', tableNumber);
    }
  }, [connected, subscribe, tableNumber, showSuccess]);




  const loadTableInfo = async () => {
    try {
      console.log('Loading table info for tableNumber:', tableNumber);
      const response = await axios.get(`http://localhost:8080/api/dinein/table/${tableNumber}`);
      console.log('Table info loaded:', response.data);
      setTable(response.data);
    } catch (err) {
      console.error('Failed to load table info:', err);
      console.error('Error response:', err.response);
      setError('Table not found or invalid QR code');
    }
  };

  const loadAllOrders = async () => {
    try {
      console.log('Loading all orders for tableNumber:', tableNumber);
      const response = await axios.get(`http://localhost:8080/api/dinein/table/${tableNumber}/all-orders`);
      console.log('All orders loaded:', response.data);
      setAllOrders(response.data || []);
    } catch (err) {
      console.error('Failed to load all orders:', err);
      console.error('Error response:', err.response);
      setAllOrders([]);
    }
  };

  const loadTableSummary = async () => {
    try {
      console.log('Loading table summary for tableNumber:', tableNumber);
      const response = await axios.get(`http://localhost:8080/api/dinein/table/${tableNumber}/summary`);
      console.log('Table summary loaded:', response.data);
      setTableSummary(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load table summary:', err);
      console.error('Error response:', err.response);
      setTableSummary(null);
      setLoading(false);
    }
  };

    const handleCallStaff = async () => {
    if (isCallingStaff) return; // Prevent double clicks
    
    setIsCallingStaff(true);
    
    try {
      console.log('Calling staff for table:', tableNumber);
      
      // Call staff API with default reason
      const response = await axios.post(`http://localhost:8080/api/dinein/table/${tableNumber}/call-staff`, {
        reason: 'Customer needs assistance'
      }, {
        timeout: 10000 // 10 second timeout
      });
      
      console.log('Staff call response:', response.data);
      showSuccess('Staff has been notified and will assist you shortly!');
      
    } catch (err) {
      console.error('Failed to call staff:', err);
      if (err.code === 'ECONNABORTED') {
        showError('Request timed out. Please try again.');
      } else {
                  showError('Failed to call staff. Please try again.');
      }
    } finally {
      setIsCallingStaff(false);
    }
  };

  const handleRequestPayment = async () => {
    if (!allOrders || allOrders.length === 0) {
      showWarning('No orders to pay for');
      return;
    }

    try {
      // Always use table number for API calls
      await axios.post(`http://localhost:8080/api/dinein/table/${tableNumber}/request-payment`);
      showSuccess('Payment request sent to staff. They will bring the bill to your table shortly!');
    } catch (err) {
      console.error('Failed to request payment:', err);
              showError('Failed to request payment. Please try again or call staff.');
    }
  };

  const handleOrderUpdate = (newOrder) => {
    // Reload all orders and summary after new order is created
    loadAllOrders();
    loadTableSummary();
  };

  const toggleOrderExpansion = (orderId) => {
    const newExpandedOrders = new Set(expandedOrders);
    if (newExpandedOrders.has(orderId)) {
      newExpandedOrders.delete(orderId);
    } else {
      newExpandedOrders.add(orderId);
    }
    setExpandedOrders(newExpandedOrders);
  };

  if (loading) {
    return (
      <div className="table-order-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading table information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="table-order-container">
        <div className="error-container">
          <h2>❌ Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="table-order-container">
      {/* Table Header */}
      <div className="table-header">
        <div className="table-info">
          <h1>🍽️ Table {table?.number}</h1>
          <p className="table-location">{table?.location || 'Restaurant Table'}</p>
          <p className="table-capacity">Capacity: {table?.capacity} persons</p>
        </div>



        <div className="table-actions">
          <button
            className="btn btn-outline"
            onClick={handleCallStaff}
            disabled={isCallingStaff}
          >
            {isCallingStaff ? '⏳ Calling...' : '🔔 Call Staff'}
          </button>

          {allOrders && allOrders.length > 0 && (
            <button
              className="btn btn-success"
              onClick={handleRequestPayment}
            >
              💳 Request Payment
            </button>
          )}
        </div>
      </div>

      {/* Table Summary */}
      {tableSummary && (
        <div className="table-summary">
          <h3>📊 Table Summary</h3>
          <div className="summary-stats">
            <p><strong>Total Orders:</strong> {tableSummary.totalOrders}</p>
            <p><strong>Total Items:</strong> {tableSummary.detailedItemsSummary?.totalItems || 0}</p>
            <p><strong>Total Amount to Pay:</strong> ${tableSummary.totalAmountToPay?.toFixed(2) || '0.00'}</p>
          </div>

          {/* Items Summary */}
          {tableSummary.detailedItemsSummary && tableSummary.detailedItemsSummary.items && tableSummary.detailedItemsSummary.items.length > 0 && (
            <div className="table-items-summary">
              <div
                className="table-items-summary-header"
                onClick={() => setShowItemsSummary(!showItemsSummary)}
                style={{ cursor: 'pointer' }}
              >
                <h4>📋 Items Summary</h4>
                <span className="toggle-items-icon">
                  {showItemsSummary ? '▼' : '▶'}
                </span>
              </div>

              {showItemsSummary && (
                <div className="table-items-summary-content">
                  <div className="table-items-list">
                    {tableSummary.detailedItemsSummary.items.map((item, index) => (
                      <div key={index} className="table-item-summary">
                        <div className="table-item-info">
                          <span className="table-item-name">{item.foodName}</span>
                          <span className="table-item-quantity">x{item.totalQuantity}</span>
                        </div>
                        <div className="table-item-pricing">
                          <span className="table-item-unit-price">${item.foodPrice?.toFixed(2)}</span>
                          <span className="table-item-total">${item.totalPrice?.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="table-items-summary-total">
                    <strong>Subtotal: ${tableSummary.detailedItemsSummary.totalValue?.toFixed(2) || '0.00'}</strong>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* All Orders */}
      {allOrders && allOrders.length > 0 && (
        <div className="table-all-orders">
          <h3>📋 All Orders ({allOrders.length})</h3>
          <div className="table-orders-list">
            {allOrders.map((order, index) => {
              const isExpanded = expandedOrders.has(order.id);
              return (
                <div key={order.id} className="table-order-card">
                  <div
                    className="table-order-header"
                    onClick={() => toggleOrderExpansion(order.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="table-order-title">
                      <h4>Order #{index + 1}</h4>
                      <span className="table-order-expand-icon">
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </div>
                    <span className={`table-order-status table-order-status-${order.status?.toLowerCase() || 'new'}`}>
                      {order.status || 'NEW'}
                    </span>
                  </div>
                  <div className="table-order-details">
                    <p><strong>Order #:</strong> {order.orderNumber}</p>
                    <p><strong>Total:</strong> ${order.totalPrice?.toFixed(2)}</p>
                    <p><strong>Items:</strong> {order.orderItemsCount} items</p>
                    <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                  </div>

                  {/* Expanded Order Items Details */}
                  {isExpanded && order.orderItems && order.orderItems.length > 0 && (
                    <div className="table-order-items-details">
                      <h5>📝 Order Items:</h5>
                      <div className="table-order-items-list">
                        {order.orderItems.map((item, itemIndex) => (
                          <div key={itemIndex} className="table-order-item">
                            <div className="table-order-item-info">
                              <span className="table-order-item-name">{item.foodName}</span>
                              <span className="table-order-item-quantity">x{item.quantity}</span>
                            </div>
                            <div className="table-order-item-pricing">
                              <span className="table-order-item-unit-price">${item.foodPrice?.toFixed(2)} each</span>
                              <span className="table-order-item-total-price">${item.totalPrice?.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show message if no items */}
                  {isExpanded && (!order.orderItems || order.orderItems.length === 0) && (
                    <div className="table-order-items-details">
                      <p className="table-order-no-items">No items in this order</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Menu Component */}
      <TableMenu
        tableNumber={tableNumber}
        table={table}
        allOrders={allOrders}
        onOrderUpdate={handleOrderUpdate}
      />


    </div>
  );
};

export default TableOrder; 