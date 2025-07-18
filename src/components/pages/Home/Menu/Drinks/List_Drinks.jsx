import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomerLayout from '../../../../common/Layout/customer_layout';
import './Drink.css';
import { useNavigate } from 'react-router-dom';

const List_Pizza = () => {
    const navigate = useNavigate();
    const [pizzas, setPizzas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        setError('');
        axios.get('http://localhost:8080/api/foods')
            .then(res => {
                const pizzaItems = (res.data || []).filter(food => food.type === 'DRINK');
                setPizzas(pizzaItems);
                setLoading(false);
            })
            .catch(() => {
                setPizzas([]);
                setLoading(false);
                setError('Failed to load drinks');
            });
    }, []);

    const goToDetail = (id) => {
        navigate(`/drinks/${id}`);
    };

    return (
        <CustomerLayout>
            <div className="menu-container">
                <div className="menu-nav">
                    <div className="breadcrumb">
                        <span onClick={() => navigate('/')}>Home</span>
                        <span> • </span>
                        <span>DRINK</span>
                    </div>

                    <h2 className="menu-title">Menu Drink</h2>

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
                ) : pizzas.length === 0 ? (
                    <div className="pizza-empty">No drink items found.</div>
                ) : (
                    <div className="menu-grid">
                        {pizzas.map((drink) => (
                            <div
                                className={`menu-item ${drink.status === 'UNAVAILABLE' ? 'p4-sold-out' : ''}`}
                                key={drink.id}
                                onClick={() => goToDetail(drink.id)}
                            >
                                <div className="pizza-image" style={{ position: 'relative' }}>
                                    {drink.imageUrl && (
                                        <img
                                            src={drink.imageUrl.startsWith('http') ? drink.imageUrl : `http://localhost:8080${drink.imageUrl}`}
                                            alt={drink.name}
                                        />
                                    )}
                                    {drink.status === 'UNAVAILABLE' && (
                                        <div className="p4-soldout-badge">Sold Out</div>
                                    )}
                                </div>
                                <div className="pizza-name">{drink.name}</div>
                                <div className="pizza-footer">
                                    <div className="pizza-price">
                                        {drink.price ? (
                                            <span>{Number(drink.price).toLocaleString()} $</span>
                                        ) : (
                                            <span>Contact</span>
                                        )}
                                    </div>
                                    <button
                                        className="add-btn"
                                        disabled={drink.status === 'UNAVAILABLE'}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
};

export default List_Pizza;
