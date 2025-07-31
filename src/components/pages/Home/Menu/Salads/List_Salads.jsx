import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../../../../common/Layout/customer_layout';
import './Salad.css';
import { useNavigate } from 'react-router-dom';

const List_Salads = () => {
    const navigate = useNavigate();
    const [salads, setSalads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // 使用CartContext
    const { handleAddToCart } = useContext(CartContext);

    useEffect(() => {
        setLoading(true);
        setError('');
        axios.get('http://localhost:8080/api/foods')
            .then(res => {
                const saladItems = (res.data || []).filter(food => food.type === 'SALAD');
                setSalads(saladItems);
                setLoading(false);
            })
            .catch(() => {
                setSalads([]);
                setLoading(false);
                setError('Failed to load salads');
            });
    }, []);

    const goToDetail = (id) => {
        navigate(`/salads/${id}`);
    };


    const getFullImageUrl = (imageUrl) => {
        if (!imageUrl) return 'https://via.placeholder.com/150?text=No+Image';
        return imageUrl.startsWith('http') 
            ? imageUrl 
            : `http://localhost:8080${imageUrl}`;
    };

    return (
        <div className="menu-container">
            <div className="menu-nav">
                <div className="breadcrumb">
                    <span onClick={() => navigate('/')}>Home</span>
                    <span> • </span>
                    <span>SALAD</span>
                </div>

                <h2 className="menu-title">Menu Salad</h2>

                <div className="menu-tabs">
                    <nav className="p4-menu">
                        <div className="p4-menu-item" onClick={() => navigate('/pizza')} style={{ cursor: "pointer" }}>
                            <div className="p4-menu-thumb delivery-combo"></div>
                            <div className="p4-menu-name" >Pizza</div>
                        </div>
                        <div className="p4-menu-item" onClick={() => navigate('/appetizers')} style={{ cursor: "pointer" }}>
                            <div className="p4-menu-thumb banh-pizza"></div>
                            <div className="p4-menu-name">Appetizers</div>
                        </div>
                        <div className="p4-menu-item" onClick={() => navigate('/salads')} style={{ cursor: "pointer" }}>
                            <div className="p4-menu-thumb khai-vi"></div>
                            <div className="p4-menu-name">Salads</div>
                        </div>
                        <div className="p4-menu-item" onClick={() => navigate('/drinks')} style={{ cursor: "pointer" }}>
                            <div className="p4-menu-thumb salad"></div>
                            <div className="p4-menu-name">Drinks</div>
                        </div>
                        <div className="p4-menu-item" onClick={() => navigate('/pasta')} style={{ cursor: "pointer" }}>
                            <div className="p4-menu-thumb mon-chinh"></div>
                            <div className="p4-menu-name">Pasta/Main</div>
                        </div>
                        <div className="p4-menu-item" onClick={() => navigate('/other')} style={{ cursor: "pointer" }}>
                            <div className="p4-menu-thumb trang-mieng"></div>
                            <div className="p4-menu-name">Other</div>
                        </div>
                    </nav>
                </div>
            </div>

            {loading ? (
                <div className="pizza-loading">Loading...</div>
            ) : error ? (
                <div className="pizza-error">{error}</div>
            ) : salads.length === 0 ? (
                <div className="pizza-empty">No salad items found.</div>
            ) : (
                <div className="menu-grid">
                    {salads.map((salad) => (
                        <div
                            className={`menu-item ${salad.status === 'UNAVAILABLE' ? 'p4-sold-out' : ''}`}
                            key={salad.id}
                            onClick={() => goToDetail(salad.id)}
                        >
                            <div className="pizza-image" style={{ position: 'relative' }}>
                                {salad.imageUrl && (
                                    <img
                                        src={getFullImageUrl(salad.imageUrl)}
                                        alt={salad.name}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                        }}
                                    />
                                )}
                                {salad.status === 'UNAVAILABLE' && (
                                    <div className="p4-soldout-badge">Sold Out</div>
                                )}
                            </div>
                            <div className="pizza-name">{salad.name}</div>
                            <div className="pizza-footer">
                                <div className="pizza-price">
                                    {salad.price ? (
                                        <span>{Number(salad.price).toLocaleString()} $</span>
                                    ) : (
                                        <span>Contact</span>
                                    )}
                                </div>
                                <button
                                    className="add-btn"
                                    disabled={salad.status === 'UNAVAILABLE'}
                                    onClick={(e) => {
                                        e.stopPropagation(); 
                                        if (salad.status !== 'UNAVAILABLE') {
                                            handleAddToCart({
                                                id: salad.id,
                                                name: salad.name,
                                                price: salad.price,
                                                quantity: 1,
                                                imageUrl: getFullImageUrl(salad.imageUrl)
                                            });
                                        }
                                    }}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default List_Salads;
