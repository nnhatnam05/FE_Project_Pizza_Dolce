import React, { useRef } from 'react';
import './BillDetailModal.css';

const BillDetailModal = ({ order, onClose }) => {
    const printRef = useRef();

    // Handle print
    const handlePrint = () => {
        const printContent = printRef.current;
        const originalContents = document.body.innerHTML;
        
        document.body.innerHTML = printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload(); // Reload to restore React functionality
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // Calculate subtotal
    const calculateSubtotal = () => {
        return order.orderFoods?.reduce((sum, item) => 
            sum + ((item.food?.price || 0) * item.quantity), 0
        ) || 0;
    };

    // Calculate tax (assuming 10% tax)
    const calculateTax = () => {
        return calculateSubtotal() * 0.1;
    };

    // Get status display
    const getStatusDisplay = (status) => {
        switch (status) {
            case 'PENDING': return { label: 'Pending Payment', class: 'pending' };
            case 'PAID': return { label: 'Paid - Preparing', class: 'paid' };
            case 'READY': return { label: 'Ready for Pickup', class: 'ready' };
            case 'COMPLETED': return { label: 'Completed', class: 'completed' };
            default: return { label: status, class: 'default' };
        }
    };

    const statusInfo = getStatusDisplay(order.status);
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const total = order.totalPrice || 0;

    return (
        <div className="bill-detail-overlay">
            <div className="bill-detail-modal">
                {/* Modal Header */}
                <div className="bill-modal-header">
                    <h2>Order Details & Receipt</h2>
                    <div className="header-actions">
                        <button className="print-btn" onClick={handlePrint}>
                            🖨️ Print Receipt
                        </button>
                        <button className="close-btn" onClick={onClose}>✕</button>
                    </div>
                </div>

                {/* Printable Content */}
                <div ref={printRef} className="bill-content">
                    {/* Restaurant Header */}
                    <div className="restaurant-header">
                        <h1>DELICIOUS RESTAURANT</h1>
                        <p>123 Food Street, Culinary District</p>
                        <p>Phone: (555) 123-4567 | Email: info@delicious.com</p>
                        <p>Tax ID: 123-456-789</p>
                        <div className="divider"></div>
                    </div>

                    {/* Order Information */}
                    <div className="order-info-section">
                        <div className="order-header-info">
                            <div className="order-details">
                                <h3>TAKE-AWAY ORDER</h3>
                                <p><strong>Order #:</strong> {order.orderNumber}</p>
                                <p><strong>Date:</strong> {formatDate(order.createdAt)}</p>
                                <p><strong>Status:</strong> 
                                    <span className={`status-badge ${statusInfo.class}`}>
                                        {statusInfo.label}
                                    </span>
                                </p>
                            </div>
                            
                            {/* Customer Information */}
                            {(order.recipientName || order.recipientPhone || order.customer) && (
                                <div className="customer-details">
                                    <h4>Customer Information</h4>
                                    {order.recipientName && (
                                        <p><strong>Name:</strong> {order.recipientName}</p>
                                    )}
                                    {order.recipientPhone && (
                                        <p><strong>Phone:</strong> {order.recipientPhone}</p>
                                    )}
                                    {order.customer && (
                                        <>
                                            <p><strong>Email:</strong> {order.customer.email}</p>
                                            {order.customer.customerDetail?.point && (
                                                <p><strong>Loyalty Points:</strong> {order.customer.customerDetail.point}</p>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="divider"></div>

                    {/* Order Items */}
                    <div className="items-section">
                        <h4>Order Items</h4>
                        <table className="items-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Qty</th>
                                    <th>Unit Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.orderFoods?.map((orderFood, index) => (
                                    <tr key={index}>
                                        <td className="item-name">
                                            {orderFood.food?.name || 'Unknown Item'}
                                            {orderFood.food?.description && (
                                                <div className="item-description">
                                                    {orderFood.food.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className="quantity">{orderFood.quantity}</td>
                                        <td className="unit-price">
                                            ${(orderFood.food?.price || 0).toFixed(2)}
                                        </td>
                                        <td className="item-total">
                                            ${((orderFood.food?.price || 0) * orderFood.quantity).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="divider"></div>

                    {/* Payment Summary */}
                    <div className="payment-summary">
                        <div className="summary-row">
                            <span>Subtotal:</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Tax (10%):</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="summary-row total-row">
                            <span><strong>Total Amount:</strong></span>
                            <span><strong>${total.toFixed(2)}</strong></span>
                        </div>
                        
                        {order.paymentMethod && (
                            <div className="payment-method-info">
                                <p><strong>Payment Method:</strong> 
                                    {order.paymentMethod === 'CASH' ? ' Cash' : ' Bank Transfer'}
                                </p>
                                {order.paymentMethod === 'QR_BANKING' && order.billImageUrl && (
                                    <p><strong>Payment Proof:</strong> Attached</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Points Information */}
                    {order.customer && order.status === 'COMPLETED' && (
                        <>
                            <div className="divider"></div>
                            <div className="points-section">
                                <h4>Loyalty Points</h4>
                                <p>Points Earned: <strong>{Math.floor(total / 10.0) * 10} points</strong></p>
                                <p>Thank you for your loyalty!</p>
                            </div>
                        </>
                    )}

                    {/* Footer */}
                    <div className="receipt-footer">
                        <div className="divider"></div>
                        <p className="thank-you">Thank you for choosing Delicious Restaurant!</p>
                        <p className="footer-note">Please keep this receipt for your records.</p>
                        <p className="footer-note">For any inquiries, please contact us within 24 hours.</p>
                        
                        {/* QR Code for feedback (optional) */}
                        <div className="feedback-section">
                            <p>Scan to leave feedback:</p>
                            <div className="qr-placeholder">
                                [QR Code for Feedback]
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Actions (not printed) */}
                <div className="bill-modal-actions no-print">
                    <button className="action-btn secondary" onClick={onClose}>
                        Close
                    </button>
                    <button className="action-btn primary" onClick={handlePrint}>
                        🖨️ Print Receipt
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BillDetailModal; 