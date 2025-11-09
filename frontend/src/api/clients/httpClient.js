/**
 * HTTP Client with Axios
 * Base HTTP client with interceptors
 */

import axios from 'axios';
import API_CONFIG from '../../config/api.config';
import { LOCAL_STORAGE_KEYS } from '../../config/constants';

// Create axios instance
const httpClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS
});

/**
 * Request interceptor - Add auth token
 */
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors
 */
httpClient.interceptors.response.use(
  (response) => {
    return response.data; // Return only data
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }

    // Create error object
    const errorResponse = {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    };

    return Promise.reject(errorResponse);
  }
);

export default httpClient;
