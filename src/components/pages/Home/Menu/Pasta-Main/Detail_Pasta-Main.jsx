import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../../../../common/Layout/customer_layout';
import './Pasta-Main.css';

const Detail_Pasta = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pasta, setPasta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    

    const { handleAddToCart } = useContext(CartContext);
    
    // API URL - replace with your actual API endpoint
    const API_URL = 'http://localhost:8080/api/foods';

    useEffect(() => {
        setLoading(true);
        setError('');
        
        // Direct API call without using axiosConfig
        axios.get(`${API_URL}/${id}`)
            .then(res => {
                if (res.data && res.data.type === 'PASTA/MAIN') {
                    setPasta(res.data);
                } else {
                    setError('Pasta/Main not found');
                    setLoading(false);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching data:', err);
                setError('Failed to load pasta/main details');
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
        if (pasta && pasta.status !== 'UNAVAILABLE') {

            let formattedImageUrl = pasta.imageUrl;
            

            handleAddToCart({
                id: pasta.id,
                name: pasta.name,
                price: pasta.price,
                quantity: quantity,
                imageUrl: formattedImageUrl
            });
        }
    };

    const handleGoBack = () => {
        navigate('/pasta');
    };

    if (loading) {
        return (
            <div className="detail-container">
                <div className="detail-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading pasta/main details...</p>
                </div>
            </div>
        );
    }

    if (error || !pasta) {
        return (
            <div className="detail-container">
                <div className="detail-error">
                    <h2>Error</h2>
                    <p>{error || 'Pasta/Main not found'}</p>
                    <button className="back-button" onClick={handleGoBack}>
                        Back to Pasta/Main Menu
                    </button>
                </div>
            </div>
        );
    }

 
    const getImageUrl = () => {
        if (!pasta.imageUrl) return null;
        return pasta.imageUrl.startsWith('http')
            ? pasta.imageUrl
            : `${API_URL.split('/api')[0]}${pasta.imageUrl}`;
    };

    return (
        <div className="detail-container">
            <div className="breadcrumb">
                <span onClick={() => navigate('/')}>Home</span>
                <span> • </span>
                <span onClick={() => navigate('/pasta')}>Pasta/Main</span>
                <span> • </span>
                <span>{pasta.name}</span>
            </div>
            
            <div className="detail-content">
                <div className="detail-left">
                    <div className="detail-image">
                        {pasta.imageUrl && (
                            <img
                                src={getImageUrl()}
                                alt={pasta.name}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/300?text=No+Image';
                                }}
                            />
                        )}
                        {pasta.status === 'UNAVAILABLE' && (
                            <div className="sold-out-badge">Temporarily Out of Stock</div>
                        )}
                    </div>
                </div>
                
                <div className="detail-right">
                    <h1 className="detail-title">{pasta.name}</h1>
                    
                    <div className="detail-price">
                        {pasta.price ? `${Number(pasta.price).toLocaleString()} $` : 'Contact for Price'}
                    </div>
                    
                    <div className="detail-description">
                        <h3>Description</h3>
                        <p>{pasta.description || 'No description available.'}</p>
                    </div>
                    
                    {pasta.ingredients && (
                        <div className="detail-ingredients">
                            <h3>Ingredients</h3>
                            <p>{pasta.ingredients}</p>
                        </div>
                    )}
                    
                    <div className="detail-actions">
                        <div className="quantity-control">
                            <button 
                                className="quantity-btn" 
                                onClick={() => handleQuantityChange(-1)}
                                disabled={pasta.status === 'UNAVAILABLE'}
                            >
                                -
                            </button>
                            <span className="quantity-value">{quantity}</span>
                            <button 
                                className="quantity-btn" 
                                onClick={() => handleQuantityChange(1)}
                                disabled={pasta.status === 'UNAVAILABLE'}
                            >
                                +
                            </button>
                        </div>
                        
                        <button 
                            className={`add-cart-btn ${pasta.status === 'UNAVAILABLE' ? 'disabled' : ''}`}
                            onClick={addToCart}
                            disabled={pasta.status === 'UNAVAILABLE'}
                        >
                            {pasta.status === 'UNAVAILABLE' ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>
                    
                    <div className="back-section">
                        <button className="back-btn" onClick={handleGoBack}>
                            &larr; Back to Pasta/Main Menu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Detail_Pasta;
