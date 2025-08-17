import { useEffect, useRef } from 'react';
import accountStatusWebSocketService from '../services/accountStatusWebSocket';

const useAccountStatusWebSocket = () => {
    const isConnectedRef = useRef(false);
    const onDeactivationCallbackRef = useRef(null);
    const onActivationCallbackRef = useRef(null);

    // Connect to WebSocket
    const connectWebSocket = (userId, onDeactivation, onActivation) => {
        if (!userId || isConnectedRef.current) {
            return;
        }

        // Store callbacks
        onDeactivationCallbackRef.current = onDeactivation;
        onActivationCallbackRef.current = onActivation;

        try {
            accountStatusWebSocketService.connect(
                userId,
                (notification) => {
                    console.log('[Account Status] Account deactivated:', notification);
                    if (onDeactivationCallbackRef.current) {
                        onDeactivationCallbackRef.current(notification);
                    }
                },
                (notification) => {
                    console.log('[Account Status] Account activated:', notification);
                    if (onActivationCallbackRef.current) {
                        onActivationCallbackRef.current(notification);
                    }
                }
            );
            isConnectedRef.current = true;
            console.log('[Account Status] WebSocket connected for user:', userId);
        } catch (error) {
            console.error('[Account Status] Failed to connect WebSocket:', error);
        }
    };

    // Disconnect from WebSocket
    const disconnectWebSocket = () => {
        if (isConnectedRef.current) {
            accountStatusWebSocketService.disconnect();
            isConnectedRef.current = false;
            console.log('[Account Status] WebSocket disconnected');
        }
    };

    // Auto-connect when component mounts
    useEffect(() => {
        // Don't auto-connect - wait for component to call connectWebSocket with callbacks
        console.log('[Account Status] Hook mounted, waiting for connectWebSocket call');

        // Cleanup on unmount
        return () => {
            disconnectWebSocket();
        };
    }, []); // Empty dependency array to run only once

    // Listen for token changes
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'token') {
                if (e.newValue) {
                    // New token - but don't auto-connect
                    console.log('[Account Status] Token changed, but not auto-connecting');
                } else {
                    // Token removed - disconnect WebSocket
                    disconnectWebSocket();
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return {
        connectWebSocket,
        disconnectWebSocket,
        isConnected: isConnectedRef.current
    };
};

export default useAccountStatusWebSocket; 