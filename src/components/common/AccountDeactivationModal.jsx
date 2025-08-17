import React from 'react';
import './AccountDeactivationModal.css';

const AccountDeactivationModal = ({ isOpen, onClose, notification }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="account-deactivation-overlay">
            <div className="account-deactivation-modal">
                <div className="modal-header">
                    <div className="warning-icon">⚠️</div>
                    <h2>Account Deactivated</h2>
                </div>
                
                <div className="modal-body">
                    <p className="deactivation-message">
                        {notification?.message || "Your account has been deactivated by administrator."}
                    </p>
                    
                    <div className="deactivation-details">
                        <p><strong>Reason:</strong> {notification?.reason || "Account deactivated by admin"}</p>
                        <p><strong>Time:</strong> {notification?.deactivatedAt ? new Date(notification.deactivatedAt).toLocaleString() : new Date().toLocaleString()}</p>
                    </div>
                    
                    <div className="contact-info">
                        <p>Please contact administrator for more information.</p>
                    </div>
                </div>
                
                <div className="modal-footer">
                    <button 
                        className="logout-button"
                        onClick={onClose}
                    >
                        OK - Return to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountDeactivationModal; 