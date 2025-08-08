import React, { useState } from 'react';
import './TableMonitor.css';

const TableMonitor = ({ 
  tables, 
  onStaffCallResolve, 
  onPaymentRequestResolve, 
  onOrderStatusUpdate 
}) => {
  const [expandedTables, setExpandedTables] = useState(new Set());
  
  const getTableStatusColor = (table) => {
    if (table.hasStaffCall || table.hasPaymentRequest) return 'urgent';
    
    // Check if table has active orders (auto-determine occupied status)
    const hasActiveOrders = table.orders && table.orders.length > 0;
    if (hasActiveOrders) return 'occupied';
    
    if (table.status === 'RESERVED') return 'reserved';
    if (table.status === 'CLEANING') return 'cleaning';
    return 'available';
  };

  const getTableStatusText = (table) => {
    if (table.hasStaffCall) return 'NEEDS ASSISTANCE';
    if (table.hasPaymentRequest) return 'PAYMENT REQUESTED';
    
    // Check if table has active orders (auto-determine occupied status)
    const hasActiveOrders = table.orders && table.orders.length > 0;
    if (hasActiveOrders) return 'OCCUPIED';
    
    return table.status;
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit',
      hour12: true 
    });
  };

  const getActiveOrders = (table) => {
    return table.orders?.filter(order => 
      !['COMPLETED', 'CANCELLED', 'PAID'].includes(order.status)
    ) || [];
  };



  // Helper functions for current orders summary
  const getTotalOrdersCount = (table) => {
    const tableOrders = table.orders || [];
    return tableOrders.filter(order => 
      order.status !== 'COMPLETED' && 
      order.status !== 'PAID'
    ).length;
  };

  const getTotalItemsCount = (table) => {
    const tableOrders = table.orders || [];
    const activeOrders = tableOrders.filter(order => 
      order.status !== 'COMPLETED' && 
      order.status !== 'PAID'
    );
    return activeOrders.reduce((total, order) => total + (order.orderItems?.length || 0), 0);
  };

  // Toggle Current Orders visibility
  const toggleCurrentOrders = (tableNumber) => {
    setExpandedTables(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tableNumber)) {
        newSet.delete(tableNumber);
      } else {
        newSet.add(tableNumber);
      }
      return newSet;
    });
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
          const activeOrders = getActiveOrders(table);
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

              {/* Table Summary */}
              <div className="table-summary">
                <div className="summary-stats">
                  <span>📋 {getTotalOrdersCount(table)} orders</span>
                  <span>🍽️ {getTotalItemsCount(table)} items</span>
                </div>
              </div>

              {/* Current Orders Toggle */}
              {getTotalOrdersCount(table) > 0 && (
                <div className="current-orders-section">
                  <div 
                    className="current-orders-header"
                    onClick={() => toggleCurrentOrders(table.number)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleCurrentOrders(table.number);
                      }
                    }}
                    aria-expanded={expandedTables.has(table.number)}
                    aria-label={`Toggle current orders for table ${table.number}`}
                  >
                    <h4>Current Orders</h4>
                    <div className="current-orders-summary">
                      <span className="orders-count">{getTotalOrdersCount(table)} orders</span>
                      <span className="items-count">{getTotalItemsCount(table)} items</span>
                    </div>
                    <span className={`toggle-icon ${expandedTables.has(table.number) ? 'expanded' : ''}`}>
                      ▼
                    </span>
                  </div>
                  
                  {expandedTables.has(table.number) && (
                    <div className="current-orders-details">
                      {(table.orders || [])
                        .filter(order => order.status !== 'COMPLETED' && order.status !== 'PAID')
                        .map((order, index) => (
                    <div key={order.id} className="order-summary">
                      <div className="order-info">
                        <span className="order-number">#{order.orderNumber}</span>
                            <span className={`monitor-order-status monitor-status-${order.status?.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="order-details">
                            <span>🍽️ {order.orderItems?.length || 0} items</span>
                            <span>💰 ${order.totalPrice?.toFixed(2)}</span>
                            <span>🕐 {formatTime(order.createdAt)}</span>
                      </div>
                      </div>
                      ))}
                    </div>
                  )}
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
              {activeOrders.length === 0 && !table.hasStaffCall && !table.hasPaymentRequest && table.status === 'AVAILABLE' && (
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