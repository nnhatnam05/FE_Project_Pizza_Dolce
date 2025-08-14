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
    const [pointsEarned, setPointsEarned] = useState(0);
    const [pointsMessage, setPointsMessage] = useState('');

    const status = searchParams.get('status');
    const orderCode = searchParams.get('orderCode');

    const fetchPointsEarned = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !orderId) return;
            
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
                        message: 'Payment successful!'
                    });
                    
                    // Fetch points earned
                    if (orderData.orderId) {
                        fetchPointsEarned(orderData.orderId);
                    }
                } catch (error) {
                    console.error('Error finding order:', error);
                    setOrderDetails({
                        orderCode: orderCode,
                        status: 'PAID',
                        message: 'Payment successful! (Could not find details)'
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
                message: 'Payment failed!'
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
                    <p>Processing payment result...</p>
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
                        <h1>Payment Successful!</h1>
                        <div className="success-message">
                            <p>Thank you for your payment. Your order has been confirmed and is being prepared.</p>
                        </div>
                        {orderDetails && (
                            <div className="order-info">
                                <p><strong>Order Code:</strong> {orderDetails.orderCode}</p>
                                <p><strong>Status:</strong> Paid</p>
                                {orderDetails.totalPrice && (
                                    <p><strong>Total Price:</strong> {Number(orderDetails.totalPrice).toLocaleString()} $</p>
                                )}
                            </div>
                        )}
                        
                        {pointsEarned > 0 && (
                            <div className="points-notification">
                                <div className="points-icon">🎉</div>
                                <div className="points-content">
                                    <h3 className="points-title">Congratulations! You have earned reward points!</h3>
                                    <div className="points-info">
                                        <p>You have earned <strong>{pointsEarned} points</strong> from this order!</p>
                                    </div>
                                    <p className="points-detail">
                                        Rule: 10$ = 10 points (rounded down)
                                    </p>
                                </div>
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
                        <h1>Payment Failed!</h1>
                        <div className="error-message">
                            <p>An error occurred during payment. Please try again or contact support.</p>
                        </div>
                        {orderDetails && (
                            <div className="order-info">
                                <p><strong>Order Code:</strong> {orderDetails.orderCode}</p>
                                <p><strong>Status:</strong> Payment Failed</p>
                            </div>
                        )}
                    </>
                )}
                
                <div className="action-buttons">
                    <button 
                        className="continue-shopping-btn"
                        onClick={handleContinueShopping}
                    >
                        Continue shopping
                    </button>
                    <button 
                        className="view-delivery-btn"
                        onClick={handleViewDelivery}
                    >
                        View delivery status
                    </button>
                    <button 
                        className="view-orders-btn"
                        onClick={handleViewOrders}
                    >
                        View order details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;