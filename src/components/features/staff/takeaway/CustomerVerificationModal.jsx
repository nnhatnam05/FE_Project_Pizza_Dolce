import React, { useState } from 'react';
import axios from 'axios';
import { useNotification } from '../../../../contexts/NotificationContext';
import './CustomerVerificationModal.css';

const CustomerVerificationModal = ({ onClose, onCustomerVerified, onCreateNewCustomer }) => {
    const { showSuccess, showError } = useNotification();
    
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [step, setStep] = useState('input'); // 'input', 'result'

    // Validate email format
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Handle email verification
    const handleVerifyEmail = async () => {
        if (!email.trim()) {
            showError('Please enter an email address');
            return;
        }

        if (!validateEmail(email.trim())) {
            showError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:8080/api/takeaway/customer/verify',
                { email: email.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setVerificationResult(response.data);
            setStep('result');

        } catch (error) {
            console.error('Failed to verify customer:', error);
            if (error.response?.data?.message) {
                showError(error.response.data.message);
            } else {
                showError('Failed to verify customer email');
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle use verified customer
    const handleUseCustomer = () => {
        if (verificationResult?.success && verificationResult?.customer) {
            onCustomerVerified({
                email: verificationResult.customer.email,
                name: verificationResult.customer.fullName,
                phone: '', // Phone not returned from verification
                customerId: verificationResult.customer.id,
                currentPoints: verificationResult.customer.currentPoints
            });
            onClose();
        }
    };

    // Handle create new account
    const handleCreateNew = () => {
        onClose();
        onCreateNewCustomer();
    };

    // Handle back to input
    const handleBackToInput = () => {
        setStep('input');
        setVerificationResult(null);
    };

    // Handle key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && step === 'input' && !loading) {
            handleVerifyEmail();
        }
    };

    return (
        <div className="customer-verification-overlay">
            <div className="customer-verification-modal">
                <div className="modal-header">
                    <h3>🎁 Customer Loyalty Points</h3>
                    <button className="close-btn" onClick={onClose} disabled={loading}>✕</button>
                </div>

                {step === 'input' && (
                    <div className="modal-content">
                        <div className="verification-section">
                            <div className="points-info">
                                <div className="points-icon">🎁</div>
                                <h4>Earn Loyalty Points!</h4>
                                <p>Enter customer email to check for existing account and earn points from this order.</p>
                                <div className="points-rule">
                                    <small>💡 Rule: Every $10 = 10 points (rounded down)</small>
                                </div>
                            </div>
                            
                            <div className="email-input-section">
                                <label htmlFor="customer-email">Customer Email</label>
                                <input
                                    id="customer-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="customer@example.com"
                                    className="email-input"
                                    disabled={loading}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button 
                                className="action-btn secondary"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Skip (No Points)
                            </button>
                            <button 
                                className="action-btn primary"
                                onClick={handleVerifyEmail}
                                disabled={loading || !email.trim()}
                            >
                                {loading ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        🔍 Verify Email
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {step === 'result' && verificationResult && (
                    <div className="modal-content">
                        {verificationResult.success ? (
                            // Customer found
                            <div className="verification-success">
                                <div className="success-icon">✅</div>
                                <h4>Customer Found!</h4>
                                <div className="customer-info">
                                    <p><strong>Name:</strong> {verificationResult.customer.fullName}</p>
                                    <p><strong>Email:</strong> {verificationResult.customer.email}</p>
                                    <p><strong>Current Points:</strong> {verificationResult.customer.currentPoints} points</p>
                                </div>
                                <div className="points-preview">
                                    <p>🎁 This customer will earn points when the order is completed!</p>
                                </div>
                            </div>
                        ) : (
                            // Customer not found
                            <div className="verification-failed">
                                <div className="warning-icon">⚠️</div>
                                <h4>Account Not Found</h4>
                                <p>{verificationResult.message}</p>
                                <div className="create-account-prompt">
                                    <p>Would you like to create a new customer account for <strong>{email}</strong>?</p>
                                </div>
                            </div>
                        )}

                        <div className="modal-actions">
                            <button 
                                className="action-btn secondary"
                                onClick={handleBackToInput}
                            >
                                ← Back
                            </button>
                            
                            {verificationResult.success ? (
                                <button 
                                    className="action-btn primary"
                                    onClick={handleUseCustomer}
                                >
                                    ✅ Use This Customer
                                </button>
                            ) : (
                                <button 
                                    className="action-btn primary"
                                    onClick={handleCreateNew}
                                >
                                    👤 Create New Account
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerVerificationModal; 