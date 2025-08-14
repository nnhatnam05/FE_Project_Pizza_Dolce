import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../../contexts/NotificationContext';
import './OrderCreationForm.css';

const OrderCreationForm = ({ onOrderCreated, onCreateCustomer }) => {
    const { showSuccess, showError } = useNotification();
    
    // State management
    const [selectedItems, setSelectedItems] = useState([]);
    const [customerInfo, setCustomerInfo] = useState({
        email: '',
        name: '',
        phone: '',
        customerId: null,
        currentPoints: 0,
        verified: false
    });
    const [foods, setFoods] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [foodsLoading, setFoodsLoading] = useState(true);
    const [verificationStep, setVerificationStep] = useState('none'); // 'none', 'input', 'result'
    const [verificationEmail, setVerificationEmail] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [verificationLoading, setVerificationLoading] = useState(false);

    // Load foods and categories
    useEffect(() => {
        loadFoods();
        loadCategories();
    }, []);

    const loadFoods = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/foods');
            setFoods(response.data);
        } catch (error) {
            console.error('Failed to load foods:', error);
            showError('Failed to load menu items');
        } finally {
            setFoodsLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to load categories:', error);
            // Fallback: extract categories from foods
            const uniqueTypes = [...new Set(foods.map(food => food.type).filter(type => type))];
            const categoryOptions = uniqueTypes.map(type => ({
                id: type,
                name: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
            }));
            setCategories(categoryOptions);
        }
    };

    // Filter foods
    const filteredFoods = foods.filter(food => {
        const matchesCategory = selectedCategory === 'all' || food.type === selectedCategory;
        const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            food.description?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Add item to order
    const addToOrder = (food) => {
        const existingItem = selectedItems.find(item => item.id === food.id);
        if (existingItem) {
            setSelectedItems(prev => prev.map(item =>
                item.id === food.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setSelectedItems(prev => [...prev, { ...food, quantity: 1 }]);
        }
    };

    // Update item quantity
    const updateQuantity = (foodId, newQuantity) => {
        if (newQuantity <= 0) {
            setSelectedItems(prev => prev.filter(item => item.id !== foodId));
        } else {
            setSelectedItems(prev => prev.map(item =>
                item.id === foodId
                    ? { ...item, quantity: newQuantity }
                    : item
            ));
        }
    };

    // Calculate totals
    const calculateSubtotal = () => {
        return selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const calculateTax = () => {
        return calculateSubtotal() * 0.1; // 10% tax
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax();
    };

    const calculateEstimatedPoints = () => {
        if (!customerInfo.verified) return 0;
        return Math.floor(calculateTotal() / 10.0) * 10;
    };

    // Handle verify customer button
    const handleVerifyCustomer = () => {
        setVerificationStep('input');
        setVerificationEmail('');
        setVerificationResult(null);
    };

    // Handle inline email verification
    const handleInlineVerifyEmail = async () => {
        if (!verificationEmail.trim()) {
            showError('Please enter an email address');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(verificationEmail.trim())) {
            showError('Please enter a valid email address');
            return;
        }

        setVerificationLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:8080/api/takeaway/customer/verify',
                { email: verificationEmail.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setVerificationResult(response.data);
            setVerificationStep('result');

        } catch (error) {
            console.error('Failed to verify customer:', error);
            if (error.response?.data?.message) {
                showError(error.response.data.message);
            } else {
                showError('Failed to verify customer email');
            }
        } finally {
            setVerificationLoading(false);
        }
    };

    // Handle use verified customer
    const handleUseVerifiedCustomer = () => {
        if (verificationResult?.success && verificationResult?.customer) {
            setCustomerInfo({
                email: verificationResult.customer.email,
                name: verificationResult.customer.fullName,
                phone: '',
                customerId: verificationResult.customer.id,
                currentPoints: verificationResult.customer.currentPoints,
                verified: true
            });
            setVerificationStep('none');
            showSuccess(`Customer ${verificationResult.customer.fullName} verified successfully!`);
        }
    };

    // Handle cancel verification
    const handleCancelVerification = () => {
        setVerificationStep('none');
        setVerificationEmail('');
        setVerificationResult(null);
    };

    // Handle customer verified from modal
    const handleCustomerVerified = (customer) => {
        setCustomerInfo({
            ...customer,
            verified: true
        });
        showSuccess(`Customer ${customer.name} verified successfully!`);
    };

    // Clear customer info
    const clearCustomerInfo = () => {
        setCustomerInfo({
            email: '',
            name: '',
            phone: '',
            customerId: null,
            currentPoints: 0,
            verified: false
        });
        setVerificationStep('none');
        setVerificationEmail('');
        setVerificationResult(null);
    };

    // Submit order
    const handleSubmitOrder = async () => {
        if (selectedItems.length === 0) {
            showError('Please add items to your order');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const orderData = {
                items: selectedItems.map(item => ({
                    foodId: item.id,
                    quantity: item.quantity
                })),
                customerName: customerInfo.name || null,
                customerPhone: customerInfo.phone || null,
                customerEmail: customerInfo.verified ? customerInfo.email : null
            };

            const response = await axios.post(
                'http://localhost:8080/api/takeaway',
                orderData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Reset form
            setSelectedItems([]);
            setCustomerInfo({ 
                email: '', 
                name: '', 
                phone: '', 
                customerId: null, 
                currentPoints: 0, 
                verified: false 
            });
            setVerificationStep('none');
            setVerificationEmail('');
            setVerificationResult(null);
            setSearchTerm('');
            setSelectedCategory('all');

            onOrderCreated(response.data);

        } catch (error) {
            console.error('Failed to create order:', error);
            if (error.response?.data) {
                showError(error.response.data);
            } else {
                showError('Failed to create order');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="order-creation-container">
            {/* Top Section - 2 Columns */}
            <div className="top-section">
                {/* Left Column - Customer Loyalty Points */}
                <div className="customer-section">
                    <h3>🎁 Customer Loyalty Points</h3>
                    
                    {verificationStep === 'none' && !customerInfo.verified && (
                        <div className="customer-verification">
                            <div className="verification-prompt">
                                <div className="prompt-icon">🎁</div>
                                <div className="prompt-content">
                                    <h4>Earn Loyalty Points!</h4>
                                    <p>Verify customer email to earn points from this order.</p>
                                    <div className="points-rule">
                                        <small>💡 Rule: Every $10 = 10 points (rounded down)</small>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="verification-actions">
                                <button 
                                    type="button" 
                                    className="verify-customer-btn primary"
                                    onClick={handleVerifyCustomer}
                                >
                                    🔍 Verify Customer Email
                                </button>

                            </div>
                        </div>
                    )}

                    {verificationStep === 'input' && (
                        <div className="inline-verification">
                            <div className="verification-header">
                                <h4>🔍 Verify Customer Email</h4>
                                <button 
                                    className="cancel-verification"
                                    onClick={handleCancelVerification}
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <div className="email-input-group">
                                <input
                                    type="email"
                                    value={verificationEmail}
                                    onChange={(e) => setVerificationEmail(e.target.value)}
                                    placeholder="customer@example.com"
                                    className="verification-email-input"
                                    disabled={verificationLoading}
                                    autoFocus
                                />
                                <button 
                                    className="verify-btn"
                                    onClick={handleInlineVerifyEmail}
                                    disabled={verificationLoading || !verificationEmail.trim()}
                                >
                                    {verificationLoading ? 'Verifying...' : 'Verify'}
                                </button>
                            </div>
                        </div>
                    )}

                    {verificationStep === 'result' && verificationResult && (
                        <div className="verification-result">
                            {verificationResult.success ? (
                                <div className="result-success">
                                    <div className="result-header">
                                        <div className="success-icon">✅</div>
                                        <h4>Customer Found!</h4>
                                        <button 
                                            className="cancel-verification"
                                            onClick={handleCancelVerification}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div className="customer-info">
                                        <p><strong>Name:</strong> {verificationResult.customer.fullName}</p>
                                        <p><strong>Email:</strong> {verificationResult.customer.email}</p>
                                        <p><strong>Current Points:</strong> {verificationResult.customer.currentPoints} points</p>
                                    </div>
                                    <button 
                                        className="use-customer-btn"
                                        onClick={handleUseVerifiedCustomer}
                                    >
                                        ✅ Use This Customer
                                    </button>
                                </div>
                            ) : (
                                <div className="result-failed">
                                    <div className="result-header">
                                        <div className="warning-icon">⚠️</div>
                                        <h4>Account Not Found</h4>
                                        <button 
                                            className="cancel-verification"
                                            onClick={handleCancelVerification}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <p>{verificationResult.message}</p>
                                    <div className="result-actions">
                                        <button 
                                            className="back-btn"
                                            onClick={() => setVerificationStep('input')}
                                        >
                                            ← Try Again
                                        </button>
                                        <button 
                                            className="create-new-btn"
                                            onClick={() => {
                                                handleCancelVerification();
                                                onCreateCustomer();
                                            }}
                                        >
                                            👤 Create New Account
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {customerInfo.verified && (
                        <div className="customer-verified">
                            <div className="verified-header">
                                <div className="verified-icon">✅</div>
                                <h4>Customer Verified</h4>
                                <button 
                                    className="clear-customer-btn"
                                    onClick={clearCustomerInfo}
                                    title="Clear customer info"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <div className="customer-details">
                                <div className="detail-row">
                                    <span className="label">Name:</span>
                                    <span className="value">{customerInfo.name}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Email:</span>
                                    <span className="value">{customerInfo.email}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Current Points:</span>
                                    <span className="value points">{customerInfo.currentPoints} pts</span>
                                </div>
                                <div className="detail-row estimated-points">
                                    <span className="label">Points from this order:</span>
                                    <span className="value points">+{calculateEstimatedPoints()} pts</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Order Summary */}
                <div className={`order-summary-section ${selectedItems.length > 3 ? 'has-many-items' : selectedItems.length === 0 ? 'empty-summary' : 'has-few-items'}`}>
                    <h3>📋 Order Summary ({selectedItems.length} items)</h3>
                    
                    {selectedItems.length === 0 ? (
                        <div className="empty-order">
                            <div className="empty-icon">🛒</div>
                            <p>No items selected</p>
                            <small>Add items from the menu below</small>
                        </div>
                    ) : (
                        <div className="order-items">
                            {selectedItems.map(item => (
                                <div key={item.id} className="order-item">
                                    <div className="item-info">
                                        <div className="item-name">{item.name}</div>
                                        <div className="item-price">${item.price?.toFixed(2)}</div>
                                    </div>
                                    
                                    <div className="quantity-controls">
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="qty-btn"
                                        >
                                            -
                                        </button>
                                        <span className="quantity">{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="qty-btn"
                                        >
                                            +
                                        </button>
                                    </div>
                                    
                                    <div className="item-total">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                            
                            <div className="order-totals">
                                <div className="total-row">
                                    <span>Subtotal:</span>
                                    <span>${calculateSubtotal().toFixed(2)}</span>
                                </div>
                                <div className="total-row">
                                    <span>Tax (10%):</span>
                                    <span>${calculateTax().toFixed(2)}</span>
                                </div>
                                <div className="total-row final">
                                    <span><strong>Total:</strong></span>
                                    <span><strong>${calculateTotal().toFixed(2)}</strong></span>
                                </div>
                            </div>
                            
                            <button 
                                className="submit-order-btn"
                                onClick={handleSubmitOrder}
                                disabled={loading}
                            >
                                {loading ? 'Creating Order...' : '🛒 Create Order'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Section - Menu Items */}
            <div className="menu-section">
                <h3>🍽️ Menu Items</h3>
                
                {/* Search and Category Filter */}
                <div className="menu-controls">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search menu items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    
                    <div className="category-filter">
                        <button 
                            className={selectedCategory === 'all' ? 'active' : ''}
                            onClick={() => setSelectedCategory('all')}
                        >
                            All Items
                        </button>
                        {categories.map(category => (
                            <button
                                key={category.id}
                                className={selectedCategory === category.id ? 'active' : ''}
                                onClick={() => setSelectedCategory(category.id)}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Food Grid */}
                {foodsLoading ? (
                    <div className="menu-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading menu...</p>
                    </div>
                ) : (
                    <div className="food-grid">
                        {filteredFoods.map(food => (
                            <div key={food.id} className={`food-card ${food.status === 'UNAVAILABLE' ? 'sold-out' : ''}`}>
                                <div className="food-image">
                                    {food.imageUrl ? (
                                        <img 
                                            src={food.imageUrl.startsWith('http') ? food.imageUrl : `http://localhost:8080${food.imageUrl}`} 
                                            alt={food.name}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className="no-image" style={{ display: food.imageUrl ? 'none' : 'flex' }}>
                                        🍽️
                                    </div>
                                    {food.status === 'UNAVAILABLE' && (
                                        <div className="sold-out-badge">
                                            <span>Sold Out</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="food-info">
                                    <h3>{food.name}</h3>
                                    <p className="food-description">{food.description}</p>
                                    <div className="food-price">${food.price?.toFixed(2)}</div>
                                    
                                    <button 
                                        className={`add-to-order-btn ${food.status === 'UNAVAILABLE' ? 'disabled' : ''}`}
                                        onClick={() => addToOrder(food)}
                                        disabled={food.status === 'UNAVAILABLE'}
                                    >
                                        {food.status === 'UNAVAILABLE' ? 'Out of Stock' : 'Add to Order'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!foodsLoading && filteredFoods.length === 0 && (
                    <div className="no-foods">
                        <div className="no-foods-icon">🔍</div>
                        <h4>No items found</h4>
                        <p>Try adjusting your search or category filter</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderCreationForm; 