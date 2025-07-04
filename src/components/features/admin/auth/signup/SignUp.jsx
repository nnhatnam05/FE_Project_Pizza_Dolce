import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SignUp.css';
import Loading from '../../load/Loading';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
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

  const navigate = useNavigate();

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
    if (!formData.name.trim()) {
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
      const response = await axios.post('', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      // Show loading screen and redirect to login
      setShowLoadingScreen(true);
      setTimeout(() => {
        setShowLoadingScreen(false);
        navigate('/login/customer');
      }, 2000);
      
    } catch (err) {
      console.error('Registration error:', err);
      
      if (err.response?.status === 409) {
        setError('This email is already registered');
      } else if (err.response?.data) {
        setError(err.response.data.message || 'Registration failed');
      } else {
        setError('Registration failed. Please try again later.');
      }
    } finally {
      setLoading(false);
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
            <button type="button" className="social-btn google-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
              Sign in with Google
            </button>
            <button type="button" className="social-btn microsoft-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 21 21">
                <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
              </svg>
              Sign in with Microsoft
            </button>
          </div>
          
          <div className="divider">
            <span>or use email</span>
          </div>
          
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="name">Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Enter your name"
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
