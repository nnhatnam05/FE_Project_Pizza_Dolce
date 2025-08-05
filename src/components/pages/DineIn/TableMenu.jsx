import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TableMenu.css';

const TableMenu = ({ tableId, currentOrder, onOrderUpdate }) => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    loadFoods();
    loadCategories();
  }, []);

  const loadFoods = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/foods');
      setFoods(response.data);
    } catch (err) {
      console.error('Failed to load foods:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
      // Fallback: extract categories from foods if API fails
      const uniqueTypes = [...new Set(foods.map(food => food.type).filter(type => type))];
      const categoryOptions = uniqueTypes.map(type => ({
        id: type,
        name: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
      }));
      setCategories(categoryOptions);
    }
  };

  const filteredFoods = selectedCategory === 'all' 
    ? foods 
    : foods.filter(food => food.type === selectedCategory);

  const addToCart = (food) => {
    const existingItem = cart.find(item => item.id === food.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === food.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...food, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (foodId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== foodId));
    } else {
      setCart(cart.map(item => 
        item.id === foodId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const submitOrder = async () => {
    if (cart.length === 0) {
      alert('Please add items to your order');
      return;
    }

    try {
      const orderData = {
        tableId: parseInt(tableId),
        foods: cart.map(item => ({
          id: item.id,
          quantity: item.quantity
        })),
        note: '',
        orderType: 'DINE_IN'
      };

      let response;
      if (currentOrder) {
        // Add to existing order
        response = await axios.post(`http://localhost:8080/api/dinein/table/${tableId}/add-items`, orderData);
      } else {
        // Create new order
        response = await axios.post('http://localhost:8080/api/dinein/order', orderData);
      }

      onOrderUpdate(response.data);
      setCart([]);
      setShowCart(false);
      alert('Order submitted successfully!');
    } catch (err) {
      console.error('Failed to submit order:', err);
      alert('Failed to submit order. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="table-menu-loading">
        <div className="spinner"></div>
        <p>Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="table-menu-container">
      {/* Category Filter */}
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

      {/* Food Grid */}
      <div className="food-grid">
        {filteredFoods.map(food => (
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
              <h3>{food.name}</h3>
              <p className="food-description">{food.description}</p>
              <div className="food-price">${food.price?.toFixed(2)}</div>
              
              <button 
                className="add-to-cart-btn"
                onClick={() => addToCart(food)}
              >
                Add to Order
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="cart-summary">
          <div className="cart-header">
            <h3>Your Order ({cart.length} items)</h3>
            <button 
              className="toggle-cart-btn"
              onClick={() => setShowCart(!showCart)}
            >
              {showCart ? '▼' : '▲'} ${getTotalPrice().toFixed(2)}
            </button>
          </div>
          
          {showCart && (
            <div className="cart-details">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">${item.price?.toFixed(2)}</span>
                  </div>
                  
                  <div className="quantity-controls">
                    <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>
              ))}
              
              <div className="cart-total">
                <strong>Total: ${getTotalPrice().toFixed(2)}</strong>
              </div>
              
              <button 
                className="submit-order-btn"
                onClick={submitOrder}
              >
                {currentOrder ? 'Add to Current Order' : 'Submit Order'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TableMenu; 