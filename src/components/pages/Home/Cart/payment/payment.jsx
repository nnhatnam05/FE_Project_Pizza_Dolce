import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from '../../../../../contexts/NotificationContext';
import './payment.css';

const PaymentDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { showError } = useNotification();

    const [order, setOrder] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Delivery status
    const [deliveryStatus, setDeliveryStatus] = useState(null);

    // Cancel order states
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [customCancelReason, setCustomCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [showCancelReasonError, setShowCancelReasonError] = useState(false);

    // Timer states - 20 minutes countdown
    const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds
    const [timerActive, setTimerActive] = useState(false);
    const [autoCancel, setAutoCancel] = useState(false);

    // Notification modals
    const [showTimeoutModal, setShowTimeoutModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    
    // Points earned
    const [pointsEarned, setPointsEarned] = useState(0);
    const [pointsMessage, setPointsMessage] = useState('');

    const [qrCodeUrl, setQrCodeUrl] = useState(null);
    const [qrLoading, setQrLoading] = useState(false);
    const [qrError, setQrError] = useState(null);
    const [isTestQr, setIsTestQr] = useState(false);

    useEffect(() => {
        if (!orderId) {
            navigate('/cart');
            return;
        }
        fetchOrderDetails();
        fetchDeliveryStatus();
        // eslint-disable-next-line
    }, [orderId]);

    // Auto cancel logic - check if we should start the timer
    useEffect(() => {
        if (order && order.status === 'WAITING_PAYMENT') {
            setTimerActive(true);
            if (order.createdAt) {
                const orderTime = new Date(order.createdAt).getTime();
                const currentTime = new Date().getTime();
                const elapsedSeconds = Math.floor((currentTime - orderTime) / 1000);
                const timeoutSeconds = 20 * 60;
                if (elapsedSeconds < timeoutSeconds) {
                    setTimeLeft(timeoutSeconds - elapsedSeconds);
                } else {
                    setTimeLeft(0);
                    setAutoCancel(true);
                }
            }
        } else if (order && order.status === 'PAID') {
            setShowSuccessModal(true);
            setTimerActive(false);
            fetchPointsEarned(); // Fetch points earned when payment is successful
            setTimeout(() => {
                navigate(`/detail-delivery/${orderId}`);
            }, 2500);
        } else if (order && order.status === 'PREPARING') {
            setTimerActive(false);  
        }else {
            setTimerActive(false);
        }
    }, [order]);

    // Countdown timer
    useEffect(() => {
        let timer;
        if (timerActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prevTime => prevTime - 1);
            }, 1000);
        } else if (timeLeft === 0 && order?.status === 'WAITING_PAYMENT') {
            setAutoCancel(true);
        }
        return () => clearInterval(timer);
    }, [timerActive, timeLeft, order]);

    // Thêm hàm lấy QR code từ PayOS
    const fetchQRCode = async (orderId) => {
        const token = localStorage.getItem('token');
        if (!token || !orderId) return null;
        setQrLoading(true);
        setQrError(null);
        setIsTestQr(false);
        try {
            const response = await axios.get(`http://localhost:8080/api/orders/payment/qr/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const url = response.data;
            // Nhận diện PayOS URL
            if (url?.startsWith('https://pay.payos.vn/')) {
                setIsTestQr(false); // PayOS URL thật
            } else if (
                url?.includes('chart.googleapis.com') ||
                url?.startsWith('data:image/svg+xml')
            ) {
                setIsTestQr(true); // QR code test
            }
            setQrCodeUrl(url);
            setQrLoading(false);
            return url;
        } catch (error) {
            setQrError('Không thể lấy mã QR thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.');
            setQrLoading(false);
            setQrCodeUrl(null);
            setIsTestQr(false);
            return null;
        }
    };

    // Auto-cancel handler
    useEffect(() => {
        if (autoCancel && order?.status === 'WAITING_PAYMENT') {
            const performAutoCancel = async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) return;
                    const response = await axios.put(
                        `http://localhost:8080/api/orders/cancel/${orderId}`,
                        null,
                        {
                            params: { reason: 'Payment timeout - Order automatically cancelled' },
                            headers: { 'Authorization': `Bearer ${token}` }
                        }
                    );
                    setOrder(response.data);
                    setAutoCancel(false);
                    setTimerActive(false);
                    setShowTimeoutModal(true);
                } catch (error) {
                    console.error('Failed to auto-cancel order:', error);
                }
            };
            performAutoCancel();
        }
    }, [autoCancel, order, orderId]);

    const checkPaymentStatus = async () => {
        const token = localStorage.getItem('token');
        if (!token || !orderId) return;

        try {
            const response = await axios.get(`http://localhost:8080/api/orders/payment/status/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data.status;
        } catch (error) {
            console.error('Failed to check payment status:', error);
            return null;
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const fetchOrderDetails = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Please login to view your order.");
            navigate('/login/customer');
            return;
        }
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8080/api/orders/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setOrder(response.data);
            if (response.data.status === 'WAITING_PAYMENT') {
                await fetchQRCode(orderId);
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            if (error.response && error.response.status === 401) {
                // Token hết hạn, redirect về login
                localStorage.removeItem('token');
                setError("Session expired. Please login again.");
                navigate('/login/customer');
            } else if (error.response && error.response.status === 404) {
                navigate('/cart');
            } else {
                setError("Could not load order information. Please try again.");
            }
        }
    };

    const refreshOrderStatus = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token || !orderId) return;
        try {
            const response = await axios.get(`http://localhost:8080/api/orders/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setOrder(response.data);
            if (response.data.status !== 'WAITING_PAYMENT') {
                setTimerActive(false);
            }
        } catch (error) {
            console.error('Failed to refresh order status:', error);
        }
    }, [orderId]);

    const fetchPointsEarned = async () => {
        const token = localStorage.getItem('token');
        if (!token || !orderId) return;
        
        try {
            const response = await axios.get(`http://localhost:8080/api/orders/${orderId}/points-earned`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.data.isPaid) {
                setPointsEarned(response.data.pointsEarned);
                setPointsMessage(response.data.message);
            }
        } catch (error) {
            console.error('Failed to fetch points earned:', error);
        }
    };

    useEffect(() => {
        let statusChecker;
        if (order?.status === 'WAITING_PAYMENT') {
            statusChecker = setInterval(() => {
                refreshOrderStatus();
            }, 30000);
        }
        return () => clearInterval(statusChecker);
    }, [order, refreshOrderStatus]);

    const fetchDeliveryStatus = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await axios.get(`http://localhost:8080/api/orders/my/${orderId}/delivery-status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setDeliveryStatus(res.data);
        } catch (err) {
            setDeliveryStatus(null);
        }
    };

    const showCancelOrderModal = () => {
        setShowCancelModal(true);
        setCancelReason('');
        setCustomCancelReason('');
        setShowCancelReasonError(false);
    };
    const handleCancelReasonChange = (e) => {
        setCancelReason(e.target.value);
        setShowCancelReasonError(false);
        if (e.target.value !== 'OTHER') {
            setCustomCancelReason('');
        }
    };
    const handleCancelOrder = async () => {
        if (cancelling) return;
        if (cancelReason === '') {
            setShowCancelReasonError(true);
            return;
        }
        if (cancelReason === 'OTHER' && customCancelReason.trim() === '') {
            setShowCancelReasonError(true);
            return;
        }
        const finalReason = cancelReason === 'OTHER' ? customCancelReason : cancelReason;
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Please login to continue.");
            return;
        }
        try {
            setCancelling(true);
            const response = await axios.put(
                `http://localhost:8080/api/orders/cancel/${orderId}`,
                null,
                {
                    params: { reason: finalReason },
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            setCancelling(false);
            setShowCancelModal(false);
            setOrder(response.data);
        } catch (error) {
            setCancelling(false);
            showError(error.response?.data?.message || "Could not cancel order. Please try again.");
        }
    };
    const handleEditOrder = () => {
        localStorage.setItem('editingOrder', JSON.stringify(order));
        navigate(`/order/edit/${orderId}`);
    };

    // Đảm bảo không return sớm trước bất kỳ hook nào!
    let earlyReturn = null;
    if (loading) earlyReturn = <div className="payment-loading">Loading order information...</div>;
    if (error) earlyReturn = <div className="payment-error">{error}</div>;

    const getQrImageUrl = (url) => {
        if (!url) return null;
        return url.startsWith('http') ? url : `http://localhost:8080${url}`;
    };

    const getStatusDisplay = (status) => {
        switch (status) {
            case 'WAITING_PAYMENT': return 'Waiting for Payment';
            case 'PAID': return 'Paid';
            case 'PREPARING': return 'Preparing';
            case 'DELIVERING': return 'Delivering';
            case 'DELIVERED': return 'Delivered';
            case 'CANCELLED': return 'Cancelled';
            default: return status;
        }
    };

    const handleSuccessClose = () => {
        setShowSuccessModal(false);
        navigate('/order-history');
    };
    const handleTimeoutClose = () => {
        setShowTimeoutModal(false);
    };

    // useEffect tự động redirect đã được xóa để user có quyền kiểm soát

    return (
        earlyReturn ? earlyReturn : (
        <div className="payment-details-container">
            <div className="breadcrumb">
                <span onClick={() => navigate('/')}>Home</span>
                <span> • </span>
                <span onClick={() => navigate('/cart')}>Cart</span>
                <span> • </span>
                <span>Order Details</span>
            </div>

            <h1 className="payment-title">Order & Payment Details</h1>

            {order && (
                <div className="order-summary-section">
                    {order.status === 'WAITING_PAYMENT' && (
                        <div className="payment-timer">
                            <div className="timer-label">
                                <i className="timer-icon">⏱</i>
                                <span>Payment time remaining:</span>
                            </div>
                            <div className="timer-countdown">
                                <span className={timeLeft < 300 ? "time-critical" : ""}>
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                            <div className="timer-message">
                                Please complete your payment within the time limit.
                                Your order will be automatically cancelled if payment is not completed.
                            </div>
                        </div>
                    )}
                    <div className="order-header">
                        <div className="order-number">
                            <span className="order-label">Order Number:</span>
                            <span className="order-value">#{order.orderNumber}</span>
                        </div>
                        <div className="order-date">
                            <span className="order-label">Order Date:</span>
                            <span className="order-value">
                                {new Date(order.createdAt || Date.now()).toLocaleString('en-US', {
                                    year: 'numeric', month: '2-digit', day: '2-digit',
                                    hour: '2-digit', minute: '2-digit'
                                })}
                            </span>
                        </div>
                        <div className="order-status">
                            Status: <span className={`status-${order.status?.toLowerCase()}`}>
                                {getStatusDisplay(order.status)}
                            </span>
                        </div>
                    </div>
                    
                    {/* Customer and Delivery Information */}
                    <div className="customer-delivery-info">
                        <div className="customer-section">
                            <h4>Customer Information</h4>
                            <div className="info-row">
                                <span className="info-label">Name:</span>
                                <span className="info-value">{order.customer?.fullName || 'N/A'}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Phone:</span>
                                <span className="info-value">{order.customer?.phoneNumber || 'N/A'}</span>
                            </div>
                        </div>
                        
                        {order.deliveryAddress && (
                            <div className="delivery-section">
                                <h4>Delivery Information</h4>
                                <div className="info-row">
                                    <span className="info-label">Recipient:</span>
                                    <span className="info-value">{order.recipientName}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Delivery Phone:</span>
                                    <span className="info-value">{order.recipientPhone}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Address:</span>
                                    <span className="info-value">{order.deliveryAddress}</span>
                                </div>
                                {order.deliveryLatitude && order.deliveryLongitude && (
                                    <div className="info-row">
                                        <span className="info-label">Coordinates:</span>
                                        <span className="info-value">
                                            {order.deliveryLatitude}, {order.deliveryLongitude}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="order-items">
                        <h3>Ordered Items</h3>
                        <table className="order-items-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.foodList?.map(item => (
                                    <tr key={item.id} className="order-item-row">
                                        <td className="item-name-cell">{item.name || 'Unknown Item'}</td>
                                        <td className="item-price-cell">{Number(item.price).toLocaleString()} $</td>
                                        <td className="item-quantity-cell">{item.quantity}</td>
                                        <td className="item-total-cell">{Number(item.price * item.quantity).toLocaleString()} $</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="order-summary">
                            <div className="summary-row">
                                <span>Subtotal:</span>
                                <span>{Number(order.foodList?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0).toLocaleString()} $</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping Fee:</span>
                                <span>Free Shipping</span>
                            </div>
                            {order.voucherCode && order.voucherDiscount > 0 && (
                                <div className="summary-row voucher-discount">
                                    <span>Voucher Discount ({order.voucherCode}):</span>
                                    <span className="discount-amount">-{Number(order.voucherDiscount).toLocaleString()} $</span>
                                </div>
                            )}
                            <div className="order-total">
                                <span>Total:</span>
                                <span>{Number(order.totalPrice).toLocaleString()} $</span>
                            </div>
                        </div>
                    </div>
                    {order.note && (
                        <div className="order-note">
                            <h3>Order Notes</h3>
                            <p>{order.note}</p>
                        </div>
                    )}

                    {deliveryStatus && (
                        <div className="delivery-status-box">
                            <h3>Delivery Information</h3>
                            <p><b>Status:</b> {deliveryStatus.deliveryStatus || 'Updating...'}</p>
                            {deliveryStatus.deliveryNote && <p><b>Notes:</b> {deliveryStatus.deliveryNote}</p>}
                            <h4>Status History:</h4>
                            <ul>
                                {deliveryStatus.statusHistory?.map((h, idx) => (
                                    <li key={idx}>
                                        <b>{h.status}</b> - {h.note} ({new Date(h.changedAt).toLocaleString('en-US')}) {h.changedBy && `by ${h.changedBy}`}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* QR code section */}
            {order && order.status === 'WAITING_PAYMENT' && (
                <div className="payment-qr">
                    <h4>Scan QR Code to Pay</h4>
                    {qrLoading ? (
                        <div className="qr-loading">Đang lấy mã QR thanh toán...</div>
                    ) : qrError ? (
                        <div className="qr-error">{qrError}</div>
                    ) : qrCodeUrl ? (
                        qrCodeUrl.startsWith('https://pay.payos.vn/') ? (
                            <>
                                <div className="payos-redirect-box">
                                    <p>Nhấn nút bên dưới để tiến hành thanh toán qua PayOS</p>
                                    <button 
                                        onClick={() => {
                                            console.log("Payment button clicked, opening PayOS URL:", qrCodeUrl);
                                            window.open(qrCodeUrl, '_blank');
                                        }}
                                        className="pay-now-btn"
                                    >
                                        Tiến hành thanh toán
                                    </button>
                                </div>
                            </>
                        ) : (
                        <>
                    <img
                        src={qrCodeUrl}
                        alt="Payment QR Code"
                        className="payment-qr-image"
                        onError={e => {
                            e.target.onerror = null;
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlFSIENvZGU8L3RleHQ+PC9zdmc+';
                                    setIsTestQr(true);
                                }}
                            />
                            {isTestQr && (
                                <div className="qr-warning">
                                    <span style={{color: 'orange', fontWeight: 'bold'}}>CẢNH BÁO:</span> Đây chỉ là mã QR test, không dùng để thanh toán thật. Nếu bạn muốn thanh toán thật, hãy thử lại sau hoặc liên hệ hỗ trợ.
                                </div>
                            )}
                        </>
                        )
                    ) : null}
                </div>
            )}

            {order && order.status === 'WAITING_PAYMENT' && (
                <div className="payment-actions">
                    <button
                        className="edit-order-btn"
                        onClick={handleEditOrder}
                    >
                        Edit Order
                    </button>
                    <button
                        className="cancel-order-btn"
                        onClick={showCancelOrderModal}
                    >
                        Cancel Order
                    </button>
                </div>
            )}

            <button
                className="back-btn"
                onClick={() => navigate('/')}
            >
                Back to Home
            </button>

            {/* Cancel Order Modal */}
            {showCancelModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Cancel Order Confirmation</h3>
                            <button
                                className="modal-close"
                                onClick={() => setShowCancelModal(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="modal-content">
                            <p>Are you sure you want to cancel this order?</p>
                            <div className="form-group">
                                <label>Please select a reason for cancellation:</label>
                                <div className="cancel-reasons">
                                    <div className="reason-option">
                                        <input
                                            type="radio"
                                            id="reason-1"
                                            name="cancelReason"
                                            value="Changed my mind"
                                            checked={cancelReason === "Changed my mind"}
                                            onChange={handleCancelReasonChange}
                                        />
                                        <label htmlFor="reason-1">Changed my mind</label>
                                    </div>
                                    <div className="reason-option">
                                        <input
                                            type="radio"
                                            id="reason-2"
                                            name="cancelReason"
                                            value="Ordered by mistake"
                                            checked={cancelReason === "Ordered by mistake"}
                                            onChange={handleCancelReasonChange}
                                        />
                                        <label htmlFor="reason-2">Ordered by mistake</label>
                                    </div>
                                    <div className="reason-option">
                                        <input
                                            type="radio"
                                            id="reason-3"
                                            name="cancelReason"
                                            value="Delivery is too slow"
                                            checked={cancelReason === "Delivery is too slow"}
                                            onChange={handleCancelReasonChange}
                                        />
                                        <label htmlFor="reason-3">Delivery is too slow</label>
                                    </div>
                                    <div className="reason-option">
                                        <input
                                            type="radio"
                                            id="reason-4"
                                            name="cancelReason"
                                            value="Payment issue"
                                            checked={cancelReason === "Payment issue"}
                                            onChange={handleCancelReasonChange}
                                        />
                                        <label htmlFor="reason-4">Payment issue</label>
                                    </div>
                                    <div className="reason-option">
                                        <input
                                            type="radio"
                                            id="reason-other"
                                            name="cancelReason"
                                            value="OTHER"
                                            checked={cancelReason === "OTHER"}
                                            onChange={handleCancelReasonChange}
                                        />
                                        <label htmlFor="reason-other">Other reason</label>
                                    </div>
                                </div>
                                {cancelReason === "OTHER" && (
                                    <textarea
                                        value={customCancelReason}
                                        onChange={(e) => {
                                            setCustomCancelReason(e.target.value);
                                            setShowCancelReasonError(false);
                                        }}
                                        placeholder="Please specify your reason for cancellation"
                                        rows="3"
                                        className={showCancelReasonError ? "error-input" : ""}
                                    ></textarea>
                                )}
                                {showCancelReasonError && (
                                    <div className="error-message">
                                        {cancelReason === "OTHER"
                                            ? "Please enter your cancellation reason."
                                            : "Please select a cancellation reason."}
                                    </div>
                                )}
                            </div>
                            <div className="modal-actions">
                                <button
                                    className="modal-btn secondary"
                                    onClick={() => setShowCancelModal(false)}
                                    disabled={cancelling}
                                >
                                    No, keep my order
                                </button>
                                <button
                                    className="modal-btn danger"
                                    onClick={handleCancelOrder}
                                    disabled={cancelling}
                                >
                                    {cancelling ? 'Processing...' : 'Yes, cancel order'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Cancelled Due to Timeout Modal */}
            {showTimeoutModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Order Cancelled</h3>
                            <button className="modal-close" onClick={handleTimeoutClose}>
                                &times;
                            </button>
                        </div>
                        <div className="modal-content">
                            <div className="notification-icon error">
                                <i className="icon">⏱</i>
                            </div>
                            <h4 className="notification-title">Payment Time Expired</h4>
                            <p className="notification-message">
                                Your order has been automatically cancelled because the payment was not completed within the 20-minute time limit.
                            </p>
                            <div className="order-reference">
                                Order #: {order?.orderNumber}
                            </div>
                            <div className="modal-actions centered">
                                <button
                                    className="modal-btn primary"
                                    onClick={() => navigate('/cart')}
                                >
                                    Return to Cart
                                </button>
                                <button
                                    className="modal-btn secondary"
                                    onClick={handleTimeoutClose}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Success Modal */}
            {showSuccessModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Payment Successful</h3>
                            <button className="modal-close" onClick={handleSuccessClose}>
                                &times;
                            </button>
                        </div>
                        <div className="modal-content">
                            <div className="notification-icon success">
                                <div className="success-animation">
                                    <svg width="80" height="80" viewBox="0 0 80 80">
                                        <circle cx="40" cy="40" r="36" stroke="#4BB543" strokeWidth="4" fill="none" />
                                        <path d="M25 42 L37 54 L56 32" stroke="#4BB543" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                            <animate attributeName="stroke-dasharray" from="0,100" to="30,100" dur="0.5s" fill="freeze" />
                                        </path>
                                    </svg>
                                </div>
                            </div>
                            <h4 className="notification-title">Payment Successful!</h4>
                            <p className="notification-message">
                                Thank you for your payment. Your order has been paid and is now being prepared.
                            </p>
                            {pointsEarned > 0 && (
                                <div className="points-notification">
                                    <div className="points-icon">🎉</div>
                                    <div className="points-content">
                                        <h5 className="points-title">Points Earned!</h5>
                                        <p className="points-message">
                                            You earned <strong>{pointsEarned} points</strong> from this order!
                                        </p>
                                        <p className="points-detail">
                                            Order total: ${order?.totalPrice} = {pointsEarned} points
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="order-reference">
                                Order #: {order?.orderNumber}
                            </div>
                            <div className="modal-actions centered">
                                <button
                                    className="modal-btn primary"
                                    onClick={() => navigate('/')}
                                >
                                    Continue Shopping
                                </button>
                                <button
                                    className="modal-btn secondary"
                                    onClick={() => navigate('/order-history')}
                                >
                                    View Order History
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
        )
    );
};

export default PaymentDetails;
