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
      setError('Please enter email');
      return;
    }

    if (!validateEmail(email.trim())) {
      setError('Invalid email');
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
        
        // Tự động đóng và kích hoạt callback thành công sau 3 giây (giữ nguyên comment tiếng Việt)
        setTimeout(() => {
          onSuccess();
        }, 3000);
      } else {
        setError(response.data.message || 'Cannot claim points');
      }
    } catch (err) {
      console.error('Claim error:', err);
      const errorMessage = err.response?.data?.message || 'Cannot claim points. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    // Chuyển hướng đến trang đăng ký với URL trả về và claim token
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
          <h3>🎁 Earn Reward Points</h3>
          <button className="close-btn" onClick={onClose} disabled={loading}>×</button>
        </div>

        {step === 'choose' && (
          <div className="modal-body">
            <div className="points-info">
              <div className="points-display">
                <span className="points-number">{tokenInfo.pointsToEarn}</span>
                <span className="points-label">points</span>
              </div>
              <p className="points-description">
                You will receive <strong>{tokenInfo.pointsToEarn} points</strong> from this order!
              </p>
              <div className="points-rule">
                <small>💡 Rules: $10 = 10 points (rounded down)</small>
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
                    <span className="option-title">I have an account</span>
                    <span className="option-desc">Enter email to claim points now</span>
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
                    <span className="option-title">Create new account</span>
                    <span className="option-desc">Register to earn points and many benefits</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 'existing' && (
          <div className="modal-body">
            <div className="existing-customer-section">
              <h4>Enter your email</h4>
              <p className="section-description">
                Enter your registered email to claim <strong>{tokenInfo.pointsToEarn} points</strong>
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
                  Back to choose
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleExistingCustomer}
                  disabled={loading || !email.trim()}
                >
                  {loading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">🎁</span>
                      Claim points
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
            <h4>Success!</h4>
            <p className="success-message">{successMessage}</p>
            <div className="success-details">
              <p>📧 Confirmation email has been sent to: <strong>{email}</strong></p>
            </div>
            <p className="auto-close">
              <span className="auto-close-icon">⏱️</span>
              Closing in 3 seconds...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PointClaimModal; 