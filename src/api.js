// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API Request Interceptor: Retrieved token:', token ? `${token.substring(0, 20)}...` : 'null');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Request Interceptor: Added Authorization header');
    }
    console.log('API Request: ' + config.method?.toUpperCase() + ' ' + config.url);
    return config;
  },
  (error) => {
    console.log('API Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.method?.toUpperCase(), response.config.url);
    return response;
  },
  (error) => {
    console.log('API Response Error:', error.response?.status, error.config?.method?.toUpperCase(), error.config?.url);
    console.log('API Response Error Details:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('API: 401 error detected');
      
      // Check if it's a token-related error
      const errorMessage = error.response?.data?.message || '';
      if (errorMessage.includes('Token is not valid') || errorMessage.includes('No token')) {
        console.log('API: Invalid token detected, clearing token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Don't reload page, let the auth context handle this
        console.log('API: Token cleared, authentication context will handle the state update');
      } else {
        console.log('API: 401 error but may not be token-related:', errorMessage);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
