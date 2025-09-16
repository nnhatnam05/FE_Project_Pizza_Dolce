import React from 'react';
import './PoliciesGlobal.css';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SecurityIcon from '@mui/icons-material/Security';
import TimelineIcon from '@mui/icons-material/Timeline';
import SupportIcon from '@mui/icons-material/Support';
import InfoIcon from '@mui/icons-material/Info';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PaymentIcon from '@mui/icons-material/Payment';
import PhoneIcon from '@mui/icons-material/Phone';

const DeliveryPolicy = () => {
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
                    <LocalShippingIcon style={{ marginRight: '10px' }} />
                    Delivery Policy
                </h1>
                <p className="policies-page-subtitle">
                    Detailed information about DOLCE's delivery process and shipping services
                </p>
            </div>

            {/* Main Delivery Process Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <TimelineIcon style={{ marginRight: '10px' }} />
                    Delivery Process
                </h2>
                <div className="policies-section-content">
                    <div className="policies-mb-20">
                        <h3 style={{ color: '#232f54', fontSize: '1.4rem', marginBottom: '15px' }}>
                            🚚 Automated Delivery Workflow
                        </h3>
                        <p>
                            After successful payment, your order is handed over to the courier and delivered to the
                            address you provided during checkout.
                        </p>
                    </div>
                    
                    <div style={{ display: 'grid', gap: '20px', marginTop: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '15px' }}>
                            <div style={{ background: '#232f54', color: 'white', padding: '12px 18px', borderRadius: '50%', fontWeight: 'bold', fontSize: '1.2rem', minWidth: '50px', textAlign: 'center' }}>
                                1
                            </div>
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '10px', fontSize: '1.2rem' }}>Payment Confirmed</h4>
                                <p style={{ color: '#666', lineHeight: '1.6' }}>Order is confirmed and handed to courier</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '15px' }}>
                            <div style={{ background: '#232f54', color: 'white', padding: '12px 18px', borderRadius: '50%', fontWeight: 'bold', fontSize: '1.2rem', minWidth: '50px', textAlign: 'center' }}>
                                2
                            </div>
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '10px', fontSize: '1.2rem' }}>Handover</h4>
                                <p style={{ color: '#666', lineHeight: '1.6' }}>Courier receives the package and starts delivery</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '15px' }}>
                            <div style={{ background: '#232f54', color: 'white', padding: '12px 18px', borderRadius: '50%', fontWeight: 'bold', fontSize: '1.2rem', minWidth: '50px', textAlign: 'center' }}>
                                3
                            </div>
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '10px', fontSize: '1.2rem' }}>Delivered</h4>
                                <p style={{ color: '#666', lineHeight: '1.6' }}>Courier delivers to your address and updates status</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Real-time Tracking Section */}
            <div className="policies-highlight-section">
                <h2 className="policies-highlight-title">
                    <InfoIcon style={{ marginRight: '10px' }} />
                    Real-time Order Tracking
                </h2>
                <div className="policies-highlight-content">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '30px' }}>
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '25px', borderRadius: '15px' }}>
                            <h3 style={{ color: '#ffd700', marginBottom: '20px', fontSize: '1.3rem' }}>
                                📱 Automatic Status Updates
                            </h3>
                            <p>
                                Order status updates in real time on the delivery detail screen so you can follow
                                every step.
                            </p>
                        </div>
                        
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '25px', borderRadius: '15px' }}>
                            <h3 style={{ color: '#ffd700', marginBottom: '20px', fontSize: '1.3rem' }}>
                                🎯 Tracking Features
                            </h3>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <LocationOnIcon style={{ color: '#ffd700' }} />
                                    <span>Live courier location</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <AccessTimeIcon style={{ color: '#ffd700' }} />
                                    <span>Estimated delivery time</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <PaymentIcon style={{ color: '#ffd700' }} />
                                    <span>Payment status</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delivery Areas Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <LocationOnIcon style={{ marginRight: '10px' }} />
                    Delivery Areas
                </h2>
                <div className="policies-section-content">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                            <h3 style={{ color: '#232f54', marginBottom: '15px' }}>🏙️ Downtown</h3>
                            <p style={{ color: '#666', marginBottom: '10px' }}>Range: 5km</p>
                            <p style={{ color: '#666', marginBottom: '10px' }}>Time: 30-45 minutes</p>
                            <p style={{ color: '#666' }}>Fee: 15,000đ</p>
                        </div>
                        
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                            <h3 style={{ color: '#232f54', marginBottom: '15px' }}>🏘️ Suburban</h3>
                            <p style={{ color: '#666', marginBottom: '10px' }}>Range: 5-10km</p>
                            <p style={{ color: '#666', marginBottom: '10px' }}>Time: 45-60 minutes</p>
                            <p style={{ color: '#666' }}>Fee: 25,000đ</p>
                        </div>
                        
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                            <h3 style={{ color: '#232f54', marginBottom: '15px' }}>🌆 Further</h3>
                            <p style={{ color: '#666', marginBottom: '10px' }}>Range: 10-15km</p>
                            <p style={{ color: '#666', marginBottom: '10px' }}>Time: 60-90 minutes</p>
                            <p style={{ color: '#666' }}>Fee: 35,000đ</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delivery Time Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <AccessTimeIcon style={{ marginRight: '10px' }} />
                    Delivery Time
                </h2>
                <div className="policies-section-content">
                    <div style={{ display: 'grid', gap: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>🌅 Morning (7:00 - 11:00)</h4>
                                <p style={{ color: '#666' }}>Delivered within 30-45 minutes</p>
                            </div>
                            <div style={{ background: '#232f54', color: 'white', padding: '8px 15px', borderRadius: '20px', fontSize: '0.9rem' }}>
                                Nhanh
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>☀️ Noon (11:00 - 14:00)</h4>
                                <p style={{ color: '#666' }}>Delivered within 45-60 minutes</p>
                            </div>
                            <div style={{ background: '#f39c12', color: 'white', padding: '8px 15px', borderRadius: '20px', fontSize: '0.9rem' }}>
                                Bình thường
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>🌆 Afternoon (14:00 - 18:00)</h4>
                                <p style={{ color: '#666' }}>Delivered within 45-60 minutes</p>
                            </div>
                            <div style={{ background: '#f39c12', color: 'white', padding: '8px 15px', borderRadius: '20px', fontSize: '0.9rem' }}>
                                Bình thường
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>🌙 Evening (18:00 - 22:00)</h4>
                                <p style={{ color: '#666' }}>Delivered within 60-90 minutes</p>
                            </div>
                            <div style={{ background: '#e74c3c', color: 'white', padding: '8px 15px', borderRadius: '20px', fontSize: '0.9rem' }}>
                                Chậm
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delivery Fees Section */}
            <div className="policies-highlight-section">
                <h2 className="policies-highlight-title">
                    <PaymentIcon style={{ marginRight: '10px' }} />
                    Delivery Fees & Promotions
                </h2>
                <div className="policies-highlight-content">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '30px' }}>
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '25px', borderRadius: '15px' }}>
                            <h3 style={{ color: '#ffd700', marginBottom: '20px', fontSize: '1.3rem' }}>
                                💰 Base Delivery Fees
                            </h3>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Downtown (≤5km):</span>
                                    <span style={{ fontWeight: 'bold' }}>15,000đ</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Suburban (5-10km):</span>
                                    <span style={{ fontWeight: 'bold' }}>25,000đ</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Further (10-15km):</span>
                                    <span style={{ fontWeight: 'bold' }}>35,000đ</span>
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '25px', borderRadius: '15px' }}>
                            <h3 style={{ color: '#ffd700', marginBottom: '20px', fontSize: '1.3rem' }}>
                                🎉 Delivery Promotions
                            </h3>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ color: '#ffd700', fontSize: '1.2rem' }}>🎁</span>
                                    <span>Free delivery for orders from 500,000đ</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ color: '#ffd700', fontSize: '1.2rem' }}>🎁</span>
                                    <span>50% off delivery fee for VIP customers</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ color: '#ffd700', fontSize: '1.2rem' }}>🎁</span>
                                    <span>Free delivery every Monday</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delivery Safety Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <SecurityIcon style={{ marginRight: '10px' }} />
                    Delivery Safety
                </h2>
                <div className="policies-section-content">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🛡️</div>
                            <h3 style={{ color: '#232f54', marginBottom: '10px' }}>Verified Couriers</h3>
                            <p style={{ color: '#666' }}>All couriers are identity-verified and trained</p>
                        </div>
                        
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📦</div>
                            <h3 style={{ color: '#232f54', marginBottom: '10px' }}>Safe Packaging</h3>
                            <p style={{ color: '#666' }}>Food is carefully packed to ensure hygiene</p>
                        </div>
                        
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🌡️</div>
                            <h3 style={{ color: '#232f54', marginBottom: '10px' }}>Temperature Control</h3>
                            <p style={{ color: '#666' }}>Insulated bags keep food at proper temperature</p>
                        </div>
                        
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📱</div>
                            <h3 style={{ color: '#232f54', marginBottom: '10px' }}>Real-time Tracking</h3>
                            <p style={{ color: '#666' }}>Track courier location and delivery status</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Support Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <SupportIcon style={{ marginRight: '10px' }} />
                    Delivery Support
                </h2>
                <div className="policies-section-content">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <PhoneIcon style={{ color: '#e74c3c', fontSize: '2rem' }} />
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>Delivery Hotline</h4>
                                <p style={{ color: '#666' }}>1900-DOLCE</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <SupportIcon style={{ color: '#3498db', fontSize: '2rem' }} />
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>Support Chat</h4>
                                <p style={{ color: '#666' }}>24/7 via app</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <InfoIcon style={{ color: '#f39c12', fontSize: '2rem' }} />
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>Support Email</h4>
                                <p style={{ color: '#666' }}>delivery@dolce.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Section */}
            <div className="policies-footer-section">
                <p className="policies-footer-text">
                    DOLCE is committed to fast and safe deliveries!
                </p>
                <p className="policies-copyright">
                    © 2025 DOLCE. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default DeliveryPolicy; 