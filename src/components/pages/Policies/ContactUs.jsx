import React, { useState } from 'react';
import './PoliciesGlobal.css';
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
        name: 'queqweq',
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
        <div className="policies-page-wrapper">
            {/* Back Button */}
            <button className="policies-back-button" onClick={handleBack}>
                <ArrowBackIcon />
                <span>Quay lại</span>
            </button>

            {/* Header Section */}
            <div className="policies-header-section">
                <h1 className="policies-page-title">
                    <ContactSupportIcon style={{ marginRight: '10px' }} />
                    Liên Hệ Với Chúng Tôi
                </h1>
                <p className="policies-page-subtitle">
                    Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn mọi lúc
                </p>
            </div>

            {/* Contact Information Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <BusinessIcon style={{ marginRight: '10px' }} />
                    Thông Tin Liên Hệ
                </h2>
                <div className="policies-section-content">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <LocationOnIcon style={{ color: '#e74c3c', fontSize: '2rem', marginTop: '5px' }} />
                            <div>
                                <h3 style={{ color: '#232f54', marginBottom: '10px' }}>📍 Địa Chỉ</h3>
                                <p style={{ color: '#666', marginBottom: '5px' }}>FPT Arena Multimedia</p>
                                <p style={{ color: '#666', marginBottom: '5px' }}>Lê Lợi, Quận 1</p>
                                <p style={{ color: '#666' }}>TP.HCM, Việt Nam</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <PhoneIcon style={{ color: '#e74c3c', fontSize: '2rem', marginTop: '5px' }} />
                            <div>
                                <h3 style={{ color: '#232f54', marginBottom: '10px' }}>📞 Điện Thoại</h3>
                                <p style={{ color: '#666', marginBottom: '5px' }}>Hotline: +1-000-DOLCE</p>
                                <p style={{ color: '#666', marginBottom: '5px' }}>Support: +1-555-0123</p>
                                <p style={{ color: '#666' }}>Fax: +1-555-0124</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <EmailIcon style={{ color: '#f39c12', fontSize: '2rem', marginTop: '5px' }} />
                            <div>
                                <h3 style={{ color: '#232f54', marginBottom: '10px' }}>📧 Email</h3>
                                <p style={{ color: '#666', marginBottom: '5px' }}>General: info@dolce.com</p>
                                <p style={{ color: '#666', marginBottom: '5px' }}>Support: support@dolce.com</p>
                                <p style={{ color: '#666' }}>Business: business@dolce.com</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <AccessTimeIcon style={{ color: '#f39c12', fontSize: '2rem', marginTop: '5px' }} />
                            <div>
                                <h3 style={{ color: '#232f54', marginBottom: '10px' }}>🕐 Giờ Làm Việc</h3>
                                <p style={{ color: '#666', marginBottom: '5px' }}>Thứ 2 - Thứ 6: 7:00-22:00</p>
                                <p style={{ color: '#666', marginBottom: '5px' }}>Thứ 7: 8:00-23:00</p>
                                <p style={{ color: '#666' }}>Chủ Nhật: 9:00-21:00</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Form Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <SendIcon style={{ marginRight: '10px' }} />
                    Gửi Tin Nhắn Cho Chúng Tôi
                </h2>
                <div className="policies-section-content">
                    {submitSuccess && (
                        <div style={{ background: '#d4edda', color: '#155724', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #c3e6cb' }}>
                            ✅ Tin nhắn đã được gửi thành công! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                        </div>
                    )}
                    
                    {submitError && (
                        <div style={{ background: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #f5c6cb' }}>
                            ❌ {submitError}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#232f54', fontWeight: '600' }}>
                                    Họ và Tên *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #e0e0e0',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        transition: 'border-color 0.3s ease'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#232f54'}
                                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                />
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#232f54', fontWeight: '600' }}>
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Nhập địa chỉ email"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #e0e0e0',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        transition: 'border-color 0.3s ease'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#232f54'}
                                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                />
                            </div>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#232f54', fontWeight: '600' }}>
                                    Số Điện Thoại
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Nhập số điện thoại"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #e0e0e0',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        transition: 'border-color 0.3s ease'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#232f54'}
                                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                />
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#232f54', fontWeight: '600' }}>
                                    Chủ Đề *
                                </label>
                                <select
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #e0e0e0',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        backgroundColor: 'white',
                                        transition: 'border-color 0.3s ease'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#232f54'}
                                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                >
                                    <option value="">Chọn chủ đề</option>
                                    <option value="general">Thông tin chung</option>
                                    <option value="support">Hỗ trợ khách hàng</option>
                                    <option value="complaint">Khiếu nại</option>
                                    <option value="suggestion">Đề xuất</option>
                                    <option value="business">Hợp tác kinh doanh</option>
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#232f54', fontWeight: '600' }}>
                                Nội Dung Tin Nhắn *
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                required
                                rows="6"
                                placeholder="Nhập nội dung tin nhắn của bạn"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    resize: 'vertical',
                                    transition: 'border-color 0.3s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#232f54'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    background: '#ffd700',
                                    color: '#232f54',
                                    border: 'none',
                                    padding: '15px 30px',
                                    borderRadius: '25px',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    transition: 'all 0.3s ease',
                                    opacity: isSubmitting ? 0.7 : 1
                                }}
                                onMouseEnter={(e) => !isSubmitting && (e.target.style.background = '#ffed4e')}
                                onMouseLeave={(e) => !isSubmitting && (e.target.style.background = '#ffd700')}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div style={{ width: '20px', height: '20px', border: '2px solid #232f54', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                        Đang gửi...
                                    </>
                                ) : (
                                    <>
                                        Gửi Tin Nhắn
                                        <SendIcon />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Map & Location Section */}
            <div className="policies-highlight-section">
                <h2 className="policies-highlight-title">
                    <MapIcon style={{ marginRight: '10px' }} />
                    Bản Đồ & Vị Trí
                </h2>
                <div className="policies-highlight-content">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', alignItems: 'start' }}>
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '25px', borderRadius: '15px' }}>
                            <h3 style={{ color: '#ffd700', marginBottom: '20px', fontSize: '1.3rem' }}>
                                📍 Vị Trí DOLCE Restaurant
                            </h3>
                            <div style={{ marginBottom: '20px' }}>
                                <p style={{ marginBottom: '8px' }}><strong>Địa Chỉ:</strong> FPT Arena Multimedia</p>
                                <p style={{ marginBottom: '8px' }}><strong>Đường:</strong> Lê Lợi, Quận 1, TP.HCM</p>
                                <p style={{ marginBottom: '8px' }}><strong>Tọa Độ:</strong> 10.8454°N, 106.7118°E</p>
                            </div>
                            <button
                                style={{
                                    background: '#ffd700',
                                    color: '#232f54',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '20px',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#ffed4e'}
                                onMouseLeave={(e) => e.target.style.background = '#ffd700'}
                            >
                                🗺️ Mở Bản Đồ Google Maps
                            </button>
                        </div>
                        
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '25px', borderRadius: '15px', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ textAlign: 'center', color: '#ffd700' }}>
                                <MapIcon style={{ fontSize: '4rem', marginBottom: '15px' }} />
                                <p>Bản đồ sẽ được hiển thị tại đây</p>
                                <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Google Maps Integration</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <ContactSupportIcon style={{ marginRight: '10px' }} />
                    Câu Hỏi Thường Gặp
                </h2>
                <div className="policies-section-content">
                    <div style={{ display: 'grid', gap: '20px' }}>
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <h3 style={{ color: '#232f54', marginBottom: '10px', fontSize: '1.2rem' }}>
                                <strong>Q:</strong> Tôi có thể liên hệ với DOLCE qua những cách nào?
                            </h3>
                            <p style={{ color: '#666', lineHeight: '1.6' }}>
                                <strong>A:</strong> Bạn có thể liên hệ với chúng tôi qua điện thoại, email, form liên hệ trên website, hoặc đến trực tiếp các chi nhánh.
                            </p>
                        </div>
                        
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <h3 style={{ color: '#232f54', marginBottom: '10px', fontSize: '1.2rem' }}>
                                <strong>Q:</strong> Thời gian phản hồi email là bao lâu?
                            </h3>
                            <p style={{ color: '#666', lineHeight: '1.6' }}>
                                <strong>A:</strong> Chúng tôi cam kết phản hồi trong vòng 24 giờ làm việc kể từ khi nhận được email.
                            </p>
                        </div>
                        
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <h3 style={{ color: '#232f54', marginBottom: '10px', fontSize: '1.2rem' }}>
                                <strong>Q:</strong> Tôi có thể đặt bàn qua điện thoại không?
                            </h3>
                            <p style={{ color: '#666', lineHeight: '1.6' }}>
                                <strong>A:</strong> Có, bạn có thể đặt bàn qua hotline +1-800-DOLCE hoặc qua ứng dụng di động của chúng tôi.
                            </p>
                        </div>
                        
                        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <h3 style={{ color: '#232f54', marginBottom: '10px', fontSize: '1.2rem' }}>
                                <strong>Q:</strong> DOLCE có dịch vụ giao hàng không?
                            </h3>
                            <p style={{ color: '#666', lineHeight: '1.6' }}>
                                <strong>A:</strong> Có, chúng tôi cung cấp dịch vụ giao hàng tận nơi trong phạm vi 10km từ các chi nhánh.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="policies-highlight-section">
                <h2 className="policies-highlight-title">
                    🚨 Liên Hệ Khẩn Cấp 24/7
                </h2>
                <div className="policies-highlight-content">
                    <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
                        Đối với các vấn đề khẩn cấp về an toàn thực phẩm, dịch vụ hoặc khiếu nại nghiêm trọng, vui lòng liên hệ ngay với chúng tôi:
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                            <PhoneIcon style={{ fontSize: '2.5rem', color: '#e74c3c', marginBottom: '10px' }} />
                            <h3 style={{ color: '#ffd700', marginBottom: '10px' }}>Hotline Khẩn Cấp</h3>
                            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '5px' }}>1900-DOLCE</p>
                            <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Hoạt động 24/7</p>
                        </div>
                        
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                            <EmailIcon style={{ fontSize: '2.5rem', color: '#3498db', marginBottom: '10px' }} />
                            <h3 style={{ color: '#ffd700', marginBottom: '10px' }}>Email Khẩn Cấp</h3>
                            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '5px' }}>emergency@dolce.com</p>
                            <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Phản hồi trong 2 giờ</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Section */}
            <div className="policies-footer-section">
                <p className="policies-footer-text">
                    Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn!
                </p>
                <p className="policies-copyright">
                    © 2025 DOLCE. Tất cả quyền được bảo lưu.
                </p>
            </div>
        </div>
    );
};

export default ContactUs; 