import React from 'react';
import './AboutUs.css';
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
        <div className="about-us-container">
            {/* Header */}
            <div className="about-us-header">
                <button className="back-button" onClick={handleBack}>
                    <ArrowBackIcon />
                    <span>Quay lại</span>
                </button>
                <h1 className="about-us-title">
                    <BusinessIcon className="title-icon" />
                    Về Chúng Tôi - DOLCE
                </h1>
            </div>

            {/* Main Content */}
            <div className="about-us-content">
                
                {/* Company Introduction Section */}
                <section className="about-section">
                    <div className="section-header">
                        <RestaurantIcon className="section-icon" />
                        <h2>Giới Thiệu Công Ty</h2>
                    </div>
                    <div className="section-content">
                        <div className="company-intro">
                            <div className="intro-highlight">
                                <h3>🍕 DOLCE - Hương Vị Ý Đích Thực</h3>
                                <p>
                                    DOLCE là chuỗi nhà hàng Ý hàng đầu, chuyên phục vụ những món ăn Ý truyền thống 
                                    với hương vị đích thực. Chúng tôi tự hào mang đến trải nghiệm ẩm thực Ý chân chính, 
                                    từ những chiếc pizza nổi tiếng đến các món pasta, salad và món tráng miệng đặc trưng.
                                </p>
                            </div>
                            
                            <div className="company-stats">
                                <div className="stat-item">
                                    <h4>🏪 15+</h4>
                                    <p>Chi nhánh</p>
                                </div>
                                <div className="stat-item">
                                    <h4>👥 500+</h4>
                                    <p>Nhân viên</p>
                                </div>
                                <div className="stat-item">
                                    <h4>🍽️ 100+</h4>
                                    <p>Món ăn</p>
                                </div>
                                <div className="stat-item">
                                    <h4>⭐ 4.8/5</h4>
                                    <p>Đánh giá</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Company History Section */}
                <section className="about-section">
                    <div className="section-header">
                        <HistoryIcon className="section-icon" />
                        <h2>Lịch Sử Phát Triển</h2>
                    </div>
                    <div className="section-content">
                        <div className="history-timeline">
                            <div className="timeline-item">
                                <div className="timeline-year">2020</div>
                                <div className="timeline-content">
                                    <h4>🎯 Khởi Nghiệp</h4>
                                    <p>DOLCE được thành lập với nhà hàng đầu tiên tại trung tâm thành phố</p>
                                </div>
                            </div>
                            
                            <div className="timeline-item">
                                <div className="timeline-year">2021</div>
                                <div className="timeline-content">
                                    <h4>🚀 Mở Rộng</h4>
                                    <p>Mở thêm 3 chi nhánh mới và ra mắt dịch vụ giao hàng</p>
                                </div>
                            </div>
                            
                            <div className="timeline-item">
                                <div className="timeline-year">2022</div>
                                <div className="timeline-content">
                                    <h4>💻 Công Nghệ Số</h4>
                                    <p>Phát triển ứng dụng đặt hàng và hệ thống quản lý hiện đại</p>
                                </div>
                            </div>
                            
                            <div className="timeline-item">
                                <div className="timeline-year">2023</div>
                                <div className="timeline-content">
                                    <h4>🏆 Thành Công</h4>
                                    <p>Đạt 10 chi nhánh và nhận giải thưởng "Nhà hàng Ý tốt nhất"</p>
                                </div>
                            </div>
                            
                            <div className="timeline-item">
                                <div className="timeline-year">2024</div>
                                <div className="timeline-content">
                                    <h4>🌟 Vươn Xa</h4>
                                    <p>Mở rộng ra 15 chi nhánh và phát triển dịch vụ quốc tế</p>
                                </div>
                            </div>
                            
                            <div className="timeline-item">
                                <div className="timeline-year">2025</div>
                                <div className="timeline-content">
                                    <h4>🚀 Tương Lai</h4>
                                    <p>Tiếp tục mở rộng và đổi mới công nghệ phục vụ khách hàng</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Vision & Mission Section */}
                <section className="about-section">
                    <div className="section-header">
                        <VisibilityIcon className="section-icon" />
                        <h2>Tầm Nhìn & Sứ Mệnh</h2>
                    </div>
                    <div className="section-content">
                        <div className="vision-mission">
                            <div className="vision-card">
                                <h3>🔮 Tầm Nhìn</h3>
                                <p>
                                    Trở thành chuỗi nhà hàng Ý hàng đầu tại Việt Nam, mang đến trải nghiệm ẩm thực 
                                    Ý chân chính và dịch vụ chất lượng cao cho mọi khách hàng.
                                </p>
                            </div>
                            
                            <div className="mission-card">
                                <h3>🎯 Sứ Mệnh</h3>
                                <p>
                                    Cung cấp những món ăn Ý truyền thống với nguyên liệu chất lượng cao, 
                                    dịch vụ chuyên nghiệp và trải nghiệm khách hàng tuyệt vời.
                                </p>
                            </div>
                        </div>
                        
                        <div className="core-values">
                            <h3>💎 Giá Trị Cốt Lõi</h3>
                            <div className="values-grid">
                                <div className="value-item">
                                    <h4>🍕 Chất Lượng</h4>
                                    <p>Luôn sử dụng nguyên liệu tươi ngon và công thức truyền thống</p>
                                </div>
                                <div className="value-item">
                                    <h4>👥 Con Người</h4>
                                    <p>Đội ngũ nhân viên chuyên nghiệp và thân thiện</p>
                                </div>
                                <div className="value-item">
                                    <h4>💡 Đổi Mới</h4>
                                    <p>Không ngừng cải tiến và áp dụng công nghệ mới</p>
                                </div>
                                <div className="value-item">
                                    <h4>🤝 Uy Tín</h4>
                                    <p>Xây dựng niềm tin với khách hàng qua chất lượng dịch vụ</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team & Leadership Section */}
                <section className="about-section">
                    <div className="section-header">
                        <PeopleIcon className="section-icon" />
                        <h2>Đội Ngũ & Lãnh Đạo</h2>
                    </div>
                    <div className="section-content">
                        <div className="team-info">
                            <div className="team-highlight">
                                <h3>👨‍🍳 Đội Ngũ Chuyên Nghiệp</h3>
                                <p>
                                    DOLCE tự hào có đội ngũ đầu bếp Ý chuyên nghiệp, được đào tạo tại các 
                                    trường ẩm thực danh tiếng. Chúng tôi cam kết mang đến hương vị Ý đích thực 
                                    trong mọi món ăn.
                                </p>
                            </div>
                            
                            <div className="leadership-team">
                                <div className="leader-card">
                                    <div className="leader-avatar">
                                        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect width="80" height="80" fill="#f0f0f0"/>
                                            <circle cx="40" cy="32" r="16" fill="#ccc"/>
                                            <path d="M16 64c0-18 16-32 24-32s24 14 24 32v16H16z" fill="#ccc"/>
                                        </svg>
                                    </div>
                                    <h4>Giám Đốc Điều Hành</h4>
                                    <p>Nguyễn Văn A</p>
                                    <p>15+ năm kinh nghiệm trong ngành ẩm thực</p>
                                </div>
                                
                                <div className="leader-card">
                                    <div className="leader-avatar">
                                        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect width="80" height="80" fill="#f0f0f0"/>
                                            <circle cx="40" cy="32" r="16" fill="#ccc"/>
                                            <path d="M16 64c0-18 16-32 24-32s24 14 24 32v16H16z" fill="#ccc"/>
                                        </svg>
                                    </div>
                                    <h4>Bếp Trưởng Chính</h4>
                                    <p>Marco Rossi</p>
                                    <p>Đầu bếp Ý với 20+ năm kinh nghiệm</p>
                                </div>
                                
                                <div className="leader-card">
                                    <div className="leader-avatar">
                                        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect width="80" height="80" fill="#f0f0f0"/>
                                            <circle cx="40" cy="32" r="16" fill="#ccc"/>
                                            <path d="M16 64c0-18 16-32 24-32s24 14 24 32v16H16z" fill="#ccc"/>
                                        </svg>
                                    </div>
                                    <h4>Giám Đốc Kinh Doanh</h4>
                                    <p>Trần Thị B</p>
                                    <p>Chuyên gia phát triển thị trường</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Awards & Recognition Section */}
                <section className="about-section">
                    <div className="section-header">
                        <NewReleasesIcon className="section-icon" />
                        <h2>Giải Thưởng & Công Nhận</h2>
                    </div>
                    <div className="section-content">
                        <div className="awards-info">
                            <div className="awards-highlight">
                                <h3>🏆 Những Thành Tựu Đáng Tự Hào</h3>
                                <p>
                                    Trong suốt quá trình phát triển, DOLCE đã nhận được nhiều giải thưởng 
                                    và sự công nhận từ khách hàng và các tổ chức uy tín.
                                </p>
                            </div>
                            
                            <div className="awards-list">
                                <div className="award-item">
                                    <h4>🥇 2023</h4>
                                    <p>"Nhà hàng Ý tốt nhất" - Tạp chí Ẩm thực Việt Nam</p>
                                </div>
                                <div className="award-item">
                                    <h4>🥈 2022</h4>
                                    <p>"Chuỗi nhà hàng phát triển nhanh nhất" - Hiệp hội Nhà hàng</p>
                                </div>
                                <div className="award-item">
                                    <h4>🥉 2021</h4>
                                    <p>"Dịch vụ khách hàng xuất sắc" - Bộ Văn hóa</p>
                                </div>
                                <div className="award-item">
                                    <h4>⭐ 2020-2024</h4>
                                    <p>Đánh giá 4.8/5 từ 50,000+ khách hàng</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Information Section */}
                <section className="about-section">
                    <div className="section-header">
                        <LocationOnIcon className="section-icon" />
                        <h2>Thông Tin Liên Hệ</h2>
                    </div>
                    <div className="section-content">
                        <div className="contact-info">
                            <div className="contact-highlight">
                                <h3>📍 Trụ Sở Chính</h3>
                                <p>123 Main Street, Downtown, New York, NY 10001</p>
                            </div>
                            
                            <div className="contact-details">
                                <div className="contact-item">
                                    <PhoneIcon className="contact-icon" />
                                    <div className="contact-text">
                                        <h4>Điện Thoại</h4>
                                        <p>+1-800-DOLCE</p>
                                    </div>
                                </div>
                                
                                <div className="contact-item">
                                    <EmailIcon className="contact-icon" />
                                    <div className="contact-text">
                                        <h4>Email</h4>
                                        <p>info@dolce.com</p>
                                    </div>
                                </div>
                                
                                <div className="contact-item">
                                    <LocationOnIcon className="contact-icon" />
                                    <div className="contact-text">
                                        <h4>Website</h4>
                                        <p>www.dolce.com</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="business-hours">
                                <h3>🕐 Giờ Làm Việc</h3>
                                <div className="hours-grid">
                                    <div className="hours-item">
                                        <span>Thứ 2 - Thứ 6:</span>
                                        <span>7:00 - 22:00</span>
                                    </div>
                                    <div className="hours-item">
                                        <span>Thứ 7:</span>
                                        <span>8:00 - 23:00</span>
                                    </div>
                                    <div className="hours-item">
                                        <span>Chủ Nhật:</span>
                                        <span>9:00 - 21:00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <div className="about-us-footer">
                <p>DOLCE - Nơi hương vị Ý gặp gỡ tình yêu ẩm thực Việt Nam</p>
                <p>© 2025 DOLCE. Tất cả quyền được bảo lưu.</p>
            </div>
        </div>
    );
};

export default AboutUs; 