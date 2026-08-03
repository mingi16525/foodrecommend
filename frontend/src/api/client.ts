import axios from 'axios';
import { Capacitor } from '@capacitor/core';

// Create an axios instance
const getBaseURL = () => {
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    // 10.0.2.2 is the special alias for the host loopback interface in Android Emulator
    return 'http://10.0.2.2:8000/api';
  }
  return 'http://localhost:8000/api'; // Nginx Gateway URL (Web/iOS)
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor for attaching auth token if needed
apiClient.interceptors.request.use(
  (config) => {
    // You can attach tokens here
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor for handling global errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
