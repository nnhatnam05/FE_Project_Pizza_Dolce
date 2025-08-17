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
                <span>Quay lại</span>
            </button>

            {/* Header Section */}
            <div className="policies-header-section">
                <h1 className="policies-page-title">
                    <BusinessIcon style={{ marginRight: '10px' }} />
                    Về Chúng Tôi - DOLCE
                </h1>
                <p className="policies-page-subtitle">
                    Khám phá câu chuyện và sứ mệnh của DOLCE - Chuỗi nhà hàng Ý hàng đầu
                </p>
            </div>

            {/* Company Introduction Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <RestaurantIcon style={{ marginRight: '10px' }} />
                    Giới Thiệu Công Ty
                </h2>
                <div className="policies-section-content">
                    <div className="policies-mb-20">
                        <h3 style={{ color: '#232f54', fontSize: '1.4rem', marginBottom: '15px' }}>
                            🍕 DOLCE - Hương Vị Ý Đích Thực
                        </h3>
                        <p>
                            DOLCE là chuỗi nhà hàng Ý hàng đầu, chuyên phục vụ những món ăn Ý truyền thống 
                            với hương vị đích thực. Chúng tôi tự hào mang đến trải nghiệm ẩm thực Ý chân chính, 
                            từ những chiếc pizza nổi tiếng đến các món pasta, salad và món tráng miệng đặc trưng.
                        </p>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
                        <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <h4 style={{ fontSize: '2rem', color: '#232f54', marginBottom: '10px' }}>🏪 15+</h4>
                            <p style={{ color: '#666' }}>Chi nhánh</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <h4 style={{ fontSize: '2rem', color: '#232f54', marginBottom: '10px' }}>👥 500+</h4>
                            <p style={{ color: '#666' }}>Nhân viên</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <h4 style={{ fontSize: '2rem', color: '#232f54', marginBottom: '10px' }}>🍽️ 100+</h4>
                            <p style={{ color: '#666' }}>Món ăn</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <h4 style={{ fontSize: '2rem', color: '#232f54', marginBottom: '10px' }}>⭐ 4.8/5</h4>
                            <p style={{ color: '#666' }}>Đánh giá</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Company History Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <HistoryIcon style={{ marginRight: '10px' }} />
                    Lịch Sử Phát Triển
                </h2>
                <div className="policies-section-content">
                    <div style={{ display: 'grid', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div style={{ background: '#232f54', color: 'white', padding: '10px 15px', borderRadius: '20px', fontWeight: 'bold', minWidth: '80px', textAlign: 'center' }}>
                                2020
                            </div>
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>🎯 Khởi Nghiệp</h4>
                                <p>DOLCE được thành lập với nhà hàng đầu tiên tại trung tâm thành phố</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div style={{ background: '#232f54', color: 'white', padding: '10px 15px', borderRadius: '20px', fontWeight: 'bold', minWidth: '80px', textAlign: 'center' }}>
                                2021
                            </div>
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>🚀 Mở Rộng</h4>
                                <p>Mở thêm 3 chi nhánh mới và ra mắt dịch vụ giao hàng</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div style={{ background: '#232f54', color: 'white', padding: '10px 15px', borderRadius: '20px', fontWeight: 'bold', minWidth: '80px', textAlign: 'center' }}>
                                2022
                            </div>
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>💻 Công Nghệ Số</h4>
                                <p>Phát triển ứng dụng đặt hàng và hệ thống quản lý hiện đại</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div style={{ background: '#232f54', color: 'white', padding: '10px 15px', borderRadius: '20px', fontWeight: 'bold', minWidth: '80px', textAlign: 'center' }}>
                                2023
                            </div>
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>🏆 Thành Công</h4>
                                <p>Đạt 10 chi nhánh và nhận giải thưởng "Nhà hàng Ý tốt nhất"</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div style={{ background: '#232f54', color: 'white', padding: '10px 15px', borderRadius: '20px', fontWeight: 'bold', minWidth: '80px', textAlign: 'center' }}>
                                2024
                            </div>
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>🌟 Vươn Xa</h4>
                                <p>Mở rộng ra 15 chi nhánh và phát triển dịch vụ quốc tế</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div style={{ background: '#232f54', color: 'white', padding: '10px 15px', borderRadius: '20px', fontWeight: 'bold', minWidth: '80px', textAlign: 'center' }}>
                                2025
                            </div>
                            <div>
                                <h4 style={{ color: '#232f54', marginBottom: '5px' }}>🚀 Tương Lai</h4>
                                <p>Tiếp tục mở rộng và đổi mới công nghệ phục vụ khách hàng</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vision & Mission Section */}
            <div className="policies-highlight-section">
                <h2 className="policies-highlight-title">
                    <VisibilityIcon style={{ marginRight: '10px' }} />
                    Tầm Nhìn & Sứ Mệnh
                </h2>
                <div className="policies-highlight-content">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '30px' }}>
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '20px', borderRadius: '10px' }}>
                            <h3 style={{ color: '#ffd700', marginBottom: '15px' }}>🔮 Tầm Nhìn</h3>
                            <p>
                                Trở thành chuỗi nhà hàng Ý hàng đầu tại Việt Nam, mang đến trải nghiệm ẩm thực 
                                Ý chân chính và dịch vụ chất lượng cao cho mọi khách hàng.
                            </p>
                        </div>
                        
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '20px', borderRadius: '10px' }}>
                            <h3 style={{ color: '#ffd700', marginBottom: '15px' }}>🎯 Sứ Mệnh</h3>
                            <p>
                                Cung cấp những món ăn Ý truyền thống với nguyên liệu chất lượng cao, 
                                dịch vụ chuyên nghiệp và trải nghiệm khách hàng tuyệt vời.
                            </p>
                        </div>
                    </div>
                    
                    <div>
                        <h3 style={{ color: '#ffd700', marginBottom: '20px' }}>💎 Giá Trị Cốt Lõi</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '15px', borderRadius: '10px' }}>
                                <h4 style={{ color: '#ffd700', marginBottom: '10px' }}>🍕 Chất Lượng</h4>
                                <p>Luôn sử dụng nguyên liệu tươi ngon và công thức truyền thống</p>
                            </div>
                            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '15px', borderRadius: '10px' }}>
                                <h4 style={{ color: '#ffd700', marginBottom: '10px' }}>👥 Con Người</h4>
                                <p>Đội ngũ nhân viên chuyên nghiệp và thân thiện</p>
                            </div>
                            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '15px', borderRadius: '10px' }}>
                                <h4 style={{ color: '#ffd700', marginBottom: '10px' }}>💡 Đổi Mới</h4>
                                <p>Không ngừng cải tiến và áp dụng công nghệ mới</p>
                            </div>
                            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '15px', borderRadius: '10px' }}>
                                <h4 style={{ color: '#ffd700', marginBottom: '10px' }}>🤝 Uy Tín</h4>
                                <p>Xây dựng niềm tin với khách hàng qua chất lượng dịch vụ</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team & Leadership Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <PeopleIcon style={{ marginRight: '10px' }} />
                    Đội Ngũ & Lãnh Đạo
                </h2>
                <div className="policies-section-content">
                    <div className="policies-mb-20">
                        <h3 style={{ color: '#232f54', fontSize: '1.4rem', marginBottom: '15px' }}>
                            👨‍🍳 Đội Ngũ Chuyên Nghiệp
                        </h3>
                        <p>
                            DOLCE tự hào có đội ngũ đầu bếp Ý chuyên nghiệp, được đào tạo tại các 
                            trường ẩm thực danh tiếng. Chúng tôi cam kết mang đến hương vị Ý đích thực 
                            trong mọi món ăn.
                        </p>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginTop: '30px' }}>
                        <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '15px' }}>
                            <div style={{ width: '80px', height: '80px', background: '#232f54', borderRadius: '50%', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem' }}>
                                👨‍💼
                            </div>
                            <h4 style={{ color: '#232f54', marginBottom: '10px' }}>Giám Đốc Điều Hành</h4>
                            <p style={{ fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>Nguyễn Văn A</p>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>15+ năm kinh nghiệm trong ngành ẩm thực</p>
                        </div>
                        
                        <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '15px' }}>
                            <div style={{ width: '80px', height: '80px', background: '#232f54', borderRadius: '50%', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem' }}>
                                👨‍🍳
                            </div>
                            <h4 style={{ color: '#232f54', marginBottom: '10px' }}>Bếp Trưởng Chính</h4>
                            <p style={{ fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>Marco Rossi</p>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>Đầu bếp Ý với 20+ năm kinh nghiệm</p>
                        </div>
                        
                        <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '15px' }}>
                            <div style={{ width: '80px', height: '80px', background: '#232f54', borderRadius: '50%', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem' }}>
                                👩‍💼
                            </div>
                            <h4 style={{ color: '#232f54', marginBottom: '10px' }}>Giám Đốc Kinh Doanh</h4>
                            <p style={{ fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>Trần Thị B</p>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>Chuyên gia phát triển thị trường</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Awards & Recognition Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <NewReleasesIcon style={{ marginRight: '10px' }} />
                    Giải Thưởng & Công Nhận
                </h2>
                <div className="policies-section-content">
                    <div className="policies-mb-20">
                        <h3 style={{ color: '#232f54', fontSize: '1.4rem', marginBottom: '15px' }}>
                            🏆 Những Thành Tựu Đáng Tự Hào
                        </h3>
                        <p>
                            Trong suốt quá trình phát triển, DOLCE đã nhận được nhiều giải thưởng 
                            và sự công nhận từ khách hàng và các tổ chức uy tín.
                        </p>
                    </div>
                    
                    <div style={{ display: 'grid', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div style={{ background: '#ffd700', color: '#232f54', padding: '8px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                🥇 2023
                            </div>
                            <p>"Nhà hàng Ý tốt nhất" - Tạp chí Ẩm thực Việt Nam</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div style={{ background: '#ffd700', color: '#232f54', padding: '8px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                🥈 2022
                            </div>
                            <p>"Chuỗi nhà hàng phát triển nhanh nhất" - Hiệp hội Nhà hàng</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div style={{ background: '#ffd700', color: '#232f54', padding: '8px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                🥉 2021
                            </div>
                            <p>"Dịch vụ khách hàng xuất sắc" - Bộ Văn hóa</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div style={{ background: '#ffd700', color: '#232f54', padding: '8px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                ⭐ 2020-2024
                            </div>
                            <p>Đánh giá 4.8/5 từ 50,000+ khách hàng</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Information Section */}
            <div className="policies-content-section">
                <h2 className="policies-section-title">
                    <LocationOnIcon style={{ marginRight: '10px' }} />
                    Thông Tin Liên Hệ
                </h2>
                <div className="policies-section-content">
                    <div className="policies-mb-20">
                        <h3 style={{ color: '#232f54', fontSize: '1.4rem', marginBottom: '15px' }}>
                            📍 Trụ Sở Chính
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
                    DOLCE - Nơi hương vị Ý gặp gỡ tình yêu ẩm thực Việt Nam
                </p>
                <p className="policies-copyright">
                    © 2025 DOLCE. Tất cả quyền được bảo lưu.
                </p>
            </div>
        </div>
    );
};

export default AboutUs; 