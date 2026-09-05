import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// 1. Request Interceptor: Attach JWT Bearer Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Response Interceptor: Extract Data & Handle 401 Expirations
apiClient.interceptors.response.use(
  (response) => {
    return response.data; // Unwraps backend ApiResponse payload
  },
  (error: AxiosError<ApiResponse<any>>) => {
    // If token is invalid or expired
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:logout'));
    }

    // Extract detailed error information from backend response
    const backendError = error.response?.data?.error;
    const message = backendError?.message || error.message || 'An unexpected error occurred';
    const code = backendError?.code || 'NETWORK_ERROR';
    const fields = backendError?.fields;

    return Promise.reject({
      message,
      code,
      fields,
      status: error.response?.status || 500,
    });
  }
);

export default apiClient;
