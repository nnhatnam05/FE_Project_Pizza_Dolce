import React, { useState } from 'react';
import { MdQrCode, MdQrCodeScanner, MdAssessment } from 'react-icons/md';
import { AttendanceQR, AttendanceScan } from './qr';
import AttendanceReport from './reports/AttendanceReport';
import './Attendance.css';

const AttendanceManagement = () => {
  const [activeTab, setActiveTab] = useState('report');

  const renderContent = () => {
    switch (activeTab) {
      case 'generate':
        return <AttendanceQR />;
      case 'scan':
        return <AttendanceScan />;
      case 'report':
      default:
        return <AttendanceReport />;
    }
  };

  return (
    <div className="attendance-container">
      <h1>Attendance Management</h1>
      
      <div className="attendance-tabs">
        <div 
          className={`attendance-tab ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          <MdAssessment style={{ marginRight: '5px' }} /> Attendance Reports
        </div>
        <div 
          className={`attendance-tab ${activeTab === 'generate' ? 'active' : ''}`}
          onClick={() => setActiveTab('generate')}
        >
          <MdQrCode style={{ marginRight: '5px' }} /> Generate QR Code
        </div>
        <div 
          className={`attendance-tab ${activeTab === 'scan' ? 'active' : ''}`}
          onClick={() => setActiveTab('scan')}
        >
          <MdQrCodeScanner style={{ marginRight: '5px' }} /> Scan QR Code
        </div>
      </div>
      
      <div className="attendance-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AttendanceManagement; 