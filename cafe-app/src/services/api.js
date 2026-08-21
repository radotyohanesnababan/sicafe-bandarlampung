import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';


console.log('BASE_URL:', BASE_URL);
// Token state (in-memory, simple auth store)
let authToken = null;

export const setToken = async (token) => {
  authToken = token;
  if (token) {
    await SecureStore.setItemAsync('auth_token', token);
  } else {
    await SecureStore.deleteItemAsync('auth_token');
  }
};

export const getToken = () => authToken;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor — attach Bearer token if present
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.baseURL + config.url);
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;