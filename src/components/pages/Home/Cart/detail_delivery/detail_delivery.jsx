import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './detail_delivery.css';

const statusSteps = [
    { status: 'PREPARING', label: 'Đang chuẩn bị', icon: '⏳' },
    { status: 'WAITING_FOR_SHIPPER', label: 'Chờ shipper', icon: '👤' },
    { status: 'DELIVERING', label: 'Đang giao', icon: '🚚' },
    { status: 'DELIVERED', label: 'Đã giao', icon: '✅' }
];

const DetailDelivery = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
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

    // Fetch order information
    const fetchOrder = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Vui lòng đăng nhập để xem đơn hàng');
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
            setError('Không thể tải thông tin đơn hàng');
            return null;
        }
    }, [orderId, navigate]);

    // Fetch delivery status
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
            setApiError(err.message || "Không thể tải trạng thái giao hàng");
            return null;
        }
    }, [orderId]);

    // Init and refresh
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
                    showStatusChangeNotification('Thanh toán thành công!');
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
                    newStatusLabel = 'Đã thanh toán';
                } else {
                    newStatusLabel = statusSteps.find(step => step.status === deliveryStatus.deliveryStatus)?.label || deliveryStatus.deliveryStatus;
                }
                showStatusChangeNotification(`Trạng thái đã thay đổi: ${newStatusLabel}`);
                
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

    // Gửi đánh giá
    const submitRating = async () => {
        if (ratingSubmitting) return;

        setRatingSubmitting(true);
        try {
            setTimeout(() => {
                setRatingSubmitting(false);
                setShowRatingModal(false);
                setShowCompletionModal(false);
                alert('Cảm ơn bạn đã đánh giá!');
            }, 1000);
        } catch (error) {
            setRatingSubmitting(false);
            alert('Không thể gửi đánh giá. Vui lòng thử lại.');
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
                    <h3>Lịch sử trạng thái</h3>
                    <button className="close-history" onClick={() => setShowStatusDetails(false)}>×</button>
                </div>
                <div className="status-history-list">
                    {!deliveryStatus.statusHistory || deliveryStatus.statusHistory.length === 0 ? (
                        <div className="history-item">
                            <div className="history-status">
                                {deliveryStatus.deliveryStatus === 'PAID' ? 'Đã thanh toán' : deliveryStatus.deliveryStatus}
                            </div>
                            <div className="history-time">Trạng thái hiện tại</div>
                            <div className="history-note">Không có lịch sử bổ sung</div>
                        </div>
                    ) : (
                        deliveryStatus.statusHistory.map((item, idx) => (
                            <div key={idx} className="history-item">
                                <div className="history-status">
                                    {item.status === 'PAID' ? 'Đã thanh toán' : item.status}
                                </div>
                                <div className="history-time">{new Date(item.changedAt).toLocaleString('vi-VN')}</div>
                                <div className="history-note">{item.note || '(Không có ghi chú)'}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    // Render danh sách món ăn
    const renderOrderItems = () => {
        if (!order || !order.foodList || order.foodList.length === 0) {
            return <p style={{padding: '20px', textAlign: 'center', color: '#6c757d'}}>Không có món ăn trong đơn hàng này</p>;
        }

        return (
            <div className="order-items-section">
                <table className="order-items-table">
                    <thead>
                        <tr>
                            <th>Món ăn</th>
                            <th>Giá</th>
                            <th>Số lượng</th>
                            <th>Tổng</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.foodList.map(item => (
                            <tr key={item.id}>
                                <td className="item-name-cell">{item.name || 'Không có tên'}</td>
                                <td className="item-price-cell">{Number(item.price).toLocaleString()} $</td>
                                <td className="item-quantity-cell">{item.quantity}</td>
                                <td className="item-total-cell">{Number(item.price * item.quantity).toLocaleString()} $</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="order-total">
                    <span>Tổng cộng:</span>
                    <span>{Number(order.totalPrice).toLocaleString()} $</span>
                </div>
            </div>
        );
    };

    // Render form đánh giá
    const renderRatingForm = () => {
        return (
            <div className="rating-form">
                <h3>Bạn đánh giá đơn hàng này như thế nào?</h3>
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
                    placeholder="Chia sẻ trải nghiệm của bạn..."
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
                        {ratingSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
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
                    <h2 className="completion-title">Đơn hàng đã giao thành công!</h2>
                </div>
                
                <div className="completion-body">
                    <div className="success-animation">
                        <div className="checkmark-circle">
                            <div className="checkmark"></div>
                        </div>
                    </div>
                    
                    <div className="completion-message">
                        <h3>Chúc mừng bạn! 🎊</h3>
                        <p>Đơn hàng #{order?.orderNumber || order?.id} đã được giao đến tận tay bạn.</p>
                        <p className="bon-appetit">Thưởng thức bữa ăn ngon miệng! Bon Appétit! 🍽️</p>
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
                            Tiếp tục mua sắm
                        </button>
                        <button 
                            className="close-modal-btn"
                            onClick={() => {
                                setShowCompletionModal(false);
                                navigate(`/payment-details/${orderId}`);
                            }}
                        >
                            <span className="btn-icon">✕</span>
                            Đóng
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

    if (loading) return <div className="delivery-loading">Đang tải...</div>;
    if (error) return <div className="delivery-error">{error}</div>;

    // Lấy tag trạng thái đơn hàng
    const getStatusTag = (status) => {
        switch (status) {
            case 'WAITING_PAYMENT': return <span className="status-tag waiting_payment">Chờ thanh toán</span>;
            case 'PAID': return <span className="status-tag paid">Đã thanh toán</span>;
            case 'CONFIRMED': return <span className="status-tag confirmed">Đã xác nhận</span>;
            case 'PREPARING': return <span className="status-tag preparing">Đang chuẩn bị</span>;
            case 'DELIVERING': return <span className="status-tag delivering">Đang giao</span>;
            case 'COMPLETED': return <span className="status-tag completed">Hoàn thành</span>;
            case 'CANCELLED': return <span className="status-tag cancelled">Đã hủy</span>;
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
                <span onClick={() => navigate('/')}>Trang chủ</span>
                <span>•</span>
                <span onClick={() => navigate('/order-history')}>Lịch sử đơn hàng</span>
                <span>•</span>
                <span>Đơn hàng #{order?.id}</span>
            </div>
            
            <h1 className="page-title">Chi tiết đơn hàng</h1>
            
            <div className="delivery-content">
                {/* Cột trái - Danh sách món ăn và Thông tin khách hàng */}
                <div style={{display: 'flex', flexDirection: 'column', gap: 16, flex: 1}}>
                    <div className="content-section order-details-section">
                        <h2 className="section-title">Danh sách món ăn</h2>
                        {renderOrderItems()}
                    </div>
                    {/* Thông tin khách hàng */}
                    <div className="content-section customer-info-section">
                        <h2 className="section-title">Thông tin khách hàng</h2>
                        <div className="info-card">
                            <div className="info-item">
                                <div className="info-label">Tên:</div>
                                <div className="info-value">{order?.customer?.name || order?.customer?.fullName || 'Không có tên'}</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Số điện thoại:</div>
                                <div className="info-value">{order?.customer?.phoneNumber || order?.phoneNumber || 'Không có'}</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Địa chỉ:</div>
                                <div className="info-value">{order?.customer?.address || order?.shippingAddress || order?.address || 'Không có'}</div>
                            </div>
                            {(order?.customer?.email || order?.email) && (
                                <div className="info-item">
                                    <div className="info-label">Email:</div>
                                    <div className="info-value">{order?.customer?.email || order?.email}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Cột phải - Trạng thái và tóm tắt đơn hàng */}
                <div className="right-column">
                    {/* Card trạng thái giao hàng */}
                    <div className="content-section delivery-status-section">
                        <h2 className="section-title">Trạng thái giao hàng</h2>
                        <div className="delivery-status-card">
                            <div className="current-status-header">
                                <span className="current-status-label">Trạng thái hiện tại:</span>
                                <span className="current-status-value">
                                    {(() => {
                                        if (!deliveryStatus) {
                                            return 'Đang tải...';
                                        }
                                        if (deliveryStatus.deliveryStatus === 'PAID') {
                                            return 'Đã thanh toán';
                                        } else {
                                            const currentStatusIndex = statusSteps.findIndex(s => s.status === deliveryStatus.deliveryStatus);
                                            return currentStatusIndex !== -1 ? statusSteps[currentStatusIndex].label : deliveryStatus.deliveryStatus || 'Không xác định';
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
                                    Có lỗi xảy ra vui lòng tải lại trang!
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
                                                title="Xem lịch sử trạng thái"
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
                                    Xem lịch sử
                                </button>
                                {deliveryStatus?.deliveryStatus === 'DELIVERED' && (
                                    <button 
                                        className="rating-button"
                                        onClick={() => setShowRatingModal(true)}
                                    >
                                        Đánh giá
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Card tóm tắt đơn hàng */}
                    <div className="content-section order-summary-section">
                        <h2 className="section-title">Tóm tắt đơn hàng</h2>
                        <div className="summary-card">
                            <div className="summary-item">
                                <div className="summary-label">Mã đơn hàng:</div>
                                <div className="summary-value">#{order?.orderNumber || order?.id}</div>
                            </div>
                            <div className="summary-item">
                                <div className="summary-label">Ngày đặt:</div>
                                <div className="summary-value">{new Date(order?.createdAt).toLocaleString('vi-VN')}</div>
                            </div>
                            {/* <div className="summary-item">
                                <div className="summary-label">Trạng thái:</div>
                                <div className="summary-value">{getStatusTag(order?.status)}</div>
                            </div> */}
                            {order?.paymentMethod && (
                                <div className="summary-item">
                                    <div className="summary-label">Phương thức thanh toán:</div>
                                    <div className="summary-value">{order.paymentMethod.name}</div>
                                </div>
                            )}
                            
                            <div className="summary-divider"></div>
                            
                            {/* <div className="summary-total">
                                <div className="summary-label">Tổng cộng:</div>
                                <div className="summary-value total-value">${Number(order?.totalPrice).toLocaleString()}</div>
                            </div> */}
                            
                            <div className="summary-actions">
                                <button
                                    className="back-btn"
                                    onClick={() => navigate('/order-history')}
                                >
                                    Quay lại
                                </button>
                                <button
                                    className="home-btn"
                                    onClick={() => navigate('/')}
                                >
                                    Trang chủ
                                </button>
                            </div>
                        </div>
                        
                        {/* Ghi chú đơn hàng */}
                        {order?.note && (
                            <div className="note-card">
                                <h3 className="note-title">Ghi chú đơn hàng</h3>
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
                            <h3>Đánh giá đơn hàng</h3>
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
