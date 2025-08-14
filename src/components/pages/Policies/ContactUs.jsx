import React, { useState } from 'react';
import './ContactUs.css';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SendIcon from '@mui/icons-material/Send';
import MapIcon from '@mui/icons-material/Map';
import BusinessIcon from '@mui/icons-material/Business';

const ContactUs = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleBack = () => {
        navigate(-1);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError('');

        try {
            // Simulate form submission
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            });
            
            setSubmitSuccess(true);
            setTimeout(() => setSubmitSuccess(false), 5000);
        } catch (error) {
            setSubmitError('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="contact-us-container">
            {/* Header */}
            <div className="contact-us-header">
                <button className="back-button" onClick={handleBack}>
                    <ArrowBackIcon />
                    <span>Quay lại</span>
                </button>
                <h1 className="contact-us-title">
                    <ContactSupportIcon className="title-icon" />
                    Liên Hệ Với Chúng Tôi
                </h1>
            </div>

            {/* Main Content */}
            <div className="contact-us-content">
                
                {/* Contact Information Section */}
                <section className="contact-section">
                    <div className="section-header">
                        <BusinessIcon className="section-icon" />
                        <h2>Thông Tin Liên Hệ</h2>
                    </div>
                    <div className="section-content">
                        <div className="contact-info-grid">
                            <div className="contact-info-card">
                                <LocationOnIcon className="contact-icon" />
                                <div className="contact-details">
                                    <h3>📍 Địa Chỉ</h3>
                                    <p>FPT Arena Multimedia</p>
                                    <p>Lê Lợi, Quận 1</p>
                                    <p>TP.HCM, Việt Nam</p>
                                </div>
                            </div>
                            
                            <div className="contact-info-card">
                                <PhoneIcon className="contact-icon" />
                                <div className="contact-details">
                                    <h3>📞 Điện Thoại</h3>
                                    <p>Hotline: +1-800-DOLCE</p>
                                    <p>Support: +1-555-0123</p>
                                    <p>Fax: +1-555-0124</p>
                                </div>
                            </div>
                            
                            <div className="contact-info-card">
                                <EmailIcon className="contact-icon" />
                                <div className="contact-details">
                                    <h3>📧 Email</h3>
                                    <p>General: info@dolce.com</p>
                                    <p>Support: support@dolce.com</p>
                                    <p>Business: business@dolce.com</p>
                                </div>
                            </div>
                            
                            <div className="contact-info-card">
                                <AccessTimeIcon className="contact-icon" />
                                <div className="contact-details">
                                    <h3>🕐 Giờ Làm Việc</h3>
                                    <p>Thứ 2 - Thứ 6: 7:00 - 22:00</p>
                                    <p>Thứ 7: 8:00 - 23:00</p>
                                    <p>Chủ Nhật: 9:00 - 21:00</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Form Section */}
                <section className="contact-section">
                    <div className="section-header">
                        <SendIcon className="section-icon" />
                        <h2>Gửi Tin Nhắn Cho Chúng Tôi</h2>
                    </div>
                    <div className="section-content">
                        <div className="contact-form-container">
                            {submitSuccess && (
                                <div className="success-message">
                                    <h3>✅ Tin nhắn đã được gửi thành công!</h3>
                                    <p>Cảm ơn bạn đã liên hệ với chúng tôi. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.</p>
                                </div>
                            )}
                            
                            {submitError && (
                                <div className="error-message">
                                    <h3>❌ Có lỗi xảy ra!</h3>
                                    <p>{submitError}</p>
                                </div>
                            )}
                            
                            <form onSubmit={handleSubmit} className="contact-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="name">Họ và Tên *</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Nhập họ và tên của bạn"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="email">Email *</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Nhập địa chỉ email"
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="phone">Số Điện Thoại</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="Nhập số điện thoại"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="subject">Chủ Đề *</label>
                                        <select
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Chọn chủ đề</option>
                                            <option value="general">Thông tin chung</option>
                                            <option value="order">Đơn hàng & Giao hàng</option>
                                            <option value="quality">Chất lượng & Dịch vụ</option>
                                            <option value="feedback">Góp ý & Phản hồi</option>
                                            <option value="partnership">Hợp tác kinh doanh</option>
                                            <option value="other">Khác</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="form-group full-width">
                                    <label htmlFor="message">Nội Dung Tin Nhắn *</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                        rows="6"
                                        placeholder="Nhập nội dung tin nhắn của bạn..."
                                    ></textarea>
                                </div>
                                
                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        className="submit-button"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="loading-spinner"></div>
                                                Đang gửi...
                                            </>
                                        ) : (
                                            <>
                                                <SendIcon />
                                                Gửi Tin Nhắn
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>

                {/* Map & Location Section */}
                <section className="contact-section">
                    <div className="section-header">
                        <MapIcon className="section-icon" />
                        <h2>Bản Đồ & Vị Trí</h2>
                    </div>
                    <div className="section-content">
                        <div className="map-container">
                            <div className="map-iframe-container">
                                <div className="map-placeholder">
                                    <MapIcon className="map-icon" />
                                    <h3>🗺️ Vị Trí DOLCE Restaurant</h3>
                                    <div className="map-info">
                                        <p><strong>📍 Địa Chỉ:</strong> FPT Arena Multimedia</p>
                                        <p><strong>🏢 Đường:</strong> Lê Lợi, Quận 1, TP.HCM</p>
                                        <p><strong>🌍 Tọa Độ:</strong> 10.8454°N, 106.7118°E</p>
                                    </div>
                                    <div className="map-actions">
                                        <a 
                                            href="https://maps.google.com/?q=FPT+Arena+Multimedia,Ho+Chi+Minh+City,Vietnam" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="map-link-button"
                                        >
                                            🌐 Mở Bản Đồ Google Maps
                                        </a>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="location-details">
                                <h3>📍 Hướng Dẫn Đường Đi</h3>
                                <div className="directions">
                                    <div className="direction-item">
                                        <h4>🚇 Bằng Tàu Điện Ngầm</h4>
                                        <p>Tuyến Metro đến trạm Bến Thành</p>
                                        <p>Đi bộ 10 phút về phía Lê Lợi</p>
                                    </div>
                                    
                                    <div className="direction-item">
                                        <h4>🚌 Bằng Xe Buýt</h4>
                                        <p>Tuyến 01, 02, 03 đến trạm Lê Lợi</p>
                                        <p>Xuống xe tại trạm Bến Thành</p>
                                    </div>
                                    
                                    <div className="direction-item">
                                        <h4>🚗 Bằng Ô Tô</h4>
                                        <p>Đường Lê Lợi, Quận 1, TP.HCM</p>
                                        <p>Gần góc đường Lê Lợi - Pasteur</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="contact-section">
                    <div className="section-header">
                        <ContactSupportIcon className="section-icon" />
                        <h2>Câu Hỏi Thường Gặp</h2>
                    </div>
                    <div className="section-content">
                        <div className="faq-container">
                            <div className="faq-item">
                                <h4>Q: Tôi có thể liên hệ với DOLCE qua những cách nào?</h4>
                                <p>A: Bạn có thể liên hệ với chúng tôi qua điện thoại, email, form liên hệ trên website, hoặc đến trực tiếp các chi nhánh.</p>
                            </div>
                            
                            <div className="faq-item">
                                <h4>Q: Thời gian phản hồi email là bao lâu?</h4>
                                <p>A: Chúng tôi cam kết phản hồi trong vòng 24 giờ làm việc kể từ khi nhận được email.</p>
                            </div>
                            
                            <div className="faq-item">
                                <h4>Q: Tôi có thể đặt bàn qua điện thoại không?</h4>
                                <p>A: Có, bạn có thể đặt bàn qua hotline +1-800-DOLCE hoặc qua ứng dụng di động của chúng tôi.</p>
                            </div>
                            
                            <div className="faq-item">
                                <h4>Q: DOLCE có dịch vụ giao hàng không?</h4>
                                <p>A: Có, chúng tôi cung cấp dịch vụ giao hàng tận nơi trong phạm vi 10km từ các chi nhánh.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Emergency Contact Section */}
                <section className="contact-section">
                    <div className="section-header">
                        <PhoneIcon className="section-icon" />
                        <h2>Liên Hệ Khẩn Cấp</h2>
                    </div>
                    <div className="section-content">
                        <div className="emergency-contact">
                            <div className="emergency-highlight">
                                <h3>🚨 Liên Hệ Khẩn Cấp 24/7</h3>
                                <p>
                                    Đối với các vấn đề khẩn cấp về an toàn thực phẩm, dịch vụ hoặc khiếu nại nghiêm trọng, 
                                    vui lòng liên hệ ngay với chúng tôi:
                                </p>
                            </div>
                            
                            <div className="emergency-numbers">
                                <div className="emergency-item">
                                    <h4>📞 Hotline Khẩn Cấp</h4>
                                    <p className="emergency-number">1900-DOLCE</p>
                                    <p>Hoạt động 24/7</p>
                                </div>
                                
                                <div className="emergency-item">
                                    <h4>📧 Email Khẩn Cấp</h4>
                                    <p className="emergency-number">emergency@dolce.com</p>
                                    <p>Phản hồi trong 2 giờ</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <div className="contact-us-footer">
                <p>Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn!</p>
                <p>© 2025 DOLCE. Tất cả quyền được bảo lưu.</p>
            </div>
        </div>
    );
};

export default ContactUs; 