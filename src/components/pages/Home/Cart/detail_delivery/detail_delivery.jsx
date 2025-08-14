import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from '../../../../../contexts/NotificationContext';
import './detail_delivery.css';

const statusSteps = [
    { status: 'PREPARING', label: 'Preparing', icon: '⏳' },
    { status: 'WAITING_FOR_SHIPPER', label: 'Waiting for shipper', icon: '👤' },
    { status: 'DELIVERING', label: 'Delivering', icon: '🚚' },
    { status: 'DELIVERED', label: 'Delivered', icon: '✅' }
];

const DetailDelivery = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { showSuccess, showError } = useNotification();
    const [order, setOrder] = useState(null);
    const [deliveryStatus, setDeliveryStatus] = useState(null);
    const [previousStatus, setPreviousStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [showStatusDetails, setShowStatusDetails] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [rating, setRating] = useState(5);
    const [ratingComment, setRatingComment] = useState('');
    const [ratingSubmitting, setRatingSubmitting] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [apiError, setApiError] = useState(null);
    const notificationTimeoutRef = useRef(null);

            // Get order information
    const fetchOrder = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Please login to view order');
            navigate('/login/customer');
            return;
        }
        try {
            const res = await axios.get(`http://localhost:8080/api/orders/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log("Order data:", res.data);
            setOrder(res.data);
            return res.data;
        } catch (err) {
            console.error("Error fetching order:", err);
            setError('Cannot load order information');
            return null;
        }
    }, [orderId, navigate]);

    // Lấy trạng thái giao hàng
    const fetchDeliveryStatus = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        
        try {
            const res = await axios.get(`http://localhost:8080/api/orders/my/${orderId}/delivery-status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.data && (!res.data.deliveryStatus || res.data.deliveryStatus === '') && res.data.statusHistory && res.data.statusHistory.length > 0) {
                const lastStatus = res.data.statusHistory[res.data.statusHistory.length - 1];
                res.data.deliveryStatus = lastStatus.status;
            }
            
            setPreviousStatus(res.data?.deliveryStatus);
            setDeliveryStatus(res.data);
            setApiError(null);
            return res.data;
        } catch (err) {
            setDeliveryStatus(null);
            setApiError(err.message || "Cannot load delivery status");
            return null;
        }
    }, [orderId]);

            // Initialize and refresh
    useEffect(() => {
        const initializeData = async () => {
            setLoading(true);
            await fetchOrder();
            const status = await fetchDeliveryStatus();
            
            if (status) {
                setPreviousStatus(status.deliveryStatus);
                if (status.deliveryStatus === 'DELIVERED') {
                    setShowCompletionModal(true);
                }
                if (status.deliveryStatus === 'PAID') {
                    showStatusChangeNotification('Payment successful!');
                }
            }
            
            setLoading(false);
        };

        initializeData();

        // Refresh mỗi 10 giây
        const refreshInterval = setInterval(() => {
            fetchDeliveryStatus().then(status => {
                if (status && status.deliveryStatus === 'DELIVERED' && !showCompletionModal) {
                    setShowCompletionModal(true);
                }
            });
        }, 10000);

        return () => clearInterval(refreshInterval);
    }, [showCompletionModal]);

    useEffect(() => {
        if (deliveryStatus && deliveryStatus.deliveryStatus) {
            let statusToCheck = deliveryStatus.deliveryStatus;
            if (statusToCheck === 'PAID') {
                statusToCheck = 'CONFIRMED';
            }
            
            const stepIndex = statusSteps.findIndex(step => step.status === statusToCheck);
            if (stepIndex !== -1) {
                setCurrentStep(stepIndex);
            }
        }
    }, [deliveryStatus]);

    // Xử lý thay đổi trạng thái
    useEffect(() => {
        if (deliveryStatus && deliveryStatus.deliveryStatus && previousStatus) {
            if (deliveryStatus.deliveryStatus !== previousStatus) {
                let newStatusLabel;
                if (deliveryStatus.deliveryStatus === 'PAID') {
                    newStatusLabel = 'Paid';
                } else {
                    newStatusLabel = statusSteps.find(step => step.status === deliveryStatus.deliveryStatus)?.label || deliveryStatus.deliveryStatus;
                }
                showStatusChangeNotification(`Status changed: ${newStatusLabel}`);
                
                if (deliveryStatus.deliveryStatus === 'DELIVERED') {
                    setShowCompletionModal(true);
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 5000);
                }
            }
        }
    }, [deliveryStatus, previousStatus]);

    // Hiển thị thông báo
    const showStatusChangeNotification = (message) => {
        if (notificationTimeoutRef.current) {
            clearTimeout(notificationTimeoutRef.current);
        }
        
        setNotificationMessage(message);
        setShowNotification(true);
        
        notificationTimeoutRef.current = setTimeout(() => {
            setShowNotification(false);
        }, 5000);
    };

            // Submit rating
    const submitRating = async () => {
        if (ratingSubmitting) return;

        setRatingSubmitting(true);
        try {
            setTimeout(() => {
                setRatingSubmitting(false);
                setShowRatingModal(false);
                setShowCompletionModal(false);
                showSuccess('Thank you for your rating!');
            }, 1000);
        } catch (error) {
            setRatingSubmitting(false);
            showError('Cannot submit rating. Please try again.');
        }
    };

    // Render lịch sử trạng thái
    const renderStatusHistory = () => {
        if (!showStatusDetails || !deliveryStatus) {
            return null;
        }

        return (
            <div className="status-history-container" onClick={(e) => e.stopPropagation()}>
                <div className="status-history-header">
                    <h3>Status History</h3>
                    <button className="close-history" onClick={() => setShowStatusDetails(false)}>×</button>
                </div>
                <div className="status-history-list">
                    {!deliveryStatus.statusHistory || deliveryStatus.statusHistory.length === 0 ? (
                        <div className="history-item">
                            <div className="history-status">
                                {deliveryStatus.deliveryStatus === 'PAID' ? 'Paid' : deliveryStatus.deliveryStatus}
                            </div>
                            <div className="history-time">Current Status</div>
                            <div className="history-note">No additional history</div>
                        </div>
                    ) : (
                        deliveryStatus.statusHistory.map((item, idx) => (
                            <div key={idx} className="history-item">
                                <div className="history-status">
                                    {item.status === 'PAID' ? 'Paid' : item.status}
                                </div>
                                <div className="history-time">{new Date(item.changedAt).toLocaleString('vi-VN')}</div>
                                <div className="history-note">{item.note || '(No note)'}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

            // Render food list
    const renderOrderItems = () => {
        if (!order || !order.foodList || order.foodList.length === 0) {
            return <p style={{padding: '20px', textAlign: 'center', color: '#6c757d'}}>No food items in this order</p>;
        }

        return (
            <div className="order-items-section">
                <table className="order-items-table">
                    <thead>
                        <tr>
                            <th>Food Item</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.foodList.map(item => (
                            <tr key={item.id}>
                                <td className="item-name-cell">{item.name || 'No name'}</td>
                                <td className="item-price-cell">{Number(item.price).toLocaleString()} $</td>
                                <td className="item-quantity-cell">{item.quantity}</td>
                                <td className="item-total-cell">{Number(item.price * item.quantity).toLocaleString()} $</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="order-total">
                    <span>Total:</span>
                    <span>{Number(order.totalPrice).toLocaleString()} $</span>
                </div>
            </div>
        );
    };

    // Render form đánh giá
    const renderRatingForm = () => {
        return (
            <div className="rating-form">
                <h3>How do you rate this order?</h3>
                <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map(star => (
                        <span
                            key={star}
                            className={`star ${star <= rating ? 'active' : ''}`}
                            onClick={() => setRating(star)}
                        >
                            ★
                        </span>
                    ))}
                </div>
                <textarea
                    className="rating-comment"
                    placeholder="Share your experience..."
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    rows={3}
                />
                <div className="modal-actions">
                    <button
                        className="modal-btn primary"
                        onClick={submitRating}
                        disabled={ratingSubmitting}
                    >
                        {ratingSubmitting ? 'Sending...' : 'Submit Rating'}
                    </button>
                </div>
            </div>
        );
    };

    // Render modal chúc mừng hoàn thành
    const renderCompletionModal = () => {
        if (!showCompletionModal) return null;

        return (
            <div className="completion-modal-content">
                <div className="completion-header">
                    <div className="completion-icon">🎉</div>
                    <h2 className="completion-title">Order delivered successfully!</h2>
                </div>
                
                <div className="completion-body">
                    <div className="success-animation">
                        <div className="checkmark-circle">
                            <div className="checkmark"></div>
                        </div>
                    </div>
                    
                    <div className="completion-message">
                        <h3>Congratulations! 🎊</h3>
                        <p>Order #{order?.orderNumber || order?.id} has been delivered to your doorstep.</p>
                        <p className="bon-appetit">Enjoy your meal! Bon Appétit! 🍽️</p>
                    </div>
                    
                    <div className="completion-actions">
                        <button 
                            className="continue-shopping-btn"
                            onClick={() => {
                                setShowCompletionModal(false);
                                navigate('/');
                            }}
                        >
                            <span className="btn-icon">🛒</span>
                            Continue Shopping
                        </button>
                        <button 
                            className="close-modal-btn"
                            onClick={() => {
                                setShowCompletionModal(false);
                                navigate(`/payment-details/${orderId}`);
                            }}
                        >
                            <span className="btn-icon">✕</span>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Component thông báo
    const renderNotification = () => {
        if (!showNotification) return null;

        return (
            <div className="status-notification">
                <span className="notification-icon">🔔</span>
                <span className="notification-message">{notificationMessage}</span>
                <button 
                    className="notification-close"
                    onClick={() => setShowNotification(false)}
                >
                    ×
                </button>
            </div>
        );
    };

    // Component confetti
    const renderConfetti = () => {
        if (!showConfetti) return null;

        return (
            <div className="confetti-container">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className="confetti-piece"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${3 + Math.random() * 2}s`
                        }}
                    >
                        {['🎉', '🎊', '✨', '🌟', '💫'][Math.floor(Math.random() * 5)]}
                    </div>
                ))}
            </div>
        );
    };

    if (loading) return <div className="delivery-loading">Loading...</div>;
    if (error) return <div className="delivery-error">{error}</div>;

            // Get order status tag
    const getStatusTag = (status) => {
        switch (status) {
            case 'WAITING_PAYMENT': return <span className="status-tag waiting_payment">Waiting for payment</span>;
            case 'PAID': return <span className="status-tag paid">Paid</span>;
            case 'CONFIRMED': return <span className="status-tag confirmed">Confirmed</span>;
            case 'PREPARING': return <span className="status-tag preparing">Preparing</span>;
            case 'DELIVERING': return <span className="status-tag delivering">Delivering</span>;
            case 'COMPLETED': return <span className="status-tag completed">Completed</span>;
            case 'CANCELLED': return <span className="status-tag cancelled">Cancelled</span>;
            default: return <span className="status-tag">{status}</span>;
        }
    };

    return (
        <div className="delivery-page-container">
            {renderConfetti()}
            {renderNotification()}
            
            {showStatusDetails && (
                <div className="modal-overlay" onClick={() => setShowStatusDetails(false)}>
                    {renderStatusHistory()}
                </div>
            )}
            
            <div className="breadcrumb">
                <span onClick={() => navigate('/')}>Home</span>
                <span>•</span>
                <span onClick={() => navigate('/order-history')}>Order History</span>
                <span>•</span>
                <span>Order #{order?.id}</span>
            </div>
            
            <h1 className="page-title">Order Details</h1>
            
            <div className="delivery-content">
                                    {/* Left column - Food list and Customer information */}
                    <div style={{display: 'flex', flexDirection: 'column', gap: 16, flex: 1}}>
                        <div className="content-section order-details-section">
                            <h2 className="section-title">Food Items</h2>
                            {renderOrderItems()}
                        </div>
                        {/* Customer information */}
                    <div className="content-section customer-info-section">
                        <h2 className="section-title">Customer Information</h2>
                        <div className="info-card">
                            <div className="info-item">
                                <div className="info-label">Name:</div>
                                <div className="info-value">{order?.customer?.fullName || 'Name not updated'}</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Phone Number:</div>
                                <div className="info-value">{order?.customer?.phoneNumber || 'No phone number'}</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Email:</div>
                                <div className="info-value">{order?.customer?.email || 'No email'}</div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Thông tin địa chỉ giao hàng */}
                    {order?.deliveryAddress && (
                        <div className="content-section delivery-info-section">
                            <h2 className="section-title">Delivery Address</h2>
                            <div className="info-card">
                                <div className="info-item">
                                    <div className="info-label">Recipient:</div>
                                    <div className="info-value">{order?.recipientName || 'No recipient'}</div>
                                </div>
                                <div className="info-item">
                                    <div className="info-label">Delivery Phone:</div>
                                    <div className="info-value">{order?.recipientPhone || 'No phone'}</div>
                                </div>
                                <div className="info-item">
                                    <div className="info-label">Address:</div>
                                    <div className="info-value">{order?.deliveryAddress || 'No address'}</div>
                                </div>
                                {order?.deliveryLatitude && order?.deliveryLongitude && (
                                    <div className="info-item">
                                        <div className="info-label">Coordinates:</div>
                                        <div className="info-value">{order?.deliveryLatitude}, {order?.deliveryLongitude}</div>
                                </div>
                            )}
                        </div>
                    </div>
                    )}
                </div>
                                    {/* Right column - Status and order summary */}
                <div className="right-column">
                    {/* Card trạng thái giao hàng */}
                    <div className="content-section delivery-status-section">
                        <h2 className="section-title">Delivery Status</h2>
                        <div className="delivery-status-card">
                            <div className="current-status-header">
                                <span className="current-status-label">Current Status:</span>
                                <span className="current-status-value">
                                    {(() => {
                                        if (!deliveryStatus) {
                                            return 'Loading...';
                                        }
                                        if (deliveryStatus.deliveryStatus === 'PAID') {
                                            return 'Paid';
                                        } else {
                                            const currentStatusIndex = statusSteps.findIndex(s => s.status === deliveryStatus.deliveryStatus);
                                            return currentStatusIndex !== -1 ? statusSteps[currentStatusIndex].label : deliveryStatus.deliveryStatus || 'Unknown';
                                        }
                                    })()}
                                </span>
                            </div>
                            
                            {apiError && (
                                <div style={{
                                    fontSize: '12px', 
                                    color: '#dc3545', 
                                    marginBottom: '8px', 
                                    padding: '6px 8px', 
                                    backgroundColor: '#f8d7da', 
                                    borderRadius: '4px',
                                    border: '1px solid #f5c6cb'
                                }}>
                                    An error occurred, please reload the page!
                                </div>
                            )}
                            
                            {/* Progress bar */}
                            <div className="delivery-progress-container">
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ 
                                            width: `${(() => {
                                                if (deliveryStatus?.deliveryStatus === 'PAID') {
                                                    return (1 / (statusSteps.length - 1)) * 100;
                                                } else {
                                                    const currentStatusIndex = statusSteps.findIndex(s => s.status === deliveryStatus?.deliveryStatus);
                                                    return currentStatusIndex !== -1 ? (currentStatusIndex / (statusSteps.length - 1)) * 100 : 0;
                                                }
                                            })()}%` 
                                        }}
                                    ></div>
                                </div>
                                <div className="progress-steps">
                                    {statusSteps.map((step, index) => {
                                        let isActive = false;
                                        let isCurrent = false;
                                        
                                        if (deliveryStatus?.deliveryStatus === 'PAID') {
                                            isActive = index <= 0;
                                            isCurrent = index === 0;
                                        } else {
                                            const currentStatusIndex = statusSteps.findIndex(s => s.status === deliveryStatus?.deliveryStatus);
                                            
                                            if (currentStatusIndex !== -1) {
                                                isActive = index <= currentStatusIndex;
                                                isCurrent = index === currentStatusIndex;
                                            }
                                        }
                                        
                                        return (
                                            <div
                                                key={index}
                                                className={`progress-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
                                                onClick={() => setShowStatusDetails(true)}
                                                title="View status history"
                                            >
                                                <div className="step-icon">{step.icon}</div>
                                                <div className="step-label">{step.label}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            <div className="status-actions">
                                <button 
                                    className="history-button"
                                    onClick={() => setShowStatusDetails(true)}
                                >
                                    View History
                                </button>
                                {deliveryStatus?.deliveryStatus === 'DELIVERED' && (
                                    <button 
                                        className="rating-button"
                                        onClick={() => setShowRatingModal(true)}
                                    >
                                        Rate Order
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    
                                            {/* Order summary card */}
                    <div className="content-section order-summary-section">
                        <h2 className="section-title">Order Summary</h2>
                        <div className="summary-card">
                            <div className="summary-item">
                                <div className="summary-label">Order ID:</div>
                                <div className="summary-value">#{order?.orderNumber || order?.id}</div>
                            </div>
                            <div className="summary-item">
                                <div className="summary-label">Order Date:</div>
                                <div className="summary-value">{new Date(order?.createdAt).toLocaleString('vi-VN')}</div>
                            </div>
                            {/* <div className="summary-item">
                                <div className="summary-label">Status:</div>
                                <div className="summary-value">{getStatusTag(order?.status)}</div>
                            </div> */}
                            {order?.paymentMethod && (
                                <div className="summary-item">
                                    <div className="summary-label">Payment Method:</div>
                                    <div className="summary-value">{order.paymentMethod.name}</div>
                                </div>
                            )}
                            
                            <div className="summary-divider"></div>
                            
                            {/* <div className="summary-total">
                                <div className="summary-label">Total:</div>
                                <div className="summary-value total-value">${Number(order?.totalPrice).toLocaleString()}</div>
                            </div> */}
                            
                            <div className="summary-actions">
                                <button
                                    className="back-btn"
                                    onClick={() => navigate('/order-history')}
                                >
                                    Back
                                </button>
                                <button
                                    className="home-btn"
                                    onClick={() => navigate('/')}
                                >
                                    Home
                                </button>
                            </div>
                        </div>
                        
                        {/* Order note */}
                        {order?.note && (
                            <div className="note-card">
                                <h3 className="note-title">Order Note</h3>
                                <p className="note-content">{order.note}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal đánh giá */}
            {showRatingModal && (
                <div className="modal-overlay" onClick={() => setShowRatingModal(false)}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Rate Order</h3>
                            <button className="modal-close" onClick={() => setShowRatingModal(false)}>×</button>
                        </div>
                        <div className="modal-content">
                            {renderRatingForm()}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Modal chúc mừng hoàn thành */}
            {showCompletionModal && (
                <div className="completion-modal-overlay" onClick={() => setShowCompletionModal(false)}>
                    <div className="completion-modal-container" onClick={(e) => e.stopPropagation()}>
                        {renderCompletionModal()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailDelivery;
