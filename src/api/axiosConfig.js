import axios from 'axios';

// Create an Axios instance with default configuration
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 15000, // Increased timeout to 15 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Add withCredentials to handle CORS with credentials properly
  withCredentials: false // Set to true only if your backend is configured for credentials
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log outgoing requests for debugging if needed
    console.debug(`[API Request] ${config.method.toUpperCase()} ${config.url}`, config.data || '');
    
    return config;
  },
  error => {
    console.error('Request error before sending:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  response => {
    // Log successful responses if needed
    console.debug(`[API Response] ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`);
    return response;
  },
  error => {
    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error.message);
    }
    
    // Handle CORS errors
    if (error.message && error.message.includes('Network Error')) {
      console.error('Network Error - Possible CORS issue or server unavailable');
    }
    
    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - Clear token and redirect to login
          localStorage.removeItem('token');
          // Optional: Redirect to login page
          console.error('Authentication error: User not authenticated or token expired');
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden - User does not have required permissions');
          break;
        case 429:
          // Too Many Requests
          console.error('Rate limit exceeded - Too many requests');
          break;
        default:
          console.error(`API Error (${error.response.status}):`, error.response.data);
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response received from server:', error.request);
    } else {
      // Request setup error
      console.error('Request configuration error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 