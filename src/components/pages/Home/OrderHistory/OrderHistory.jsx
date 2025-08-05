import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../../common/Layout/customer_layout';
import axios from 'axios';
import './OrderHistory.css';

const OrderHistory = () => {
    const navigate = useNavigate();
    const { customer } = useContext(CartContext);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [error, setError] = useState(null);
    
    const fetchCustomerOrders = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        setOrdersLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/orders/myorder', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log('Orders data:', response.data);
            // Log chi tiết từng order để debug
            response.data.forEach((order, index) => {
                console.log(`Order ${index + 1}:`, {
                    id: order.id,
                    customer: order.customer,
                    deliveryAddress: order.deliveryAddress,
                    recipientName: order.recipientName,
                    recipientPhone: order.recipientPhone
                });
            });
            setOrders(response.data);
            setError(null);
        } catch (err) {
            setError('Unable to load orders. Please try again later.');
            setOrders([]);
        } finally {
            setOrdersLoading(false);
        }
    };

    // Không cần fetchWaitingConfirmOrders nữa, chỉ dùng fetchCustomerOrders
    
    useEffect(() => {
        if (customer) {
            fetchCustomerOrders();
        }
    }, [customer]);
    
    useEffect(() => {
        if (!orders) {
            setFilteredOrders([]);
            return;
        }
        
        let filtered = [];
        
        if (statusFilter === 'ALL') {
            // Tất cả orders
            filtered = [...orders];
        } else if (statusFilter === 'WAITING_PAYMENT') {
            // Orders có status = WAITING_PAYMENT
            filtered = orders.filter(order => order.status === 'WAITING_PAYMENT');
        } else if (statusFilter === 'DELIVERING_GROUP') {
            // Orders có delivery_status = PREPARING, WAITING_FOR_SHIPPER, DELIVERING
            filtered = orders.filter(order => 
                order.deliveryStatus === 'PREPARING' || 
                order.deliveryStatus === 'WAITING_FOR_SHIPPER' || 
                order.deliveryStatus === 'DELIVERING'
            );
        } else if (statusFilter === 'REJECTED') {
            // Orders có delivery_status = CANCELED
            filtered = orders.filter(order => order.deliveryStatus === 'CANCELED');
        } else {
            // Filter theo status khác
            filtered = orders.filter(order => order.status === statusFilter);
        }
        
        // Sắp xếp theo thời gian tạo mới nhất
        setFilteredOrders(filtered.sort((a, b) => 
            new Date(b.createdDate || b.createdAt || 0) - new Date(a.createdDate || a.createdAt || 0)
        ));
    }, [orders, statusFilter]);
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    const getStatusInfo = (order) => {
        // Ưu tiên hiển thị delivery status nếu có
        const status = order.deliveryStatus || order.status;
        
        switch (status) {
            case 'WAITING_PAYMENT':
                return { displayName: 'Waiting for payment', className: 'status-waiting' };
            case 'PAID':
                return { displayName: 'Paid', className: 'status-paid' };
            case 'CONFIRMED':
                return { displayName: 'Confirmed', className: 'status-confirmed' };
            case 'PREPARING':
                return { displayName: 'Preparing', className: 'status-preparing' };
            case 'WAITING_FOR_SHIPPER':
                return { displayName: 'Waiting for shipper', className: 'status-preparing' };
            case 'DELIVERING':
                return { displayName: 'Delivering', className: 'status-delivering' };
            case 'COMPLETED':
                return { displayName: 'Completed', className: 'status-completed' };
            case 'CANCELLED':
            case 'REJECTED':
            case 'CANCELED':
                return { displayName: 'Cancelled', className: 'status-cancelled' };
            default:
                return { displayName: status || 'Unknown', className: 'status-unknown' };
        }
    };

    // Lấy tên class cho order card
    const getOrderCardClassName = (order) => {
        // Ưu tiên hiển thị delivery status nếu có
        const status = order.deliveryStatus || order.status;
        
        switch (status) {
            case 'WAITING_PAYMENT':
                return 'waiting';
            case 'PAID':
                return 'paid';
            case 'CONFIRMED':
                return 'confirmed';
            case 'PREPARING':
                return 'preparing';
            case 'WAITING_FOR_SHIPPER':
                return 'waiting-shipper';
            case 'DELIVERING':
                return 'delivering';
            case 'COMPLETED':
                return 'completed';
            case 'CANCELLED':
            case 'REJECTED':
            case 'CANCELED':
                return 'cancelled';
            default:
                return '';
        }
    };

    const handleOrderClick = (order) => {
        // Ưu tiên kiểm tra delivery status
        const status = order.deliveryStatus || order.status;
        
        if (
            status === 'PAID' ||
            status === 'PREPARING' ||
            status === 'WAITING_FOR_SHIPPER' ||
            status === 'DELIVERING'
        ) {
            navigate(`/detail-delivery/${order.id}`);
        } else {
            navigate(`/payment-details/${order.id}`);
        }
    };

    if (!customer) {
        return (
            <div className="order-history-container">
                <div className="login-required">
                    <h2>Please log in to view your order history</h2>
                    <button 
                        className="login-btn"
                        onClick={() => navigate('/login/customer')}
                    >
                        Log In
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="order-history-container">
            <div className="breadcrumb">
                <span onClick={() => navigate('/')}>Home</span>
                <span> • </span>
                <span>Order History</span>
            </div>
            
            <h1>Order History</h1>
            
            {/* Filters */}
            <div className="order-filters">
                <div className="status-filters">
                    <button 
                        className={`filter-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('ALL')}
                    >
                        All orders
                    </button>
                    <button 
                        className={`filter-btn ${statusFilter === 'WAITING_PAYMENT' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('WAITING_PAYMENT')}
                    >
                        Orders waiting for payment
                    </button>
                    <button 
                        className={`filter-btn ${statusFilter === 'DELIVERING_GROUP' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('DELIVERING_GROUP')}
                    >
                        Orders in delivery
                    </button>
                    <button 
                        className={`filter-btn ${statusFilter === 'REJECTED' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('REJECTED')}
                    >
                        Cancelled orders
                    </button>
                </div>
                
                <button 
                    className="refresh-btn"
                    onClick={fetchCustomerOrders}
                >
                    Refresh
                </button>
            </div>
            
            {/* Error message */}
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
            
            {/* Loading state */}
            {ordersLoading && (
                <div className="loading-message">
                    Loading...
                </div>
            )}
            
            {/* Empty orders */}
            {!ordersLoading && !error && filteredOrders.length === 0 && (
                <div className="empty-orders">
                    <p>
                        No orders found
                        {statusFilter !== 'ALL' ? ` for the selected status.` : '.'}
                    </p>
                </div>
            )}
            
            {/* Orders list */}
            {!ordersLoading && !error && filteredOrders.length > 0 && (
                <div className="orders-list">
                    {filteredOrders.map(order => {
                        const statusInfo = getStatusInfo(order);
                        const cardClassName = getOrderCardClassName(order);
                        
                        return (
                            <div 
                                key={order.id} 
                                className={`order-card ${cardClassName}`}
                                onClick={() => handleOrderClick(order)}
                            >
                                <div className="order-header">
                                    <div className="order-id">
                                        {order.id}
                                    </div>
                                    <div className={`order-status ${statusInfo.className}`}>
                                        {statusInfo.displayName}
                                    </div>
                                </div>
                                
                                <div className="order-date">
                                    <span className="label">Order date:</span>
                                    <span className="value">{formatDate(order.createdDate || order.createdAt)}</span>
                                </div>
                                
                                {/* Customer Information */}
                                <div className="customer-info">
                                    <div className="customer-details">
                                        <div className="customer-row">
                                            <span className="customer-label">Customer ID:</span>
                                            <span className="customer-value">
                                                #{order.customer?.id || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="customer-row">
                                            <span className="customer-label">Customer Name:</span>
                                            <span className="customer-value">
                                                {order.customer?.fullName || 'Chưa cập nhật tên'}
                                            </span>
                                        </div>
                                        <div className="customer-row">
                                            <span className="customer-label">Phone:</span>
                                            <span className="customer-value">
                                                {order.customer?.phoneNumber || customer?.phoneNumber || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="customer-row">
                                            <span className="customer-label">Email:</span>
                                            <span className="customer-value">
                                                {order.customer?.email || customer?.email || 'N/A'}
                                            </span>
                                        </div>
                                        {order.deliveryAddress && (
                                            <>
                                                <div className="customer-row">
                                                    <span className="customer-label">Recipient:</span>
                                                    <span className="customer-value">{order.recipientName}</span>
                                                </div>
                                                <div className="customer-row">
                                                    <span className="customer-label">Delivery Phone:</span>
                                                    <span className="customer-value">{order.recipientPhone}</span>
                                                </div>
                                                <div className="customer-row">
                                                    <span className="customer-label">Delivery Address:</span>
                                                    <span className="customer-value">{order.deliveryAddress}</span>
                                                </div>
                                            </>
                                        )}
                                        {/* Debug info - chỉ hiển thị trong development */}
                                        {/* {process.env.NODE_ENV === 'development' && (
                                            <div className="customer-row" style={{fontSize: '10px', color: '#999'}}>
                                                <span className="customer-label">Debug:</span>
                                                <span className="customer-value">
                                                    Customer: {JSON.stringify(order.customer)}
                                                </span>
                                            </div>
                                        )} */}
                                        {order.deliveryAddress && (
                                            <>
                                                <div className="customer-row">
                                                    <span className="customer-label">Recipient:</span>
                                                    <span className="customer-value">{order.recipientName}</span>
                                                </div>
                                                <div className="customer-row">
                                                    <span className="customer-label">Delivery Phone:</span>
                                                    <span className="customer-value">{order.recipientPhone}</span>
                                                </div>
                                                <div className="customer-row">
                                                    <span className="customer-label">Delivery Address:</span>
                                                    <span className="customer-value">{order.deliveryAddress}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="order-items-preview">
                                    {order.orderFoods?.length > 0 || order.foodList?.length > 0 ? (
                                        <ul className="items-list">
                                            {(order.orderFoods || order.foodList || []).slice(0, 3).map((item, index) => (
                                                <li key={item.id || index}>
                                                    {item.food?.name || item.name} x {item.quantity}
                                                </li>
                                            ))}
                                            {(order.orderFoods?.length > 3 || order.foodList?.length > 3) && (
                                                <li className="more-items">
                                                    {(order.orderFoods?.length || order.foodList?.length) - 3} more items
                                                </li>
                                            )}
                                        </ul>
                                    ) : (
                                        <p>No items</p>
                                    )}
                                </div>
                                

                                
                                <div className="order-footer">
                                    <div className="order-total">
                                        <span className="label">Total:</span>
                                        <span className="value">${Number(order.totalPrice).toLocaleString()}</span>
                                    </div>
                                    
                                    <button className="view-details-btn">
                                        View details
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
