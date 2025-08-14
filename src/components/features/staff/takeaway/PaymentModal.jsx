import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../../contexts/NotificationContext';
import './PaymentModal.css';

const PaymentModal = ({ order, onClose, onPaymentSuccess }) => {
    const { showSuccess, showError } = useNotification();
    
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [billImage, setBillImage] = useState(null);
    const [billPreview, setBillPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    // Add body class to prevent scroll when modal is open
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        
        return () => {
            document.body.style.overflow = originalOverflow || 'unset';
        };
    }, []);

    // Handle bill image upload
    const handleBillImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBillImage(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => setBillPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    // Confirm payment
    const handleConfirmPayment = async () => {
        if (paymentMethod === 'QR_BANKING' && !billImage) {
            showError('Please take a photo of the transfer bill');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('paymentMethod', paymentMethod);
            
            if (billImage) {
                formData.append('billImage', billImage);
            }

            const response = await axios.put(
                `http://localhost:8080/api/takeaway/${order.id}/payment`,
                formData,
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    } 
                }
            );

            onPaymentSuccess(response.data);
            showSuccess('Payment has been confirmed!');

        } catch (error) {
            console.error('Failed to confirm payment:', error);
            if (error.response?.data) {
                showError(error.response.data);
            } else {
                showError('Cannot confirm payment');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payment-modal-overlay" onClick={(e) => e.target === e.currentTarget && !loading && onClose()}>
            <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Confirm Payment</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-content">
                    {/* Order Summary */}
                    <div className="order-summary">
                        <h4>Order: {order.orderNumber}</h4>
                        <div className="summary-details">
                            <div className="summary-row">
                                <span>Total Amount:</span>
                                <span className="amount">${(order.totalPrice || 0).toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Number of Items:</span>
                                <span>{order.orderFoods?.length || 0} items</span>
                            </div>
                            {order.recipientName && (
                                <div className="summary-row">
                                    <span>Customer:</span>
                                    <span>{order.recipientName}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="payment-method-section">
                        <h4>Payment Method</h4>
                        <div className="payment-options">
                            <label className="payment-option">
                                <input
                                    type="radio"
                                    value="CASH"
                                    checked={paymentMethod === 'CASH'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <div className="option-content">
                                    <span className="option-icon">💵</span>
                                    <span className="option-label">Cash</span>
                                </div>
                            </label>
                            
                            <label className="payment-option">
                                <input
                                    type="radio"
                                    value="QR_BANKING"
                                    checked={paymentMethod === 'QR_BANKING'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <div className="option-content">
                                    <span className="option-icon">📱</span>
                                    <span className="option-label">QR Bank Transfer</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* QR Banking Section */}
                    {paymentMethod === 'QR_BANKING' && (
                        <div className="qr-banking-section">
                            <div className="qr-display">
                                <h4>Payment QR Code</h4>
                                <div className="qr-image-container">
                                    <img 
                                        src="/images/QR-BILL.png" 
                                        alt="Payment QR Code"
                                        className="qr-image"
                                    />
                                </div>
                                <p className="qr-instruction">
                                    Customer scans QR code and transfers <strong>${(order.totalPrice || 0).toFixed(2)}</strong>
                                </p>
                            </div>

                            <div className="bill-upload">
                                <h4>Upload Payment Receipt</h4>
                                <div className="upload-area">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleBillImageChange}
                                        className="file-input"
                                        id="bill-upload"
                                    />
                                    <label htmlFor="bill-upload" className="upload-label">
                                        📷 Choose Receipt Image
                                    </label>
                                </div>
                                
                                {billPreview && (
                                    <div className="bill-preview">
                                        <img src={billPreview} alt="Bill preview" />
                                        <button 
                                            className="remove-preview"
                                            onClick={() => {
                                                setBillImage(null);
                                                setBillPreview(null);
                                            }}
                                        >
                                            🗑️ Remove
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button 
                        className="cancel-btn"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button 
                        className="confirm-btn"
                        onClick={handleConfirmPayment}
                        disabled={loading || (paymentMethod === 'QR_BANKING' && !billImage)}
                    >
                        {loading ? 'Processing...' : '✅ Confirm Payment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal; 