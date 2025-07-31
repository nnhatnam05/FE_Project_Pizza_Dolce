import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../../../../common/Layout/customer_layout';
import './Other.css';

const Detail_Other = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [other, setOther] = useState(null);
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
                if (res.data && res.data.type === 'OTHER') {
                    setOther(res.data);
                } else {
                    setError('Other not found');
                    setLoading(false);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching data:', err);
                setError('Failed to load other details');
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
        if (other && other.status !== 'UNAVAILABLE') {
            handleAddToCart({
                id: other.id,
                name: other.name,
                price: other.price,
                quantity: quantity,
                imageUrl: other.imageUrl
            });
        }
    };

    const handleGoBack = () => {
        navigate('/other');
    };

    if (loading) {
        return (
            <div className="detail-container">
                <div className="detail-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading other details...</p>
                </div>
            </div>
        );
    }

    if (error || !other) {
        return (
            <div className="detail-container">
                <div className="detail-error">
                    <h2>Error</h2>
                    <p>{error || 'Other not found'}</p>
                    <button className="back-button" onClick={handleGoBack}>
                        Back to Other Menu
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
                <span onClick={() => navigate('/other')}>Other</span>
                <span> • </span>
                <span>{other.name}</span>
            </div>
            
            <div className="detail-content">
                <div className="detail-left">
                    <div className="detail-image">
                        {other.imageUrl && (
                            <img
                                src={other.imageUrl.startsWith('http') ? other.imageUrl : `${API_URL.split('/api')[0]}${other.imageUrl}`}
                                alt={other.name}
                            />
                        )}
                        {other.status === 'UNAVAILABLE' && (
                            <div className="sold-out-badge">Temporarily Out of Stock</div>
                        )}
                    </div>
                </div>
                
                <div className="detail-right">
                    <h1 className="detail-title">{other.name}</h1>
                    
                    <div className="detail-price">
                        {other.price ? `$${Number(other.price).toLocaleString()}` : 'Contact for Price'}
                    </div>
                    
                    <div className="detail-description">
                        <h3>Description</h3>
                        <p>{other.description || 'No description available.'}</p>
                    </div>
                    
                    {other.ingredients && (
                        <div className="detail-ingredients">
                            <h3>Ingredients</h3>
                            <p>{other.ingredients}</p>
                        </div>
                    )}
                    
                    <div className="detail-actions">
                        <div className="quantity-control">
                            <button 
                                className="quantity-btn" 
                                onClick={() => handleQuantityChange(-1)}
                                disabled={other.status === 'UNAVAILABLE'}
                            >
                                -
                            </button>
                            <span className="quantity-value">{quantity}</span>
                            <button 
                                className="quantity-btn" 
                                onClick={() => handleQuantityChange(1)}
                                disabled={other.status === 'UNAVAILABLE'}
                            >
                                +
                            </button>
                        </div>
                        
                        <button 
                            className={`add-cart-btn ${other.status === 'UNAVAILABLE' ? 'disabled' : ''}`}
                            onClick={addToCart}
                            disabled={other.status === 'UNAVAILABLE'}
                        >
                            {other.status === 'UNAVAILABLE' ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>
                    
                    <div className="back-section">
                        <button className="back-btn" onClick={handleGoBack}>
                            &larr; Back to Other
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Detail_Other;
