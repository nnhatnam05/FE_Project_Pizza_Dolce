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
                <span>Quay lại</span>
            </button>

            {/* Header Section */}
            <div className="policies-header-section">
                <h1 className="policies-page-title">
                    <LocalShippingIcon style={{ marginRight: '10px' }} />
                    Chính Sách Giao Hàng
                </h1>
                <p className="policies-page-subtitle">
                    Thông tin chi tiết về quy trình giao hàng và dịch vụ vận chuyển của DOLCE
                </p>
            </div>

            {/* Main Delivery Process Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <TimelineIcon style={{ marginRight: '10px' }} />
                    Quy Trình Giao Hàng
                </h2>
                <div className="policies-section-content">
                    <div className="policies-mb-20">
                        <h3 style={{ color: '#232f54', fontSize: '1.4rem', marginBottom: '15px' }}>
                            🚚 Quy Trình Giao Hàng Tự Động
                        </h3>
                        <p>
                            Khi đơn hàng đã thanh toán thành công, đơn hàng sẽ được bàn giao cho đơn vị vận chuyển. 
                            Đơn hàng sẽ được giao đến địa chỉ mà bạn đã chọn trong lúc tạo đơn hàng.
                        </p>
                    </div>
                    
                    <div style={{ display: 'grid', gap: '20px', marginTop: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '15px' }}>
                            <div style={{ background: '#232f54', color: 'white', padding: '12px 18px', borderRadius: '50%', fontWeight: 'bold', fontSize: '1.2rem', minWidth: '50px', textAlign: 'center' }}>
                                1
                            </div>
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '10px', fontSize: '1.2rem' }}>Thanh Toán Thành Công</h4>
                                <p style={{ color: '#666', lineHeight: '1.6' }}>Đơn hàng được xác nhận và chuyển cho đơn vị vận chuyển</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '15px' }}>
                            <div style={{ background: '#232f54', color: 'white', padding: '12px 18px', borderRadius: '50%', fontWeight: 'bold', fontSize: '1.2rem', minWidth: '50px', textAlign: 'center' }}>
                                2
                            </div>
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '10px', fontSize: '1.2rem' }}>Bàn Giao Vận Chuyển</h4>
                                <p style={{ color: '#666', lineHeight: '1.6' }}>Shipper nhận đơn hàng và bắt đầu giao hàng</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '15px' }}>
                            <div style={{ background: '#232f54', color: 'white', padding: '12px 18px', borderRadius: '50%', fontWeight: 'bold', fontSize: '1.2rem', minWidth: '50px', textAlign: 'center' }}>
                                3
                            </div>
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '10px', fontSize: '1.2rem' }}>Giao Hàng Tận Nơi</h4>
                                <p style={{ color: '#666', lineHeight: '1.6' }}>Shipper giao đến địa chỉ chỉ định và cập nhật trạng thái</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Real-time Tracking Section */}
            <div className="policies-highlight-section">
                <h2 className="policies-highlight-title">
                    <InfoIcon style={{ marginRight: '10px' }} />
                    Theo Dõi Đơn Hàng Real-time
                </h2>
                <div className="policies-highlight-content">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '30px' }}>
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '25px', borderRadius: '15px' }}>
                            <h3 style={{ color: '#ffd700', marginBottom: '20px', fontSize: '1.3rem' }}>
                                📱 Cập Nhật Trạng Thái Tự Động
                            </h3>
                            <p>
                                Trạng thái đơn hàng sẽ được cập nhật ngay trong màn hình hiển thị chi tiết giao hàng 
                                trên màn hình của bạn. Bạn có thể theo dõi mọi bước của quá trình giao hàng.
                            </p>
                        </div>
                        
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '25px', borderRadius: '15px' }}>
                            <h3 style={{ color: '#ffd700', marginBottom: '20px', fontSize: '1.3rem' }}>
                                🎯 Tính Năng Theo Dõi
                            </h3>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <LocationOnIcon style={{ color: '#ffd700' }} />
                                    <span>Vị trí shipper real-time</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <AccessTimeIcon style={{ color: '#ffd700' }} />
                                    <span>Thời gian giao hàng ước tính</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <PaymentIcon style={{ color: '#ffd700' }} />
                                    <span>Trạng thái thanh toán</span>
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
                    Khu Vực Giao Hàng
                </h2>
                <div className="policies-section-content">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                            <h3 style={{ color: '#232f54', marginBottom: '15px' }}>🏙️ Nội Thành</h3>
                            <p style={{ color: '#666', marginBottom: '10px' }}>Phạm vi: 5km</p>
                            <p style={{ color: '#666', marginBottom: '10px' }}>Thời gian: 30-45 phút</p>
                            <p style={{ color: '#666' }}>Phí giao: 15,000đ</p>
                        </div>
                        
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                            <h3 style={{ color: '#232f54', marginBottom: '15px' }}>🏘️ Ngoại Thành</h3>
                            <p style={{ color: '#666', marginBottom: '10px' }}>Phạm vi: 5-10km</p>
                            <p style={{ color: '#666', marginBottom: '10px' }}>Thời gian: 45-60 phút</p>
                            <p style={{ color: '#666' }}>Phí giao: 25,000đ</p>
                        </div>
                        
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                            <h3 style={{ color: '#232f54', marginBottom: '15px' }}>🌆 Xa Hơn</h3>
                            <p style={{ color: '#666', marginBottom: '10px' }}>Phạm vi: 10-15km</p>
                            <p style={{ color: '#666', marginBottom: '10px' }}>Thời gian: 60-90 phút</p>
                            <p style={{ color: '#666' }}>Phí giao: 35,000đ</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delivery Time Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <AccessTimeIcon style={{ marginRight: '10px' }} />
                    Thời Gian Giao Hàng
                </h2>
                <div className="policies-section-content">
                    <div style={{ display: 'grid', gap: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>🌅 Sáng (7:00 - 11:00)</h4>
                                <p style={{ color: '#666' }}>Giao hàng trong vòng 30-45 phút</p>
                            </div>
                            <div style={{ background: '#232f54', color: 'white', padding: '8px 15px', borderRadius: '20px', fontSize: '0.9rem' }}>
                                Nhanh
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>☀️ Trưa (11:00 - 14:00)</h4>
                                <p style={{ color: '#666' }}>Giao hàng trong vòng 45-60 phút</p>
                            </div>
                            <div style={{ background: '#f39c12', color: 'white', padding: '8px 15px', borderRadius: '20px', fontSize: '0.9rem' }}>
                                Bình thường
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>🌆 Chiều (14:00 - 18:00)</h4>
                                <p style={{ color: '#666' }}>Giao hàng trong vòng 45-60 phút</p>
                            </div>
                            <div style={{ background: '#f39c12', color: 'white', padding: '8px 15px', borderRadius: '20px', fontSize: '0.9rem' }}>
                                Bình thường
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>🌙 Tối (18:00 - 22:00)</h4>
                                <p style={{ color: '#666' }}>Giao hàng trong vòng 60-90 phút</p>
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
                    Phí Giao Hàng & Khuyến Mãi
                </h2>
                <div className="policies-highlight-content">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '30px' }}>
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '25px', borderRadius: '15px' }}>
                            <h3 style={{ color: '#ffd700', marginBottom: '20px', fontSize: '1.3rem' }}>
                                💰 Phí Giao Hàng Cơ Bản
                            </h3>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Nội thành (≤5km):</span>
                                    <span style={{ fontWeight: 'bold' }}>15,000đ</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Ngoại thành (5-10km):</span>
                                    <span style={{ fontWeight: 'bold' }}>25,000đ</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Xa hơn (10-15km):</span>
                                    <span style={{ fontWeight: 'bold' }}>35,000đ</span>
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '25px', borderRadius: '15px' }}>
                            <h3 style={{ color: '#ffd700', marginBottom: '20px', fontSize: '1.3rem' }}>
                                🎉 Khuyến Mãi Giao Hàng
                            </h3>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ color: '#ffd700', fontSize: '1.2rem' }}>🎁</span>
                                    <span>Miễn phí giao hàng cho đơn từ 500,000đ</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ color: '#ffd700', fontSize: '1.2rem' }}>🎁</span>
                                    <span>Giảm 50% phí giao cho khách VIP</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ color: '#ffd700', fontSize: '1.2rem' }}>🎁</span>
                                    <span>Giao hàng miễn phí vào thứ 2 hàng tuần</span>
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
                    An Toàn Giao Hàng
                </h2>
                <div className="policies-section-content">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🛡️</div>
                            <h3 style={{ color: '#232f54', marginBottom: '10px' }}>Shipper Được Kiểm Tra</h3>
                            <p style={{ color: '#666' }}>Tất cả shipper đều được xác minh danh tính và đào tạo an toàn</p>
                        </div>
                        
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📦</div>
                            <h3 style={{ color: '#232f54', marginBottom: '10px' }}>Đóng Gói An Toàn</h3>
                            <p style={{ color: '#666' }}>Thực phẩm được đóng gói kỹ lưỡng để đảm bảo vệ sinh</p>
                        </div>
                        
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🌡️</div>
                            <h3 style={{ color: '#232f54', marginBottom: '10px' }}>Bảo Quản Nhiệt</h3>
                            <p style={{ color: '#666' }}>Sử dụng túi giữ nhiệt để đảm bảo nhiệt độ thực phẩm</p>
                        </div>
                        
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📱</div>
                            <h3 style={{ color: '#232f54', marginBottom: '10px' }}>Theo Dõi Real-time</h3>
                            <p style={{ color: '#666' }}>Theo dõi vị trí shipper và trạng thái giao hàng</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Support Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <SupportIcon style={{ marginRight: '10px' }} />
                    Hỗ Trợ Giao Hàng
                </h2>
                <div className="policies-section-content">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <PhoneIcon style={{ color: '#e74c3c', fontSize: '2rem' }} />
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>Hotline Giao Hàng</h4>
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
                                <p style={{ color: '#666' }}>delivery@dolce.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Section */}
            <div className="policies-footer-section">
                <p className="policies-footer-text">
                    DOLCE cam kết mang đến trải nghiệm giao hàng nhanh chóng và an toàn!
                </p>
                <p className="policies-copyright">
                    © 2025 DOLCE. Tất cả quyền được bảo lưu.
                </p>
            </div>
        </div>
    );
};

export default DeliveryPolicy; 