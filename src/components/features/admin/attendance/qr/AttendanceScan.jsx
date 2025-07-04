import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import {
  MdQrCodeScanner,
  MdPerson,
  MdOutlineRefresh,
  MdClose,
  MdCheckCircle,
  MdError
} from 'react-icons/md';
import '../Attendance.css';

const AttendanceScan = () => {
  const [scanning, setScanning] = useState(false);
  const [scannerStarted, setScannerStarted] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [staffCode, setStaffCode] = useState('');
  const [result, setResult] = useState(null);
  const html5QrCodeRef = useRef(null);
  const cameraId = useRef(null);
  const scannerContainerId = "qr-reader";
  // Add references for debounce control
  const lastScannedCode = useRef(null);
  const lastScanTimestamp = useRef(0);
  const processingCode = useRef(false);
  const MIN_SCAN_INTERVAL = 3000; // 3 seconds between scans

  const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      'Content-Type': 'application/json',
    },
  });

  useEffect(() => {
    if (scanning) {
      // Reset scanning state variables
      lastScannedCode.current = null;
      lastScanTimestamp.current = 0;
      processingCode.current = false;
      
      html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);

      Html5Qrcode.getCameras()
        .then(devices => {
          if (devices?.length) {
            cameraId.current = devices[0].id;
            // Reduce frame rate to minimize CPU usage and unnecessary scans
            const config = { 
              fps: 5, // Slower frame rate
              qrbox: { width: 250, height: 250 },
              experimentalFeatures: { useBarCodeDetectorIfSupported: true }
            };

            html5QrCodeRef.current.start(
              { deviceId: { exact: cameraId.current } },
              config,
              handleScan,
              handleError
            ).then(() => {
              setScannerStarted(true);
              setMessage({ text: "Camera active. Position QR code in view.", type: "success" });
            }).catch(err => {
              setMessage({ text: `Camera init failed: ${err.message}`, type: 'error' });
              setScanning(false);
            });
          } else {
            setMessage({ text: "No camera found", type: 'error' });
            setScanning(false);
          }
        })
        .catch(err => {
          setMessage({ text: "Unable to access camera", type: 'error' });
          setScanning(false);
        });
    }

    return () => {
      if (scannerStarted && html5QrCodeRef.current) {
        html5QrCodeRef.current.stop()
          .catch(err => console.warn('Stop scanner error:', err));
        setScannerStarted(false);
      }
    };
  }, [scanning]);

  const handleScan = async (decodedText) => {
    // Skip if we're already processing a code or loading
    if (loading || processingCode.current) {
      return;
    }
    
    if (decodedText) {
      const uuid = decodedText.trim();
      
      // Skip empty codes
      if (!uuid) {
        return;
      }
      
      // Implement debounce - check if this is the same code as last time
      // and make sure enough time has passed between scans
      const now = Date.now();
      if (
        uuid === lastScannedCode.current && 
        (now - lastScanTimestamp.current) < MIN_SCAN_INTERVAL
      ) {
        // Ignore repeated scans of the same code within debounce period
        return;
      }
      
      // Update scan tracking
      lastScannedCode.current = uuid;
      lastScanTimestamp.current = now;
      processingCode.current = true;
      
      // Show loading state
      setLoading(true);
      
      try {
        // Immediately pause scanning to prevent multiple API calls
        if (html5QrCodeRef.current) {
          await html5QrCodeRef.current.pause();
        }
        
        const resp = await api.post('/attendance/scan', { qrToken: uuid });
        setResult(resp.data);
        setMessage({ text: 'Attendance recorded successfully!', type: 'success' });

        // Stop scanner on success
        if (scannerStarted && html5QrCodeRef.current) {
          await html5QrCodeRef.current.stop();
          setScannerStarted(false);
        }
        setScanning(false);
      } catch (err) {
        console.error('Scan processing error:', err);
        setMessage({ text: err.response?.data?.message || 'Failed to process QR', type: 'error' });
        
        // Resume scanning after error (with a delay)
        setTimeout(() => {
          if (html5QrCodeRef.current && scannerStarted) {
            html5QrCodeRef.current.resume();
          }
          processingCode.current = false;
          setLoading(false);
        }, 2000);
        return;
      }
      
      processingCode.current = false;
      setLoading(false);
    }
  };

  const handleError = (err) => {
    if (typeof err === 'string' && err.includes('NotFoundException')) return;
    let errMsg = 'Could not detect QR code';
    if (err.includes("NotAllowedError")) errMsg = "Camera access denied.";
    else if (err.includes("NotReadableError")) errMsg = "Camera in use by another app.";
    setMessage({ text: errMsg, type: 'error' });
    if (/NotAllowedError|NotReadableError|NotSupportedError/.test(err.toString())) {
      setScanning(false);
    }
  };

  const handleManualEntry = async (e) => {
    e.preventDefault();
    if (!staffCode.trim()) {
      setMessage({ text: 'Enter a staff code', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const resp = await api.post('/attendance/scan', { staffCode });
      setResult(resp.data);
      setMessage({ text: 'Attendance recorded successfully!', type: 'success' });
    } catch (err) {
      console.error('Manual scan error:', err);
      setMessage({ text: err.response?.data?.message || 'Failed to record attendance', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const stopScanning = () => {
    // Reset all scanning-related state
    processingCode.current = false;
    lastScannedCode.current = null;
    
    if (scannerStarted && html5QrCodeRef.current) {
      html5QrCodeRef.current.stop()
        .then(() => {
          console.log("Scanner stopped successfully");
          setScanning(false);
        })
        .catch(err => {
          console.warn('Error stopping scanner:', err);
          setScanning(false);
        });
      setScannerStarted(false);
    } else {
      setScanning(false);
    }
  };

  return (
    <div className="scan-container">
      <div className="attendance-card">
        <h2>Scan Attendance QR Code</h2>
        {!scanning ? (
          <button className="action-button" onClick={() => { setScanning(true); setMessage({ text: '', type: '' }); }}>
            <MdQrCodeScanner style={{ marginRight: '5px' }} /> Start Scanning
          </button>
        ) : (
          <>
            <div className="scanner-container">
              <div id="qr-reader" className="scanner" />
              <p className="scan-instructions">Position the QR code within the scanning area</p>
            </div>
            <button className="action-button" onClick={stopScanning} style={{ marginTop: '10px' }}>
              <MdClose style={{ marginRight: '5px' }} /> Cancel Scan
            </button>
          </>
        )}

        <div style={{ marginTop: '20px' }}>
          <h3>Manual Entry</h3>
          <form className="staff-form" onSubmit={handleManualEntry}>
            <input type="text" placeholder="Enter Staff Code" value={staffCode} onChange={e => setStaffCode(e.target.value)} />
            <button type="submit" disabled={loading}>
              {loading ? <MdOutlineRefresh className="icon-spin" /> : <><MdPerson style={{ marginRight: '5px' }} /> Record Attendance</>}
            </button>
          </form>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.type === 'success' ? <MdCheckCircle style={{ marginRight: '5px' }} /> : <MdError style={{ marginRight: '5px' }} />}
            {message.text}
          </div>
        )}

        {result && (
          <div className="attendance-result">
            <h3>Attendance Result</h3>
            <p><MdPerson style={{ marginRight: '5px' }} /> Staff: {result.staffName || result.staffCode}</p>
            <p>Status: {result.status}</p>
            <p>Time: {result.timestamp && !isNaN(new Date(result.timestamp))
              ? new Date(result.timestamp).toLocaleString()
              : 'Invalid or missing timestamp'}
            </p>
            {result.message && <p>Message: {result.message}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceScan;
