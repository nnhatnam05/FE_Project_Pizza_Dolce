import React, { useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import './QRGenerator.css';

const QRGenerator = ({ tableId, tableNumber, qrCodeUrl, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const printRef = useRef();

  const handlePrint = () => {
    const printContent = printRef.current;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload to restore React functionality
  };

  const handleDownload = () => {
    const canvas = document.querySelector('#qr-code-canvas canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `table-${tableNumber}-qr-code.png`;
      link.href = url;
      link.click();
    }
  };

  const regenerateQR = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/tables/${tableId}/regenerate-qr`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        alert('QR Code regenerated successfully!');
        window.location.reload(); // Refresh to get new QR code
      } else {
        alert('Failed to regenerate QR code');
      }
    } catch (error) {
      console.error('Error regenerating QR code:', error);
      alert('Error regenerating QR code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="qr-modal-overlay">
      <div className="qr-modal">
        <div className="qr-modal-header">
          <h3>QR Code - Table {tableNumber}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="qr-modal-content" ref={printRef}>
          <div className="qr-print-content">
            <div className="restaurant-info">
              <h2>Restaurant Name</h2>
              <p>Table {tableNumber}</p>
            </div>
            
            <div className="qr-code-container" id="qr-code-canvas">
              <QRCode 
                value={qrCodeUrl} 
                size={200}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />
            </div>
            
            <div className="qr-instructions">
              <p>Scan this QR code to view menu and place order</p>
              <p className="qr-url">{qrCodeUrl}</p>
            </div>
          </div>
        </div>
        
        <div className="qr-modal-actions">
          <button 
            className="btn btn-primary" 
            onClick={handlePrint}
          >
            🖨️ Print QR Code
          </button>
          
          <button 
            className="btn btn-secondary" 
            onClick={handleDownload}
          >
            💾 Download PNG
          </button>
          
          <button 
            className="btn btn-warning" 
            onClick={regenerateQR}
            disabled={isLoading}
          >
            {isLoading ? '⏳ Regenerating...' : '🔄 Regenerate QR'}
          </button>
          
          <button 
            className="btn btn-outline" 
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator; 