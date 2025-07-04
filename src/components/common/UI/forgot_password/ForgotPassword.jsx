import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendCode = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.post('http://localhost:8080/api/auth/forgot-password', { email });
      setMessage('');
      setInfoMsg(`A verification code has been sent to your email: ${email}`);
      setStep(2);
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      setError(err.response?.data || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await axios.post('http://localhost:8080/api/auth/forgot-password', { email });
      setInfoMsg(`A verification code has been sent to your email: ${email}`);
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      setError('Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.post('http://localhost:8080/api/auth/verify-code', { email, code });
      setMessage(res.data);
      setError('');
      setStep(3);
    } catch (err) {
      setError(err.response?.data || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-bg">
      <div className="forgot-password-card">
        <h2>Forgot Password</h2>
        {step === 1 && (
          <>
            <div className="fp-input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {error && <p className="fp-error-message">{error}</p>}
            <button className="fp-btn" onClick={handleSendCode} disabled={loading || !email}>
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
            <button className="fp-link-btn" onClick={() => navigate('/login/admin')}>Back to Login</button>
          </>
        )}
        {step === 2 && (
          <>
            {infoMsg && <div className="fp-info-msg">{infoMsg}</div>}
            <div className="fp-input-group">
              <label>Verification Code</label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            {error && <p className="fp-error-message">{error}</p>}
            <button className="fp-btn" onClick={handleVerifyCode} disabled={loading || !code}>
              {loading ? 'Verifying...' : 'Verify'}
            </button>
            <div className="fp-resend-row">
              {!canResend ? (
                <span>Didn't receive the code? Resend in {timer}s</span>
              ) : (
                <button className="fp-link-btn" onClick={handleResendCode} style={{ color: '#4f8cff', fontWeight: 600 }}>Resend Code</button>
              )}
            </div>
            <button className="fp-link-btn" onClick={() => navigate('/login/admin')}>Back to Login</button>
          </>
        )}
        {step === 3 && (
          <>
            <p className="fp-success-message">Your password has been reset to <strong>pizza123</strong>. Please login again and change it.</p>
            <button className="fp-btn" onClick={() => navigate('/login/admin')}>Back to Login</button>
          </>
        )}
        {message && step !== 3 && <p className="fp-success-message">{message}</p>}
      </div>
    </div>
  );
}
