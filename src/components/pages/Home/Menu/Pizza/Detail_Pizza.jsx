import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../../../../common/Layout/customer_layout';
import './Pizza.css';

const Detail_Pizza = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pizza, setPizza] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    
    // Sử dụng hàm handleAddToCart từ CartContext
    const { handleAddToCart } = useContext(CartContext);
    
    // API URL - replace with your actual API endpoint
    const API_URL = 'http://localhost:8080/api/foods';

    useEffect(() => {
        setLoading(true);
        setError('');
        
        // Direct API call without using axiosConfig
        axios.get(`${API_URL}/${id}`)
            .then(res => {
                if (res.data && res.data.type === 'PIZZA') {
                    setPizza(res.data);
                } else {
                    setError('Pizza not found');
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching data:', err);
                setError('Failed to load pizza details');
                setLoading(false);
            });
    }, [id]);

    const handleQuantityChange = (amount) => {
        const newQuantity = quantity + amount;
        if (newQuantity >= 1) {
            setQuantity(newQuantity);
        }
    };

    const addToCart = () => {
        // Sử dụng hàm handleAddToCart từ CartContext
        if (pizza && pizza.status !== 'UNAVAILABLE') {
            handleAddToCart({
                id: pizza.id,
                name: pizza.name,
                price: pizza.price,
                quantity: quantity,
                imageUrl: pizza.imageUrl
            });
        }
    };

    const handleGoBack = () => {
        navigate('/pizza');
    };

    if (loading) {
        return (
            <div className="detail-container">
                <div className="detail-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading pizza details...</p>
                </div>
            </div>
        );
    }

    if (error || !pizza) {
        return (
            <div className="detail-container">
                <div className="detail-error">
                    <h2>Error</h2>
                    <p>{error || 'Pizza not found'}</p>
                    <button className="back-button" onClick={handleGoBack}>
                        Back to Pizza Menu
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="detail-container">
            <div className="breadcrumb">
                <span onClick={() => navigate('/')}>Home</span>
                <span> • </span>
                <span onClick={() => navigate('/pizza')}>Pizza</span>
                <span> • </span>
                <span>{pizza.name}</span>
            </div>
            
            <div className="detail-content">
                <div className="detail-left">
                    <div className="detail-image">
                        {pizza.imageUrl && (
                            <img
                                src={pizza.imageUrl.startsWith('http') ? pizza.imageUrl : `${API_URL.split('/api')[0]}${pizza.imageUrl}`}
                                alt={pizza.name}
                            />
                        )}
                        {pizza.status === 'UNAVAILABLE' && (
                            <div className="sold-out-badge">Temporarily Out of Stock</div>
                        )}
                    </div>
                </div>
                
                <div className="detail-right">
                    <h1 className="detail-title">{pizza.name}</h1>
                    
                    <div className="detail-price">
                        {pizza.price ? `$${Number(pizza.price).toLocaleString()}` : 'Contact for Price'}
                    </div>
                    
                    <div className="detail-description">
                        <h3>Description</h3>
                        <p>{pizza.description || 'No description available.'}</p>
                    </div>
                    
                    {pizza.ingredients && (
                        <div className="detail-ingredients">
                            <h3>Ingredients</h3>
                            <p>{pizza.ingredients}</p>
                        </div>
                    )}
                    
                    <div className="detail-actions">
                        <div className="quantity-control">
                            <button 
                                className="quantity-btn" 
                                onClick={() => handleQuantityChange(-1)}
                                disabled={pizza.status === 'UNAVAILABLE'}
                            >
                                -
                            </button>
                            <span className="quantity-value">{quantity}</span>
                            <button 
                                className="quantity-btn" 
                                onClick={() => handleQuantityChange(1)}
                                disabled={pizza.status === 'UNAVAILABLE'}
                            >
                                +
                            </button>
                        </div>
                        
                        <button 
                            className={`add-cart-btn ${pizza.status === 'UNAVAILABLE' ? 'disabled' : ''}`}
                            onClick={addToCart}
                            disabled={pizza.status === 'UNAVAILABLE'}
                        >
                            {pizza.status === 'UNAVAILABLE' ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>
                    
                    <div className="back-section">
                        <button className="back-btn" onClick={handleGoBack}>
                            &larr; Back to Pizza Menu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Detail_Pizza;
