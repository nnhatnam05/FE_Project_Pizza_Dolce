import React, { useEffect } from 'react';
import './NotificationToast.css';

const NotificationToast = ({ notification, onClose, autoClose = true, duration = 5000 }) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'NEW_ORDER':
        return '🍽️';
      case 'ORDER_STATUS_UPDATE':
        return '📋';
      case 'STAFF_CALL':
        return '🔔';
      case 'PAYMENT_REQUEST':
        return '💳';
      default:
        return '📢';
    }
  };

  const getNotificationClass = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'notification-high';
      case 'MEDIUM':
        return 'notification-medium';
      case 'LOW':
        return 'notification-low';
      default:
        return 'notification-medium';
    }
  };

  return (
    <div className={`notification-toast ${getNotificationClass(notification.priority)} ${notification.type || ''}`}>
      <div className="notification-content">
        <div className="notification-icon">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="notification-text">
          <div className="notification-title">{notification.title}</div>
          <div className="notification-message">{notification.message}</div>
          <div className="notification-time">
            {new Date(notification.timestamp).toLocaleTimeString()}
          </div>
        </div>
        <button className="notification-close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default NotificationToast; 