import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../../../../common/Layout/customer_layout';
import './Appetizers.css';
import { useNavigate } from 'react-router-dom';

const List_Appetizers = () => {
    const navigate = useNavigate();
    const [appetizers, setAppetizers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // 使用CartContext
    const { handleAddToCart } = useContext(CartContext);

    useEffect(() => {
        setLoading(true);
        setError('');
        axios.get('http://localhost:8080/api/foods')
            .then(res => {
                const appetizerItems = (res.data || []).filter(food => food.type === 'APPERTIZER');
                setAppetizers(appetizerItems);
                setLoading(false);
            })
            .catch(() => {
                setAppetizers([]);
                setLoading(false);
                setError('Failed to load appetizers');
            });
    }, []);

    const goToDetail = (id) => {
        navigate(`/appetizers/${id}`);
    };

    return (
        <div className="menu-container">
            <div className="menu-nav">
                <div className="breadcrumb">
                    <span onClick={() => navigate('/')}>Home</span>
                    <span> • </span>
                    <span>APPETIZER</span>
                </div>

                <h2 className="menu-title">Menu Appetizer</h2>

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
            ) : appetizers.length === 0 ? (
                <div className="pizza-empty">No appetizer items found.</div>
            ) : (
                <div className="menu-grid">
                    {appetizers.map((appetizer) => (
                        <div
                            className={`menu-item ${appetizer.status === 'UNAVAILABLE' ? 'p4-sold-out' : ''}`}
                            key={appetizer.id}
                            onClick={() => goToDetail(appetizer.id)}
                        >
                            <div className="pizza-image" style={{ position: 'relative' }}>
                                {appetizer.imageUrl && (
                                    <img
                                        src={appetizer.imageUrl.startsWith('http') ? appetizer.imageUrl : `http://localhost:8080${appetizer.imageUrl}`}
                                        alt={appetizer.name}
                                    />
                                )}
                                {appetizer.status === 'UNAVAILABLE' && (
                                    <div className="p4-soldout-badge">Sold Out</div>
                                )}
                            </div>
                            <div className="pizza-name">{appetizer.name}</div>
                            <div className="pizza-footer">
                                <div className="pizza-price">
                                    {appetizer.price ? (
                                        <span>{Number(appetizer.price).toLocaleString()} $</span>
                                    ) : (
                                        <span>Contact</span>
                                    )}
                                </div>
                                <button
                                    className="add-btn"
                                    disabled={appetizer.status === 'UNAVAILABLE'}
                                    onClick={(e) => {
                                        e.stopPropagation(); // 防止触发父元素的onClick
                                        if (appetizer.status !== 'UNAVAILABLE') {
                                            handleAddToCart({
                                                id: appetizer.id,
                                                name: appetizer.name,
                                                price: appetizer.price,
                                                quantity: 1,
                                                imageUrl: appetizer.imageUrl,
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

export default List_Appetizers;
