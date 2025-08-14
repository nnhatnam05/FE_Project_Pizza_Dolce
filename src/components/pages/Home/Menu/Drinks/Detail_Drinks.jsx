import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../../../../common/Layout/customer_layout';
import './Drink.css';

const Detail_Drinks = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [drink, setDrink] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    
    // Sử dụng CartContext
    const { handleAddToCart } = useContext(CartContext);
    
    // API URL - replace with your actual API endpoint
    const API_URL = 'http://localhost:8080/api/foods';

    useEffect(() => {
        setLoading(true);
        setError('');
        
        // Direct API call without using axiosConfig
        axios.get(`${API_URL}/${id}`)
            .then(res => {
                if (res.data && res.data.type === 'DRINK') {
                    setDrink(res.data);
                } else {
                    setError('Drink not found');
                    setLoading(false);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching data:', err);
                setError('Failed to load drink details');
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
        if (drink && drink.status !== 'UNAVAILABLE') {
            handleAddToCart({
                id: drink.id,
                name: drink.name,
                price: drink.price,
                quantity: quantity,
                imageUrl: drink.imageUrl
            });
        }
    };

    const handleGoBack = () => {
        navigate('/drinks');
    };

    if (loading) {
        return (
            <div className="detail-container">
                <div className="detail-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading drink details...</p>
                </div>
            </div>
        );
    }

    if (error || !drink) {
        return (
            <div className="detail-container">
                <div className="detail-error">
                    <h2>Error</h2>
                    <p>{error || 'Drink not found'}</p>
                    <button className="back-button" onClick={handleGoBack}>
                        Back to Drinks Menu
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
                <span onClick={() => navigate('/drinks')}>Drinks</span>
                <span> • </span>
                <span>{drink.name}</span>
            </div>
            
            <div className="detail-content">
                <div className="detail-left">
                    <div className="detail-image">
                        {drink.imageUrl && (
                            <img
                                src={drink.imageUrl.startsWith('http') ? drink.imageUrl : `${API_URL.split('/api')[0]}${drink.imageUrl}`}
                                alt={drink.name}
                            />
                        )}
                        {drink.status === 'UNAVAILABLE' && (
                            <div className="sold-out-badge">Temporarily Out of Stock</div>
                        )}
                    </div>
                </div>
                
                <div className="detail-right">
                    <h1 className="detail-title">{drink.name}</h1>
                    
                    <div className="detail-price">
                        {drink.price ? `$${Number(drink.price).toLocaleString()}` : 'Contact for Price'}
                    </div>
                    
                    <div className="detail-description">
                        <h3>Description</h3>
                        <p>{drink.description || 'No description available.'}</p>
                    </div>
                    
                    {drink.ingredients && (
                        <div className="detail-ingredients">
                            <h3>Ingredients</h3>
                            <p>{drink.ingredients}</p>
                        </div>
                    )}
                    
                    <div className="detail-actions">
                        <div className="quantity-control">
                            <button 
                                className="quantity-btn" 
                                onClick={() => handleQuantityChange(-1)}
                                disabled={drink.status === 'UNAVAILABLE'}
                            >
                                -
                            </button>
                            <span className="quantity-value">{quantity}</span>
                            <button 
                                className="quantity-btn" 
                                onClick={() => handleQuantityChange(1)}
                                disabled={drink.status === 'UNAVAILABLE'}
                            >
                                +
                            </button>
                        </div>
                        
                        <button 
                            className={`add-cart-btn ${drink.status === 'UNAVAILABLE' ? 'disabled' : ''}`}
                            onClick={addToCart}
                            disabled={drink.status === 'UNAVAILABLE'}
                        >
                            {drink.status === 'UNAVAILABLE' ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>
                    
                    <div className="back-section">
                        <button className="back-btn" onClick={handleGoBack}>
                            &larr; Back to Drinks Menu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Detail_Drinks;
