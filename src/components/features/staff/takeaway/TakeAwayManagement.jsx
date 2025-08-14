import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../../contexts/NotificationContext';
import OrderCreationForm from './OrderCreationForm';
import PaymentModal from './PaymentModal';
import CustomerModal from './CustomerModal';
import BillDetailModal from './BillDetailModal';
import './TakeAwayManagement.css';

const TakeAwayManagement = () => {
    const { showSuccess, showError } = useNotification();
    
    // State management
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(null);
    
    // Modal states - only one modal can be active at a time
    const [activeModal, setActiveModal] = useState(null); // 'payment', 'customer', 'bill'
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Tab state
    const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'create', 'customer'

    // Load orders
    const loadOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/takeaway', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to load orders:', error);
            showError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    // Auto refresh orders
    useEffect(() => {
        loadOrders();
        
        const interval = setInterval(loadOrders, 30000); // Refresh every 30 seconds
        setRefreshInterval(interval);
        
        return () => {
            if (interval) clearInterval(interval);
        };
    }, []);

    // Calculate stats
    const stats = {
        pending: orders.filter(o => o.status === 'PENDING').length,
        paid: orders.filter(o => o.status === 'PAID').length,
        ready: orders.filter(o => o.status === 'READY').length
    };

    // Handle order created
    const handleOrderCreated = (newOrder) => {
        setOrders(prev => [newOrder, ...prev]);
        setActiveTab('orders'); // Switch back to orders tab
        showSuccess(`Order ${newOrder.orderNumber} created successfully!`);
    };

    // Handle payment confirmation
    const handlePaymentConfirm = (order) => {
        setSelectedOrder(order);
        setActiveModal('payment');
    };

    // Handle payment success
    const handlePaymentSuccess = (updatedOrder) => {
        setOrders(prev => prev.map(o => 
            o.id === updatedOrder.id ? updatedOrder : o
        ));
        setActiveModal(null);
        setSelectedOrder(null);
        showSuccess('Payment confirmed successfully!');
    };

    // Handle create customer
    const handleCreateCustomer = () => {
        setActiveModal('customer');
    };

    // Handle customer created
    const handleCustomerCreated = (customer) => {
        setActiveModal(null);
        showSuccess(`Customer account ${customer.email} created successfully!`);
    };

    // Handle view bill details
    const handleViewBill = (order) => {
        setSelectedOrder(order);
        setActiveModal('bill');
    };

    // Handle mark ready
    const handleMarkReady = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:8080/api/takeaway/${orderId}/ready`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setOrders(prev => prev.map(o => 
                o.id === orderId ? response.data : o
            ));
            showSuccess('Order marked as ready for pickup!');
        } catch (error) {
            console.error('Failed to mark ready:', error);
            showError('Failed to update order status');
        }
    };

    // Handle complete order
    const handleCompleteOrder = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:8080/api/takeaway/${orderId}/complete`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Remove from current list (completed orders)
            setOrders(prev => prev.filter(o => o.id !== orderId));
            
            const pointsEarned = response.data.pointsEarned || 0;
            if (pointsEarned > 0) {
                showSuccess(`Order completed! Customer earned ${pointsEarned} points.`);
            } else {
                showSuccess('Order completed successfully!');
            }
        } catch (error) {
            console.error('Failed to complete order:', error);
            showError('Failed to complete order');
        }
    };

    if (loading) {
        return (
            <div className="takeaway-loading">
                <div className="loading-spinner"></div>
                <p>Loading data...</p>
            </div>
        );
    }

    return (
        <div className="takeaway-management">
            {/* Header */}
            <div className="takeaway-header">
                <h1>Take-Away Management</h1>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button 
                    className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    📋 Order List
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
                    onClick={() => setActiveTab('create')}
                >
                    ➕ Create New Order
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'orders' && (
                    <div className="orders-tab">
                        {/* Stats Cards */}
                        <div className="takeaway-stats">
                            <div className="stat-card pending">
                                <div className="stat-number">{stats.pending}</div>
                                <div className="stat-label">Pending Payment</div>
                            </div>
                            <div className="stat-card paid">
                                <div className="stat-number">{stats.paid}</div>
                                <div className="stat-label">Preparing</div>
                            </div>
                            <div className="stat-card ready">
                                <div className="stat-number">{stats.ready}</div>
                                <div className="stat-label">Ready</div>
                            </div>
                        </div>

                        {/* Orders List */}
                        <div className="orders-section">
                            <div className="section-header">
                                <h2>Recent Orders</h2>
                                <button 
                                    className="refresh-btn"
                                    onClick={loadOrders}
                                >
                                    🔄 Refresh
                                </button>
                            </div>

                            {orders.length === 0 ? (
                                <div className="no-orders">
                                    <div className="no-orders-icon">📋</div>
                                    <h3>No orders yet</h3>
                                    <p>Create your first take-away order to get started!</p>
                                    <button 
                                        className="create-first-order-btn"
                                        onClick={() => setActiveTab('create')}
                                    >
                                        ➕ Create First Order
                                    </button>
                                </div>
                            ) : (
                                <div className="orders-grid">
                                    {orders.map(order => (
                                        <div key={order.id} className={`order-card ${order.status.toLowerCase()}`}>
                                            <div className="order-header">
                                                <div className="order-number">#{order.orderNumber}</div>
                                                <div className={`order-status ${order.status.toLowerCase()}`}>
                                                    {order.status === 'PENDING' && '⏳ Pending Payment'}
                                                    {order.status === 'PAID' && '👨‍🍳 Preparing'}
                                                    {order.status === 'READY' && '✅ Ready'}
                                                    {order.status === 'COMPLETED' && '🎉 Completed'}
                                                </div>
                                            </div>

                                            <div className="order-details">
                                                <div className="order-info">
                                                    <div className="info-row">
                                                        <span className="label">Items:</span>
                                                        <span className="value">{order.orderFoods?.length || 0}</span>
                                                    </div>
                                                    <div className="info-row">
                                                        <span className="label">Total:</span>
                                                        <span className="value price">${(order.totalPrice || 0).toFixed(2)}</span>
                                                    </div>
                                                    {order.recipientName && (
                                                        <div className="info-row">
                                                            <span className="label">Customer:</span>
                                                            <span className="value">{order.recipientName}</span>
                                                        </div>
                                                    )}
                                                    <div className="info-row">
                                                        <span className="label">Time:</span>
                                                        <span className="value">
                                                            {new Date(order.createdAt).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="order-actions">
                                                {order.status === 'PENDING' && (
                                                    <button 
                                                        className="action-btn payment"
                                                        onClick={() => handlePaymentConfirm(order)}
                                                    >
                                                        💳 Confirm Payment
                                                    </button>
                                                )}
                                                
                                                {order.status === 'PAID' && (
                                                    <button 
                                                        className="action-btn ready"
                                                        onClick={() => handleMarkReady(order.id)}
                                                    >
                                                        ✅ Mark Ready
                                                    </button>
                                                )}
                                                
                                                {order.status === 'READY' && (
                                                    <button 
                                                        className="action-btn complete"
                                                        onClick={() => handleCompleteOrder(order.id)}
                                                    >
                                                        🎉 Complete Order
                                                    </button>
                                                )}
                                                
                                                <button 
                                                    className="action-btn view"
                                                    onClick={() => handleViewBill(order)}
                                                >
                                                    📄 View Details
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'create' && (
                    <div className="create-tab">
                        <OrderCreationForm 
                            onOrderCreated={handleOrderCreated}
                            onCreateCustomer={handleCreateCustomer}
                        />
                    </div>
                )}
            </div>

            {/* Modals - Only one modal can be active at a time */}
            {activeModal === 'payment' && (
                <PaymentModal
                    order={selectedOrder}
                    onClose={() => {
                        setActiveModal(null);
                        setSelectedOrder(null);
                    }}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            )}

            {activeModal === 'customer' && (
                <CustomerModal
                    onClose={() => setActiveModal(null)}
                    onCustomerCreated={handleCustomerCreated}
                />
            )}

            {activeModal === 'bill' && (
                <BillDetailModal
                    order={selectedOrder}
                    onClose={() => {
                        setActiveModal(null);
                        setSelectedOrder(null);
                    }}
                />
            )}
        </div>
    );
};

export default TakeAwayManagement; 