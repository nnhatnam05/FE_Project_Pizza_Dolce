import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../../../../common/Layout/customer_layout';
import './Pasta-Main.css';
import { useNavigate } from 'react-router-dom';

const List_Pasta = () => {
    const navigate = useNavigate();
    const [pastas, setPastas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    

    const { handleAddToCart } = useContext(CartContext);

    useEffect(() => {
        setLoading(true);
        setError('');
        axios.get('http://localhost:8080/api/foods')
            .then(res => {
                const pastaItems = (res.data || []).filter(food => food.type === 'PASTA/MAIN');
                setPastas(pastaItems);
                setLoading(false);
            })
            .catch(() => {
                setPastas([]);
                setLoading(false);
                setError('Failed to load pasta/main');
            });
    }, []);

    const goToDetail = (id) => {
        navigate(`/pasta/${id}`);
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
                    <span>PASTA/MAIN</span>
                </div>

                <h2 className="menu-title">Menu Pasta/Main</h2>

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
            ) : pastas.length === 0 ? (
                <div className="pizza-empty">No pasta/main items found.</div>
            ) : (
                <div className="menu-grid">
                    {pastas.map((pasta) => (
                        <div
                            className={`menu-item ${pasta.status === 'UNAVAILABLE' ? 'p4-sold-out' : ''}`}
                            key={pasta.id}
                            onClick={() => goToDetail(pasta.id)}
                        >
                            <div className="pizza-image" style={{ position: 'relative' }}>
                                {pasta.imageUrl && (
                                    <img
                                        src={getFullImageUrl(pasta.imageUrl)}
                                        alt={pasta.name}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                        }}
                                    />
                                )}
                                {pasta.status === 'UNAVAILABLE' && (
                                    <div className="p4-soldout-badge">Sold Out</div>
                                )}
                            </div>
                            <div className="pizza-name">{pasta.name}</div>
                            <div className="pizza-footer">
                                <div className="pizza-price">
                                    {pasta.price ? (
                                        <span>{Number(pasta.price).toLocaleString()} $</span>
                                    ) : (
                                        <span>Contact</span>
                                    )}
                                </div>
                                <button
                                    className="add-btn"
                                    disabled={pasta.status === 'UNAVAILABLE'}
                                    onClick={(e) => {
                                        e.stopPropagation(); 
                                        if (pasta.status !== 'UNAVAILABLE') {

                                            handleAddToCart({
                                                id: pasta.id,
                                                name: pasta.name,
                                                price: pasta.price,
                                                quantity: 1,
                                                imageUrl: getFullImageUrl(pasta.imageUrl),
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

export default List_Pasta;
