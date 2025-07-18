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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when typing
    if (error) setError('');
  };

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
      setError('Password must be at least 6 characters long');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios({
        method: 'post',
        url: 'http://localhost:8080/api/customer/register',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password
        },
        timeout: 15000
      });
      
      if (response.data && response.data.message === 'Registration successful') {
        setShowLoadingScreen(true);
        setTimeout(() => {
          setShowLoadingScreen(false);
          navigate('/login/customer');
        }, 2000);
      } else {
        setError(response.data.message || 'Registration failed');
      }
      
    } catch (err) {
      console.error('Registration error:', err);
      
      if (err.response?.status === 409) {
        setError('This email is already registered');
      } else if (err.response?.data) {
        setError(err.response.data.message || 'Registration failed');
      } else if (err.code === 'ECONNABORTED') {
        setError('Registration request timed out. Please try again.');
      } else if (err.message && err.message.includes('Network Error')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Registration failed. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignupSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    setGoogleError('');
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
        setGoogleError(`Google signup failed: ${err.response.data.message || err.response.status}`);
      } else if (err.code === 'ECONNABORTED') {
        setGoogleError('Signup request timed out. Please try again.');
      } else if (err.message && err.message.includes('Network Error')) {
        setGoogleError('Network error. Please check your connection and try again.');
      } else {
        setGoogleError('Google signup failed: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

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
          
          <div className="social-signup">
            {isGoogleInitialized && (
              <GoogleLogin
                onSuccess={handleGoogleSignupSuccess}
                onError={(error) => {
                  console.error('Google signup error:', error);
                  setGoogleError('Google signup failed! Please try again.');
                }}
                width={400}
                useOneTap={false}
                type="standard"
                theme="filled_blue"
                text="signup_with"
                shape="rectangular"
              />
            )}
            {googleError && <p className="error-text">{googleError}</p>}
          </div>
          
          <div className="divider">
            <span>or use email</span>
          </div>
          
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
            
            <button 
              type="submit" 
              className="create-account-btn" 
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
