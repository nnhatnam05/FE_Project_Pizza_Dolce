import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OrderEdit.css';

const OrderEdit = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [availableFoods, setAvailableFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOrderDetails();
    loadAvailableFoods();
    loadCategories();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/dinein/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOrder(response.data);
      setOrderItems(response.data.orderItems || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load order details:', err);
      setError('Failed to load order details: ' + (err.response?.data || err.message));
      setLoading(false);
    }
  };

  const loadAvailableFoods = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/foods');
      setAvailableFoods(response.data);
    } catch (err) {
      console.error('Failed to load foods:', err);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
      // Fallback: extract categories from foods
      const uniqueTypes = [...new Set(availableFoods.map(food => food.type).filter(type => type))];
      const categoryOptions = uniqueTypes.map(type => ({
        id: type,
        name: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
      }));
      setCategories(categoryOptions);
    }
  };

  const updateItemQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeItem(itemId);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/dinein/orders/${orderId}/items/${itemId}`, {
        quantity: newQuantity
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Reload order details to get updated data
      await loadOrderDetails();
    } catch (err) {
      console.error('Failed to update item quantity:', err);
      setError('Failed to update item quantity: ' + (err.response?.data || err.message));
    }
  };

  const removeItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this item?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/dinein/orders/${orderId}/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Reload order details to get updated data
      await loadOrderDetails();
    } catch (err) {
      console.error('Failed to remove item:', err);
      setError('Failed to remove item: ' + (err.response?.data || err.message));
    }
  };

  const addFoodToOrder = async (food) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:8080/api/dinein/orders/${orderId}/items`, {
        foodId: food.id,
        quantity: 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Reload order details to get updated items
      await loadOrderDetails();
    } catch (err) {
      console.error('Failed to add item:', err);
      setError('Failed to add item: ' + (err.response?.data || err.message));
    }
  };

  const handleBackToDashboard = () => {
    navigate('/staff/dashboard');
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

  // Filter foods based on search term and category
  const filteredFoods = availableFoods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (food.description && food.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || food.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="loading">Loading order details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!order) return <div className="error">Order not found</div>;

  // Only allow editing if order status is NEW
  const canEdit = order.status === 'NEW';

  return (
    <div className="order-edit">
      <div className="order-edit-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/staff/dashboard')}>
            ← Back to Dashboard
          </button>
          <h1>Edit Order #{order.orderNumber}</h1>
        </div>
        <div className="header-right">
          <span className={`order-status status-${order.status?.toLowerCase()}`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="order-edit-content">
        {/* Top Section - 2 Columns */}
        <div className="top-section">
          {/* Left Column */}
          <div className="left-column">
            {/* Order Information */}
            <div className="order-info">
              <h3>Order Information</h3>
              <div className="order-details">
                <p><strong>Table:</strong> {order.table?.number}</p>
                <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                <p><strong>Status:</strong> {order.status}</p>
              </div>
            </div>

            {/* Total and Actions Section */}
            <div className="order-summary-section">
              <div className="total-section">
                <h3>Total: ${calculateTotal().toFixed(2)}</h3>
              </div>
              
              <div className="action-buttons">
                <button 
                  className="btn btn-primary"
                  onClick={handleBackToDashboard}
                >
                  ← Back to Dashboard
                </button>
                {canEdit && (
                  <div className="edit-info">
                    <p>✅ Changes are saved automatically</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Current Order Items */}
          <div className="right-column">
            <div className="order-items-section">
              <div className="section-header">
                <h3>Current Order Items</h3>
              </div>

              {orderItems.length === 0 ? (
                <div className="empty-items">
                  <p>No items in this order</p>
                </div>
              ) : (
                <div className="items-list">
                  {orderItems.map((item) => (
                    <div key={item.id} className="order-item-edit">
                      <div className="item-info">
                        <h4>{item.food?.name || item.foodName}</h4>
                        <p className="item-price">${item.food?.price?.toFixed(2) || '0.00'} </p>
                      </div>
                      
                      <div className="item-controls">
                        {canEdit ? (
                          <div className="quantity-controls">
                            <button 
                              className="qty-btn"
                              onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </button>
                            <span className="quantity">{item.quantity}</span>
                            <button 
                              className="qty-btn"
                              onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <span className="quantity-readonly">x{item.quantity}</span>
                        )}
                        
                        <div className="item-total">
                          ${item.totalPrice?.toFixed(2) || '0.00'}
                        </div>
                        
                        {canEdit && (
                          <button 
                            className="btn-remove"
                            onClick={() => removeItem(item.id)}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Items Section - Always visible menu */}
        {canEdit && (
          <div className="add-items-section">
            <div className="section-header">
              <h3>🍽️ Add Items to Order</h3>
            </div>

            {/* Search */}
            <div className="search-section">
              <input
                type="text"
                placeholder="🔍 Search foods by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Category Filter */}
            <div className="category-filter">
              <button
                className={selectedCategory === 'all' ? 'active' : ''}
                onClick={() => setSelectedCategory('all')}
              >
                All
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

            {/* Food Grid */}
            <div className="food-grid">
              {filteredFoods.length > 0 ? (
                filteredFoods.map(food => (
                  <div key={food.id} className="food-card">
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
                    </div>
                    
                    <div className="food-info">
                      <h4>{food.name}</h4>
                      <p className="food-description">{food.description || 'Delicious food item'}</p>
                      <div className="food-price">${food.price?.toFixed(2)}</div>
                      
                      <button 
                        className="add-to-order-btn"
                        onClick={() => addFoodToOrder(food)}
                      >
                        + Add to Order
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-foods-found">
                  <p>🔍 No foods found matching "{searchTerm}"</p>
                  <p>Try searching with different keywords</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!canEdit && (
          <div className="edit-disabled-notice">
            <p>⚠️ This order cannot be edited because its status is "{order.status}". Only orders with "NEW" status can be modified.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderEdit; 