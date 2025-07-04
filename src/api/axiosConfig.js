import axios from 'axios';

// Create an Axios instance with default configuration
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Update to match server port 8000
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - Clear token and redirect to login
          localStorage.removeItem('token');
          // Optional: Redirect to login page
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden');
          break;
        default:
          console.error('API Error:', error.response.data);
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response received:', error.request);
    } else {
      // Request setup error
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 