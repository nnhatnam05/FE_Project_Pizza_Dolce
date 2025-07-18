import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomerLayout from '../../../../common/Layout/customer_layout';
import './Appetizers.css';

const Detail_Appetizers = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [appertizers, setAppertizers] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    
    // API URL - replace with your actual API endpoint
    const API_URL = 'http://localhost:8080/api/foods';

    useEffect(() => {
        setLoading(true);
        setError('');
        
        // Direct API call without using axiosConfig
        axios.get(`${API_URL}/${id}`)
            .then(res => {
                if (res.data && res.data.type === 'APPERTIZER') {
                    setAppertizers(res.data);
                } else {
                    setError('Appetizers not found');
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching data:', err);
                setError('Failed to load appetizers details');
                setLoading(false);
            });
    }, [id]);

    const handleQuantityChange = (amount) => {
        const newQuantity = quantity + amount;
        if (newQuantity >= 1) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = () => {
        // Add to cart functionality would go here
        // You can implement your API call to add to cart
        if (appertizers && appertizers.status !== 'UNAVAILABLE') {
            alert(`Added ${quantity} ${appertizers.name} to cart`);
        } else {
            alert('This item is currently unavailable');
        }
    };

    const handleGoBack = () => {
        navigate('/appetizers');
    };

    if (loading) {
        return (
            <CustomerLayout>
                <div className="detail-container">
                    <div className="detail-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading appetizers details...</p>
                    </div>
                </div>
            </CustomerLayout>
        );
    }

    if (error || !appertizers) {
        return (
            <CustomerLayout>
                <div className="detail-container">
                    <div className="detail-error">
                        <h2>Error</h2>
                        <p>{error || 'Appetizers not found'}</p>
                        <button className="back-button" onClick={handleGoBack}>
                            Back to Appetizers Menu
                        </button>
                    </div>
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>
            <div className="detail-container">
                <div className="breadcrumb">
                    <span onClick={() => navigate('/')}>Home</span>
                    <span> • </span>
                    <span onClick={() => navigate('/appetizers')}>Appetizers</span>
                    <span> • </span>
                    <span>{appertizers.name}</span>
                </div>
                
                <div className="detail-content">
                    <div className="detail-left">
                        <div className="detail-image">
                            {appertizers.imageUrl && (
                                <img
                                    src={appertizers.imageUrl.startsWith('http') ? appertizers.imageUrl : `${API_URL.split('/api')[0]}${appertizers.imageUrl}`}
                                    alt={appertizers.name}
                                />
                            )}
                            {appertizers.status === 'UNAVAILABLE' && (
                                <div className="sold-out-badge">Temporarily Out of Stock</div>
                            )}
                        </div>
                    </div>
                    
                    <div className="detail-right">
                        <h1 className="detail-title">{appertizers.name}</h1>
                        
                        <div className="detail-price">
                            {appertizers.price ? `$${Number(appertizers.price).toLocaleString()}` : 'Contact for Price'}
                        </div>
                        
                        <div className="detail-description">
                            <h3>Description</h3>
                            <p>{appertizers.description || 'No description available.'}</p>
                        </div>
                        
                        {appertizers.ingredients && (
                            <div className="detail-ingredients">
                                <h3>Ingredients</h3>
                                <p>{appertizers.ingredients}</p>
                            </div>
                        )}
                        
                        <div className="detail-actions">
                            <div className="quantity-control">
                                <button 
                                    className="quantity-btn" 
                                    onClick={() => handleQuantityChange(-1)}
                                    disabled={appertizers.status === 'UNAVAILABLE'}
                                >
                                    -
                                </button>
                                <span className="quantity-value">{quantity}</span>
                                <button 
                                    className="quantity-btn" 
                                    onClick={() => handleQuantityChange(1)}
                                    disabled={appertizers.status === 'UNAVAILABLE'}
                                >
                                    +
                                </button>
                            </div>
                            
                            <button 
                                className={`add-cart-btn ${appertizers.status === 'UNAVAILABLE' ? 'disabled' : ''}`}
                                onClick={handleAddToCart}
                                disabled={appertizers.status === 'UNAVAILABLE'}
                            >
                                {appertizers.status === 'UNAVAILABLE' ? 'Out of Stock' : 'Add to Cart'}
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
        </CustomerLayout>
    );
};

export default Detail_Appetizers;
