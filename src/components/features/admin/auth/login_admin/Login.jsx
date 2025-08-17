import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import './Login.css';
import Loading from '../../load/Loading';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [showLoadingForgot, setShowLoadingForgot] = useState(false);
  const [step, setStep] = useState(1);
  const [infoMsg, setInfoMsg] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const [userType, setUserType] = useState('admin'); // 'admin' or 'customer'

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

  const handleInitialLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        username,
        password,
      });
      
      const token = response.data.token;
      const decoded = jwtDecode(token);
      const emailFromToken = decoded.email || decoded.sub;
      setTempToken(token);
      setEmail(emailFromToken);
      localStorage.setItem('tempToken', token);
      setInfoMsg(`A verification code has been sent to your email: ${emailFromToken}`);
      setStep(2);
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      console.error('LOGIN ERROR:', err);
      console.log('Error response:', err.response);
      
      if (err.response?.status === 401) {
        const errorMessage = err.response.data;
        console.log('Error message:', errorMessage);
        
        if (typeof errorMessage === 'string') {
          if (errorMessage.includes('deactivated')) {
            setError('Account is deactivated. Please contact administrator.');
          } else if (errorMessage.includes('Invalid credentials')) {
            setError('Invalid username or password!');
          } else {
            setError(errorMessage);
          }
        } else {
          setError('Invalid username or password!');
        }
      } else if (err.response?.status === 403) {
        setError('Access denied. Please check your account or wait before trying again.');
      } else if (err.response?.status === 404) {
        setError('User not found or send-mail endpoint error.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setLoading(true);
    try {
      const mailRes = await axios.post('http://localhost:8080/api/auth/send-mail', { email }, {
        headers: { Authorization: `Bearer ${tempToken}` },
      });
      setInfoMsg(`A verification code has been sent again to your email: ${email}`);
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      console.error('RESEND MAIL ERROR:', err);
      console.log('Error response:', err.response);
      
      if (err.response?.status === 401) {
        const errorMessage = err.response.data;
        console.log('Error message:', errorMessage);
        
        if (typeof errorMessage === 'string') {
          if (errorMessage.includes('deactivated')) {
            setError('Account is deactivated. Please contact administrator.');
          } else if (errorMessage.includes('Invalid token')) {
            setError('Session expired. Please login again.');
          } else {
            setError(errorMessage || 'Failed to resend code.');
          }
        } else {
          setError('Failed to resend code.');
        }
      } else if (err.response?.status === 400) {
        setError('Invalid request. Please try again.');
      } else if (err.response?.status === 404) {
        setError('User not found. Please try logging in again.');
      } else {
        setError('Failed to resend code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCodeVerification = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/auth/verify-2fa', {
        email,
        code,
      }, {
        headers: {
          Authorization: `Bearer ${tempToken}`,
        },
      });
      
      const decoded = jwtDecode(tempToken);
      const role = decoded.authorities?.[0]?.replace('ROLE_', '');
      localStorage.setItem('token', tempToken);
      localStorage.setItem('role', role);
      setShowLoadingScreen(true);
      setTimeout(() => {
        setShowLoadingScreen(false);
        // Redirect based on role
        if (role === 'STAFF') {
          navigate('/staff');
        } else {
          navigate('/admin');
        }
      }, 3000);
    } catch (err) {
      console.error('VERIFY CODE ERROR:', err);
      console.log('Error response:', err.response);
      
      if (err.response?.status === 401) {
        const errorMessage = err.response.data;
        console.log('Error message:', errorMessage);
        
        if (typeof errorMessage === 'string') {
          if (errorMessage.includes('deactivated')) {
            setError('Account is deactivated. Please contact administrator.');
          } else {
            setError(errorMessage || 'Verification failed.');
          }
        } else {
          setError('Verification failed.');
        }
      } else if (err.response?.status === 400) {
        const errorMessage = err.response.data;
        if (typeof errorMessage === 'string') {
          if (errorMessage.includes('Incorrect code')) {
            setError('Incorrect or expired code.');
          } else if (errorMessage.includes('No code sent')) {
            setError('No verification code found. Please request a new code.');
          } else {
            setError(errorMessage);
          }
        } else {
          setError('Invalid verification code.');
        }
      } else if (err.response?.status === 404) {
        setError('User not found. Please try logging in again.');
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowLoadingForgot(true);
    setTimeout(() => {
      setShowLoadingForgot(false);
      navigate('/forgot_password');
    }, 3000);
  };

  const toggleUserType = () => {
    // Navigate to customer login
    navigate('/login/customer');
  };

  if (showLoadingScreen || showLoadingForgot) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Loading />
      </div>
    );
  }

  return (
    <div className="login-background">
      <video className="login-video" src="/videos/background-login.mp4" autoPlay loop muted />
      <div className="login-container">
        <img src="/images/Logo.png" alt="Pizza Logo" className="hero-logo-fixed" />
        <div className="login-left">
          <h1>🍕PIZZA</h1>
        </div>
        <div className="login-panel">
          <div className="login-panel-title">
            <h1>Log in</h1>
          </div>

          {step === 1 && (
            <form className="login-form" onSubmit={handleInitialLogin}>
              <div className="input-group">
                <label>Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div className="input-group password-group">
                <label>Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </div>
              <div className="options-row">
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </button>
              </div>
              {error && <p className="error-text">{error}</p>}
              <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Next'}</button>
            </form>
          )}

          {step === 2 && (
            <>
              {infoMsg && <div className="info-msg" style={{ color: '#2ecc7a', marginBottom: 10, textAlign: 'center', fontWeight: 500 }}>{infoMsg}</div>}
              <form className="login-form" onSubmit={handleCodeVerification}>
                <div className="input-group">
                  <label>Enter Verification Code</label>
                  <input type="text" value={code} onChange={(e) => setCode(e.target.value)} required />
                </div>
                {error && <p className="error-text">{error}</p>}
                <button type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify Code'}</button>
              </form>
              <div style={{ textAlign: 'center', marginTop: 10, fontSize: 15 }}>
                {!canResend ? (
                  <span>Didn't receive the code? Resend in {timer}s</span>
                ) : (
                  <button onClick={handleResendCode} className="resend-btn" style={{ background: 'none', border: 'none', color: '#4f8cff', cursor: 'pointer', fontWeight: 600, fontSize: 15 }}>Resend Code</button>
                )}
              </div>
            </>
          )}
          
          {/* User Type Toggle moved to bottom */}
          <div className="user-type-toggle-bottom">
            <div className={`toggle-container ${userType}`}>
              <div 
                className={`toggle-option ${userType === 'customer' ? 'active' : ''}`} 
                onClick={() => toggleUserType()}
              >
                Customer
              </div>
              <div 
                className={`toggle-option ${userType === 'admin' ? 'active' : ''}`} 
                onClick={() => {}}
              >
                Admin
              </div>
              <div className="slider"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
