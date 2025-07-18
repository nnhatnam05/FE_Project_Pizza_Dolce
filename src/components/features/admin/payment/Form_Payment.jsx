import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './Payment.css';

export default function Form_Payment() {
  const [form, setForm] = useState({
    name: '',
    paymentContent: '',
    description: '',
  });
  const [qrImage, setQrImage] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      setLoading(true);
      const token = localStorage.getItem('token');
      axios.get(`http://localhost:8080/api/payment-methods/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setForm({
            name: res.data.name,
            paymentContent: res.data.paymentContent || '',
            description: res.data.description || '',
          });
          if (res.data.qrImageUrl) {
            setQrPreview(`http://localhost:8080${res.data.qrImageUrl}`);
          }
        })
        .catch((error) => {
          console.error('Error fetching payment method:', error);
          setMessage('Payment method not found!');
          setMessageType('error');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Clear message when user starts typing
    if (message) {
      setMessage('');
    }
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        setMessage('Please select a valid image file');
        setMessageType('error');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('File size must not exceed 5MB');
        setMessageType('error');
        return;
      }

      setQrImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setQrPreview(reader.result);
      reader.readAsDataURL(file);

      // Clear message
      setMessage('');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Validate form
    if (!form.name.trim()) {
      setMessage('Payment method name is required!');
      setMessageType('error');
      return;
    }

    setSubmitting(true);
    setMessage('');
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('paymentContent', form.paymentContent || '');
    formData.append('description', form.description || '');
    if (qrImage) formData.append('qrImage', qrImage);

    const token = localStorage.getItem('token');
    try {
      if (id) {
        await axios.put(`http://localhost:8080/api/payment-methods/update/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setMessage('Payment method updated successfully!');
        setMessageType('success');
      } else {
        await axios.post('http://localhost:8080/api/payment-methods/create', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setMessage('Payment method created successfully!');
        setMessageType('success');
      }

      // Redirect after success
      setTimeout(() => navigate('/admin/payment-methods'), 1500);
    } catch (error) {
      console.error('Error saving payment method:', error);

      // Handle specific error cases
      if (error.response) {
        const status = error.response.status;
        if (status === 400) {
          setMessage('Invalid data. Please check the information.');
        } else if (status === 401 || status === 403) {
          setMessage('You do not have permission to perform this action.');
        } else {
          setMessage('An error occurred while saving data. Please try again later.');
        }
      } else {
        setMessage('Cannot connect to server. Please check your network connection.');
      }

      setMessageType('error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-form-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <div>Loading data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-form-container">
      <h2>{id ? 'Edit Payment Method' : 'Add New Payment Method'}</h2>

      {message && (
        <div className={`message ${messageType === 'success' ? 'success-message' : 'error-message'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-group">
          <label htmlFor="name">Payment Method Name <span className="required">*</span></label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter payment method name"
            required
          />
          <small>Example: Bank Transfer, Cash, Momo, ZaloPay...</small>
        </div>

        <div className="form-group">
          <label htmlFor="paymentContent">Transfer Content</label>
          <input
            type="text"
            id="paymentContent"
            name="paymentContent"
            value={form.paymentContent}
            onChange={handleChange}
            placeholder="Enter transfer content (if any)"
          />
          <small>Account number, account holder, bank branch, etc.</small>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter payment method description"
            rows="3"
          />
          <small>Additional information about the payment method</small>
        </div>

        <div className="form-group">
          <label>QR Image (optional)</label>
          {qrPreview && (
            <div className="qr-preview">
              <img src={qrPreview} alt="QR Preview" />
              <button 
                type="button" 
                className="remove-image-btn"
                onClick={() => {
                  setQrImage(null);
                  setQrPreview(null);
                }}
              >
                ×
              </button>
            </div>
          )}

          <div className="file-upload-container">
            <input
              type="file"
              id="qr-image"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />
            <label htmlFor="qr-image" className="file-upload-label">
              {qrPreview ? 'Change QR Image' : 'Choose QR Image'}
            </label>
            <small>Supported formats: JPG, PNG, GIF (max 5MB)</small>
          </div>
        </div>

        <div className="form-actions">
          <Link to="/admin/payment-methods" className="btn-cancel">Cancel</Link>
          <button 
            type="submit" 
            disabled={submitting}
            className={submitting ? 'btn-submitting' : ''}
          >
            {submitting ? (
              <>
                <span className="spinner-small"></span>
                <span>Processing...</span>
              </>
            ) : (
              id ? 'Update Payment Method' : 'Create Payment Method'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
