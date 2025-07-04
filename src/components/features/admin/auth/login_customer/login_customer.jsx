import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './login_customer.css';
import Loading from '../../load/Loading';

const LoginCustomer = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [showLoadingForgot, setShowLoadingForgot] = useState(false);
  const [userType, setUserType] = useState('customer'); // 'admin' or 'customer'

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Customer login logic - API calls would go here
      // For now, just simulate a successful login
      
      setTimeout(() => {
        // Simulate successful login
        localStorage.setItem('token', 'dummy-customer-token');
        localStorage.setItem('role', 'CUSTOMER');
        setShowLoadingScreen(true);
        setTimeout(() => {
          setShowLoadingScreen(false);
          navigate('/'); // Navigate to customer homepage
        }, 2000);
      }, 1000);
    } catch (err) {
      setError('Incorrect email or password!');
      console.error('LOGIN ERROR:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowLoadingForgot(true);
    setTimeout(() => {
      setShowLoadingForgot(false);
      navigate('/forgot_password');
    }, 1500);
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
                <button type="button" className="social-btn google-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                  </svg>
                  Google
                </button>
                <button type="button" className="social-btn microsoft-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 21 21">
                    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                  </svg>
                  Microsoft
                </button>
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
