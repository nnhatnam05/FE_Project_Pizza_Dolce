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
      setError('Order information not found');
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
      setError('Cannot load order information. Please try again.');
      setTokenInfo({ valid: false, message: 'Invalid token' });
    } finally {
      setLoading(false);
    }
  };

  const handleClaimSuccess = () => {
    setShowClaimModal(false);
    loadTokenInfo(); // Làm mới thông tin token để hiển thị trạng thái đã nhận
  };

  if (loading) {
    return (
      <div className="thank-you-container">
        <div className="thank-you-content">
          <div className="loading-section">
            <div className="spinner"></div>
            <p>Loading information...</p>
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
            <h2>❌ Error</h2>
            <p>{error}</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/'}
            >
              Back to Home
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
          <h1>Thank you!</h1>
          <p className="thank-you-message">Your payment has been confirmed successfully.</p>
          {tableNumber && (
            <div className="table-info">
              <span className="table-badge">Table {tableNumber}</span>
            </div>
          )}
        </div>
        
        {/* Phần cung cấp điểm thưởng */}
        {tokenInfo && tokenInfo.valid && !tokenInfo.claimed && (
          <div className="points-offer">
            <div className="points-offer-content">
              <div className="points-icon">🎁</div>
              <h3>Earn Reward Points!</h3>
              <p className="points-description">
                You can earn <strong className="points-highlight">{tokenInfo.pointsToEarn} points</strong> from this order!
              </p>
              <div className="order-summary">
                <div className="order-total">
                  <span className="label">Total Amount:</span>
                  <span className="value">${tokenInfo.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="points-rule">
                  <small>Rules: $10 = 10 points</small>
                </div>
              </div>
              <button 
                className="btn btn-primary btn-large claim-points-btn"
                onClick={() => setShowClaimModal(true)}
              >
                <span className="btn-icon">🎁</span>
                Earn Reward Points
              </button>
            </div>
          </div>
        )}
        
        {/* Already Claimed Section */}
        {tokenInfo && tokenInfo.claimed && (
          <div className="points-claimed">
            <div className="claimed-icon">✅</div>
            <h3>Already Claimed</h3>
            <p className="claimed-message">{tokenInfo.message}</p>
            {tokenInfo.claimedByEmail && (
              <p className="claimed-details">
                Claimed by: <strong>{tokenInfo.claimedByEmail}</strong>
              </p>
            )}
          </div>
        )}
        
        {/* Expired/Invalid Token Section */}
        {tokenInfo && !tokenInfo.valid && (
          <div className="points-expired">
            <div className="expired-icon">⏰</div>
            <h3>Expired</h3>
            <p className="expired-message">{tokenInfo.message}</p>
            <p className="expired-note">
              Reward point redemption time has expired. Please redeem points immediately after payment next time!
            </p>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="thank-you-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => window.location.href = '/'}
          >
            <span className="btn-icon">��</span>
            Back to Home
          </button>
          
          {tableNumber && (
            <button 
              className="btn btn-outline"
              onClick={() => window.location.href = `/order?table=${tableNumber}`}
            >
              <span className="btn-icon">🍽️</span>
              Back to Table {tableNumber}
            </button>
          )}
        </div>
        
        {/* Additional Info */}
        <div className="additional-info">
          <p className="info-text">
            💡 <strong>Tip:</strong> Register an account to accumulate points and receive many attractive offers!
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