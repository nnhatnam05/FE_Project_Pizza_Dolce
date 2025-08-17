import React, { useState, useEffect } from 'react';
import './forgot_password_cus.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordCustomer = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [codeSent, setCodeSent] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState(0);
  const [resetting, setResetting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [resetCode, setResetCode] = useState('');

  const navigate = useNavigate();

  // Timer cho resend code
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    } else if (resendTimer === 0 && codeSent) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [resendTimer, codeSent]);

  // Timer for redirect after successful password reset
  useEffect(() => {
    let timer;
    if (resetSuccess && redirectTimer > 0) {
      timer = setTimeout(() => setRedirectTimer(redirectTimer - 1), 1000);
    } else if (resetSuccess && redirectTimer === 0) {
      navigate('/login/customer');
    }
    return () => clearTimeout(timer);
  }, [resetSuccess, redirectTimer, navigate]);

          // Send code
  const handleSendCode = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await axios.post('http://localhost:8080/api/customer/forgot-password', { email });
      if (typeof res.data === 'string' && res.data.toLowerCase().includes('verification code')) {
        setError('');
        setSuccessMsg('Verification code sent to your email.');
        setCanResend(false);
        setResendTimer(30);
        setCodeSent(true);
      } else if (res.data && res.data.message) {
        setError(res.data.message);
        setSuccessMsg('');
      }
    } catch (err) {
      console.error('SEND CODE ERROR:', err);
      console.log('Error response:', err.response);
      
      setSuccessMsg('');
      if (err.response?.data) {
        const errorMessage = err.response.data;
        console.log('Error message:', errorMessage);
        
        if (typeof errorMessage === 'string') {
          if (errorMessage.includes('deactivated')) {
            setError('Account is deactivated. Please contact administrator.');
          } else {
            setError(errorMessage);
          }
        } else {
          setError('Failed to send verification code.');
        }
      } else {
        setError('Could not send verification code. Try again later.');
      }
    } finally {
      setSending(false);
    }
  };

  // Resend code
  const handleResendCode = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    setSuccessMsg('');
    setCanResend(false);
    setResendTimer(30);
    try {
      const res = await axios.post('http://localhost:8080/api/customer/forgot-password', { email });
      if (typeof res.data === 'string' && res.data.toLowerCase().includes('verification code')) {
        setSuccessMsg('Verification code has been resent to your email.');
      } else if (res.data && res.data.message) {
        setError(res.data.message);
      }
    } catch (err) {
      console.error('RESEND CODE ERROR:', err);
      console.log('Error response:', err.response);
      
      if (err.response?.data) {
        const errorMessage = err.response.data;
        console.log('Error message:', errorMessage);
        
        if (typeof errorMessage === 'string') {
          if (errorMessage.includes('deactivated')) {
            setError('Account is deactivated. Please contact administrator.');
          } else {
            setError(errorMessage);
          }
        } else {
          setError('Failed to resend verification code.');
        }
      } else {
        setError('Could not resend code.');
      }
    } finally {
      setSending(false);
    }
  };

  // Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetting(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await axios.post('http://localhost:8080/api/customer/reset-password', {
        email,
        code: resetCode,
        newPassword: newPassword
      });
      
      if (typeof res.data === 'string' && res.data.toLowerCase().includes('successful')) {
        setSuccessMsg('Password reset successful! You can now login with your new password.');
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          navigate('/login/customer');
        }, 3000);
      } else {
        setError(res.data || 'Failed to reset password.');
      }
    } catch (err) {
      console.error('RESET PASSWORD ERROR:', err);
      console.log('Error response:', err.response);
      
      if (err.response?.data) {
        const errorMessage = err.response.data;
        console.log('Error message:', errorMessage);
        
        if (typeof errorMessage === 'string') {
          if (errorMessage.includes('deactivated')) {
            setError('Account is deactivated. Please contact administrator.');
          } else {
            setError(errorMessage);
          }
        } else {
          setError('Failed to reset password.');
        }
      } else {
        setError('Could not reset password. Try again later.');
      }
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="forgot-bg">
      <video className="forgot-video" src="/videos/background-login.mp4" autoPlay loop muted />
      <div className="forgot-container">
        <img src="/images/Logo.png" alt="Pizza Logo" className="hero-logo-fixed" />
        <div className="forgot-left">
          <h1>🍕PIZZA</h1>
        </div>
        <div className="forgot-panel">
          <div className="forgot-panel-title">
            <h1>Forgot Password</h1>
            <p className="account-prompt">
              Remember your password? <a href="/login/customer">Back to Login</a>
            </p>
          </div>

          {resetSuccess ? (
            <div className="success-message-container">
              <div className="success-icon">✓</div>
              <p className="success-title">Password Reset Successful!</p>
              <p className="success-text">Redirecting to login page in {redirectTimer} seconds...</p>
            </div>
          ) : (
            <form className="forgot-form" onSubmit={handleResetPassword}>
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <div className="input-group-horizontal">
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      setError('');
                      setSuccessMsg('');
                      setCodeSent(false);
                    }}
                    required
                    disabled={sending || codeSent}
                  />
                  <button
                    type="button"
                    className="sendcode-btn"
                    onClick={codeSent ? handleResendCode : handleSendCode}
                    disabled={
                      sending ||
                      (!canResend && codeSent) ||
                      !email ||
                      (codeSent && resendTimer > 0)
                    }
                  >
                    {sending ? 'Sending...' : !codeSent ? 'Send code' : canResend ? 'Resend' : `Resend (${resendTimer}s)`}
                  </button>
                </div>
              </div>
              
              <div className="input-group">
                <label htmlFor="verifyCode">Verification Code</label>
                <input
                  type="text"
                  id="verifyCode"
                  placeholder="Enter verification code"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  required
                  maxLength={6}
                  disabled={!codeSent || sending}
                />
              </div>

              <div className="input-group password-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  disabled={!codeSent || sending}
                />
                <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </div>

              <div className="input-group password-group">
                <label htmlFor="confirmPw">Confirm Password</label>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPw"
                  placeholder="Confirm new password"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  required
                  disabled={!codeSent || sending}
                />
                <span className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? '🙈' : '👁️'}
                </span>
              </div>

              {error && <p className="error-text">{error}</p>}
              {successMsg && <p className="success-text">{successMsg}</p>}
              
              <button
                type="submit"
                className="reset-btn"
                disabled={sending || !codeSent}
              >
                {sending ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordCustomer;
