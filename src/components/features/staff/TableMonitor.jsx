import React from 'react';
import './TableMonitor.css';

const TableMonitor = ({ 
  tables, 
  onStaffCallResolve, 
  onPaymentRequestResolve, 
  onOrderStatusUpdate 
}) => {
  
  const getTableStatusColor = (table) => {
    if (table.hasStaffCall || table.hasPaymentRequest) return 'urgent';
    if (table.status === 'OCCUPIED') return 'occupied';
    if (table.status === 'RESERVED') return 'reserved';
    if (table.status === 'CLEANING') return 'cleaning';
    return 'available';
  };

  const getTableStatusText = (table) => {
    if (table.hasStaffCall) return 'NEEDS ASSISTANCE';
    if (table.hasPaymentRequest) return 'PAYMENT REQUESTED';
    return table.status;
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActiveOrder = (table) => {
    return table.orders?.find(order => 
      !['COMPLETED', 'CANCELLED', 'PAID'].includes(order.status)
    );
  };

  return (
    <div className="table-monitor">
      <div className="monitor-header">
        <h2>🍽️ Table Monitor</h2>
        <div className="legend">
          <div className="legend-item">
            <span className="legend-dot available"></span>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot occupied"></span>
            <span>Occupied</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot urgent"></span>
            <span>Needs Attention</span>
          </div>
        </div>
      </div>

      <div className="tables-grid">
        {tables.map(table => {
          const activeOrder = getActiveOrder(table);
          const statusColor = getTableStatusColor(table);
          
          return (
            <div 
              key={table.id} 
              className={`table-card ${statusColor}`}
            >
              {/* Table Header */}
              <div className="table-card-header">
                <div className="table-number">
                  <span className="table-icon">🍽️</span>
                  <span>Table {table.number}</span>
                </div>
                <div className={`status-indicator ${statusColor}`}>
                  {getTableStatusText(table)}
                </div>
              </div>

              {/* Table Info */}
              <div className="table-info">
                <div className="info-row">
                  <span className="info-label">Capacity:</span>
                  <span>{table.capacity} persons</span>
                </div>
                {table.location && (
                  <div className="info-row">
                    <span className="info-label">Location:</span>
                    <span>{table.location}</span>
                  </div>
                )}
              </div>

              {/* Active Order */}
              {activeOrder && (
                <div className="active-order">
                  <h4>Current Order</h4>
                  <div className="order-summary">
                    <div className="order-info">
                      <span className="order-number">#{activeOrder.orderNumber}</span>
                      <span className={`order-status status-${activeOrder.status?.toLowerCase()}`}>
                        {activeOrder.status}
                      </span>
                    </div>
                    <div className="order-details">
                      <span>{activeOrder.orderFoods?.length || 0} items</span>
                      <span>${activeOrder.totalPrice?.toFixed(2)}</span>
                      <span>{formatTime(activeOrder.createdAt)}</span>
                    </div>
                  </div>
                  
                  {/* Order Actions */}
                  <div className="order-actions">
                    {activeOrder.status === 'NEW' && (
                      <button 
                        className="action-btn primary"
                        onClick={() => onOrderStatusUpdate(activeOrder.id, 'IN_PROGRESS')}
                      >
                        Start Preparing
                      </button>
                    )}
                    {activeOrder.status === 'IN_PROGRESS' && (
                      <button 
                        className="action-btn success"
                        onClick={() => onOrderStatusUpdate(activeOrder.id, 'READY')}
                      >
                        Mark Ready
                      </button>
                    )}
                    {activeOrder.status === 'READY' && (
                      <button 
                        className="action-btn info"
                        onClick={() => onOrderStatusUpdate(activeOrder.id, 'SERVED')}
                      >
                        Mark Served
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Staff Call Alert */}
              {table.hasStaffCall && (
                <div className="alert staff-call-alert">
                  <div className="alert-content">
                    <span className="alert-icon">🔔</span>
                    <span className="alert-text">Customer needs assistance</span>
                  </div>
                  <button 
                    className="alert-action"
                    onClick={() => onStaffCallResolve(table.id)}
                  >
                    Resolve
                  </button>
                </div>
              )}

              {/* Payment Request Alert */}
              {table.hasPaymentRequest && (
                <div className="alert payment-alert">
                  <div className="alert-content">
                    <span className="alert-icon">💳</span>
                    <span className="alert-text">Payment requested</span>
                  </div>
                  <button 
                    className="alert-action"
                    onClick={() => onPaymentRequestResolve(table.id)}
                  >
                    Process Payment
                  </button>
                </div>
              )}

              {/* Empty Table */}
              {!activeOrder && !table.hasStaffCall && !table.hasPaymentRequest && table.status === 'AVAILABLE' && (
                <div className="empty-table">
                  <span className="empty-icon">✨</span>
                  <span>Table is ready for guests</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {tables.length === 0 && (
        <div className="empty-state">
          <p>No tables configured yet</p>
        </div>
      )}
    </div>
  );
};

export default TableMonitor; 