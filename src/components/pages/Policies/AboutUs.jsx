import React from 'react';
import './PoliciesGlobal.css';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessIcon from '@mui/icons-material/Business';
import HistoryIcon from '@mui/icons-material/History';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PeopleIcon from '@mui/icons-material/People';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

const AboutUs = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="policies-page-wrapper">
            {/* Back Button */}
            <button className="policies-back-button" onClick={handleBack}>
                <ArrowBackIcon />
                <span>Back</span>
            </button>

            {/* Header Section */}
            <div className="policies-header-section">
                <h1 className="policies-page-title">
                    <BusinessIcon style={{ marginRight: '10px' }} />
                    About Us - DOLCE
                </h1>
                <p className="policies-page-subtitle">
                    Discover our story and mission - Leading Italian restaurant chain
                </p>
            </div>

            {/* Company Introduction Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <RestaurantIcon style={{ marginRight: '10px' }} />
                    Company Introduction
                </h2>
                <div className="policies-section-content">
                    <div className="policies-mb-20">
                        <h3 style={{ color: '#232f54', fontSize: '1.4rem', marginBottom: '15px' }}>
                            🍕 DOLCE - Authentic Taste of Italy
                        </h3>
                        <p>
                            DOLCE is a leading Italian restaurant chain serving traditional Italian dishes with
                            authentic flavors. We proudly deliver a true Italian dining experience from our
                            signature pizzas to pastas, salads, and classic desserts.
                        </p>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
                        <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <h4 style={{ fontSize: '2rem', color: '#232f54', marginBottom: '10px' }}>🏪 15+</h4>
                            <p style={{ color: '#666' }}>Branches</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <h4 style={{ fontSize: '2rem', color: '#232f54', marginBottom: '10px' }}>👥 500+</h4>
                            <p style={{ color: '#666' }}>Employees</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <h4 style={{ fontSize: '2rem', color: '#232f54', marginBottom: '10px' }}>🍽️ 100+</h4>
                            <p style={{ color: '#666' }}>Dishes</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <h4 style={{ fontSize: '2rem', color: '#232f54', marginBottom: '10px' }}>⭐ 4.8/5</h4>
                            <p style={{ color: '#666' }}>Rating</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Company History Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <HistoryIcon style={{ marginRight: '10px' }} />
                    Our History
                </h2>
                <div className="policies-section-content">
                    <div style={{ display: 'grid', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div style={{ background: '#232f54', color: 'white', padding: '10px 15px', borderRadius: '20px', fontWeight: 'bold', minWidth: '80px', textAlign: 'center' }}>
                                2020
                            </div>
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>🎯 Founded</h4>
                                <p>DOLCE opened its first flagship restaurant downtown</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div style={{ background: '#232f54', color: 'white', padding: '10px 15px', borderRadius: '20px', fontWeight: 'bold', minWidth: '80px', textAlign: 'center' }}>
                                2021
                            </div>
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>🚀 Expansion</h4>
                                <p>Added 3 new branches and launched delivery service</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div style={{ background: '#232f54', color: 'white', padding: '10px 15px', borderRadius: '20px', fontWeight: 'bold', minWidth: '80px', textAlign: 'center' }}>
                                2022
                            </div>
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>💻 Digitalization</h4>
                                <p>Built modern ordering app and management systems</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div style={{ background: '#232f54', color: 'white', padding: '10px 15px', borderRadius: '20px', fontWeight: 'bold', minWidth: '80px', textAlign: 'center' }}>
                                2023
                            </div>
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>🏆 Milestones</h4>
                                <p>Reached 10 branches and won "Best Italian Restaurant"</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div style={{ background: '#232f54', color: 'white', padding: '10px 15px', borderRadius: '20px', fontWeight: 'bold', minWidth: '80px', textAlign: 'center' }}>
                                2024
                            </div>
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>🌟 Beyond</h4>
                                <p>Expanded to 15 branches and grew international services</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div style={{ background: '#232f54', color: 'white', padding: '10px 15px', borderRadius: '20px', fontWeight: 'bold', minWidth: '80px', textAlign: 'center' }}>
                                2025
                            </div>
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>🚀 The Future</h4>
                                <p>Continuing expansion and service innovation</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vision & Mission Section */}
            <div className="policies-highlight-section">
                <h2 className="policies-highlight-title">
                    <VisibilityIcon style={{ marginRight: '10px' }} />
                    Vision & Mission
                </h2>
                <div className="policies-highlight-content">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '30px' }}>
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '20px', borderRadius: '10px' }}>
                            <h3 style={{ color: '#ffd700', marginBottom: '15px' }}>🔮 Vision</h3>
                            <p>
                                Become the leading Italian restaurant chain in Vietnam, offering authentic Italian
                                dining experiences and top-tier service for every customer.
                            </p>
                        </div>
                        
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '20px', borderRadius: '10px' }}>
                            <h3 style={{ color: '#ffd700', marginBottom: '15px' }}>🎯 Mission</h3>
                            <p>
                                Serve traditional Italian cuisine using premium ingredients, with professional
                                service and delightful customer experiences.
                            </p>
                        </div>
                    </div>
                    
                    <div>
                        <h3 style={{ color: '#ffd700', marginBottom: '20px' }}>💎 Core Values</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '15px', borderRadius: '10px' }}>
                                <h4 style={{ color: '#ffd700', marginBottom: '10px' }}>🍕 Quality</h4>
                                <p>Always use fresh ingredients and traditional recipes</p>
                            </div>
                            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '15px', borderRadius: '10px' }}>
                                <h4 style={{ color: '#ffd700', marginBottom: '10px' }}>👥 People</h4>
                                <p>Professional and friendly team</p>
                            </div>
                            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '15px', borderRadius: '10px' }}>
                                <h4 style={{ color: '#ffd700', marginBottom: '10px' }}>💡 Innovation</h4>
                                <p>Continuously improve and adopt new technologies</p>
                            </div>
                            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '15px', borderRadius: '10px' }}>
                                <h4 style={{ color: '#ffd700', marginBottom: '10px' }}>🤝 Integrity</h4>
                                <p>Build trust through consistent service quality</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team & Leadership Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <PeopleIcon style={{ marginRight: '10px' }} />
                    Team & Leadership
                </h2>
                <div className="policies-section-content">
                    <div className="policies-mb-20">
                        <h3 style={{ color: '#232f54', fontSize: '1.4rem', marginBottom: '15px' }}>
                            👨‍🍳 Professional Team
                        </h3>
                        <p>
                            DOLCE is proud to have professional Italian chefs trained at renowned culinary
                            schools. We are committed to delivering authentic Italian flavors in every dish.
                        </p>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginTop: '30px' }}>
                        <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '15px' }}>
                            <div style={{ width: '80px', height: '80px', background: '#232f54', borderRadius: '50%', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem' }}>
                                👨‍💼
                            </div>
                            <h4 style={{ color: '#232f54', marginBottom: '10px' }}>Chief Executive Officer</h4>
                            <p style={{ fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>Nguyen Van A</p>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>15+ years of experience in F&B</p>
                        </div>
                        
                        <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '15px' }}>
                            <div style={{ width: '80px', height: '80px', background: '#232f54', borderRadius: '50%', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem' }}>
                                👨‍🍳
                            </div>
                            <h4 style={{ color: '#232f54', marginBottom: '10px' }}>Head Chef</h4>
                            <p style={{ fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>Marco Rossi</p>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>Italian chef with 20+ years of experience</p>
                        </div>
                        
                        <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '15px' }}>
                            <div style={{ width: '80px', height: '80px', background: '#232f54', borderRadius: '50%', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem' }}>
                                👩‍💼
                            </div>
                            <h4 style={{ color: '#232f54', marginBottom: '10px' }}>Business Director</h4>
                            <p style={{ fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>Tran Thi B</p>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>Market development specialist</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Awards & Recognition Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <NewReleasesIcon style={{ marginRight: '10px' }} />
                    Awards & Recognition
                </h2>
                <div className="policies-section-content">
                    <div className="policies-mb-20">
                        <h3 style={{ color: '#232f54', fontSize: '1.4rem', marginBottom: '15px' }}>
                            🏆 Our Proud Achievements
                        </h3>
                        <p>
                            Throughout our journey, DOLCE has received numerous awards and recognition
                            from customers and reputable organizations.
                        </p>
                    </div>
                    
                    <div style={{ display: 'grid', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div style={{ background: '#ffd700', color: '#232f54', padding: '8px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                🥇 2023
                            </div>
                            <p>"Best Italian Restaurant" - Vietnam Culinary Magazine</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div style={{ background: '#ffd700', color: '#232f54', padding: '8px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                🥈 2022
                            </div>
                            <p>"Fastest-Growing Restaurant Chain" - Restaurant Association</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div style={{ background: '#ffd700', color: '#232f54', padding: '8px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                🥉 2021
                            </div>
                            <p>"Outstanding Customer Service" - Ministry of Culture</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div style={{ background: '#ffd700', color: '#232f54', padding: '8px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                ⭐ 2020-2024
                            </div>
                            <p>Rated 4.8/5 by 50,000+ customers</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Information Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <LocationOnIcon style={{ marginRight: '10px' }} />
                    Contact Information
                </h2>
                <div className="policies-section-content">
                    <div className="policies-mb-20">
                        <h3 style={{ color: '#232f54', fontSize: '1.4rem', marginBottom: '15px' }}>
                            📍 Headquarters
                        </h3>
                        <p>123 Main Street, Downtown, New York, NY 10001</p>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <PhoneIcon style={{ color: '#232f54', fontSize: '2rem' }} />
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>Điện Thoại</h4>
                                <p style={{ color: '#666' }}>+1-800-DOLCE</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <EmailIcon style={{ color: '#232f54', fontSize: '2rem' }} />
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>Email</h4>
                                <p style={{ color: '#666' }}>info@dolce.com</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <LocationOnIcon style={{ color: '#232f54', fontSize: '2rem' }} />
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>Website</h4>
                                <p style={{ color: '#666' }}>www.dolce.com</p>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 style={{ color: '#232f54', fontSize: '1.4rem', marginBottom: '15px' }}>
                            🕐 Giờ Làm Việc
                        </h3>
                        <div style={{ display: 'grid', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                                <span style={{ fontWeight: 'bold', color: '#232f54' }}>Thứ 2 - Thứ 6:</span>
                                <span style={{ color: '#666' }}>7:00 - 22:00</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                                <span style={{ fontWeight: 'bold', color: '#232f54' }}>Thứ 7:</span>
                                <span style={{ color: '#666' }}>8:00 - 23:00</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                                <span style={{ fontWeight: 'bold', color: '#232f54' }}>Chủ Nhật:</span>
                                <span style={{ color: '#666' }}>9:00 - 21:00</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Section */}
            <div className="policies-footer-section">
                <p className="policies-footer-text">
                    DOLCE - Where Italian flavors meet the love of Vietnamese cuisine
                </p>
                <p className="policies-copyright">
                    © 2025 DOLCE. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default AboutUs; 