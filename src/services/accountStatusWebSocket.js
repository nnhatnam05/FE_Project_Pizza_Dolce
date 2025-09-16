import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class AccountStatusWebSocketService {
    constructor() {
        this.stompClient = null;
        this.connected = false;
        this.subscriptions = new Map();
        this.onAccountDeactivated = null;
        this.onAccountActivated = null;
        this.currentUserId = null;
    }

    // Connect to WebSocket
    connect(userId, onAccountDeactivated, onAccountActivated) {
        if (this.connected && this.currentUserId === userId) {
            console.log('[WebSocket] Already connected for user:', userId);
            return;
        }

        // Disconnect previous connection if different user
        if (this.connected && this.currentUserId !== userId) {
            console.log('[WebSocket] Disconnecting previous user:', this.currentUserId);
            this.disconnect();
        }

        console.log('[WebSocket] Attempting to connect for user:', userId);

        this.onAccountDeactivated = onAccountDeactivated;
        this.onAccountActivated = onAccountActivated;
        this.currentUserId = userId;

        const socket = new SockJS('http://localhost:8080/ws');
        this.stompClient = Stomp.over(socket);

        // Enable debug logging
        this.stompClient.debug = (str) => {
            console.log('[WebSocket Debug]', str);
        };

        this.stompClient.connect(
            {},
            (frame) => {
                console.log('[WebSocket] Connected to account status service:', frame);
                this.connected = true;
                this.subscribeToAccountStatus(userId);
            },
            (error) => {
                console.error('[WebSocket] Connection error:', error);
                this.connected = false;
                this.currentUserId = null;
                // Retry connection after 5 seconds
                setTimeout(() => {
                    console.log('[WebSocket] Retrying connection...');
                    this.connect(userId, onAccountDeactivated, onAccountActivated);
                }, 5000);
            }
        );
    }

    // Subscribe to account status notifications
    subscribeToAccountStatus(userId) {
        if (!this.connected || !this.stompClient) {
            console.error('[WebSocket] Not connected');
            return;
        }

        // Subscribe to specific user topic
        const userTopic = `/topic/user/${userId}/account-status`;
        const userSubscription = this.stompClient.subscribe(userTopic, (message) => {
            try {
                const notification = JSON.parse(message.body);
                console.log('[WebSocket] Received account status notification:', notification);
                this.handleAccountStatusNotification(notification);
            } catch (error) {
                console.error('[WebSocket] Error parsing message:', error);
            }
        });

        // Subscribe to general account status topic
        const generalTopic = '/topic/account-status';
        const generalSubscription = this.stompClient.subscribe(generalTopic, (message) => {
            try {
                const notification = JSON.parse(message.body);
                console.log('[WebSocket] Received general account status notification:', notification);
                
                // Check if it's for this user (handle both string and number types)
                if (notification.userId == userId || notification.userId == userId.toString()) {
                    this.handleAccountStatusNotification(notification);
                }
            } catch (error) {
                console.error('[WebSocket] Error parsing general message:', error);
            }
        });

        this.subscriptions.set(userTopic, userSubscription);
        this.subscriptions.set(generalTopic, generalSubscription);

        console.log('[WebSocket] Subscribed to account status topics');
    }

    // Handle account status notifications
    handleAccountStatusNotification(notification) {
        switch (notification.type) {
            case 'ACCOUNT_DEACTIVATED':
                console.log('[WebSocket] Account deactivated:', notification);
                if (this.onAccountDeactivated) {
                    this.onAccountDeactivated(notification);
                }
                // Don't disconnect here - let the modal handle logout
                break;
            case 'ACCOUNT_ACTIVATED':
                console.log('[WebSocket] Account activated:', notification);
                if (this.onAccountActivated) {
                    this.onAccountActivated(notification);
                }
                break;
            default:
                console.log('[WebSocket] Unknown notification type:', notification.type);
        }
    }

    // Disconnect from WebSocket
    disconnect() {
        if (this.stompClient) {
            // Unsubscribe from all topics
            this.subscriptions.forEach((subscription, topic) => {
                subscription.unsubscribe();
                console.log('[WebSocket] Unsubscribed from:', topic);
            });
            this.subscriptions.clear();

            // Disconnect
            this.stompClient.disconnect(() => {
                console.log('[WebSocket] Disconnected from account status service');
                this.connected = false;
                this.stompClient = null;
                this.currentUserId = null;
            });
        }
    }

    // Force reconnect - useful when connection is lost
    forceReconnect(userId, onAccountDeactivated, onAccountActivated) {
        console.log('[WebSocket] Force reconnecting for user:', userId);
        this.disconnect();
        setTimeout(() => {
            this.connect(userId, onAccountDeactivated, onAccountActivated);
        }, 1000);
    }

    // Check if connected
    isConnected() {
        return this.connected;
    }
}

// Create singleton instance
const accountStatusWebSocketService = new AccountStatusWebSocketService();

export default accountStatusWebSocketService; 