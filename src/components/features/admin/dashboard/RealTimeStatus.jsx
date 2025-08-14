import React from 'react';
import './RealTimeStatus.css';

const RealTimeStatus = ({ connected, lastUpdate, onManualRefresh, isRefreshing }) => {
  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return 'Chưa cập nhật';
    
    const now = new Date();
    const updateTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - updateTime) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} giây trước`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} phút trước`;
    } else {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} giờ trước`;
    }
  };

  return (
    <div className="real-time-status">
      <div className="status-indicator">
        <div className={`connection-dot ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? '🟢' : '🔴'}
        </div>
        <span className="status-text">
          {connected ? 'Kết nối real-time' : 'Mất kết nối'}
        </span>
      </div>
      
      <div className="update-info">
        <span className="last-update">
          Cập nhật cuối: {formatLastUpdate(lastUpdate)}
        </span>
        
        <button
          className={`manual-refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
          onClick={onManualRefresh}
          disabled={isRefreshing}
          title="Làm mới dữ liệu thủ công"
        >
          {isRefreshing ? '🔄' : '🔄'}
          <span className="refresh-text">
            {isRefreshing ? 'Đang tải...' : 'Làm mới'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default RealTimeStatus; 