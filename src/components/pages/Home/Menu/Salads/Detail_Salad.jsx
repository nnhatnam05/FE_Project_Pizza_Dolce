import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../../../../common/Layout/customer_layout';
import './Salad.css';

const Detail_Salad = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [salad, setSalad] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    
    // 使用CartContext
    const { handleAddToCart } = useContext(CartContext);
    
    // API URL - replace with your actual API endpoint
    const API_URL = 'http://localhost:8080/api/foods';

    useEffect(() => {
        setLoading(true);
        setError('');
        
        // Direct API call without using axiosConfig
        axios.get(`${API_URL}/${id}`)
            .then(res => {
                if (res.data && res.data.type === 'SALAD') {
                    setSalad(res.data);
                } else {
                    setError('Salad not found');
                    setLoading(false);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching data:', err);
                setError('Failed to load salad details');
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
        // 使用CartContext中的handleAddToCart函数
        if (salad && salad.status !== 'UNAVAILABLE') {
            handleAddToCart({
                id: salad.id,
                name: salad.name,
                price: salad.price,
                quantity: quantity,
                imageUrl: salad.imageUrl
            });
        }
    };

    const handleGoBack = () => {
        navigate('/salads');
    };

    if (loading) {
        return (
            <div className="detail-container">
                <div className="detail-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading salad details...</p>
                </div>
            </div>
        );
    }

    if (error || !salad) {
        return (
            <div className="detail-container">
                <div className="detail-error">
                    <h2>Error</h2>
                    <p>{error || 'Salad not found'}</p>
                    <button className="back-button" onClick={handleGoBack}>
                        Back to Salads Menu
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
                <span onClick={() => navigate('/salads')}>Salads</span>
                <span> • </span>
                <span>{salad.name}</span>
            </div>
            
            <div className="detail-content">
                <div className="detail-left">
                    <div className="detail-image">
                        {salad.imageUrl && (
                            <img
                                src={salad.imageUrl.startsWith('http') ? salad.imageUrl : `${API_URL.split('/api')[0]}${salad.imageUrl}`}
                                alt={salad.name}
                            />
                        )}
                        {salad.status === 'UNAVAILABLE' && (
                            <div className="sold-out-badge">Temporarily Out of Stock</div>
                        )}
                    </div>
                </div>
                
                <div className="detail-right">
                    <h1 className="detail-title">{salad.name}</h1>
                    
                    <div className="detail-price">
                        {salad.price ? `$${Number(salad.price).toLocaleString()}` : 'Contact for Price'}
                    </div>
                    
                    <div className="detail-description">
                        <h3>Description</h3>
                        <p>{salad.description || 'No description available.'}</p>
                    </div>
                    
                    {salad.ingredients && (
                        <div className="detail-ingredients">
                            <h3>Ingredients</h3>
                            <p>{salad.ingredients}</p>
                        </div>
                    )}
                    
                    <div className="detail-actions">
                        <div className="quantity-control">
                            <button 
                                className="quantity-btn" 
                                onClick={() => handleQuantityChange(-1)}
                                disabled={salad.status === 'UNAVAILABLE'}
                            >
                                -
                            </button>
                            <span className="quantity-value">{quantity}</span>
                            <button 
                                className="quantity-btn" 
                                onClick={() => handleQuantityChange(1)}
                                disabled={salad.status === 'UNAVAILABLE'}
                            >
                                +
                            </button>
                        </div>
                        
                        <button 
                            className={`add-cart-btn ${salad.status === 'UNAVAILABLE' ? 'disabled' : ''}`}
                            onClick={addToCart}
                            disabled={salad.status === 'UNAVAILABLE'}
                        >
                            {salad.status === 'UNAVAILABLE' ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>
                    
                    <div className="back-section">
                        <button className="back-btn" onClick={handleGoBack}>
                            &larr; Back to Salads Menu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Detail_Salad;
