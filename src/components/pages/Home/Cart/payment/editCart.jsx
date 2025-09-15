import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './editCart.css';
import { CartContext } from '../../../../common/Layout/customer_layout';
import { useNotification } from '../../../../../contexts/NotificationContext';

const EditCart = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { setCart } = useContext(CartContext);
    const { showError, showWarning } = useNotification();

    const [order, setOrder] = useState(null);
    const [foodItems, setFoodItems] = useState([]);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [availableFoods, setAvailableFoods] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [foodsLoading, setFoodsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    // Cancel order states
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [customCancelReason, setCustomCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [showCancelReasonError, setShowCancelReasonError] = useState(false);

    useEffect(() => {
        fetchOrder();
        fetchAvailableFoods();
        loadCategories();
    }, [orderId]);

    const fetchOrder = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Please login to view your order");
            navigate('/login/customer');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8080/api/orders/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setOrder(response.data);

            let items = [];

            if (response.data.orderFoods && response.data.orderFoods.length > 0) {
                items = response.data.orderFoods.map(item => ({
                    id: item.food?.id,
                    quantity: item.quantity,
                    name: item.food?.name,
                    price: item.food?.price,
                    imageUrl: item.food?.imageUrl,
                    type: item.food?.type
                }));
            } else if (response.data.foodList && response.data.foodList.length > 0) {
                items = response.data.foodList.map(item => ({
                    id: item.id,
                    quantity: item.quantity || 1,
                    name: item.name,
                    price: item.price,
                    imageUrl: item.imageUrl,
                    type: item.type
                }));
            }

            setFoodItems(items);
            setNote(response.data.note || '');
            setLoading(false);
        } catch (error) {
            setError(error.response?.data?.message || "Unable to load order information");
            setLoading(false);
            if (error.response && error.response.status === 401) {
                navigate('/login/customer');
            }
            if (error.response && error.response.status === 404) {
                navigate('/');
            }
        }
    };

    const fetchAvailableFoods = async () => {
        try {
            setFoodsLoading(true);
            const response = await axios.get('http://localhost:8080/api/foods');
            const availableFoods = response.data.filter(food => 
                food.status === 'AVAILABLE'
            );
            setAvailableFoods(response.data); // Keep all foods for display
        } catch (error) {
            console.error('Failed to load foods:', error);
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
            const uniqueTypes = [...new Set(availableFoods.map(food => food.type).filter(type => type))];
            const categoryOptions = uniqueTypes.map(type => ({
                id: type,
                name: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
            }));
            setCategories(categoryOptions);
        }
    };

    // Filter foods
    const filteredFoods = availableFoods.filter(food => {
        const matchesCategory = selectedCategory === 'all' || food.type === selectedCategory;
        const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            food.description?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return;
        setFoodItems(items => 
            items.map(item => 
                item.id === id ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const removeItem = (id) => {
        setFoodItems(items => items.filter(item => item.id !== id));
    };

    // Add item to order
    const addToOrder = (food) => {
        if (food.status === 'UNAVAILABLE') return;
        
        const existingItem = foodItems.find(item => item.id === food.id);
        if (existingItem) {
            updateQuantity(food.id, existingItem.quantity + 1);
        } else {
            setFoodItems(items => [
                ...items, 
                {
                    id: food.id,
                    quantity: 1,
                    name: food.name,
                    price: food.price,
                    imageUrl: food.imageUrl,
                    type: food.type
                }
            ]);
        }
    };

    const saveOrder = async () => {
        setShowSaveConfirm(false);
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Please login to update your order");
            navigate('/login/customer');
            return;
        }
        try {
            setSaving(true);
            const foodMap = new Map();
            foodItems.forEach(item => {
                if (foodMap.has(item.id)) {
                    const existingItem = foodMap.get(item.id);
                    existingItem.quantity += item.quantity;
                } else {
                    foodMap.set(item.id, { ...item });
                }
            });
            const mergedFoodItems = Array.from(foodMap.values());
            const orderData = {
                customerId: order.customer?.id,
                foods: mergedFoodItems.map(item => ({
                    id: item.id,
                    quantity: item.quantity
                })),
                note: note
            };
            const response = await axios.put(`http://localhost:8080/api/orders/update/${orderId}`, orderData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 200 || response.status === 201) {
                navigate(`/payment-details/${orderId}`);
            }
            setSaving(false);
        } catch (error) {
            showError(error.response?.data?.message || "Unable to update order");
            setSaving(false);
        }
    };

    const handleSaveClick = () => {
        if (foodItems.length === 0) {
            showWarning("Order must have at least one item");
            return;
        }
        setShowSaveConfirm(true);
    };

    const cancelEdit = () => {
        navigate(`/payment-details/${order?.id || orderId}`);
    };

    // Cancel order modal
    const showCancelOrderModal = () => {
        setShowCancelModal(true);
        setCancelReason('');
        setCustomCancelReason('');
        setShowCancelReasonError(false);
    };

    const handleCancelReasonChange = (e) => {
        setCancelReason(e.target.value);
        setShowCancelReasonError(false);
        if (e.target.value !== 'OTHER') {
            setCustomCancelReason('');
        }
    };

    const handleCancelOrder = async () => {
        if (cancelReason === '') {
            setShowCancelReasonError(true);
            return;
        }
        if (cancelReason === 'OTHER' && customCancelReason.trim() === '') {
            setShowCancelReasonError(true);
            return;
        }
        const finalReason = cancelReason === 'OTHER' ? customCancelReason : cancelReason;
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Please login to cancel the order");
            navigate('/login/customer');
            return;
        }
        try {
            setCancelling(true);
            const response = await axios.put(
                `http://localhost:8080/api/orders/cancel/${orderId}`,
                null,
                {
                    params: { reason: finalReason },
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            setCancelling(false);
            setShowCancelModal(false);
            setOrder(response.data);
        } catch (error) {
            setCancelling(false);
            showError(error.response?.data?.message || "Unable to cancel the order, please try again");
        }
    };

    const calculateTotal = () => {
        return foodItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    if (loading) {
        return <div className="edit-cart-loading">Loading order information...</div>;
    }

    if (error) {
        return <div className="edit-cart-error">{error}</div>;
    }

    return (
        <div className="edit-cart-container">
            <div className="breadcrumb">
                <span onClick={() => navigate('/')}>Home</span>
                <span> • </span>
                <span onClick={() => navigate(`/payment-details/${order.id}`)}>Order #{order.orderNumber}</span>
                <span> • </span>
                <span>Edit</span>
            </div>
            
            <h1 className="edit-cart-title">Edit Order #{order.orderNumber}</h1>
            
            {order && order.status !== 'WAITING_PAYMENT' && (
                <div className="edit-cart-warning">
                    <p>You can only edit orders in "Waiting for Payment" status.</p>
                    <button onClick={() => navigate(`/payment-details/${order.orderNumber}`)}>
                        Back
                    </button>
                </div>
            )}
            
            {order && order.status === 'WAITING_PAYMENT' && (
                <div className="edit-cart-content">
                    {/* Top Section - 2 Columns */}
                    <div className="top-section">
                        {/* Left Column - Order Summary */}
                        <div className="order-summary-section">
                            <h3>📋 Order Summary ({foodItems.length} items)</h3>
                            
                            {foodItems.length === 0 ? (
                                <div className="empty-order">
                                    <div className="empty-icon">🛒</div>
                                    <p>No items selected</p>
                                    <small>Add items from the menu below</small>
                                </div>
                            ) : (
                                <div className="order-items">
                                    {foodItems.map(item => (
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

                                            <button
                                                className="remove-item-btn"
                                                onClick={() => removeItem(item.id)}
                                                title="Remove item"
                                                aria-label={`Remove ${item.name}`}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    
                                    <div className="order-totals">
                                        <div className="total-row final">
                                            <span><strong>Total:</strong></span>
                                            <span><strong>${calculateTotal().toFixed(2)}</strong></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Order Note */}
                        <div className="note-section-container">
                            <h3>📝 Order Note</h3>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Enter notes for this order (optional)"
                                rows="6"
                                className="note-textarea"
                            ></textarea>
                            
                            <div className="edit-cart-actions">
                                {/* <div className="left-actions">
                                    <button 
                                        className="delete-order-btn"
                                        onClick={showCancelOrderModal}
                                        disabled={saving}
                                    >
                                        Cancel Order
                                    </button>
                                </div> */}
                                <div className="right-actions">
                                    <button 
                                        className="cancel-btn"
                                        onClick={cancelEdit}
                                        disabled={saving}
                                    >
                                        Back
                                    </button>
                                    <button 
                                        className="save-btn"
                                        onClick={handleSaveClick}
                                        disabled={saving || foodItems.length === 0}
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
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
            )}
            
            {/* Save Confirmation Modal */}
            {showSaveConfirm && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Confirm Changes</h3>
                            <button 
                                className="modal-close"
                                onClick={() => setShowSaveConfirm(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="modal-content">
                            <p>Are you sure you want to save these changes?</p>
                            
                            <div className="modal-actions">
                                <button 
                                    className="modal-btn secondary"
                                    onClick={() => setShowSaveConfirm(false)}
                                >
                                    Back
                                </button>
                                <button 
                                    className="modal-btn primary"
                                    onClick={saveOrder}
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Confirm Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Cancel Order Modal */}
            {showCancelModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Confirm Cancel Order</h3>
                            <button 
                                className="modal-close"
                                onClick={() => setShowCancelModal(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="modal-content">
                            <p>Are you sure you want to cancel this order?</p>
                            
                            <div className="form-group">
                                <label>Please select a cancellation reason:</label>
                                <div className="cancel-reasons">
                                    <div className="reason-option">
                                        <input 
                                            type="radio" 
                                            id="reason-1" 
                                            name="cancelReason" 
                                            value="Changed my mind" 
                                            checked={cancelReason === "Changed my mind"}
                                            onChange={handleCancelReasonChange}
                                        />
                                        <label htmlFor="reason-1">Changed my mind</label>
                                    </div>
                                    
                                    <div className="reason-option">
                                        <input 
                                            type="radio" 
                                            id="reason-2" 
                                            name="cancelReason" 
                                            value="Ordered by mistake" 
                                            checked={cancelReason === "Ordered by mistake"}
                                            onChange={handleCancelReasonChange}
                                        />
                                        <label htmlFor="reason-2">Ordered by mistake</label>
                                    </div>
                                    
                                    <div className="reason-option">
                                        <input 
                                            type="radio" 
                                            id="reason-3" 
                                            name="cancelReason" 
                                            value="Delivery is too slow" 
                                            checked={cancelReason === "Delivery is too slow"}
                                            onChange={handleCancelReasonChange}
                                        />
                                        <label htmlFor="reason-3">Delivery is too slow</label>
                                    </div>
                                    
                                    <div className="reason-option">
                                        <input 
                                            type="radio" 
                                            id="reason-4" 
                                            name="cancelReason" 
                                            value="Payment issue" 
                                            checked={cancelReason === "Payment issue"}
                                            onChange={handleCancelReasonChange}
                                        />
                                        <label htmlFor="reason-4">Payment issue</label>
                                    </div>
                                    
                                    <div className="reason-option">
                                        <input 
                                            type="radio" 
                                            id="reason-other" 
                                            name="cancelReason" 
                                            value="OTHER" 
                                            checked={cancelReason === "OTHER"}
                                            onChange={handleCancelReasonChange}
                                        />
                                        <label htmlFor="reason-other">Other reason</label>
                                    </div>
                                </div>
                                
                                {cancelReason === "OTHER" && (
                                    <textarea
                                        value={customCancelReason}
                                        onChange={(e) => {
                                            setCustomCancelReason(e.target.value);
                                            setShowCancelReasonError(false);
                                        }}
                                        placeholder="Please enter the cancellation reason"
                                        rows="3"
                                        className={showCancelReasonError ? "error-input" : ""}
                                    ></textarea>
                                )}
                                
                                {showCancelReasonError && (
                                    <div className="error-message">
                                        {cancelReason === "OTHER" 
                                            ? "Please enter the cancellation reason" 
                                            : "Please select a cancellation reason"}
                                    </div>
                                )}
                            </div>
                            
                            <div className="modal-actions">
                                <button 
                                    className="modal-btn secondary"
                                    onClick={() => setShowCancelModal(false)}
                                    disabled={cancelling}
                                >
                                    No, keep order
                                </button>
                                <button 
                                    className="modal-btn danger"
                                    onClick={handleCancelOrder}
                                    disabled={cancelling}
                                >
                                    {cancelling ? 'Processing...' : 'Yes, cancel order'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditCart;
