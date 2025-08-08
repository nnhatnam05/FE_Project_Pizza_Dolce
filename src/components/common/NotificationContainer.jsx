import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import NotificationToast from './NotificationToast';
import ConfirmModal from './ConfirmModal';

const NotificationContainer = () => {
  const { notifications, confirmModal, removeNotification, closeConfirm } = useNotification();

  return (
    <>
      {/* Notifications Container */}
      <div className="notifications-container">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
            autoClose={notification.autoClose}
            duration={notification.duration}
          />
        ))}
      </div>

      {/* Confirm Modal */}
      {confirmModal && (
        <ConfirmModal
          isOpen={true}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          onConfirm={confirmModal.onConfirm}
          onCancel={confirmModal.onCancel}
          type={confirmModal.type}
        />
      )}
    </>
  );
};

export default NotificationContainer; 