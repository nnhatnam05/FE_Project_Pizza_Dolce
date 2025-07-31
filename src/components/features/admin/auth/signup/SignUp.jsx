import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SignUp.css';
import Loading from '../../load/Loading';
import { GoogleLogin } from '@react-oauth/google';

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // 1: form đăng ký, 2: nhập code
  const [step, setStep] = useState(1);
  const [verifyCode, setVerifyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [isGoogleInitialized, setIsGoogleInitialized] = useState(false);

  // Re-send
  const [canResend, setCanResend] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);

  const navigate = useNavigate();

  // Khởi tạo Google Login
  useEffect(() => {
    // Clear any potential Google auth cookies/state
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = 'https://accounts.google.com/logout';
    document.body.appendChild(iframe);
    setTimeout(() => {
      document.body.removeChild(iframe);
      setIsGoogleInitialized(true);
    }, 1000);
  }, []);

  // Đếm ngược 30s mỗi lần re-send code
  React.useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  // Validate form đăng ký
  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Name is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!termsAccepted) {
      setError('You must accept the terms and conditions');
      return false;
    }
    return true;
  };

  // Gửi thông tin đăng ký
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:8080/api/customer/register', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });
      if (response.data && response.data.message?.includes('Verification code')) {
        setStep(2);
        setCanResend(false);
        setResendTimer(30); // Chặn re-send 30s sau khi đăng ký
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      if (err.response?.data?.message) setError(err.response.data.message);
      else setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đăng ký qua Google
  const handleGoogleSignupSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      const response = await axios({
        method: 'post',
        url: 'http://localhost:8080/api/customer/google-login',
        headers: {
          'Content-Type': 'application/json',
        },
        data: { idToken: credentialResponse.credential },
        timeout: 15000
      });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', 'CUSTOMER');
      setShowLoadingScreen(true);
      setTimeout(() => {
        setShowLoadingScreen(false);
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('GOOGLE SIGNUP ERROR:', err);
      if (err.response) {
        setError(`Google signup failed: ${err.response.data.message || err.response.status}`);
      } else if (err.code === 'ECONNABORTED') {
        setError('Signup request timed out. Please try again.');
      } else if (err.message && err.message.includes('Network Error')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Google signup failed: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Gửi lại mã xác nhận (Re-send code)
  const handleResendCode = async () => {
    setLoading(true);
    setError('');
    setCanResend(false);
    setResendTimer(30); // Đếm ngược 30s nữa

    try {
      const response = await axios.post('http://localhost:8080/api/customer/register', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });
      if (response.data && response.data.message?.includes('Verification code')) {
        setError('Verification code has been resent to your email.');
      } else {
        setError(response.data.message || 'Could not resend code.');
        setCanResend(true);
        setResendTimer(0);
      }
    } catch (err) {
      // Nếu BE trả về lỗi gửi quá 3 lần sẽ vào đây
      if (err.response?.data?.message) setError(err.response.data.message);
      else setError('Could not resend code. Please try again.');
      setCanResend(false);
      setResendTimer(0);
    } finally {
      setLoading(false);
    }
  };

  // Xác thực mã
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (verifyCode.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:8080/api/customer/verify-code', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        code: verifyCode
      });
      if (response.data && response.data.message === 'Registration successful') {
        setShowLoadingScreen(true);
        setTimeout(() => {
          setShowLoadingScreen(false);
          navigate('/login/customer');
        }, 2000);
      } else {
        setError(response.data.message || 'Verification failed');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đổi field form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  // Giao diện Loading
  if (showLoadingScreen) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Loading />
      </div>
    );
  }

  return (
    <div className="signup-background">
      <video className="signup-video" src="/videos/background-login.mp4" autoPlay loop muted />
      <div className="signup-container">
        <img src="/images/Logo.png" alt="Pizza Logo" className="hero-logo-fixed" />
        <div className="signup-left">
          <h1>🍕PIZZA</h1>
        </div>
        <div className="signup-panel">
          <div className="signup-panel-title">
            <h1>Sign up</h1>
            <p className="account-prompt">
              Already have an account? <Link to="/login/customer">Log in</Link>
            </p>
          </div>

          {/* Social Sign Up buttons */}
          {step === 1 && (
            <div className="social-signup">
              {isGoogleInitialized && (
                <GoogleLogin
                  onSuccess={handleGoogleSignupSuccess}
                  onError={(error) => {
                    console.error('Google signup error:', error);
                    setError('Google signup failed! Please try again.');
                  }}
                  width="100%"
                  useOneTap={false}
                  type="standard"
                  theme="filled_blue"
                  text="signup_with"
                  shape="rectangular"
                />
              )}
            </div>
          )}

          {step === 1 && (
            <div className="divider">
              <span>or sign up with email</span>
            </div>
          )}

          {/* STEP 1: ĐĂNG KÝ - STEP 2: NHẬP CODE */}
          {step === 1 ? (
            <form className="signup-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="input-group password-group">
                <label htmlFor="password">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                />
                <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </div>
              <div className="input-group password-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                />
                <span className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? '🙈' : '👁️'}
                </span>
              </div>
              <div className="terms-container">
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={() => setTermsAccepted(!termsAccepted)}
                  />
                  <label htmlFor="terms">
                    This site is protected by reCAPTCHA and the Google{' '}
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>{' '}
                    and{' '}
                    <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>{' '}
                    apply. By clicking the Create Account button, you are agreeing to the{' '}
                    <a href="/terms" target="_blank">terms and conditions</a>.
                  </label>
                </div>
              </div>
              {error && <p className="error-text">{error}</p>}
              <button type="submit" className="create-account-btn" disabled={loading}>
                {loading ? 'Sending Code...' : 'Create Account'}
              </button>
            </form>
          ) : (
            <form className="verify-form" onSubmit={handleVerifyCode}>
              <div className="input-group">
                <label htmlFor="verifyCode">Verification Code</label>
                <input
                  type="text"
                  id="verifyCode"
                  name="verifyCode"
                  value={verifyCode}
                  onChange={e => setVerifyCode(e.target.value)}
                  placeholder="Enter the code sent to your email"
                  required
                  maxLength={6}
                />
              </div>
              {/* Re-send code button */}
              <div style={{ margin: '10px 0' }}>
                <button
                  type="button"
                  className="resend-btn"
                  disabled={!canResend || loading}
                  onClick={handleResendCode}
                  style={{
                    background: canResend ? '#1e88e5' : '#ccc',
                    color: canResend ? '#fff' : '#666',
                    cursor: canResend ? 'pointer' : 'not-allowed',
                    padding: '6px 18px',
                    borderRadius: '5px',
                    border: 'none'
                  }}
                >
                  {canResend ? 'Resend code' : `Resend in ${resendTimer}s`}
                </button>
              </div>
              {error && <p className="error-text">{error}</p>}
              <button
                type="submit"
                className="create-account-btn"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify & Complete Registration'}
              </button>
              <button
                type="button"
                className="back-btn"
                onClick={() => {
                  setStep(1);
                  setVerifyCode('');
                  setError('');
                  setCanResend(true);
                  setResendTimer(0);
                }}
                style={{ marginTop: 10 }}
              >
                ← Back to Sign Up
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUp;
