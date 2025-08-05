import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TableMenu from './TableMenu';
import './TableOrder.css';

const TableOrder = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableId = searchParams.get('table');
  
  const [table, setTable] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCallStaff, setShowCallStaff] = useState(false);
  const [callReason, setCallReason] = useState('');

  useEffect(() => {
    if (!tableId) {
      setError('Invalid table QR code');
      setLoading(false);
      return;
    }
    
    loadTableInfo();
    loadCurrentOrder();
  }, [tableId]);

  const loadTableInfo = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/dinein/table/${tableId}`);
      setTable(response.data);
    } catch (err) {
      console.error('Failed to load table info:', err);
      setError('Table not found or invalid QR code');
    }
  };

  const loadCurrentOrder = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/dinein/table/${tableId}/current-order`);
      if (response.data.hasActiveOrder) {
        setCurrentOrder(response.data.order);
      }
    } catch (err) {
      console.error('Failed to load current order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCallStaff = async () => {
    if (!callReason.trim()) {
      alert('Please select a reason for calling staff');
      return;
    }

    try {
      await axios.post(`http://localhost:8080/api/dinein/table/${tableId}/call-staff`, {
        reason: callReason
      });
      alert('Staff has been notified and will assist you shortly!');
      setShowCallStaff(false);
      setCallReason('');
    } catch (err) {
      console.error('Failed to call staff:', err);
      alert('Failed to call staff. Please try again.');
    }
  };

  const handleRequestPayment = async () => {
    if (!currentOrder) {
      alert('No active order to pay for');
      return;
    }

    try {
      await axios.post(`http://localhost:8080/api/dinein/table/${tableId}/request-payment`);
      alert('Payment request sent to staff. They will bring the bill to your table shortly!');
    } catch (err) {
      console.error('Failed to request payment:', err);
      alert('Failed to request payment. Please try again or call staff.');
    }
  };

  const handleOrderUpdate = (updatedOrder) => {
    setCurrentOrder(updatedOrder);
  };

  if (loading) {
    return (
      <div className="table-order-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading table information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="table-order-container">
        <div className="error-container">
          <h2>❌ Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="table-order-container">
      {/* Table Header */}
      <div className="table-header">
        <div className="table-info">
          <h1>🍽️ Table {table?.number}</h1>
          <p className="table-location">{table?.location || 'Restaurant Table'}</p>
          <p className="table-capacity">Capacity: {table?.capacity} persons</p>
        </div>
        
        <div className="table-actions">
          <button 
            className="btn btn-outline"
            onClick={() => setShowCallStaff(true)}
          >
            🔔 Call Staff
          </button>
          
          {currentOrder && (
            <button 
              className="btn btn-success"
              onClick={handleRequestPayment}
            >
              💳 Request Payment
            </button>
          )}
        </div>
      </div>

      {/* Current Order Summary */}
      {currentOrder && (
        <div className="current-order-summary">
          <h3>📋 Current Order</h3>
          <div className="order-details">
            <p><strong>Order #:</strong> {currentOrder.orderNumber}</p>
            <p><strong>Status:</strong> <span className={`status-badge status-${currentOrder.status?.toLowerCase() || 'new'}`}>{currentOrder.status || 'NEW'}</span></p>
            <p><strong>Total:</strong> ${currentOrder.totalPrice?.toFixed(2)}</p>
            <p><strong>Items:</strong> {currentOrder.orderFoods?.length || 0} items</p>
          </div>
        </div>
      )}

      {/* Menu Component */}
      <TableMenu 
        tableId={tableId}
        currentOrder={currentOrder}
        onOrderUpdate={handleOrderUpdate}
      />

      {/* Call Staff Modal */}
      {showCallStaff && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>🔔 Call Staff</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCallStaff(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <p>What do you need assistance with?</p>
              <div className="call-reasons">
                <label className="reason-option">
                  <input 
                    type="radio" 
                    name="callReason" 
                    value="Need assistance with order"
                    checked={callReason === 'Need assistance with order'}
                    onChange={(e) => setCallReason(e.target.value)}
                  />
                  Need assistance with order
                </label>
                
                <label className="reason-option">
                  <input 
                    type="radio" 
                    name="callReason" 
                    value="Request extra items"
                    checked={callReason === 'Request extra items'}
                    onChange={(e) => setCallReason(e.target.value)}
                  />
                  Request extra items (napkins, water, etc.)
                </label>
                
                <label className="reason-option">
                  <input 
                    type="radio" 
                    name="callReason" 
                    value="Ready to pay"
                    checked={callReason === 'Ready to pay'}
                    onChange={(e) => setCallReason(e.target.value)}
                  />
                  Ready to pay
                </label>
                
                <label className="reason-option">
                  <input 
                    type="radio" 
                    name="callReason" 
                    value="General assistance"
                    checked={callReason === 'General assistance'}
                    onChange={(e) => setCallReason(e.target.value)}
                  />
                  General assistance
                </label>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn btn-primary"
                onClick={handleCallStaff}
                disabled={!callReason}
              >
                📞 Call Staff
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => setShowCallStaff(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableOrder; 