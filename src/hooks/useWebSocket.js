import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const useWebSocket = (url = 'http://localhost:8080/ws') => {
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const clientRef = useRef(null);
  const subscriptionsRef = useRef([]);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Chỉ tạo client một lần
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Create STOMP client
    const client = new Client({
      webSocketFactory: () => new SockJS(url),
      debug: (str) => {
        // Chỉ log khi cần debug
        if (str.includes('ERROR') || str.includes('WARN')) {
        console.log('STOMP Debug:', str);
        }
      },
      onConnect: () => {
        console.log('WebSocket Connected successfully');
        setConnected(true);
      },
      onDisconnect: () => {
        console.log('WebSocket Disconnected');
        setConnected(false);
      },
      reconnectDelay: 10000, // Tăng delay reconnect lên 10 giây
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onStompError: (frame) => {
        console.error('STOMP Error:', frame);
        // Không tự động reconnect khi có STOMP error
        setConnected(false);
      },
      onWebSocketError: (error) => {
        console.error('WebSocket Error:', error);
        // Không tự động reconnect khi có WebSocket error
        setConnected(false);
      },
      onWebSocketClose: () => {
        console.log('WebSocket Connection Closed');
        setConnected(false);
      }
    });

    clientRef.current = client;
    
    // Thêm timeout để tránh connect quá lâu
    const connectTimeout = setTimeout(() => {
      if (!client.active) {
        console.warn('WebSocket connection timeout, retrying...');
        client.activate();
      }
    }, 5000);
    
    client.activate();

    return () => {
      clearTimeout(connectTimeout);
      
      // Cleanup subscriptions
      subscriptionsRef.current.forEach(subscription => {
        try {
        subscription.unsubscribe();
        } catch (e) {
          // Ignore cleanup errors
        }
      });
      subscriptionsRef.current = [];
      
      // Deactivate client
      if (client.active) {
        try {
        client.deactivate();
        } catch (e) {
          // Ignore deactivation errors
        }
      }
      initializedRef.current = false;
    };
  }, [url]);

  const subscribe = useCallback((destination, callback) => {
    if (!clientRef.current) {
      console.warn('WebSocket client not initialized');
      return null;
    }
    
    if (!connected || !clientRef.current.active) {
      console.warn('WebSocket not connected or not active, cannot subscribe to:', destination);
      return null;
    }
    
    try {
      const subscription = clientRef.current.subscribe(destination, (message) => {
        const body = message && message.body != null ? message.body : '';
        const looksLikeJson = typeof body === 'string' && (body.startsWith('{') || body.startsWith('['));
        if (looksLikeJson) {
        try {
            const data = JSON.parse(body);
          callback(data);
            return;
          } catch (e) {
            // Nếu parse lỗi, fallback sang text mà không log lỗi ồn ào
          }
        }
        // Trường hợp text thuần
        callback(body);
      });
      
      subscriptionsRef.current.push(subscription);
      console.log('Successfully subscribed to:', destination);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to', destination, ':', error);
      return null;
    }
  }, [connected]);

  const unsubscribe = useCallback((subscription) => {
    if (subscription) {
      try {
      subscription.unsubscribe();
        // Remove from subscriptions array
        const index = subscriptionsRef.current.indexOf(subscription);
        if (index > -1) {
          subscriptionsRef.current.splice(index, 1);
        }
      } catch (error) {
        console.warn('Error unsubscribing:', error);
    }
    }
  }, []);

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [...prev, notification]);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Thêm function để kiểm tra connection và retry
  const checkConnection = useCallback(() => {
    if (clientRef.current && !clientRef.current.active && !connected) {
      console.log('Checking WebSocket connection...');
      try {
        clientRef.current.activate();
      } catch (error) {
        console.error('Error activating WebSocket:', error);
      }
    }
  }, [connected]);

  // Thêm function để force reconnect
  const forceReconnect = useCallback(() => {
    if (clientRef.current) {
      console.log('Force reconnecting WebSocket...');
      try {
        if (clientRef.current.active) {
          clientRef.current.deactivate();
        }
        setTimeout(() => {
          clientRef.current.activate();
        }, 1000);
      } catch (error) {
        console.error('Error force reconnecting:', error);
      }
    }
  }, []);

  return {
    connected,
    subscribe,
    unsubscribe,
    addNotification,
    clearNotifications,
    removeNotification,
    checkConnection,
    forceReconnect
  };
};

export default useWebSocket;