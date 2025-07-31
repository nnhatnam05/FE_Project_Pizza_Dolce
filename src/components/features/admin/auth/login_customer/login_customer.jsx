import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './login_customer.css';
import Loading from '../../load/Loading';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const LoginCustomer = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [showLoadingForgot, setShowLoadingForgot] = useState(false);
  const [userType, setUserType] = useState('customer'); // 'admin' or 'customer'
  const [isGoogleInitialized, setIsGoogleInitialized] = useState(false);

  const navigate = useNavigate();

  // Clear previous Google login state on component mount
  useEffect(() => {
    // Clear any potential Google auth cookies/state that might be causing issues
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = 'https://accounts.google.com/logout';
    document.body.appendChild(iframe);
    setTimeout(() => {
      document.body.removeChild(iframe);
      setIsGoogleInitialized(true);
    }, 1000);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios({
        method: 'post',
        url: 'http://localhost:8080/api/customer/login',
        headers: {
          'Content-Type': 'application/json',
        },
        data: { email, password },
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
      console.error('LOGIN ERROR:', err);
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 401) {
          setError('Email or password is incorrect!');
        } else {
          setError(`Login failed: ${err.response.data.message || 'Unknown error'}`);
        }
      } else if (err.code === 'ECONNABORTED') {
        setError('Login request timed out. Please try again.');
      } else if (err.message && err.message.includes('Network Error')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Login failed! Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowLoadingForgot(true);
    setTimeout(() => {
      setShowLoadingForgot(false);
      navigate('/forgot_password_customer');
    }, 1500);
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
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
      console.error('GOOGLE LOGIN ERROR:', err);
      if (err.response) {
        setError(`Google login failed: ${err.response.data.message || err.response.status}`);
      } else if (err.code === 'ECONNABORTED') {
        setError('Login request timed out. Please try again.');
      } else if (err.message && err.message.includes('Network Error')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Google login failed: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleUserType = () => {
    // Reset form fields and errors when switching
    setEmail('');
    setPassword('');
    setError('');
    
    // Navigate to admin login
    navigate('/login/admin');
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

          <form className="login-form" onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
              <div className="remember-me">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember this device</label>
              </div>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}
                onClick={handleForgotPassword}
              >
                Forgot Password?
              </button>
            </div>
            {error && <p className="error-text">{error}</p>}
            <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
            
            <div className="social-login">
              <p>or sign in with</p>
              <div className="social-buttons">
                {isGoogleInitialized && (
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={(error) => {
                      console.error('Google login error:', error);
                      setError('Google login failed! Please try again.');
                    }}
                    width={400}
                    useOneTap={false}
                    type="standard"
                    theme="filled_blue"
                    text="signin_with"
                    shape="rectangular"
                  />
                )}
              </div>
            </div>
            
            <div className="signup-prompt">
              <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
            </div>
          </form>
          
          {/* User Type Toggle moved to bottom */}
          <div className="user-type-toggle-bottom">
            <div className={`toggle-container ${userType}`}>
              <div 
                className={`toggle-option ${userType === 'customer' ? 'active' : ''}`} 
                onClick={() => {}}
              >
                Customer
              </div>
              <div 
                className={`toggle-option ${userType === 'admin' ? 'active' : ''}`} 
                onClick={() => toggleUserType()}
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

export default LoginCustomer;
