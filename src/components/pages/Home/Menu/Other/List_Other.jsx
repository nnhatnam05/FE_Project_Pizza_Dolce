import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../../../../common/Layout/customer_layout';
import './Other.css';
import { useNavigate } from 'react-router-dom';

const List_Other = () => {
    const navigate = useNavigate();
    const [others, setOthers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // 使用CartContext
    const { handleAddToCart } = useContext(CartContext);

    useEffect(() => {
        setLoading(true);
        setError('');
        axios.get('http://localhost:8080/api/foods')
            .then(res => {
                const otherItems = (res.data || []).filter(food => food.type === 'OTHER');
                setOthers(otherItems);
                setLoading(false);
            })
            .catch(() => {
                setOthers([]);
                setLoading(false);
                setError('Failed to load other');
            });
    }, []);

    const goToDetail = (id) => {
        navigate(`/other/${id}`);
    };

    return (
        <div className="menu-container">
            <div className="menu-nav">
                <div className="breadcrumb">
                    <span onClick={() => navigate('/')}>Home</span>
                    <span> • </span>
                    <span>OTHER</span>
                </div>

                <h2 className="menu-title">Menu Other</h2>

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
            ) : others.length === 0 ? (
                <div className="pizza-empty">No other items found.</div>
            ) : (
                <div className="menu-grid">
                    {others.map((other) => (
                        <div
                            className={`menu-item ${other.status === 'UNAVAILABLE' ? 'p4-sold-out' : ''}`}
                            key={other.id}
                            onClick={() => goToDetail(other.id)}
                        >
                            <div className="pizza-image" style={{ position: 'relative' }}>
                                {other.imageUrl && (
                                    <img
                                        src={other.imageUrl.startsWith('http') ? other.imageUrl : `http://localhost:8080${other.imageUrl}`}
                                        alt={other.name}
                                    />
                                )}
                                {other.status === 'UNAVAILABLE' && (
                                    <div className="p4-soldout-badge">Sold Out</div>
                                )}
                            </div>
                            <div className="pizza-name">{other.name}</div>
                            <div className="pizza-footer">
                                <div className="pizza-price">
                                    {other.price ? (
                                        <span>{Number(other.price).toLocaleString()} $</span>
                                    ) : (
                                        <span>Contact</span>
                                    )}
                                </div>
                                <button
                                    className="add-btn"
                                    disabled={other.status === 'UNAVAILABLE'}
                                    onClick={(e) => {
                                        e.stopPropagation(); // 防止触发父元素的onClick
                                        if (other.status !== 'UNAVAILABLE') {
                                            handleAddToCart({
                                                id: other.id,
                                                name: other.name,
                                                price: other.price,
                                                quantity: 1,
                                                imageUrl: other.imageUrl,
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

export default List_Other;
