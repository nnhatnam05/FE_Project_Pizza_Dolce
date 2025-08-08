import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [confirmModal, setConfirmModal] = useState(null);

  // Generate unique ID for notifications
  const generateId = useCallback(() => {
    return Date.now() + Math.random().toString(36).substr(2, 9);
  }, []);

  // Add notification
  const addNotification = useCallback((notification) => {
    const id = generateId();
    const newNotification = {
      id,
      timestamp: new Date().toISOString(),
      autoClose: true,
      duration: 5000,
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove if autoClose is enabled
    if (newNotification.autoClose) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, [generateId]);

  // Remove notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Show success notification
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: 'success',
      title: 'Success',
      message,
      priority: 'LOW',
      ...options
    });
  }, [addNotification]);

  // Show error notification
  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: 'error',
      title: 'Error',
      message,
      priority: 'HIGH',
      autoClose: false, // Errors should be manually dismissed
      ...options
    });
  }, [addNotification]);

  // Show warning notification
  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: 'warning',
      title: 'Warning',
      message,
      priority: 'MEDIUM',
      ...options
    });
  }, [addNotification]);

  // Show info notification
  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: 'info',
      title: 'Information',
      message,
      priority: 'LOW',
      ...options
    });
  }, [addNotification]);

  // Show confirm dialog
  const showConfirm = useCallback((options) => {
    return new Promise((resolve) => {
      const id = generateId();
      setConfirmModal({
        id,
        title: 'Confirm Action',
        message: 'Are you sure?',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        onConfirm: () => {
          setConfirmModal(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmModal(null);
          resolve(false);
        },
        ...options
      });
    });
  }, [generateId]);

  // Close confirm modal
  const closeConfirm = useCallback(() => {
    if (confirmModal) {
      confirmModal.onCancel();
    }
  }, [confirmModal]);

  const value = {
    notifications,
    confirmModal,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    closeConfirm
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 