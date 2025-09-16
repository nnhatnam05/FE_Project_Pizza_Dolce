import React from 'react';
import './PoliciesGlobal.css';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SecurityIcon from '@mui/icons-material/Security';
import InfoIcon from '@mui/icons-material/Info';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PaymentIcon from '@mui/icons-material/Payment';
import SupportIcon from '@mui/icons-material/Support';
import PhoneIcon from '@mui/icons-material/Phone';

const VoucherPolicy = () => {
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
                    <CardGiftcardIcon style={{ marginRight: '10px' }} />
                    Voucher & Gifts Policy
                </h1>
                <p className="policies-page-subtitle">
                    Explore voucher types and how to use them to save more
                </p>
            </div>

            {/* Introduction Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <LocalOfferIcon style={{ marginRight: '10px' }} />
                    Voucher Introduction
                </h2>
                <div className="policies-section-content">
                    <div className="policies-mb-20">
                        <p>
                            Welcome to DOLCE's voucher and gifts system! We offer a variety of attractive vouchers
                            to help you save and enjoy delicious food at the best prices.
                        </p>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '30px' }}>
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🎫</div>
                            <h3 style={{ color: '#232f54', marginBottom: '10px' }}>Percentage Discount Voucher</h3>
                            <p style={{ color: '#666' }}>Discount by percentage on the bill</p>
                        </div>
                        
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>💰</div>
                            <h3 style={{ color: '#232f54', marginBottom: '10px' }}>Fixed Amount Discount</h3>
                            <p style={{ color: '#666' }}>Reduce a fixed amount from the bill</p>
                        </div>
                        
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🥤</div>
                            <h3 style={{ color: '#232f54', marginBottom: '10px' }}>Free Drink Voucher</h3>
                            <p style={{ color: '#666' }}>Get any drink for free</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* How to Use Section */}
            <div className="policies-highlight-section">
                <h2 className="policies-highlight-title">
                    <InfoIcon style={{ marginRight: '10px' }} />
                    How to Use Vouchers
                </h2>
                <div className="policies-highlight-content">
                    <div style={{ display: 'grid', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '20px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '15px' }}>
                            <div style={{ background: '#ffd700', color: '#232f54', padding: '12px 18px', borderRadius: '50%', fontWeight: 'bold', fontSize: '1.2rem', minWidth: '50px', textAlign: 'center' }}>
                                1
                            </div>
                            <div>
                                <h4 style={{ color: '#ffd700', marginBottom: '10px', fontSize: '1.2rem' }}>Choose a Voucher</h4>
                                <p>Select a suitable voucher from the available list</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '20px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '15px' }}>
                            <div style={{ background: '#ffd700', color: '#232f54', padding: '12px 18px', borderRadius: '50%', fontWeight: 'bold', fontSize: '1.2rem', minWidth: '50px', textAlign: 'center' }}>
                                2
                            </div>
                            <div>
                                <h4 style={{ color: '#ffd700', marginBottom: '10px', fontSize: '1.2rem' }}>Apply Voucher</h4>
                                <p>Enter the voucher code or select a voucher at checkout</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '20px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '15px' }}>
                            <div style={{ background: '#ffd700', color: '#232f54', padding: '12px 18px', borderRadius: '50%', fontWeight: 'bold', fontSize: '1.2rem', minWidth: '50px', textAlign: 'center' }}>
                                3
                            </div>
                            <div>
                                <h4 style={{ color: '#ffd700', marginBottom: '10px', fontSize: '1.2rem' }}>Receive Discount</h4>
                                <p>The voucher will be applied automatically to your bill</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Terms and Conditions Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <SecurityIcon style={{ marginRight: '10px' }} />
                    Terms & Conditions
                </h2>
                <div className="policies-section-content">
                    <div style={{ display: 'grid', gap: '20px' }}>
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <h3 style={{ color: '#232f54', marginBottom: '15px', fontSize: '1.3rem' }}>
                                ⏰ Validity Period
                            </h3>
                            <ul style={{ color: '#666', lineHeight: '1.6', paddingLeft: '20px' }}>
                                <li>Voucher validity is specified on the voucher</li>
                                <li>Vouchers are non-extendable and non-transferable</li>
                                <li>Expired vouchers cannot be refunded or renewed</li>
                            </ul>
                        </div>
                        
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <h3 style={{ color: '#232f54', marginBottom: '15px', fontSize: '1.3rem' }}>
                                💰 Conditions of Use
                            </h3>
                            <ul style={{ color: '#666', lineHeight: '1.6', paddingLeft: '20px' }}>
                                <li>Each voucher can be used once</li>
                                <li>Multiple vouchers cannot be combined in a single order</li>
                                <li>Some vouchers require a minimum order value</li>
                                <li>Not applicable to discounted items</li>
                            </ul>
                        </div>
                        
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <h3 style={{ color: '#232f54', marginBottom: '15px', fontSize: '1.3rem' }}>
                                🚫 Exclusions
                            </h3>
                            <ul style={{ color: '#666', lineHeight: '1.6', paddingLeft: '20px' }}>
                                <li>Expired or cancelled vouchers</li>
                                <li>Orders below the minimum requirement</li>
                                <li>Misuse of vouchers</li>
                                <li>Detected fraud</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Voucher Types Details Section */}
            <div className="policies-highlight-section">
                <h2 className="policies-highlight-title">
                    <CardGiftcardIcon style={{ marginRight: '10px' }} />
                    Voucher Types Details
                </h2>
                <div className="policies-highlight-content">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '25px', borderRadius: '15px' }}>
                            <h3 style={{ color: '#ffd700', marginBottom: '20px', fontSize: '1.3rem' }}>
                                🎫 Percentage Discount Voucher
                            </h3>
                            <div style={{ marginBottom: '15px' }}>
                                <p style={{ marginBottom: '10px' }}><strong>Description:</strong> Discount by percentage on total bill</p>
                                <p style={{ marginBottom: '10px' }}><strong>Example:</strong> 20% off for orders from 200,000đ</p>
                                <p style={{ marginBottom: '10px' }}><strong>Condition:</strong> Minimum order 200,000đ</p>
                                <p><strong>Limit:</strong> Up to 100,000đ off</p>
                            </div>
                        </div>
                        
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '25px', borderRadius: '15px' }}>
                            <h3 style={{ color: '#ffd700', marginBottom: '20px', fontSize: '1.3rem' }}>
                                💰 Fixed Amount Discount
                            </h3>
                            <div style={{ marginBottom: '15px' }}>
                                <p style={{ marginBottom: '10px' }}><strong>Description:</strong> Reduce a fixed amount on the bill</p>
                                <p style={{ marginBottom: '10px' }}><strong>Example:</strong> 50,000đ off for orders from 300,000đ</p>
                                <p style={{ marginBottom: '10px' }}><strong>Condition:</strong> Minimum order 300,000đ</p>
                                <p><strong>Limit:</strong> No limit</p>
                            </div>
                        </div>
                        
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '25px', borderRadius: '15px' }}>
                            <h3 style={{ color: '#ffd700', marginBottom: '20px', fontSize: '1.3rem' }}>
                                🥤 Free Drink Voucher
                            </h3>
                            <div style={{ marginBottom: '15px' }}>
                                <p style={{ marginBottom: '10px' }}><strong>Description:</strong> Get any drink for free</p>
                                <p style={{ marginBottom: '10px' }}><strong>Example:</strong> Free 1 drink for orders from 150,000đ</p>
                                <p style={{ marginBottom: '10px' }}><strong>Condition:</strong> Minimum order 150,000đ</p>
                                <p><strong>Limit:</strong> 1 drink/order</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expiry and Renewal Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <AccessTimeIcon style={{ marginRight: '10px' }} />
                    Expiry & Renewal
                </h2>
                <div className="policies-section-content">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>⏰</div>
                            <h3 style={{ color: '#232f54', marginBottom: '10px' }}>Validity Period</h3>
                            <p style={{ color: '#666' }}>Vouchers are valid for 7-30 days depending on type</p>
                        </div>
                        
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🔄</div>
                            <h3 style={{ color: '#232f54', marginBottom: '10px' }}>No Renewal</h3>
                            <p style={{ color: '#666' }}>Expired vouchers cannot be renewed</p>
                        </div>
                        
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📅</div>
                            <h3 style={{ color: '#232f54', marginBottom: '10px' }}>Check Validity</h3>
                            <p style={{ color: '#666' }}>Always check the expiry date before use</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Refund and Exchange Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <PaymentIcon style={{ marginRight: '10px' }} />
                    Refund & Exchange
                </h2>
                <div className="policies-section-content">
                    <div style={{ display: 'grid', gap: '20px' }}>
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <h3 style={{ color: '#232f54', marginBottom: '15px', fontSize: '1.3rem' }}>
                                💸 Refund Policy
                            </h3>
                            <ul style={{ color: '#666', lineHeight: '1.6', paddingLeft: '20px' }}>
                                <li>Used vouchers are non-refundable</li>
                                <li>Unused vouchers can be refunded within 24h</li>
                                <li>Refund to original payment method</li>
                                <li>Refund processing fee: 5,000đ/voucher</li>
                            </ul>
                        </div>
                        
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <h3 style={{ color: '#232f54', marginBottom: '15px', fontSize: '1.3rem' }}>
                                🔄 Exchange Policy
                            </h3>
                            <ul style={{ color: '#666', lineHeight: '1.6', paddingLeft: '20px' }}>
                                <li>Used vouchers cannot be exchanged</li>
                                <li>Exchange unused vouchers within 7 days</li>
                                <li>Only exchange for equal value</li>
                                <li>Exchange fee: 10,000đ/time</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Support Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <SupportIcon style={{ marginRight: '10px' }} />
                    Voucher Support
                </h2>
                <div className="policies-section-content">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <PhoneIcon style={{ color: '#e74c3c', fontSize: '2rem' }} />
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>Voucher Hotline</h4>
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
                                <p style={{ color: '#666' }}>voucher@dolce.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Section */}
            <div className="policies-footer-section">
                <p className="policies-footer-text">
                    DOLCE is committed to attractive vouchers and top-notch customer service!
                </p>
                <p className="policies-copyright">
                    © 2025 DOLCE. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default VoucherPolicy; 