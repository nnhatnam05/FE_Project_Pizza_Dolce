import React, { useState } from 'react';
import PaymentInvoice from './PaymentInvoice';
import './StaffNotifications.css';

const StaffNotifications = ({ 
  staffCalls, 
  paymentRequests, 
  tables, 
  onStaffCallResolve, 
  onPaymentRequestResolve 
}) => {
  
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState(null);
  
  const getTableInfo = (notification) => {
    // If notification has valid tableNumber (not 0), use it
    if (notification.tableNumber && notification.tableNumber > 0) {
      return { number: notification.tableNumber, location: '' };
    }
    
    // Fallback to finding by tableId
    const tableId = notification.tableId;
    const foundTable = tables.find(table => table.id === tableId);
    if (foundTable) {
      return { number: foundTable.number, location: foundTable.location || '' };
    }
    
    return { number: 'Unknown', location: '' };
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    return time.toLocaleDateString();
  };

  const getPriorityLevel = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes > 15) return 'critical';
    if (diffInMinutes > 5) return 'high';
    return 'normal';
  };

  const handlePaymentRequestClick = (tableId) => {
    setSelectedTableId(tableId);
    setShowInvoice(true);
  };

  const handlePaymentComplete = () => {
    // Refresh the parent component data
    if (onPaymentRequestResolve) {
      onPaymentRequestResolve(selectedTableId);
    }
  };

  const allNotifications = [
    ...staffCalls.map(call => ({
      ...call,
      type: 'staff_call',
      priority: getPriorityLevel(call.timestamp),
      table: getTableInfo(call)
    })),
    ...paymentRequests.map(request => ({
      ...request,
      type: 'payment_request',
      priority: getPriorityLevel(request.timestamp),
      table: getTableInfo(request)
    }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="staff-notifications">
      <div className="notifications-header">
        <h2>🔔 Active Notifications</h2>
        <div className="notifications-summary">
          <span className="summary-item">
            <span className="summary-count">{staffCalls.length}</span>
            <span className="summary-label">Staff Calls</span>
          </span>
          <span className="summary-item">
            <span className="summary-count">{paymentRequests.length}</span>
            <span className="summary-label">Payment Requests</span>
          </span>
        </div>
      </div>

      {allNotifications.length === 0 ? (
        <div className="empty-notifications">
          <div className="empty-icon">✨</div>
          <h3>All caught up!</h3>
          <p>No pending notifications at the moment.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {allNotifications.map((notification, index) => (
            <div 
              key={`${notification.type}-${notification.tableId}-${index}`}
              className={`notification-card ${notification.type} priority-${notification.priority}`}
            >
              {/* Priority Indicator */}
              <div className={`priority-indicator priority-${notification.priority}`}>
                {notification.priority === 'critical' && '🚨'}
                {notification.priority === 'high' && '⚠️'}
                {notification.priority === 'normal' && '🔔'}
              </div>

              {/* Notification Content */}
              <div className="notification-content">
                <div className="notification-header">
                  <div className="notification-title">
                    {notification.type === 'staff_call' && (
                      <>
                        <span className="notification-icon">🙋‍♂️</span>
                        <span>Customer Assistance Required</span>
                      </>
                    )}
                    {notification.type === 'payment_request' && (
                      <>
                        <span className="notification-icon">💳</span>
                        <span>Payment Request</span>
                      </>
                    )}
                  </div>
                  <div className="notification-time">
                    {formatTimeAgo(notification.timestamp)}
                  </div>
                </div>

                <div className="notification-details">
                  <div className="table-info">
                    <span className="table-number">Table {notification.table.number}</span>
                    {notification.table.location && (
                      <span className="table-location">• {notification.table.location}</span>
                    )}
                  </div>
                  
                  {notification.message && (
                    <div className="notification-message">
                      "{notification.message}"
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="notification-actions">
                {notification.type === 'staff_call' && (
                  <button 
                    className="action-btn resolve-btn"
                    onClick={() => onStaffCallResolve(notification.tableId)}
                  >
                    Resolve
                  </button>
                )}
                {notification.type === 'payment_request' && (
                  <button 
                    className="action-btn payment-btn"
                    onClick={() => handlePaymentRequestClick(notification.tableId)}
                  >
                    Process Payment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {allNotifications.length > 0 && (
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="quick-actions-grid">
            {staffCalls.length > 0 && (
              <button 
                className="quick-action-btn staff-calls"
                onClick={() => {
                  staffCalls.forEach(call => onStaffCallResolve(call.tableId));
                }}
              >
                <span className="quick-action-icon">✅</span>
                <span className="quick-action-text">
                  Resolve All Staff Calls ({staffCalls.length})
                </span>
              </button>
            )}
            
            {paymentRequests.length > 0 && (
              <button 
                className="quick-action-btn payment-requests"
                onClick={() => {
                  paymentRequests.forEach(request => handlePaymentRequestClick(request.tableId));
                }}
              >
                <span className="quick-action-icon">💰</span>
                <span className="quick-action-text">
                  Process All Payments ({paymentRequests.length})
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Priority Legend */}
      <div className="priority-legend">
        <h4>Priority Levels</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-indicator priority-normal">🔔</span>
            <span>Normal (0-5 min)</span>
          </div>
          <div className="legend-item">
            <span className="legend-indicator priority-high">⚠️</span>
            <span>High (5-15 min)</span>
          </div>
          <div className="legend-item">
            <span className="legend-indicator priority-critical">🚨</span>
            <span>Critical (15+ min)</span>
          </div>
        </div>
      </div>

      {showInvoice && selectedTableId && (
        <PaymentInvoice
          tableId={selectedTableId}
          onClose={() => setShowInvoice(false)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};

export default StaffNotifications; 