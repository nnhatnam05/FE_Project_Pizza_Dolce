import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PaymentInvoice.css';

const PaymentInvoice = ({ tableId, onClose, onPaymentComplete }) => {
  const [table, setTable] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Get auth token from localStorage
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    loadInvoiceData();
  }, [tableId]);

  const loadInvoiceData = async () => {
    try {
      const headers = getAuthHeaders();
      
      const [tableRes, orderRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/tables/${tableId}`, { headers }),
        axios.get(`http://localhost:8080/api/dinein/table/${tableId}/current-order`)
      ]);
      
      setTable(tableRes.data);
      if (orderRes.data.hasActiveOrder) {
        setOrder(orderRes.data.order);
      }
    } catch (err) {
      console.error('Failed to load invoice data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!order) return;
    
    setProcessing(true);
    try {
      const headers = getAuthHeaders();
      
      // Update order status to PAID
      await axios.put(`http://localhost:8080/api/dinein/orders/${order.id}/status`, {
        status: 'PAID'
      }, { headers });
      
      // Update table status to AVAILABLE
      await axios.put(`http://localhost:8080/api/tables/${tableId}`, {
        ...table,
        status: 'AVAILABLE'
      }, { headers });
      
      // End table session
      await axios.post(`http://localhost:8080/api/dinein/table/${tableId}/end-session`, {}, { headers });
      
      alert('Payment confirmed successfully! Table is now available.');
      onPaymentComplete();
      onClose();
      
    } catch (err) {
      console.error('Failed to confirm payment:', err);
      alert('Failed to confirm payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const calculateSubtotal = () => {
    if (!order?.orderFoods) return 0;
    return order.orderFoods.reduce((sum, item) => 
      sum + (item.food.price * item.quantity), 0
    );
  };

  const calculateTax = (subtotal) => {
    return subtotal * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    return subtotal + tax;
  };

  if (loading) {
    return (
      <div className="payment-invoice-overlay">
        <div className="payment-invoice-modal">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading invoice...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="payment-invoice-overlay">
        <div className="payment-invoice-modal">
          <div className="error-container">
            <h3>❌ No Active Order</h3>
            <p>This table doesn't have an active order to pay for.</p>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);
  const total = calculateTotal();

  return (
    <div className="payment-invoice-overlay">
      <div className="payment-invoice-modal">
        {/* Invoice Header */}
        <div className="invoice-header">
          <div className="restaurant-info">
            <h2>🍽️ Restaurant Invoice</h2>
            <p>Table {table?.number} • {new Date().toLocaleDateString()}</p>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Order Details */}
        <div className="invoice-content">
          <div className="order-info">
            <h3>Order #{order.orderNumber}</h3>
            <p><strong>Status:</strong> <span className={`status-badge status-${order.status?.toLowerCase()}`}>{order.status}</span></p>
            <p><strong>Time:</strong> {new Date(order.createdAt).toLocaleString()}</p>
          </div>

          {/* Items List */}
          <div className="invoice-items">
            <h4>Order Items</h4>
            <div className="items-table">
              <div className="table-header">
                <span>Item</span>
                <span>Qty</span>
                <span>Price</span>
                <span>Total</span>
              </div>
              
              {order.orderFoods?.map((item, index) => (
                <div key={index} className="table-row">
                  <span className="item-name">{item.food.name}</span>
                  <span className="item-qty">{item.quantity}</span>
                  <span className="item-price">${item.food.price.toFixed(2)}</span>
                  <span className="item-total">${(item.food.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="invoice-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (10%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="summary-row total-row">
              <span><strong>Total:</strong></span>
              <span><strong>${total.toFixed(2)}</strong></span>
            </div>
          </div>
        </div>

        {/* Payment Actions */}
        <div className="invoice-actions">
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={processing}
          >
            Cancel
          </button>
          
          <button 
            className="btn btn-success" 
            onClick={handleConfirmPayment}
            disabled={processing}
          >
            {processing ? 'Processing...' : '✅ Confirm Payment & Clear Table'}
          </button>
        </div>

        {/* Payment Instructions */}
        <div className="payment-instructions">
          <p><strong>Instructions:</strong></p>
          <ol>
            <li>Present this bill to the customer</li>
            <li>Collect payment (cash/card)</li>
            <li>Click "Confirm Payment" to complete the transaction</li>
            <li>Table will be automatically set to Available</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PaymentInvoice; 