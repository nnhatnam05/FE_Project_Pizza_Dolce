import React, { useState } from 'react';
import axios from 'axios';
import { useNotification } from '../../../../contexts/NotificationContext';
import './CustomerModal.css';

const CustomerModal = ({ onClose, onCustomerCreated }) => {
    const { showSuccess, showError } = useNotification();
    
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Handle input change
    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        if (formData.phone.trim() && !/^[0-9]{10,11}$/.test(formData.phone.trim())) {
            newErrors.phone = 'Invalid phone number (10-11 digits)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Create customer
    const handleCreateCustomer = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:8080/api/takeaway/customer/create',
                {
                    email: formData.email.trim(),
                    fullName: formData.fullName.trim(),
                    phone: formData.phone.trim() || null
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            onCustomerCreated(response.data);
            showSuccess(`Account ${formData.email} created successfully!`);

        } catch (error) {
            console.error('Failed to create customer:', error);
            if (error.response?.data) {
                showError(error.response.data);
            } else {
                showError('Failed to create customer account');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="customer-modal-overlay">
            <div className="customer-modal">
                <div className="modal-header">
                    <h3>Create New Customer Account</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-content">
                    <div className="form-section">
                        <div className="form-group">
                            <label htmlFor="email">
                                Email <span className="required">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                placeholder="customer@example.com"
                                className={errors.email ? 'error' : ''}
                            />
                            {errors.email && (
                                <span className="error-message">{errors.email}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="fullName">
                                Full Name <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                value={formData.fullName}
                                onChange={(e) => handleChange('fullName', e.target.value)}
                                placeholder="John Doe"
                                className={errors.fullName ? 'error' : ''}
                            />
                            {errors.fullName && (
                                <span className="error-message">{errors.fullName}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input
                                type="tel"
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                placeholder="0123456789"
                                className={errors.phone ? 'error' : ''}
                            />
                            {errors.phone && (
                                <span className="error-message">{errors.phone}</span>
                            )}
                        </div>

                        <div className="info-note">
                            <div className="note-icon">ℹ️</div>
                            <div className="note-content">
                                <p><strong>Note:</strong></p>
                                <ul>
                                    <li>Account will be created with temporary password: <code>temp123</code></li>
                                    <li>Customer can change password after first login</li>
                                    <li>Email will be used for loyalty points and notifications</li>
                                </ul>
                            </div>
                        </div>
                    </div>
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
                        className="create-btn"
                        onClick={handleCreateCustomer}
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : '👤 Create Account'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerModal; 