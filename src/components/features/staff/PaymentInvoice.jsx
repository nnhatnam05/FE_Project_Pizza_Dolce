import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../contexts/NotificationContext';
import './PaymentInvoice.css';

const PaymentInvoice = ({ tableId, onClose, onPaymentComplete }) => {
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { showSuccess, showError } = useNotification();

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
      
      // Get detailed bill for the table
      const billRes = await axios.get(`http://localhost:8080/api/dinein/tables/${tableId}/bill`, { headers });
      setBill(billRes.data);
    } catch (err) {
      console.error('Failed to load bill data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!bill) return;
    
    setProcessing(true);
    try {
      const headers = getAuthHeaders();
      
      // Confirm payment for the table (this will mark all orders as PAID and reset table status)
      await axios.post(`http://localhost:8080/api/dinein/tables/${tableId}/confirm-payment`, {}, { headers });
      
      showSuccess(`Payment confirmed successfully! Table ${bill.tableNumber} is now available.`);
      onPaymentComplete();
      onClose();
      
    } catch (err) {
      console.error('Failed to confirm payment:', err);
      showError('Failed to confirm payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const calculateSubtotal = () => {
    if (!bill?.items) return 0;
    return bill.items.reduce((sum, item) => sum + item.totalPrice, 0);
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

  if (!bill) {
    return (
      <div className="payment-invoice-overlay">
        <div className="payment-invoice-modal">
          <div className="error-container">
            <h3>❌ No Active Orders</h3>
            <p>This table doesn't have any active orders to pay for.</p>
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
            <h2>🍽️ Pizza Dolce Bill</h2>
            <p>Table {bill.tableNumber} • {new Date().toLocaleDateString()}</p>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Bill Details */}
        <div className="invoice-content">
          <div className="order-info">
            <h3>Bill Summary</h3>
            <p><strong>Total Orders:</strong> {bill.ordersCount} orders</p>
            <p><strong>Total Items:</strong> {bill.itemsCount} items</p>
            <p><strong>Generated:</strong> {new Date(bill.generatedAt).toLocaleString()}</p>
          </div>

          {/* Items List */}
          <div className="invoice-items">
            <h4>All Items</h4>
            <div className="items-table">
              <div className="table-header">
                <span>Item</span>
                <span>Order</span>
                <span>Qty</span>
                <span>Unit Price</span>
                <span>Total</span>
              </div>
              
              {bill.items?.map((item, index) => (
                <div key={index} className="table-row">
                  <span className="item-name">{item.foodName}</span>
                  <span className="item-order">#{item.orderNumber}</span>
                  <span className="item-qty">{item.quantity}</span>
                  <span className="item-price">${item.unitPrice.toFixed(2)}</span>
                  <span className="item-total">${item.totalPrice.toFixed(2)}</span>
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
            <img src="/images/QR-BILL.png" alt="QR Code"  className='qr-bill'/>
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