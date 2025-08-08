import React, { useState, useEffect } from 'react';
import useWebSocket from '../../hooks/useWebSocket';

const WebSocketTest = () => {
  const [messages, setMessages] = useState([]);
  const { connected, subscribe, notifications } = useWebSocket();

  useEffect(() => {
    if (connected) {
      console.log('WebSocket connected, setting up subscriptions...');
      
      // Subscribe to staff notifications
      const notificationSub = subscribe('/topic/staff/notifications', (data) => {
        console.log('Received notification:', data);
        setMessages(prev => [...prev, { type: 'notification', data, timestamp: new Date() }]);
      });

      // Subscribe to order updates
      const orderSub = subscribe('/topic/staff/orders', (data) => {
        console.log('Received order update:', data);
        setMessages(prev => [...prev, { type: 'order', data, timestamp: new Date() }]);
      });

      // Subscribe to staff calls
      const callSub = subscribe('/topic/staff/calls', (data) => {
        console.log('Received staff call:', data);
        setMessages(prev => [...prev, { type: 'call', data, timestamp: new Date() }]);
      });

      // Subscribe to payment requests
      const paymentSub = subscribe('/topic/staff/payments', (data) => {
        console.log('Received payment request:', data);
        setMessages(prev => [...prev, { type: 'payment', data, timestamp: new Date() }]);
      });
    }
  }, [connected, subscribe]);

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>WebSocket Test Dashboard</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Connection Status: </strong>
        <span style={{ color: connected ? 'green' : 'red' }}>
          {connected ? '🟢 Connected' : '🔴 Disconnected'}
        </span>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={clearMessages} style={{ padding: '10px 20px' }}>
          Clear Messages
        </button>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        <h3>Real-time Messages ({messages.length})</h3>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {messages.length === 0 ? (
            <p style={{ color: '#666' }}>No messages received yet...</p>
          ) : (
            messages.map((msg, index) => (
              <div 
                key={index} 
                style={{ 
                  padding: '10px', 
                  margin: '5px 0', 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: '4px',
                  borderLeft: `4px solid ${getTypeColor(msg.type)}`
                }}
              >
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {msg.timestamp.toLocaleTimeString()} - {msg.type.toUpperCase()}
                </div>
                <pre style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
                  {JSON.stringify(msg.data, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        <h3>Hook Notifications ({notifications.length})</h3>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <p style={{ color: '#666' }}>No hook notifications yet...</p>
          ) : (
            notifications.slice(0, 10).map((notification, index) => (
              <div 
                key={index} 
                style={{ 
                  padding: '8px', 
                  margin: '3px 0', 
                  backgroundColor: '#e8f4fd', 
                  borderRadius: '4px' 
                }}
              >
                <strong>{notification.title}</strong>: {notification.message}
                <div style={{ fontSize: '11px', color: '#666' }}>
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const getTypeColor = (type) => {
  switch (type) {
    case 'notification': return '#3498db';
    case 'order': return '#e74c3c';
    case 'call': return '#f39c12';
    case 'payment': return '#27ae60';
    default: return '#95a5a6';
  }
};

export default WebSocketTest; 