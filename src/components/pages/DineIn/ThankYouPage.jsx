import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import PointClaimModal from './PointClaimModal';
import './ThankYouPage.css';

const ThankYouPage = () => {
  const [searchParams] = useSearchParams();
  const claimToken = searchParams.get('token');
  const tableNumber = searchParams.get('table');
  
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (claimToken) {
      loadTokenInfo();
    } else {
      setLoading(false);
      setError('Không tìm thấy thông tin đơn hàng');
    }
  }, [claimToken]);

  const loadTokenInfo = async () => {
    try {
      console.log('Loading token info for:', claimToken);
      const response = await axios.get(`http://localhost:8080/api/dinein/points/token/${claimToken}`);
      console.log('Token info response:', response.data);
      setTokenInfo(response.data);
    } catch (err) {
      console.error('Failed to load token info:', err);
      setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại.');
      setTokenInfo({ valid: false, message: 'Token không hợp lệ' });
    } finally {
      setLoading(false);
    }
  };

  const handleClaimSuccess = () => {
    setShowClaimModal(false);
    loadTokenInfo(); // Refresh token info to show claimed status
  };

  if (loading) {
    return (
      <div className="thank-you-container">
        <div className="thank-you-content">
          <div className="loading-section">
            <div className="spinner"></div>
            <p>Đang tải thông tin...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="thank-you-container">
        <div className="thank-you-content">
          <div className="error-section">
            <h2>❌ Lỗi</h2>
            <p>{error}</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/'}
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="thank-you-container">
      <div className="thank-you-content">
        <div className="thank-you-header">
          <div className="success-icon">🎉</div>
          <h1>Cảm ơn bạn!</h1>
          <p className="thank-you-message">Thanh toán của bạn đã được xác nhận thành công.</p>
          {tableNumber && (
            <div className="table-info">
              <span className="table-badge">Bàn số {tableNumber}</span>
            </div>
          )}
        </div>
        
        {/* Points Offer Section */}
        {tokenInfo && tokenInfo.valid && !tokenInfo.claimed && (
          <div className="points-offer">
            <div className="points-offer-content">
              <div className="points-icon">🎁</div>
              <h3>Nhận điểm thưởng!</h3>
              <p className="points-description">
                Bạn có thể nhận <strong className="points-highlight">{tokenInfo.pointsToEarn} điểm</strong> từ đơn hàng này!
              </p>
              <div className="order-summary">
                <div className="order-total">
                  <span className="label">Tổng tiền:</span>
                  <span className="value">${tokenInfo.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="points-rule">
                  <small>Quy tắc: Mỗi $10 = 10 điểm</small>
                </div>
              </div>
              <button 
                className="btn btn-primary btn-large claim-points-btn"
                onClick={() => setShowClaimModal(true)}
              >
                <span className="btn-icon">🎁</span>
                Nhận điểm thưởng
              </button>
            </div>
          </div>
        )}
        
        {/* Already Claimed Section */}
        {tokenInfo && tokenInfo.claimed && (
          <div className="points-claimed">
            <div className="claimed-icon">✅</div>
            <h3>Đã nhận điểm</h3>
            <p className="claimed-message">{tokenInfo.message}</p>
            {tokenInfo.claimedByEmail && (
              <p className="claimed-details">
                Đã nhận bởi: <strong>{tokenInfo.claimedByEmail}</strong>
              </p>
            )}
          </div>
        )}
        
        {/* Expired/Invalid Token Section */}
        {tokenInfo && !tokenInfo.valid && (
          <div className="points-expired">
            <div className="expired-icon">⏰</div>
            <h3>Hết hạn</h3>
            <p className="expired-message">{tokenInfo.message}</p>
            <p className="expired-note">
              Thời gian nhận điểm đã hết hạn. Lần tới hãy nhận điểm ngay sau khi thanh toán nhé!
            </p>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="thank-you-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => window.location.href = '/'}
          >
            <span className="btn-icon">🏠</span>
            Về trang chủ
          </button>
          
          {tableNumber && (
            <button 
              className="btn btn-outline"
              onClick={() => window.location.href = `/order?table=${tableNumber}`}
            >
              <span className="btn-icon">🍽️</span>
              Quay lại bàn {tableNumber}
            </button>
          )}
        </div>
        
        {/* Additional Info */}
        <div className="additional-info">
          <p className="info-text">
            💡 <strong>Mẹo:</strong> Đăng ký tài khoản để tích lũy điểm và nhận nhiều ưu đãi hấp dẫn!
          </p>
        </div>
      </div>
      
      {/* Point Claim Modal */}
      {showClaimModal && tokenInfo && (
        <PointClaimModal
          claimToken={claimToken}
          tokenInfo={tokenInfo}
          tableNumber={tableNumber}
          onClose={() => setShowClaimModal(false)}
          onSuccess={handleClaimSuccess}
        />
      )}
    </div>
  );
};

export default ThankYouPage; 