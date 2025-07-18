import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Payment.css';

export default function List_Payment() {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);


  const fetchPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/payment-methods', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(res.data);
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const confirmDelete = (payment) => {
    setPaymentToDelete(payment);
    setShowConfirmation(true);
  };

  const cancelDelete = () => {
    setPaymentToDelete(null);
    setShowConfirmation(false);
  };

  const deletePayment = async () => {
    if (!paymentToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/payment-methods/delete/${paymentToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowConfirmation(false);
      setPaymentToDelete(null);
      fetchPayments();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed!');
    }
  };

  const filteredPayments = payments.filter(pm =>
    pm.name.toLowerCase().includes(filter.toLowerCase())
  );

  const renderConfirmationDialog = () => {
    if (!showConfirmation) return null;
    
    return (
      <div className="confirmation-dialog-overlay" onClick={cancelDelete}>
        <div className="confirmation-dialog" onClick={(e) => e.stopPropagation()}>
          <div className="confirmation-dialog-title">Delete confirmation</div>
          <div className="confirmation-dialog-content">
            Are you sure you want to delete payment method <strong>{paymentToDelete?.name}</strong>?
            <br />
            This action cannot be undone.
          </div>
          <div className="confirmation-dialog-actions">
            <button className="btn-cancel" onClick={cancelDelete}>Cancel</button>
            <button className="btn-confirm" onClick={deletePayment}>Delete</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="payment-list-container">
      <div className="payment-list-header">
        <h2>Payment Method List</h2>
        <Link to="/admin/payment-methods/create" className="add-payment-btn">+ Add Payment Method</Link>
      </div>
      <div className="payment-list-filters">
        <input
          type="text"
          placeholder="Search by name..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="search-input"
        />
      </div>
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <div>Loading data...</div>
        </div>
      ) : (
        <>
          {filteredPayments.length > 0 ? (
            <table className="payment-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Transfer Content</th>
                  <th>QR Image</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((pm, idx) => (
                  <tr key={pm.id}>
                    <td>{idx + 1}</td>
                    <td>{pm.name}</td>
                    <td>{pm.paymentContent || '-'}</td>
                    <td>
                      {pm.qrImageUrl ? (
                        <img
                          src={`http://localhost:8080${pm.qrImageUrl}`}
                          alt="QR"
                          className="qr-img"
                          onClick={() => window.open(`http://localhost:8080${pm.qrImageUrl}`, '_blank')}
                        />
                      ) : 'No image'}
                    </td>
                    <td>{pm.description || '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/admin/payment-methods/edit/${pm.id}`} className="action-btn edit-btn" title="Edit">✏️</Link>
                        <button onClick={() => confirmDelete(pm)} className="action-btn delete-btn" title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-text">No payment method found</div>
              <Link to="/admin/payment-methods/create" className="add-payment-btn">+ Add new payment method</Link>
            </div>
          )}
        </>
      )}
      {renderConfirmationDialog()}
    </div>
  );
}
