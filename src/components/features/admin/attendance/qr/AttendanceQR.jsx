import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { MdDownload, MdOutlineRefresh } from 'react-icons/md';
import api from '../../../../../api/axiosConfig';
import '../../attendance/Attendance.css';

const AttendanceQR = () => {
  const [staffCode, setStaffCode] = useState('');
  const [qrImage, setQrImage] = useState(''); // Base64 image từ backend
  const [qrUuid, setQrUuid] = useState(''); // UUID để hiển thị (nếu có)
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleGenerateQR = async () => {
    if (!staffCode.trim()) {
      setMessage({ text: 'Please enter a staff code', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ text: '', type: '' });

      // Backend trả về hình ảnh QR code dưới dạng Base64
      const response = await api.get(`/attendance/generateQR/${staffCode}`);
      console.log("QR image received:", response.data);
      
      // Lưu hình ảnh Base64 từ backend
      setQrImage(response.data);
      
      // Nếu backend cũng trả về UUID riêng (trong trường hợp response là object)
      if (typeof response.data === 'object' && response.data.uuid) {
        setQrUuid(response.data.uuid);
      } else {
        // Nếu không có UUID riêng, để trống
        setQrUuid('');
      }
      
      setMessage({ text: 'QR code generated successfully', type: 'success' });
    } catch (error) {
      console.error('Error generating QR code:', error);
      setMessage({ 
        text: error.response?.data || 'Failed to generate QR code', 
        type: 'error' 
      });
      setQrImage('');
      setQrUuid('');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrImage) return;
    
    try {
      // Tạo link download trực tiếp từ hình ảnh Base64
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${qrImage}`; // Thêm prefix cho Base64
      link.download = `attendance_qr_${staffCode}.png`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      setTimeout(() => {
        link.click();
        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
        }, 100);
      }, 0);
    } catch (error) {
      console.error("Error downloading QR code:", error);
      setMessage({ 
        text: 'Failed to download QR code', 
        type: 'error' 
      });
    }
  };

  return (
    <div className="qr-container">
      <div className="attendance-card">
        <h2>Generate Attendance QR Code</h2>
        <div className="staff-form">
          <input
            type="text"
            placeholder="Enter Staff Code"
            value={staffCode}
            onChange={(e) => setStaffCode(e.target.value)}
          />
          <button 
            onClick={handleGenerateQR}
            disabled={loading}
          >
            {loading ? <MdOutlineRefresh className="icon-spin" /> : 'Generate QR'}
          </button>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {qrImage && (
          <div className="qr-result">
            <div className="qr-code">
              {/* Hiển thị hình ảnh QR code từ Base64 */}
              <img 
                src={`data:image/png;base64,${qrImage}`}
                alt="QR Code"
                style={{ width: '250px', height: '250px' }}
              />
            </div>
            <button 
              className="action-button"
              onClick={downloadQRCode}
              style={{ marginTop: '15px' }}
            >
              <MdDownload style={{ marginRight: '5px' }} /> Download QR Code
            </button>
            <div className="qr-info">
              <p>Staff Code: {staffCode}</p>
              {qrUuid && <p>QR Token: {qrUuid}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceQR; 