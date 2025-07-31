import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orderId, setOrderId] = useState(null);

    const status = searchParams.get('status');
    const orderCode = searchParams.get('orderCode');

    useEffect(() => {
        if (status === 'success' && orderCode) {
            // Tìm order theo orderCode từ backend
            const findOrderByOrderCode = async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        setLoading(false);
                        return;
                    }

                    const response = await axios.get(`http://localhost:8080/api/orders/payment/find-by-ordercode`, {
                        params: { orderCode: orderCode },
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    const orderData = response.data;
                    setOrderId(orderData.orderId);
                    setOrderDetails({
                        orderCode: orderCode,
                        orderId: orderData.orderId,
                        orderNumber: orderData.orderNumber,
                        status: orderData.status,
                        totalPrice: orderData.totalPrice,
                        message: 'Thanh toán thành công!'
                    });
                } catch (error) {
                    console.error('Error finding order:', error);
                    setOrderDetails({
                        orderCode: orderCode,
                        status: 'PAID',
                        message: 'Thanh toán thành công! (Không thể tìm thông tin chi tiết)'
                    });
                } finally {
                    setLoading(false);
                }
            };

            findOrderByOrderCode();
        } else {
            setOrderDetails({
                orderCode: orderCode,
                status: 'FAILED',
                message: 'Thanh toán thất bại!'
            });
            setLoading(false);
        }
    }, [status, orderCode]);

    const handleContinueShopping = () => {
        navigate('/');
    };

    const handleViewOrders = () => {
        navigate('/order-history');
    };

    const handleViewDelivery = () => {
        // Chuyển đến detail-delivery nếu có orderId
        if (orderId) {
            navigate(`/detail-delivery/${orderId}`);
        } else {
            // Fallback: chuyển đến order-history
            navigate('/order-history');
        }
    };

    if (loading) {
        return (
            <div className="payment-success-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Đang xử lý kết quả thanh toán...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-success-container">
            <div className="success-card">
                {status === 'success' ? (
                    <>
                        <div className="success-icon">
                            <svg width="80" height="80" viewBox="0 0 80 80">
                                <circle cx="40" cy="40" r="36" stroke="#4BB543" strokeWidth="4" fill="none" />
                                <path d="M25 42 L37 54 L56 32" stroke="#4BB543" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <animate attributeName="stroke-dasharray" from="0,100" to="30,100" dur="0.5s" fill="freeze" />
                                </path>
                            </svg>
                        </div>
                        <h1>Thanh toán thành công!</h1>
                        <p className="success-message">
                            Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị.
                        </p>
                        {orderDetails && (
                            <div className="order-info">
                                <p><strong>Mã đơn hàng:</strong> {orderDetails.orderNumber || orderDetails.orderCode}</p>
                                <p><strong>Trạng thái:</strong> Đã thanh toán</p>
                                {orderDetails.totalPrice && (
                                    <p><strong>Tổng tiền:</strong> {Number(orderDetails.totalPrice).toLocaleString()} $</p>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className="error-icon">
                            <svg width="80" height="80" viewBox="0 0 80 80">
                                <circle cx="40" cy="40" r="36" stroke="#dc3545" strokeWidth="4" fill="none" />
                                <path d="M25 25 L55 55 M55 25 L25 55" stroke="#dc3545" strokeWidth="4" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h1>Thanh toán thất bại!</h1>
                        <p className="error-message">
                            Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.
                        </p>
                        {orderDetails && (
                            <div className="order-info">
                                <p><strong>Mã đơn hàng:</strong> {orderDetails.orderCode}</p>
                                <p><strong>Trạng thái:</strong> Thanh toán thất bại</p>
                            </div>
                        )}
                    </>
                )}
                
                <div className="action-buttons">
                    <button 
                        className="continue-shopping-btn"
                        onClick={handleContinueShopping}
                    >
                        Tiếp tục mua sắm
                    </button>
                    <button 
                        className="view-delivery-btn"
                        onClick={handleViewDelivery}
                    >
                        Xem trạng thái giao hàng
                    </button>
                    <button 
                        className="view-orders-btn"
                        onClick={handleViewOrders}
                    >
                        Xem thông tin đơn hàng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;