import React, { useState } from 'react';
import accountStatusWebSocketService from '../../services/accountStatusWebSocket';

const WebSocketTest = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [userId, setUserId] = useState('');
    const [messages, setMessages] = useState([]);

    const handleConnect = () => {
        if (!userId.trim()) {
            alert('Please enter a user ID');
            return;
        }

        try {
            accountStatusWebSocketService.connect(
                userId,
                (notification) => {
                    console.log('[Test] Account deactivated:', notification);
                    setMessages(prev => [...prev, `DEACTIVATED: ${JSON.stringify(notification)}`]);
                },
                (notification) => {
                    console.log('[Test] Account activated:', notification);
                    setMessages(prev => [...prev, `ACTIVATED: ${JSON.stringify(notification)}`]);
                }
            );
            setIsConnected(true);
            setMessages(prev => [...prev, `Connected to WebSocket for user: ${userId}`]);
        } catch (error) {
            console.error('[Test] Connection failed:', error);
            setMessages(prev => [...prev, `Connection failed: ${error.message}`]);
        }
    };

    const handleDisconnect = () => {
        accountStatusWebSocketService.disconnect();
        setIsConnected(false);
        setMessages(prev => [...prev, 'Disconnected from WebSocket']);
    };

    const handleTestDeactivation = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/test-websocket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    type: 'DEACTIVATION'
                })
            });

            if (response.ok) {
                setMessages(prev => [...prev, 'Test deactivation notification sent']);
            } else {
                setMessages(prev => [...prev, 'Failed to send test notification']);
            }
        } catch (error) {
            console.error('[Test] Error sending test notification:', error);
            setMessages(prev => [...prev, `Error: ${error.message}`]);
        }
    };

    const handleTestActivation = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/test-websocket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    type: 'ACTIVATION'
                })
            });

            if (response.ok) {
                setMessages(prev => [...prev, 'Test activation notification sent']);
            } else {
                setMessages(prev => [...prev, 'Failed to send test notification']);
            }
        } catch (error) {
            console.error('[Test] Error sending test notification:', error);
            setMessages(prev => [...prev, `Error: ${error.message}`]);
        }
    };

    const clearMessages = () => {
        setMessages([]);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>WebSocket Account Status Test</h2>
            
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Enter User ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    style={{ marginRight: '10px', padding: '5px' }}
                />
                
                {!isConnected ? (
                    <button onClick={handleConnect} style={{ padding: '5px 10px' }}>
                        Connect
                    </button>
                ) : (
                    <button onClick={handleDisconnect} style={{ padding: '5px 10px' }}>
                        Disconnect
                    </button>
                )}
            </div>

            {isConnected && (
                <div style={{ marginBottom: '20px' }}>
                    <button 
                        onClick={handleTestDeactivation}
                        style={{ 
                            marginRight: '10px', 
                            padding: '5px 10px',
                            backgroundColor: '#ff4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px'
                        }}
                    >
                        Test Deactivation
                    </button>
                    
                    <button 
                        onClick={handleTestActivation}
                        style={{ 
                            padding: '5px 10px',
                            backgroundColor: '#44ff44',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px'
                        }}
                    >
                        Test Activation
                    </button>
                </div>
            )}

            <div style={{ marginBottom: '10px' }}>
                <button onClick={clearMessages} style={{ padding: '5px 10px' }}>
                    Clear Messages
                </button>
            </div>

            <div style={{ 
                border: '1px solid #ccc', 
                padding: '10px', 
                height: '400px', 
                overflowY: 'auto',
                backgroundColor: '#f9f9f9'
            }}>
                <h4>Messages:</h4>
                {messages.length === 0 ? (
                    <p>No messages yet...</p>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} style={{ 
                            marginBottom: '5px', 
                            padding: '5px',
                            backgroundColor: 'white',
                            border: '1px solid #eee',
                            borderRadius: '3px'
                        }}>
                            {msg}
                        </div>
                    ))
                )}
            </div>

            <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                <p><strong>Instructions:</strong></p>
                <ol>
                    <li>Enter a user ID (e.g., customer ID or email)</li>
                    <li>Click Connect to establish WebSocket connection</li>
                    <li>Use Test buttons to send test notifications</li>
                    <li>Check console for detailed logs</li>
                </ol>
            </div>
        </div>
    );
};

export default WebSocketTest; 