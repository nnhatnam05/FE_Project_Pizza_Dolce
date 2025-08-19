import React from 'react';
import ChatWidget from '../../../customer/ChatWidget';
import './ChatPage.css';

const ChatPage = () => {
  return (
    <div className="chat-page chat-page--single">
      <div className="chat-page-only">
        <ChatWidget inline title="Dolce Assistant" />
      </div>
    </div>
  );
};

export default ChatPage; 