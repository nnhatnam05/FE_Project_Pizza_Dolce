import React, { useState } from 'react';
import { MdQrCodeScanner, MdAssessment } from 'react-icons/md';
import FormRequest  from './Form_Request';
import HistoryRequest from './History_Request';
import './Request.css';
import HistoryIcon from '@mui/icons-material/History';
import FeedIcon from '@mui/icons-material/Feed';

const RequestManagement = () => {
  const [activeTab, setActiveTab] = useState('form');

  const renderContent = () => {
    switch (activeTab) {
      case 'form':
        return <FormRequest />;
      case 'history':
      default:
        return <HistoryRequest />;
    }
  };

  return (
    <div className="attendance-container">
      <h1>Request Management</h1>
      
      <div className="attendance-tabs">
        <div 
          className={`attendance-tab ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
        >
          <FeedIcon style={{ marginRight: '5px' }} /> Form Request
        </div>
        <div 
          className={`attendance-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <HistoryIcon style={{ marginRight: '5px' }} /> History Request
        </div>
      </div>
      
      <div className="attendance-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default RequestManagement; 