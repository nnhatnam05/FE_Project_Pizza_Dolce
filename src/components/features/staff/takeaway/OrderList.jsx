import React, { useState } from 'react';
import './OrderList.css';

const OrderList = ({ orders, onPaymentConfirm, onMarkReady, onCompleteOrder, onViewBill, onRefresh }) => {
    const [expandedOrders, setExpandedOrders] = useState(new Set());

    // Toggle order details
    const toggleOrderDetails = (orderId) => {
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

    // Get status display info
    const getStatusInfo = (status) => {
        switch (status) {
            case 'PENDING':
                return { label: 'Pending Payment', class: 'pending', icon: '⏳' };
            case 'PAID':
                return { label: 'Preparing', class: 'paid', icon: '👨‍🍳' };
            case 'READY':
                return { label: 'Ready for Pickup', class: 'ready', icon: '✅' };
            default:
                return { label: status, class: 'default', icon: '❓' };
        }
    };

    // Get action buttons for each status
    const getActionButtons = (order) => {
        const buttons = [];
        
        // Always show view bill button
        buttons.push(
            <button 
                key="view-bill"
                className="action-btn view-bill"
                onClick={() => onViewBill(order)}
            >
                🧾 View Bill
            </button>
        );

        // Status-specific buttons
        switch (order.status) {
            case 'PENDING':
                buttons.push(
                    <button 
                        key="payment"
                        className="action-btn payment"
                        onClick={() => onPaymentConfirm(order)}
                    >
                        💳 Confirm Payment
                    </button>
                );
                break;
            case 'PAID':
                buttons.push(
                    <button 
                        key="ready"
                        className="action-btn ready"
                        onClick={() => onMarkReady(order.id)}
                    >
                        ✅ Mark Ready
                    </button>
                );
                break;
            case 'READY':
                buttons.push(
                    <button 
                        key="complete"
                        className="action-btn complete"
                        onClick={() => onCompleteOrder(order.id)}
                    >
                        🎉 Complete Order
                    </button>
                );
                break;
        }
        
        return buttons;
    };

    // Format time
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    // Calculate estimated points
    const calculatePoints = (totalPrice) => {
        return Math.floor(totalPrice / 10.0) * 10;
    };

    if (orders.length === 0) {
        return (
            <div className="order-list-empty">
                <div className="empty-icon">📋</div>
                <h3>No orders found</h3>
                <p>Take-away orders will appear here</p>
                <button className="refresh-btn" onClick={onRefresh}>
                    🔄 Refresh
                </button>
            </div>
        );
    }

    return (
        <div className="order-list">
            <div className="order-list-header">
                <h3>Order List ({orders.length})</h3>
                <button className="refresh-btn" onClick={onRefresh}>
                    🔄 Refresh
                </button>
            </div>

            <div className="orders-grid">
                {orders.map(order => {
                    const statusInfo = getStatusInfo(order.status);
                    const isExpanded = expandedOrders.has(order.id);
                    const estimatedPoints = calculatePoints(order.totalPrice || 0);

                    return (
                        <div key={order.id} className={`order-card ${statusInfo.class}`}>
                            {/* Order Header */}
                            <div className="order-header">
                                <div className="order-info">
                                    <h4 className="order-number">{order.orderNumber}</h4>
                                    <div className="order-meta">
                                        <span className="order-time">
                                            🕐 {formatTime(order.createdAt)}
                                        </span>
                                        <span className={`order-status ${statusInfo.class}`}>
                                            {statusInfo.icon} {statusInfo.label}
                                        </span>
                                    </div>
                                </div>
                                <div className="order-amount">
                                    <span className="amount">${(order.totalPrice || 0).toFixed(2)}</span>
                                    <span className="items-count">
                                        {order.orderFoods?.length || 0} items
                                    </span>
                                </div>
                            </div>

                            {/* Customer Info */}
                            {(order.recipientName || order.recipientPhone) && (
                                <div className="customer-info">
                                    <div className="customer-details">
                                        {order.recipientName && (
                                            <span className="customer-name">
                                                👤 {order.recipientName}
                                            </span>
                                        )}
                                        {order.recipientPhone && (
                                            <span className="customer-phone">
                                                📞 {order.recipientPhone}
                                            </span>
                                        )}
                                        {order.customer && estimatedPoints > 0 && (
                                            <span className="points-info">
                                                🎁 +{estimatedPoints} points
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Order Items (Expandable) */}
                            <div className="order-items-section">
                                <button 
                                    className="toggle-details-btn"
                                    onClick={() => toggleOrderDetails(order.id)}
                                >
                                    {isExpanded ? '🔼 Hide Details' : '🔽 View Details'}
                                </button>
                                
                                {isExpanded && (
                                    <div className="order-items">
                                        {order.orderFoods?.map((orderFood, index) => (
                                            <div key={index} className="order-item">
                                                <span className="item-name">
                                                    {orderFood.food?.name || 'Unknown'}
                                                </span>
                                                <span className="item-quantity">
                                                    x{orderFood.quantity}
                                                </span>
                                                <span className="item-price">
                                                    ${((orderFood.food?.price || 0) * orderFood.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Payment Method */}
                                                            {order.paymentMethod && (
                                    <div className="payment-info">
                                        <span className="payment-method">
                                            {order.paymentMethod === 'CASH' ? '💵 Cash' : '📱 Bank Transfer'}
                                        </span>
                                        {order.billImageUrl && (
                                            <span className="bill-uploaded">📄 Bill Uploaded</span>
                                        )}
                                    </div>
                                )}

                            {/* Action Buttons */}
                            <div className="order-actions">
                                {getActionButtons(order).map((button, index) => (
                                    <div key={index} className="action-button-wrapper">
                                        {button}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderList; 