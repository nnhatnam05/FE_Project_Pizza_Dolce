import React from 'react';
import './DeliveryPolicy.css';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SecurityIcon from '@mui/icons-material/Security';
import TimelineIcon from '@mui/icons-material/Timeline';
import SupportIcon from '@mui/icons-material/Support';
import InfoIcon from '@mui/icons-material/Info';

const DeliveryPolicy = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="delivery-policy-container">
            {/* Header */}
            <div className="delivery-policy-header">
                <button className="back-button" onClick={handleBack}>
                    <ArrowBackIcon />
                    <span>Quay lại</span>
                </button>
                <h1 className="delivery-policy-title">
                    <LocalShippingIcon className="title-icon" />
                    Chính Sách Giao Hàng
                </h1>
            </div>

            {/* Main Content */}
            <div className="delivery-policy-content">
                
                {/* Main Delivery Process Section */}
                <section className="policy-section">
                    <div className="section-header">
                        <TimelineIcon className="section-icon" />
                        <h2>Quy Trình Giao Hàng</h2>
                    </div>
                    <div className="section-content">
                        <div className="main-delivery-info">
                            <div className="delivery-highlight">
                                <h3>🚚 Quy Trình Giao Hàng Tự Động</h3>
                                <p>
                                    Khi đơn hàng đã thanh toán thành công, đơn hàng sẽ được bàn giao cho đơn vị vận chuyển. 
                                    Đơn hàng sẽ được giao đến địa chỉ mà bạn đã chọn trong lúc tạo đơn hàng.
                                </p>
                            </div>
                            
                            <div className="delivery-steps">
                                <div className="step-item">
                                    <div className="step-number">1</div>
                                    <div className="step-content">
                                        <h4>Thanh Toán Thành Công</h4>
                                        <p>Đơn hàng được xác nhận và chuyển cho đơn vị vận chuyển</p>
                                    </div>
                                </div>
                                <div className="step-item">
                                    <div className="step-number">2</div>
                                    <div className="step-content">
                                        <h4>Bàn Giao Vận Chuyển</h4>
                                        <p>Shipper nhận đơn hàng và bắt đầu giao hàng</p>
                                    </div>
                                </div>
                                <div className="step-item">
                                    <div className="step-number">3</div>
                                    <div className="step-content">
                                        <h4>Giao Hàng Tận Nơi</h4>
                                        <p>Shipper giao đến địa chỉ chỉ định và cập nhật trạng thái</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Real-time Tracking Section */}
                <section className="policy-section">
                    <div className="section-header">
                        <InfoIcon className="section-icon" />
                        <h2>Theo Dõi Đơn Hàng Real-time</h2>
                    </div>
                    <div className="section-content">
                        <div className="tracking-info">
                            <div className="tracking-card">
                                <h3>📱 Cập Nhật Trạng Thái Tự Động</h3>
                                <p>
                                    Trạng thái đơn hàng sẽ được cập nhật ngay trong màn hình hiển thị chi tiết giao hàng 
                                    trên màn hình của bạn. Bạn có thể theo dõi mọi bước của quá trình giao hàng.
                                </p>
                            </div>
                            
                            <div className="tracking-features">
                                <div className="feature-item">
                                    <h4>📍 Vị Trí Shipper</h4>
                                    <p>Theo dõi vị trí shipper trong thời gian thực</p>
                                </div>
                                <div className="feature-item">
                                    <h4>⏰ Thời Gian Giao Hàng</h4>
                                    <p>Ước tính thời gian giao hàng chính xác</p>
                                </div>
                                <div className="feature-item">
                                    <h4>📞 Liên Lạc Trực Tiếp</h4>
                                    <p>Liên lạc trực tiếp với shipper khi cần thiết</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Problem Resolution Section */}
                <section className="policy-section">
                    <div className="section-header">
                        <SupportIcon className="section-icon" />
                        <h2>Xử Lý Vấn Đề & Hỗ Trợ</h2>
                    </div>
                    <div className="section-content">
                        <div className="problem-resolution">
                            <div className="resolution-highlight">
                                <h3>🔄 Chuyển Giao Tự Động</h3>
                                <p>
                                    Nếu có vấn đề về shipper, chúng tôi sẽ chuyển giao lại cho bên vận chuyển thứ 3 
                                    và trạng thái vẫn sẽ được cập nhật đầy đủ cho bạn.
                                </p>
                            </div>
                            
                            <div className="resolution-steps">
                                <div className="resolution-step">
                                    <h4>🚨 Phát Hiện Vấn Đề</h4>
                                    <p>Hệ thống tự động phát hiện vấn đề với shipper</p>
                                </div>
                                <div className="resolution-step">
                                    <h4>🔄 Chuyển Giao Tự Động</h4>
                                    <p>Đơn hàng được chuyển cho đơn vị vận chuyển thay thế</p>
                                </div>
                                <div className="resolution-step">
                                    <h4>📊 Cập Nhật Trạng Thái</h4>
                                    <p>Trạng thái mới được cập nhật ngay lập tức</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Service Commitment Section */}
                <section className="policy-section">
                    <div className="section-header">
                        <SecurityIcon className="section-icon" />
                        <h2>Cam Kết Dịch Vụ</h2>
                    </div>
                    <div className="section-content">
                        <div className="service-commitment">
                            <div className="commitment-main">
                                <h3>💎 Đảm Bảo Quyền Lợi Tối Đa</h3>
                                <p>
                                    Chúng tôi cam kết mang lại quyền tốt nhất cho bạn trong mọi tình huống. 
                                    Dịch vụ giao hàng của chúng tôi được thiết kế để đảm bảo sự hài lòng tối đa.
                                </p>
                            </div>
                            
                            <div className="commitment-points">
                                <div className="commitment-point">
                                    <h4>⚡ Giao Hàng Nhanh Chóng</h4>
                                    <p>Thời gian giao hàng được tối ưu hóa</p>
                                </div>
                                <div className="commitment-point">
                                    <h4>🛡️ An Toàn & Bảo Mật</h4>
                                    <p>Đơn hàng được bảo vệ trong suốt quá trình vận chuyển</p>
                                </div>
                                <div className="commitment-point">
                                    <h4>📱 Minh Bạch Hoàn Toàn</h4>
                                    <p>Mọi thông tin đều được cập nhật real-time</p>
                                </div>
                                <div className="commitment-point">
                                    <h4>🎯 Chính Xác 100%</h4>
                                    <p>Giao hàng đến đúng địa chỉ đã chỉ định</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Delivery Areas & Time Section */}
                <section className="policy-section">
                    <div className="section-header">
                        <LocalShippingIcon className="section-icon" />
                        <h2>Khu Vực & Thời Gian Giao Hàng</h2>
                    </div>
                    <div className="section-content">
                        <div className="delivery-areas">
                            <div className="area-info">
                                <h3>🌍 Khu Vực Giao Hàng</h3>
                                <p>Chúng tôi giao hàng đến tất cả các quận/huyện trong thành phố</p>
                            </div>
                            
                            <div className="time-info">
                                <h3>⏰ Thời Gian Giao Hàng</h3>
                                <div className="time-slots">
                                    <div className="time-slot">
                                        <h4>🕐 Sáng</h4>
                                        <p>7:00 - 12:00</p>
                                    </div>
                                    <div className="time-slot">
                                        <h4>🕐 Chiều</h4>
                                        <p>12:00 - 17:00</p>
                                    </div>
                                    <div className="time-slot">
                                        <h4>🕐 Tối</h4>
                                        <p>17:00 - 22:00</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Delivery Fees Section */}
                <section className="policy-section">
                    <div className="section-header">
                        <InfoIcon className="section-icon" />
                        <h2>Phí Giao Hàng</h2>
                    </div>
                    <div className="section-content">
                        <div className="delivery-fees">
                            <div className="fee-structure">
                                <div className="fee-item">
                                    <h4>🚚 Giao Hàng Chuẩn</h4>
                                    <p className="fee-amount">$2.99</p>
                                    <p>Giao hàng trong vòng 45-60 phút</p>
                                </div>
                                <div className="fee-item">
                                    <h4>⚡ Giao Hàng Nhanh</h4>
                                    <p className="fee-amount">$4.99</p>
                                    <p>Giao hàng trong vòng 20-30 phút</p>
                                </div>
                                <div className="fee-item">
                                    <h4>🎁 Miễn Phí Giao Hàng</h4>
                                    <p className="fee-amount">$0.00</p>
                                    <p>Đơn hàng từ $25 trở lên</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact & Support Section */}
                <section className="policy-section">
                    <div className="section-header">
                        <SupportIcon className="section-icon" />
                        <h2>Hỗ Trợ & Liên Hệ</h2>
                    </div>
                    <div className="section-content">
                        <div className="support-info">
                            <p>
                                Nếu bạn có bất kỳ câu hỏi nào về dịch vụ giao hàng hoặc gặp vấn đề, 
                                vui lòng liên hệ với chúng tôi ngay lập tức:
                            </p>
                            <div className="contact-methods">
                                <div className="contact-method">
                                    <h4>📞 Hotline Giao Hàng</h4>
                                    <p>+1-800-DOLCE</p>
                                </div>
                                <div className="contact-method">
                                    <h4>📧 Email Hỗ Trợ</h4>
                                    <p>delivery@dolce.com</p>
                                </div>
                                <div className="contact-method">
                                    <h4>💬 Chat Online</h4>
                                    <p>Có sẵn 24/7</p>
                                </div>
                                <div className="contact-method">
                                    <h4>📱 App Hỗ Trợ</h4>
                                    <p>Hỗ trợ trực tiếp qua ứng dụng</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <div className="delivery-policy-footer">
                <p>Chính sách giao hàng này có hiệu lực từ ngày 01/01/2025 và có thể được cập nhật theo thời gian.</p>
                <p>© 2025 DOLCE. Tất cả quyền được bảo lưu.</p>
            </div>
        </div>
    );
};

export default DeliveryPolicy; 