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
        
        try {
            const date = new Date(dateTime);
            if (isNaN(date.getTime())) return 'Invalid date';
            
            const now = new Date();
            const diffTime = date.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) return 'Expired';
            if (diffDays === 0) return 'Expires today';
            if (diffDays === 1) return 'Expires tomorrow';
            if (diffDays <= 7) return `Expires in ${diffDays} days`;
            
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    const getTypeLabel = (type) => {
        const types = {
            'PERCENTAGE': 'Giảm theo %',
            'FIXED_AMOUNT': 'Giảm số tiền cố định',
            'FREE_ITEM': 'Tặng nước bất kì'
        };
        return types[type] || type;
    };

    const getDiscountText = (voucher) => {
        switch (voucher.type) {
            case 'PERCENTAGE':
                return `${voucher.value}% OFF`;
            case 'FIXED_AMOUNT':
                return `$${voucher.value} OFF`;
            case 'FREE_ITEM':
                return 'TẶNG NƯỚC';
            default:
                return voucher.type;
        }
    };

    const getVoucherIcon = (type) => {
        switch (type) {
            case 'PERCENTAGE':
                return '🎯';
            case 'FIXED_AMOUNT':
                return '💰';
            case 'FREE_ITEM':
                return '🥤';
            default:
                return '🎫';
        }
    };

    const getVoucherColor = (type) => {
        switch (type) {
            case 'PERCENTAGE':
                return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            case 'FIXED_AMOUNT':
                return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
            case 'FREE_ITEM':
                return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
            default:
                return 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
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
                    <div className="loading-animation">
                        <div className="loading-circle"></div>
                        <div className="loading-circle"></div>
                        <div className="loading-circle"></div>
                    </div>
                    <h3>Loading your vouchers...</h3>
                    <p>Please wait while we fetch your amazing deals</p>
                </div>
            </div>
        );
    }

    return (
        <div className="customer-vouchers-container">
            <div className="vouchers-hero">
                <div className="hero-content">
                    <h1>🎫 My Vouchers</h1>
                    <p>Discover and manage your exclusive discount vouchers</p>
                </div>
                <div className="hero-stats">
                    <div className="stat-item">
                        <span className="stat-number">{myVouchers.length}</span>
                        <span className="stat-label">My Vouchers</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">{publicVouchers.length}</span>
                        <span className="stat-label">Available</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    <span className="alert-icon">⚠️</span>
                    {error}
                </div>
            )}
            {success && (
                <div className="alert alert-success">
                    <span className="alert-icon">✅</span>
                    {success}
                </div>
            )}

            <div className="vouchers-tabs">
                <button 
                    className={`tab-button ${activeTab === 'my-vouchers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('my-vouchers')}
                >
                    <span className="tab-icon">🎁</span>
                    <span className="tab-text">My Collection</span>
                    <span className="tab-count">({myVouchers.length})</span>
                </button>
                <button 
                    className={`tab-button ${activeTab === 'public-vouchers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('public-vouchers')}
                >
                    <span className="tab-icon">🌟</span>
                    <span className="tab-text">Available Now</span>
                    <span className="tab-count">({publicVouchers.length})</span>
                </button>
            </div>

            <div className="vouchers-content">
                {activeTab === 'my-vouchers' && (
                    <div className="vouchers-grid">
                        {myVouchers.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🎫</div>
                                <h3>No vouchers yet</h3>
                                <p>You don't have any vouchers in your collection yet. Start building your savings!</p>
                                <button 
                                    className="btn-primary"
                                    onClick={() => setActiveTab('public-vouchers')}
                                >
                                    <span className="btn-icon">🌟</span>
                                    Browse Available Vouchers
                                </button>
                            </div>
                        ) : (
                            myVouchers.map(voucher => (
                                <div key={voucher.id} className={`voucher-card ${isVoucherExpired(voucher.expiresAt) ? 'expired' : ''}`}>
                                    <div className="voucher-header" style={{ background: getVoucherColor(voucher.type) }}>
                                        <div className="voucher-icon">{getVoucherIcon(voucher.type)}</div>
                                        <div className="voucher-discount">
                                            {getDiscountText(voucher)}
                                        </div>
                                        {isVoucherExpired(voucher.expiresAt) && (
                                            <div className="expired-badge">
                                                <span className="badge-icon">⏰</span>
                                                EXPIRED
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="voucher-body">
                                        <h3 className="voucher-name">{voucher.name}</h3>
                                        <p className="voucher-description">{voucher.description}</p>
                                        
                                        <div className="voucher-details">
                                            <div className="detail-row">
                                                <div className="detail-item">
                                                    <span className="detail-icon">🏷️</span>
                                                    <span className="detail-label">Type</span>
                                                    <span className="detail-value">{getTypeLabel(voucher.type)}</span>
                                                </div>
                                                {voucher.minOrderAmount && (
                                                    <div className="detail-item">
                                                        <span className="detail-icon">💰</span>
                                                        <span className="detail-label">Min Order</span>
                                                        <span className="detail-value">${voucher.minOrderAmount}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="detail-row">
                                                {voucher.maxDiscountAmount && (
                                                    <div className="detail-item">
                                                        <span className="detail-icon">🎯</span>
                                                        <span className="detail-label">Max Discount</span>
                                                        <span className="detail-value">${voucher.maxDiscountAmount}</span>
                                                    </div>
                                                )}
                                                <div className="detail-item">
                                                    <span className="detail-icon">⏰</span>
                                                    <span className="detail-label">Expires</span>
                                                    <span className="detail-value">{formatDateTime(voucher.expiresAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="voucher-footer">
                                        <div className="voucher-code-section">
                                            <div className="code-display">
                                                <span className="code-label">Voucher Code</span>
                                                <div className="code-container">
                                                    <span className="voucher-code">{voucher.code}</span>
                                                    <button 
                                                        className="copy-button"
                                                        onClick={() => copyVoucherCode(voucher.code)}
                                                        disabled={isVoucherExpired(voucher.expiresAt)}
                                                        title="Copy voucher code"
                                                    >
                                                        <span className="copy-icon">📋</span>
                                                    </button>
                                                </div>
                                            </div>
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
                            <div className="empty-state">
                                <div className="empty-icon">🎁</div>
                                <h3>No public vouchers available</h3>
                                <p>There are currently no public vouchers available. Check back later for amazing deals!</p>
                            </div>
                        ) : (
                            publicVouchers.map(voucher => (
                                <div key={voucher.id} className={`voucher-card public ${!voucher.isAvailable ? 'unavailable' : ''}`}>
                                    <div className="voucher-header" style={{ background: getVoucherColor(voucher.type) }}>
                                        <div className="voucher-icon">{getVoucherIcon(voucher.type)}</div>
                                        <div className="voucher-discount">
                                            {getDiscountText(voucher)}
                                        </div>
                                        <div className="public-badge">
                                            <span className="badge-icon">🌟</span>
                                            PUBLIC
                                        </div>
                                        {!voucher.isAvailable && (
                                            <div className="unavailable-badge">
                                                <span className="badge-icon">❌</span>
                                                UNAVAILABLE
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="voucher-body">
                                        <h3 className="voucher-name">{voucher.name}</h3>
                                        <p className="voucher-description">{voucher.description}</p>
                                        
                                        <div className="voucher-details">
                                            <div className="detail-row">
                                                <div className="detail-item">
                                                    <span className="detail-icon">🏷️</span>
                                                    <span className="detail-label">Type</span>
                                                    <span className="detail-value">{getTypeLabel(voucher.type)}</span>
                                                </div>
                                                {voucher.minOrderAmount && (
                                                    <div className="detail-item">
                                                        <span className="detail-icon">💰</span>
                                                        <span className="detail-label">Min Order</span>
                                                        <span className="detail-value">${voucher.minOrderAmount}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="detail-row">
                                                {voucher.maxDiscountAmount && (
                                                    <div className="detail-item">
                                                        <span className="detail-icon">🎯</span>
                                                        <span className="detail-label">Max Discount</span>
                                                        <span className="detail-value">${voucher.maxDiscountAmount}</span>
                                                    </div>
                                                )}
                                                <div className="detail-item">
                                                    <span className="detail-icon">📊</span>
                                                    <span className="detail-label">Remaining</span>
                                                    <span className="detail-value">{voucher.remainingQuantity}/{voucher.totalQuantity}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="detail-row">
                                                <div className="detail-item">
                                                    <span className="detail-icon">⏰</span>
                                                    <span className="detail-label">Expires</span>
                                                    <span className="detail-value">{formatDateTime(voucher.expiresAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="voucher-footer">
                                        <div className="voucher-code-section">
                                            <div className="code-display">
                                                <span className="code-label">Voucher Code</span>
                                                <div className="code-container">
                                                    <span className="voucher-code">{voucher.code}</span>
                                                    <button 
                                                        className="copy-button"
                                                        onClick={() => copyVoucherCode(voucher.code)}
                                                        disabled={!voucher.isAvailable}
                                                        title="Copy voucher code"
                                                    >
                                                        <span className="copy-icon">📋</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="voucher-actions">
                                            <button 
                                                className="claim-button"
                                                onClick={() => claimVoucher(voucher.code)}
                                                disabled={!voucher.isAvailable}
                                            >
                                                <span className="claim-icon">🎁</span>
                                                Claim Voucher
                                            </button>
                                        </div>
                                        
                                        <div className="voucher-note">
                                            <span className="note-icon">💡</span>
                                            Click "Claim" to add this voucher to your collection
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