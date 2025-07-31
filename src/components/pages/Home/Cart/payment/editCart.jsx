import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './editCart.css';
import { CartContext } from '../../../../common/Layout/customer_layout';

const EditCart = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { setCart } = useContext(CartContext);

    const [order, setOrder] = useState(null);
    const [foodItems, setFoodItems] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [availableFoods, setAvailableFoods] = useState([]);
    const [addingItem, setAddingItem] = useState(false);
    const [selectedFood, setSelectedFood] = useState(null);
    const [quantity, setQuantity] = useState(1);
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
        fetchPaymentMethods();
        fetchAvailableFoods();
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
            setSelectedPaymentMethod(response.data.paymentMethod?.id);
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

    const fetchPaymentMethods = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/payment-methods');
            setPaymentMethods(response.data);
        } catch (error) {
            // Silent fail
        }
    };

    const fetchAvailableFoods = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/foods');
            const availableFoods = response.data.filter(food => 
                food.status === 'AVAILABLE'
            );
            setAvailableFoods(availableFoods);
        } catch (error) {
            // Silent fail
        }
    };

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

    const handleAddItem = () => {
        if (!selectedFood || quantity < 1) return;
        const existingItem = foodItems.find(item => item.id === selectedFood.id);
        if (existingItem) {
            updateQuantity(selectedFood.id, existingItem.quantity + quantity);
        } else {
            setFoodItems(items => [
                ...items, 
                {
                    id: selectedFood.id,
                    quantity: quantity,
                    name: selectedFood.name,
                    price: selectedFood.price,
                    imageUrl: selectedFood.imageUrl,
                    type: selectedFood.type
                }
            ]);
        }
        setAddingItem(false);
        setSelectedFood(null);
        setQuantity(1);
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
                paymentMethodId: selectedPaymentMethod,
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
            alert(error.response?.data?.message || "Unable to update order");
            setSaving(false);
        }
    };

    const handleSaveClick = () => {
        if (foodItems.length === 0) {
            alert("Order must have at least one item");
            return;
        }
        if (!selectedPaymentMethod) {
            alert("Please select a payment method");
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
            alert(error.response?.data?.message || "Unable to cancel the order, please try again");
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
                    <div className="edit-cart-items">
                        <div className="section-header">
                            <h2>Order Items</h2>
                            <button 
                                className="add-item-btn"
                                onClick={() => setAddingItem(true)}
                            >
                                + Add item
                            </button>
                        </div>
                        
                        {foodItems.length === 0 ? (
                            <div className="empty-items-message">
                                No items yet. Please add items to your order.
                            </div>
                        ) : (
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th className="item-name-col">Item Name</th>
                                        <th className="item-price-col">Price</th>
                                        <th className="item-quantity-col">Quantity</th>
                                        <th className="item-total-col">Total</th>
                                        <th className="item-actions-col"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {foodItems.map(item => (
                                        <tr key={item.id}>
                                            <td>{item.name}</td>
                                            <td>{Number(item.price).toLocaleString()} $</td>
                                            <td>
                                                <div className="quantity-control">
                                                    <button 
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        -
                                                    </button>
                                                    <span>{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                                        +
                                                    </button>
                                                </div>
                                            </td>
                                            <td>{Number(item.price * item.quantity).toLocaleString()} $</td>
                                            <td>
                                                <button 
                                                    className="remove-item-btn"
                                                    onClick={() => removeItem(item.id)}
                                                >
                                                    &times;
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        
                        <div className="order-total">
                            <span>Total:</span>
                            <span>{calculateTotal().toLocaleString()} $</span>
                        </div>
                    </div>
                    
                    <div className="edit-cart-options">
                        <div className="payment-method-section">
                            <h2>Payment Method</h2>
                            <div className="payment-options">
                                {paymentMethods.map(method => (
                                    <div key={method.id} className="payment-option">
                                        <input 
                                            type="radio"
                                            id={`payment-${method.id}`}
                                            name="paymentMethod"
                                            value={method.id}
                                            checked={selectedPaymentMethod === method.id}
                                            onChange={() => setSelectedPaymentMethod(method.id)}
                                        />
                                        <label htmlFor={`payment-${method.id}`}>{method.name}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="note-section">
                            <h2>Order Note</h2>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Enter notes for this order (optional)"
                                rows="4"
                            ></textarea>
                        </div>
                    </div>
                    
                    <div className="edit-cart-actions">
                        <div className="left-actions">
                            <button 
                                className="delete-order-btn"
                                onClick={showCancelOrderModal}
                                disabled={saving}
                            >
                                Cancel Order
                            </button>
                        </div>
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
            )}
            
            {/* Add Food Modal */}
            {addingItem && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Add Item</h3>
                            <button 
                                className="modal-close"
                                onClick={() => {
                                    setAddingItem(false);
                                    setSelectedFood(null);
                                    setQuantity(1);
                                }}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="modal-content">
                            <div className="form-group">
                                <label>Select item:</label>
                                <select
                                    value={selectedFood?.id || ''}
                                    onChange={(e) => {
                                        const foodId = Number(e.target.value);
                                        const food = availableFoods.find(f => f.id === foodId);
                                        setSelectedFood(food);
                                    }}
                                >
                                    <option value="">-- Select an item --</option>
                                    {availableFoods.map(food => (
                                        <option key={food.id} value={food.id}>
                                            {food.name} - {Number(food.price).toLocaleString()} $
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Quantity:</label>
                                <div className="quantity-control modal-quantity">
                                    <button 
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <input 
                                        type="number" 
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    />
                                    <button onClick={() => setQuantity(quantity + 1)}>
                                        +
                                    </button>
                                </div>
                            </div>
                            
                            <div className="modal-actions">
                                <button 
                                    className="modal-btn secondary"
                                    onClick={() => {
                                        setAddingItem(false);
                                        setSelectedFood(null);
                                        setQuantity(1);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="modal-btn primary"
                                    onClick={handleAddItem}
                                    disabled={!selectedFood}
                                >
                                    Add to Order
                                </button>
                            </div>
                        </div>
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
