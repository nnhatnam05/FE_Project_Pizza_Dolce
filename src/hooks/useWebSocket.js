import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const useWebSocket = (url = 'http://localhost:8080/ws') => {
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const clientRef = useRef(null);
  const subscriptionsRef = useRef([]);

  useEffect(() => {
    // Create STOMP client
    const client = new Client({
      webSocketFactory: () => new SockJS(url),
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
      onConnect: () => {
        console.log('WebSocket Connected successfully');
        setConnected(true);
      },
      onDisconnect: () => {
        console.log('WebSocket Disconnected');
        setConnected(false);
      },
      reconnectDelay: 5000, // Reconnect after 5 seconds
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onStompError: (frame) => {
        console.error('STOMP Error:', frame);
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      // Cleanup subscriptions
      subscriptionsRef.current.forEach(subscription => {
        subscription.unsubscribe();
      });
      subscriptionsRef.current = [];
      
      // Deactivate client
      if (client.active) {
        client.deactivate();
      }
    };
  }, [url]);

  const subscribe = (destination, callback) => {
    if (!clientRef.current) {
      console.warn('WebSocket client not initialized');
      return null;
    }
    
    if (!connected) {
      console.warn('WebSocket not connected, cannot subscribe to:', destination);
      return null;
    }
    
    try {
      const subscription = clientRef.current.subscribe(destination, (message) => {
        try {
          const data = JSON.parse(message.body);
          callback(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          callback(message.body);
        }
      });
      
      subscriptionsRef.current.push(subscription);
      console.log('Successfully subscribed to:', destination);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to', destination, ':', error);
      return null;
    }
  };

  const unsubscribe = (subscription) => {
    if (subscription) {
      subscription.unsubscribe();
      subscriptionsRef.current = subscriptionsRef.current.filter(sub => sub !== subscription);
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50 notifications
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  return {
    connected,
    subscribe,
    unsubscribe,
    notifications,
    addNotification,
    clearNotifications,
    removeNotification,
    client: clientRef.current
  };
};

export default useWebSocket;