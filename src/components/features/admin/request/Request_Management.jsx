import React, { useState } from 'react';
import { MdOutlinePending, MdDoneAll } from 'react-icons/md';
import RequestPendingConfirmation from './Request_Pending_Confirmation';
import RequestList from './Request_List';
import './Request.css';

const RequestManagement = () => {
  const [activeTab, setActiveTab] = useState('pending');

  const renderContent = () => {
    switch (activeTab) {
      case 'pending':
        return <RequestPendingConfirmation />;
      case 'confirmed':
        return <RequestList />;
      default:
        return <RequestPendingConfirmation />;
    }
  };

  return (
    <div className="admin-container">
      <h1>Staff Request Management</h1>
      
      <div className="admin-tabs">
        <div 
          className={`admin-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <MdOutlinePending style={{ marginRight: '5px' }} /> Pending Requests
        </div>
        <div 
          className={`admin-tab ${activeTab === 'confirmed' ? 'active' : ''}`}
          onClick={() => setActiveTab('confirmed')}
        >
          <MdDoneAll style={{ marginRight: '5px' }} /> Confirmed Requests
        </div>
      </div>
      
      <div className="admin-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default RequestManagement;
