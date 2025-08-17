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
                <span>Quay lại</span>
            </button>

            {/* Header Section */}
            <div className="policies-header-section">
                <h1 className="policies-page-title">
                    <CardGiftcardIcon style={{ marginRight: '10px' }} />
                    Chính Sách Voucher & Quà Tặng
                </h1>
                <p className="policies-page-subtitle">
                    Khám phá các loại voucher hấp dẫn và cách sử dụng để tiết kiệm chi phí
                </p>
            </div>

            {/* Introduction Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <LocalOfferIcon style={{ marginRight: '10px' }} />
                    Giới Thiệu Voucher
                </h2>
                <div className="policies-section-content">
                    <div className="policies-mb-20">
                        <p>
                            Chào mừng bạn đến với hệ thống voucher và quà tặng của DOLCE! Chúng tôi cung cấp 
                            nhiều loại voucher hấp dẫn để giúp bạn tiết kiệm chi phí và tận hưởng những món ăn 
                            ngon với giá tốt nhất.
                        </p>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '30px' }}>
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🎫</div>
                            <h3 style={{ color: '#232f54', marginBottom: '10px' }}>Voucher Giảm Theo %</h3>
                            <p style={{ color: '#666' }}>Giảm giá theo phần trăm trên hóa đơn</p>
                        </div>
                        
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>💰</div>
                            <h3 style={{ color: '#232f54', marginBottom: '10px' }}>Voucher Giảm Số Tiền Cố Định</h3>
                            <p style={{ color: '#666' }}>Giảm số tiền cố định trên hóa đơn</p>
                        </div>
                        
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🥤</div>
                            <h3 style={{ color: '#232f54', marginBottom: '10px' }}>Voucher Tặng Nước</h3>
                            <p style={{ color: '#666' }}>Nhận ly nước bất kì miễn phí</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* How to Use Section */}
            <div className="policies-highlight-section">
                <h2 className="policies-highlight-title">
                    <InfoIcon style={{ marginRight: '10px' }} />
                    Cách Sử Dụng Voucher
                </h2>
                <div className="policies-highlight-content">
                    <div style={{ display: 'grid', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '20px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '15px' }}>
                            <div style={{ background: '#ffd700', color: '#232f54', padding: '12px 18px', borderRadius: '50%', fontWeight: 'bold', fontSize: '1.2rem', minWidth: '50px', textAlign: 'center' }}>
                                1
                            </div>
                            <div>
                                <h4 style={{ color: '#ffd700', marginBottom: '10px', fontSize: '1.2rem' }}>Chọn Voucher</h4>
                                <p>Chọn voucher phù hợp từ danh sách voucher có sẵn</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '20px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '15px' }}>
                            <div style={{ background: '#ffd700', color: '#232f54', padding: '12px 18px', borderRadius: '50%', fontWeight: 'bold', fontSize: '1.2rem', minWidth: '50px', textAlign: 'center' }}>
                                2
                            </div>
                            <div>
                                <h4 style={{ color: '#ffd700', marginBottom: '10px', fontSize: '1.2rem' }}>Áp Dụng Voucher</h4>
                                <p>Nhập mã voucher hoặc chọn voucher khi thanh toán</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '20px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '15px' }}>
                            <div style={{ background: '#ffd700', color: '#232f54', padding: '12px 18px', borderRadius: '50%', fontWeight: 'bold', fontSize: '1.2rem', minWidth: '50px', textAlign: 'center' }}>
                                3
                            </div>
                            <div>
                                <h4 style={{ color: '#ffd700', marginBottom: '10px', fontSize: '1.2rem' }}>Nhận Giảm Giá</h4>
                                <p>Voucher sẽ được áp dụng tự động vào hóa đơn</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Terms and Conditions Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <SecurityIcon style={{ marginRight: '10px' }} />
                    Điều Khoản & Điều Kiện
                </h2>
                <div className="policies-section-content">
                    <div style={{ display: 'grid', gap: '20px' }}>
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <h3 style={{ color: '#232f54', marginBottom: '15px', fontSize: '1.3rem' }}>
                                ⏰ Thời Hạn Sử Dụng
                            </h3>
                            <ul style={{ color: '#666', lineHeight: '1.6', paddingLeft: '20px' }}>
                                <li>Voucher có thời hạn sử dụng được ghi rõ trên voucher</li>
                                <li>Voucher không thể gia hạn hoặc chuyển nhượng</li>
                                <li>Voucher hết hạn sẽ không được hoàn lại hoặc đổi mới</li>
                            </ul>
                        </div>
                        
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <h3 style={{ color: '#232f54', marginBottom: '15px', fontSize: '1.3rem' }}>
                                💰 Điều Kiện Áp Dụng
                            </h3>
                            <ul style={{ color: '#666', lineHeight: '1.6', paddingLeft: '20px' }}>
                                <li>Mỗi voucher chỉ được sử dụng một lần</li>
                                <li>Không thể kết hợp nhiều voucher cho cùng một đơn hàng</li>
                                <li>Một số voucher có giá trị đơn hàng tối thiểu</li>
                                <li>Voucher không áp dụng cho các món đã giảm giá</li>
                            </ul>
                        </div>
                        
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <h3 style={{ color: '#232f54', marginBottom: '15px', fontSize: '1.3rem' }}>
                                🚫 Trường Hợp Không Áp Dụng
                            </h3>
                            <ul style={{ color: '#666', lineHeight: '1.6', paddingLeft: '20px' }}>
                                <li>Voucher đã hết hạn hoặc bị hủy</li>
                                <li>Đơn hàng không đạt điều kiện tối thiểu</li>
                                <li>Voucher bị sử dụng sai mục đích</li>
                                <li>Hệ thống phát hiện gian lận</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Voucher Types Details Section */}
            <div className="policies-highlight-section">
                <h2 className="policies-highlight-title">
                    <CardGiftcardIcon style={{ marginRight: '10px' }} />
                    Chi Tiết Các Loại Voucher
                </h2>
                <div className="policies-highlight-content">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '25px', borderRadius: '15px' }}>
                            <h3 style={{ color: '#ffd700', marginBottom: '20px', fontSize: '1.3rem' }}>
                                🎫 Voucher Giảm Theo %
                            </h3>
                            <div style={{ marginBottom: '15px' }}>
                                <p style={{ marginBottom: '10px' }}><strong>Mô tả:</strong> Giảm giá theo phần trăm trên tổng hóa đơn</p>
                                <p style={{ marginBottom: '10px' }}><strong>Ví dụ:</strong> Giảm 20% cho đơn từ 200,000đ</p>
                                <p style={{ marginBottom: '10px' }}><strong>Điều kiện:</strong> Đơn hàng tối thiểu 200,000đ</p>
                                <p><strong>Giới hạn:</strong> Tối đa giảm 100,000đ</p>
                            </div>
                        </div>
                        
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '25px', borderRadius: '15px' }}>
                            <h3 style={{ color: '#ffd700', marginBottom: '20px', fontSize: '1.3rem' }}>
                                💰 Voucher Giảm Số Tiền Cố Định
                            </h3>
                            <div style={{ marginBottom: '15px' }}>
                                <p style={{ marginBottom: '10px' }}><strong>Mô tả:</strong> Giảm số tiền cố định trên hóa đơn</p>
                                <p style={{ marginBottom: '10px' }}><strong>Ví dụ:</strong> Giảm 50,000đ cho đơn từ 300,000đ</p>
                                <p style={{ marginBottom: '10px' }}><strong>Điều kiện:</strong> Đơn hàng tối thiểu 300,000đ</p>
                                <p><strong>Giới hạn:</strong> Không giới hạn</p>
                            </div>
                        </div>
                        
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '25px', borderRadius: '15px' }}>
                            <h3 style={{ color: '#ffd700', marginBottom: '20px', fontSize: '1.3rem' }}>
                                🥤 Voucher Tặng Nước
                            </h3>
                            <div style={{ marginBottom: '15px' }}>
                                <p style={{ marginBottom: '10px' }}><strong>Mô tả:</strong> Tặng ly nước bất kỳ miễn phí</p>
                                <p style={{ marginBottom: '10px' }}><strong>Ví dụ:</strong> Tặng 1 ly nước cho đơn từ 150,000đ</p>
                                <p style={{ marginBottom: '10px' }}><strong>Điều kiện:</strong> Đơn hàng tối thiểu 150,000đ</p>
                                <p><strong>Giới hạn:</strong> 1 ly nước/đơn hàng</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expiry and Renewal Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <AccessTimeIcon style={{ marginRight: '10px' }} />
                    Thời Hạn & Gia Hạn
                </h2>
                <div className="policies-section-content">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>⏰</div>
                            <h3 style={{ color: '#232f54', marginBottom: '10px' }}>Thời Hạn Sử Dụng</h3>
                            <p style={{ color: '#666' }}>Voucher có thời hạn từ 7-30 ngày tùy loại</p>
                        </div>
                        
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🔄</div>
                            <h3 style={{ color: '#232f54', marginBottom: '10px' }}>Không Thể Gia Hạn</h3>
                            <p style={{ color: '#666' }}>Voucher hết hạn sẽ không được gia hạn</p>
                        </div>
                        
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📅</div>
                            <h3 style={{ color: '#232f54', marginBottom: '10px' }}>Kiểm Tra Thời Hạn</h3>
                            <p style={{ color: '#666' }}>Luôn kiểm tra thời hạn trước khi sử dụng</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Refund and Exchange Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <PaymentIcon style={{ marginRight: '10px' }} />
                    Hoàn Tiền & Đổi Trả
                </h2>
                <div className="policies-section-content">
                    <div style={{ display: 'grid', gap: '20px' }}>
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <h3 style={{ color: '#232f54', marginBottom: '15px', fontSize: '1.3rem' }}>
                                💸 Chính Sách Hoàn Tiền
                            </h3>
                            <ul style={{ color: '#666', lineHeight: '1.6', paddingLeft: '20px' }}>
                                <li>Voucher đã sử dụng không thể hoàn tiền</li>
                                <li>Voucher chưa sử dụng có thể hoàn tiền trong vòng 24h</li>
                                <li>Hoàn tiền qua phương thức thanh toán ban đầu</li>
                                <li>Phí xử lý hoàn tiền: 5,000đ/voucher</li>
                            </ul>
                        </div>
                        
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <h3 style={{ color: '#232f54', marginBottom: '15px', fontSize: '1.3rem' }}>
                                🔄 Chính Sách Đổi Trả
                            </h3>
                            <ul style={{ color: '#666', lineHeight: '1.6', paddingLeft: '20px' }}>
                                <li>Không thể đổi voucher đã sử dụng</li>
                                <li>Đổi voucher chưa sử dụng trong vòng 7 ngày</li>
                                <li>Chỉ đổi được voucher cùng giá trị</li>
                                <li>Phí đổi voucher: 10,000đ/lần</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Support Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <SupportIcon style={{ marginRight: '10px' }} />
                    Hỗ Trợ Voucher
                </h2>
                <div className="policies-section-content">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <PhoneIcon style={{ color: '#e74c3c', fontSize: '2rem' }} />
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>Hotline Voucher</h4>
                                <p style={{ color: '#666' }}>1900-DOLCE</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <SupportIcon style={{ color: '#3498db', fontSize: '2rem' }} />
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>Chat Hỗ Trợ</h4>
                                <p style={{ color: '#666' }}>24/7 qua ứng dụng</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <InfoIcon style={{ color: '#f39c12', fontSize: '2rem' }} />
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>Email Hỗ Trợ</h4>
                                <p style={{ color: '#666' }}>voucher@dolce.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Section */}
            <div className="policies-footer-section">
                <p className="policies-footer-text">
                    DOLCE cam kết mang đến những voucher hấp dẫn và dịch vụ khách hàng tốt nhất!
                </p>
                <p className="policies-copyright">
                    © 2025 DOLCE. Tất cả quyền được bảo lưu.
                </p>
            </div>
        </div>
    );
};

export default VoucherPolicy; 