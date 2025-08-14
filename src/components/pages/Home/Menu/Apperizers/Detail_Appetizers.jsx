import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../../../../common/Layout/customer_layout';
import './Appetizers.css';

const Detail_Appetizers = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [appetizer, setAppetizer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    
    // Sử dụng CartContext để thao tác giỏ hàng
    const { handleAddToCart } = useContext(CartContext);
    
    // API URL - replace with your actual API endpoint
    const API_URL = 'http://localhost:8080/api/foods';

    useEffect(() => {
        setLoading(true);
        setError('');
        
        // Direct API call without using axiosConfig
        axios.get(`${API_URL}/${id}`)
            .then(res => {
                if (res.data && res.data.type === 'APPERTIZER') {
                    setAppetizer(res.data);
                } else {
                    setError('Appetizer not found');
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching data:', err);
                setError('Failed to load appetizer details');
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
        if (appetizer && appetizer.status !== 'UNAVAILABLE') {
            handleAddToCart({
                id: appetizer.id,
                name: appetizer.name,
                price: appetizer.price,
                quantity: quantity,
                imageUrl: appetizer.imageUrl
            });
        }
    };

    const handleGoBack = () => {
        navigate('/appetizers');
    };

    if (loading) {
        return (
            <div className="detail-container">
                <div className="detail-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading appetizer details...</p>
                </div>
            </div>
        );
    }

    if (error || !appetizer) {
        return (
            <div className="detail-container">
                <div className="detail-error">
                    <h2>Error</h2>
                    <p>{error || 'Appetizer not found'}</p>
                    <button className="back-button" onClick={handleGoBack}>
                        Back to Appetizers Menu
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
                <span onClick={() => navigate('/appetizers')}>Appetizers</span>
                <span> • </span>
                <span>{appetizer.name}</span>
            </div>
            
            <div className="detail-content">
                <div className="detail-left">
                    <div className="detail-image">
                        {appetizer.imageUrl && (
                            <img
                                src={appetizer.imageUrl.startsWith('http') ? appetizer.imageUrl : `${API_URL.split('/api')[0]}${appetizer.imageUrl}`}
                                alt={appetizer.name}
                            />
                        )}
                        {appetizer.status === 'UNAVAILABLE' && (
                            <div className="sold-out-badge">Temporarily Out of Stock</div>
                        )}
                    </div>
                </div>
                
                <div className="detail-right">
                    <h1 className="detail-title">{appetizer.name}</h1>
                    
                    <div className="detail-price">
                        {appetizer.price ? `$${Number(appetizer.price).toLocaleString()}` : 'Contact for Price'}
                    </div>
                    
                    <div className="detail-description">
                        <h3>Description</h3>
                        <p>{appetizer.description || 'No description available.'}</p>
                    </div>
                    
                    {appetizer.ingredients && (
                        <div className="detail-ingredients">
                            <h3>Ingredients</h3>
                            <p>{appetizer.ingredients}</p>
                        </div>
                    )}
                    
                    <div className="detail-actions">
                        <div className="quantity-control">
                            <button 
                                className="quantity-btn" 
                                onClick={() => handleQuantityChange(-1)}
                                disabled={appetizer.status === 'UNAVAILABLE'}
                            >
                                -
                            </button>
                            <span className="quantity-value">{quantity}</span>
                            <button 
                                className="quantity-btn" 
                                onClick={() => handleQuantityChange(1)}
                                disabled={appetizer.status === 'UNAVAILABLE'}
                            >
                                +
                            </button>
                        </div>
                        
                        <button 
                            className={`add-cart-btn ${appetizer.status === 'UNAVAILABLE' ? 'disabled' : ''}`}
                            onClick={addToCart}
                            disabled={appetizer.status === 'UNAVAILABLE'}
                        >
                            {appetizer.status === 'UNAVAILABLE' ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>
                    
                    <div className="back-section">
                        <button className="back-btn" onClick={handleGoBack}>
                            &larr; Back to Appetizers Menu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Detail_Appetizers;
