import React, { useState, useEffect } from 'react';
import '../../styles/main.css';
import axios from 'axios';
import CustomerLayout from '../../common/Layout/customer_layout';
import { useNavigate } from 'react-router-dom';

const Main = () => {
    const navigate = useNavigate();
    const [activeSlide, setActiveSlide] = useState(0);
    const [allFoods, setAllFoods] = useState([]);
    const [displayedFoods, setDisplayedFoods] = useState([]);
    const [foodsLoading, setFoodsLoading] = useState(true);
    const [foodsError, setFoodsError] = useState('');
    const [displayMode, setDisplayMode] = useState('limited'); // 'limited', 'all_pizza'

    const totalSlides = 6;

    // Auto-rotate slides
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSlide((prevSlide) => (prevSlide + 1) % totalSlides);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Fetch foods list
    useEffect(() => {
        setFoodsLoading(true);
        setFoodsError('');
        axios.get('http://localhost:8080/api/foods')
            .then(res => {
                setAllFoods(res.data || []);
                // Filter pizza items and limit to 8
                const pizzaItems = (res.data || []).filter(food => food.type === 'PIZZA');
                setDisplayedFoods(pizzaItems.slice(0, 8));
                setFoodsLoading(false);
            })
            .catch(err => {
                setAllFoods([]);
                setDisplayedFoods([]);
                setFoodsLoading(false);
                setFoodsError('Failed to load foods');
            });
    }, []);

    // Handle "See all" button click
    const handleSeeAllClick = () => {
        if (displayMode === 'limited') {
            const allPizzas = allFoods.filter(food => food.type === 'PIZZA');
            setDisplayedFoods(allPizzas);
            setDisplayMode('all_pizza');
        } else {
            const pizzaItems = allFoods.filter(food => food.type === 'PIZZA');
            setDisplayedFoods(pizzaItems.slice(0, 8));
            setDisplayMode('limited');
        }
    };

    const getCurrentSectionTitle = () => {
        switch (displayMode) {
            case 'limited':
                return 'Popular';
            case 'all_pizza':
                return 'All Popular Pizzas';
            default:
                return 'Popular';
        }
    };

    const getSeeAllButtonText = () => {
        switch (displayMode) {
            case 'limited':
                return 'See all Popular >>';
            case 'all_pizza':
                return 'Back >>';
            default:
                return 'See all >>';
        }
    };

    const goToDetail = (id) => {
        navigate(`/pizza/${id}`);
    };

    // Slide content 
    const slides = [
        { id: 1, title: "Summer Collection", description: "Experience the joy<br />with our limited<br />Summer Collection", buttonText: "ORDER NOW" },
        { id: 2, title: "Gift Voucher", description: "Give your loved ones<br />more than just a gift", buttonText: "SEND NOW" },
        { id: 3, title: "New Flavors", description: "Try our latest<br />seasonal specialties", buttonText: "ORDER NOW" },
        { id: 4, title: "Delivery Special", description: "Free delivery<br />on orders over $25", buttonText: "ORDER NOW" },
        { id: 5, title: "Weekend Deal", description: "20% off<br />all items on weekends", buttonText: "GET OFFER" },
        { id: 6, title: "Family Combo", description: "Perfect for<br />family gatherings", buttonText: "ORDER NOW" }
    ];

    return (
        <CustomerLayout>
            {/* MAIN CONTENT */}
            <div className="p4-main-container">
                <div className="p4-left-sidebar">
                    {[...Array(5)].map((_, index) => (
                        <div
                            key={index}
                            className={`p4-sidebar-dot ${index === activeSlide ? 'active' : ''}`}
                            onClick={() => setActiveSlide(index)}
                        ></div>
                    ))}
                </div>

                <div className="p4-slider">
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`p4-slide ${index === activeSlide ? 'active' : ''}`}
                            style={{ display: index === activeSlide ? 'block' : 'none' }}
                        >
                            <div className="p4-slide-content">
                                <div className="p4-summer-text">
                                    <div className="p4-summer-logo">
                                        {slide.title.split(' ').map((word, i) => (
                                            <span key={i}>{word}</span>
                                        ))}
                                    </div>
                                    <p className="p4-summer-desc" dangerouslySetInnerHTML={{ __html: slide.description }}></p>
                                </div>
                                <button className="p4-order-btn">{slide.buttonText}</button>
                            </div>
                        </div>
                    ))}
                    <div className="p4-slider-dots">
                        {slides.map((slide, index) => (
                            <span
                                key={slide.id}
                                className={`p4-dot ${index === activeSlide ? 'active' : ''}`}
                                onClick={() => setActiveSlide(index)}
                            ></span>
                        ))}
                    </div>
                </div>

                <div className="p4-right-sidebar">
                    <div className="p4-welcome-card">
                        <h3>Welcome to Dolce</h3>
                        <div className="p4-welcome-quote">
                            "Love does more than bring peace where there is conflict. It brings a different way of being in the world. Love has no meaning if it isn't shared. Love has to be put into action."
                        </div>
                        <div className="p4-welcome-author">— Mother Teresa</div>
                        <div className="p4-shop-info">
                            <div className="p4-shop-location">
                                Pickup at: <strong>Dolce Hub Downtown</strong>
                            </div>
                            <div className="p4-shop-hours">
                                Expected delivery: <strong>10:25 AM Today</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MENU CATEGORY */}
            <div className="p4-section-title">Menu</div>
            <nav className="p4-menu">
                <div className="p4-menu-item" onClick={() => navigate('/pizza')} style={{ cursor: "pointer" }}>
                    <div className="p4-menu-thumb delivery-combo"></div>
                    <div className="p4-menu-name">Pizza</div>
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
                    <div className="p4-menu-name">Pasta/Main Dish</div>
                </div>
                <div className="p4-menu-item" onClick={() => navigate('/other')} style={{ cursor: "pointer" }}>
                    <div className="p4-menu-thumb trang-mieng"></div>
                    <div className="p4-menu-name">Other</div>
                </div>
            </nav>

            {/* POPULAR ITEMS */}
            <section className="p4-popular">
                <div className="p4-popular-header">
                    <h2>{getCurrentSectionTitle()}</h2>
                    <span className="p4-link" onClick={handleSeeAllClick}>{getSeeAllButtonText()}</span>
                </div>
                <div className="p4-food-list">
                    {foodsLoading ? (
                        <div className="p4-loading">
                            <div className="p4-loading-spinner"></div>
                            <span>Loading delicious items...</span>
                        </div>
                    ) : foodsError ? (
                        <div className="p4-error">
                            <span>{foodsError}</span>
                            <button onClick={() => window.location.reload()} className="p4-retry-btn">Try Again</button>
                        </div>
                    ) : displayedFoods.length === 0 ? (
                        <div className="p4-empty">No foods found.</div>
                    ) : (
                        displayedFoods.map((food, idx) => (
                            <div 
                                className={`p4-food-card ${food.status === 'UNAVAILABLE' ? 'p4-sold-out' : ''}`} 
                                key={food.id || idx}
                                onClick={() => goToDetail(food.id)}
                            >
                                <div className="p4-food-thumb">
                                    {food.imageUrl && (
                                        <img
                                            src={food.imageUrl.startsWith('http') ? food.imageUrl : `http://localhost:8080${food.imageUrl}`}
                                            alt={food.name}
                                        />
                                    )}
                                    {food.status === 'UNAVAILABLE' && (
                                        <div className="p4-soldout-badge">
                                            <span>Sold Out</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p4-food-info">
                                    <div className="p4-food-title">{food.name}</div>
                                    <div className="p4-food-price">
                                        ${food.price?.toFixed ? food.price.toFixed(2) : food.price}
                                    </div>
                                    <button 
                                        className="p4-food-add" 
                                        disabled={food.status === 'UNAVAILABLE'}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* FEEDBACK */}
            <div className="p4-feedback">
                <span>How was your experience with our Delivery Page?</span>
                <div className="p4-feedback-icons">
                    <span className="p4-emoji p4-emoji-1">🙁</span>
                    <span className="p4-emoji p4-emoji-2">😕</span>
                    <span className="p4-emoji p4-emoji-3">😐</span>
                    <span className="p4-emoji p4-emoji-4">🙂</span>
                    <span className="p4-emoji p4-emoji-5">😊</span>
                </div>
            </div>

           
        </CustomerLayout>
    );
};

export default Main;
