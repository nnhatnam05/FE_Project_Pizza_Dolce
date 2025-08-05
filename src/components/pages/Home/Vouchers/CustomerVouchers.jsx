import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CustomerVouchers.css';

const CustomerVouchers = () => {
    const [myVouchers, setMyVouchers] = useState([]);
    const [publicVouchers, setPublicVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('my-vouchers');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please login to view vouchers');
                setLoading(false);
                return;
            }

            // Fetch my vouchers
            const myVouchersResponse = await axios.get('http://localhost:8080/api/customer/vouchers/my-vouchers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMyVouchers(myVouchersResponse.data);

            // Fetch public vouchers
            const publicVouchersResponse = await axios.get('http://localhost:8080/api/customer/vouchers/public', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setPublicVouchers(publicVouchersResponse.data);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching vouchers:', error);
            setError('Failed to fetch vouchers');
            setLoading(false);
        }
    };

    const formatDateTime = (dateTime) => {
        if (!dateTime) return 'No expiry';
        return new Date(dateTime).toLocaleString();
    };

    const getTypeLabel = (type) => {
        const types = {
            'PERCENTAGE': 'Giảm theo %',
            'FIXED_AMOUNT': 'Giảm số tiền cố định',
            'FREE_SHIPPING': 'Miễn phí ship',
            'BUY_ONE_GET_ONE': 'Mua 1 tặng 1',
            'FREE_ITEM': 'Tặng món'
        };
        return types[type] || type;
    };

    const getDiscountText = (voucher) => {
        switch (voucher.type) {
            case 'PERCENTAGE':
                return `${voucher.value}% OFF`;
            case 'FIXED_AMOUNT':
                return `$${voucher.value} OFF`;
            case 'FREE_SHIPPING':
                return 'FREE SHIPPING';
            default:
                return voucher.type;
        }
    };

    const copyVoucherCode = (code) => {
        navigator.clipboard.writeText(code);
        setSuccess(`Voucher code ${code} copied to clipboard!`);
        setTimeout(() => setSuccess(''), 3000);
    };

    const claimVoucher = async (voucherCode) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`http://localhost:8080/api/customer/vouchers/claim/${voucherCode}`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                setSuccess(response.data.message);
                fetchVouchers(); // Refresh vouchers
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError('Failed to claim voucher: ' + (error.response?.data?.message || error.message));
        }
    };

    const isVoucherExpired = (expiresAt) => {
        if (!expiresAt) return false;
        return new Date() > new Date(expiresAt);
    };

    if (loading) {
        return (
            <div className="customer-vouchers-container">
                <div className="vouchers-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading your vouchers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="customer-vouchers-container">
            <div className="vouchers-header">
                <h1>My Vouchers</h1>
                <p>Manage and use your discount vouchers</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="vouchers-tabs">
                <button 
                    className={`tab-button ${activeTab === 'my-vouchers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('my-vouchers')}
                >
                    My Vouchers ({myVouchers.length})
                </button>
                <button 
                    className={`tab-button ${activeTab === 'public-vouchers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('public-vouchers')}
                >
                    Available Vouchers ({publicVouchers.length})
                </button>
            </div>

            <div className="vouchers-content">
                {activeTab === 'my-vouchers' && (
                    <div className="vouchers-grid">
                        {myVouchers.length === 0 ? (
                            <div className="no-vouchers">
                                <div className="no-vouchers-icon">🎫</div>
                                <h3>No vouchers yet</h3>
                                <p>You don't have any vouchers. Check out available vouchers to get started!</p>
                                <button 
                                    className="btn-primary"
                                    onClick={() => setActiveTab('public-vouchers')}
                                >
                                    Browse Available Vouchers
                                </button>
                            </div>
                        ) : (
                            myVouchers.map(voucher => (
                                <div key={voucher.id} className={`voucher-card ${isVoucherExpired(voucher.expiresAt) ? 'expired' : ''}`}>
                                    <div className="voucher-header">
                                        <div className="voucher-discount">
                                            {getDiscountText(voucher)}
                                        </div>
                                        {isVoucherExpired(voucher.expiresAt) && (
                                            <div className="expired-badge">EXPIRED</div>
                                        )}
                                    </div>
                                    
                                    <div className="voucher-body">
                                        <h3 className="voucher-name">{voucher.name}</h3>
                                        <p className="voucher-description">{voucher.description}</p>
                                        
                                        <div className="voucher-details">
                                            <div className="detail-item">
                                                <span className="label">Type:</span>
                                                <span className="value">{getTypeLabel(voucher.type)}</span>
                                            </div>
                                            {voucher.minOrderAmount && (
                                                <div className="detail-item">
                                                    <span className="label">Min Order:</span>
                                                    <span className="value">${voucher.minOrderAmount}</span>
                                                </div>
                                            )}
                                            {voucher.maxDiscountAmount && (
                                                <div className="detail-item">
                                                    <span className="label">Max Discount:</span>
                                                    <span className="value">${voucher.maxDiscountAmount}</span>
                                                </div>
                                            )}
                                            <div className="detail-item">
                                                <span className="label">Expires:</span>
                                                <span className="value">{formatDateTime(voucher.expiresAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="voucher-footer">
                                        <div className="voucher-code-section">
                                            <span className="code-label">Code:</span>
                                            <span className="voucher-code">{voucher.code}</span>
                                            <button 
                                                className="copy-button"
                                                onClick={() => copyVoucherCode(voucher.code)}
                                                disabled={isVoucherExpired(voucher.expiresAt)}
                                            >
                                                📋 Copy
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'public-vouchers' && (
                    <div className="vouchers-grid">
                        {publicVouchers.length === 0 ? (
                            <div className="no-vouchers">
                                <div className="no-vouchers-icon">🎁</div>
                                <h3>No public vouchers available</h3>
                                <p>There are currently no public vouchers available. Check back later!</p>
                            </div>
                        ) : (
                            publicVouchers.map(voucher => (
                                <div key={voucher.id} className={`voucher-card public ${!voucher.isAvailable ? 'unavailable' : ''}`}>
                                    <div className="voucher-header">
                                        <div className="voucher-discount">
                                            {getDiscountText(voucher)}
                                        </div>
                                        <div className="public-badge">PUBLIC</div>
                                        {!voucher.isAvailable && (
                                            <div className="unavailable-badge">UNAVAILABLE</div>
                                        )}
                                    </div>
                                    
                                    <div className="voucher-body">
                                        <h3 className="voucher-name">{voucher.name}</h3>
                                        <p className="voucher-description">{voucher.description}</p>
                                        
                                        <div className="voucher-details">
                                            <div className="detail-item">
                                                <span className="label">Type:</span>
                                                <span className="value">{getTypeLabel(voucher.type)}</span>
                                            </div>
                                            {voucher.minOrderAmount && (
                                                <div className="detail-item">
                                                    <span className="label">Min Order:</span>
                                                    <span className="value">${voucher.minOrderAmount}</span>
                                                </div>
                                            )}
                                            {voucher.maxDiscountAmount && (
                                                <div className="detail-item">
                                                    <span className="label">Max Discount:</span>
                                                    <span className="value">${voucher.maxDiscountAmount}</span>
                                                </div>
                                            )}
                                            <div className="detail-item">
                                                <span className="label">Remaining:</span>
                                                <span className="value">{voucher.remainingQuantity}/{voucher.totalQuantity}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">Expires:</span>
                                                <span className="value">{formatDateTime(voucher.expiresAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="voucher-footer">
                                        <div className="voucher-code-section">
                                            <span className="code-label">Code:</span>
                                            <span className="voucher-code">{voucher.code}</span>
                                            <button 
                                                className="copy-button"
                                                onClick={() => copyVoucherCode(voucher.code)}
                                                disabled={!voucher.isAvailable}
                                            >
                                                📋 Copy
                                            </button>
                                            <button 
                                                className="claim-button"
                                                onClick={() => claimVoucher(voucher.code)}
                                                disabled={!voucher.isAvailable}
                                            >
                                                🎁 Claim
                                            </button>
                                        </div>
                                        <div className="voucher-note">
                                            <small>Note: Click "Claim" to add this voucher to your collection</small>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerVouchers; 