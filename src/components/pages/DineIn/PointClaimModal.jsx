import React, { useState } from 'react';
import axios from 'axios';
import './PointClaimModal.css';

const PointClaimModal = ({ claimToken, tokenInfo, tableNumber, onClose, onSuccess }) => {
  const [step, setStep] = useState('choose'); // 'choose', 'existing', 'success'
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleExistingCustomer = async () => {
    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }

    if (!validateEmail(email.trim())) {
      setError('Email không hợp lệ');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('Claiming points for existing customer:', email.trim());
      const response = await axios.post('http://localhost:8080/api/dinein/points/claim-existing', {
        token: claimToken,
        email: email.trim()
      });

      console.log('Claim response:', response.data);

      if (response.data.success) {
        setSuccessMessage(response.data.message);
        setStep('success');
        
        // Auto close and trigger success callback after 3 seconds
        setTimeout(() => {
          onSuccess();
        }, 3000);
      } else {
        setError(response.data.message || 'Không thể nhận điểm');
      }
    } catch (err) {
      console.error('Claim error:', err);
      const errorMessage = err.response?.data?.message || 'Không thể nhận điểm. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    // Redirect to sign up page with return URL and claim token
    const returnUrl = encodeURIComponent(`/dinein/thank-you?token=${claimToken}&table=${tableNumber}`);
    const signupUrl = `/signup?return_url=${returnUrl}&claim_token=${claimToken}`;
    console.log('Redirecting to signup:', signupUrl);
    window.location.href = signupUrl;
  };

  const handleBackToChoose = () => {
    setStep('choose');
    setEmail('');
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && step === 'existing' && !loading) {
      handleExistingCustomer();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content point-claim-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🎁 Nhận điểm thưởng</h3>
          <button className="close-btn" onClick={onClose} disabled={loading}>×</button>
        </div>

        {step === 'choose' && (
          <div className="modal-body">
            <div className="points-info">
              <div className="points-display">
                <span className="points-number">{tokenInfo.pointsToEarn}</span>
                <span className="points-label">điểm</span>
              </div>
              <p className="points-description">
                Bạn sẽ nhận được <strong>{tokenInfo.pointsToEarn} điểm</strong> từ đơn hàng này!
              </p>
              <div className="points-rule">
                <small>💡 Quy tắc: Mỗi $10 = 10 điểm (làm tròn xuống)</small>
              </div>
            </div>
            
            <div className="claim-options">
              <button 
                className="btn btn-primary option-btn"
                onClick={() => setStep('existing')}
              >
                <div className="option-content">
                  <span className="option-icon">📧</span>
                  <div className="option-text">
                    <span className="option-title">Tôi đã có tài khoản</span>
                    <span className="option-desc">Nhập email để nhận điểm ngay</span>
                  </div>
                </div>
              </button>
              
              <button 
                className="btn btn-secondary option-btn"
                onClick={handleSignUp}
              >
                <div className="option-content">
                  <span className="option-icon">✨</span>
                  <div className="option-text">
                    <span className="option-title">Tạo tài khoản mới</span>
                    <span className="option-desc">Đăng ký để nhận điểm và nhiều ưu đãi</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 'existing' && (
          <div className="modal-body">
            <div className="existing-customer-section">
              <h4>Nhập email của bạn</h4>
              <p className="section-description">
                Nhập email đã đăng ký để nhận <strong>{tokenInfo.pointsToEarn} điểm</strong>
              </p>
              
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="your@email.com"
                  className={`form-control ${error ? 'error' : ''}`}
                  disabled={loading}
                  autoFocus
                />
              </div>
              
              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}
              
              <div className="modal-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={handleBackToChoose}
                  disabled={loading}
                >
                  <span className="btn-icon">←</span>
                  Quay lại
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleExistingCustomer}
                  disabled={loading || !email.trim()}
                >
                  {loading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">🎁</span>
                      Nhận điểm
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="modal-body success-step">
            <div className="success-animation">
              <div className="success-icon">🎉</div>
              <div className="confetti">
                <span>🎊</span>
                <span>✨</span>
                <span>🎁</span>
                <span>⭐</span>
              </div>
            </div>
            <h4>Thành công!</h4>
            <p className="success-message">{successMessage}</p>
            <div className="success-details">
              <p>📧 Email xác nhận đã được gửi đến: <strong>{email}</strong></p>
            </div>
            <p className="auto-close">
              <span className="auto-close-icon">⏱️</span>
              Tự động đóng sau 3 giây...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PointClaimModal; 