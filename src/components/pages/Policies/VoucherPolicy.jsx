import React from 'react';
import './VoucherPolicy.css';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SecurityIcon from '@mui/icons-material/Security';
import InfoIcon from '@mui/icons-material/Info';

const VoucherPolicy = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="voucher-policy-container">
            {/* Header */}
            <div className="voucher-policy-header">
                <button className="back-button" onClick={handleBack}>
                    <ArrowBackIcon />
                    <span>Quay lại</span>
                </button>
                <h1 className="voucher-policy-title">
                    <CardGiftcardIcon className="title-icon" />
                    Chính Sách Voucher & Quà Tặng
                </h1>
            </div>

            {/* Main Content */}
            <div className="voucher-policy-content">
                
                {/* Introduction Section */}
                <section className="policy-section">
                    <div className="section-header">
                        <LocalOfferIcon className="section-icon" />
                        <h2>Giới Thiệu Voucher</h2>
                    </div>
                    <div className="section-content">
                        <p>
                            Chào mừng bạn đến với hệ thống voucher và quà tặng của DOLCE! Chúng tôi cung cấp 
                            nhiều loại voucher hấp dẫn để giúp bạn tiết kiệm chi phí và tận hưởng những món ăn 
                            ngon với giá tốt nhất.
                        </p>
                        <div className="voucher-types">
                            <div className="voucher-type-card">
                                <h3>🎫 Voucher Giảm Theo %</h3>
                                <p>Giảm giá theo phần trăm trên hóa đơn</p>
                            </div>
                            <div className="voucher-type-card">
                                <h3>💰 Voucher Giảm Số Tiền Cố Định</h3>
                                <p>Giảm số tiền cố định trên hóa đơn</p>
                            </div>
                            <div className="voucher-type-card">
                                <h3>🥤 Voucher Tặng Nước</h3>
                                <p>Nhận ly nước bất kì miễn phí</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How to Use Section */}
                <section className="policy-section">
                    <div className="section-header">
                        <InfoIcon className="section-icon" />
                        <h2>Cách Sử Dụng Voucher</h2>
                    </div>
                    <div className="section-content">
                        <div className="steps-container">
                            <div className="step-item">
                                <div className="step-number">1</div>
                                <div className="step-content">
                                    <h4>Chọn Voucher</h4>
                                    <p>Chọn voucher phù hợp từ danh sách voucher có sẵn</p>
                                </div>
                            </div>
                            <div className="step-item">
                                <div className="step-number">2</div>
                                <div className="step-content">
                                    <h4>Áp Dụng Voucher</h4>
                                    <p>Nhập mã voucher hoặc chọn voucher khi thanh toán</p>
                                </div>
                            </div>
                            <div className="step-item">
                                <div className="step-number">3</div>
                                <div className="step-content">
                                    <h4>Nhận Giảm Giá</h4>
                                    <p>Voucher sẽ được áp dụng tự động vào hóa đơn</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Terms and Conditions Section */}
                <section className="policy-section">
                    <div className="section-header">
                        <SecurityIcon className="section-icon" />
                        <h2>Điều Khoản & Điều Kiện</h2>
                    </div>
                    <div className="section-content">
                        <div className="terms-list">
                            <div className="term-item">
                                <h4>📅 Thời Hạn Sử Dụng</h4>
                                <ul>
                                    <li>Voucher có thời hạn sử dụng được ghi rõ trên voucher</li>
                                    <li>Voucher hết hạn sẽ không thể sử dụng</li>
                                    <li>Không thể gia hạn hoặc chuyển nhượng voucher</li>
                                </ul>
                            </div>
                            
                            <div className="term-item">
                                <h4>💰 Giá Trị Tối Thiểu</h4>
                                <ul>
                                    <li>Một số voucher yêu cầu đơn hàng tối thiểu</li>
                                    <li>Giá trị đơn hàng tính trước khi áp dụng voucher</li>
                                    <li>Không áp dụng cho phí giao hàng</li>
                                </ul>
                            </div>
                            
                            <div className="term-item">
                                <h4>🔄 Sử Dụng Voucher</h4>
                                <ul>
                                    <li>Mỗi voucher chỉ sử dụng được một lần</li>
                                    <li>Không thể kết hợp nhiều voucher cho cùng một đơn hàng</li>
                                    <li>Voucher không thể đổi thành tiền mặt</li>
                                </ul>
                            </div>
                            
                            <div className="term-item">
                                <h4>❌ Trường Hợp Không Áp Dụng</h4>
                                <ul>
                                    <li>Đơn hàng đã thanh toán</li>
                                    <li>Voucher đã hết hạn</li>
                                    <li>Đơn hàng không đạt giá trị tối thiểu</li>
                                    <li>Voucher đã được sử dụng</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Loyalty Points Section */}
                <section className="policy-section">
                    <div className="section-header">
                        <CardGiftcardIcon className="section-icon" />
                        <h2>Hệ Thống Tích Điểm</h2>
                    </div>
                    <div className="section-content">
                        <div className="points-info">
                            <div className="points-card">
                                <h3>🎯 Cách Tích Điểm</h3>
                                <p><strong>Mỗi 10$ = 10 điểm</strong></p>
                                <p>Điểm được tích tự động sau khi đơn hàng hoàn thành</p>
                            </div>
                            <div className="points-card">
                                <h3>💎 Nhận Voucher Ưu Đãi Tương Ứng Với Số Điểm Có Được</h3>
                                <p>Đua TOP RANK để nhận ưu đãi độc quyền</p>
                            </div>
                            <div className="points-card">
                                <h3>⏰ Thời Hạn Điểm</h3>
                                <p>Điểm có hiệu lực trong 12 tháng</p>
                                <p>Điểm hết hạn sẽ bị mất</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="policy-section">
                    <div className="section-header">
                        <InfoIcon className="section-icon" />
                        <h2>Câu Hỏi Thường Gặp</h2>
                    </div>
                    <div className="section-content">
                        <div className="faq-list">
                            <div className="faq-item">
                                <h4>Q: Tôi có thể sử dụng voucher cho đơn hàng giao hàng không?</h4>
                                <p>A: Có, bạn chỉ có thể sử dụng voucher cho đơn hàng giao hàng.</p>
                            </div>
                            
                            <div className="faq-item">
                                <h4>Q: Voucher có thể chuyển nhượng cho người khác không?</h4>
                                <p>A: Không, voucher chỉ có thể sử dụng bởi tài khoản đã nhận voucher.</p>
                            </div>
                            
                            <div className="faq-item">
                                <h4>Q: Làm sao để kiểm tra số điểm hiện tại?</h4>
                                <p>A: Bạn có thể kiểm tra số điểm trong phần "Thông tin cá nhân".</p>
                            </div>
                            
                            <div className="faq-item">
                                <h4>Q: Điểm có bị mất khi tôi xóa tài khoản không?</h4>
                                <p>A: Có, khi xóa tài khoản, tất cả điểm và voucher sẽ bị mất vĩnh viễn.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Support Section */}
                <section className="policy-section">
                    <div className="section-header">
                        <SecurityIcon className="section-icon" />
                        <h2>Hỗ Trợ & Liên Hệ</h2>
                    </div>
                    <div className="section-content">
                        <div className="support-info">
                            <p>
                                Nếu bạn có bất kỳ câu hỏi nào về voucher hoặc gặp vấn đề khi sử dụng, 
                                vui lòng liên hệ với chúng tôi:
                            </p>
                            <div className="contact-methods">
                                <div className="contact-method">
                                    <h4>📞 Hotline</h4>
                                    <p>+1-800-DOLCE</p>
                                </div>
                                <div className="contact-method">
                                    <h4>📧 Email</h4>
                                    <p>support@dolce.com</p>
                                </div>
                                <div className="contact-method">
                                    <h4>💬 Chat Online</h4>
                                    <p>Có sẵn 24/7</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <div className="voucher-policy-footer">
                <p>Chính sách này có hiệu lực từ ngày 01/01/2025 và có thể được cập nhật theo thời gian.</p>
                <p>© 2025 DOLCE. Tất cả quyền được bảo lưu.</p>
            </div>
        </div>
    );
};

export default VoucherPolicy; 